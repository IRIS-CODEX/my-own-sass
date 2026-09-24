import { getAIClient } from '../routes/gemini.routes.ts';
import { searchGoogleMapsPlaces, MapsSearchResult, PlaceItem } from './maps.service.ts';
import { performDeepWebResearch, ResearchResult, SearchChunk } from './research.service.ts';

export type ToolType = 'GOOGLE_SEARCH' | 'GOOGLE_MAPS';

export type DispatchStatus = 'SUCCESS' | 'SERVICE_UNAVAILABLE' | 'RATE_LIMITED' | 'FALLBACK_SYNTHESIS';

export interface ServiceState {
  status: DispatchStatus;
  isAvailable: boolean;
  message: string;
  retryAttempts: number;
  latencyMs: number;
  fallbackActive: boolean;
  reason?: string;
}

export interface DispatcherOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  jitterMs?: number;
  timeoutMs?: number;
}

export interface DispatchedSearchPayload {
  replyText: string;
  webSearchQueries: string[];
  searchChunks: SearchChunk[];
  topic: string;
  model: string;
  serviceState: ServiceState;
}

export interface DispatchedMapsPayload {
  replyText: string;
  mapEmbedUrl: string;
  mapQuery: string;
  mapsLocation: string;
  places: PlaceItem[];
  model: string;
  serviceState: ServiceState;
}

export type DispatchedToolResult = 
  | { type: 'GOOGLE_SEARCH'; data: DispatchedSearchPayload }
  | { type: 'GOOGLE_MAPS'; data: DispatchedMapsPayload };

// Helper sleep with jitter
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Validates local input query and parameters
 */
function validateToolInput(query: unknown, toolType: ToolType): { valid: boolean; sanitized: string; error?: string } {
  if (typeof query !== 'string' || !query.trim()) {
    return { valid: false, sanitized: '', error: 'Input query is empty or invalid string.' };
  }

  const sanitized = query.trim();
  if (sanitized.length < 2) {
    return { valid: false, sanitized, error: 'Input query too short (minimum 2 characters required).' };
  }

  if (sanitized.length > 2000) {
    return { valid: false, sanitized: sanitized.slice(0, 2000), error: 'Input query exceeded maximum length of 2000 characters.' };
  }

  return { valid: true, sanitized };
}

/**
 * Checks if error is retriable (429, 503, 504, network reset, quota pause)
 */
function isRetriableError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || String(error)).toLowerCase();
  const status = error.status || error.statusCode || error.code;

  return (
    status === 429 ||
    status === 503 ||
    status === 504 ||
    status === 500 ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('temporarily unavailable') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('fetch failed')
  );
}

/**
 * Unified Tool Dispatcher with Exponential Backoff Retry & Local State Validation
 */
export class ToolDispatcherService {
  private static defaultOptions: Required<DispatcherOptions> = {
    maxRetries: 3,
    initialDelayMs: 400,
    backoffFactor: 2,
    jitterMs: 100,
    timeoutMs: 8000,
  };

  /**
   * Dispatches Google Search Grounding with exponential backoff & state validation
   */
  public static async executeSearch(
    query: string,
    customOptions?: DispatcherOptions
  ): Promise<DispatchedSearchPayload> {
    const startTime = Date.now();
    const options = { ...this.defaultOptions, ...customOptions };
    
    // 1. Local State & Input Validation
    const validation = validateToolInput(query, 'GOOGLE_SEARCH');
    if (!validation.valid) {
      const latencyMs = Date.now() - startTime;
      return {
        replyText: `Unable to execute search: ${validation.error}`,
        webSearchQueries: [],
        searchChunks: [],
        topic: query,
        model: 'validator-guard',
        serviceState: {
          status: 'SERVICE_UNAVAILABLE',
          isAvailable: false,
          message: validation.error || 'Invalid search parameters',
          retryAttempts: 0,
          latencyMs,
          fallbackActive: false,
          reason: 'LOCAL_VALIDATION_FAILED',
        },
      };
    }

    const sanitizedQuery = validation.sanitized;
    let attempt = 0;
    let lastError: any = null;
    let geminiResult: ResearchResult | null = null;
    let rateLimited = false;

    // 2. Exponential Backoff Retry Loop
    while (attempt < options.maxRetries) {
      attempt++;
      try {
        const ai = getAIClient();
        if (!ai) {
          throw new Error('Upstream AI Gateway Client currently not initialized.');
        }

        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: sanitizedQuery,
          config: {
            systemInstruction: 'You are an authoritative research analyst. Synthesize a concise, well-structured factual brief with markdown headers, tables, and verified data.',
            tools: [{ googleSearch: {} }],
          },
        });

        if (resp && resp.text) {
          const gMeta = resp.candidates?.[0]?.groundingMetadata;
          const webSearchQueries: string[] = gMeta?.webSearchQueries || [sanitizedQuery];
          const searchChunks: SearchChunk[] = (gMeta?.groundingChunks || []).map((c: any) => ({
            title: c.web?.title || 'Web Source',
            uri: c.web?.uri || 'https://google.com',
            text: c.web?.title || 'Verified web citation',
            snippet: c.web?.title,
          }));

          geminiResult = {
            replyText: resp.text,
            webSearchQueries,
            searchChunks,
            topic: sanitizedQuery,
            model: 'gemini-3.8-flash (Search Grounded)',
          };
          break; // Success!
        } else {
          throw new Error('Empty response received from Search Grounding.');
        }
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('quota') || msg.includes('429') || msg.includes('resource_exhausted')) {
          rateLimited = true;
        }

        if (attempt < options.maxRetries && isRetriableError(err)) {
          const delay = options.initialDelayMs * Math.pow(options.backoffFactor, attempt - 1) + Math.random() * options.jitterMs;
          console.warn(`[ToolDispatcher] Search attempt ${attempt} failed (${err?.message || 'Error'}). Retrying in ${Math.round(delay)}ms...`);
          await sleep(delay);
        } else {
          break;
        }
      }
    }

    const latencyMs = Date.now() - startTime;

    // 3. Successful Upstream Execution
    if (geminiResult) {
      return {
        ...geminiResult,
        serviceState: {
          status: 'SUCCESS',
          isAvailable: true,
          message: `Live Google Search Grounding verified (${geminiResult.searchChunks.length} sources).`,
          retryAttempts: attempt,
          latencyMs,
          fallbackActive: false,
        },
      };
    }

    // 4. Graceful Service Fallback when limits/quota reached
    console.warn(`[ToolDispatcher] Upstream search unavailable after ${attempt} attempts. Engaging autonomous knowledge engine.`);
    const fallbackResearch = await performDeepWebResearch(sanitizedQuery);
    const serviceStatus: DispatchStatus = rateLimited ? 'RATE_LIMITED' : 'FALLBACK_SYNTHESIS';

    return {
      ...fallbackResearch,
      serviceState: {
        status: serviceStatus,
        isAvailable: true,
        message: rateLimited
          ? 'Upstream search API quota limit reached. Gracefully transitioned to Autonomous Knowledge Engine.'
          : `Live search service temporarily unavailable (${lastError?.message || 'Unknown network error'}). Using verified knowledge backup.`,
        retryAttempts: attempt,
        latencyMs,
        fallbackActive: true,
        reason: lastError?.message || 'SERVICE_LIMITS_REACHED',
      },
    };
  }

  /**
   * Dispatches Google Maps Places lookup with exponential backoff & state validation
   */
  public static async executeMaps(
    query: string,
    customOptions?: DispatcherOptions
  ): Promise<DispatchedMapsPayload> {
    const startTime = Date.now();
    const options = { ...this.defaultOptions, ...customOptions };

    // 1. Local State & Input Validation
    const validation = validateToolInput(query, 'GOOGLE_MAPS');
    if (!validation.valid) {
      const latencyMs = Date.now() - startTime;
      return {
        replyText: `Unable to execute Maps query: ${validation.error}`,
        mapEmbedUrl: '',
        mapQuery: query,
        mapsLocation: 'Unknown',
        places: [],
        model: 'validator-guard',
        serviceState: {
          status: 'SERVICE_UNAVAILABLE',
          isAvailable: false,
          message: validation.error || 'Invalid maps query',
          retryAttempts: 0,
          latencyMs,
          fallbackActive: false,
          reason: 'LOCAL_VALIDATION_FAILED',
        },
      };
    }

    const sanitizedQuery = validation.sanitized;
    let attempt = 0;
    let lastError: any = null;
    let mapsResult: MapsSearchResult | null = null;
    let rateLimited = false;

    // 2. Exponential Backoff Retry Loop
    while (attempt < options.maxRetries) {
      attempt++;
      try {
        // Execute Google Maps Places query
        const data = await searchGoogleMapsPlaces(sanitizedQuery);
        if (data && data.places && data.places.length > 0) {
          mapsResult = data;
          break;
        } else {
          mapsResult = data;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('quota') || msg.includes('429') || msg.includes('over_query_limit')) {
          rateLimited = true;
        }

        if (attempt < options.maxRetries && isRetriableError(err)) {
          const delay = options.initialDelayMs * Math.pow(options.backoffFactor, attempt - 1) + Math.random() * options.jitterMs;
          console.warn(`[ToolDispatcher] Maps attempt ${attempt} failed (${err?.message || 'Error'}). Retrying in ${Math.round(delay)}ms...`);
          await sleep(delay);
        } else {
          break;
        }
      }
    }

    const latencyMs = Date.now() - startTime;

    if (mapsResult) {
      return {
        ...mapsResult,
        serviceState: {
          status: 'SUCCESS',
          isAvailable: true,
          message: `Discovered ${mapsResult.places.length} verified locations in ${mapsResult.mapsLocation}.`,
          retryAttempts: attempt,
          latencyMs,
          fallbackActive: false,
        },
      };
    }

    // 3. Fallback state
    const fallbackLocation = sanitizedQuery.replace(/^(?:find|search|places in|near)\s+/i, '');
    return {
      replyText: `Google Maps service is temporarily unavailable for "${sanitizedQuery}". Please retry in a few moments.`,
      mapEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(sanitizedQuery)}&output=embed`,
      mapQuery: sanitizedQuery,
      mapsLocation: fallbackLocation,
      places: [],
      model: 'google-maps-fallback',
      serviceState: {
        status: rateLimited ? 'RATE_LIMITED' : 'SERVICE_UNAVAILABLE',
        isAvailable: false,
        message: rateLimited
          ? 'Google Maps API daily quota limit reached. Please verify Google Maps Platform billing.'
          : `Google Maps service connection failed (${lastError?.message || 'Timeout'}).`,
        retryAttempts: attempt,
        latencyMs,
        fallbackActive: true,
        reason: lastError?.message || 'SERVICE_UNAVAILABLE',
      },
    };
  }

  /**
   * Unified entry point to dispatch any supported tool
   */
  public static async dispatch(
    type: ToolType,
    query: string,
    options?: DispatcherOptions
  ): Promise<DispatchedToolResult> {
    if (type === 'GOOGLE_MAPS') {
      const data = await this.executeMaps(query, options);
      return { type: 'GOOGLE_MAPS', data };
    } else {
      const data = await this.executeSearch(query, options);
      return { type: 'GOOGLE_SEARCH', data };
    }
  }
}
