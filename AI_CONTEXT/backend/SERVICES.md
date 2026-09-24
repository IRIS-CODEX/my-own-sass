# SERVICES.md — Backend Services Layer

## 🧱 Services Architecture (`backend/services/`)

### 1. `research.service.ts`
- **Purpose**: Deep web research & Google Search grounding synthesizer.
- **Functions**: `performDeepWebResearch(query: string)` executes real-time web retrieval with source citations.

### 2. `maps.service.ts`
- **Purpose**: Google Maps venue search, address geocoding, ratings, and navigation links.
- **Functions**: `searchGoogleMapsPlaces(query: string)` retrieves verified venue details, ratings, and Google Maps direction URIs.

### 3. `video.service.ts`
- **Purpose**: Veo 3 high-definition commercial video storyboard synthesizer.
- **Functions**: `generateVideoInternal(params)` builds high-fashion shot-by-shot storyboards, scene cues, camera vectors, and returns sample stream links routed through `/api/video/stream`.

### 4. `toolDispatcher.service.ts`
- **Purpose**: Centralized multi-tool dispatcher with exponential retry backoff.
- **Functions**: `ToolDispatcherService.executeTool(toolName, params)` dispatches grounded searches, maps lookups, or execution actions with automatic retries and risk evaluation.
