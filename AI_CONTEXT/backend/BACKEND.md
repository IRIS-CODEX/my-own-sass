# BACKEND.md — Backend Architecture & Conventions

## ⚙️ Backend Structure & Runtime
- **Runtime**: Node.js v20+ with TypeScript (`tsx` runner in development, `esbuild` CJS bundle in production).
- **Server Framework**: Express 4 (`express`)
- **Main Server File**: `server.ts` imports `startServer()` from `backend/server.ts`.
- **Environment Loader**: `backend/config/env.ts` calls `dotenv.config()` and exposes structured config parameters.

---

## 🛣️ Route Modules (`backend/routes/`)

Mounted under `/api` in `backend/routes/index.ts`:

| Route Module | Reference File | Responsibilities |
| :--- | :--- | :--- |
| `healthRoutes` | `backend/routes/health.routes.ts` | Server health check (`/api/health`) and uptime verification. |
| `usersRoutes` | `backend/routes/users.routes.ts` | User profile sync (`/api/users/profile`) and organization updates. |
| `agentRoutes` | `backend/routes/agent.routes.ts` | Agent CRUD, prompt synthesis (`/api/agents/synthesize`), execution logs, and chat execution (`/api/agent/chat`). |
| `gatewayRoutes` | `backend/routes/gateway.routes.ts` | Virtual Key gateway proxy (`/api/gateway/execute`) enforcing rate limits & budget constraints. |
| `gmailRoutes` | `backend/routes/gmail.routes.ts` | Gmail integrations and draft/email automation triggers. |
| `geminiRoutes` | `backend/routes/gemini.routes.ts` | Grounded chat (`/api/gemini/grounded-chat`), image generation (`/api/gemini/generate-image`), video generation (`/api/gemini/generate-video`), and binary video stream proxy (`/api/video/stream`). |

---

## 🧱 Services Layer (`backend/services/`)

- **`research.service.ts`**: Deep web search grounding and factual knowledge synthesis.
- **`maps.service.ts`**: Google Maps venue search, address geocoding, ratings, and navigation links.
- **`video.service.ts`**: Veo 3 commercial video script synthesis and HD sample stream mapping.
- **`toolDispatcher.service.ts`**: Unified dispatcher with exponential backoff for Maps & Search grounding tools.

---

## 🔒 Error Handling & Middleware
- **Error Handler**: `backend/middleware/errorHandler.ts` catches unhandled controller errors and formats standard JSON response:
  ```json
  {
    "error": "Internal Server Error",
    "message": "Detailed error description"
  }
  ```

---

## 🎬 Representative Source Examples
* **Server Entry**: `server.ts` / `backend/server.ts`
* **Representative Complex Route**: `backend/routes/agent.routes.ts`
* **Representative Service**: `backend/services/video.service.ts`
* **Representative Tool Dispatcher**: `backend/services/toolDispatcher.service.ts`
