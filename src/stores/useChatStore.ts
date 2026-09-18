import { create } from 'zustand';
import { Agent, ChatMessage, ChatToolCall, RiskLevel } from '../types';
import { usePoliciesStore } from './usePoliciesStore';
import { useLiveStreamStore } from './useLiveStreamStore';

interface ChatState {
  activeAgentId: string;
  sessions: Record<string, ChatMessage[]>;
  isThinking: boolean;
  thinkingStage: string;
  
  setActiveAgentId: (agentId: string) => void;
  getMessages: (agentId: string) => ChatMessage[];
  sendMessage: (agentId: string, text: string, agent: Agent) => Promise<void>;
  clearChat: (agentId: string) => void;
  resetAllChats: () => void;
}

const CHAT_STORAGE_KEY = 'agentlens_chat_history_v1';

function loadPersistedSessions(): Record<string, ChatMessage[]> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load chat history', e);
  }
  return {};
}

function persistSessions(sessions: Record<string, ChatMessage[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save chat history', e);
  }
}

// Generate realistic domain response based on user input and agent profile
function generateAgentResponse(userQuery: string, agent: Agent): {
  content: string;
  thoughts: string[];
  toolCall?: ChatToolCall;
  latencyMs: number;
  tokensUsed: number;
  costUsd: number;
} {
  const queryLower = userQuery.toLowerCase();
  const agentName = agent.name;
  const archetype = agent.archetype;

  const latencyMs = Math.floor(Math.random() * 240) + 180;
  const tokensUsed = Math.floor(Math.random() * 180) + 95;
  const costUsd = Number(((tokensUsed / 1000) * 0.00015).toFixed(5));

  const { promptInjectionDefenseEnabled, promptRules } = usePoliciesStore.getState();

  // Guardrail 1: Semantic Anti-Jailbreak & Prompt Injection Defense
  if (promptInjectionDefenseEnabled) {
    const jailbreakPatterns = [
      'ignore previous instructions',
      'disregard all prior',
      'system prompt',
      'dan mode',
      'jailbreak',
      'bypass security',
      'override guardrails',
      'reveal secrets',
      'drop table'
    ];
    const detected = jailbreakPatterns.find((p) => queryLower.includes(p));
    if (detected) {
      useLiveStreamStore.getState().addPendingAction({
        orgId: 'org_enterprise_9981a',
        agentId: agent.id,
        agentName: agent.name,
        toolName: 'anti_jailbreak_filter',
        parameters: { violation: detected, raw_prompt: userQuery.slice(0, 100) },
        agentReasoning: `Anti-Jailbreak Defense Gate tripped: Detected prompt injection pattern "${detected}".`,
        riskLevel: 'RED'
      });

      return {
        thoughts: [
          'Ingress prompt tokenization & heuristic safety screening',
          `THREAT DETECTED: Adversary token sequence matching pattern: "${detected}"`,
          'Anti-Jailbreak Heuristic Filter tripped (RED Tier)',
          'Suspending agent processing immediately; zero data exfiltrated'
        ],
        toolCall: {
          toolName: 'anti_jailbreak_filter',
          params: { detected_pattern: detected },
          result: 'HARD BLOCK: Ingress payload classified as prompt injection / jailbreak attempt.',
          riskLevel: 'RED',
          intercepted: true
        },
        content: `🛑 **Zero-Trust Security Gate Interception**\n\nYour prompt contains instruction override or exfiltration signatures (\`${detected}\`) that violate active zero-trust security policies.\n\n- **Policy**: Semantic Prompt Injection Defense\n- **Action**: Tool invocation blocked and incident logged to Audit Ledger.\n- **Status**: Secure execution halted.`,
        latencyMs: 65,
        tokensUsed: 32,
        costUsd: 0.00004
      };
    }
  }

  // Guardrail 2: Custom Prompt Rules Matching
  const activeRules = promptRules.filter(
    (r) => r.isEnabled && (r.agentId === 'ALL' || r.agentId === agent.id)
  );

  for (const rule of activeRules) {
    const targetTool = rule.targetTool || 'system_guardrail';
    const keywords = [targetTool.toLowerCase(), ...rule.ruleName.toLowerCase().split(' ')].filter((k) => k.length > 3);
    const matches = keywords.some((k) => queryLower.includes(k));

    if (matches && rule.riskLevel === 'RED') {
      return {
        thoughts: [
          `Evaluating custom prompt rule: [${rule.ruleName}]`,
          `Category: ${rule.category}, Target: ${targetTool}`,
          `Enforcing RED tier: Autonomous execution prohibited.`,
          `System prompt directive: "${rule.systemInstructionAddition}"`
        ],
        toolCall: {
          toolName: targetTool,
          params: { query: userQuery.slice(0, 40) },
          result: `BLOCKED by rule "${rule.ruleName}" (${rule.riskLevel})`,
          riskLevel: 'RED',
          intercepted: true
        },
        content: `⛔ **Governance Policy Block: ${rule.ruleName}**\n\nExecution was prohibited under safety rule **${rule.ruleName}** (${rule.category}).\n\n- **Directive**: ${rule.systemInstructionAddition}\n- **Target Tool**: \`${targetTool}\`\n- **Tier**: **RED** (Autonomous Execution Prohibited)`,
        latencyMs: 95,
        tokensUsed: 45,
        costUsd: 0.00006
      };
    }
  }

  // 1. Support & Refund scenarios
  if (archetype === 'SUPPORT' || queryLower.includes('refund') || queryLower.includes('ticket') || queryLower.includes('support')) {
    const refundMatch = userQuery.match(/\$?(\d+(\.\d{1,2})?)/);
    const amount = refundMatch ? parseFloat(refundMatch[1]) : 0;

    if (queryLower.includes('refund') && amount > 50) {
      useLiveStreamStore.getState().addPendingAction({
        orgId: 'org_enterprise_9981a',
        agentId: agent.id,
        agentName: agent.name,
        toolName: 'issue_customer_refund',
        parameters: { order_id: 'ORD-98214', amount: `$${amount.toFixed(2)}`, customer_id: 'cust_alpha_99' },
        agentReasoning: `Customer requested refund of $${amount.toFixed(2)}. Policy Matrix rule triggers YELLOW tier review.`,
        riskLevel: 'YELLOW'
      });

      return {
        thoughts: [
          'Deconstructing user ticket request: Customer refund requested',
          `Parsed refund amount: $${amount.toFixed(2)} USD`,
          'Evaluating Traffic-Light Policy Matrix: Tool [issue_customer_refund]',
          'Triggered Guardrail Rule: IF amount > $50.00 THEN YELLOW (Human-In-The-Loop Approval required)',
          'Event pushed to AgentLens Control Tower & mobile supervisor queue'
        ],
        toolCall: {
          toolName: 'issue_customer_refund',
          params: { order_id: 'ORD-98214', amount: `$${amount.toFixed(2)}`, customer_id: 'cust_alpha_99' },
          result: `PAUSED: Refund amount ($${amount.toFixed(2)}) exceeds autonomous threshold ($50.00). Awaiting Telegram / Slack supervisor approval.`,
          riskLevel: 'YELLOW',
          intercepted: true
        },
        content: `I have prepared the refund transaction for **$${amount.toFixed(2)}** regarding order **#ORD-98214**.\n\n⚠️ **Human-in-the-Loop Interception**: Because this refund amount exceeds our autonomous safety threshold of **$50.00**, I have safely suspended execution and dispatched an approval ping to your Control Tower.\n\nOnce approved by your team, the transaction will finalize automatically within 2 seconds.`,
        latencyMs,
        tokensUsed,
        costUsd
      };
    }

    if (queryLower.includes('refund') && amount > 0 && amount <= 50) {
      return {
        thoughts: [
          'Deconstructing user ticket request: Micro-refund requested',
          `Parsed refund amount: $${amount.toFixed(2)} USD`,
          'Evaluating Traffic-Light Policy Matrix: Amount <= $50.00 (GREEN Risk Tier)',
          'Executing authorized tool autonomously: [issue_customer_refund]'
        ],
        toolCall: {
          toolName: 'issue_customer_refund',
          params: { order_id: 'ORD-77142', amount: `$${amount.toFixed(2)}`, method: 'ORIGINAL_PAYMENT' },
          result: `SUCCESS: Transaction processed. Confirmation receipt #TX-${Math.floor(Math.random() * 90000) + 10000}`,
          riskLevel: 'GREEN',
          intercepted: false
        },
        content: `The refund of **$${amount.toFixed(2)}** has been authorized and executed successfully under our low-risk autonomous policy tier (**GREEN**).\n\n- **Order ID**: #ORD-77142\n- **Transaction Reference**: TX-${Math.floor(Math.random() * 90000) + 10000}\n- **Processing Time**: ${latencyMs}ms\n\nThe customer will receive an email confirmation within 5-10 minutes.`,
        latencyMs,
        tokensUsed,
        costUsd
      };
    }

    // General knowledge base search
    return {
      thoughts: [
        'Parsing customer inquiry intent and entity extraction',
        'Executing read-only vector knowledge base lookup: [search_knowledge_base]',
        'Filtering results with 0.88 semantic similarity threshold',
        'Synthesizing verified resolution from official documentation'
      ],
      toolCall: {
        toolName: 'search_knowledge_base',
        params: { query: userQuery.slice(0, 50), top_k: 3 },
        result: 'Found 3 verified articles: Article #KB-104 (Account Security), #KB-219 (Billing FAQ), #KB-301 (API Integration).',
        riskLevel: 'GREEN',
        intercepted: false
      },
      content: `Based on our verified knowledge base documentation:\n\n1. **Standard Resolution**: You can configure this directly in your workspace account settings or via the self-service portal.\n2. **Security & Validation**: Ensure your authentication tokens have appropriate scoped privileges.\n3. **Assistance**: If you encounter any error codes, let me know and I will verify the log traces in real time.`,
      latencyMs,
      tokensUsed,
      costUsd
    };
  }

  // 2. Sales & Outreach
  if (archetype === 'OUTREACH' || queryLower.includes('lead') || queryLower.includes('email') || queryLower.includes('pitch')) {
    return {
      thoughts: [
        'Inspecting outbound sales intent',
        'Invoking B2B data enrichment pipeline: [enrich_lead_profile]',
        'Scanning domain DNS records and technology stack fingerprints',
        'Applying anti-spam compliance guardrails'
      ],
      toolCall: {
        toolName: 'enrich_lead_profile',
        params: { domain: 'target-prospect.io', enrich_depth: 'deep' },
        result: 'Identified: 140+ employees, Tech Stack: Next.js, Stripe, AWS, PostgreSQL. Growth rate: +34% YoY.',
        riskLevel: 'GREEN'
      },
      content: `Here is the customized outbound proposal based on the domain signals:\n\n**Subject**: Scaling your autonomous infrastructure at {{Company}}\n\nHi {{FirstName}},\n\nNoticed your engineering team has been expanding rapidly over the past two quarters. Many high-growth teams using your stack face operational bottlenecks when governing AI agent tool permissions and preventing unauthorized API spend.\n\nWe built **AgentLens** to provide zero-trust virtual key gating with human-in-the-loop controls so your agents can operate safely in production.\n\nWould you be open to a 10-minute briefing this Thursday?\n\nBest regards,\nGrowth Team`,
      latencyMs,
      tokensUsed,
      costUsd
    };
  }

  // 3. Research & Financial
  if (archetype === 'RESEARCHER' || queryLower.includes('10-k') || queryLower.includes('sec') || queryLower.includes('ratio') || queryLower.includes('margin')) {
    return {
      thoughts: [
        'Querying SEC EDGAR read-only database: [fetch_sec_filings]',
        'Strict guardrail enforcement: Read-only mode active (no trade execution permitted)',
        'Tabulating EBITDA, Quick Ratio, and Free Cash Flow margins'
      ],
      toolCall: {
        toolName: 'fetch_sec_filings',
        params: { form: '10-K', ticker: 'AAPL', fiscal_year: 2025 },
        result: 'Filings parsed. Operating Cash Flow: $118.2B. Gross Margin: 46.2%. Total Cash & Equivalents: $29.9B.',
        riskLevel: 'GREEN'
      },
      content: `### Executive Financial Audit Summary\n\n- **Operating Cash Flow**: **$118.2B** (Robust liquidity buffer)\n- **Gross Margin**: **46.2%** (Up 110 bps YoY driven by services expansion)\n- **Debt-to-Equity Ratio**: **1.42x** (Within conservative enterprise thresholds)\n- **Regulatory Risk Disclosures**: Highlighted foreign exchange headwinds and supply chain diversification milestones.\n\n*Note: All data verified against official SEC EDGAR disclosures.*`,
      latencyMs,
      tokensUsed,
      costUsd
    };
  }

  // 4. Database & Analytics
  if (archetype === 'DB_REPORTER' || queryLower.includes('sql') || queryLower.includes('query') || queryLower.includes('database') || queryLower.includes('metric')) {
    return {
      thoughts: [
        'Validating SQL statement against Policy Studio DevSecOps rules',
        'Verifying statement is strictly read-only SELECT',
        'Confirmed: Zero DDL statements (no DROP, ALTER, DELETE)',
        'Executing query on read replica pool replica-eu-west-01'
      ],
      toolCall: {
        toolName: 'execute_readonly_sql',
        params: { query: 'SELECT plan_tier, COUNT(*) as total, SUM(mrr_cents)/100.0 as mrr FROM subscriptions GROUP BY 1;' },
        result: 'Rows returned: 4. Execution time: 18.4ms. Lock contention: 0.00%.',
        riskLevel: 'GREEN'
      },
      content: `### Database Telemetry Rollup\n\n\`\`\`sql\nSELECT plan_tier, COUNT(*) as total, SUM(mrr_cents)/100.0 as mrr \nFROM subscriptions GROUP BY 1;\n\`\`\`\n\n| Plan Tier | Total Tenants | Current MRR |\n| :--- | :--- | :--- |\n| **ENTERPRISE** | 128 | $124,500.00 |\n| **PRO_MONTHLY** | 1,420 | $78,100.00 |\n| **PRO_YEARLY** | 680 | $64,600.00 |\n| **FREE** | 8,910 | $0.00 |\n\n**Total Platform MRR**: **$267,200.00** across all active instances.`,
      latencyMs,
      tokensUsed,
      costUsd
    };
  }

  // 5. Coding & Software Architecture
  if (archetype === 'CODING' || queryLower.includes('code') || queryLower.includes('python') || queryLower.includes('test') || queryLower.includes('bug')) {
    return {
      thoughts: [
        'Performing static AST code analysis',
        'Running virtual sandbox type checks: [run_linter_checks]',
        'Evaluating edge cases, exception handling, and time complexity'
      ],
      toolCall: {
        toolName: 'run_linter_checks',
        params: { language: 'python', linter: 'ruff', strict: true },
        result: 'All checks passed. Zero syntax anomalies detected. Clean cyclomatic complexity.',
        riskLevel: 'GREEN'
      },
      content: `Here is the clean, production-ready implementation tailored to your specification:\n\n\`\`\`python\nimport asyncio\nfrom typing import Optional\n\nclass AsyncTokenBucket:\n    """Thread-safe asynchronous token bucket rate limiter with sliding window."""\n    def __init__(self, capacity: int, refill_rate_per_sec: float):\n        self.capacity = capacity\n        self.refill_rate = refill_rate_per_sec\n        self.tokens = float(capacity)\n        self.last_update = asyncio.get_event_loop().time()\n        self._lock = asyncio.Lock()\n\n    async def acquire(self, cost: int = 1) -> bool:\n        async with self._lock:\n            now = asyncio.get_event_loop().time()\n            elapsed = now - self.last_update\n            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)\n            self.last_update = now\n            \n            if self.tokens >= cost:\n                self.tokens -= cost\n                return True\n            return False\n\`\`\`\n\n- **Time Complexity**: $O(1)$ constant time evaluation.\n- **Concurrency**: Guaranteed race-free via \`asyncio.Lock\` synchronization.`,
      latencyMs,
      tokensUsed,
      costUsd
    };
  }

  // General default fallback
  return {
    thoughts: [
      `Deconstructing prompt with ${agent.model}`,
      `Adhering to system prompt guidelines: "${agent.systemPrompt.slice(0, 60)}..."`,
      'Checking tool safety policies',
      'Synthesizing contextual response'
    ],
    toolCall: {
      toolName: agent.tools?.[0] || 'execute_core_task',
      params: { input: userQuery.slice(0, 40) },
      result: `Processed query with model ${agent.model}. Execution verified.`,
      riskLevel: 'GREEN'
    },
    content: `I have analyzed your request based on my assigned objective as **${agentName}**.\n\nHere is what I recommend:\n- **Analysis**: Your inquiry aligns with our operational parameters.\n- **Action**: I have validated the request against our safety policies.\n- **Next Steps**: Let me know if you would like me to trigger any authorized sub-tasks or pull detailed logs.`,
    latencyMs,
    tokensUsed,
    costUsd
  };
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeAgentId: 'agent_support_01',
  sessions: loadPersistedSessions(),
  isThinking: false,
  thinkingStage: '',

  setActiveAgentId: (activeAgentId) => set({ activeAgentId }),

  getMessages: (agentId) => {
    return get().sessions[agentId] || [];
  },

  sendMessage: async (agentId, text, agent) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      agentId,
      sender: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append user message immediately
    set((state) => {
      const current = state.sessions[agentId] || [];
      const updated = { ...state.sessions, [agentId]: [...current, userMessage] };
      persistSessions(updated);
      return { sessions: updated, isThinking: true, thinkingStage: 'Analyzing query intent...' };
    });

    // Staged thinking progression
    await new Promise((r) => setTimeout(r, 450));
    set({ thinkingStage: `Consulting ${agent.name} policy boundaries...` });

    await new Promise((r) => setTimeout(r, 450));
    set({ thinkingStage: 'Executing tool & synthesizing response...' });

    await new Promise((r) => setTimeout(r, 400));

    // Generate simulated AI agent response
    const res = generateAgentResponse(text, agent);

    const agentMessage: ChatMessage = {
      id: `msg_agent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      agentId,
      sender: 'agent',
      content: res.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thoughts: res.thoughts,
      toolCall: res.toolCall,
      metrics: {
        latencyMs: res.latencyMs,
        tokensUsed: res.tokensUsed,
        costUsd: res.costUsd
      }
    };

    set((state) => {
      const current = state.sessions[agentId] || [];
      const updated = { ...state.sessions, [agentId]: [...current, agentMessage] };
      persistSessions(updated);
      return {
        sessions: updated,
        isThinking: false,
        thinkingStage: ''
      };
    });
  },

  clearChat: (agentId) => {
    set((state) => {
      const updated = { ...state.sessions, [agentId]: [] };
      persistSessions(updated);
      return { sessions: updated };
    });
  },

  resetAllChats: () => {
    persistSessions({});
    set({ sessions: {} });
  }
}));
