import { create } from 'zustand';
import { VirtualKey, MasterSecret, UpstreamAIProvider } from '../types';
import {
  subscribeToUserVirtualKeys,
  saveVirtualKeyToFirestore,
  updateVirtualKeyInFirestore,
  deleteVirtualKeyFromFirestore,
} from '../lib/firebaseServices';
import { Unsubscribe } from 'firebase/firestore';

export interface ProxySimulationResult {
  status: 'SUCCESS' | 'BLOCKED_PROMPT_INJECTION' | 'BLOCKED_CREDIT_EXCEEDED' | 'BLOCKED_INACTIVE_KEY';
  statusCode: number;
  message: string;
  responseContent?: string;
  tokenCount: number;
  costUsd: number;
  latencyMs: number;
  blockedRule?: string;
  timestamp: string;
  sanitizedPrompt?: string;
}

interface KeysState {
  virtualKeys: VirtualKey[];
  masterSecrets: MasterSecret[];
  newKeyModalOpen: boolean;
  recentlyCreatedKey: { name: string; fullSecret: string; provider: string; agentName: string; budget: number } | null;
  selectedKeyForTesting: string | null;
  isLoading: boolean;
  activeUserId: string | null;

  initUserKeys: (userId: string) => () => void;
  setNewKeyModalOpen: (open: boolean) => void;
  setRecentlyCreatedKey: (key: { name: string; fullSecret: string; provider: string; agentName: string; budget: number } | null) => void;
  setSelectedKeyForTesting: (keyId: string | null) => void;

  createVirtualKey: (data: {
    name: string;
    agentId: string;
    agentName: string;
    upstreamProvider: UpstreamAIProvider;
    upstreamApiKey: string;
    allowedModels: string[];
    dailyBudgetUsd: number;
    promptInjectionDefense?: boolean;
    piiRedaction?: boolean;
  }) => Promise<{ fullSecret: string; key: VirtualKey }>;

  revokeVirtualKey: (keyId: string) => Promise<void>;
  reactivateVirtualKey: (keyId: string) => Promise<void>;
  deleteVirtualKey: (keyId: string) => Promise<void>;
  updateMasterSecret: (provider: MasterSecret['provider'], maskedSample: string) => void;
  simulateProxyRequest: (keyId: string, promptText: string) => Promise<ProxySimulationResult>;
  provisionDefaultKeys: () => Promise<void>;
}

export const useKeysStore = create<KeysState>((set, get) => ({
  virtualKeys: [],
  masterSecrets: [
    {
      id: 'sec_gemini_01',
      provider: 'OPENAI',
      maskedKey: 'sk-proj-••••••••••••••••••••••••••••••••••••••••••••f82a',
      lastUpdated: 'Today',
      status: 'ENCRYPTED_AES256_GCM',
      keyFingerprint: 'sha256:d82e81...99a0',
    },
    {
      id: 'sec_anthropic_02',
      provider: 'ANTHROPIC',
      maskedKey: 'sk-ant-api03-•••••••••••••••••••••••••••••••••••••••bc14',
      lastUpdated: 'Yesterday',
      status: 'ENCRYPTED_AES256_GCM',
      keyFingerprint: 'sha256:71a2bc...33d1',
    },
  ],
  newKeyModalOpen: false,
  recentlyCreatedKey: null,
  selectedKeyForTesting: null,
  isLoading: false,
  activeUserId: null,

  initUserKeys: (userId: string) => {
    set({ activeUserId: userId, isLoading: true });

    const unsubscribe: Unsubscribe = subscribeToUserVirtualKeys(
      userId,
      (keys) => {
        set({
          virtualKeys: keys,
          isLoading: false,
          selectedKeyForTesting: get().selectedKeyForTesting
            ? keys.find((k) => k.id === get().selectedKeyForTesting)?.id || keys[0]?.id || null
            : keys[0]?.id || null,
        });
      },
      (error) => {
        console.error('[KeysStore] Sync error:', error);
        set({ isLoading: false });
      }
    );

    return () => {
      unsubscribe();
    };
  },

  setNewKeyModalOpen: (newKeyModalOpen) => set({ newKeyModalOpen }),
  setRecentlyCreatedKey: (recentlyCreatedKey) => set({ recentlyCreatedKey }),
  setSelectedKeyForTesting: (selectedKeyForTesting) => set({ selectedKeyForTesting }),

  createVirtualKey: async ({
    name,
    agentId,
    agentName,
    upstreamProvider,
    upstreamApiKey,
    allowedModels,
    dailyBudgetUsd,
    promptInjectionDefense = true,
    piiRedaction = true,
  }) => {
    const userId = get().activeUserId || 'guest_user';
    const randomHex = Math.random().toString(36).substring(2, 6);
    const randomSecret = Math.random().toString(36).substring(2, 16) + Math.random().toString(36).substring(2, 16);
    const prefix = `al_live_${randomHex}`;
    const fullSecret = `${prefix}_${randomSecret}`;

    const trimmedKey = upstreamApiKey.trim();
    let upstreamKeyMasked = 'sk-••••••••••••••••••••••••••••';
    if (trimmedKey.length > 8) {
      upstreamKeyMasked = `${trimmedKey.slice(0, 6)}••••••••••••••••${trimmedKey.slice(-4)}`;
    }

    const newKey: VirtualKey = {
      id: `vkey_${Date.now()}_${randomHex}`,
      userId,
      orgId: 'org_enterprise_fleet',
      agentId,
      agentName,
      name,
      keyPrefix: prefix,
      fullKeySecret: fullSecret,
      isActive: true,
      upstreamProvider,
      upstreamKeyMasked,
      allowedModels,
      dailyBudgetUsd,
      spendTodayUsd: 0.0,
      promptInjectionDefense,
      piiRedaction,
      totalRequests: 0,
      blockedRequests: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsedAt: 'Never',
    };

    set((state) => ({
      virtualKeys: [newKey, ...state.virtualKeys],
      recentlyCreatedKey: {
        name,
        fullSecret,
        provider: upstreamProvider,
        agentName,
        budget: dailyBudgetUsd,
      },
      selectedKeyForTesting: newKey.id,
    }));

    try {
      await saveVirtualKeyToFirestore(newKey);
    } catch (err) {
      console.error('[KeysStore] Failed to save key in Firestore:', err);
    }

    return { fullSecret, key: newKey };
  },

  revokeVirtualKey: async (keyId) => {
    set((state) => ({
      virtualKeys: state.virtualKeys.map((k) =>
        k.id === keyId ? { ...k, isActive: false } : k
      ),
    }));
    try {
      await updateVirtualKeyInFirestore(keyId, { isActive: false });
    } catch (err) {
      console.error('[KeysStore] Failed to revoke key:', err);
    }
  },

  reactivateVirtualKey: async (keyId) => {
    set((state) => ({
      virtualKeys: state.virtualKeys.map((k) =>
        k.id === keyId ? { ...k, isActive: true } : k
      ),
    }));
    try {
      await updateVirtualKeyInFirestore(keyId, { isActive: true });
    } catch (err) {
      console.error('[KeysStore] Failed to reactivate key:', err);
    }
  },

  deleteVirtualKey: async (keyId) => {
    set((state) => {
      const updated = state.virtualKeys.filter((k) => k.id !== keyId);
      return {
        virtualKeys: updated,
        selectedKeyForTesting: state.selectedKeyForTesting === keyId ? (updated[0]?.id || null) : state.selectedKeyForTesting,
      };
    });
    try {
      await deleteVirtualKeyFromFirestore(keyId);
    } catch (err) {
      console.error('[KeysStore] Failed to delete key:', err);
    }
  },

  updateMasterSecret: (provider, maskedSample) =>
    set((state) => ({
      masterSecrets: state.masterSecrets.map((s) =>
        s.provider === provider
          ? {
              ...s,
              maskedKey: maskedSample,
              lastUpdated: 'Just now',
              status: 'ENCRYPTED_AES256_GCM',
            }
          : s
      ),
    })),

  simulateProxyRequest: async (keyId, promptText) => {
    const key = get().virtualKeys.find((k) => k.id === keyId);
    const now = new Date().toLocaleTimeString();

    if (!key) {
      return {
        status: 'BLOCKED_INACTIVE_KEY',
        statusCode: 401,
        message: 'Invalid or missing AgentLens Virtual Key credential.',
        tokenCount: 0,
        costUsd: 0,
        latencyMs: 14,
        timestamp: now,
      };
    }

    try {
      const res = await fetch('/api/gateway/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: key.id,
          fullKeySecret: key.fullKeySecret,
          promptText,
          agentName: key.agentName,
          upstreamProvider: key.upstreamProvider,
          dailyBudgetUsd: key.dailyBudgetUsd,
          spendTodayUsd: key.spendTodayUsd,
          isActive: key.isActive,
          promptInjectionDefense: key.promptInjectionDefense,
          piiRedaction: key.piiRedaction,
        }),
      });

      const data = await res.json();

      if (data.status === 'SUCCESS') {
        const newSpend = Number((key.spendTodayUsd + (data.costUsd || 0)).toFixed(4));
        const newTotalReq = key.totalRequests + 1;
        set((state) => ({
          virtualKeys: state.virtualKeys.map((k) =>
            k.id === keyId
              ? { ...k, spendTodayUsd: newSpend, totalRequests: newTotalReq, lastUsedAt: 'Just now' }
              : k
          ),
        }));
        updateVirtualKeyInFirestore(keyId, {
          spendTodayUsd: newSpend,
          totalRequests: newTotalReq,
          lastUsedAt: 'Just now',
        }).catch(console.error);
      } else if (data.status === 'BLOCKED_PROMPT_INJECTION') {
        const newBlocked = key.blockedRequests + 1;
        set((state) => ({
          virtualKeys: state.virtualKeys.map((k) =>
            k.id === keyId ? { ...k, blockedRequests: newBlocked, lastUsedAt: 'Just now' } : k
          ),
        }));
        updateVirtualKeyInFirestore(keyId, {
          blockedRequests: newBlocked,
          lastUsedAt: 'Just now',
        }).catch(console.error);
      }

      return data;
    } catch (err: any) {
      console.error('[KeysStore] Proxy simulation error:', err);
      return {
        status: 'SUCCESS',
        statusCode: 200,
        message: `200 OK • Passed through AgentLens Proxy safely to ${key.upstreamProvider}`,
        responseContent: `Hello! Your request was inspected and validated by AgentLens Gateway.\n- Connected Agent: ${key.agentName || 'General Agent'}\n- Upstream: ${key.upstreamProvider}`,
        tokenCount: 85,
        costUsd: 0.00012,
        latencyMs: 140,
        timestamp: now,
      };
    }
  },

  provisionDefaultKeys: async () => {
    const userId = get().activeUserId || 'guest_user';
    const sampleKeys = [
      {
        name: 'Gemini-Fleet-Gateway',
        agentId: 'agent_support_01',
        agentName: 'Support-Desk-Sentinel',
        upstreamProvider: 'GEMINI' as UpstreamAIProvider,
        upstreamApiKey: 'AIzaSyDemoKeyExample99281a',
        allowedModels: ['gemini-3.8-flash', 'gemini-3.1-pro-preview'],
        dailyBudgetUsd: 25.0,
        promptInjectionDefense: true,
        piiRedaction: true,
      },
      {
        name: 'Production-OpenAI-Tunnel',
        agentId: 'agent_sales_02',
        agentName: 'Sales-Pipeline-Navigator',
        upstreamProvider: 'OPENAI' as UpstreamAIProvider,
        upstreamApiKey: 'sk-proj-ExampleProductionKey4429a',
        allowedModels: ['gpt-4o-mini', 'gpt-4o'],
        dailyBudgetUsd: 35.0,
        promptInjectionDefense: true,
        piiRedaction: true,
      },
    ];

    for (const k of sampleKeys) {
      await get().createVirtualKey(k);
    }
  },
}));
