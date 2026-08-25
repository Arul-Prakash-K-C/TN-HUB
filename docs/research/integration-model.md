# Sympho Center — Integration & Workflow Architecture

## Purpose

This document defines how Sympho interacts with government departments,
external systems and internally managed workflows.

The central principle is:

Sympho should unify the citizen experience without requiring every
government backend to be replaced.

---

# 1. Integration Philosophy

Sympho uses three primary execution models:

1. NATIVE_WORKFLOW
2. API_INTEGRATED
3. EXTERNAL_REDIRECT

These are the core integration modes.

Other mechanisms may exist internally, but they should be abstracted
behind these three citizen-facing models.

---

# 2. High-Level Architecture

Citizen
    |
    v
Sympho Frontend
    |
    v
Sympho Backend
    |
    v
Service Registry
    |
    v
Service Orchestrator
    |
    +--------------------+
    |                    |
    v                    v
Native Workflow       Integration Adapter
                           |
                    +------+------+
                    |             |
                    v             v
                 API          External Portal


---

# 3. Native Workflow

Native Workflow means the service is managed directly inside Sympho.

Architecture:

Citizen
    |
    v
SvelteKit
    |
    v
Firebase Authentication
    |
    v
Application API/Server Logic
    |
    v
Firestore
    |
    v
Officer Workflow
    |
    v
Result

---

# 4. Native Workflow Responsibilities

Sympho owns:

- application
- forms
- validation
- documents
- workflow
- status
- officer actions
- notifications
- result

Use this for:

- prototype services
- services explicitly designed for Sympho
- future migrated services

---

# 5. API Integrated

Architecture:

Citizen
    |
    v
Sympho
    |
    v
Sympho Backend
    |
    v
Integration Adapter
    |
    v
Department API
    |
    v
Department System

The department remains the authoritative backend.

Sympho owns the user experience.

---

# 6. API Adapter

Do not place department-specific API logic directly throughout the
frontend.

Use an adapter abstraction.

Example:

Service Adapter
    |
    +-- request()
    +-- validate()
    +-- submit()
    +-- getStatus()
    +-- getResult()

Each department integration can implement its own adapter.

---

# 7. API Request Mapping

Sympho may use:

Sympho Form Data
    |
    v
Request Mapper
    |
    v
Department API Format

Example:

Sympho:

{
  "applicantName": "...",
  "dateOfBirth": "..."
}

Department API:

{
  "applicant_name": "...",
  "dob": "..."
}

The mapper isolates this difference.

---

# 8. API Response Mapping

Department response:

{
  "application_number": "...",
  "current_status": "..."
}

Sympho:

{
  "applicationId": "...",
  "status": "UNDER_REVIEW"
}

This allows Sympho to maintain a consistent citizen interface.

---

# 9. External Redirect

For services that are not integrated:

Citizen
    |
    v
Sympho
    |
    v
Service Information
    |
    v
Official External Website

Sympho should display:

- what the service does
- eligibility
- required documents
- expected process
- official service provider
- official URL
- warning that the user is leaving Sympho

---

# 10. External Redirect UX

Before leaving:

"You are being redirected to the official department service."

Show:

Service
Official Provider
Destination
Reason for redirect

Buttons:

Continue to Official Service
Cancel

Never redirect unexpectedly.

---

# 11. External Redirect Security

Only allow URLs from a trusted allowlist.

Do not allow arbitrary URLs from user input.

Example:

allowedExternalDomains

- official government domain
- approved department domain

Do not dynamically redirect based on an unverified database value.

---

# 12. Progressive Migration

Every service should be able to migrate:

EXTERNAL_REDIRECT
        |
        v
API_INTEGRATED
        |
        v
NATIVE_WORKFLOW

This should not require redesigning the citizen UI.

---

# 13. Integration Registry

Recommended Firestore collection:

integrations

Fields:

integrationId
serviceId
mode
provider
endpoint
externalUrl
authenticationType
requestMapper
responseMapper
status
lastVerified
version

Never store real API secrets directly in Firestore.

---

# 14. API Credentials

Never place:

- API keys
- client secrets
- private keys
- passwords
- access tokens

in:

- frontend code
- public environment variables
- Firestore documents
- GitHub repositories

Use secure server-side environment variables or secret management.

---

# 15. Environment Configuration

Development:

.env.local

Production:

Vercel Environment Variables

Never commit secrets to GitHub.

---

# 16. Authentication

Phase 1:

Firebase Authentication.

Possible methods:

- email/password
- Google sign-in
- mock/demo login

Production may require government identity integration.

Do not fake a real government authentication integration.

---

# 17. Role Model

Recommended roles:

citizen
operator
officer
department_admin
platform_admin

Permissions must be different.

---

# 18. Citizen

Can:

- discover services
- check eligibility
- create applications
- upload documents
- view applications
- track status
- receive notifications
- raise grievances
- manage profile

Cannot:

- access other citizens
- modify workflow
- approve applications

---

# 19. Operator

Can:

- assist citizens
- create applications
- upload documents
- submit applications
- view assigned/authorized applications

Cannot:

- approve applications unless explicitly assigned that role.

---

# 20. Officer

Can:

- view assigned applications
- review documents
- request corrections
- approve
- reject
- add remarks
- update workflow state

---

# 21. Admin

Can:

- manage services
- manage workflows
- manage integrations
- manage users
- view audit logs

Use least-privilege access.

---

# 22. Workflow Engine

A workflow should be defined as data.

Example:

{
  "workflowId": "certificate-standard",
  "steps": [
    "SUBMITTED",
    "DOCUMENT_VERIFICATION",
    "OFFICER_REVIEW",
    "APPROVAL",
    "ISSUED"
  ]
}

Transitions should define allowed state changes.

Example:

SUBMITTED
    -> DOCUMENT_VERIFICATION

DOCUMENT_VERIFICATION
    -> OFFICER_REVIEW
    -> DOCUMENT_REQUIRED

OFFICER_REVIEW
    -> APPROVAL
    -> CORRECTION_REQUIRED
    -> REJECTED

APPROVAL
    -> ISSUED

---

# 23. Application State Machine

Recommended states:

DRAFT
SUBMITTED
PAYMENT_PENDING
PAYMENT_COMPLETED
DOCUMENT_VERIFICATION
DOCUMENT_REQUIRED
CORRECTION_REQUIRED
RESUBMITTED
UNDER_REVIEW
FIELD_VERIFICATION
APPROVED
REJECTED
ISSUED
COMPLETED
CANCELLED

Not all services need every state.

---

# 24. Workflow Events

Every status change should generate an event.

Example:

applicationEvents

{
  "applicationId": "...",
  "from": "DOCUMENT_VERIFICATION",
  "to": "UNDER_REVIEW",
  "actorId": "...",
  "actorRole": "OFFICER",
  "timestamp": "...",
  "remarks": "Documents verified"
}

This creates an audit trail.

---

# 25. Notifications

Notifications can be triggered by:

- application submitted
- payment completed
- document required
- correction required
- application approved
- application rejected
- application issued
- grievance updated
- SLA exceeded

Channels:

- in-app
- email
- SMS-ready architecture
- future push notifications

Phase 1 may use mock notifications.

---

# 26. Document Workflow

Citizen
    |
    v
Upload
    |
    v
Storage
    |
    v
Metadata
    |
    v
Validation
    |
    v
Officer Review
    |
    v
Verified

Future:

Upload
    |
OCR
    |
Extract Fields
    |
Citizen Confirmation
    |
Form Autofill

---

# 27. DigiLocker Integration

Phase 1:

Mock DigiLocker.

Phase 2:

DigiLocker-ready data model.

Phase 3:

Real integration only after credentials/API/access are available.

Do not claim production DigiLocker integration during the prototype.

---

# 28. Payment Architecture

Possible modes:

NATIVE_PAYMENT
API_PAYMENT
EXTERNAL_PAYMENT

Generic flow:

Application
    |
Payment Required
    |
Payment Gateway
    |
Success / Failure
    |
Update Application

Payment success must be idempotent.

Never create duplicate applications because of payment retries.

---

# 29. External Service Return

Where technically supported:

External Service
    |
    v
Sympho Return URL
    |
    v
Verify Transaction
    |
    v
Update Application

Do not trust query parameters alone for payment confirmation.

---

# 30. Error Handling

Integration errors must be converted into citizen-friendly messages.

Bad:

HTTP 500

Good:

"We couldn't connect to the department service right now."

Actions:

Retry
Save and continue later
Visit official service

Internal logs should retain technical details.

---

# 31. API Failure

If department API fails:

Sympho should not lose application data.

Store:

integrationStatus
lastAttempt
errorCode
retryCount

Provide retry mechanisms.

---

# 32. External Portal Failure

If the external site is unavailable:

Show:

"The official service is temporarily unavailable."

Actions:

Retry
Save service
Try later

Do not show a broken blank page.

---

# 33. Service Availability

Service metadata should support:

ACTIVE
MAINTENANCE
UNAVAILABLE
MIGRATING
DEPRECATED

The UI should reflect this.

---

# 34. Backend Architecture

Recommended Phase 2 architecture:

SvelteKit
    |
Firebase Authentication
    |
Server-side logic
    |
Firestore
    |
Firebase Storage

Optional:

Cloud Functions / server endpoints
    |
External APIs

---

# 35. Firestore Collections

users
departments
categories
services
workflows
applications
applicationEvents
documents
applicationDocuments
payments
notifications
grievances
integrations
auditLogs

---

# 36. Audit Logs

Important actions should be logged:

- login
- application creation
- submission
- document upload
- document verification
- correction
- approval
- rejection
- service configuration
- integration changes
- role changes

Audit logs should be append-oriented.

---

# 37. Phase 1

Use mock:

- service registry
- workflows
- users
- applications
- documents
- payments
- notifications
- officer actions
- external redirects

Objective:

Demonstrate complete citizen journey.

---

# 38. Phase 2

Implement:

- Firebase Authentication
- Firestore
- Firebase Storage
- real application persistence
- real document metadata
- role-based access
- audit logs
- workflow persistence

---

# 39. Phase 3

Add:

- external API
- external portal redirects
- payment integrations
- DigiLocker integration
- department API adapters
- real status synchronization

---

# 40. Integration Principle

The frontend must never care whether a service is:

NATIVE_WORKFLOW
API_INTEGRATED
EXTERNAL_REDIRECT

The frontend should simply receive:

service.integrationMode

and render the appropriate experience.

---

# 41. Core Architecture Principle

Sympho does not replace government systems immediately.

Sympho creates:

A unified citizen experience
over
heterogeneous government systems.

That allows gradual migration.