import { db } from '../index.ts';
import { chatSessions, chatMessages, agents, users } from '../schema.ts';
import { eq, desc, and, asc } from 'drizzle-orm';

export interface ChatMessageRecord {
  id: string;
  sessionId?: string | null;
  agentId: string;
  userId?: string | null;
  sender: string; // 'user' | 'agent' | 'system'
  content: string;
  thoughts?: string[] | null;
  toolCall?: any;
  metrics?: {
    latencyMs?: number;
    tokensUsed?: number;
    costUsd?: number;
  } | null;
  createdAt?: Date | null;
}

export interface ChatSessionRecord {
  id: string;
  agentId: string;
  userId?: string | null;
  title: string;
  isArchived?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export const chatRepository = {
  // Get or create active session for an agent
  async getOrCreateSession(agentId: string, userId?: string, title?: string): Promise<ChatSessionRecord> {
    try {
      const existing = await db
        .select()
        .from(chatSessions)
        .where(
          userId
            ? and(eq(chatSessions.agentId, agentId), eq(chatSessions.userId, userId), eq(chatSessions.isArchived, false))
            : and(eq(chatSessions.agentId, agentId), eq(chatSessions.isArchived, false))
        )
        .orderBy(desc(chatSessions.updatedAt))
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      // Create new session
      const newSessionId = `session_${agentId}_${Date.now().toString(36)}`;
      const created = await db
        .insert(chatSessions)
        .values({
          id: newSessionId,
          agentId,
          userId: userId || null,
          title: title || `Autonomous Session with ${agentId}`,
          isArchived: false,
          updatedAt: new Date(),
        })
        .returning();

      return created[0];
    } catch (error) {
      console.error('[chatRepository] getOrCreateSession error:', error);
      throw new Error('Failed to create or retrieve chat session in database.', { cause: error });
    }
  },

  // Save a message to Cloud SQL
  async saveMessage(msg: ChatMessageRecord): Promise<ChatMessageRecord> {
    try {
      const rows = await db
        .insert(chatMessages)
        .values({
          id: msg.id,
          sessionId: msg.sessionId || null,
          agentId: msg.agentId,
          userId: msg.userId || null,
          sender: msg.sender,
          content: msg.content,
          thoughts: msg.thoughts || [],
          toolCall: msg.toolCall || null,
          metrics: msg.metrics || null,
        })
        .returning();

      if (msg.sessionId) {
        await db
          .update(chatSessions)
          .set({ updatedAt: new Date() })
          .where(eq(chatSessions.id, msg.sessionId));
      }

      return rows[0];
    } catch (error) {
      console.error('[chatRepository] saveMessage error:', error);
      throw new Error('Failed to record message in Cloud SQL database.', { cause: error });
    }
  },

  // Get messages for an agent / session
  async getMessages(agentId: string, sessionId?: string, limit = 100): Promise<ChatMessageRecord[]> {
    try {
      if (sessionId) {
        return await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, sessionId))
          .orderBy(asc(chatMessages.createdAt))
          .limit(limit);
      }

      return await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.agentId, agentId))
        .orderBy(asc(chatMessages.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('[chatRepository] getMessages error:', error);
      throw new Error('Failed to load chat history from Cloud SQL.', { cause: error });
    }
  },

  // Clear or archive conversation for an agent
  async clearMessages(agentId: string, userId?: string): Promise<void> {
    try {
      if (userId) {
        await db
          .delete(chatMessages)
          .where(and(eq(chatMessages.agentId, agentId), eq(chatMessages.userId, userId)));
      } else {
        await db.delete(chatMessages).where(eq(chatMessages.agentId, agentId));
      }
    } catch (error) {
      console.error('[chatRepository] clearMessages error:', error);
      throw new Error('Failed to reset conversation history.', { cause: error });
    }
  },
};
