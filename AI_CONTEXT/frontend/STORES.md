# STORES.md — Zustand Domain Stores Architecture

## 📂 Store Registry (`src/stores/`)

### 1. `useAppStore` (`src/stores/useAppStore.ts`)
- **State**: `activeNav`, `theme` ('light'|'dark'), `toasts`, `isAdminView`, `isLoginPage`, `soundEnabled`.
- **Actions**: `setActiveNav(view)`, `toggleTheme()`, `addToast(toast)`, `removeToast(id)`.

### 2. `useAgentsStore` (`src/stores/useAgentsStore.ts`)
- **State**: `agents`, `activeAgentId`, `isSynthesizing`.
- **Actions**: `synthesizeAgent(prompt, capabilities)`, `toggleAgentStatus(id)`, `setActiveAgent(id)`.

### 3. `useChatStore` (`src/stores/useChatStore.ts`)
- **State**: `messages`, `isGenerating`, `thoughts`, `mediaUrl`.
- **Actions**: `sendMessage(agentId, text, tools)`, `clearChat()`.

### 4. `useKeysStore` (`src/stores/useKeysStore.ts`)
- **State**: `virtualKeys`, `dailySpendUsd`.
- **Actions**: `createKey(keyData)`, `revokeKey(id)`.

### 5. `usePoliciesStore` (`src/stores/usePoliciesStore.ts`)
- **State**: `policies`, `promptRules`.
- **Actions**: `updateRiskLevel(toolName, risk)`, `togglePromptRule(id)`.

### 6. `useLiveStreamStore` (`src/stores/useLiveStreamStore.ts`)
- **State**: `traceEvents`, `pendingActions`.
- **Actions**: `approveAction(actionId)`, `rejectAction(actionId)`.

### 7. `useAdminStore` (`src/stores/useAdminStore.ts`)
- **State**: `users`, `roles`, `globalAnnouncement`.
- **Actions**: `setAnnouncement(text)`, `updateRole(userId, role)`.

### 8. `useWorkflowStore` (`src/stores/useWorkflowStore.ts`)
- **State**: `nodes`, `edges`, `isExecuting`.
- **Actions**: `addNode(node)`, `executeWorkflow()`.
