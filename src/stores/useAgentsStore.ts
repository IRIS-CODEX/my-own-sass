import { create } from 'zustand';
import { Agent, AutonomyMode, AgentArchetype } from '../types';
import {
  subscribeToUserAgents,
  saveAgentToFirestore,
  updateAgentInFirestore,
  deleteAgentFromFirestore,
} from '../lib/firebaseServices';
import { Unsubscribe } from 'firebase/firestore';

interface AgentsState {
  agents: Agent[];
  selectedAgent: Agent | null;
  searchFilter: string;
  autonomyFilter: AutonomyMode | 'ALL';
  isLoading: boolean;
  activeUserId: string | null;
  
  initUserAgents: (userId: string) => () => void;
  setSelectedAgent: (agent: Agent | null) => void;
  setSearchFilter: (filter: string) => void;
  setAutonomyFilter: (filter: AutonomyMode | 'ALL') => void;
  setAutonomyMode: (agentId: string, mode: AutonomyMode) => Promise<void>;
  toggleKillSwitch: (agentId: string) => Promise<void>;
  updateBudget: (agentId: string, budgetUsd: number) => Promise<void>;
  updateSystemPrompt: (agentId: string, prompt: string) => Promise<void>;
  updateModel: (agentId: string, model: string) => Promise<void>;
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'lastActiveAt' | 'spendTodayUsd' | 'totalExecutions'>) => Promise<Agent>;
  createAgentFromPrompt: (userPrompt: string) => Promise<Agent>;
  deleteAgent: (agentId: string) => Promise<void>;
  provisionDefaultFleet: () => Promise<void>;
  provisionGmailAgent: () => Promise<Agent>;
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  agents: [],
  selectedAgent: null,
  searchFilter: '',
  autonomyFilter: 'ALL',
  isLoading: false,
  activeUserId: null,

  initUserAgents: (userId: string) => {
    set({ activeUserId: userId, isLoading: true });
    
    const unsubscribe: Unsubscribe = subscribeToUserAgents(
      userId,
      (agents) => {
        set({
          agents,
          isLoading: false,
          selectedAgent: get().selectedAgent
            ? agents.find((a) => a.id === get().selectedAgent?.id) || agents[0] || null
            : agents[0] || null,
        });
      },
      (error) => {
        console.error('[AgentsStore] Sync error:', error);
        set({ isLoading: false });
      }
    );

    return () => {
      unsubscribe();
    };
  },

  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
  setSearchFilter: (searchFilter) => set({ searchFilter }),
  setAutonomyFilter: (autonomyFilter) => set({ autonomyFilter }),

  setAutonomyMode: async (agentId, mode) => {
    const status = mode === 'PAUSED' ? 'PAUSED' : 'ONLINE';
    const current = get().agents.find((a) => a.id === agentId);
    if (!current) return;

    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, autonomyMode: mode, status } : a
      ),
      selectedAgent:
        state.selectedAgent?.id === agentId
          ? { ...state.selectedAgent, autonomyMode: mode, status }
          : state.selectedAgent,
    }));

    try {
      await updateAgentInFirestore(agentId, { autonomyMode: mode, status });
      const updated = get().agents.find((a) => a.id === agentId);
      if (updated) {
        fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('[AgentsStore] Failed to update autonomy mode in Firestore:', err);
    }
  },

  toggleKillSwitch: async (agentId) => {
    const current = get().agents.find((a) => a.id === agentId);
    if (!current) return;
    const isPaused = current.autonomyMode === 'PAUSED';
    const newMode: AutonomyMode = isPaused ? 'SEMI_AUTO' : 'PAUSED';
    const newStatus = isPaused ? 'ONLINE' : 'PAUSED';

    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, autonomyMode: newMode, status: newStatus } : a
      ),
      selectedAgent:
        state.selectedAgent?.id === agentId
          ? { ...state.selectedAgent, autonomyMode: newMode, status: newStatus }
          : state.selectedAgent,
    }));

    try {
      await updateAgentInFirestore(agentId, { autonomyMode: newMode, status: newStatus });
    } catch (err) {
      console.error('[AgentsStore] Failed to toggle kill switch:', err);
    }
  },

  updateBudget: async (agentId, budgetUsd) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, dailyBudgetUsd: budgetUsd } : a
      ),
    }));
    try {
      await updateAgentInFirestore(agentId, { dailyBudgetUsd: budgetUsd });
    } catch (err) {
      console.error('[AgentsStore] Failed to update budget:', err);
    }
  },

  updateSystemPrompt: async (agentId, prompt) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, systemPrompt: prompt } : a
      ),
    }));
    try {
      await updateAgentInFirestore(agentId, { systemPrompt: prompt });
    } catch (err) {
      console.error('[AgentsStore] Failed to update prompt:', err);
    }
  },

  updateModel: async (agentId, model) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, model } : a
      ),
    }));
    try {
      await updateAgentInFirestore(agentId, { model });
    } catch (err) {
      console.error('[AgentsStore] Failed to update model:', err);
    }
  },

  addAgent: async (newAgentData) => {
    const userId = get().activeUserId || 'guest_user';
    const id = `agent_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newAgent: Agent = {
      ...newAgentData,
      id,
      userId,
      orgId: newAgentData.orgId || 'org_enterprise_fleet',
      createdAt: new Date().toISOString(),
      lastActiveAt: 'Just now',
      spendTodayUsd: 0.0,
      totalExecutions: 0,
    };

    set((state) => ({
      agents: [newAgent, ...state.agents],
      selectedAgent: newAgent,
    }));

    try {
      await saveAgentToFirestore(newAgent);
      // Sync with Google Cloud SQL
      fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
      }).catch((e) => console.warn('[AgentsStore] Cloud SQL sync warning:', e));
    } catch (err) {
      console.error('[AgentsStore] Failed to save new agent in Firestore:', err);
    }

    return newAgent;
  },

  createAgentFromPrompt: async (userPrompt: string) => {
    const userId = get().activeUserId || 'guest_user';
    let synthesized: any = null;

    try {
      const res = await fetch('/api/agents/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      if (res.ok) {
        synthesized = await res.json();
      }
    } catch (e) {
      console.warn('[AgentsStore] Server synthesis fallback:', e);
    }

    const name = synthesized?.name || 'Custom-Governed-Agent';
    const description = synthesized?.description || (userPrompt.length > 120 ? userPrompt.slice(0, 117) + '...' : userPrompt);
    const archetype: AgentArchetype = synthesized?.archetype || 'SUPPORT';
    const model = synthesized?.model || 'gemini-3.8-flash';
    const systemPrompt = synthesized?.systemPrompt || `You are ${name}, a governed autonomous AI agent created in AgentLens.\nMission: ${userPrompt}`;
    const tools = synthesized?.tools || ['search_knowledge_base', 'validate_business_rules', 'execute_action'];
    const suggestedPrompts = synthesized?.suggestedPrompts || [
      'How does your safety governance policy work?',
      'Run a test evaluation based on my request',
      'What tools and actions are you authorized to execute?',
    ];
    const welcomeMessage = synthesized?.welcomeMessage || `Hello! I am ${name}. Mission: "${description}". Ready to assist.`;

    const newAgent = await get().addAgent({
      orgId: 'org_enterprise_fleet',
      userId,
      name,
      description,
      archetype,
      autonomyMode: 'SEMI_AUTO',
      dailyBudgetUsd: synthesized?.dailyBudgetUsd || 25.0,
      systemPrompt,
      model,
      temperature: 0.2,
      status: 'ONLINE',
      framework: 'CrewAI / AgentLens v2.4',
      avatarIcon: archetype === 'CODING' ? 'Code' : archetype === 'DB_REPORTER' ? 'Database' : archetype === 'RESEARCHER' ? 'Brain' : archetype === 'OUTREACH' ? 'Zap' : 'Bot',
      tools,
      suggestedPrompts,
      welcomeMessage,
    });

    return newAgent;
  },

  deleteAgent: async (agentId) => {
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== agentId),
      selectedAgent: state.selectedAgent?.id === agentId ? null : state.selectedAgent,
    }));
    try {
      await deleteAgentFromFirestore(agentId);
      fetch(`/api/agents/${agentId}`, { method: 'DELETE' }).catch(() => {});
    } catch (err) {
      console.error('[AgentsStore] Failed to delete agent from Firestore:', err);
    }
  },

  provisionDefaultFleet: async () => {
    const userId = get().activeUserId || 'guest_user';
    const defaults: Omit<Agent, 'id' | 'createdAt' | 'lastActiveAt' | 'spendTodayUsd' | 'totalExecutions'>[] = [
      {
        userId,
        orgId: 'org_enterprise_fleet',
        name: 'Support-Desk-Sentinel',
        description: 'Handles incoming customer support tickets, refund validations, knowledge base queries, and FAQ search.',
        archetype: 'SUPPORT',
        autonomyMode: 'SEMI_AUTO',
        dailyBudgetUsd: 25.0,
        systemPrompt: 'You are the frontline customer support assistant. Answer queries with empathy and accuracy using the official knowledge base. For refunds over $50, invoke issue_customer_refund which suspends for supervisor approval.',
        model: 'gemini-3.8-flash',
        temperature: 0.2,
        status: 'ONLINE',
        framework: 'CrewAI v0.51',
        avatarIcon: 'Bot',
        tools: ['search_knowledge_base', 'issue_customer_refund', 'check_ticket_status', 'escalate_to_human'],
        suggestedPrompts: [
          'Can you check the status of ticket #49201 for refund of $75?',
          'How do I reset my API key password?',
          'Issue a full refund of $120 for order #ORD-9982 with reason: duplicate charge',
          "What is Acme Corp's cancellation policy for annual plans?",
        ],
        welcomeMessage: 'Hello! I am Support-Desk-Sentinel, your frontline customer support agent. How can I help you today?',
      },
      {
        userId,
        orgId: 'org_enterprise_fleet',
        name: 'Sales-Pipeline-Navigator',
        description: 'Scrapes domain signals, enriches B2B lead profiles, and drafts personalized outbound email sequences.',
        archetype: 'OUTREACH',
        autonomyMode: 'FULL_AUTO',
        dailyBudgetUsd: 35.0,
        systemPrompt: 'You are an autonomous sales development representative. Research inbound contact signups, score company fit, and draft high-converting email sequences.',
        model: 'gemini-3.8-flash',
        temperature: 0.5,
        status: 'ONLINE',
        framework: 'LangGraph v0.2',
        avatarIcon: 'Zap',
        tools: ['enrich_lead_profile', 'score_company_icp', 'draft_sales_email', 'schedule_calendar_demo'],
        suggestedPrompts: [
          'Enrich lead domain stripe.com and find tech stack signals',
          'Draft a personalized outreach email for a VP of Engineering',
          'Score our new inbound lead from enterprise-health.org',
        ],
        welcomeMessage: 'Hey there! I am Sales-Pipeline-Navigator. Give me a target domain or lead profile to begin outreach analysis.',
      },
      {
        userId,
        orgId: 'org_enterprise_fleet',
        name: 'Python-Code-Architect',
        description: 'Reviews pull requests, diagnoses race conditions, writes test cases, and refactors services.',
        archetype: 'CODING',
        autonomyMode: 'SEMI_AUTO',
        dailyBudgetUsd: 40.0,
        systemPrompt: 'You are an expert senior software architect. Analyze code snippets, identify performance bottlenecks, and recommend security hardening.',
        model: 'gemini-3.8-flash',
        temperature: 0.2,
        status: 'ONLINE',
        framework: 'AutoGen v0.4',
        avatarIcon: 'Code',
        tools: ['run_linter_checks', 'generate_unit_tests', 'analyze_ast_security', 'benchmark_algorithm'],
        suggestedPrompts: [
          'Review this async endpoint for unhandled connection leaks',
          'Write comprehensive pytest unit tests for a rate limiter',
          'Optimize this SQL query that is causing high CPU',
        ],
        welcomeMessage: 'Ready to inspect code. I am Python-Code-Architect. Paste your functions or PR diffs to diagnose.',
      },
      {
        userId,
        orgId: 'org_enterprise_fleet',
        name: 'Executive-Gmail-Inbox-Pilot',
        description: 'Autonomous AI inbox copilot that reads, categorizes, drafts smart replies, and manages your personal Gmail under zero-trust governance.',
        archetype: 'RESEARCHER',
        autonomyMode: 'SEMI_AUTO',
        dailyBudgetUsd: 30.0,
        systemPrompt: 'You are the Executive Gmail Inbox Pilot. You assist the user with managing their personal Gmail inbox. You can search, read unread threads, summarize key emails, categorize inbox priorities, and draft contextual email replies. Always request explicit confirmation before sending external messages or making destructive inbox changes.',
        model: 'gemini-3.8-flash',
        temperature: 0.2,
        status: 'ONLINE',
        framework: 'LangGraph v0.2 / Gmail-API',
        avatarIcon: 'Brain',
        tools: ['gmail_list_messages', 'gmail_read_thread', 'gmail_draft_reply', 'gmail_send_message', 'gmail_summarize_unread', 'gmail_categorize_inbox'],
        suggestedPrompts: [
          'Scan my Gmail inbox and summarize my top 5 unread emails',
          'Draft a polite follow-up email to my last conversation',
          'Categorize my unread emails into Urgent, Inquiries, and Newsletters',
          'Help me compose a project status update email',
        ],
        welcomeMessage: 'Hello! I am your Executive Gmail Inbox Pilot. Connect your personal Gmail account to let me summarize unread threads, draft smart responses, and organize your inbox.',
      },
    ];

    for (const def of defaults) {
      await get().addAgent(def);
    }
  },

  provisionGmailAgent: async () => {
    const userId = get().activeUserId || 'guest_user';
    const existing = get().agents.find((a) => a.name.toLowerCase().includes('gmail'));
    if (existing) {
      set({ selectedAgent: existing });
      return existing;
    }

    const newAgent = await get().addAgent({
      orgId: 'org_enterprise_fleet',
      userId,
      name: 'Executive-Gmail-Inbox-Pilot',
      description: 'Autonomous AI inbox copilot that reads, categorizes, drafts smart replies, and manages your personal Gmail under zero-trust governance.',
      archetype: 'RESEARCHER',
      autonomyMode: 'SEMI_AUTO',
      dailyBudgetUsd: 30.0,
      systemPrompt: 'You are the Executive Gmail Inbox Pilot. You assist the user with managing their personal Gmail inbox. You can search, read unread threads, summarize key emails, categorize inbox priorities, and draft contextual email replies. Always request explicit confirmation before sending external messages or making destructive inbox changes.',
      model: 'gemini-3.8-flash',
      temperature: 0.2,
      status: 'ONLINE',
      framework: 'LangGraph v0.2 / Gmail-API',
      avatarIcon: 'Brain',
      tools: ['gmail_list_messages', 'gmail_read_thread', 'gmail_draft_reply', 'gmail_send_message', 'gmail_summarize_unread', 'gmail_categorize_inbox'],
      suggestedPrompts: [
        'Scan my Gmail inbox and summarize my top 5 unread emails',
        'Draft a polite follow-up email to my last conversation',
        'Categorize my unread emails into Urgent, Inquiries, and Newsletters',
        'Help me compose a project status update email',
      ],
      welcomeMessage: 'Hello! I am your Executive Gmail Inbox Pilot. Connect your personal Gmail account to let me summarize unread threads, draft smart responses, and organize your inbox.',
    });

    set({ selectedAgent: newAgent });
    return newAgent;
  },
}));
