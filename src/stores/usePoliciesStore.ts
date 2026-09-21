import { create } from 'zustand';
import { ToolPolicy, RiskLevel, IndustryPack, AgentPromptRule } from '../types';
import {
  subscribeToUserPolicies,
  savePolicyToFirestore,
  updatePolicyInFirestore,
  deletePolicyFromFirestore,
  subscribeToUserPromptRules,
  savePromptRuleToFirestore,
  updatePromptRuleInFirestore,
  deletePromptRuleFromFirestore,
} from '../lib/firebaseServices';
import { Unsubscribe } from 'firebase/firestore';

interface PoliciesState {
  policies: ToolPolicy[];
  industryPacks: IndustryPack[];
  promptRules: AgentPromptRule[];
  readmeContent: string;
  piiMaskingEnabled: boolean;
  selectedPiiEntities: string[];
  promptInjectionDefenseEnabled: boolean;
  canaryTokenDefenseEnabled: boolean;
  ssrfFirewallEnabled: boolean;
  isLoading: boolean;
  activeUserId: string | null;

  initUserPolicies: (userId: string) => () => void;
  updatePolicyRisk: (policyId: string, riskLevel: RiskLevel) => Promise<void>;
  addConditionalRule: (policyId: string, field: string, operator: '>' | '<' | '==' | '!=' | 'CONTAINS', value: string | number) => Promise<void>;
  addToolPolicy: (toolName: string, description: string, riskLevel: RiskLevel) => Promise<ToolPolicy>;
  deleteToolPolicy: (policyId: string) => Promise<void>;
  toggleIndustryPack: (packId: string) => void;
  togglePiiEntity: (entityId: string) => void;
  setPiiMaskingEnabled: (enabled: boolean) => void;
  setPromptInjectionDefense: (enabled: boolean) => void;
  setCanaryTokenDefense: (enabled: boolean) => void;
  setSsrfFirewall: (enabled: boolean) => void;

  createRuleFromPrompt: (prompt: string, agentId?: string, agentName?: string) => Promise<{ rule: AgentPromptRule; generatedPolicy?: ToolPolicy }>;
  addCustomPromptRule: (rule: Omit<AgentPromptRule, 'id' | 'createdAt'>) => Promise<AgentPromptRule>;
  togglePromptRule: (ruleId: string) => Promise<void>;
  deletePromptRule: (ruleId: string) => Promise<void>;

  updateReadmeContent: (content: string) => void;
  resetReadmeToDefault: () => void;
  provisionDefaultPolicies: () => Promise<void>;
}

const DEFAULT_README = `# AgentLens Operational Governance Charter

This charter defines safety policies, tool constraints, and authorization rules for all autonomous AI agents in this fleet.

## Enforced Security Guardrails
1. **Financial Actions**: Direct refund operations over $50 USD require Human-in-the-loop sign-off.
2. **Database Access**: Read-only queries permitted; destructive DDL (DROP, TRUNCATE, ALTER) is strictly blocked.
3. **Data Privacy**: Automatic PII redaction (SSN, credit cards, emails) is enabled on all ingress & egress tokens.
4. **Prompt Defense**: Active heuristic & semantic filters reject adversarial jailbreak sequences.
`;

export const ALL_PII_ENTITIES = [
  { id: 'EMAIL', label: 'Email Addresses', name: 'Email Addresses', example: 'alex.smith@enterprise.com' },
  { id: 'PHONE_NUMBER', label: 'Phone Numbers', name: 'Phone Numbers', example: '+1 (555) 234-5678' },
  { id: 'CREDIT_CARD', label: 'Credit Card Numbers', name: 'Credit Card Numbers', example: '4532 •••• •••• 8921' },
  { id: 'US_SSN', label: 'Social Security Numbers', name: 'Social Security Numbers', example: '•••-••-8921' },
  { id: 'IP_ADDRESS', label: 'IP Addresses', name: 'IP Addresses', example: '192.168.1.105' },
  { id: 'API_SECRET', label: 'API Secrets & Tokens', name: 'API Secrets & Tokens', example: 'sk-proj-••••••••' },
];

export const usePoliciesStore = create<PoliciesState>((set, get) => ({
  policies: [],
  promptRules: [],
  industryPacks: [
    {
      id: 'pack_fintech',
      name: 'SOC2 & Financial Controls',
      badge: 'FINANCIAL',
      description: 'Pre-configured financial ceilings, dual-signature refund controls, and SEC disclosure boundaries.',
      rulesCount: 6,
      enabled: true,
      features: ['Max $50 autonomous refund ceiling', 'Wire disbursement hard lock', 'Audit ledger immutability'],
    },
    {
      id: 'pack_healthcare',
      name: 'HIPAA & Healthcare Shield',
      badge: 'HEALTHCARE',
      description: 'PHI detection, medical record identifier masking, and clinical advice guardrails.',
      rulesCount: 8,
      enabled: false,
      features: ['EHR token redaction', 'Patient record ID guard', 'Diagnostic disclaimer injection'],
    },
    {
      id: 'pack_devops',
      name: 'DevSecOps & Cloud Sandbox',
      badge: 'DEVSECOPS',
      description: 'Hard-blocks destructive schema operations, raw bash exec, and sensitive cloud credential lookups.',
      rulesCount: 5,
      enabled: true,
      features: ['DDL DROP/ALTER prohibition', 'SSRF private IP firewall', 'Kubernetes exec block'],
    },
  ],
  readmeContent: DEFAULT_README,
  piiMaskingEnabled: true,
  selectedPiiEntities: ['EMAIL', 'PHONE_NUMBER', 'CREDIT_CARD', 'US_SSN', 'IP_ADDRESS'],
  promptInjectionDefenseEnabled: true,
  canaryTokenDefenseEnabled: true,
  ssrfFirewallEnabled: true,
  isLoading: false,
  activeUserId: null,

  initUserPolicies: (userId: string) => {
    set({ activeUserId: userId, isLoading: true });

    const unsubPolicies: Unsubscribe = subscribeToUserPolicies(
      userId,
      (policies) => {
        set({ policies, isLoading: false });
      },
      (error) => {
        console.error('[PoliciesStore] Policies sync error:', error);
        set({ isLoading: false });
      }
    );

    const unsubRules: Unsubscribe = subscribeToUserPromptRules(
      userId,
      (promptRules) => {
        set({ promptRules });
      },
      (error) => {
        console.error('[PoliciesStore] Prompt rules sync error:', error);
      }
    );

    return () => {
      unsubPolicies();
      unsubRules();
    };
  },

  updatePolicyRisk: async (policyId, riskLevel) => {
    set((state) => ({
      policies: state.policies.map((p) => (p.id === policyId ? { ...p, riskLevel } : p)),
    }));
    try {
      await updatePolicyInFirestore(policyId, { riskLevel });
    } catch (err) {
      console.error('[PoliciesStore] Failed to update policy risk:', err);
    }
  },

  addConditionalRule: async (policyId, field, operator, value) => {
    const condition = { field, operator, value };
    set((state) => ({
      policies: state.policies.map((p) =>
        p.id === policyId ? { ...p, ruleCondition: condition } : p
      ),
    }));
    try {
      await updatePolicyInFirestore(policyId, { ruleCondition: condition });
    } catch (err) {
      console.error('[PoliciesStore] Failed to add conditional rule:', err);
    }
  },

  addToolPolicy: async (toolName, description, riskLevel) => {
    const userId = get().activeUserId || 'guest_user';
    const id = `pol_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newPolicy: ToolPolicy = {
      id,
      userId,
      orgId: 'org_enterprise_fleet',
      toolName,
      description,
      riskLevel,
      autoApprovalCount: 0,
      interceptedCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    set((state) => ({
      policies: [newPolicy, ...state.policies],
    }));

    try {
      await savePolicyToFirestore(newPolicy);
    } catch (err) {
      console.error('[PoliciesStore] Failed to save tool policy:', err);
    }

    return newPolicy;
  },

  deleteToolPolicy: async (policyId) => {
    set((state) => ({
      policies: state.policies.filter((p) => p.id !== policyId),
    }));
    try {
      await deletePolicyFromFirestore(policyId);
    } catch (err) {
      console.error('[PoliciesStore] Failed to delete policy:', err);
    }
  },

  toggleIndustryPack: (packId) => {
    set((state) => ({
      industryPacks: state.industryPacks.map((p) =>
        p.id === packId ? { ...p, enabled: !p.enabled } : p
      ),
    }));
  },

  togglePiiEntity: (entityId) => {
    set((state) => {
      const exists = state.selectedPiiEntities.includes(entityId);
      return {
        selectedPiiEntities: exists
          ? state.selectedPiiEntities.filter((e) => e !== entityId)
          : [...state.selectedPiiEntities, entityId],
      };
    });
  },

  setPiiMaskingEnabled: (piiMaskingEnabled) => set({ piiMaskingEnabled }),
  setPromptInjectionDefense: (promptInjectionDefenseEnabled) => set({ promptInjectionDefenseEnabled }),
  setCanaryTokenDefense: (canaryTokenDefenseEnabled) => set({ canaryTokenDefenseEnabled }),
  setSsrfFirewall: (ssrfFirewallEnabled) => set({ ssrfFirewallEnabled }),

  createRuleFromPrompt: async (prompt, agentId = 'ALL', agentName = 'All Autonomous Agents') => {
    const lower = prompt.toLowerCase();
    let category: AgentPromptRule['category'] = 'SECURITY';
    let riskLevel: RiskLevel = 'YELLOW';
    let targetTool = 'custom_tool_action';
    let conditionExpression = 'payload.is_sensitive == true';
    let ruleName = 'Governed Action Policy';

    if (lower.includes('refund') || lower.includes('money') || lower.includes('$') || lower.includes('cost') || lower.includes('dollar')) {
      category = 'FINANCIAL';
      riskLevel = 'YELLOW';
      targetTool = 'issue_customer_refund';
      ruleName = 'Customer Refund Ceiling';
      conditionExpression = 'amount > 50';
    } else if (lower.includes('drop') || lower.includes('database') || lower.includes('delete') || lower.includes('sql') || lower.includes('alter')) {
      category = 'SECURITY';
      riskLevel = 'RED';
      targetTool = 'execute_sql_statement';
      ruleName = 'Database Schema Protection';
      conditionExpression = 'query.contains("DROP") || query.contains("TRUNCATE")';
    } else if (lower.includes('email') || lower.includes('outreach') || lower.includes('send') || lower.includes('mass')) {
      category = 'OPERATIONAL';
      riskLevel = 'YELLOW';
      targetTool = 'send_sales_outreach_email';
      ruleName = 'Outbound Communication Throttle';
      conditionExpression = 'recipients_count > 50';
    }

    const newRule = await get().addCustomPromptRule({
      agentId,
      agentName,
      sourcePrompt: prompt,
      ruleName,
      category,
      riskLevel,
      targetTool,
      conditionExpression,
      systemInstructionAddition: `POLICY ENFORCEMENT: ${prompt}`,
      isEnabled: true,
    });

    let generatedPolicy: ToolPolicy | undefined;
    const existing = get().policies.find((p) => p.toolName === targetTool);
    if (!existing) {
      generatedPolicy = await get().addToolPolicy(
        targetTool,
        `Auto-generated policy enforcing: "${prompt}"`,
        riskLevel
      );
    }

    return { rule: newRule, generatedPolicy };
  },

  addCustomPromptRule: async (ruleData) => {
    const userId = get().activeUserId || 'guest_user';
    const id = `prule_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newRule: AgentPromptRule = {
      ...ruleData,
      id,
      userId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    set((state) => ({
      promptRules: [newRule, ...state.promptRules],
    }));

    try {
      await savePromptRuleToFirestore(newRule);
    } catch (err) {
      console.error('[PoliciesStore] Failed to save prompt rule:', err);
    }

    return newRule;
  },

  togglePromptRule: async (ruleId) => {
    const rule = get().promptRules.find((r) => r.id === ruleId);
    if (!rule) return;
    const newEnabled = !rule.isEnabled;

    set((state) => ({
      promptRules: state.promptRules.map((r) =>
        r.id === ruleId ? { ...r, isEnabled: newEnabled } : r
      ),
    }));

    try {
      await updatePromptRuleInFirestore(ruleId, { isEnabled: newEnabled });
    } catch (err) {
      console.error('[PoliciesStore] Failed to toggle prompt rule:', err);
    }
  },

  deletePromptRule: async (ruleId) => {
    set((state) => ({
      promptRules: state.promptRules.filter((r) => r.id !== ruleId),
    }));
    try {
      await deletePromptRuleFromFirestore(ruleId);
    } catch (err) {
      console.error('[PoliciesStore] Failed to delete prompt rule:', err);
    }
  },

  updateReadmeContent: (readmeContent) => set({ readmeContent }),
  resetReadmeToDefault: () => set({ readmeContent: DEFAULT_README }),

  provisionDefaultPolicies: async () => {
    const defaultPolicies = [
      {
        toolName: 'search_knowledge_base',
        description: 'Read-only vector search over company support documentation.',
        riskLevel: 'GREEN' as RiskLevel,
      },
      {
        toolName: 'issue_customer_refund',
        description: 'Triggers payment partial or full refund to customer card.',
        riskLevel: 'YELLOW' as RiskLevel,
      },
      {
        toolName: 'drop_database_table',
        description: 'Executes DDL DROP, TRUNCATE, or ALTER on production database clusters.',
        riskLevel: 'RED' as RiskLevel,
      },
      {
        toolName: 'execute_readonly_sql',
        description: 'Runs read-only SQL SELECT queries against analytics data warehouse.',
        riskLevel: 'GREEN' as RiskLevel,
      },
    ];

    for (const p of defaultPolicies) {
      await get().addToolPolicy(p.toolName, p.description, p.riskLevel);
    }

    await get().addCustomPromptRule({
      agentId: 'ALL',
      agentName: 'All Autonomous Agents',
      sourcePrompt: 'Do not allow any agent to issue customer refunds over $50 without explicit human confirmation.',
      ruleName: 'Ceiling on Customer Refunds ($50 Limit)',
      category: 'FINANCIAL',
      riskLevel: 'YELLOW',
      targetTool: 'issue_customer_refund',
      conditionExpression: 'amount > 50',
      systemInstructionAddition: 'MANDATORY POLICY: You are prohibited from autonomously issuing refunds exceeding $50.00 USD. If requested, request supervisor verification.',
      isEnabled: true,
    });
  },
}));
