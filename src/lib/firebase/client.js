import { env } from '$env/dynamic/public';
const firebaseConfig = {
    apiKey: env.PUBLIC_FIREBASE_API_KEY,
    authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.PUBLIC_FIREBASE_APP_ID,
    measurementId: env.PUBLIC_FIREBASE_MEASUREMENT_ID
};
let firebaseAppPromise = null;
function requireBrowser(service) {
    if (typeof window === 'undefined') {
        throw new Error(`${service} is available only in the browser.`);
    }
}
async function getFirebaseApp() {
    requireBrowser('Firebase');
    if (!firebaseAppPromise) {
        firebaseAppPromise = import('firebase/app').then(({ getApp, getApps, initializeApp }) => getApps().length > 0 ? getApp() : initializeApp(firebaseConfig));
    }
    return firebaseAppPromise;
}
export async function getFirebaseAuth() {
    const [{ getAuth }, app] = await Promise.all([import('firebase/auth'), getFirebaseApp()]);
    return getAuth(app);
}
export async function getFirebaseFirestore() {
    const [{ getFirestore }, app] = await Promise.all([import('firebase/firestore'), getFirebaseApp()]);
    return getFirestore(app);
}
export async function getFirebaseStorage() {
    const [{ getStorage }, app] = await Promise.all([import('firebase/storage'), getFirebaseApp()]);
    return getStorage(app);
}
export async function getFirebaseAnalytics() {
    requireBrowser('Firebase Analytics');
    const [{ getAnalytics, isSupported }, app] = await Promise.all([import('firebase/analytics'), getFirebaseApp()]);
    return (await isSupported()) ? getAnalytics(app) : null;
}
