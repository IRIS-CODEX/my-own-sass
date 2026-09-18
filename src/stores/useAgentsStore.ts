import { create } from 'zustand';
import { Agent, AutonomyMode, AgentArchetype } from '../types';

interface AgentsState {
  agents: Agent[];
  selectedAgent: Agent | null;
  searchFilter: string;
  autonomyFilter: AutonomyMode | 'ALL';
  
  setSelectedAgent: (agent: Agent | null) => void;
  setSearchFilter: (filter: string) => void;
  setAutonomyFilter: (filter: AutonomyMode | 'ALL') => void;
  setAutonomyMode: (agentId: string, mode: AutonomyMode) => void;
  toggleKillSwitch: (agentId: string) => void;
  updateBudget: (agentId: string, budgetUsd: number) => void;
  updateSystemPrompt: (agentId: string, prompt: string) => void;
  updateModel: (agentId: string, model: string) => void;
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'lastActiveAt' | 'spendTodayUsd' | 'totalExecutions'>) => Agent;
  createAgentFromPrompt: (userPrompt: string) => Agent;
  deleteAgent: (agentId: string) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'agentlens_stored_agents_v1';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent_support_01',
    orgId: 'org_enterprise_9981a',
    name: 'Support-Desk-Sentinel',
    description: 'Handles incoming customer support tickets, refund validations, knowledge base queries, and FAQ search.',
    archetype: 'SUPPORT',
    autonomyMode: 'SEMI_AUTO',
    dailyBudgetUsd: 25.00,
    spendTodayUsd: 8.42,
    totalExecutions: 3840,
    systemPrompt: 'You are the frontline customer support assistant for Acme Corp. Answer queries with empathy and accuracy using the official knowledge base. For refunds over $50, invoke issue_customer_refund which suspends for supervisor approval.',
    model: 'gpt-4o-mini',
    temperature: 0.2,
    status: 'ONLINE',
    createdAt: '2026-08-14T10:00:00Z',
    lastActiveAt: 'Just now',
    framework: 'CrewAI v0.51',
    avatarIcon: 'Bot',
    tools: ['search_knowledge_base', 'issue_customer_refund', 'check_ticket_status', 'escalate_to_human'],
    suggestedPrompts: [
      'Can you check the status of ticket #49201 for refund of $75?',
      'How do I reset my API key password?',
      'Issue a full refund of $120 for order #ORD-9982 with reason: duplicate charge',
      'What is Acme Corp\'s cancellation policy for annual plans?'
    ],
    welcomeMessage: 'Hello! I am Support-Desk-Sentinel, your frontline customer support agent. I can look up knowledge articles, verify order statuses, and process authorized refunds. How can I help you today?'
  },
  {
    id: 'agent_sales_02',
    orgId: 'org_enterprise_9981a',
    name: 'Sales-Pipeline-Navigator',
    description: 'Scrapes domain signals, enriches B2B lead profiles, and drafts personalized outbound email sequences.',
    archetype: 'OUTREACH',
    autonomyMode: 'FULL_AUTO',
    dailyBudgetUsd: 35.00,
    spendTodayUsd: 14.19,
    totalExecutions: 1920,
    systemPrompt: 'You are an autonomous sales development representative. Research inbound contact signups, score company fit, and draft high-converting email sequences while respecting anti-spam guardrails.',
    model: 'claude-3-5-haiku',
    temperature: 0.5,
    status: 'ONLINE',
    createdAt: '2026-08-18T14:20:00Z',
    lastActiveAt: '2 mins ago',
    framework: 'LangGraph v0.2',
    avatarIcon: 'Zap',
    tools: ['enrich_lead_profile', 'score_company_icp', 'draft_sales_email', 'schedule_calendar_demo'],
    suggestedPrompts: [
      'Enrich lead domain stripe.com and find tech stack signals',
      'Draft a personalized outreach email for a VP of Engineering at a fintech startup',
      'Score our new inbound lead from enterprise-health.org',
      'Generate a 3-touch cadence for dormant trial accounts'
    ],
    welcomeMessage: 'Hey there! I am Sales-Pipeline-Navigator. Give me a target domain or lead profile, and I will analyze intent signals, check ICP fit, and craft high-impact outreach.'
  },
  {
    id: 'agent_research_03',
    orgId: 'org_enterprise_9981a',
    name: 'Financial-SEC-Auditor',
    description: 'Analyzes quarterly 10-K & 10-Q filings, parses earnings call transcripts, and tabulates liquidity ratios.',
    archetype: 'RESEARCHER',
    autonomyMode: 'READ_ONLY',
    dailyBudgetUsd: 50.00,
    spendTodayUsd: 29.80,
    totalExecutions: 850,
    systemPrompt: 'You are a read-only financial analysis engine. Query the SEC EDGAR vector database, compute EBITDA multiples, and summarize liquidity ratios without executing any live trades or market orders.',
    model: 'gpt-4o',
    temperature: 0.1,
    status: 'BUSY',
    createdAt: '2026-08-22T08:15:00Z',
    lastActiveAt: '12 mins ago',
    framework: 'LlamaIndex v0.11',
    avatarIcon: 'Brain',
    tools: ['fetch_sec_filings', 'calculate_financial_ratios', 'parse_earnings_transcript', 'generate_dcf_summary'],
    suggestedPrompts: [
      'Summarize Apple\'s latest 10-K liquidity ratio and operating cash flow',
      'Compare operating margins of Microsoft vs Alphabet for the last fiscal year',
      'Audit the debt-to-equity ratio of Tesla and highlight risk disclosures',
      'What were the primary risk factors listed in the latest Nvidia quarterly filing?'
    ],
    welcomeMessage: 'Greetings. I am Financial-SEC-Auditor. I provide structured, verifiable financial intelligence from SEC filings, earnings transcripts, and balance sheet disclosures. Which company shall we audit?'
  },
  {
    id: 'agent_db_04',
    orgId: 'org_enterprise_9981a',
    name: 'Database-Telemetry-Reporter',
    description: 'Generates daily metrics reports by running read-only SQL queries on read replicas, blocking schema DDL.',
    archetype: 'DB_REPORTER',
    autonomyMode: 'SEMI_AUTO',
    dailyBudgetUsd: 15.00,
    spendTodayUsd: 3.10,
    totalExecutions: 490,
    systemPrompt: 'Generate analytical rollups for executive standup. Any queries touching customer PII or modifying schema (DROP, ALTER, DELETE) must be blocked immediately by safety policies.',
    model: 'gpt-4o-mini',
    temperature: 0.0,
    status: 'ONLINE',
    createdAt: '2026-09-02T11:00:00Z',
    lastActiveAt: '1 hour ago',
    framework: 'Custom SDK',
    avatarIcon: 'Database',
    tools: ['execute_readonly_sql', 'get_database_schema', 'generate_query_explain', 'compute_standup_metrics'],
    suggestedPrompts: [
      'Run a query to count active subscriptions per plan tier this week',
      'What are our top 5 slowest database queries in the last 24 hours?',
      'Generate daily active user (DAU) retention metrics for September',
      'Show me table schema for customer_events and indexes'
    ],
    welcomeMessage: 'Connected to read replica pool. I am Database-Telemetry-Reporter, ready to run safe analytical queries, compute retention cohorts, and summarize system metrics.'
  },
  {
    id: 'agent_code_05',
    orgId: 'org_enterprise_9981a',
    name: 'Python-Code-Architect',
    description: 'Reviews pull requests, diagnoses race conditions, writes test cases, and refactors TypeScript & Python services.',
    archetype: 'CODING',
    autonomyMode: 'SEMI_AUTO',
    dailyBudgetUsd: 40.00,
    spendTodayUsd: 12.50,
    totalExecutions: 1140,
    systemPrompt: 'You are an expert senior software architect. Analyze code snippets, identify performance bottlenecks, write idiomatic unit tests, and recommend security hardening for API services.',
    model: 'claude-3-5-sonnet',
    temperature: 0.2,
    status: 'ONLINE',
    createdAt: '2026-09-05T09:30:00Z',
    lastActiveAt: '5 mins ago',
    framework: 'AutoGen v0.4',
    avatarIcon: 'Code',
    tools: ['run_linter_checks', 'generate_unit_tests', 'analyze_ast_security', 'benchmark_algorithm'],
    suggestedPrompts: [
      'Review this async FastAPI endpoint for potential unhandled connection leaks',
      'Write comprehensive pytest unit tests for a token bucket rate limiter',
      'Optimize this SQL query that is causing high CPU on PostgreSQL',
      'Refactor this React hook to prevent redundant re-renders on state update'
    ],
    welcomeMessage: 'Ready to inspect code. I am Python-Code-Architect. Paste your functions, PR diffs, or architecture questions, and I will diagnose issues and write clean tests.'
  }
];

// Load persisted agents from localStorage if available
function loadInitialAgents(): Agent[] {
  if (typeof window === 'undefined') return INITIAL_AGENTS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved agents from localStorage', e);
  }
  return INITIAL_AGENTS;
}

function persistAgents(agents: Agent[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch (e) {
    console.error('Failed to save agents to localStorage', e);
  }
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  agents: loadInitialAgents(),
  selectedAgent: null,
  searchFilter: '',
  autonomyFilter: 'ALL',

  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
  setSearchFilter: (searchFilter) => set({ searchFilter }),
  setAutonomyFilter: (autonomyFilter) => set({ autonomyFilter }),

  setAutonomyMode: (agentId, mode) => {
    set((state) => {
      const updated: Agent[] = state.agents.map((a) =>
        a.id === agentId
          ? {
              ...a,
              autonomyMode: mode,
              status: (mode === 'PAUSED' ? 'PAUSED' : 'ONLINE') as Agent['status'],
            }
          : a
      );
      persistAgents(updated);
      return {
        agents: updated,
        selectedAgent:
          state.selectedAgent?.id === agentId
            ? {
                ...state.selectedAgent,
                autonomyMode: mode,
                status: (mode === 'PAUSED' ? 'PAUSED' : 'ONLINE') as Agent['status'],
              }
            : state.selectedAgent,
      };
    });
  },

  toggleKillSwitch: (agentId) => {
    set((state) => {
      const updated: Agent[] = state.agents.map((a) => {
        if (a.id === agentId) {
          const isPaused = a.autonomyMode === 'PAUSED';
          const newMode: AutonomyMode = isPaused ? 'SEMI_AUTO' : 'PAUSED';
          return {
            ...a,
            autonomyMode: newMode,
            status: (isPaused ? 'ONLINE' : 'PAUSED') as Agent['status'],
          };
        }
        return a;
      });
      persistAgents(updated);
      return { agents: updated };
    });
  },

  updateBudget: (agentId, budgetUsd) => {
    set((state) => {
      const updated = state.agents.map((a) =>
        a.id === agentId ? { ...a, dailyBudgetUsd: budgetUsd } : a
      );
      persistAgents(updated);
      return { agents: updated };
    });
  },

  updateSystemPrompt: (agentId, prompt) => {
    set((state) => {
      const updated = state.agents.map((a) =>
        a.id === agentId ? { ...a, systemPrompt: prompt } : a
      );
      persistAgents(updated);
      return { agents: updated };
    });
  },

  updateModel: (agentId, model) => {
    set((state) => {
      const updated = state.agents.map((a) =>
        a.id === agentId ? { ...a, model } : a
      );
      persistAgents(updated);
      return { agents: updated };
    });
  },

  addAgent: (newAgentData) => {
    const id = `agent_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newAgent: Agent = {
      ...newAgentData,
      id,
      createdAt: new Date().toISOString(),
      lastActiveAt: 'Just now',
      spendTodayUsd: 0.0,
      totalExecutions: 0,
    };
    set((state) => {
      const updated = [newAgent, ...state.agents];
      persistAgents(updated);
      return { agents: updated };
    });
    return newAgent;
  },

  createAgentFromPrompt: (userPrompt: string) => {
    const lower = userPrompt.toLowerCase();

    let archetype: AgentArchetype = 'SUPPORT';
    let name = 'Custom-Autonomous-Agent';
    let model = 'gpt-4o-mini';
    let avatarIcon = 'Bot';
    let tools: string[] = ['search_knowledge_base', 'check_status'];
    let suggestedPrompts: string[] = [];

    // Analyze prompt keywords to build an authentic, tailored agent
    if (lower.includes('code') || lower.includes('program') || lower.includes('python') || lower.includes('javascript') || lower.includes('bug') || lower.includes('developer')) {
      archetype = 'CODING';
      name = lower.includes('python') ? 'Python-Synthesized-Mentor' : 'Code-Craft-Sentinel';
      model = 'claude-3-5-sonnet';
      avatarIcon = 'Code';
      tools = ['execute_sandbox_code', 'analyze_syntax_tree', 'generate_unit_tests', 'scan_security_vulnerabilities'];
      suggestedPrompts = [
        'How can I optimize this slow recursive algorithm?',
        'Write a complete test suite for this user authentication function',
        'Help me debug a tricky memory leak in our worker pool',
        'Explain best practices for error handling in asynchronous tasks'
      ];
    } else if (lower.includes('finance') || lower.includes('crypto') || lower.includes('stock') || lower.includes('sec') || lower.includes('audit') || lower.includes('invest')) {
      archetype = 'RESEARCHER';
      name = 'Market-Intelligence-Auditor';
      model = 'gpt-4o';
      avatarIcon = 'Brain';
      tools = ['query_financial_feed', 'calculate_volatility_metric', 'parse_company_filings', 'generate_risk_memo'];
      suggestedPrompts = [
        'Calculate debt-to-equity ratio and compare with sector benchmarks',
        'Summarize key revenue drivers from the latest quarterly report',
        'Analyze market sentiment and trading volume spikes',
        'What are the primary regulatory headwinds for this sector?'
      ];
    } else if (lower.includes('sales') || lower.includes('lead') || lower.includes('email') || lower.includes('outreach') || lower.includes('marketing') || lower.includes('campaign')) {
      archetype = 'OUTREACH';
      name = 'Outbound-Growth-Navigator';
      model = 'claude-3-5-haiku';
      avatarIcon = 'Zap';
      tools = ['enrich_prospect_contact', 'verify_email_deliverability', 'draft_custom_pitch', 'sync_crm_record'];
      suggestedPrompts = [
        'Draft a 3-step personalized outreach email series',
        'Research company profile and identify key decision makers',
        'Score this prospect based on our ideal customer profile',
        'Create a compelling pitch highlighting our ROI advantages'
      ];
    } else if (lower.includes('data') || lower.includes('sql') || lower.includes('metric') || lower.includes('report') || lower.includes('analytics')) {
      archetype = 'DB_REPORTER';
      name = 'Analytics-Insight-Oracle';
      model = 'gpt-4o-mini';
      avatarIcon = 'Database';
      tools = ['run_analytical_query', 'export_csv_dataset', 'generate_trend_chart', 'check_query_performance'];
      suggestedPrompts = [
        'Generate weekly revenue cohort analysis breakdown',
        'Find user churn patterns over the past 90 days',
        'Show top performing products ranked by net margin',
        'Explain why today\'s conversion rate dropped 4%'
      ];
    } else if (lower.includes('travel') || lower.includes('flight') || lower.includes('hotel') || lower.includes('trip') || lower.includes('booking')) {
      archetype = 'CUSTOM';
      name = 'Voyage-Travel-Concierge';
      model = 'gpt-4o-mini';
      avatarIcon = 'Bot';
      tools = ['search_flights', 'compare_hotel_rates', 'generate_itinerary', 'verify_cancellation_rules'];
      suggestedPrompts = [
        'Find the best non-stop flight options from SFO to Tokyo next month',
        'Draft a 5-day cultural and dining itinerary for Kyoto',
        'Compare 4-star boutique hotels near Central Station',
        'What are the passport and visa requirements for travel to Switzerland?'
      ];
    } else if (lower.includes('hr') || lower.includes('hiring') || lower.includes('interview') || lower.includes('employee') || lower.includes('onboarding')) {
      archetype = 'SUPPORT';
      name = 'People-Ops-Navigator';
      model = 'gpt-4o-mini';
      avatarIcon = 'Bot';
      tools = ['lookup_employee_handbook', 'schedule_interview_panel', 'summarize_candidate_resume', 'verify_pto_balance'];
      suggestedPrompts = [
        'What is our company parental leave and remote work policy?',
        'Draft a 30-60-90 day onboarding plan for a new software engineer',
        'Generate structured behavioral interview questions for a Product Manager',
        'How do employees submit expense reimbursement requests?'
      ];
    } else {
      // General tailored support / specialist
      archetype = 'SUPPORT';
      const cleanPromptWords = userPrompt.split(' ').slice(0, 3).map(w => w.replace(/[^a-zA-Z]/g, '')).filter(Boolean);
      name = cleanPromptWords.length > 0
        ? cleanPromptWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-') + '-Agent'
        : 'Specialist-AI-Sentinel';
      model = 'gpt-4o-mini';
      avatarIcon = 'Bot';
      tools = ['search_knowledge_base', 'validate_operational_rules', 'execute_authorized_action', 'generate_summary_report'];
      suggestedPrompts = [
        'How does your safety governance policy work?',
        'Can you run a test evaluation based on my request?',
        'What tools and actions are you authorized to execute?',
        'Summarize your core mission and operating boundaries'
      ];
    }

    const description = userPrompt.length > 120 ? userPrompt.slice(0, 117) + '...' : userPrompt;
    const systemPrompt = `You are ${name}, a governed autonomous AI agent created in AgentLens.\n\nMission: ${userPrompt}\n\nOperating Guidelines:\n1. Adhere strictly to user intent and provide clear, actionable, expert responses.\n2. When performing sensitive operations, declare the tool invocation and verify safety boundaries.\n3. Maintain professional composure, concise explanations, and high craftsmanship.`;

    const welcomeMessage = `Hello! I have been synthesized as ${name}. My mission is: "${description}". Ask me anything or trigger one of my tools to test my capabilities!`;

    const newAgent = get().addAgent({
      orgId: 'org_enterprise_9981a',
      name,
      description,
      archetype,
      autonomyMode: 'SEMI_AUTO',
      dailyBudgetUsd: 30.00,
      systemPrompt,
      model,
      temperature: 0.2,
      status: 'ONLINE',
      framework: 'CrewAI / AgentLens v2.4',
      avatarIcon,
      tools,
      suggestedPrompts,
      welcomeMessage
    });

    return newAgent;
  },

  deleteAgent: (agentId) => {
    set((state) => {
      const updated = state.agents.filter((a) => a.id !== agentId);
      persistAgents(updated);
      return {
        agents: updated,
        selectedAgent: state.selectedAgent?.id === agentId ? null : state.selectedAgent,
      };
    });
  },

  resetToDefaults: () => {
    persistAgents(INITIAL_AGENTS);
    set({ agents: INITIAL_AGENTS });
  }
}));
