import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env', 'utf-8');
let serviceAccountJsonStr = '';

envContent.split('\n').forEach(line => {
  const match = line.match(/^FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON='(.*)'$/);
  if (match) {
    serviceAccountJsonStr = match[1];
  }
});

const serviceAccount = JSON.parse(serviceAccountJsonStr);

try {
  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  const db = getFirestore(app, 'default'); // EXPLICITLY pass 'default' as the database name
  console.log('Testing connection to Firestore...');
  
  db.collection('test_connection').limit(1).get()
    .then(() => {
      console.log('✅ Successfully connected to Firestore!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to connect to Firestore.');
      console.error('Error Code:', error.code);
      console.error('Error Message:', error.message);
      process.exit(1);
    });
} catch (error) {
  console.error('Initialization error:', error);
}
