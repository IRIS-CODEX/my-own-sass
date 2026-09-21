import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Agent, VirtualKey, ToolPolicy, AgentPromptRule, TraceEvent, PendingAction } from '../types';

// ==========================================
// 1. AGENTS SERVICE
// ==========================================

export function subscribeToUserAgents(
  userId: string,
  onData: (agents: Agent[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'agents';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Agent[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Agent);
        });
        onData(items);
      },
      (error) => {
        if (onError) {
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch (e: any) {
            onError(e);
          }
        } else {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveAgentToFirestore(agent: Agent): Promise<void> {
  const path = `agents/${agent.id}`;
  try {
    await setDoc(doc(db, 'agents', agent.id), agent);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateAgentInFirestore(agentId: string, partial: Partial<Agent>): Promise<void> {
  const path = `agents/${agentId}`;
  try {
    await updateDoc(doc(db, 'agents', agentId), partial);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteAgentFromFirestore(agentId: string): Promise<void> {
  const path = `agents/${agentId}`;
  try {
    await deleteDoc(doc(db, 'agents', agentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 2. VIRTUAL KEYS SERVICE
// ==========================================

export function subscribeToUserVirtualKeys(
  userId: string,
  onData: (keys: VirtualKey[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'virtualKeys';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: VirtualKey[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as VirtualKey);
        });
        onData(items);
      },
      (error) => {
        if (onError) {
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch (e: any) {
            onError(e);
          }
        } else {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveVirtualKeyToFirestore(key: VirtualKey): Promise<void> {
  const path = `virtualKeys/${key.id}`;
  try {
    await setDoc(doc(db, 'virtualKeys', key.id), key);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateVirtualKeyInFirestore(keyId: string, partial: Partial<VirtualKey>): Promise<void> {
  const path = `virtualKeys/${keyId}`;
  try {
    await updateDoc(doc(db, 'virtualKeys', keyId), partial);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteVirtualKeyFromFirestore(keyId: string): Promise<void> {
  const path = `virtualKeys/${keyId}`;
  try {
    await deleteDoc(doc(db, 'virtualKeys', keyId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 3. TOOL POLICIES SERVICE
// ==========================================

export function subscribeToUserPolicies(
  userId: string,
  onData: (policies: ToolPolicy[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'policies';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ToolPolicy[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as ToolPolicy);
        });
        onData(items);
      },
      (error) => {
        if (onError) {
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch (e: any) {
            onError(e);
          }
        } else {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function savePolicyToFirestore(policy: ToolPolicy): Promise<void> {
  const path = `policies/${policy.id}`;
  try {
    await setDoc(doc(db, 'policies', policy.id), policy);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updatePolicyInFirestore(policyId: string, partial: Partial<ToolPolicy>): Promise<void> {
  const path = `policies/${policyId}`;
  try {
    await updateDoc(doc(db, 'policies', policyId), partial);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deletePolicyFromFirestore(policyId: string): Promise<void> {
  const path = `policies/${policyId}`;
  try {
    await deleteDoc(doc(db, 'policies', policyId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 4. PROMPT RULES SERVICE
// ==========================================

export function subscribeToUserPromptRules(
  userId: string,
  onData: (rules: AgentPromptRule[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'promptRules';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: AgentPromptRule[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as AgentPromptRule);
        });
        onData(items);
      },
      (error) => {
        if (onError) {
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch (e: any) {
            onError(e);
          }
        } else {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function savePromptRuleToFirestore(rule: AgentPromptRule): Promise<void> {
  const path = `promptRules/${rule.id}`;
  try {
    await setDoc(doc(db, 'promptRules', rule.id), rule);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updatePromptRuleInFirestore(ruleId: string, partial: Partial<AgentPromptRule>): Promise<void> {
  const path = `promptRules/${ruleId}`;
  try {
    await updateDoc(doc(db, 'promptRules', ruleId), partial);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deletePromptRuleFromFirestore(ruleId: string): Promise<void> {
  const path = `promptRules/${ruleId}`;
  try {
    await deleteDoc(doc(db, 'promptRules', ruleId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 5. TRACE EVENTS SERVICE
// ==========================================

export function subscribeToUserTraces(
  userId: string,
  onData: (traces: TraceEvent[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'traceEvents';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: TraceEvent[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as TraceEvent);
        });
        onData(items);
      },
      (error) => {
        if (onError) {
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch (e: any) {
            onError(e);
          }
        } else {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveTraceToFirestore(trace: TraceEvent): Promise<void> {
  const path = `traceEvents/${trace.id}`;
  try {
    await setDoc(doc(db, 'traceEvents', trace.id), trace);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// 6. PENDING ACTIONS (HITL) SERVICE
// ==========================================

export function subscribeToUserPendingActions(
  userId: string,
  onData: (actions: PendingAction[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'pendingActions';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: PendingAction[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as PendingAction);
        });
        onData(items);
      },
      (error) => {
        if (onError) {
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch (e: any) {
            onError(e);
          }
        } else {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function savePendingActionToFirestore(action: PendingAction): Promise<void> {
  const path = `pendingActions/${action.actionId}`;
  try {
    await setDoc(doc(db, 'pendingActions', action.actionId), action);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updatePendingActionInFirestore(actionId: string, partial: Partial<PendingAction>): Promise<void> {
  const path = `pendingActions/${actionId}`;
  try {
    await updateDoc(doc(db, 'pendingActions', actionId), partial);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deletePendingActionFromFirestore(actionId: string): Promise<void> {
  const path = `pendingActions/${actionId}`;
  try {
    await deleteDoc(doc(db, 'pendingActions', actionId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
