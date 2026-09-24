# GEMINI.md — Frontend Engineering Operating Contract & Architecture

This document is the dedicated operating contract and complete technical documentation for AI agents and engineers working on the **Frontend Application (`src/`)**.

---

## 🛑 Core Operating Rules for Frontend Tasks

1. **Inspect Before Editing**: Always inspect `src/components/`, `src/stores/`, and `src/App.tsx` before creating or editing components.
2. **Follow Existing Component Patterns**: Use functional React 19 components with TypeScript props interfaces. Match existing naming and styling conventions.
3. **Zustand Store Discipline**: Do not invent new local state patterns when state belongs in a domain store (`src/stores/`). Retrieve and update state using Zustand selectors.
4. **Styling Constitution**: Use Tailwind CSS v4 (`@import "tailwindcss";` in `src/index.css`). Follow the **zero-pill discipline**, clean typography, dark/light theme support, and sleek enterprise UI design.
5. **API & Error Resilience**: Always handle loading, buffering, and error states gracefully (e.g. video fallback controls, toast notifications via `useAppStore`).

---

## 🎨 Frontend Stack Overview

- **Framework**: React 19 SPA built with Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand v5
- **Icons**: Lucide React (`lucide-react`)
- **Animations & 3D**: Motion (`motion`), Canvas Confetti (`canvas-confetti`), Three.js (`three`)

---

## 📂 Frontend Directory Structure (`src/`)

```
src/
├── App.tsx                     # Main layout shell, view switcher, toast notification renderer
├── main.tsx                    # React 19 DOM root mount
├── index.css                   # Global Tailwind CSS v4 directives
├── components/                 # Domain-partitioned UI components
│   ├── admin/                  # Admin Portal & RBAC user management (`AdminPortal.tsx`)
│   ├── agents/                 # Agent Registry & Agent Details (`AgentRegistry.tsx`)
│   ├── analytics/              # Cost Analytics & spend breakdown (`CostAnalytics.tsx`)
│   ├── auth/                   # Firebase Auth & Google Sign-In (`LoginPage.tsx`)
│   ├── chat/                   # Interactive Agent Chat & HD Video Player (`AgentChat.tsx`)
│   ├── compliance/             # Audit compliance logging (`ComplianceHub.tsx`)
│   ├── dashboard/              # Fleet Overview & metric stats (`FleetOverview.tsx`)
│   ├── keys/                   # Virtual Key Vault & Gateway management (`VirtualKeyVault.tsx`)
│   ├── landing/                # Public portfolio landing page (`PortfolioPage.tsx`)
│   ├── layout/                 # Sidebar navigation & Topbar control header (`Sidebar.tsx`, `Topbar.tsx`)
│   ├── live-stream/            # Control Tower & real-time trace events (`ControlTower.tsx`)
│   ├── policies/               # Policy Studio & prompt safety rules (`PolicyStudio.tsx`)
│   ├── settings/               # System settings & theme switcher (`SettingsHub.tsx`)
│   ├── studio/                 # Agent Studio & Multimodal Sandbox (`AgentStudio.tsx`)
│   ├── subscription/           # SaaS billing & plan upgrades (`SubscriptionModal.tsx`)
│   ├── video/                  # Veo 3 Video playback controls (`VeoVideoPlayer.tsx`)
│   └── workflow/               # Drag-and-Drop Workflow Canvas (`WorkflowCanvasHub.tsx`)
├── stores/                     # Domain Zustand stores
│   ├── useAppStore.ts          # Active navigation view, theme, toasts, modal state
│   ├── useAgentsStore.ts       # Fleet agents list, active selection, creation wizard
│   ├── useChatStore.ts         # Active chat session, message history, streaming thoughts
│   ├── useKeysStore.ts         # Virtual keys list, creation, budget meters
│   ├── usePoliciesStore.ts      # Policy rules, tool risk levels (GREEN/YELLOW/RED)
│   ├── useLiveStreamStore.ts   # Control Tower live trace logs, pending HITL approvals
│   ├── useAdminStore.ts        # Admin users, announcements, RBAC portal roles
│   └── useWorkflowStore.ts     # Workflow canvas nodes, node connections, execution
├── lib/                        # Client utilities & Firebase Client SDK initialization
│   ├── firebase.ts             # Firebase app, Auth & Firestore DB export
│   ├── firebaseAuth.ts         # Firebase Auth observer & sign-in helpers
│   └── utils.ts                # Classnames merge & formatting helpers
└── types/                      # TypeScript interface definitions
    └── index.ts                # Domain types (Agent, Message, Key, Policy, TraceEvent)
```

---

## 🏬 Zustand Stores Reference

| Store | Location | State & Actions |
| :--- | :--- | :--- |
| `useAppStore` | `src/stores/useAppStore.ts` | `activeNav`, `theme`, `toasts`, `isAdminView`, `isLoginPage`, `setActiveNav()`, `addToast()`. |
| `useAgentsStore` | `src/stores/useAgentsStore.ts` | `agents`, `activeAgent`, `synthesizeAgent()`, `toggleAgentStatus()`. |
| `useChatStore` | `src/stores/useChatStore.ts` | `messages`, `isGenerating`, `activeThoughts`, `sendMessage()`, `clearChat()`. |
| `useKeysStore` | `src/stores/useKeysStore.ts` | `virtualKeys`, `createKey()`, `revokeKey()`, `dailySpendUsd`. |
| `usePoliciesStore` | `src/stores/usePoliciesStore.ts` | `policies`, `promptRules`, `updateToolRisk()`, `toggleRule()`. |
| `useLiveStreamStore` | `src/stores/useLiveStreamStore.ts` | `traceEvents`, `pendingActions`, `approveAction()`, `rejectAction()`. |
| `useAdminStore` | `src/stores/useAdminStore.ts` | `users`, `roles`, `globalAnnouncement`, `updateRole()`. |
| `useWorkflowStore` | `src/stores/useWorkflowStore.ts` | `nodes`, `edges`, `addNode()`, `executeWorkflow()`. |

---

## 🎬 Representative Source Examples

* **App Layout Shell**: `src/App.tsx`
* **Complex Multi-Tool Component**: `src/components/chat/AgentChat.tsx` (renders messages, thought logs, and proxied video streams via `AgentChatVideoPlayer`).
* **Creation Wizard**: `src/components/studio/AgentStudio.tsx`
* **Real-time Control Tower**: `src/components/live-stream/ControlTower.tsx`
* **Firebase Auth Integration**: `src/lib/firebaseAuth.ts`
