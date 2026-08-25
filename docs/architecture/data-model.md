# Sympho Center --- Data Model

## 1. Purpose

This document defines the logical data model for Sympho Center.

Sympho Center is a citizen-first government service orchestration
platform. The model is designed for a SvelteKit + Firebase/Firestore
application and supports native workflows, API-integrated services, and
external redirects.

The model must remain data-driven so that adding a new service does not
require creating a completely new frontend implementation.

------------------------------------------------------------------------

## 2. Core Entities

The primary entities are:

-   User
-   Department
-   Category
-   Service
-   Workflow
-   Workflow Step
-   Application
-   Application Event
-   Document
-   Application Document
-   Payment
-   Notification
-   Grievance
-   Integration
-   Audit Log

Relationship overview:

User \| +--\> Applications +--\> Documents +--\> Notifications +--\>
Grievances

Service \| +--\> Category +--\> Department +--\> Workflow +--\>
Integration

Application \| +--\> User +--\> Service +--\> Workflow +--\> Documents
+--\> Events +--\> Payment +--\> Notifications +--\> Grievances

------------------------------------------------------------------------

## 3. Users

Firestore collection:

`users`

Suggested fields:

``` text
uid
displayName
email
phone
preferredLanguage
role
photoURL
isActive
createdAt
updatedAt
```

Allowed roles:

``` text
citizen
operator
officer
department_admin
platform_admin
```

The frontend must never trust a client-provided role. Authorization must
be enforced using Firebase Authentication and Firestore/server-side
rules.

------------------------------------------------------------------------

## 4. Departments

Collection:

`departments`

Fields:

``` text
departmentId
name.en
name.ta
shortName
description.en
description.ta
officialUrl
isActive
createdAt
updatedAt
```

Department information is metadata for citizens. Sympho should not force
citizens to navigate by department.

------------------------------------------------------------------------

## 5. Categories

Collection:

`categories`

Fields:

``` text
categoryId
name.en
name.ta
description.en
description.ta
icon
sortOrder
isActive
```

Recommended categories:

-   Certificates
-   Land & Property
-   Ration & Family
-   Welfare
-   Licences & Permits
-   Payments & Taxes
-   Transport
-   Police & Public Safety
-   Registration
-   Education
-   Employment
-   Utilities
-   Complaints & Grievances
-   Business Services

------------------------------------------------------------------------

## 6. Services

Collection:

`services`

Fields:

``` text
serviceId
serviceCode
slug
name.en
name.ta
description.en
description.ta
categoryId
departmentId
workflowId
integrationMode
eligibility
requiredDocuments
fee
processingTime
externalUrl
status
source
lastVerified
version
createdAt
updatedAt
```

Allowed integration modes:

``` text
NATIVE_WORKFLOW
API_INTEGRATED
EXTERNAL_REDIRECT
```

Allowed statuses:

``` text
DRAFT
ACTIVE
TEMPORARILY_UNAVAILABLE
MIGRATING
DEPRECATED
```

Do not hard-code government fees, service codes, SLAs or eligibility
rules unless verified from an authoritative source.

------------------------------------------------------------------------

## 7. Eligibility Rules

Eligibility should be structured rather than stored only as prose.

Collection:

`services/{serviceId}/eligibilityRules`

Example:

``` json
{
  "questionId": "tn-resident",
  "type": "boolean",
  "question": {
    "en": "Are you a resident of Tamil Nadu?",
    "ta": "நீங்கள் தமிழ்நாட்டில் வசிப்பவரா?"
  },
  "required": true,
  "order": 1
}
```

Supported types:

``` text
boolean
single_choice
multiple_choice
number
date
text
document_check
```

------------------------------------------------------------------------

## 8. Workflows

Collection:

`workflows`

Fields:

``` text
workflowId
name.en
name.ta
description.en
description.ta
steps
initialState
terminalStates
version
isActive
createdAt
updatedAt
```

A service references a workflow using `workflowId`.

This makes the workflow reusable.

------------------------------------------------------------------------

## 9. Applications

Collection:

`applications`

Fields:

``` text
applicationId
trackingNumber
citizenId
serviceId
workflowId
status
currentStep
formData
paymentStatus
documentStatus
submittedAt
expectedCompletionAt
completedAt
createdAt
updatedAt
```

Example status:

``` text
DRAFT
SUBMITTED
DOCUMENT_VERIFICATION
DOCUMENT_REQUIRED
CORRECTION_REQUIRED
RESUBMITTED
UNDER_REVIEW
APPROVED
REJECTED
ISSUED
COMPLETED
CANCELLED
```

Do not put all application history inside the main document. Use an
event collection for scalable tracking and auditability.

------------------------------------------------------------------------

## 10. Application Events

Collection:

`applications/{applicationId}/events`

Fields:

``` text
eventId
fromStatus
toStatus
actorId
actorRole
remarks
createdAt
metadata
```

Example:

``` json
{
  "fromStatus": "DOCUMENT_VERIFICATION",
  "toStatus": "UNDER_REVIEW",
  "actorRole": "OFFICER",
  "remarks": "Documents verified"
}
```

This creates the citizen-facing timeline and the internal audit trail.

------------------------------------------------------------------------

## 11. Documents

Collection:

`documents`

Fields:

``` text
documentId
ownerId
documentType
name
storagePath
mimeType
size
verificationStatus
source
uploadedAt
expiresAt
metadata
```

Sources can include:

``` text
USER_UPLOAD
DIGILOCKER
DEPARTMENT
GENERATED
MOCK
```

For the prototype, DigiLocker can be represented using mock data. Do not
claim a live DigiLocker connection without a real integration.

------------------------------------------------------------------------

## 12. Application Documents

Collection:

`applications/{applicationId}/documents`

Fields:

``` text
documentId
documentType
required
status
documentRef
reviewRemarks
verifiedBy
verifiedAt
createdAt
```

Possible statuses:

``` text
PENDING
UPLOADED
UNDER_REVIEW
VERIFIED
REJECTED
REPLACEMENT_REQUIRED
```

------------------------------------------------------------------------

## 13. Payments

Collection:

`payments`

Fields:

``` text
paymentId
applicationId
citizenId
amount
currency
provider
status
transactionReference
initiatedAt
completedAt
failureReason
```

Statuses:

``` text
PENDING
PROCESSING
SUCCESS
FAILED
REFUNDED
```

Payment confirmation must be idempotent so a retry cannot create
duplicate payments or duplicate applications.

------------------------------------------------------------------------

## 14. Notifications

Collection:

`notifications`

Fields:

``` text
notificationId
userId
applicationId
type
title.en
title.ta
message.en
message.ta
isRead
createdAt
```

Types:

``` text
APPLICATION_SUBMITTED
DOCUMENT_REQUIRED
CORRECTION_REQUIRED
STATUS_UPDATED
APPROVED
REJECTED
ISSUED
PAYMENT
GRIEVANCE
SYSTEM
```

------------------------------------------------------------------------

## 15. Grievances

Collection:

`grievances`

Fields:

``` text
grievanceId
citizenId
applicationId
serviceId
subject
description
category
status
assignedTo
resolution
createdAt
updatedAt
resolvedAt
```

Statuses:

``` text
OPEN
ASSIGNED
IN_PROGRESS
WAITING_FOR_CITIZEN
RESOLVED
CLOSED
REOPENED
```

Application-linked grievances should automatically preserve the relevant
application context.

------------------------------------------------------------------------

## 16. Integrations

Collection:

`integrations`

Fields:

``` text
integrationId
serviceId
mode
provider
endpoint
externalUrl
authenticationType
status
version
lastVerified
createdAt
updatedAt
```

Never store private API secrets in Firestore.

Secrets must remain server-side in secure environment configuration.

------------------------------------------------------------------------

## 17. Audit Logs

Collection:

`auditLogs`

Fields:

``` text
auditId
actorId
actorRole
action
entityType
entityId
before
after
ipHashOrReference
createdAt
```

Examples:

``` text
APPLICATION_CREATED
APPLICATION_SUBMITTED
DOCUMENT_UPLOADED
DOCUMENT_VERIFIED
APPLICATION_APPROVED
APPLICATION_REJECTED
ROLE_CHANGED
SERVICE_UPDATED
INTEGRATION_UPDATED
```

Audit logs should be append-oriented.

------------------------------------------------------------------------

## 18. Recommended Firestore Structure

``` text
users/
departments/
categories/
services/
workflows/
integrations/
applications/
documents/
payments/
notifications/
grievances/
auditLogs/

applications/{applicationId}/events/
applications/{applicationId}/documents/
```

Use subcollections for high-volume application-specific events and
documents.

------------------------------------------------------------------------

## 19. Data Ownership

Sympho does not automatically own all government data.

For a native service:

Sympho is the application system of record for the prototype.

For an API-integrated service:

The department backend may remain authoritative.

For an external redirect:

The external department system remains authoritative.

The service metadata should clearly identify the integration mode.

------------------------------------------------------------------------

## 20. Multilingual Data

Citizen-facing fields should support:

``` text
name.en
name.ta

description.en
description.ta
```

Do not duplicate business logic for Tamil and English.

The application logic remains language-neutral.

------------------------------------------------------------------------

## 21. Data Validation

Validate on both:

-   client
-   trusted server-side boundary

Never rely only on frontend validation.

Validate:

-   required fields
-   data types
-   file types
-   file sizes
-   enum values
-   application ownership
-   workflow transitions
-   authorization

------------------------------------------------------------------------

## 22. Security Rules

Citizens should only access their own:

-   applications
-   documents
-   notifications
-   grievances
-   profile

Officers should only access applications permitted by their role,
department and assignment.

Admins should have explicit elevated permissions.

Never expose unrestricted Firestore collections to the client.

------------------------------------------------------------------------

## 23. Data Model Principle

The platform should be:

``` text
DATA-DRIVEN
    +
WORKFLOW-DRIVEN
    +
SERVICE-DRIVEN
```

not:

``` text
ONE PAGE = ONE SERVICE = ONE CUSTOM IMPLEMENTATION
```

This is essential for scaling Sympho from a hackathon prototype to a
large service platform.
