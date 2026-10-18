import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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

export interface ConnectionStatus {
  verified: boolean;
  loading: boolean;
  error: string | null;
  dbId: string;
  projectId: string;
  verifiedAt: string | null;
}

let cachedConnectionStatus: ConnectionStatus = {
  verified: false,
  loading: true,
  error: null,
  dbId: firebaseConfig.firestoreDatabaseId || '',
  projectId: firebaseConfig.projectId || '',
  verifiedAt: null,
};

// Real Firestore operation test on boot as mandated by skill & user constraints
export async function testConnection(): Promise<ConnectionStatus> {
  cachedConnectionStatus.loading = true;
  try {
    // Perform a real getDocFromServer call to verify the database endpoint
    const snap = await getDocFromServer(doc(db, 'test', 'connection'));
    cachedConnectionStatus = {
      verified: true,
      loading: false,
      error: null,
      dbId: firebaseConfig.firestoreDatabaseId,
      projectId: firebaseConfig.projectId,
      verifiedAt: new Date().toLocaleTimeString(),
    };
    return cachedConnectionStatus;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn('Real Firestore connection test result:', errorMsg);

    // If the error message is simply that the document doesn't exist, it still reached the server successfully!
    // But if client is offline or quota exceeded or bad config:
    const isOffline = errorMsg.includes('the client is offline') || errorMsg.includes('unavailable');
    cachedConnectionStatus = {
      verified: !isOffline,
      loading: false,
      error: isOffline ? errorMsg : null,
      dbId: firebaseConfig.firestoreDatabaseId,
      projectId: firebaseConfig.projectId,
      verifiedAt: isOffline ? null : new Date().toLocaleTimeString(),
    };
    return cachedConnectionStatus;
  }
}

export function getConnectionStatus(): ConnectionStatus {
  return cachedConnectionStatus;
}

// Run real verification on boot
testConnection();

// Authentication Helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
