import { createServer } from 'vite';

const confirmation = process.env.CONFIRM_DEMO_AUTH_SEED;
if (confirmation !== 'SYMPHO_DEMO_AUTH_SEED') {
  throw new Error('Refusing to create demo Auth users. Set CONFIRM_DEMO_AUTH_SEED=SYMPHO_DEMO_AUTH_SEED for this one command.');
}

if (
  process.env.NODE_ENV === 'production' &&
  process.env.ALLOW_PRODUCTION_DEMO_AUTH_SEED !== 'SYMPHO_PRODUCTION_DEMO_AUTH_SEED'
) {
  throw new Error(
    'Refusing to create demo Auth users with NODE_ENV=production. Set ALLOW_PRODUCTION_DEMO_AUTH_SEED=SYMPHO_PRODUCTION_DEMO_AUTH_SEED only for an intentional demo environment.'
  );
}

// This remains compatible with the existing visible Phase 1 demo credentials.
const demoPassword = process.env.DEMO_AUTH_PASSWORD ?? 'demo123';
if (demoPassword.length < 6) {
  throw new Error('DEMO_AUTH_PASSWORD must contain at least six characters.');
}

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });

try {
  const [adminModule, userModule, identityModule] = await Promise.all([
    server.ssrLoadModule('/src/lib/server/firebase/admin.js'),
    server.ssrLoadModule('/src/lib/data/users.js'),
    server.ssrLoadModule('/src/lib/auth/identity.js')
  ]);
  const { getFirebaseAdminAuth, getFirebaseAdminFirestore } = adminModule;
  const { normalizeUserRole } = identityModule;
  const demoUsers = [
    userModule.demoCitizen,
    userModule.demoOfficer,
    userModule.demoCivilSuppliesOfficer,
    userModule.demoOperator,
    userModule.demoAdmin
  ];
  const auth = getFirebaseAdminAuth();
  const db = getFirebaseAdminFirestore();
  const result = { created: 0, existing: 0, claimsUpdated: 0 };

  for (const demoUser of demoUsers) {
    const profile = await db.collection('users').doc(demoUser.id).get();
    if (!profile.exists || profile.get('seededDemo') !== true) {
      throw new Error(`Refusing to provision ${demoUser.id}: its Firestore profile is not a seeded demo profile.`);
    }
    if (profile.get('email') !== demoUser.email) {
      throw new Error(`Refusing to provision ${demoUser.id}: Firestore email does not match the local demo fixture.`);
    }

    let authUser;
    try {
      authUser = await auth.getUser(demoUser.id);
      result.existing += 1;
      if (authUser.email !== demoUser.email) {
        throw new Error(`Refusing to modify ${demoUser.id}: its existing Auth email does not match the demo fixture.`);
      }
    } catch (cause) {
      if ((cause && typeof cause === 'object' && 'code' in cause && cause.code === 'auth/user-not-found')) {
        authUser = await auth.createUser({
          uid: demoUser.id,
          email: demoUser.email,
          displayName: demoUser.name,
          password: demoPassword,
          emailVerified: true,
          disabled: false
        });
        result.created += 1;
      } else {
        throw cause;
      }
    }

    const role = normalizeUserRole(demoUser.role);
    const claims = {
      role,
      isActive: demoUser.isActive,
      preferredLanguage: demoUser.preferredLanguage,
      ...(role === 'department_user'
        ? {
            departmentId: demoUser.departmentId,
            departmentName: demoUser.departmentName
          }
        : {})
    };
    await auth.setCustomUserClaims(authUser.uid, claims);
    result.claimsUpdated += 1;
  }

  console.log('Demo Firebase Authentication provisioning completed.');
  console.table(result);
} finally {
  await server.close();
}
