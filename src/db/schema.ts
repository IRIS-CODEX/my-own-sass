import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table for users registered or managed on the platform
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or internal tenant ID
  email: text('email').notNull(),
  displayName: text('display_name'),
  organizationName: text('organization_name'),
  role: text('role').default('owner'), // 'owner', 'super-admin', 'admin', 'developer', 'viewer'
  authProvider: text('auth_provider').default('email'), // 'google', 'email', 'demo', 'admin'
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
});

// Subscriptions table storing the plan chosen by each registered user
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  tenantId: text('tenant_id').notNull(),
  planTier: text('plan_tier').notNull().default('PRO_MONTHLY'), // 'FREE', 'STARTER', 'PRO_MONTHLY', 'PRO_YEARLY', 'ENTERPRISE'
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE', 'PAST_DUE', 'TRIALING', 'CANCELLED', 'SUSPENDED'
  monthlyPriceUsd: integer('monthly_price_usd').notNull().default(199),
  totalPaidLtvUsd: integer('total_paid_ltv_usd').notNull().default(199),
  unpaidBalanceUsd: integer('unpaid_balance_usd').notNull().default(0),
  billingInterval: text('billing_interval').notNull().default('monthly'), // 'monthly', 'yearly'
  currentPeriodStart: timestamp('current_period_start').defaultNow(),
  currentPeriodEnd: timestamp('current_period_end'),
  paymentMethod: text('payment_method').default('MASTERCARD'), // 'MASTERCARD', 'VISA', 'PAYPAL'
  cardLast4: text('card_last4').default('8812'),
  dunningSentCount: integer('dunning_sent_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Quotas & Fleet usage allocation for each user/subscription
export const usageQuotas = pgTable('usage_quotas', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  subscriptionId: integer('subscription_id')
    .references(() => subscriptions.id),
  requestLimit: integer('request_limit').notNull().default(250000),
  requestsUsed: integer('requests_used').notNull().default(0),
  activeAgentsCount: integer('active_agents_count').notNull().default(5),
  virtualKeysCount: integer('virtual_keys_count').notNull().default(4),
  lastCalculatedAt: timestamp('last_calculated_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many, one }) => ({
  subscriptions: many(subscriptions),
  usageQuota: one(usageQuotas, {
    fields: [users.id],
    references: [usageQuotas.userId],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  quota: one(usageQuotas, {
    fields: [subscriptions.id],
    references: [usageQuotas.subscriptionId],
  }),
}));

export const usageQuotasRelations = relations(usageQuotas, ({ one }) => ({
  user: one(users, {
    fields: [usageQuotas.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [usageQuotas.subscriptionId],
    references: [subscriptions.id],
  }),
}));
