import { db } from './index.ts';
import { users, subscriptions, usageQuotas } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export interface UserSubscriptionPayload {
  uid: string;
  email: string;
  displayName?: string;
  organizationName?: string;
  role?: string;
  authProvider?: string;
  planTier?: string;
  monthlyPriceUsd?: number;
  billingInterval?: string;
  paymentMethod?: string;
  cardLast4?: string;
  status?: string;
  requestLimit?: number;
  requestsUsed?: number;
  activeAgentsCount?: number;
  virtualKeysCount?: number;
}

export async function getAllUsersWithSubscriptions() {
  try {
    const userRecords = await db.select().from(users).orderBy(desc(users.id));
    const subRecords = await db.select().from(subscriptions);
    const quotaRecords = await db.select().from(usageQuotas);

    return userRecords.map((u, idx) => {
      const sub = subRecords.find((s) => s.userId === u.id);
      const quota = quotaRecords.find((q) => q.userId === u.id);
      return {
        number: idx + 1,
        id: u.id,
        uid: u.uid,
        email: u.email,
        displayName: u.displayName || 'AgentLens User',
        organizationName: u.organizationName || 'Autonomous Fleet',
        role: u.role || 'owner',
        authProvider: u.authProvider || 'email',
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        subscription: sub
          ? {
              id: sub.id,
              tenantId: sub.tenantId,
              planTier: sub.planTier,
              status: sub.status,
              monthlyPriceUsd: sub.monthlyPriceUsd,
              totalPaidLtvUsd: sub.totalPaidLtvUsd,
              unpaidBalanceUsd: sub.unpaidBalanceUsd,
              billingInterval: sub.billingInterval,
              paymentMethod: sub.paymentMethod,
              cardLast4: sub.cardLast4,
              currentPeriodStart: sub.currentPeriodStart,
              currentPeriodEnd: sub.currentPeriodEnd,
            }
          : {
              planTier: 'PRO_MONTHLY',
              status: 'ACTIVE',
              monthlyPriceUsd: 199,
              totalPaidLtvUsd: 199,
              unpaidBalanceUsd: 0,
              billingInterval: 'monthly',
              paymentMethod: 'MASTERCARD',
              cardLast4: '8812',
            },
        quota: quota
          ? {
              requestLimit: quota.requestLimit,
              requestsUsed: quota.requestsUsed,
              activeAgentsCount: quota.activeAgentsCount,
              virtualKeysCount: quota.virtualKeysCount,
            }
          : {
              requestLimit: 250000,
              requestsUsed: 42390,
              activeAgentsCount: 5,
              virtualKeysCount: 4,
            },
      };
    });
  } catch (error) {
    console.error('Failed to query users with subscriptions from Cloud SQL:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function upsertUserAndSubscription(payload: UserSubscriptionPayload) {
  try {
    // 1. Upsert User
    const [userRecord] = await db
      .insert(users)
      .values({
        uid: payload.uid,
        email: payload.email,
        displayName: payload.displayName || payload.email.split('@')[0],
        organizationName: payload.organizationName || 'Autonomous Fleet',
        role: payload.role || 'owner',
        authProvider: payload.authProvider || (payload.email.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email'),
        lastLoginAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: payload.email,
          displayName: payload.displayName || payload.email.split('@')[0],
          organizationName: payload.organizationName || 'Autonomous Fleet',
          role: payload.role || 'owner',
          authProvider: payload.authProvider || (payload.email.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email'),
          lastLoginAt: new Date(),
        },
      })
      .returning();

    const planTier = payload.planTier || 'PRO_MONTHLY';
    const priceMap: Record<string, number> = {
      FREE: 0,
      STARTER: 49,
      PRO_MONTHLY: 199,
      PRO_YEARLY: 179,
      ENTERPRISE: 599,
    };
    const monthlyPrice = payload.monthlyPriceUsd ?? (priceMap[planTier] || 199);

    // 2. Check if subscription exists for this user
    const existingSubs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userRecord.id));

    let subRecord;
    if (existingSubs.length > 0) {
      const [updated] = await db
        .update(subscriptions)
        .set({
          planTier,
          monthlyPriceUsd: monthlyPrice,
          status: payload.status || 'ACTIVE',
          billingInterval: payload.billingInterval || 'monthly',
          paymentMethod: payload.paymentMethod || 'MASTERCARD',
          cardLast4: payload.cardLast4 || '8812',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existingSubs[0].id))
        .returning();
      subRecord = updated;
    } else {
      const [created] = await db
        .insert(subscriptions)
        .values({
          userId: userRecord.id,
          tenantId: `tenant-${userRecord.uid.substring(0, 8)}`,
          planTier,
          status: payload.status || 'ACTIVE',
          monthlyPriceUsd: monthlyPrice,
          totalPaidLtvUsd: monthlyPrice,
          unpaidBalanceUsd: 0,
          billingInterval: payload.billingInterval || 'monthly',
          paymentMethod: payload.paymentMethod || 'MASTERCARD',
          cardLast4: payload.cardLast4 || '8812',
        })
        .returning();
      subRecord = created;
    }

    // 3. Upsert Quota allocation
    const limitMap: Record<string, number> = {
      FREE: 25000,
      STARTER: 100000,
      PRO_MONTHLY: 250000,
      PRO_YEARLY: 500000,
      ENTERPRISE: 2000000,
    };
    const reqLimit = payload.requestLimit || limitMap[planTier] || 250000;

    const existingQuotas = await db
      .select()
      .from(usageQuotas)
      .where(eq(usageQuotas.userId, userRecord.id));

    if (existingQuotas.length > 0) {
      await db
        .update(usageQuotas)
        .set({
          requestLimit: reqLimit,
          requestsUsed: payload.requestsUsed ?? existingQuotas[0].requestsUsed,
          activeAgentsCount: payload.activeAgentsCount ?? existingQuotas[0].activeAgentsCount,
          virtualKeysCount: payload.virtualKeysCount ?? existingQuotas[0].virtualKeysCount,
          lastCalculatedAt: new Date(),
        })
        .where(eq(usageQuotas.id, existingQuotas[0].id));
    } else {
      await db.insert(usageQuotas).values({
        userId: userRecord.id,
        subscriptionId: subRecord.id,
        requestLimit: reqLimit,
        requestsUsed: payload.requestsUsed ?? 0,
        activeAgentsCount: payload.activeAgentsCount ?? (planTier === 'ENTERPRISE' ? 25 : 5),
        virtualKeysCount: payload.virtualKeysCount ?? (planTier === 'ENTERPRISE' ? 12 : 4),
      });
    }

    return {
      user: userRecord,
      subscription: subRecord,
    };
  } catch (error) {
    console.error('Failed to upsert user and subscription in Cloud SQL:', error);
    throw new Error('Database operation failed. Please try again later.', { cause: error });
  }
}
