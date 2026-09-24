# ENGINEERING_RULES.md — Comprehensive Engineering & Code Quality Constitution

## 📜 1. Core Operating Principles

1. **Inspect Before Editing**: Always inspect existing code files (`src/components/`, `backend/routes/`, `backend/services/`) before making changes. Never assume a file, route, component, or dependency exists without checking first.
2. **Repository as Source of Truth**: Treat the existing codebase patterns, naming conventions, and file structures as authoritative guidelines.
3. **Smallest Complete Change**: Implement the minimal code modifications required to complete the task. Never rewrite entire files or components when targeted edits suffice.
4. **No Unrelated Refactoring**: Do not reformat, rename variables, or reorganize unrelated logic during feature edits or bug fixes.
5. **Zero-Pill Discipline & UI Elegance**:
   - Maintain clean, professional typography and dark/light contrast.
   - Avoid decorative pills, badges, or telemetry clutter.
   - Ensure clean spacing, responsive layouts, and modern enterprise aesthetics.
6. **Strict Typing Discipline**: Maintain complete TypeScript interfaces in `src/types/index.ts` and `backend/db/types.ts`. Avoid `any` types; use explicit interfaces for API request/response payloads and store states.
7. **Explicit Error Handling & Fallbacks**: Always wrap asynchronous API operations and LLM calls in `try/catch` blocks. Provide clear user-facing error toasts or graceful UI fallback components.
8. **Security & Secrets Protection**:
   - Never hardcode secret credentials or API keys in source code.
   - Load environment variables via `backend/config/env.ts` or `import.meta.env`.
   - Never disable or weaken authentication rules (`firestore.rules`) or Virtual Key Gateway budget checks to bypass errors.

---

## 🔍 2. Pre-Commit & Diff Review Checklist

Before finalizing any task, perform this strict verification sequence:

- [ ] **Type Safety**: Run `npm run lint` (`tsc --noEmit`) and verify zero TypeScript errors.
- [ ] **Compilation**: Run `compile_applet` (`npm run build`) and verify build succeeds.
- [ ] **Context Alignment**: Verify changes align with `AI_CONTEXT/project/ARCHITECTURE.md` and `AI_CONTEXT/project/PROJECT.md`.
- [ ] **Minimal Diff**: Review the code diff to ensure zero extraneous modifications, deleted comments, or re-formatted lines.
- [ ] **Secrets Audit**: Confirm no API keys, private tokens, or sensitive credentials were committed.
- [ ] **Documentation Sync**: Update relevant files in `AI_CONTEXT/` if project state, routes, schemas, or architectural decisions were altered.
