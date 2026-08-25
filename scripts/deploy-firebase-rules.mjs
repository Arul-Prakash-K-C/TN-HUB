import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

if (process.env.CONFIRM_FIREBASE_RULES_DEPLOY !== 'SYMPHO_RULES_DEPLOY') {
  throw new Error('Refusing to deploy Firebase rules. Set CONFIRM_FIREBASE_RULES_DEPLOY=SYMPHO_RULES_DEPLOY for this one command.');
}

const [firestoreSource, storageSource] = await Promise.all([
  readFile(new URL('../firestore.rules', import.meta.url), 'utf8'),
  readFile(new URL('../storage.rules', import.meta.url), 'utf8')
]);

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });

try {
  const [{ getFirebaseAdminApp }, securityRulesModule] = await Promise.all([
    server.ssrLoadModule('/src/lib/server/firebase/admin.ts'),
    import('firebase-admin/security-rules')
  ]);
  const app = getFirebaseAdminApp();
  const bucket = app.options.storageBucket;
  if (!bucket) throw new Error('FIREBASE_ADMIN_STORAGE_BUCKET must be configured before deploying Storage rules.');

  const securityRules = securityRulesModule.getSecurityRules(app);
  const [firestoreRuleset, storageRuleset] = await Promise.all([
    securityRules.releaseFirestoreRulesetFromSource(firestoreSource),
    securityRules.releaseStorageRulesetFromSource(storageSource, bucket)
  ]);

  console.log('Firebase security rules deployed.');
  console.table({
    firestoreRuleset: firestoreRuleset.name,
    storageRuleset: storageRuleset.name,
    storageBucket: bucket
  });
} finally {
  await server.close();
}
