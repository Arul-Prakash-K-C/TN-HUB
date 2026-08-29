# TN Kuviyam Phase 0 Acceptance Checklist

This checklist reflects the current repository baseline. It is intentionally
limited to requirements evidenced by the application structure, configuration,
tests, and seed/demo architecture in this codebase.

## Complete

- SvelteKit application foundation is present in `src/`.
- Public, citizen, admin, department, and operator route groups exist under `src/routes/`.
- Firebase client initialization exists in `src/lib/firebase/client.js`.
- Firebase Admin initialization exists in `src/lib/server/firebase/admin.js`.
- Server session/authentication foundation exists in `src/lib/server/auth/session.js`.
- Shared route authorization foundation exists in `src/lib/server/security/authorize.js` and `src/hooks.server.js`.
- Public catalog, department, service, and workflow data models exist.
- Demo/seed source data exists under `src/lib/data/`.
- Firestore and Storage rules exist at `firestore.rules` and `storage.rules`.
- Basic project scripts exist for test, check, build, preview, seeding, and Phase 2 verification.

## Not Tested

- Full browser smoke testing across the homepage, login, public catalog, and public service pages.
- Live Firebase-backed catalog loading in the current environment.
- Firebase rule behavior against the emulator or live project in the current environment.

## Blocked

- Live Firebase verification depends on configured credentials and reachable Firebase services.
