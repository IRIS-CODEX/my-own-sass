# DATABASE.md — Database Schema & Persistence Layer

AgentLens uses a dual-engine persistence architecture designed for both relational audit compliance and real-time document streaming.

---

## 🐘 Engine 1: PostgreSQL via Drizzle ORM

Defined in `backend/db/schema.ts` and managed via `drizzle-orm` / `drizzle-kit`:

### Key Relational Tables

1. **`users`**:
   - `id` (serial primary key), `uid` (Firebase Auth UID text), `email`, `displayName`, `organizationName`, `role`, `createdAt`, `lastLoginAt`.
2. **`subscriptions`**:
   - `id`, `userId` (FK -> users.id), `planTier` (`FREE`, `PRO_MONTHLY`, `ENTERPRISE`), `status`, `monthlyPriceUsd`, `currentPeriodStart`, `currentPeriodEnd`.
3. **`usage_quotas`**:
   - `id`, `userId`, `subscriptionId`, `requestLimit`, `requestsUsed`, `activeAgentsCount`, `virtualKeysCount`.
4. **`agents`**:
   - `id` (text PK), `userId` (FK -> users.uid), `name`, `description`, `archetype`, `autonomyMode`, `dailyBudgetUsd`, `spendTodayUsd`, `totalExecutions`, `systemPrompt`, `model`, `status`, `tools` (jsonb), `suggestedPrompts` (jsonb).
5. **`chat_sessions`**:
   - `id` (text PK), `agentId` (FK -> agents.id), `userId`, `title`, `isArchived`.
6. **`chat_messages`**:
   - `id`, `sessionId` (FK -> chatSessions.id), `agentId`, `userId`, `sender` (`user`/`agent`/`system`), `content`, `thoughts` (jsonb), `toolCall` (jsonb), `metrics` (jsonb: latencyMs, tokensUsed, costUsd).
7. **`agent_memories`**:
   - `id`, `agentId`, `userId`, `memoryKey`, `memoryValue`, `category` (`GENERAL`/`PREFERENCE`/`FACT`/`DIRECTIVE`/`SUMMARY`), `importanceScore` (1-10), `contextMetadata` (jsonb).
8. **`agent_executions`**:
   - `id`, `agentId`, `userId`, `actionName`, `parameters` (jsonb), `resultData` (jsonb), `riskLevel` (`GREEN`/`YELLOW`/`RED`), `status` (`SUCCESS`/`BLOCKED`/`FAILED`), `latencyMs`, `tokensUsed`, `costUsd`.
9. **`virtual_keys`**:
   - `id`, `userId`, `name`, `keyPrefix`, `fullKeySecret`, `isActive`, `upstreamProvider`, `dailyBudgetUsd`, `spendTodayUsd`, `totalRequests`, `blockedRequests`.

---

## 🔥 Engine 2: Google Cloud Firestore

Managed via `src/lib/firebase.ts`, `backend/lib/firebaseAdmin.ts`, and `firestore.rules`:

### Active Firestore Collections

* **`users/{userId}`**: User profile document.
* **`agents/{agentId}`**: Active agent configurations.
* **`virtualKeys/{keyId}`**: Virtual Gateway key metadata and budget limits.
* **`policies/{policyId}`**: Tool risk level governance policies.
* **`promptRules/{ruleId}`**: Prompt safety inspection rules.
* **`traceEvents/{traceId}`**: Real-time execution trace telemetry logs.
* **`pendingActions/{actionId}`**: Human-In-The-Loop approval queue.
* **`portal_roles/{roleId}`**: RBAC roles and permissions.
* **`portal_users/{userId}`**: Portal admin accounts.

---

## 🔒 Security Rules & Access Control (`firestore.rules`)
- Default deny all (`allow read, write: if false;`).
- Document owner isolation (`request.auth.uid == userId`).
- Super-Admin access granted for `hamudijems4@gmail.com` or documents in `/admins/{uid}`.
- Strict schema field validation on `create` and `update` operations.
