# DECISIONS.md — Architecture Decision Records (ADRs)

This file documents critical architectural and engineering decisions in AgentLens.

---

### ADR 001: Dual-Engine Persistence Architecture (PostgreSQL + Firestore)
* **Status**: Accepted & Implemented
* **Context**: AgentLens requires both ACID-compliant transactional persistence for billing, quotas, and audit logs, alongside real-time document synchronization for live control tower streaming.
* **Decision**: Implement a dual-engine data layer:
  1. **PostgreSQL via Drizzle ORM** (`backend/db/schema.ts`): Stores relational tables (`users`, `subscriptions`, `usage_quotas`, `agents`, `chat_sessions`, `chat_messages`, `agent_memories`, `agent_executions`, `virtual_keys`).
  2. **Google Cloud Firestore** (`src/lib/firebase.ts` & `backend/lib/firebaseAdmin.ts`): Stores real-time documents (`users`, `agents`, `virtualKeys`, `policies`, `promptRules`, `traceEvents`, `pendingActions`, `portal_roles`).
* **Consequences**: Provides instant real-time UI updates via Firestore snapshot listeners while guaranteeing structured SQL query capability for enterprise audit reporting.

---

### ADR 002: Express + Vite Single-Process Bridge
* **Status**: Accepted & Implemented
* **Context**: Running separate frontend and backend dev servers creates CORS complexity, port management issues, and environment variable synchronization drift in containerized or iframe preview environments.
* **Decision**: Mount Vite dev middleware (`vite.middlewares`) directly inside Express (`backend/server.ts`) in development mode (`NODE_ENV != 'production'`). In production mode, serve static assets compiled to `dist/`.
* **Consequences**: Standardizes all client-to-server traffic under same-origin `/api` endpoints on port 3000, eliminating CORS issues and enabling 1-container deployment.

---

### ADR 003: Resilient Multi-Model Fallback Router
* **Status**: Accepted & Implemented
* **Context**: Direct calls to primary generative AI models can encounter temporary 503 Service Unavailable errors or 429 Rate Limits during peak global traffic.
* **Decision**: Build an automated model fallback chain inside `getAIClient()` and route handlers:
  `gemini-3.8-flash` (Primary Reasoning) ──► `gemini-3.1-flash-lite` (Fast Fallback) ──► Local Research Synthesizer
* **Consequences**: Guarantees 100% prompt responsiveness and UI uptime, preventing broken chat interfaces or raw error screens.

---

### ADR 004: Same-Origin Binary Media Proxy (`/api/video/stream`)
* **Status**: Accepted & Implemented
* **Context**: Browser security sandboxes inside preview iframes (`AIS Dev Preview`) block direct cross-origin MP4 video streams from external cloud storage buckets.
* **Decision**: Route video preview playback through Express binary stream handler `/api/video/stream?url=<encoded_url>`. The endpoint streams upstream MP4 buffers and explicitly attaches `Content-Type: video/mp4`, `Accept-Ranges: bytes`, and `Access-Control-Allow-Origin: *`.
* **Consequences**: Enables seamless HTML5 video rendering across all browser sandboxes and preview environments.

---

### ADR 005: Granular Zustand Domain Store Architecture
* **Status**: Accepted & Implemented
* **Context**: Storing all application state in a single monolithic React context or global store leads to excessive re-renders and bloated component update cycles.
* **Decision**: Partition state into specialized domain stores in `src/stores/`:
  `useAppStore`, `useAgentsStore`, `useChatStore`, `useKeysStore`, `usePoliciesStore`, `useLiveStreamStore`, `useAdminStore`, `useWorkflowStore`.
* **Consequences**: Unidirectional data flow with minimal re-renders, clean selector subscriptions, and modular component state management.

---

### ADR 006: Human-In-The-Loop (HITL) Risk Interception Matrix
* **Status**: Accepted & Implemented
* **Context**: Enterprise governance requires restricting autonomous agents from executing high-impact external actions (e.g. database wipes or financial transactions) without explicit human review.
* **Decision**: Implement a 3-tier risk policy matrix (`GREEN`, `YELLOW`, `RED`):
  - `GREEN`: Autonomously executed immediately.
  - `YELLOW`: Executed with automated trace event logging in Control Tower.
  - `RED`: Action execution paused; pending request document generated in `pendingActions` collection requiring manual approval in Control Tower.
* **Consequences**: Enforces corporate safety compliance while maintaining autonomous workflow speeds for low-risk tasks.
