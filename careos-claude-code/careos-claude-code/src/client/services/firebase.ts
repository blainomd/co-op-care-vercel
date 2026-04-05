/**
 * Firebase — Auth-only configuration
 *
 * Uses Google sign-in so each user gets a unique, persistent identity.
 * All config comes from VITE_ environment variables.
 *
 * Setup:
 *   1. Create a Firebase project at https://console.firebase.google.com
 *   2. Enable Authentication → Sign-in method → Google
 *   3. Add your Vercel domain to Authorized domains
 *   4. Copy the web app config into .env (see VITE_FIREBASE_* vars)
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

// ─── Config from environment ────────────────────────────────────────

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** Whether Firebase is configured (all required fields present) */
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !!firebaseConfig.authDomain && !!firebaseConfig.projectId;

// Only initialize if configured
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

// ─── Auth helpers ───────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  if (!auth) {
    console.warn('Firebase not configured — using local-only mode');
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in failed:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  if (!auth) return;
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) {
    // Not configured — immediately report no user
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): FirebaseUser | null {
  return auth?.currentUser ?? null;
}

export type { FirebaseUser };
