# Sympho Center --- System Architecture

## 1. Vision

Sympho Center is a citizen-first government service orchestration
platform for Tamil Nadu.

It is not a visual clone of e-Sevai, TNeGA or any department website.

The platform provides one experience for discovering, understanding,
starting, tracking and receiving government services while progressively
integrating with different backend systems.

Core principle:

``` text
One Citizen Experience
        |
        v
Many Service Workflows
        |
        v
Many Government Systems
```

------------------------------------------------------------------------

## 2. Technology Stack

Primary stack:

``` text
Frontend:
SvelteKit
Tailwind CSS

Authentication:
Firebase Authentication

Database:
Cloud Firestore

File Storage:
Firebase Storage

Hosting:
Vercel

Source Control:
GitHub

Internationalization:
SvelteKit-compatible i18n library

AI:
AI assistant integration, initially mocked or API-ready
```

------------------------------------------------------------------------

## 3. Three-Phase Development

### Phase 1 --- Complete Frontend + Mock Workflow

Build:

-   complete citizen UI
-   service catalogue
-   search
-   Tamil/English
-   authentication UI
-   service details
-   eligibility
-   document checklist
-   application wizard
-   application tracking
-   citizen dashboard
-   operator UI
-   officer UI
-   admin UI
-   AI chatbot interface
-   DigiLocker mock interface
-   mock external redirects
-   mock workflow
-   mock notifications
-   responsive design
-   accessibility

The objective is a complete hackathon-ready demonstration.

------------------------------------------------------------------------

### Phase 2 --- Firebase Backend

Implement:

-   Firebase Authentication
-   Firestore
-   Firebase Storage
-   applications
-   documents
-   workflows
-   application events
-   notifications
-   grievances
-   role-based access
-   audit logs
-   server-side validation
-   persistent dashboard data

------------------------------------------------------------------------

### Phase 3 --- External Integration

Implement:

-   department API adapter
-   external service redirects
-   API authentication
-   request mapping
-   response mapping
-   external status synchronization
-   payment integration where available
-   DigiLocker integration when credentials/API access is available

Never invent an API.

Use environment variables for credentials.

------------------------------------------------------------------------

## 4. High-Level Architecture

``` text
                         CITIZEN
                            |
                            v
                    +---------------+
                    |   SvelteKit   |
                    |   Frontend    |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    | Service Layer |
                    | Orchestrator  |
                    +-------+-------+
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
       Native Workflow   API Adapter   External Redirect
             |              |              |
             v              v              v
        Firestore      Dept API       Official Website
             |
             v
       Officer Workflow
```

------------------------------------------------------------------------

## 5. Frontend Architecture

Recommended structure:

``` text
src/
├── lib/
│   ├── components/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── i18n/
│   └── workflows/
│
├── routes/
│   ├── +page.svelte
│   ├── services/
│   ├── applications/
│   ├── documents/
│   ├── grievances/
│   ├── dashboard/
│   ├── operator/
│   ├── officer/
│   ├── admin/
│   └── api/
│
└── app.html
```

The exact structure may be adjusted to the project's SvelteKit
conventions.

------------------------------------------------------------------------

## 6. Citizen Experience

Primary journey:

``` text
Home
  |
  v
Search / Ask Sympho
  |
  v
Service
  |
  v
Eligibility
  |
  v
Documents
  |
  v
Application
  |
  v
Review
  |
  v
Submit
  |
  v
Track
  |
  v
Result
```

This is the main product journey.

------------------------------------------------------------------------

## 7. Citizen Dashboard

Dashboard should contain:

-   active applications
-   recent applications
-   pending actions
-   notifications
-   saved services
-   documents
-   grievances
-   recommended services

Avoid overwhelming citizens with administrative information.

------------------------------------------------------------------------

## 8. Service Discovery

The service registry is the source of truth for the frontend catalogue.

Service page should be data-driven.

``` text
services collection
       |
       v
Service Card
       |
       v
Service Detail
       |
       v
Eligibility
       |
       v
Application / Redirect
```

------------------------------------------------------------------------

## 9. Service Orchestrator

The orchestrator determines how a service should execute.

Conceptually:

``` text
service.integrationMode

NATIVE_WORKFLOW
    -> internal workflow

API_INTEGRATED
    -> integration adapter

EXTERNAL_REDIRECT
    -> trusted external URL
```

The citizen should experience a consistent interface regardless of mode.

------------------------------------------------------------------------

## 10. Native Workflow Architecture

``` text
SvelteKit
   |
   v
Server Action / API
   |
   v
Validation
   |
   v
Firestore
   |
   v
Workflow Engine
   |
   +--> Application Event
   +--> Notification
   +--> Audit Log
```

------------------------------------------------------------------------

## 11. API Integration Architecture

``` text
SvelteKit
   |
   v
Server Endpoint
   |
   v
Integration Adapter
   |
   v
Department API
   |
   v
Response Mapper
   |
   v
Sympho Standard Model
```

Never expose private department API credentials in browser code.

------------------------------------------------------------------------

## 12. External Redirect Architecture

``` text
Sympho Service Page
        |
        v
Redirect Confirmation
        |
        v
Trusted Official URL
```

Use a trusted allowlist.

------------------------------------------------------------------------

## 13. Firebase Architecture

``` text
Firebase Authentication
        |
        v
User Identity
        |
        +----------------------+
        |                      |
        v                      v
     Firestore             Storage
        |                      |
        v                      v
 Applications              Documents
 Workflows
 Services
 Notifications
 Grievances
 Audit Logs
```

------------------------------------------------------------------------

## 14. Firestore

Recommended top-level collections:

``` text
users
departments
categories
services
workflows
integrations
applications
documents
payments
notifications
grievances
auditLogs
```

Use subcollections for application events and application documents
where appropriate.

------------------------------------------------------------------------

## 15. Firebase Storage

Storage should contain files, while Firestore contains metadata.

Example:

``` text
Storage:
users/{uid}/documents/{documentId}

Firestore:
documents/{documentId}
```

Do not store large files directly inside Firestore.

------------------------------------------------------------------------

## 16. Authentication

Phase 1 may use:

-   mock demo login
-   Firebase-ready auth UI

Phase 2:

-   Firebase Authentication

Possible methods:

-   email/password
-   Google
-   future identity provider

Government identity integration must not be fabricated.

------------------------------------------------------------------------

## 17. Role-Based Architecture

``` text
                 USER
                  |
       +----------+----------+
       |          |          |
    CITIZEN    OPERATOR   OFFICER
                              |
                         ADMIN ROLES
```

Route protection must be implemented server-side where necessary.

------------------------------------------------------------------------

## 18. Operator Architecture

Operator portal:

``` text
Search Citizen
      |
Create Application
      |
Assist Form
      |
Upload Documents
      |
Review
      |
Submit
```

The operator should work with the same service/workflow definitions as
the citizen.

------------------------------------------------------------------------

## 19. Officer Architecture

Officer dashboard:

-   assigned applications
-   pending verification
-   correction requests
-   approval queue
-   rejection queue
-   SLA alerts

Application view:

``` text
Citizen
Service
Documents
Form
Timeline
Remarks
Actions
Audit
```

------------------------------------------------------------------------

## 20. Admin Architecture

Admin controls:

-   services
-   categories
-   departments
-   workflows
-   integrations
-   users
-   audit logs

Administrative screens should not be mixed with the citizen experience.

------------------------------------------------------------------------

## 21. AI Assistant Architecture

``` text
Citizen
   |
   v
Ask Sympho
   |
   v
Intent Detection
   |
   v
Service Registry / Application Context
   |
   v
Relevant Information
   |
   v
Action Recommendation
```

The AI should be grounded in Sympho service data.

It should not invent official eligibility, fees or legal requirements.

------------------------------------------------------------------------

## 22. AI Capabilities

Potential capabilities:

### Service discovery

"I need a certificate for college."

### Eligibility explanation

"Can I apply for this?"

### Document guidance

"What documents do I need?"

### Application status

"Why is my application still pending?"

### Navigation

"Where can I find my documents?"

### Help

"How do I raise a grievance?"

------------------------------------------------------------------------

## 23. DigiLocker Architecture

Phase 1:

``` text
Mock DigiLocker
```

Phase 2:

``` text
DigiLocker-ready data model
```

Phase 3:

``` text
Real DigiLocker integration
```

Never claim production integration without a valid integration.

------------------------------------------------------------------------

## 24. Notifications

Architecture:

``` text
Workflow Event
      |
      v
Notification Service
      |
      +--> In-app
      +--> Email-ready
      +--> SMS-ready
      +--> Push-ready
```

Phase 1 can use mock notifications.

------------------------------------------------------------------------

## 25. Grievance Architecture

``` text
Application
    |
    v
Raise Grievance
    |
    v
Grievance Record
    |
    v
Assignment
    |
    v
Resolution
    |
    v
Closure
```

Application-linked grievances should automatically contain application
context.

------------------------------------------------------------------------

## 26. Security Architecture

Minimum requirements:

-   Firebase Auth
-   Firestore security rules
-   Storage rules
-   protected server routes
-   server-side validation
-   role-based authorization
-   input validation
-   file validation
-   audit logging

Never trust:

-   client role
-   client status
-   client payment success
-   arbitrary redirect URL

------------------------------------------------------------------------

## 27. External Integration Security

Credentials must be:

``` text
Vercel Server Environment Variables
```

Never:

``` text
Svelte component
public JS
Firestore
GitHub
```

------------------------------------------------------------------------

## 28. Error Handling Architecture

Every layer should gracefully handle errors.

``` text
Frontend Error
     |
     v
User-friendly message

Backend Error
     |
     v
Structured error + log

External API Error
     |
     v
Retry / fallback / explain

Unknown Error
     |
     v
Generic safe message
```

Never show raw stack traces to citizens.

------------------------------------------------------------------------

## 29. Loading Architecture

Every async page needs:

-   loading state
-   success state
-   empty state
-   error state

Never allow blank pages during network/database loading.

------------------------------------------------------------------------

## 30. Accessibility Architecture

All reusable components must support:

-   keyboard navigation
-   screen readers
-   focus management
-   labels
-   semantic HTML
-   responsive text
-   sufficient contrast
-   Tamil text rendering

------------------------------------------------------------------------

## 31. Internationalization

Use an i18n library.

Languages:

``` text
en
ta
```

Translation structure:

``` text
locales/
├── en/
│   ├── common.json
│   ├── services.json
│   └── errors.json
│
└── ta/
    ├── common.json
    ├── services.json
    └── errors.json
```

The exact implementation may differ.

------------------------------------------------------------------------

## 32. Design System

Primary colors:

``` text
Deep Navy   #071A28
White       #FFFFFF
AliceBlue   #F0F8FF
Red         #FF0000
```

Supporting colors should be derived consistently.

Do not overuse red.

Use it mainly for:

-   critical alerts
-   errors
-   important emphasis

------------------------------------------------------------------------

## 33. UX Architecture

Primary navigation:

``` text
Home
Services
Track Application
Documents
Grievances
Ask Sympho
Help
Language
Profile
```

Avoid copying the navigation of existing government portals.

------------------------------------------------------------------------

## 34. Deployment

GitHub:

Source control.

Vercel:

Production deployment.

Firebase:

Authentication, Firestore and Storage.

Environment configuration:

``` text
Development
Preview
Production
```

Secrets must be environment-specific.

------------------------------------------------------------------------

## 35. Development Strategy

Build reusable components first.

Then:

``` text
Service Registry
        |
Reusable Service Page
        |
Reusable Eligibility Engine
        |
Reusable Document Checklist
        |
Reusable Form Engine
        |
Reusable Workflow Engine
        |
Reusable Tracking
```

Do not create separate hard-coded implementations for every service.

------------------------------------------------------------------------

## 36. Phase 1 Demo Journey

Recommended complete demo:

``` text
Home
  |
Search Income Certificate
  |
View Service
  |
Check Eligibility
  |
Document Checklist
  |
Start Application
  |
Fill Form
  |
Upload Mock Document
  |
Review
  |
Submit
  |
Application ID
  |
Timeline
  |
Officer Dashboard
  |
Approve
  |
Citizen Notification
  |
Certificate Result
```

This demonstrates the complete product concept.

------------------------------------------------------------------------

## 37. Phase 1 External Demo

Demonstrate an external service:

``` text
Search Service
    |
View Information
    |
External Service Notice
    |
Continue
    |
Official Website
```

Use a clearly marked prototype/mock external destination until real
department URLs are configured.

------------------------------------------------------------------------

## 38. Architecture Principle

Sympho should be:

``` text
MODULAR
DATA-DRIVEN
WORKFLOW-DRIVEN
INTEGRATION-READY
MULTILINGUAL
ACCESSIBLE
SECURE
```

The architecture must allow a service to migrate from:

``` text
EXTERNAL_REDIRECT
        ->
API_INTEGRATED
        ->
NATIVE_WORKFLOW
```

without redesigning the entire frontend.

------------------------------------------------------------------------

## 39. Final Architecture

``` text
                         SYMPHO CENTER
                              |
              +---------------+---------------+
              |               |               |
          CITIZEN         OPERATOR         OFFICER
              |               |               |
              +---------------+---------------+
                              |
                              v
                       SVELTEKIT APP
                              |
          +-------------------+-------------------+
          |                   |                   |
          v                   v                   v
   Service Registry      Workflow Engine    AI Assistant
          |                   |                   |
          +-------------------+-------------------+
                              |
                       Integration Layer
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
          Firestore      Department APIs   External Sites
              |
              v
        Firebase Storage
```

This architecture provides a single citizen experience while allowing
progressive integration with the existing government ecosystem.
