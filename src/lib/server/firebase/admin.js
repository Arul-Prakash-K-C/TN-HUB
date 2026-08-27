import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { env } from '$env/dynamic/private';
function readServiceAccount() {
    if (env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON) {
        try {
            // `.env` values are occasionally supplied as a JSON string containing
            // the JSON service-account object. Accept that representation as well
            // as the normal object, while keeping this parsing strictly server-only.
            const firstPass = JSON.parse(env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON);
            const parsed = (typeof firstPass === 'string' ? JSON.parse(firstPass) : firstPass);
            const projectId = parsed.project_id ?? parsed.projectId;
            const clientEmail = parsed.client_email ?? parsed.clientEmail;
            const privateKey = parsed.private_key ?? parsed.privateKey;
            if (projectId && clientEmail && privateKey) {
                return { projectId, clientEmail, privateKey };
            }
        }
        catch {
            throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON must contain valid service-account JSON.');
        }
        throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON is missing required service-account fields.');
    }
    const projectId = env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Firebase Admin is not configured. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON or FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.');
    }
    return { projectId, clientEmail, privateKey };
}
/** Lazily creates the server-only Admin app so public pages can build without credentials. */
export function getFirebaseAdminApp() {
    if (getApps().length > 0) {
        return getApp();
    }
    const serviceAccount = readServiceAccount();
    // Firebase Admin accepts camel-case fields, while the underlying Google Auth
    // client reads the original credential object using service-account JSON
    // field names. Include both representations so token exchange is reliable.
    const credential = {
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKey: serviceAccount.privateKey,
        project_id: serviceAccount.projectId,
        client_email: serviceAccount.clientEmail,
        private_key: serviceAccount.privateKey
    };
    return initializeApp({
        credential: cert(credential),
        storageBucket: env.FIREBASE_ADMIN_STORAGE_BUCKET
    });
}
export function getFirebaseAdminAuth() {
    return getAuth(getFirebaseAdminApp());
}
export function getFirebaseAdminFirestore() {
    return getFirestore(getFirebaseAdminApp(), 'default');
}
export function getFirebaseAdminStorage() {
    return getStorage(getFirebaseAdminApp());
}
