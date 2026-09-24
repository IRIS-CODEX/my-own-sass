# ARCHITECTURE.md — System Architecture & Data Flow Specification

## 🏛️ 1. High-Level Architecture Overview

AgentLens operates as a single-process full-stack Node.js application combining an Express 4 REST API server with a React 19 Single Page Application (SPA).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BROWSER CLIENT (React 19)                         │
│                                                                             │
│  ┌──────────────────────┐   ┌─────────────────────┐   ┌──────────────────┐  │
│  │   Zustand Stores     │   │  View Shell (App)   │   │  Firebase Client │  │
│  │ (useAppStore, etc.)  │◄──┼─► (AgentChat, etc.) ├───┼─► Auth & Firestore│  │
│  └──────────────────────┘   └──────────┬──────────┘   └──────────────────┘  │
└────────────────────────────────────────┼────────────────────────────────────┘
                                         │ REST API Requests (`/api/*`)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER (`backend/server.ts`)                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          Express Middleware                           │  │
│  │       (JSON Body Parser, Error Handler, Vite Dev Middleware Bridge)    │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │                     API Router (`backend/routes/`)                    │  │
│  │   ├── agent.routes.ts   ├── gemini.routes.ts   ├── gateway.routes.ts │  │
│  │   ├── users.routes.ts   ├── gmail.routes.ts    ├── health.routes.ts  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │                   Domain Services (`backend/services/`)               │  │
│  │   ├── research.service.ts   ├── maps.service.ts                       │  │
│  │   ├── video.service.ts      ├── toolDispatcher.service.ts             │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │                      External API & Data Layer                        │  │
│  │   ├── @google/genai SDK (Gemini 3.8 Flash / 3.1 Lite / Veo 3)         │  │
│  │   ├── PostgreSQL via Drizzle ORM (`backend/db/schema.ts`)            │  │
│  │   └── Firestore via Firebase Admin SDK (`backend/lib/firebaseAdmin.ts`) │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔀 2. Detailed Data Flow Scenarios

### Scenario A: Natural Language Agent Synthesis (`POST /api/agents/synthesize`)
1. **Client Action**: User enters prompt in Agent Studio (e.g. *"Create a creative fashion video ad director agent"*).
2. **HTTP Dispatch**: `POST /api/agents/synthesize` payload sent to backend with `prompt`, `enabledCapabilities`, `modelPreference`.
3. **Gemini Reasoning**: Backend invokes `getAIClient()` in `backend/routes/gemini.routes.ts`. Structured JSON prompt instructs `gemini-3.8-flash` to generate agent name, system prompt, archetype, budget, and tools.
4. **Fallback Handling**: If primary model is rate-limited, system automatically retries with `gemini-3.1-flash-lite`.
5. **Response**: Returns structured JSON agent definition; client updates `useAgentsStore` and persists agent document to Firestore `agents` collection.

### Scenario B: Multi-Tool Autonomous Agent Chat (`POST /api/agent/chat`)
1. **Client Action**: User submits message in Agent Chat (e.g. *"Generate a 15s commercial for my boutique shop"*).
2. **Policy Inspection**: Backend checks tool risk level (`GREEN`, `YELLOW`, `RED`) in `policies` collection.
3. **Human-In-The-Loop Interception**: If requested tool is marked `RED` risk, execution is blocked and queued in Firestore `pendingActions` collection for approval in Control Tower.
4. **Tool Execution**: If risk is `GREEN` or `YELLOW`:
   - If video requested: Calls `video.service.ts` to generate shot-by-shot storyboard, camera vectors, voiceover copy, and proxy video URL.
   - If Google Maps requested: Calls `maps.service.ts` to retrieve venue address, ratings, and navigation links.
   - If Web Search requested: Calls `research.service.ts` to execute search grounding.
5. **Persistence**: Message and streaming thoughts stored in PostgreSQL `chat_messages` table and Firestore `traceEvents` collection.

### Scenario C: Same-Origin Binary Media Proxy (`GET /api/video/stream`)
1. **Problem**: Embedded preview iframes (`AIS Dev Preview`) block cross-origin MP4 video streams due to CORS sandbox restrictions.
2. **Proxy Resolution**: React `<video>` component targets `/api/video/stream?url=<encoded_url>`.
3. **Header Injection**: Express handler fetches upstream media buffer, strips origin restrictions, and responds with:
   - `Content-Type: video/mp4`
   - `Accept-Ranges: bytes`
   - `Cache-Control: public, max-age=86400`
4. **Client Playback**: Video renders seamlessly inside HTML5 `<video>` element with full scrub/play/pause controls.

---

## 🔒 3. Boundary & Security Layer

1. **Virtual Key Gateway Enforcement**:
   - `POST /api/gateway/execute` intercepts external LLM API calls.
   - Validates key prefix (`ag_live_...`), checks `isActive == true`, verifies model is in `allowedModels` list, and checks daily spend (`spendTodayUsd + estimatedCost <= dailyBudgetUsd`).
   - Rejects unauthorized requests with `403 Forbidden` or `429 Budget Exceeded`.

2. **Firestore Security Rules Boundary (`firestore.rules`)**:
   - All Firestore reads and writes validate `request.auth.uid == userId` or `isSuperAdmin()`.
   - Incoming document mutations undergo strict field type, character length, and schema validation.
