# GEMINI.md — Backend Engineering Operating Contract & Architecture

This document is the dedicated operating contract and complete technical documentation for AI agents and engineers working on the **Backend Server (`backend/`)**.

---

## 🛑 Core Operating Rules for Backend Tasks

1. **Inspect Before Editing**: Inspect `backend/routes/`, `backend/services/`, and `backend/db/` before modifying server logic.
2. **Preserve API Contracts**: Do not break existing REST endpoint shapes (`/api/*`).
3. **Multi-Model Resilient Fallback**: Always maintain fallback sequences for AI models (`gemini-3.8-flash` -> `gemini-3.1-flash-lite` -> local research synthesizer). Never let upstream 503 or 429 rate limits throw unhandled raw API errors.
4. **Dual Persistence Integrity**: Maintain both Drizzle ORM PostgreSQL models (`backend/db/schema.ts`) and Firebase Admin Firestore operations (`backend/lib/firebaseAdmin.ts`).
5. **Secure Stream Proxying**: Ensure binary stream endpoints like `/api/video/stream` return `Accept-Ranges: bytes` and `Content-Type: video/mp4` to bypass iframe restrictions.

---

## ⚙️ Backend Stack Overview

- **Runtime**: Node.js v20+ with Express 4
- **TypeScript Runner**: `tsx` (Dev) / `esbuild` CJS Bundle (Prod)
- **AI SDK**: `@google/genai` TypeScript SDK
- **ORM / Database**: Drizzle ORM (`drizzle-orm` + `pg`) + Firebase Admin SDK (`firebase-admin`)

---

## 📂 Backend Directory Structure (`backend/`)

```
backend/
├── server.ts                   # Express server factory, middleware mounting, Vite SPA integration
├── config/                     # Configuration loader
│   └── env.ts                  # dotenv initializer & process.env exporter
├── routes/                     # Domain REST API route handlers
│   ├── index.ts                # Express API router mounting all routes under `/api`
│   ├── agent.routes.ts         # Agent CRUD, synthesis (`/api/agents/synthesize`), chat execution (`/api/agent/chat`)
│   ├── gemini.routes.ts        # Grounded chat, image generation, video generation & video stream proxy
│   ├── gateway.routes.ts       # Virtual Key Gateway execution proxy & budget enforcement
│   ├── users.routes.ts         # User profile sync & organization settings
│   ├── gmail.routes.ts         # Gmail automation triggers & drafts
│   └── health.routes.ts        # Health check endpoint (`/api/health`)
├── services/                   # Business logic & external AI tool dispatchers
│   ├── research.service.ts     # Deep web research & search grounding synthesizer
│   ├── maps.service.ts         # Google Maps venue search, geocoding & directions routing
│   ├── video.service.ts        # Veo 3 commercial video storyboard generator
│   └── toolDispatcher.service.ts # Unified tool execution dispatcher with exponential backoff
├── db/                         # Database persistence layer
│   ├── schema.ts               # Drizzle ORM PostgreSQL table schemas & relations
│   ├── index.ts                # PostgreSQL connection pool initializer
│   ├── types.ts                # DB entity TypeScript interface definitions
│   ├── drizzle.config.ts       # Drizzle Kit CLI configuration
│   └── repositories/           # Repository pattern data access layer
│       ├── agent.repository.ts
│       ├── chat.repository.ts
│       └── execution.repository.ts
├── middleware/                 # Express middleware
│   └── errorHandler.ts         # Global centralized error handler
└── lib/                        # Service client initializers
    └── firebaseAdmin.ts        # Firebase Admin SDK initialization
```

---

## 🛣️ API Endpoints Summary

| Endpoint | Method | Description | Primary Route File |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and server status. | `backend/routes/health.routes.ts` |
| `/api/users/profile` | `POST` | Sync user profile & organization. | `backend/routes/users.routes.ts` |
| `/api/agents` | `GET`/`POST` | List and create agents. | `backend/routes/agent.routes.ts` |
| `/api/agents/synthesize` | `POST` | Synthesize agent from prompt. | `backend/routes/agent.routes.ts` |
| `/api/agent/chat` | `POST` | Multi-tool autonomous agent chat. | `backend/routes/agent.routes.ts` |
| `/api/gemini/grounded-chat`| `POST` | Search & Maps grounded chat. | `backend/routes/gemini.routes.ts` |
| `/api/gemini/generate-image`| `POST` | Image synthesis via Gemini. | `backend/routes/gemini.routes.ts` |
| `/api/gemini/generate-video`| `POST` | Veo 3 video ad generation. | `backend/routes/gemini.routes.ts` |
| `/api/video/stream` | `GET` | Same-origin binary MP4 proxy stream. | `backend/routes/gemini.routes.ts` |
| `/api/gateway/execute` | `POST` | Virtual Key gateway proxy. | `backend/routes/gateway.routes.ts` |

---

## 🎬 Representative Source Examples

* **Server Factory**: `backend/server.ts`
* **Agent Route Handler**: `backend/routes/agent.routes.ts`
* **Grounded AI & Stream Proxy**: `backend/routes/gemini.routes.ts`
* **Veo 3 Video Service**: `backend/services/video.service.ts`
* **Drizzle ORM Schema**: `backend/db/schema.ts`
