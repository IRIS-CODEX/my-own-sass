# PROJECT.md — AgentLens Platform Deep Technical Overview

## 📌 1. Business Mission & Platform Value Proposition
**AgentLens** is an enterprise-grade AI Agent Governance, Observability, and Virtual Key Gateway command center. It bridges autonomous LLM operations with corporate risk management, providing:

* **Autonomous Fleet Management**: Multi-archetype agent creation, status toggling, daily spend quotas, and system prompt synthesis.
* **Human-In-The-Loop (HITL) Steering**: Real-time policy inspection that intercepts high-risk tool executions (`RED` risk level) and queues them for human authorization in the Control Tower before execution.
* **Virtual Key Gateway & Spend Enforcement**: Virtual key proxying with masked API keys, rate limiting, allowed model restrictions, and daily USD spend meters (`spendTodayUsd < dailyBudgetUsd`).
* **Multimodal Capability Suite**: Integrated Gemini 3.8 Multi-Tool Chat, Veo 3 high-definition commercial video generation, Google Search grounded web research, Google Maps interactive venue discovery, audio transcription, and image synthesis.
* **Enterprise Administration & RBAC**: Dual-portal support separating standard user fleet views from super-admin organization management (`/main-admin`), RBAC roles (`portal_roles`), announcements, and audit compliance logging.

---

## 📁 2. Complete Repository Directory Layout

```
/
├── server.ts                       # Production & Dev entry point running Express server on port 3000
├── index.html                      # HTML SPA entry point with metadata, meta tags & fonts
├── metadata.json                   # AI Studio applet metadata & major capabilities declaration
├── firebase-applet-config.json     # Firebase Client Configuration (GCP Project: tranquil-tomorrow-hrtgb)
├── firebase-blueprint.json         # Firebase Schema Blueprint for Firestore collections
├── firestore.rules                 # Production security rules for Firestore database
├── Dockerfile                      # Multi-stage production Docker build based on Node 20 Alpine
├── docker-compose.yml              # Docker Compose setup mapping container port 3000 -> host 3000
├── .env.example                    # Local environment variables template
├── .env                            # Active environment variables (git-tracked as requested)
├── package.json                    # Dependencies, scripts (dev, build, start, lint)
├── tsconfig.json                   # TypeScript compiler settings
├── vite.config.ts                  # Vite build & plugin configuration
│
├── src/                            # Frontend React 19 Application Root
│   ├── main.tsx                    # React DOM root render
│   ├── App.tsx                     # Main layout shell, view switcher, route handler, toast notifications
│   ├── index.css                   # Global CSS importing Tailwind CSS v4 directives
│   ├── components/                 # UI components split by functional domain
│   │   ├── admin/                  # Admin Portal & RBAC user management (`AdminPortal.tsx`)
│   │   ├── agents/                 # Agent Registry & Agent Details (`AgentRegistry.tsx`)
│   │   ├── analytics/              # Cost Analytics & spend breakdown (`CostAnalytics.tsx`)
│   │   ├── auth/                   # Firebase Auth & Google Sign-In (`LoginPage.tsx`)
│   │   ├── chat/                   # Interactive Agent Chat & HD Video Player (`AgentChat.tsx`)
│   │   ├── common/                 # Reusable UI elements (cards, badges, modals, inputs)
│   │   ├── compliance/             # Audit compliance logging (`ComplianceHub.tsx`)
│   │   ├── dashboard/              # Fleet Overview & metric stats (`FleetOverview.tsx`)
│   │   ├── keys/                   # Virtual Key Vault & Gateway management (`VirtualKeyVault.tsx`)
│   │   ├── landing/                # Public portfolio landing page (`PortfolioPage.tsx`)
│   │   ├── layout/                 # Sidebar navigation & Topbar control header (`Sidebar.tsx`, `Topbar.tsx`)
│   │   ├── live-stream/            # Control Tower & real-time trace events (`ControlTower.tsx`)
│   │   ├── policies/               # Policy Studio & prompt safety rules (`PolicyStudio.tsx`)
│   │   ├── settings/               # System settings & theme switcher (`SettingsHub.tsx`)
│   │   ├── studio/                 # Agent Studio & Multimodal Sandbox (`AgentStudio.tsx`)
│   │   ├── subscription/           # SaaS billing & plan upgrades (`SubscriptionModal.tsx`)
│   │   ├── video/                  # Veo 3 Video playback controls (`VeoVideoPlayer.tsx`)
│   │   └── workflow/               # Drag-and-Drop Workflow Canvas (`WorkflowCanvasHub.tsx`)
│   ├── stores/                     # Domain Zustand stores (`useAppStore`, `useAgentsStore`, etc.)
│   ├── lib/                        # Client utilities & Firebase Client SDK initialization
│   └── types/                      # TypeScript interface definitions (`src/types/index.ts`)
│
├── backend/                        # Express Server Codebase
│   ├── server.ts                   # Express server factory, middleware mounting, Vite SPA bridge
│   ├── config/                     # Environment configuration loader (`backend/config/env.ts`)
│   ├── routes/                     # Domain REST API route handlers (`agent.routes.ts`, `gemini.routes.ts`, etc.)
│   ├── services/                   # Business logic (`research.service.ts`, `maps.service.ts`, `video.service.ts`, `toolDispatcher.service.ts`)
│   ├── db/                         # Drizzle ORM schema, migrations, connection pool, repositories
│   ├── middleware/                 # Express global error handler & validation middleware
│   └── lib/                        # Firebase Admin SDK initialization (`backend/lib/firebaseAdmin.ts`)
│
└── AI_CONTEXT/                     # Comprehensive Repository Knowledge System
    ├── README.md                   # Domain Index & Retrieval Matrix
    ├── project/                    # Project Architecture & Overview
    ├── frontend/                   # Frontend UI Subsystem
    ├── backend/                    # Backend Express Subsystem
    ├── database/                   # Database & Persistence Subsystem
    ├── auth/                       # Authentication & RBAC Subsystem
    └── api/                        # API Specifications Subsystem
```

---

## 🏛️ 3. Main User Portal vs. Admin Panel Breakdown

### A. Main User Workspace Portal
* **Fleet Overview**: Central dashboard showing total active agents, total executions, total USD spend today, and system status health metrics.
* **Agent Studio**: Natural language prompt-to-agent creation wizard that generates full system prompts, archetype assignments, tool permissions, suggested starter prompts, and welcome messages.
* **Agent Registry**: Fleet table allowing users to toggle agent online/offline status, switch autonomy modes (`AUTO`, `SEMI_AUTO`, `HUMAN_IN_THE_LOOP`), adjust daily budget sliders, and view execution counts.
* **Interactive Agent Chat**: Multi-tool execution workspace with streaming thought logs, tool execution cards, Google Search citations, interactive Google Maps venue cards, and embedded Veo 3 HD video playback.
* **Virtual Key Vault**: Gateway key manager for generating masked virtual API keys (`ag_live_...`), assigning upstream providers, configuring allowed model white-lists, and setting daily spend caps.
* **Policy Studio**: Tool risk level configuration (`GREEN`, `YELLOW`, `RED`) and prompt safety inspection rules.
* **Control Tower**: Real-time execution trace telemetry feed and Human-In-The-Loop pending action authorization queue.
* **Workflow Canvas**: Visual node builder for chaining agent actions and automated triggers.

### B. Admin Command Panel (`/main-admin` or `isAdminView`)
* **User Management**: View all registered users, update organization names, assign roles (`user`, `admin`, `super_admin`).
* **Global Announcements**: Post system-wide broadcast banners displayed across all active user sessions.
* **System Usage Metrics**: Monitor aggregate platform requests, total token usage, and total USD spend across all organizations.
* **Portal RBAC Manager**: Configure custom permissions and role definitions stored in `portal_roles` Firestore collection.

---

## 🔌 4. Integrations & External Services

1. **Google Gemini AI Models**: `@google/genai` TypeScript SDK using `gemini-3.8-flash` (reasoning/chat), `gemini-3.1-flash-lite` (fast fallback), and `veo-3.1-fast-generate-preview` (video commercial rendering).
2. **Google Maps Platform**: Venue search, place details, ratings, price levels, and Google Maps direction links via `backend/services/maps.service.ts`.
3. **Google Search Grounding**: Real-time web research and knowledge synthesis via `backend/services/research.service.ts`.
4. **Firebase Platform**:
   - **Firebase Authentication**: Client popup sign-in, session observers, ID token verification.
   - **Cloud Firestore**: Real-time document storage for traces, policies, pending actions, keys, and portal roles (`ai-studio-agentlens-0fb39807-62d1-453b-be9a-0a9fb50dd3e8`).
5. **PostgreSQL Database**: Relational audit trails, subscriptions, and usage quotas managed via Drizzle ORM (`drizzle-orm` + `pg`).

---

## 🐳 5. Environment & Deployment Setup
* **Port**: `3000` (strictly required for AI Studio preview environment).
* **Development**: `npm run dev` executes `tsx server.ts`, launching Express on port 3000 with Vite middleware mounted for hot-reloading SPA assets.
* **Production Build**: `npm run build` runs `vite build` (compiling static frontend bundle to `dist/`) and `esbuild server.ts` (bundling CJS server to `dist/server.cjs`).
* **Production Start**: `npm start` executes `node dist/server.cjs`.
* **Docker Containerization**: Multi-stage `Dockerfile` based on `node:20-alpine` with `docker-compose.yml` mapping host port 3000 to container port 3000 and passing `.env` variables.
