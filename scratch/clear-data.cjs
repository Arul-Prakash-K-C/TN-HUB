const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const parts = line.split('=');
  const k = parts.shift();
  const v = parts.join('=');
  if(k && v) {
    acc[k.trim()] = v.trim().replace(/^['"]|['"]$/g, '');
  }
  return acc;
}, {});

const admin = require('firebase-admin');
const projectId = env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId) throw new Error('No credentials');

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey })
});

const db = admin.firestore();

async function clear() {
  const apps = await db.collection('applications').get();
  const batch = db.batch();
  apps.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log('Deleted ' + apps.docs.length + ' applications.');

  const docs = await db.collection('documents').get();
  const batch2 = db.batch();
  docs.docs.forEach(doc => batch2.delete(doc.ref));
  await batch2.commit();
  console.log('Deleted ' + docs.docs.length + ' documents.');
}

clear().catch(console.error).finally(()=>process.exit(0));
