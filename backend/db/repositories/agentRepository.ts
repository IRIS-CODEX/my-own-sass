import { db } from '../index.ts';
import { agents, users } from '../schema.ts';
import { eq, desc, and } from 'drizzle-orm';

export interface AgentRecord {
  id: string;
  userId?: string | null;
  orgId: string;
  name: string;
  description: string;
  archetype: string;
  autonomyMode: string;
  dailyBudgetUsd: number;
  spendTodayUsd: number;
  totalExecutions: number;
  systemPrompt: string;
  model: string;
  temperature: number;
  status: string;
  framework: string;
  avatarIcon?: string | null;
  welcomeMessage?: string | null;
  tools?: string[] | null;
  suggestedPrompts?: string[] | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export const agentRepository = {
  // Find all agents for a user or org
  async listAgents(userId?: string, orgId = 'org-main'): Promise<AgentRecord[]> {
    try {
      if (userId) {
        return await db
          .select()
          .from(agents)
          .where(and(eq(agents.userId, userId), eq(agents.orgId, orgId)))
          .orderBy(desc(agents.createdAt));
      }
      return await db.select().from(agents).orderBy(desc(agents.createdAt));
    } catch (error) {
      console.error('[agentRepository] listAgents error:', error);
      throw new Error('Failed to retrieve agents from Cloud SQL database.', { cause: error });
    }
  },

  // Get single agent by ID
  async getAgentById(id: string): Promise<AgentRecord | null> {
    try {
      const rows = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
      return rows[0] || null;
    } catch (error) {
      console.error('[agentRepository] getAgentById error:', error);
      throw new Error(`Failed to find agent ${id} in database.`, { cause: error });
    }
  },

  // Create or Upsert an agent
  async upsertAgent(agentData: AgentRecord): Promise<AgentRecord> {
    try {
      // Ensure user exists if userId provided
      if (agentData.userId) {
        await db
          .insert(users)
          .values({
            uid: agentData.userId,
            email: `${agentData.userId}@agentlens.internal`,
            displayName: agentData.userId,
          })
          .onConflictDoNothing();
      }

      const rows = await db
        .insert(agents)
        .values({
          id: agentData.id,
          userId: agentData.userId || null,
          orgId: agentData.orgId || 'org-main',
          name: agentData.name,
          description: agentData.description,
          archetype: agentData.archetype || 'CUSTOM',
          autonomyMode: agentData.autonomyMode || 'SEMI_AUTO',
          dailyBudgetUsd: agentData.dailyBudgetUsd || 25.0,
          spendTodayUsd: agentData.spendTodayUsd || 0.0,
          totalExecutions: agentData.totalExecutions || 0,
          systemPrompt: agentData.systemPrompt,
          model: agentData.model || 'gemini-2.5-flash',
          temperature: agentData.temperature ?? 0.3,
          status: agentData.status || 'ONLINE',
          framework: agentData.framework || 'Gemini 2.5 Multi-Tool',
          avatarIcon: agentData.avatarIcon || null,
          welcomeMessage: agentData.welcomeMessage || null,
          tools: agentData.tools || [],
          suggestedPrompts: agentData.suggestedPrompts || [],
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: agents.id,
          set: {
            name: agentData.name,
            description: agentData.description,
            archetype: agentData.archetype,
            autonomyMode: agentData.autonomyMode,
            dailyBudgetUsd: agentData.dailyBudgetUsd,
            spendTodayUsd: agentData.spendTodayUsd,
            totalExecutions: agentData.totalExecutions,
            systemPrompt: agentData.systemPrompt,
            model: agentData.model,
            temperature: agentData.temperature,
            status: agentData.status,
            framework: agentData.framework,
            avatarIcon: agentData.avatarIcon,
            welcomeMessage: agentData.welcomeMessage,
            tools: agentData.tools,
            suggestedPrompts: agentData.suggestedPrompts,
            updatedAt: new Date(),
          },
        })
        .returning();

      return rows[0];
    } catch (error) {
      console.error('[agentRepository] upsertAgent error:', error);
      throw new Error(`Failed to persist agent ${agentData.name} to Cloud SQL.`, { cause: error });
    }
  },

  // Delete agent
  async deleteAgent(id: string): Promise<boolean> {
    try {
      const res = await db.delete(agents).where(eq(agents.id, id)).returning();
      return res.length > 0;
    } catch (error) {
      console.error('[agentRepository] deleteAgent error:', error);
      throw new Error(`Failed to delete agent ${id} from database.`, { cause: error });
    }
  },

  // Increment execution count and spend
  async recordExecutionSpend(id: string, costUsd: number): Promise<void> {
    try {
      const current = await this.getAgentById(id);
      if (current) {
        await db
          .update(agents)
          .set({
            totalExecutions: (current.totalExecutions || 0) + 1,
            spendTodayUsd: (current.spendTodayUsd || 0) + costUsd,
            updatedAt: new Date(),
          })
          .where(eq(agents.id, id));
      }
    } catch (error) {
      console.error('[agentRepository] recordExecutionSpend error:', error);
    }
  },
};
