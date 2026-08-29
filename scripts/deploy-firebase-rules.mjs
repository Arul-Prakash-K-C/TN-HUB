import { readFile } from 'node:fs/promises';
import { createServer, loadEnv } from 'vite';

if (process.env.CONFIRM_FIREBASE_RULES_DEPLOY !== 'SYMPHO_RULES_DEPLOY') {
  throw new Error('Refusing to deploy Firebase rules. Set CONFIRM_FIREBASE_RULES_DEPLOY=SYMPHO_RULES_DEPLOY for this one command.');
}

const FIREBASE_RULES_API = 'https://firebaserules.googleapis.com/v1';
const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID ?? 'default';
const env = loadEnv('development', process.cwd(), '');

function getConfiguredProjectId() {
  if (env.FIREBASE_ADMIN_PROJECT_ID) return env.FIREBASE_ADMIN_PROJECT_ID;
  if (env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON) {
    const firstPass = JSON.parse(env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON);
    const serviceAccount = typeof firstPass === 'string' ? JSON.parse(firstPass) : firstPass;
    return serviceAccount.project_id ?? serviceAccount.projectId;
  }
  return env.PUBLIC_FIREBASE_PROJECT_ID;
}

async function releaseFirestoreRulesetForDatabase(app, source, databaseId) {
  const projectId = getConfiguredProjectId();
  if (!projectId) {
    throw new Error('Firebase project ID is required before deploying Firestore rules.');
  }
  const token = await app.options.credential.getAccessToken();
  const authorization = `Bearer ${token.access_token}`;
  const attachmentPoint = `firestore.googleapis.com/databases/${databaseId}`;
  const releaseName = `projects/${projectId}/releases/cloud.firestore/${databaseId}`;

  const createRuleset = await fetch(`${FIREBASE_RULES_API}/projects/${projectId}/rulesets`, {
    method: 'POST',
    headers: {
      authorization,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      source: {
        files: [{ name: 'firestore.rules', content: source }],
        attachment_point: attachmentPoint
      }
    })
  });
  const ruleset = await createRuleset.json();
  if (!createRuleset.ok) {
    throw new Error(`Unable to create Firestore ruleset for database ${databaseId}: ${ruleset.error?.message ?? createRuleset.status}`);
  }

  const releaseBody = JSON.stringify({
    release: {
      name: releaseName,
      rulesetName: ruleset.name
    }
  });
  const updateRelease = await fetch(`${FIREBASE_RULES_API}/${releaseName}`, {
    method: 'PATCH',
    headers: {
      authorization,
      'content-type': 'application/json'
    },
    body: releaseBody
  });
  if (updateRelease.ok) {
    return { rulesetName: ruleset.name, releaseName };
  }

  const updatePayload = await updateRelease.json().catch(() => null);
  if (updateRelease.status !== 404) {
    throw new Error(`Unable to update Firestore rules release ${releaseName}: ${updatePayload?.error?.message ?? updateRelease.status}`);
  }

  const createRelease = await fetch(`${FIREBASE_RULES_API}/projects/${projectId}/releases`, {
    method: 'POST',
    headers: {
      authorization,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      name: releaseName,
      rulesetName: ruleset.name
    })
  });
  const createPayload = await createRelease.json().catch(() => null);
  if (!createRelease.ok) {
    throw new Error(`Unable to create Firestore rules release ${releaseName}: ${createPayload?.error?.message ?? createRelease.status}`);
  }
  return { rulesetName: ruleset.name, releaseName };
}

const [firestoreSource, storageSource] = await Promise.all([
  readFile(new URL('../firestore.rules', import.meta.url), 'utf8'),
  readFile(new URL('../storage.rules', import.meta.url), 'utf8')
]);

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });

try {
  const [{ getFirebaseAdminApp }, securityRulesModule] = await Promise.all([
    server.ssrLoadModule('/src/lib/server/firebase/admin.js'),
    import('firebase-admin/security-rules')
  ]);
  const app = getFirebaseAdminApp();
  const bucket = app.options.storageBucket;
  if (!bucket) throw new Error('FIREBASE_ADMIN_STORAGE_BUCKET must be configured before deploying Storage rules.');

  const securityRules = securityRulesModule.getSecurityRules(app);
  const [firestoreRelease, storageRuleset] = await Promise.all([
    releaseFirestoreRulesetForDatabase(app, firestoreSource, firestoreDatabaseId),
    securityRules.releaseStorageRulesetFromSource(storageSource, bucket)
  ]);

  console.log('Firebase security rules deployed.');
  console.table({
    firestoreRuleset: firestoreRelease.rulesetName,
    firestoreRelease: firestoreRelease.releaseName,
    firestoreDatabaseId,
    storageRuleset: storageRuleset.name,
    storageBucket: bucket
  });
} finally {
  await server.close();
}
