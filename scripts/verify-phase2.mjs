import { createVitest } from 'vitest/node';
import { loadEnv } from 'vite';

const confirmation = process.env.CONFIRM_PHASE2_INTEGRATION_TEST;
if (confirmation !== 'SYMPHO_PHASE2_TEST') {
  throw new Error('Refusing to run integration tests. Set CONFIRM_PHASE2_INTEGRATION_TEST=SYMPHO_PHASE2_TEST for this one command.');
}

if (
  process.env.NODE_ENV === 'production' &&
  process.env.ALLOW_PRODUCTION_PHASE2_TEST !== 'SYMPHO_PRODUCTION_PHASE2_TEST'
) {
  throw new Error('Refusing to run Phase 2 integration tests with NODE_ENV=production without an explicit demo-environment override.');
}

const publicEnv = loadEnv('development', process.cwd(), 'PUBLIC_');
if (!publicEnv.PUBLIC_FIREBASE_API_KEY) {
  throw new Error('PUBLIC_FIREBASE_API_KEY is required for Firebase Auth integration tests.');
}

console.log('[Phase 2 Verifier] Starting memory-optimized verification suite...');
const vitest = await createVitest('test', {
  watch: false,
  run: true,
  include: ['tests/integration/phase2-verifier.test.js'],
  reporters: ['default']
});

try {
  await vitest.start();
  const errors = vitest.state.getFiles().filter((file) => file.result?.state === 'fail');
  if (errors.length > 0) {
    console.error('[Phase 2 Verifier] One or more integration tests failed.');
    process.exit(1);
  }
} finally {
  await vitest.close();
}
