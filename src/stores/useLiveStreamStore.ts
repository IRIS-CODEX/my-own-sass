import { create } from 'zustand';
import { TraceEvent, PendingAction } from '../types';

interface LiveStreamState {
  traces: TraceEvent[];
  pendingActions: PendingAction[];
  selectedTrace: TraceEvent | null;
  filterAgent: string;
  filterRisk: string;
  filterSearch: string;
  isStreaming: boolean;

  setSelectedTrace: (trace: TraceEvent | null) => void;
  setFilterAgent: (agent: string) => void;
  setFilterRisk: (risk: string) => void;
  setFilterSearch: (search: string) => void;
  toggleStreaming: () => void;
  clearTraces: () => void;

  approveAction: (actionId: string) => void;
  rejectAction: (actionId: string, feedback: string) => void;
  addPendingAction: (action: Omit<PendingAction, 'actionId' | 'createdAt' | 'status' | 'expiresAt'>) => string;
  injectMockApproval: () => void;
  injectMockTrace: () => void;
}

const INITIAL_TRACES: TraceEvent[] = [
  {
    id: 'trace_tr_99182',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_support_01',
    agentName: 'Support-Desk-Sentinel',
    stepType: 'THOUGHT',
    payload: {
      thought: "Customer #8821 requested status update on order #ORD-9912. Checking vector knowledge base for recent shipping updates."
    },
    latencyMs: 142,
    tokenCostUsd: 0.00042,
    timestamp: '11:31:42.102',
    status: 'SUCCESS'
  },
  {
    id: 'trace_tr_99183',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_support_01',
    agentName: 'Support-Desk-Sentinel',
    stepType: 'TOOL_INVOCATION',
    toolName: 'search_knowledge_base',
    payload: {
      query: "order ORD-9912 shipping status DHL tracking",
      limit: 3
    },
    latencyMs: 38,
    tokenCostUsd: 0.00018,
    riskLevel: 'GREEN',
    timestamp: '11:31:42.244',
    status: 'SUCCESS'
  },
  {
    id: 'trace_tr_99184',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_sales_02',
    agentName: 'Sales-Pipeline-Navigator',
    stepType: 'TOOL_INVOCATION',
    toolName: 'enrich_lead_profile',
    payload: {
      domain: "cloudscale.io",
      sources: ["clearbit", "linkedin_signals"]
    },
    latencyMs: 210,
    tokenCostUsd: 0.00084,
    riskLevel: 'GREEN',
    timestamp: '11:31:48.810',
    status: 'SUCCESS'
  },
  {
    id: 'trace_tr_99185',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_support_01',
    agentName: 'Support-Desk-Sentinel',
    stepType: 'TOOL_INVOCATION',
    toolName: 'issue_customer_refund',
    payload: {
      customer_id: "cus_8821",
      order_id: "ORD-9912",
      amount: 145.00,
      currency: "USD",
      reason: "Package damaged in transit per customer photo verification."
    },
    latencyMs: 12,
    tokenCostUsd: 0.00031,
    riskLevel: 'YELLOW',
    timestamp: '11:31:54.004',
    status: 'PAUSED'
  },
  {
    id: 'trace_tr_99186',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_db_04',
    agentName: 'Database-Telemetry-Reporter',
    stepType: 'TOOL_INVOCATION',
    toolName: 'execute_readonly_sql',
    payload: {
      query: "SELECT status, count(*) FROM subscriptions WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY status;"
    },
    latencyMs: 84,
    tokenCostUsd: 0.00028,
    riskLevel: 'GREEN',
    timestamp: '11:31:58.330',
    status: 'SUCCESS'
  },
  {
    id: 'trace_tr_99187',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_legacy_05',
    agentName: 'Experimental-Auto-Coder',
    stepType: 'EVALUATION',
    toolName: 'drop_database_table',
    payload: {
      command: "DROP TABLE test_snapshots CASCADE;",
      origin: "agent_recursive_cleanup_loop"
    },
    latencyMs: 4,
    tokenCostUsd: 0.00005,
    riskLevel: 'RED',
    timestamp: '11:32:02.110',
    status: 'BLOCKED'
  }
];

const INITIAL_PENDING: PendingAction[] = [
  {
    actionId: 'act_susp_refund_8819',
    orgId: 'org_enterprise_9981a',
    agentId: 'agent_support_01',
    agentName: 'Support-Desk-Sentinel',
    toolName: 'issue_customer_refund',
    parameters: {
      customer_id: 'cus_8821',
      order_id: 'ORD-9912',
      amount: 145.00,
      currency: 'USD',
      reason: 'Package damaged in transit per customer photo verification.'
    },
    agentReasoning: 'Customer provided verifiable proof of transit damage for order #ORD-9912. Threshold rule requires human supervisor authorization for any refund exceeding $50.00.',
    riskLevel: 'YELLOW',
    status: 'PENDING',
    createdAt: '11:31:54',
    expiresAt: '4m 32s',
  }
];

export const useLiveStreamStore = create<LiveStreamState>((set, get) => ({
  traces: INITIAL_TRACES,
  pendingActions: INITIAL_PENDING,
  selectedTrace: null,
  filterAgent: 'ALL',
  filterRisk: 'ALL',
  filterSearch: '',
  isStreaming: true,

  setSelectedTrace: (selectedTrace) => set({ selectedTrace }),
  setFilterAgent: (filterAgent) => set({ filterAgent }),
  setFilterRisk: (filterRisk) => set({ filterRisk }),
  setFilterSearch: (filterSearch) => set({ filterSearch }),
  toggleStreaming: () => set((s) => ({ isStreaming: !s.isStreaming })),
  clearTraces: () => set({ traces: [] }),

  approveAction: (actionId) => {
    const action = get().pendingActions.find((a) => a.actionId === actionId);
    if (!action) return;

    // Remove from pending
    set((state) => ({
      pendingActions: state.pendingActions.filter((a) => a.actionId !== actionId),
      traces: [
        {
          id: `trace_res_${Date.now()}`,
          orgId: action.orgId,
          agentId: action.agentId,
          agentName: action.agentName,
          stepType: 'OUTPUT',
          toolName: action.toolName,
          payload: {
            verdict: 'APPROVED_BY_SUPERVISOR',
            result: `Tool ${action.toolName} unblocked in Redis Pub/Sub. Upstream HTTP dispatch completed successfully.`,
            authorizedAmount: action.parameters.amount,
            receiptId: `rec_stripe_${Date.now().toString(36)}`
          },
          latencyMs: 168,
          tokenCostUsd: 0.00045,
          riskLevel: 'GREEN',
          timestamp: new Date().toLocaleTimeString(),
          status: 'SUCCESS'
        },
        ...state.traces
      ]
    }));
  },

  rejectAction: (actionId, feedback) => {
    const action = get().pendingActions.find((a) => a.actionId === actionId);
    if (!action) return;

    set((state) => ({
      pendingActions: state.pendingActions.filter((a) => a.actionId !== actionId),
      traces: [
        {
          id: `trace_rej_${Date.now()}`,
          orgId: action.orgId,
          agentId: action.agentId,
          agentName: action.agentName,
          stepType: 'EVALUATION',
          toolName: action.toolName,
          payload: {
            verdict: 'REJECTED_WITH_FEEDBACK',
            supervisorSteering: feedback || 'Rejected: Does not meet company reimbursement policy without manager escalation.',
            agentAction: 'Agent replanning with human feedback provided.'
          },
          latencyMs: 95,
          tokenCostUsd: 0.0002,
          riskLevel: 'YELLOW',
          timestamp: new Date().toLocaleTimeString(),
          status: 'FLAGGED'
        },
        ...state.traces
      ]
    }));
  },

  addPendingAction: (actionData) => {
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPending: PendingAction = {
      ...actionData,
      actionId,
      status: 'PENDING',
      createdAt: new Date().toLocaleTimeString(),
      expiresAt: '4m 59s'
    };

    set((state) => ({
      pendingActions: [newPending, ...state.pendingActions],
      traces: [
        {
          id: `trace_halt_${Date.now()}`,
          orgId: actionData.orgId,
          agentId: actionData.agentId,
          agentName: actionData.agentName,
          stepType: 'TOOL_INVOCATION',
          toolName: actionData.toolName,
          payload: actionData.parameters,
          latencyMs: 16,
          tokenCostUsd: 0.00025,
          riskLevel: actionData.riskLevel,
          timestamp: new Date().toLocaleTimeString(),
          status: 'PAUSED'
        },
        ...state.traces
      ]
    }));

    return actionId;
  },

  injectMockApproval: () => {
    const mockId = `act_mock_${Date.now()}`;
    const newPending: PendingAction = {
      actionId: mockId,
      orgId: 'org_enterprise_9981a',
      agentId: 'agent_sales_02',
      agentName: 'Sales-Pipeline-Navigator',
      toolName: 'send_bulk_outreach',
      parameters: {
        recipients_count: 420,
        campaign_name: 'Q3 Enterprise AI Infrastructure Webinar',
        send_rate_per_sec: 15,
        target_persona: 'VP of Engineering'
      },
      agentReasoning: 'Lead enrichment pipeline discovered 420 qualified engineering directors. Parameter count > 100 emails triggers Semi-Auto policy verification.',
      riskLevel: 'YELLOW',
      status: 'PENDING',
      createdAt: new Date().toLocaleTimeString(),
      expiresAt: '4m 59s'
    };

    set((state) => ({
      pendingActions: [newPending, ...state.pendingActions],
      traces: [
        {
          id: `trace_${Date.now()}`,
          orgId: 'org_enterprise_9981a',
          agentId: 'agent_sales_02',
          agentName: 'Sales-Pipeline-Navigator',
          stepType: 'TOOL_INVOCATION',
          toolName: 'send_bulk_outreach',
          payload: newPending.parameters,
          latencyMs: 14,
          tokenCostUsd: 0.0006,
          riskLevel: 'YELLOW',
          timestamp: new Date().toLocaleTimeString(),
          status: 'PAUSED'
        },
        ...state.traces
      ]
    }));
  },

  injectMockTrace: () => {
    const mockTrace: TraceEvent = {
      id: `trace_rand_${Date.now()}`,
      orgId: 'org_enterprise_9981a',
      agentId: 'agent_research_03',
      agentName: 'Financial-SEC-Auditor',
      stepType: 'TOOL_INVOCATION',
      toolName: 'parse_sec_xbrl',
      payload: {
        form: '10-Q',
        ticker: 'NVDA',
        sections: ['Item 1. Financial Statements', 'Liquidity Analysis']
      },
      latencyMs: Math.floor(Math.random() * 80) + 20,
      tokenCostUsd: 0.00035,
      riskLevel: 'GREEN',
      timestamp: new Date().toLocaleTimeString(),
      status: 'SUCCESS'
    };
    set((state) => ({ traces: [mockTrace, ...state.traces.slice(0, 150)] }));
  }
}));
