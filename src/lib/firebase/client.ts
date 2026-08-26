import { env } from '$env/dynamic/public';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
	apiKey: env.PUBLIC_FIREBASE_API_KEY,
	authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: env.PUBLIC_FIREBASE_APP_ID,
	measurementId: env.PUBLIC_FIREBASE_MEASUREMENT_ID
};

let firebaseAppPromise: Promise<FirebaseApp> | null = null;

function requireBrowser(service: string): void {
	if (typeof window === 'undefined') {
		throw new Error(`${service} is available only in the browser.`);
	}
}

async function getFirebaseApp(): Promise<FirebaseApp> {
	requireBrowser('Firebase');

	if (!firebaseAppPromise) {
		firebaseAppPromise = import('firebase/app').then(({ getApp, getApps, initializeApp }) =>
			getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
		);
	}

	return firebaseAppPromise;
}

export async function getFirebaseAuth(): Promise<Auth> {
	const [{ getAuth }, app] = await Promise.all([import('firebase/auth'), getFirebaseApp()]);
	return getAuth(app);
}

export async function getFirebaseFirestore(): Promise<Firestore> {
	const [{ getFirestore }, app] = await Promise.all([import('firebase/firestore'), getFirebaseApp()]);
	return getFirestore(app);
}

export async function getFirebaseStorage(): Promise<FirebaseStorage> {
	const [{ getStorage }, app] = await Promise.all([import('firebase/storage'), getFirebaseApp()]);
	return getStorage(app);
}

export async function getFirebaseAnalytics() {
	requireBrowser('Firebase Analytics');
	const [{ getAnalytics, isSupported }, app] = await Promise.all([import('firebase/analytics'), getFirebaseApp()]);
	return (await isSupported()) ? getAnalytics(app) : null;
}
