# Sympho Center --- Workflow Engine

## 1. Purpose

The Sympho workflow engine provides a reusable mechanism for processing
government service applications.

The engine must not assume that every service follows the same workflow.

Instead, each service references a workflow definition.

``` text
Service
   |
   v
Workflow Definition
   |
   v
Application State Machine
   |
   v
Application Events
   |
   v
Citizen Timeline
```

------------------------------------------------------------------------

## 2. Workflow Principles

The engine must:

-   support multiple workflows
-   support configurable steps
-   enforce valid transitions
-   record every state change
-   support role-based actions
-   support correction loops
-   support rejection
-   support approval
-   support external integration states
-   support SLA tracking
-   remain reusable across services

------------------------------------------------------------------------

## 3. Core Workflow Concepts

### Workflow

Defines the complete process.

### Step

A stage in the process.

### Transition

Defines how an application can move from one state to another.

### Actor

The user or system performing the action.

### Event

The permanent record of a transition.

### Rule

Determines whether a transition is allowed.

------------------------------------------------------------------------

## 4. Generic Workflow

``` text
DRAFT
  |
  v
SUBMITTED
  |
  v
DOCUMENT_VERIFICATION
  |
  +----> DOCUMENT_REQUIRED
  |             |
  |             v
  |        RESUBMITTED
  |             |
  +-------------+
  |
  v
UNDER_REVIEW
  |
  +----> CORRECTION_REQUIRED
  |             |
  |             v
  |        RESUBMITTED
  |
  +----> REJECTED
  |
  v
APPROVED
  |
  v
ISSUED
  |
  v
COMPLETED
```

------------------------------------------------------------------------

## 5. Workflow Definition

Example:

``` json
{
  "workflowId": "certificate-standard",
  "initialState": "DRAFT",
  "terminalStates": [
    "COMPLETED",
    "REJECTED",
    "CANCELLED"
  ],
  "steps": [
    {
      "id": "submit",
      "state": "SUBMITTED",
      "allowedRoles": ["citizen", "operator"]
    },
    {
      "id": "verification",
      "state": "DOCUMENT_VERIFICATION",
      "allowedRoles": ["officer"]
    },
    {
      "id": "review",
      "state": "UNDER_REVIEW",
      "allowedRoles": ["officer"]
    },
    {
      "id": "approval",
      "state": "APPROVED",
      "allowedRoles": ["officer"]
    },
    {
      "id": "issue",
      "state": "ISSUED",
      "allowedRoles": ["officer", "system"]
    }
  ]
}
```

------------------------------------------------------------------------

## 6. State Machine

The workflow engine should treat status transitions as a state machine.

Example:

``` text
CURRENT STATE
      |
      v
CHECK TRANSITION
      |
      +---- invalid ---> reject action
      |
      v
CHECK ROLE
      |
      +---- unauthorized ---> reject action
      |
      v
CHECK RULES
      |
      +---- failed ---> explain reason
      |
      v
EXECUTE TRANSITION
      |
      v
WRITE EVENT
      |
      v
UPDATE APPLICATION
      |
      v
CREATE NOTIFICATIONS
```

------------------------------------------------------------------------

## 7. Transition Object

Example:

``` json
{
  "from": "DOCUMENT_VERIFICATION",
  "to": "DOCUMENT_REQUIRED",
  "action": "REQUEST_DOCUMENT",
  "allowedRoles": ["officer"],
  "requiresRemarks": true
}
```

------------------------------------------------------------------------

## 8. Role-Based Actions

### Citizen

Can:

-   save draft
-   submit
-   upload documents
-   replace rejected documents
-   resubmit
-   cancel where permitted
-   respond to correction requests

### Operator

Can:

-   create application
-   edit application during assisted submission
-   upload documents
-   submit on behalf of citizen where permitted

### Officer

Can:

-   verify documents
-   request correction
-   approve
-   reject
-   add remarks
-   move applications through assigned workflow stages

### Admin

Can:

-   configure workflows
-   configure services
-   inspect audit logs

------------------------------------------------------------------------

## 9. Correction Loop

Correction is a first-class workflow feature.

``` text
UNDER_REVIEW
     |
     v
CORRECTION_REQUIRED
     |
     v
Citizen Notification
     |
     v
Citizen Edits
     |
     v
RESUBMITTED
     |
     v
UNDER_REVIEW
```

The reason for correction must be visible to the citizen.

------------------------------------------------------------------------

## 10. Document Verification

A document can move independently through:

``` text
PENDING
   |
UPLOADED
   |
UNDER_REVIEW
   |
+--------+--------+
|                 |
v                 v
VERIFIED       REJECTED
                  |
                  v
          REPLACEMENT_REQUIRED
```

The application workflow should not mark the whole application verified
until all mandatory documents meet the service requirements.

------------------------------------------------------------------------

## 11. Approval

Approval should require:

-   authorized actor
-   valid workflow state
-   required documents verified
-   required fields complete
-   payment complete where applicable
-   mandatory remarks where required

On approval:

``` text
Application
    |
    v
APPROVED
    |
    +--> Notification
    |
    +--> Audit Event
    |
    +--> Certificate/Result Generation
```

------------------------------------------------------------------------

## 12. Rejection

Rejection must contain a reason.

Bad:

``` text
Rejected
```

Good:

``` text
Application rejected because the submitted address proof
does not satisfy the service requirement.
```

The system should distinguish:

-   rejection
-   correction required

These are not the same.

------------------------------------------------------------------------

## 13. SLA Tracking

Each workflow may define expected durations.

Example:

``` json
{
  "step": "DOCUMENT_VERIFICATION",
  "targetHours": 24
}
```

The UI can calculate:

-   expected completion
-   elapsed time
-   delayed state

Do not invent government SLAs. Use verified data or clearly marked
prototype/mock values.

------------------------------------------------------------------------

## 14. SLA Breach

When the expected time is exceeded:

``` text
APPLICATION
    |
    v
SLA EXCEEDED
    |
    +--> Citizen Notification
    |
    +--> Officer Alert
    |
    +--> Optional Grievance Action
```

The system should never automatically change an application to
"rejected" merely because an SLA is exceeded.

------------------------------------------------------------------------

## 15. Application Timeline

The workflow engine produces a timeline.

Example:

``` text
23 Aug
Application submitted       ✓

24 Aug
Documents verified          ✓

25 Aug
Officer review              ●

Expected:
29 Aug

Approval                    ○
Certificate issuance        ○
```

Internal technical states should be converted to understandable
citizen-facing language.

------------------------------------------------------------------------

## 16. Workflow Event

Every successful transition generates:

``` json
{
  "applicationId": "SYM-REV-2026-000123",
  "fromStatus": "SUBMITTED",
  "toStatus": "DOCUMENT_VERIFICATION",
  "actorId": "officer123",
  "actorRole": "OFFICER",
  "remarks": "Application received",
  "createdAt": "server timestamp"
}
```

Events should be immutable after creation.

------------------------------------------------------------------------

## 17. Idempotency

Important actions must be idempotent where appropriate.

Examples:

-   payment confirmation
-   external API callback
-   result issuance
-   notification generation

Retrying the same operation must not create duplicate records.

------------------------------------------------------------------------

## 18. External Integration Workflow

For API-integrated services:

``` text
Citizen
  |
  v
Sympho Application
  |
  v
API Adapter
  |
  v
Department API
  |
  v
Department Processing
  |
  v
Status Response
  |
  v
Sympho Timeline
```

Sympho should normalize external status values into its own standard
status model.

------------------------------------------------------------------------

## 19. External Redirect Workflow

For services that are not integrated:

``` text
Service Information
       |
       v
Eligibility / Documents
       |
       v
External Redirect Confirmation
       |
       v
Official Website
```

Do not create a fake Sympho application workflow unless the prototype
explicitly labels it as simulated.

------------------------------------------------------------------------

## 20. Workflow Configuration

Workflow definitions should be stored as data.

This allows:

``` text
New Service
    |
    +--> Existing Workflow
```

instead of:

``` text
New Service
    |
    +--> New custom code
```

------------------------------------------------------------------------

## 21. Reusable Workflows

Possible reusable templates:

### Certificate Workflow

``` text
SUBMITTED
DOCUMENT_VERIFICATION
UNDER_REVIEW
APPROVED
ISSUED
COMPLETED
```

### Grievance Workflow

``` text
OPEN
ASSIGNED
IN_PROGRESS
WAITING_FOR_CITIZEN
RESOLVED
CLOSED
```

### Payment Workflow

``` text
PAYMENT_PENDING
PAYMENT_PROCESSING
PAYMENT_SUCCESS
PAYMENT_FAILED
```

### External Service

``` text
READY_TO_REDIRECT
REDIRECTED
EXTERNAL_PROCESSING
COMPLETED
```

------------------------------------------------------------------------

## 22. Workflow Engine API Concept

Server-side functions should conceptually provide:

``` text
createApplication()
submitApplication()
getAvailableTransitions()
validateTransition()
transitionApplication()
addApplicationEvent()
requestCorrection()
verifyDocument()
approveApplication()
rejectApplication()
cancelApplication()
```

The exact implementation can use SvelteKit server routes/actions and
Firebase.

------------------------------------------------------------------------

## 23. Server-Side Enforcement

Workflow transitions must be validated on a trusted server boundary.

Never allow a browser to directly change:

``` text
status = APPROVED
```

without authorization and transition validation.

Firestore rules and server-side logic must enforce permissions.

------------------------------------------------------------------------

## 24. Notification Hooks

Transitions can trigger notifications.

Example:

``` text
CORRECTION_REQUIRED
       |
       +--> In-app notification
       +--> Email-ready event
       +--> SMS-ready event
```

The notification mechanism should be decoupled from workflow logic.

------------------------------------------------------------------------

## 25. Audit Hooks

Every privileged transition should create an audit record.

``` text
Transition
    |
    +--> Application Event
    |
    +--> Audit Log
    |
    +--> Notification
```

------------------------------------------------------------------------

## 26. Workflow UI

Citizen UI:

-   progress stepper
-   timeline
-   current stage
-   explanation
-   expected completion
-   required action

Officer UI:

-   current stage
-   available actions
-   documents
-   remarks
-   history
-   audit information

Admin UI:

-   workflow definition
-   steps
-   transitions
-   role permissions
-   version

------------------------------------------------------------------------

## 27. Workflow Versioning

Workflows should be versioned.

Example:

``` text
certificate-standard-v1
certificate-standard-v2
```

Existing applications must continue using the workflow version with
which they were created.

Do not silently change the workflow of an active application.

------------------------------------------------------------------------

## 28. Workflow Failure Handling

If a transition fails:

-   do not partially update the application
-   log the error
-   return a citizen-friendly message
-   preserve the previous valid state
-   allow retry where safe

------------------------------------------------------------------------

## 29. Core Principle

The workflow engine is the heart of Sympho's service execution layer.

It should make the platform:

``` text
Reusable
Configurable
Auditable
Multilingual
Integration-ready
Scalable
```

rather than a collection of individually hard-coded service pages.
