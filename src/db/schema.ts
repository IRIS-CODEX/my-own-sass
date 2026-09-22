import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
  doublePrecision,
  jsonb,
} from 'drizzle-orm/pg-core';

// 1. Users Table (Aligned with existing database)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  organizationName: text('organization_name'),
  role: text('role').default('user'),
  authProvider: text('auth_provider').default('google'),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
});

// 2. Subscriptions Table (SaaS Billing & Plan Tier)
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  tenantId: text('tenant_id'),
  planTier: text('plan_tier').default('PRO_MONTHLY'),
  status: text('status').default('ACTIVE'),
  monthlyPriceUsd: integer('monthly_price_usd').default(49),
  totalPaidLtvUsd: integer('total_paid_ltv_usd').default(49),
  unpaidBalanceUsd: integer('unpaid_balance_usd').default(0),
  billingInterval: text('billing_interval').default('month'),
  currentPeriodStart: timestamp('current_period_start').defaultNow(),
  currentPeriodEnd: timestamp('current_period_end'),
  paymentMethod: text('payment_method').default('CARD'),
  cardLast4: text('card_last4'),
  dunningSentCount: integer('dunning_sent_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Usage Quotas Table
export const usageQuotas = pgTable('usage_quotas', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }),
  requestLimit: integer('request_limit').default(250000),
  requestsUsed: integer('requests_used').default(0),
  activeAgentsCount: integer('active_agents_count').default(1),
  virtualKeysCount: integer('virtual_keys_count').default(1),
  lastCalculatedAt: timestamp('last_calculated_at').defaultNow(),
});

// 4. AI Agents Table (Persistent AI Agent definitions created by the user)
export const agents = pgTable('agents', {
  id: text('id').primaryKey(), // Agent ID (e.g. 'agent-exec-pilot-1' or 'agent-custom-...')
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }),
  orgId: text('org_id').notNull().default('org-main'),
  name: text('name').notNull(),
  description: text('description').notNull(),
  archetype: text('archetype').notNull().default('CUSTOM'),
  autonomyMode: text('autonomy_mode').notNull().default('SEMI_AUTO'),
  dailyBudgetUsd: doublePrecision('daily_budget_usd').notNull().default(25.0),
  spendTodayUsd: doublePrecision('spend_today_usd').notNull().default(0.0),
  totalExecutions: integer('total_executions').notNull().default(0),
  systemPrompt: text('system_prompt').notNull(),
  model: text('model').notNull().default('gemini-3.8-flash'),
  temperature: doublePrecision('temperature').notNull().default(0.3),
  status: text('status').notNull().default('ONLINE'),
  framework: text('framework').notNull().default('Gemini 3.8 Multi-Tool'),
  avatarIcon: text('avatar_icon'),
  welcomeMessage: text('welcome_message'),
  tools: jsonb('tools').$type<string[]>().default([]),
  suggestedPrompts: jsonb('suggested_prompts').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. Chat Sessions Table (Autonomous Chat session threading)
export const chatSessions = pgTable('chat_sessions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }),
  title: text('title').notNull().default('New Autonomous Session'),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 6. Chat Messages Table (Stores conversation history, thoughts & tool executions)
export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => chatSessions.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }),
  sender: text('sender').notNull(), // 'user' | 'agent' | 'system'
  content: text('content').notNull(),
  thoughts: jsonb('thoughts').$type<string[]>(),
  toolCall: jsonb('tool_call'),
  metrics: jsonb('metrics').$type<{
    latencyMs?: number;
    tokensUsed?: number;
    costUsd?: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Agent Memories Table (Long-term structured semantic memory bank)
export const agentMemories = pgTable('agent_memories', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }),
  memoryKey: text('memory_key').notNull(), // e.g. 'preferred_tone', 'project_goal', 'contact_memo'
  memoryValue: text('memory_value').notNull(),
  category: text('category').notNull().default('GENERAL'), // 'PREFERENCE' | 'FACT' | 'DIRECTIVE' | 'SUMMARY'
  importanceScore: integer('importance_score').notNull().default(5), // 1 - 10
  contextMetadata: jsonb('context_metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 8. Agent Executions & Audit Log Table
export const agentExecutions = pgTable('agent_executions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }),
  actionName: text('action_name').notNull(),
  parameters: jsonb('parameters'),
  resultData: jsonb('result_data'),
  riskLevel: text('risk_level').notNull().default('GREEN'), // 'GREEN' | 'YELLOW' | 'RED'
  status: text('status').notNull().default('SUCCESS'), // 'SUCCESS' | 'BLOCKED' | 'FAILED'
  latencyMs: integer('latency_ms').default(0),
  tokensUsed: integer('tokens_used').default(0),
  costUsd: doublePrecision('cost_usd').default(0.0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Virtual Keys Table
export const virtualKeys = pgTable('virtual_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid, { onDelete: 'cascade' }),
  orgId: text('org_id').notNull().default('org-main'),
  agentId: text('agent_id'),
  name: text('name').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  fullKeySecret: text('full_key_secret'),
  isActive: boolean('is_active').notNull().default(true),
  upstreamProvider: text('upstream_provider').notNull().default('GEMINI'),
  upstreamKeyMasked: text('upstream_key_masked').notNull(),
  allowedModels: jsonb('allowed_models').$type<string[]>().default([]),
  dailyBudgetUsd: doublePrecision('daily_budget_usd').notNull().default(50.0),
  spendTodayUsd: doublePrecision('spend_today_usd').notNull().default(0.0),
  totalRequests: integer('total_requests').notNull().default(0),
  blockedRequests: integer('blocked_requests').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  agents: many(agents),
  chatSessions: many(chatSessions),
  chatMessages: many(chatMessages),
  memories: many(agentMemories),
  executions: many(agentExecutions),
  subscriptions: many(subscriptions),
  usageQuotas: many(usageQuotas),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.uid],
  }),
  sessions: many(chatSessions),
  messages: many(chatMessages),
  memories: many(agentMemories),
  executions: many(agentExecutions),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  agent: one(agents, {
    fields: [chatSessions.agentId],
    references: [agents.id],
  }),
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.uid],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
  agent: one(agents, {
    fields: [chatMessages.agentId],
    references: [agents.id],
  }),
}));
