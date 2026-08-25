import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { env } from '$env/dynamic/public';

/** Browser-safe Firebase configuration only. Never add Admin credentials here. */
const firebaseConfig = {
  apiKey: env.PUBLIC_FIREBASE_API_KEY,
  authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.PUBLIC_FIREBASE_APP_ID,
  measurementId: env.PUBLIC_FIREBASE_MEASUREMENT_ID
};

export const firebaseApp: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

function requireBrowser(service: string): void {
  if (typeof window === 'undefined') {
    throw new Error(`${service} is available only in the browser.`);
  }
}

export function getFirebaseAuth(): Auth {
  requireBrowser('Firebase Authentication');
  return getAuth(firebaseApp);
}

export function getFirebaseFirestore(): Firestore {
  requireBrowser('Cloud Firestore');
  return getFirestore(firebaseApp);
}

export function getFirebaseStorage(): FirebaseStorage {
  requireBrowser('Firebase Storage');
  return getStorage(firebaseApp);
}

export async function getFirebaseAnalytics() {
  if (typeof window !== 'undefined' && (await isSupported())) {
    return getAnalytics(firebaseApp);
  }
  return null;
}
