import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';

async function listDatabases() {
  const envContent = readFileSync('.env', 'utf-8');
  let serviceAccountJsonStr = '';

  envContent.split('\n').forEach(line => {
    const match = line.match(/^FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON='(.*)'$/);
    if (match) {
      serviceAccountJsonStr = match[1];
    }
  });

  const credentials = JSON.parse(serviceAccountJsonStr);

  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/datastore'],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const projectId = credentials.project_id || credentials.projectId;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases`;
  console.log(`Fetching ${url}...`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token.token}`,
    },
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

listDatabases().catch(console.error);
