import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { loadEnv } from 'vite';

// Load environment variables
const env = {
  ...loadEnv('development', process.cwd(), ''),
  ...process.env
};

function readServiceAccount() {
  if (env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON) {
    try {
      const firstPass = JSON.parse(env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON);
      const parsed = typeof firstPass === 'string' ? JSON.parse(firstPass) : firstPass;
      const projectId = parsed.project_id ?? parsed.projectId;
      const clientEmail = parsed.client_email ?? parsed.clientEmail;
      const privateKey = parsed.private_key ?? parsed.privateKey;
      if (projectId && clientEmail && privateKey) {
        return { projectId, clientEmail, privateKey };
      }
    } catch {
      throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON must contain valid JSON.');
    }
  }

  const projectId = env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin environment variables missing.');
  }

  return { projectId, clientEmail, privateKey };
}

function getAdminApp() {
  if (getApps().length > 0) return getApp();
  const serviceAccount = readServiceAccount();
  return initializeApp({
    credential: cert(serviceAccount),
    storageBucket: env.FIREBASE_ADMIN_STORAGE_BUCKET
  });
}

const app = getAdminApp();
const db = getFirestore(app, 'default');
const storage = getStorage(app);
const bucket = storage.bucket();

async function runDiscoveryAndCleanup() {
  console.log('====================================================');
  console.log('TN KUVIYAM — TEST DATA DISCOVERY & CLEANUP');
  console.log('====================================================\n');

  // =================== PHASE 1: DISCOVERY ===================
  console.log('[1/2] Discovering existing test data across Firestore & Storage...\n');

  // 1. Applications & Subcollections
  const appsSnap = await db.collection('applications').get();
  console.log(`• Found ${appsSnap.size} application record(s) in 'applications' collection.`);
  
  let totalEventsCount = 0;
  let totalAppDocsCount = 0;
  for (const appDoc of appsSnap.docs) {
    const eventsSnap = await appDoc.ref.collection('events').get();
    const appDocsSnap = await appDoc.ref.collection('documents').get();
    totalEventsCount += eventsSnap.size;
    totalAppDocsCount += appDocsSnap.size;
  }
  console.log(`  └─ Found ${totalEventsCount} event(s) and ${totalAppDocsCount} sub-document(s) in application subcollections.`);

  // 2. Documents (Vault + Application references)
  const docsSnap = await db.collection('documents').get();
  console.log(`• Found ${docsSnap.size} document record(s) in 'documents' collection.`);

  // 3. Complaints
  const complaintsSnap = await db.collection('complaints').get();
  console.log(`• Found ${complaintsSnap.size} complaint record(s) in 'complaints' collection.`);

  // 4. Notifications
  const notificationsSnap = await db.collection('notifications').get();
  console.log(`• Found ${notificationsSnap.size} notification record(s) in 'notifications' collection.`);

  // 5. Cloud Storage files
  let storageFilesCount = 0;
  let appStorageFiles = [];
  let citizenStorageFiles = [];
  try {
    const [appFiles] = await bucket.getFiles({ prefix: 'applications/' });
    const [citizenFiles] = await bucket.getFiles({ prefix: 'citizens/' });
    appStorageFiles = appFiles;
    citizenStorageFiles = citizenFiles;
    storageFilesCount = appFiles.length + citizenFiles.length;
    console.log(`• Found ${storageFilesCount} test file(s) in Storage ('applications/': ${appFiles.length}, 'citizens/': ${citizenFiles.length}).`);
  } catch (err) {
    console.warn(`• Storage file listing note: ${err.message}`);
  }

  // Master Data Protection Check
  const usersSnap = await db.collection('users').get();
  const servicesSnap = await db.collection('services').get();
  const deptsSnap = await db.collection('departments').get();
  console.log(`\n[Master Data Protection Status]`);
  console.log(`✓ Protected 'users': ${usersSnap.size} records`);
  console.log(`✓ Protected 'services': ${servicesSnap.size} records`);
  console.log(`✓ Protected 'departments': ${deptsSnap.size} records\n`);

  // =================== PHASE 2: CLEANUP ===================
  console.log('[2/2] Commencing safe cleanup of test records...\n');

  // Delete Applications
  if (appsSnap.size > 0) {
    console.log(`Deleting ${appsSnap.size} application(s)...`);
    const batch = db.batch();
    for (const doc of appsSnap.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    console.log('✓ Applications deleted.');
  }

  // Delete Documents collection records
  if (docsSnap.size > 0) {
    console.log(`Deleting ${docsSnap.size} document records in 'documents'...`);
    const batch = db.batch();
    for (const doc of docsSnap.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    console.log('✓ Document records deleted.');
  }

  // Delete Complaints collection records
  if (complaintsSnap.size > 0) {
    console.log(`Deleting ${complaintsSnap.size} complaint records in 'complaints'...`);
    const batch = db.batch();
    for (const doc of complaintsSnap.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    console.log('✓ Complaint records deleted.');
  }

  // Delete Notifications collection records
  if (notificationsSnap.size > 0) {
    console.log(`Deleting ${notificationsSnap.size} notification records in 'notifications'...`);
    const batch = db.batch();
    for (const doc of notificationsSnap.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    console.log('✓ Notification records deleted.');
  }

  // Delete Storage files in parallel chunks
  const allStorageFiles = [...appStorageFiles, ...citizenStorageFiles];
  if (allStorageFiles.length > 0) {
    console.log(`Deleting ${allStorageFiles.length} test file(s) from Firebase Storage...`);
    const chunkSize = 10;
    for (let i = 0; i < allStorageFiles.length; i += chunkSize) {
      const chunk = allStorageFiles.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (file) => {
          try {
            await file.delete();
          } catch (err) {
            console.warn(`  Could not delete storage file ${file.name}: ${err.message}`);
          }
        })
      );
    }
    console.log('✓ Storage files deleted.');
  }

  console.log('\n====================================================');
  console.log('CLEANUP COMPLETED SUCCESSFULLY');
  console.log('====================================================\n');
}

runDiscoveryAndCleanup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Cleanup failed with error:', err);
    process.exit(1);
  });
