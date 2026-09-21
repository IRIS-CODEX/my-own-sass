import { db } from '../index.ts';
import { agentExecutions } from '../schema.ts';
import { eq, desc, and } from 'drizzle-orm';

export interface AgentExecutionRecord {
  id: string;
  agentId: string;
  userId?: string | null;
  actionName: string;
  parameters?: any;
  resultData?: any;
  riskLevel?: string;
  status?: string;
  latencyMs?: number | null;
  tokensUsed?: number | null;
  costUsd?: number | null;
  createdAt?: Date | null;
}

export const executionRepository = {
  async logExecution(exec: AgentExecutionRecord): Promise<AgentExecutionRecord> {
    try {
      const rows = await db
        .insert(agentExecutions)
        .values({
          id: exec.id || `exec_${Date.now().toString(36)}`,
          agentId: exec.agentId,
          userId: exec.userId || null,
          actionName: exec.actionName,
          parameters: exec.parameters || null,
          resultData: exec.resultData || null,
          riskLevel: exec.riskLevel || 'GREEN',
          status: exec.status || 'SUCCESS',
          latencyMs: exec.latencyMs || 0,
          tokensUsed: exec.tokensUsed || 0,
          costUsd: exec.costUsd || 0.0,
        })
        .returning();

      return rows[0];
    } catch (error) {
      console.error('[executionRepository] logExecution error:', error);
      throw new Error('Failed to record execution log in Cloud SQL.', { cause: error });
    }
  },

  async listExecutions(agentId?: string, limit = 50): Promise<AgentExecutionRecord[]> {
    try {
      if (agentId) {
        return await db
          .select()
          .from(agentExecutions)
          .where(eq(agentExecutions.agentId, agentId))
          .orderBy(desc(agentExecutions.createdAt))
          .limit(limit);
      }
      return await db.select().from(agentExecutions).orderBy(desc(agentExecutions.createdAt)).limit(limit);
    } catch (error) {
      console.error('[executionRepository] listExecutions error:', error);
      return [];
    }
  },
};
