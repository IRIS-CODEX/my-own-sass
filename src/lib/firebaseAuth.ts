import {
  auth,
  db,
  googleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
  handleFirestoreError,
  OperationType,
  FirebaseUserProfile,
  onAuthStateChanged,
} from './firebase';
import { User } from 'firebase/auth';

export type { FirebaseUserProfile };

/**
 * Signs in with Google using Firebase Auth popup.
 */
export async function firebaseSignInWithGoogle(chosenPlan?: string): Promise<{
  success: boolean;
  user?: FirebaseUserProfile;
  error?: string;
}> {
  try {
    const cred = await signInWithPopup(auth, googleAuthProvider);
    const fbUser = cred.user;

    // Check or create Firestore document
    const userRef = doc(db, 'users', fbUser.uid);
    let profile: FirebaseUserProfile;

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        profile = snap.data() as FirebaseUserProfile;
        // update lastLoginAt and planTier if user picked a new plan
        const updates: Partial<FirebaseUserProfile> = {
          lastLoginAt: new Date().toISOString(),
        };
        if (chosenPlan && chosenPlan !== profile.planTier) {
          updates.planTier = chosenPlan;
          profile.planTier = chosenPlan;
        }
        await updateDoc(userRef, updates);
      } else {
        const orgName = fbUser.displayName ? `${fbUser.displayName}'s Organization` : 'My Autonomous Labs';
        profile = {
          id: fbUser.uid,
          email: fbUser.email || 'user@agentlens.internal',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'AgentLens User',
          organizationName: orgName,
          planTier: chosenPlan || 'PRO_MONTHLY',
          role: 'owner',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await setDoc(userRef, profile);
      }
    } catch (dbErr) {
      console.warn('Firestore profile write notice:', dbErr);
      // Fallback profile if Firestore is restricted
      profile = {
        id: fbUser.uid,
        email: fbUser.email || 'user@agentlens.internal',
        displayName: fbUser.displayName || 'AgentLens User',
        organizationName: 'Fleet Organization',
        planTier: chosenPlan || 'PRO_MONTHLY',
        role: 'owner',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    let message = error.message || 'Google authentication failed';
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'Sign-in popup was closed before completion.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      message = 'Sign-in request was cancelled.';
    } else if (error.code === 'auth/popup-blocked') {
      message = 'Sign-in popup was blocked by browser. Please allow popups for this site.';
    }
    return { success: false, error: message };
  }
}

/**
 * Registers a new user with Email and Password using Firebase Auth and stores profile in Firestore.
 */
export async function firebaseSignUpWithEmail(
  name: string,
  email: string,
  pass: string,
  organizationName: string,
  planTier: string
): Promise<{
  success: boolean;
  user?: FirebaseUserProfile;
  error?: string;
}> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const fbUser = cred.user;

    // Update Firebase Auth profile
    try {
      await updateProfile(fbUser, { displayName: name });
    } catch (e) {
      console.warn('Failed to update auth displayName', e);
    }

    const profile: FirebaseUserProfile = {
      id: fbUser.uid,
      email: fbUser.email || email.trim(),
      displayName: name.trim(),
      organizationName: organizationName.trim(),
      planTier: planTier || 'PRO_MONTHLY',
      role: 'owner',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Store in Firestore
    try {
      await setDoc(doc(db, 'users', fbUser.uid), profile);
    } catch (dbErr) {
      console.warn('Firestore setDoc user profile error:', dbErr);
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Firebase Sign-Up Error:', error);
    let message = error.message || 'Account creation failed';
    if (error.code === 'auth/email-already-in-use') {
      message = 'An account already exists with this email address. Please sign in instead.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak. Please use at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address provided.';
    } else if (error.code === 'auth/operation-not-allowed') {
      message = 'Email/password sign-up is pending activation in Firebase console. You can use Google Sign-In or Demo login below.';
    }
    return { success: false, error: message };
  }
}

/**
 * Signs in an existing user with Email and Password using Firebase Auth.
 */
export async function firebaseSignInWithEmail(
  email: string,
  pass: string
): Promise<{
  success: boolean;
  user?: FirebaseUserProfile;
  error?: string;
}> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const fbUser = cred.user;

    // Fetch profile from Firestore
    let profile: FirebaseUserProfile | null = null;
    try {
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      if (snap.exists()) {
        profile = snap.data() as FirebaseUserProfile;
        // update lastLoginAt
        await updateDoc(doc(db, 'users', fbUser.uid), {
          lastLoginAt: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn('Firestore fetch user error:', dbErr);
    }

    if (!profile) {
      profile = {
        id: fbUser.uid,
        email: fbUser.email || email.trim(),
        displayName: fbUser.displayName || email.split('@')[0],
        organizationName: `${email.split('@')[0].toUpperCase()} Organization`,
        planTier: 'PRO_MONTHLY',
        role: 'owner',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Firebase Sign-In Error:', error);
    let message = error.message || 'Authentication failed';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      message = 'Invalid email or password. Please verify credentials or use One-Click Demo Access.';
    } else if (error.code === 'auth/operation-not-allowed') {
      message = 'Email/password sign-in is pending activation in Firebase console. Please use Google Sign-In or Demo login below.';
    }
    return { success: false, error: message };
  }
}

/**
 * Signs out from Firebase Auth.
 */
export async function firebaseSignOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Firebase Sign-Out Error:', err);
  }
}

/**
 * Fetches all registered users from Firestore users collection.
 */
export async function fetchAllFirestoreUsers(): Promise<FirebaseUserProfile[]> {
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    const users: FirebaseUserProfile[] = [];
    snap.forEach((d) => {
      users.push(d.data() as FirebaseUserProfile);
    });
    return users;
  } catch (err) {
    console.warn('Could not fetch all users from Firestore (rules or permissions):', err);
    return [];
  }
}

/**
 * Subscribes to real-time changes of all registered users in Firestore.
 */
export function subscribeToFirestoreUsers(
  onUpdate: (users: FirebaseUserProfile[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const colRef = collection(db, 'users');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const users: FirebaseUserProfile[] = [];
        snapshot.forEach((doc) => {
          users.push(doc.data() as FirebaseUserProfile);
        });
        onUpdate(users);
      },
      (error) => {
        if (onError) onError(error);
        else console.warn('Firestore users subscription notice:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToFirestoreUsers init error:', err);
    return () => {};
  }
}

/**
 * Listens for real-time Firebase Auth state changes and loads the user profile.
 */
export function onFirebaseAuthStateChanged(callback: (user: FirebaseUserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        callback(snap.data() as FirebaseUserProfile);
      } else {
        const profile: FirebaseUserProfile = {
          id: fbUser.uid,
          email: fbUser.email || 'user@agentlens.internal',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'AgentLens User',
          organizationName: fbUser.displayName ? `${fbUser.displayName}'s Organization` : 'My Autonomous Labs',
          planTier: 'PRO_MONTHLY',
          role: 'owner',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        callback(profile);
      }
    } catch {
      callback(null);
    }
  });
}
