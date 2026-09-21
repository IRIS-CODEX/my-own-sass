import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

/* CRITICAL: The app will break without specifying firestoreDatabaseId */
const databaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true,
    },
    databaseId
  );
} catch {
  firestoreInstance = getFirestore(app, databaseId);
}
export const db = firestoreInstance;
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export { onAuthStateChanged };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test with graceful diagnostics
export async function testConnection() {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    await getDocFromServer(testDocRef);
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client running in offline mode. Local cache active.');
    } else {
      console.debug('[Firebase] Initialization status:', error?.message || error);
    }
  }
}

// Run connection check in background without blocking
testConnection().catch(() => {});

export interface FirebaseUserProfile {
  id: string;
  email: string;
  displayName: string;
  organizationName: string;
  planTier: string;
  role: 'user' | 'admin' | 'owner' | 'super-admin';
  createdAt?: string;
  lastLoginAt?: string;
  phone?: string;
  jobTitle?: string;
  useCase?: string;
  authProvider?: string;
  requestsUsed?: number;
  requestLimit?: number;
  activeAgentsCount?: number;
  virtualKeysCount?: number;
  monthlySpendUsd?: number;
  paymentMethod?: string;
}

// Helper to save or update user profile in Firestore
export async function saveUserProfileToFirestore(profile: FirebaseUserProfile): Promise<void> {
  const userDocRef = doc(db, 'users', profile.id);
  try {
    const existingSnap = await getDoc(userDocRef);
    if (!existingSnap.exists()) {
      await setDoc(userDocRef, profile);
    } else {
      await updateDoc(userDocRef, {
        displayName: profile.displayName || existingSnap.data()?.displayName || '',
        organizationName: profile.organizationName || existingSnap.data()?.organizationName || '',
        planTier: profile.planTier || existingSnap.data()?.planTier || 'FREE',
        lastLoginAt: profile.lastLoginAt,
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${profile.id}`);
  }
}

// Helper to fetch user profile from Firestore
export async function getUserProfileFromFirestore(userId: string): Promise<FirebaseUserProfile | null> {
  const userDocRef = doc(db, 'users', userId);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as FirebaseUserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${userId}`);
  }
}

export {
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  limit,
};
