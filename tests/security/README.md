# TN Kuviyam Security Tests

This directory contains focused Phase 1/Phase 2 authorization-boundary tests
that run offline without Firebase network access.

Current coverage:

- Application IDOR denial across update, delete, submit, workflow action,
  document upload, and document-view tracking APIs.
- Document download IDOR denial.
- Notification mutation IDOR denial.
- Profile role, department, identity, approval, and active-state escalation
  denial.
- Department/officer complaint isolation.

Still validated by live Firebase verifier/manual testing:

- Real Firebase Auth session creation.
- Firestore and Storage rules behavior.
- Full application/document/notification ownership against seeded live records.
- Complete workflow, payment, OTP, document download, and operator journey.
