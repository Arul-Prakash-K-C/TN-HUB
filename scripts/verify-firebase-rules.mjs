import { createServer, loadEnv } from 'vite';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  setDoc
} from 'firebase/firestore';

const publicEnv = loadEnv('development', process.cwd(), 'PUBLIC_');
const firebaseConfig = {
  apiKey: publicEnv.PUBLIC_FIREBASE_API_KEY,
  authDomain: publicEnv.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: publicEnv.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: publicEnv.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: publicEnv.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: publicEnv.PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'default');

const results = [];
const OPERATION_TIMEOUT_MS = 25_000;

function record(test, status, details = '') {
  results.push({ test, status, details });
}

function withTimeout(promise, label, timeoutMs = OPERATION_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

async function run() {
  console.log('Starting Client SDK Rules Verification...');

  // 1. Unauthenticated checks
  await signOut(auth).catch(() => {});
  try {
    await withTimeout(getDoc(doc(db, 'users', 'some-random-id')), 'Unauthenticated user read');
    record('Unauthenticated user read', 'failed', 'Unauthenticated read was allowed unexpectedly');
  } catch (err) {
    record('Unauthenticated user read', 'passed', 'Denied as expected: ' + err.code);
  }

  try {
    await withTimeout(setDoc(doc(db, 'auditLogs', 'test-log'), { test: true }), 'Unauthenticated auditLog write');
    record('Unauthenticated auditLog write', 'failed', 'Unauthenticated write was allowed');
  } catch (err) {
    record('Unauthenticated auditLog write', 'passed', 'Denied as expected: ' + err.code);
  }

  // 2. Citizen login (meena@demo.com)
  try {
    const userCredential = await withTimeout(
      signInWithEmailAndPassword(auth, 'meena@demo.com', 'demo123'),
      'Citizen authentication'
    );
    const uid = userCredential.user.uid;

    // Citizen reads own profile
    try {
      const ownProfile = await withTimeout(getDoc(doc(db, 'users', uid)), 'Citizen own profile read');
      record(
        'Citizen own profile read',
        ownProfile.exists() ? 'passed' : 'failed',
        ownProfile.exists() ? 'Can read own profile' : `users/${uid} does not exist`
      );
    } catch (err) {
      record('Citizen own profile read', 'failed', err.message);
    }

    // Citizen attempts forbidden profile update (updating role)
    try {
      await withTimeout(updateDoc(doc(db, 'users', uid), { role: 'admin' }), 'Citizen profile role escalation');
      record('Citizen profile role escalation', 'failed', 'Role escalation write was permitted');
    } catch (err) {
      record('Citizen profile role escalation', 'passed', 'Blocked profile role change: ' + err.code);
    }

    // Citizen reads audit logs (forbidden)
    try {
      await withTimeout(getDocs(collection(db, 'auditLogs')), 'Citizen auditLogs read');
      record('Citizen auditLogs read', 'failed', 'Citizen read audit logs');
    } catch (err) {
      record('Citizen auditLogs read', 'passed', 'Blocked auditLog read: ' + err.code);
    }

    await signOut(auth);
  } catch (err) {
    record('Citizen authentication', 'failed', err.message);
  }

  // 3. Department User login (rajesh@demo.com - Revenue)
  try {
    await withTimeout(
      signInWithEmailAndPassword(auth, 'rajesh@demo.com', 'demo123'),
      'Department user authentication'
    );

    // Revenue user queries applications
    try {
      const q = query(collection(db, 'applications'), where('departmentId', '==', 'dept-revenue'));
      const snapshot = await withTimeout(getDocs(q), 'Department user scoped application read');
      record('Department user scoped application read', 'passed', `Found ${snapshot.docs.length} Revenue applications`);
    } catch (err) {
      record('Department user scoped application read', 'failed', err.code || err.message);
    }

    // Revenue user attempts to read Civil Supplies applications directly
    try {
      const q = query(collection(db, 'applications'), where('departmentId', '==', 'dept-civil-supplies'));
      const snapshot = await withTimeout(getDocs(q), 'Department user foreign application read');
      // In rules, if query contains departmentId == dept-civil-supplies, department_user rule checks request.auth.token.departmentId == resource.data.departmentId
      record(
        'Department user foreign application read',
        snapshot.empty ? 'passed' : 'failed',
        `QueryResult length: ${snapshot.docs.length}`
      );
    } catch (err) {
      record('Department user foreign application read', 'passed', 'Denied foreign department query: ' + err.code);
    }

    await signOut(auth);
  } catch (err) {
    record('Department user authentication', 'failed', err.message);
  }

  console.table(results);
  process.exit(results.some((result) => result.status === 'failed') ? 1 : 0);
}

run().catch((err) => {
  console.error('Rules verification script failed:', err);
  process.exit(1);
});
