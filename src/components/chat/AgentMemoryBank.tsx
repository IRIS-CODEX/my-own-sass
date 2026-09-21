import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  Sparkles,
  Database,
  Tag,
  Star,
  CheckCircle2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { Agent } from '../../types';

export interface AgentMemory {
  id: string;
  agentId: string;
  userId?: string | null;
  memoryKey: string;
  memoryValue: string;
  category: string; // 'PREFERENCE' | 'FACT' | 'DIRECTIVE' | 'SUMMARY' | 'GENERAL'
  importanceScore: number;
  contextMetadata?: Record<string, any> | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AgentMemoryBankProps {
  agent: Agent;
  onClose?: () => void;
}

export const AgentMemoryBank: React.FC<AgentMemoryBankProps> = ({ agent, onClose }) => {
  const [memories, setMemories] = useState<AgentMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<'PREFERENCE' | 'FACT' | 'DIRECTIVE' | 'GENERAL'>('FACT');
  const [newImportance, setNewImportance] = useState(7);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/memories`);
      if (res.ok) {
        const data = await res.json();
        setMemories(data || []);
      }
    } catch (e) {
      console.warn('[MemoryBank] Failed to load memories from Cloud SQL:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [agent.id]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memoryKey: newKey.trim(),
          memoryValue: newValue.trim(),
          category: newCategory,
          importanceScore: newImportance,
        }),
      });

      if (res.ok) {
        setNewKey('');
        setNewValue('');
        setIsAdding(false);
        fetchMemories();
      }
    } catch (e) {
      console.error('[MemoryBank] Failed to save memory:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      await fetch(`/api/agents/${agent.id}/memories/${memoryId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('[MemoryBank] Failed to delete memory:', e);
    }
  };

  const filteredMemories = memories.filter(
    (m) =>
      m.memoryKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memoryValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'DIRECTIVE':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'PREFERENCE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'FACT':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#faf8f5] dark:bg-[#181715] border-l border-[#e5e0d5] dark:border-[#33302b] w-80 lg:w-96">
      {/* Header */}
      <div className="p-3.5 border-b border-[#e5e0d5] dark:border-[#33302b] flex items-center justify-between bg-white dark:bg-[#211f1c]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[#d97706] dark:text-[#f59e0b] flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-[#1f1e1b] dark:text-[#f5f3ef]">Memory Bank</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-0.5">
                <Database className="w-2.5 h-2.5" />
                <span>Cloud SQL</span>
              </span>
            </div>
            <p className="text-[10px] text-[#878278] dark:text-[#7d7970] font-medium">
              Long-Term Autonomous Retention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={fetchMemories}
            className="p-1.5 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#878278] dark:text-[#7d7970] transition-colors cursor-pointer"
            title="Refresh from Cloud SQL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#f4f1ea] dark:hover:bg-[#282622] text-[#878278] dark:text-[#7d7970] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search & Add Button */}
      <div className="p-3 border-b border-[#e5e0d5] dark:border-[#33302b] space-y-2 bg-[#faf8f5] dark:bg-[#1c1b18]">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#878278] dark:text-[#7d7970]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent memories..."
              className="w-full bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] placeholder:text-[#878278] dark:placeholder:text-[#7d7970] focus:outline-hidden focus:border-[#d97706] font-medium"
            />
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-2.5 py-1.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Add Memory Form */}
        {isAdding && (
          <form onSubmit={handleAddMemory} className="p-3 bg-white dark:bg-[#211f1c] border border-[#e5e0d5] dark:border-[#33302b] rounded-xl space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#1f1e1b] dark:text-[#f5f3ef] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#d97706]" />
                Store New Agent Memory
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[10px] text-[#878278] hover:text-[#1f1e1b] dark:hover:text-[#f5f3ef]"
              >
                Cancel
              </button>
            </div>

            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Key (e.g. user_preference_tone, main_database)"
              required
              className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-lg px-2.5 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] font-mono focus:outline-hidden focus:border-[#d97706]"
            />

            <textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Memory Value (e.g. Always respond with concise bullet points and SQL query explanations)"
              required
              rows={2}
              className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-lg px-2.5 py-1.5 text-xs text-[#1f1e1b] dark:text-[#f5f3ef] focus:outline-hidden focus:border-[#d97706]"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#878278] block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#faf8f5] dark:bg-[#181715] border border-[#e5e0d5] dark:border-[#33302b] rounded-lg px-2 py-1 text-[11px] text-[#1f1e1b] dark:text-[#f5f3ef]"
                >
                  <option value="FACT">FACT</option>
                  <option value="PREFERENCE">PREFERENCE</option>
                  <option value="DIRECTIVE">DIRECTIVE</option>
                  <option value="GENERAL">GENERAL</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#878278] block mb-1">Importance ({newImportance}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newImportance}
                  onChange={(e) => setNewImportance(parseInt(e.target.value))}
                  className="w-full accent-[#d97706]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-1.5 rounded-lg bg-[#d97706] hover:bg-[#b45309] dark:bg-[#f59e0b] dark:hover:bg-[#fbbf24] text-white dark:text-[#181715] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSaving ? 'Saving to Cloud SQL...' : 'Commit to Cloud SQL Memory'}
            </button>
          </form>
        )}
      </div>

      {/* Memory List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#878278] dark:text-[#7d7970] space-y-2">
            <RefreshCw className="w-5 h-5 mx-auto animate-spin text-[#d97706]" />
            <p>Retrieving memory bank from Cloud SQL...</p>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#878278] dark:text-[#7d7970] space-y-2 bg-white dark:bg-[#211f1c] rounded-xl border border-dashed border-[#e5e0d5] dark:border-[#33302b]">
            <Brain className="w-8 h-8 mx-auto text-[#d97706]/40" />
            <p className="font-bold text-[#1f1e1b] dark:text-[#f5f3ef]">No Memories Stored Yet</p>
            <p className="text-[11px] leading-relaxed">
              As you chat with <span className="font-bold text-[#d97706]">{agent.name}</span>, preferences and facts will be automatically learned and stored in Cloud SQL, or you can add them manually above.
            </p>
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-3 bg-white dark:bg-[#211f1c] rounded-xl border border-[#e5e0d5] dark:border-[#33302b] shadow-xs hover:border-[#d97706]/50 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border ${getCategoryColor(mem.category)}`}>
                    {mem.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1f1e1b] dark:text-[#f5f3ef] truncate max-w-[180px]">
                    {mem.memoryKey}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="flex items-center text-[10px] font-bold text-amber-500 gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{mem.importanceScore}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-1 rounded text-[#878278] hover:text-rose-500 transition-colors cursor-pointer"
                    title="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#5c5850] dark:text-[#b8b4aa] leading-relaxed">
                {mem.memoryValue}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-[#f4f1ea] dark:border-[#282622] text-[10px] text-[#878278] dark:text-[#7d7970] font-mono">
                <span>SQL ID: {mem.id.slice(0, 12)}...</span>
                <span>Active in Prompt</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#e5e0d5] dark:border-[#33302b] bg-white dark:bg-[#211f1c] text-[11px] text-[#878278] dark:text-[#7d7970] space-y-1">
        <div className="flex items-center justify-between font-bold">
          <span>Active Memories</span>
          <span className="text-[#1f1e1b] dark:text-[#f5f3ef] font-mono">{memories.length} records</span>
        </div>
        <p className="text-[10px] leading-tight">
          All memories are automatically appended to Gemini system instructions on each turn.
        </p>
      </div>
    </div>
  );
};
