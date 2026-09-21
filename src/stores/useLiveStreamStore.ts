import { create } from 'zustand';
import { TraceEvent, PendingAction, RiskLevel } from '../types';
import {
  subscribeToUserTraces,
  saveTraceToFirestore,
  subscribeToUserPendingActions,
  savePendingActionToFirestore,
  updatePendingActionInFirestore,
  deletePendingActionFromFirestore,
} from '../lib/firebaseServices';
import { Unsubscribe } from 'firebase/firestore';

interface LiveStreamState {
  traces: TraceEvent[];
  pendingActions: PendingAction[];
  selectedTrace: TraceEvent | null;
  filterAgent: string;
  filterRisk: string;
  filterSearch: string;
  isStreaming: boolean;
  isLoading: boolean;
  activeUserId: string | null;

  initLiveStream: (userId: string) => () => void;
  setSelectedTrace: (trace: TraceEvent | null) => void;
  setFilterAgent: (agent: string) => void;
  setFilterRisk: (risk: string) => void;
  setFilterSearch: (search: string) => void;
  toggleStreaming: () => void;
  clearTraces: () => void;

  approveAction: (actionId: string) => Promise<void>;
  rejectAction: (actionId: string, feedback: string) => Promise<void>;
  addPendingAction: (action: Omit<PendingAction, 'actionId' | 'createdAt' | 'status' | 'expiresAt'>) => Promise<string>;
  recordTrace: (trace: Omit<TraceEvent, 'id' | 'timestamp'>) => Promise<TraceEvent>;
  injectMockTrace: () => Promise<void>;
  provisionDefaultTraces: () => Promise<void>;
}

export const useLiveStreamStore = create<LiveStreamState>((set, get) => ({
  traces: [],
  pendingActions: [],
  selectedTrace: null,
  filterAgent: 'ALL',
  filterRisk: 'ALL',
  filterSearch: '',
  isStreaming: true,
  isLoading: false,
  activeUserId: null,

  initLiveStream: (userId: string) => {
    set({ activeUserId: userId, isLoading: true });

    const unsubTraces: Unsubscribe = subscribeToUserTraces(
      userId,
      (traces) => {
        // Sort newest first
        const sorted = [...traces].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        set({
          traces: sorted,
          isLoading: false,
          selectedTrace: get().selectedTrace || sorted[0] || null,
        });
      },
      (error) => {
        console.error('[LiveStreamStore] Traces sync error:', error);
        set({ isLoading: false });
      }
    );

    const unsubPending: Unsubscribe = subscribeToUserPendingActions(
      userId,
      (pendingActions) => {
        set({ pendingActions });
      },
      (error) => {
        console.error('[LiveStreamStore] Pending actions sync error:', error);
      }
    );

    return () => {
      unsubTraces();
      unsubPending();
    };
  },

  setSelectedTrace: (selectedTrace) => set({ selectedTrace }),
  setFilterAgent: (filterAgent) => set({ filterAgent }),
  setFilterRisk: (filterRisk) => set({ filterRisk }),
  setFilterSearch: (filterSearch) => set({ filterSearch }),
  toggleStreaming: () => set((state) => ({ isStreaming: !state.isStreaming })),
  clearTraces: () => set({ traces: [], selectedTrace: null }),

  approveAction: async (actionId: string) => {
    const action = get().pendingActions.find((a) => a.actionId === actionId);
    if (!action) return;

    set((state) => ({
      pendingActions: state.pendingActions.filter((a) => a.actionId !== actionId),
    }));

    try {
      await updatePendingActionInFirestore(actionId, { status: 'APPROVED' });
    } catch (err) {
      console.error('[LiveStreamStore] Failed to update pending action in Firestore:', err);
    }

    // Log the approval trace
    await get().recordTrace({
      userId: action.userId,
      orgId: action.orgId || 'org_enterprise_fleet',
      agentId: action.agentId,
      agentName: action.agentName,
      stepType: 'TOOL_INVOCATION',
      toolName: action.toolName,
      payload: {
        ...action.parameters,
        _human_verdict: 'APPROVED_BY_ADMIN',
        _resumed_at: new Date().toISOString(),
      },
      latencyMs: 18,
      tokenCostUsd: 0.00012,
      riskLevel: action.riskLevel,
      status: 'SUCCESS',
    });
  },

  rejectAction: async (actionId: string, feedback: string) => {
    const action = get().pendingActions.find((a) => a.actionId === actionId);
    if (!action) return;

    set((state) => ({
      pendingActions: state.pendingActions.filter((a) => a.actionId !== actionId),
    }));

    try {
      await updatePendingActionInFirestore(actionId, {
        status: 'REJECTED',
        humanFeedback: feedback,
      });
    } catch (err) {
      console.error('[LiveStreamStore] Failed to update pending action rejection:', err);
    }

    // Log the rejection trace
    await get().recordTrace({
      userId: action.userId,
      orgId: action.orgId || 'org_enterprise_fleet',
      agentId: action.agentId,
      agentName: action.agentName,
      stepType: 'EVALUATION',
      toolName: action.toolName,
      payload: {
        _human_verdict: 'REJECTED_BY_ADMIN',
        reason: feedback || 'Supervisor denied permission for this action.',
        parameters: action.parameters,
      },
      latencyMs: 12,
      tokenCostUsd: 0,
      riskLevel: 'RED',
      status: 'BLOCKED',
    });
  },

  addPendingAction: async (actionData) => {
    const userId = get().activeUserId || 'guest_user';
    const actionId = `act_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newAction: PendingAction = {
      ...actionData,
      actionId,
      userId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
    };

    set((state) => ({
      pendingActions: [newAction, ...state.pendingActions],
    }));

    try {
      await savePendingActionToFirestore(newAction);
    } catch (err) {
      console.error('[LiveStreamStore] Failed to save pending action in Firestore:', err);
    }

    return actionId;
  },

  recordTrace: async (traceData) => {
    const userId = get().activeUserId || 'guest_user';
    const id = `trace_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newTrace: TraceEvent = {
      ...traceData,
      id,
      userId,
      timestamp: new Date().toLocaleTimeString(),
    };

    set((state) => ({
      traces: [newTrace, ...state.traces.slice(0, 99)],
      selectedTrace: state.selectedTrace || newTrace,
    }));

    try {
      await saveTraceToFirestore(newTrace);
    } catch (err) {
      console.error('[LiveStreamStore] Failed to save trace in Firestore:', err);
    }

    return newTrace;
  },

  injectMockTrace: async () => {
    const userId = get().activeUserId || 'guest_user';
    const sampleAgents = [
      { id: 'agent_support_01', name: 'Support-Desk-Sentinel' },
      { id: 'agent_devops_02', name: 'DevOps-Rollout-Guardian' },
      { id: 'agent_outreach_03', name: 'Outreach-Lead-Enricher' },
    ];
    const pickedAgent = sampleAgents[Math.floor(Math.random() * sampleAgents.length)];
    const stepTypes: Array<'THOUGHT' | 'TOOL_INVOCATION' | 'EVALUATION' | 'OUTPUT'> = [
      'THOUGHT',
      'TOOL_INVOCATION',
      'EVALUATION',
      'OUTPUT',
    ];
    const stepType = stepTypes[Math.floor(Math.random() * stepTypes.length)];
    const riskLevels: RiskLevel[] = ['GREEN', 'GREEN', 'YELLOW', 'GREEN'];
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];

    await get().recordTrace({
      userId,
      orgId: 'org_enterprise_fleet',
      agentId: pickedAgent.id,
      agentName: pickedAgent.name,
      stepType,
      payload: {
        thought: stepType === 'THOUGHT' ? 'Inspecting agent context and verifying parameter safety boundaries.' : undefined,
        tool: stepType === 'TOOL_INVOCATION' ? 'query_customer_record' : undefined,
        args: stepType === 'TOOL_INVOCATION' ? { customer_id: 'cust_8921', scrub_pii: true } : undefined,
        result: stepType === 'EVALUATION' ? { status: 'RECORD_FOUND', masked: true } : undefined,
        answer: stepType === 'OUTPUT' ? 'Task successfully executed under AgentLens governance protocol.' : undefined,
      },
      latencyMs: Math.floor(Math.random() * 300) + 45,
      tokenCostUsd: parseFloat((Math.random() * 0.003 + 0.0002).toFixed(5)),
      riskLevel,
      status: 'SUCCESS',
    });
  },

  provisionDefaultTraces: async () => {
    const userId = get().activeUserId || 'guest_user';
    await get().recordTrace({
      userId,
      orgId: 'org_enterprise_fleet',
      agentId: 'agent_support_01',
      agentName: 'Support-Desk-Sentinel',
      stepType: 'THOUGHT',
      payload: {
        thought: 'Autonomous Agent initialized. Synchronized safety guardrails with AgentLens Gateway.',
      },
      latencyMs: 120,
      tokenCostUsd: 0.0001,
      riskLevel: 'GREEN',
      status: 'SUCCESS',
    });
  },
}));
