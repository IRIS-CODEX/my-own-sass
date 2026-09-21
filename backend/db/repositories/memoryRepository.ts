import { db } from '../index.ts';
import { agentMemories, users } from '../schema.ts';
import { eq, desc, and, sql, ilike } from 'drizzle-orm';

export interface AgentMemoryRecord {
  id: string;
  agentId: string;
  userId?: string | null;
  memoryKey: string;
  memoryValue: string;
  category: string; // 'PREFERENCE' | 'FACT' | 'DIRECTIVE' | 'SUMMARY' | 'GENERAL'
  importanceScore: number; // 1 to 10
  contextMetadata?: Record<string, any> | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export const memoryRepository = {
  // Store or update a semantic memory for an agent
  async upsertMemory(mem: AgentMemoryRecord): Promise<AgentMemoryRecord> {
    try {
      const rows = await db
        .insert(agentMemories)
        .values({
          id: mem.id,
          agentId: mem.agentId,
          userId: mem.userId || null,
          memoryKey: mem.memoryKey,
          memoryValue: mem.memoryValue,
          category: mem.category || 'GENERAL',
          importanceScore: mem.importanceScore ?? 5,
          contextMetadata: mem.contextMetadata || {},
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: agentMemories.id,
          set: {
            memoryKey: mem.memoryKey,
            memoryValue: mem.memoryValue,
            category: mem.category,
            importanceScore: mem.importanceScore,
            contextMetadata: mem.contextMetadata,
            updatedAt: new Date(),
          },
        })
        .returning();

      return rows[0];
    } catch (error) {
      console.error('[memoryRepository] upsertMemory error:', error);
      throw new Error('Failed to record memory in Cloud SQL.', { cause: error });
    }
  },

  // Get all active memories for an agent to inject into AI reasoning context
  async getMemoriesForAgent(agentId: string, userId?: string, limit = 20): Promise<AgentMemoryRecord[]> {
    try {
      if (userId) {
        return await db
          .select()
          .from(agentMemories)
          .where(and(eq(agentMemories.agentId, agentId), eq(agentMemories.userId, userId)))
          .orderBy(desc(agentMemories.importanceScore), desc(agentMemories.updatedAt))
          .limit(limit);
      }

      return await db
        .select()
        .from(agentMemories)
        .where(eq(agentMemories.agentId, agentId))
        .orderBy(desc(agentMemories.importanceScore), desc(agentMemories.updatedAt))
        .limit(limit);
    } catch (error) {
      console.error('[memoryRepository] getMemoriesForAgent error:', error);
      throw new Error('Failed to retrieve agent memories from Cloud SQL.', { cause: error });
    }
  },

  // Search memories by keyword
  async searchMemories(agentId: string, query: string): Promise<AgentMemoryRecord[]> {
    try {
      return await db
        .select()
        .from(agentMemories)
        .where(
          and(
            eq(agentMemories.agentId, agentId),
            ilike(agentMemories.memoryValue, `%${query}%`)
          )
        )
        .orderBy(desc(agentMemories.importanceScore))
        .limit(10);
    } catch (error) {
      console.error('[memoryRepository] searchMemories error:', error);
      return [];
    }
  },

  // Delete a memory
  async deleteMemory(id: string): Promise<boolean> {
    try {
      const res = await db.delete(agentMemories).where(eq(agentMemories.id, id)).returning();
      return res.length > 0;
    } catch (error) {
      console.error('[memoryRepository] deleteMemory error:', error);
      throw new Error('Failed to delete memory.', { cause: error });
    }
  },

  // Format memories as prompt context
  formatMemoriesForPrompt(memories: AgentMemoryRecord[]): string {
    if (!memories || memories.length === 0) return '';
    const formatted = memories
      .map((m) => `- [${m.category}] ${m.memoryKey}: ${m.memoryValue} (Importance: ${m.importanceScore}/10)`)
      .join('\n');
    return `\n\n### LONG-TERM AGENT MEMORY BANK (From Google Cloud SQL):\n${formatted}\nUse these stored memories and user preferences to personalize actions and retain conversational memory.`;
  },
};
