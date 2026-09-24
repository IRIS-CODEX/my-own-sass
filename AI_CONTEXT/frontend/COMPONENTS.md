# COMPONENTS.md — Detailed Frontend Component Taxonomy

## 📂 UI Components Breakdown (`src/components/`)

### 1. Dashboard & Fleet Monitoring
- **`FleetOverview.tsx`** (`src/components/dashboard/`): System metric counters, agent status summary, active model utilization gauges.

### 2. Interactive Chat & Video Player
- **`AgentChat.tsx`** (`src/components/chat/`): Multi-turn streaming chat interface, thought log cards, tool execution display, and embedded `AgentChatVideoPlayer` video stream fallback component.

### 3. Agent Studio & Registry
- **`AgentStudio.tsx`** (`src/components/studio/`): Natural language agent wizard with capability selection (`image_generation`, `video_generation`, `google_search`, `google_maps`).
- **`AgentRegistry.tsx`** (`src/components/agents/`): Full fleet table with status toggling, autonomy controls, and budget sliders.

### 4. Control Tower & Governance
- **`ControlTower.tsx`** (`src/components/live-stream/`): Real-time trace telemetry events stream, HITL pending action approval queue, and system log inspector.
- **`PolicyStudio.tsx`** (`src/components/policies/`): Tool risk matrix (`GREEN`, `YELLOW`, `RED`) and prompt governance rules.
- **`VirtualKeyVault.tsx`** (`src/components/keys/`): Gateway virtual keys list, prefix masking, allowed model selection, daily USD budget limits.

### 5. Workflow Canvas & Analytics
- **`WorkflowCanvasHub.tsx`** (`src/components/workflow/`): Visual drag-and-drop workflow canvas with node execution triggers.
- **`CostAnalytics.tsx`** (`src/components/analytics/`): Daily/monthly AI token spend breakdown and cost projections.
- **`ComplianceHub.tsx`** (`src/components/compliance/`): Security audit log and compliance checks.

### 6. Administration & Authentication
- **`AdminPortal.tsx`** (`src/components/admin/`): Organization admin management, global announcements, RBAC role assignments.
- **`LoginPage.tsx`** (`src/components/auth/`): Firebase Auth sign-in with Google OAuth popup & Email/Password form.
