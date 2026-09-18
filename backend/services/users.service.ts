import { db } from '../db/index.ts';
import { users, subscriptions, usageQuotas } from '../db/schema.ts';
import { UserSubscriptionPayload } from '../db/types.ts';
import { eq, desc } from 'drizzle-orm';

const PLAN_PRICE_MAP: Record<string, number> = {
  FREE: 0,
  STARTER: 49,
  PRO_MONTHLY: 199,
  PRO_YEARLY: 179,
  ENTERPRISE: 599,
};

const PLAN_LIMIT_MAP: Record<string, number> = {
  FREE: 25000,
  STARTER: 100000,
  PRO_MONTHLY: 250000,
  PRO_YEARLY: 500000,
  ENTERPRISE: 2000000,
};

export class UsersService {
  /**
   * Retrieves all users and their attached subscription plans & quota metrics
   */
  static async getAllUsersWithSubscriptions() {
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
      console.error('UsersService.getAllUsersWithSubscriptions failed:', error);
      throw new Error('Database query failed. Please try again later.', { cause: error });
    }
  }

  /**
   * Upsert a user, update or insert their active subscription, and configure their quota pool
   */
  static async upsertUserAndSubscription(payload: UserSubscriptionPayload) {
    try {
      const email = payload.email.trim();
      const displayName = payload.displayName || email.split('@')[0];
      const authProvider = payload.authProvider || (email.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email');
      const planTier = payload.planTier || 'PRO_MONTHLY';
      const monthlyPrice = payload.monthlyPriceUsd ?? (PLAN_PRICE_MAP[planTier] || 199);
      const reqLimit = payload.requestLimit || (PLAN_LIMIT_MAP[planTier] || 250000);

      // 1. Upsert User
      const [userRecord] = await db
        .insert(users)
        .values({
          uid: payload.uid,
          email,
          displayName,
          organizationName: payload.organizationName || 'Autonomous Fleet',
          role: payload.role || 'owner',
          authProvider,
          lastLoginAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email,
            displayName,
            organizationName: payload.organizationName || 'Autonomous Fleet',
            role: payload.role || 'owner',
            authProvider,
            lastLoginAt: new Date(),
          },
        })
        .returning();

      // 2. Upsert Subscription
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

      // 3. Upsert Quota Allocation
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
      console.error('UsersService.upsertUserAndSubscription failed:', error);
      throw new Error('Database operation failed. Please try again later.', { cause: error });
    }
  }

  /**
   * Seed initial admin users if database is empty
   */
  static async seedInitialUsersIfEmpty() {
    const existing = await db.select().from(users).limit(1);
    if (existing.length === 0) {
      await this.upsertUserAndSubscription({
        uid: 'uid-hamudi-001',
        email: 'hamudijems4@gmail.com',
        displayName: 'Hamudi Jems (Super Admin)',
        organizationName: 'Autonomous Agent Fleet HQ',
        role: 'super-admin',
        authProvider: 'google',
        planTier: 'PRO_MONTHLY',
        monthlyPriceUsd: 199,
        billingInterval: 'monthly',
        status: 'ACTIVE',
        requestLimit: 250000,
        requestsUsed: 42390,
        activeAgentsCount: 5,
        virtualKeysCount: 4,
      });

      await this.upsertUserAndSubscription({
        uid: 'uid-sarah-002',
        email: 'sarah.chen@novabiotech.io',
        displayName: 'Sarah Chen (Lead Scientist)',
        organizationName: 'Nova BioTech Labs',
        role: 'owner',
        authProvider: 'email',
        planTier: 'ENTERPRISE',
        monthlyPriceUsd: 599,
        billingInterval: 'monthly',
        status: 'ACTIVE',
        requestLimit: 2000000,
        requestsUsed: 310500,
        activeAgentsCount: 18,
        virtualKeysCount: 12,
      });
    }
  }
}
