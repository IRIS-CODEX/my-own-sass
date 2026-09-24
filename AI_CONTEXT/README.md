# AI_CONTEXT — Domain Knowledge Layer & Index

This directory provides a structured, domain-separated knowledge layer for AI-assisted development on **AgentLens**.

---

## 📂 Subsystem Context Directories

| Domain Directory | Contained Documentation Files | Description |
| :--- | :--- | :--- |
| **`AI_CONTEXT/project/`** | `PROJECT.md`, `ARCHITECTURE.md`, `CURRENT_STATE.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `ENGINEERING_RULES.md`, `TASK_TEMPLATE.md` | Overall business project overview, repository architecture, current implementation state, ADRs, known issues, engineering standards, and task template. |
| **`AI_CONTEXT/frontend/`** | `GEMINI.md`, `FRONTEND.md`, `COMPONENTS.md`, `STORES.md` | React 19 SPA frontend architecture, Zustand state management stores, component taxonomy, styling discipline, and frontend GEMINI contract. |
| **`AI_CONTEXT/backend/`** | `GEMINI.md`, `BACKEND.md`, `ROUTES.md`, `SERVICES.md` | Express 4 backend architecture, route module specifications, domain services, model fallback sequence, and backend GEMINI contract. |
| **`AI_CONTEXT/database/`** | `DATABASE.md`, `SCHEMAS.md` | Dual engine persistence: Drizzle ORM PostgreSQL tables & Google Cloud Firestore document schemas/rules. |
| **`AI_CONTEXT/auth/`** | `AUTHENTICATION.md` | Firebase Authentication, ID token verification, and Role-Based Access Control (RBAC). |
| **`AI_CONTEXT/api/`** | `API_CONTRACTS.md` | REST API payload contracts, endpoints, and error handling formats. |

---

## 📌 Master Operating Contracts Summary
* **Global Project Operating Contract**: `/GEMINI.md`
* **Frontend Application Operating Contract**: `/src/GEMINI.md`
* **Backend Server Operating Contract**: `/backend/GEMINI.md`

---

## 🎯 Targeted Context Retrieval Matrix

Retrieve **only** the documentation files relevant to your task domain:

* **General Project & Architecture Task**:
  * Read: `/GEMINI.md` → `AI_CONTEXT/project/PROJECT.md` → `AI_CONTEXT/project/CURRENT_STATE.md`
* **Frontend UI / React Task**:
  * Read: `/src/GEMINI.md` → `AI_CONTEXT/frontend/FRONTEND.md` → `AI_CONTEXT/frontend/COMPONENTS.md`
* **Backend Express / Service Task**:
  * Read: `/backend/GEMINI.md` → `AI_CONTEXT/backend/BACKEND.md` → `AI_CONTEXT/backend/ROUTES.md`
* **Database & Schema Task**:
  * Read: `AI_CONTEXT/database/DATABASE.md` → `backend/db/schema.ts`
* **Auth & Security Task**:
  * Read: `AI_CONTEXT/auth/AUTHENTICATION.md` → `firestore.rules`
