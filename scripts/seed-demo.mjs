import { createServer } from 'vite';

const confirmation = process.env.CONFIRM_DEMO_SEED;
if (confirmation !== 'SYMPHO_DEMO_SEED') {
  throw new Error('Refusing to seed. Set CONFIRM_DEMO_SEED=SYMPHO_DEMO_SEED for this one command.');
}

if (
  process.env.NODE_ENV === 'production' &&
  process.env.ALLOW_PRODUCTION_DEMO_SEED !== 'SYMPHO_PRODUCTION_DEMO_SEED'
) {
  throw new Error(
    'Refusing to seed with NODE_ENV=production. Set ALLOW_PRODUCTION_DEMO_SEED=SYMPHO_PRODUCTION_DEMO_SEED only if this is an intentional demo environment.'
  );
}

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });

try {
  const { seedDemoFirestore } = await server.ssrLoadModule('/src/lib/server/seed/demo.ts');
  const result = await seedDemoFirestore();
  console.log('Demo Firestore seed completed.');
  console.table(result);
} finally {
  await server.close();
}
