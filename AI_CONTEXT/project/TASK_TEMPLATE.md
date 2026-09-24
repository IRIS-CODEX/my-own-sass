# [Task Title]

## 🎯 1. Goal
[Clear 1-2 sentence statement of the exact feature, fix, or capability to implement]

## 🔍 2. Context & Background
[Detailed background explanation, current system behavior, user problem statement, or architectural motivation]

## 📋 3. Scope of Changes
[Explicit list of deliverables, specific files to create or modify, and components involved]
- Create/Edit: `src/components/...`
- Create/Edit: `backend/routes/...`
- Create/Edit: `src/stores/...`

## 🚫 4. Non-Goals
[Explicit list of functionality, components, or files that should NOT be modified, refactored, or touched]

## ⚙️ 5. Technical Constraints & Rules
- Maintain single-process Express + Vite architecture on port 3000.
- Preserve zero-pill discipline and clean typography in UI components.
- Maintain multi-model fallback chain for all AI features.
- Ensure all async operations are wrapped in try/catch blocks with toast notifications.

## 📁 6. Existing Reference Implementation
[Reference existing codebase patterns to follow]
- Component Reference: `src/components/chat/AgentChat.tsx`
- Route Reference: `backend/routes/agent.routes.ts`
- Store Reference: `src/stores/useAgentsStore.ts`

## ✅ 7. Acceptance Criteria
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## 🧪 8. Verification Steps
- [ ] Code passes `npm run lint` (`tsc --noEmit`) with 0 errors
- [ ] Code compiles cleanly via `npm run build`
- [ ] Feature manually verified in preview environment

## ⚠️ 9. Risks & Mitigations
[Identify potential side effects, data migration risks, or security implications and describe mitigations]
