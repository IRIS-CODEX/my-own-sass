# FRONTEND.md — Frontend Architecture & Conventions

## 🎨 Technology Stack
- **Framework**: React 19 SPA built with Vite
- **Styling**: Tailwind CSS v4 (imported via `@import "tailwindcss";` in `src/index.css`)
- **Icons**: Lucide React (`lucide-react`)
- **Animations**: Motion (`motion`) & Canvas Confetti (`canvas-confetti`)
- **3D Graphics**: Three.js (`three`, `@types/three`)
- **State Management**: Zustand v5 (`zustand`)

---

## 📂 Store Architecture (Zustand)

Global application state is partitioned into domain stores located in `src/stores/`:

| Store | Reference File | Responsibility |
| :--- | :--- | :--- |
| `useAppStore` | `src/stores/useAppStore.ts` | Active navigation (`activeNav`), theme (`light`/`dark`), toast notifications, sound settings, modal views (`isAdminView`, `isLoginPage`). |
| `useAgentsStore` | `src/stores/useAgentsStore.ts` | Fleet agent list, active agent selection, agent creation wizard, agent status toggles. |
| `useChatStore` | `src/stores/useChatStore.ts` | Chat session messages, streaming thought states, active tool execution results, input text. |
| `useKeysStore` | `src/stores/useKeysStore.ts` | Virtual keys list, key creation, daily spend metrics, prefix masking. |
| `usePoliciesStore` | `src/stores/usePoliciesStore.ts` | Tool risk levels (`GREEN`/`YELLOW`/`RED`), prompt governance rules, policy creation. |
| `useLiveStreamStore` | `src/stores/useLiveStreamStore.ts` | Control Tower live trace events, pending HITL action approvals, system status logs. |
| `useAdminStore` | `src/stores/useAdminStore.ts` | Admin Portal users, global announcements, organization settings, portal RBAC roles. |
| `useWorkflowStore` | `src/stores/useWorkflowStore.ts` | Visual workflow canvas nodes, execution connections, workflow execution triggers. |

---

## 🖼️ Component Taxonomy & Navigation

Application views are rendered conditionally in `src/App.tsx` based on `activeNav` state or modal overlays:

```
src/App.tsx
├── Sidebar & Topbar (`src/components/layout/`)
└── View Switcher (`activeNav`):
    ├── 'fleet'        ► FleetOverview (`src/components/dashboard/FleetOverview.tsx`)
    ├── 'studio'       ► AgentStudio (`src/components/studio/AgentStudio.tsx`)
    ├── 'registry'     ► AgentRegistry (`src/components/agents/AgentRegistry.tsx`)
    ├── 'chat'         ► AgentChat (`src/components/chat/AgentChat.tsx`)
    ├── 'control-tower'► ControlTower (`src/components/live-stream/ControlTower.tsx`)
    ├── 'workflow'     ► WorkflowCanvasHub (`src/components/workflow/WorkflowCanvasHub.tsx`)
    ├── 'policies'     ► PolicyStudio (`src/components/policies/PolicyStudio.tsx`)
    ├── 'vault'        ► VirtualKeyVault (`src/components/keys/VirtualKeyVault.tsx`)
    ├── 'compliance'   ► ComplianceHub (`src/components/compliance/ComplianceHub.tsx`)
    ├── 'analytics'    ► CostAnalytics (`src/components/analytics/CostAnalytics.tsx`)
    ├── 'settings'     ► SettingsHub (`src/components/settings/SettingsHub.tsx`)
    └── Overlays:
        ├── isAdminView  ► AdminPortal (`src/components/admin/AdminPortal.tsx`)
        └── isLoginPage  ► LoginPage (`src/components/auth/LoginPage.tsx`)
```

---

## 🎬 Representative Source Examples

* **Representative Page/Shell**: `src/App.tsx`
* **Representative Complex Interactive Component**: `src/components/chat/AgentChat.tsx` (handles chat messages, streaming thought log cards, and `AgentChatVideoPlayer` video stream fallback).
* **Representative Form & Wizard**: `src/components/studio/AgentStudio.tsx`
* **Representative State Store**: `src/stores/useAgentsStore.ts`
