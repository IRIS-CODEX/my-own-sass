# GEMINI.md — AI Operating Contract

This document is the primary operating contract for AI agents working in this repository.

---

## 🛑 Core Operating Rules

1. **Inspect Before Editing**: Treat the repository as the single source of truth. Never assume a file, route, component, table, or dependency exists without checking first.
2. **Retrieve Targeted Context First**: Read `AI_CONTEXT/README.md` and load **only** the documentation files relevant to the current task.
3. **Follow Existing Conventions**: Match the existing architecture, file naming, error handling, state management, and typing patterns. Search for reference implementations before writing new code.
4. **Minimize Change Surface**: Implement the smallest complete solution that fulfills the requirement. Do not perform unrelated refactoring or speculative abstractions.
5. **Protect Security & Secrets**: Never hardcode credentials, disable authentication/authorization rules, or bypass validation checks.
6. **Data & Schema Integrity**: Never delete data or modify database schemas without explicit requirement and safety verification.
7. **Verify Meaningful Changes**: Execute type checks (`npm run lint`) and builds (`npm run build`) before claiming completion.
8. **Update Context System**: Update `AI_CONTEXT/` files only when project state, APIs, database schemas, or architecture genuinely change.

---

## 📌 Standard Execution Workflow

For every task, follow this exact sequence:

1. **Read `GEMINI.md` & `AI_CONTEXT/README.md`**.
2. **Read `AI_CONTEXT/CURRENT_STATE.md`** for project status.
3. **Retrieve Only Relevant Subsystem Docs** (e.g. `FRONTEND.md` for UI, `DATABASE.md` for schemas).
4. **Inspect Target Source Files** in the codebase.
5. **Formulate a Minimal Plan** identifying files to create/modify.
6. **Implement the Change** matching existing codebase patterns.
7. **Verify** using `npm run lint` and build compilation.
8. **Review Diff** to ensure zero extraneous modifications.
9. **Update `AI_CONTEXT/` Docs** if architecture or current state changed.
