/**
 * Firebase Auth Store — bridges Firebase Auth with app state
 *
 * Each user gets isolated localStorage via their Firebase UID.
 * When a new user signs in, stale data from a previous user is cleared.
 *
 * Works in two modes:
 *   1. Firebase configured → real Google sign-in, per-user data
 *   2. Firebase NOT configured → falls through to localStorage-only mode
 */
import { create } from 'zustand';
import {
  signInWithGoogle,
  signOut,
  onAuthChange,
  isFirebaseConfigured,
  type FirebaseUser,
} from '../services/firebase';

// ─── Per-User Storage Isolation ────────────────────────────────────

const USER_KEY = 'coop_current_uid';

/** Get the stored UID of the last signed-in user */
function getStoredUid(): string | null {
  try {
    return localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

/** Clear all co-op.care localStorage when a different user signs in */
function clearUserData() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('coop_') || key.startsWith('sage_') || key.startsWith('careos'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ok */
  }
}

/** When a user signs in, isolate their data */
function handleUserSwitch(uid: string) {
  const previousUid = getStoredUid();
  if (previousUid && previousUid !== uid) {
    // Different user → wipe previous user's data
    clearUserData();
  }
  try {
    localStorage.setItem(USER_KEY, uid);
  } catch {
    /* ok */
  }
}

// ─── Store ─────────────────────────────────────────────────────────

interface FirebaseAuthState {
  firebaseUser: FirebaseUser | null;
  isSignedIn: boolean;
  isLoading: boolean;
  /** Whether Firebase is configured at all */
  isConfigured: boolean;

  // Actions
  googleSignIn: () => Promise<boolean>;
  logOut: () => Promise<void>;
  /** Called once on app init to listen for auth state */
  initAuth: () => () => void;
}

export const useFirebaseAuthStore = create<FirebaseAuthState>((set) => ({
  firebaseUser: null,
  isSignedIn: false,
  isLoading: true,
  isConfigured: isFirebaseConfigured,

  googleSignIn: async () => {
    const user = await signInWithGoogle();
    if (user) {
      handleUserSwitch(user.uid);
      set({ firebaseUser: user, isSignedIn: true });
      return true;
    }
    return false;
  },

  logOut: async () => {
    await signOut();
    clearUserData();
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ok */
    }
    set({ firebaseUser: null, isSignedIn: false });
    // Reload to reset all Zustand stores
    window.location.reload();
  },

  initAuth: () => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        handleUserSwitch(user.uid);
        set({ firebaseUser: user, isSignedIn: true, isLoading: false });
      } else {
        set({ firebaseUser: null, isSignedIn: false, isLoading: false });
      }
    });
    return unsubscribe;
  },
}));
