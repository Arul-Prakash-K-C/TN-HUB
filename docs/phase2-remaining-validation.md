# TN Kuviyam Remaining Validation Notes

The Phase 2 codebase includes offline tests and a live Firebase verifier. Some
validation still depends on external Firebase availability and seeded demo users.

## Live Firebase Verifier

Run only in a safe demo/test environment:

```powershell
$env:CONFIRM_PHASE2_INTEGRATION_TEST='SYMPHO_PHASE2_TEST'
npm.cmd run verify:phase2
```

The verifier signs in demo users, creates temporary Firebase Auth/Firestore
records, uploads documents, drives workflow transitions, verifies notifications,
checks document authorization, and cleans up temporary records.

## Known External Blocker

The latest attempted live verifier run reached Firebase Auth/Admin session
creation and failed with `app/network-timeout`. Treat that as an external
Firebase/network/environment blocker unless a later run produces a code-level
failure.
