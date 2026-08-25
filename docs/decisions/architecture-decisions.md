# Sympho Center --- Architecture Decisions

## 1. Purpose

This document records the major architectural decisions for Sympho
Center.

It exists to prevent the project from drifting into:

-   an e-Sevai clone
-   a static government information portal
-   a collection of unrelated pages
-   hard-coded service implementations
-   insecure frontend API integrations

Architecture decisions should be revisited when requirements change, but
the original reason for each decision should remain documented.

------------------------------------------------------------------------

# ADR-001 --- Sympho is a Citizen Service Orchestration Platform

## Decision

Sympho will be designed as a citizen-first service orchestration
platform.

It will not be implemented as a rebranded copy of e-Sevai.

## Reason

Government systems are organized around administrative departments while
citizens think in terms of goals and services.

Sympho should abstract this complexity.

## Consequence

The primary navigation should focus on:

-   service discovery
-   citizen intent
-   applications
-   tracking
-   documents
-   grievances
-   help

Department ownership remains available as metadata.

------------------------------------------------------------------------

# ADR-002 --- Use Three Service Execution Modes

## Decision

Sympho will standardize service execution into:

``` text
NATIVE_WORKFLOW
API_INTEGRATED
EXTERNAL_REDIRECT
```

## Reason

Not every government department will immediately expose an API or
migrate its workflow.

The platform must work before complete integration exists.

## Consequence

A service can progressively migrate:

``` text
EXTERNAL_REDIRECT
        |
        v
API_INTEGRATED
        |
        v
NATIVE_WORKFLOW
```

The citizen-facing service page should remain largely consistent.

------------------------------------------------------------------------

# ADR-003 --- Phase 1 Uses Mock Data

## Decision

The hackathon prototype will use mock data and simulated workflows where
real integrations are unavailable.

## Reason

Real government credentials, APIs and production approvals cannot be
assumed during prototype development.

## Consequence

Mock data must be clearly separated from production integration code.

Use labels such as:

``` text
MOCK
DEMO
PROTOTYPE
```

Do not falsely claim a live government integration.

------------------------------------------------------------------------

# ADR-004 --- Firebase for Phase 2 Backend

## Decision

Firebase will be used for:

-   Authentication
-   Firestore
-   Storage

## Reason

Firebase provides rapid development and fits the selected SvelteKit
prototype architecture.

## Consequence

The data model must avoid coupling business logic directly to Firestore
document structures.

A service/workflow abstraction should exist above the database.

------------------------------------------------------------------------

# ADR-005 --- SvelteKit as Application Framework

## Decision

SvelteKit is the primary application framework.

## Reason

It supports:

-   server routes
-   server actions
-   SSR
-   client-side interactivity
-   file-based routing
-   TypeScript
-   good performance

## Consequence

Server-only integration logic must remain on the server.

Sensitive API credentials must never reach browser code.

------------------------------------------------------------------------

# ADR-006 --- Tailwind CSS

## Decision

Tailwind CSS will be used for the design system and responsive styling.

## Reason

It enables:

-   consistent spacing
-   responsive layouts
-   reusable utility patterns
-   rapid hackathon development

## Consequence

Repeated UI patterns should become reusable Svelte components instead of
duplicated class-heavy markup.

------------------------------------------------------------------------

# ADR-007 --- Tamil and English from the Beginning

## Decision

The application will support:

``` text
Tamil
English
```

from the beginning of development.

## Reason

Sympho targets Tamil Nadu citizens.

Multilingual support added late usually causes architectural and content
problems.

## Consequence

All citizen-facing strings must use i18n.

Do not hard-code English strings throughout components.

------------------------------------------------------------------------

# ADR-008 --- Citizen Intent over Department Navigation

## Decision

Citizen intent is the primary information architecture.

## Reason

A citizen usually asks:

"I need an income certificate."

not:

"I need a Revenue Department service."

## Consequence

Categories should be organized around tasks such as:

-   Certificates
-   Welfare
-   Ration
-   Land
-   Payments
-   Licences
-   Grievances

Department information remains secondary.

------------------------------------------------------------------------

# ADR-009 --- Data-Driven Service Catalogue

## Decision

Services will be represented as structured data.

## Reason

The platform must scale to many services without creating one custom
page per service.

## Consequence

A reusable service page will consume:

``` text
Service Metadata
+
Eligibility Rules
+
Document Requirements
+
Workflow
+
Integration Mode
```

------------------------------------------------------------------------

# ADR-010 --- Data-Driven Workflows

## Decision

Workflows will be represented as configuration/data rather than entirely
hard-coded per service.

## Reason

Different government services have different workflows.

A reusable workflow engine enables scalable service implementation.

## Consequence

A new service can reference an existing workflow.

Example:

``` text
Income Certificate
    -> Certificate Workflow

Community Certificate
    -> Certificate Workflow
```

------------------------------------------------------------------------

# ADR-011 --- Server-Side Workflow Enforcement

## Decision

Workflow state transitions must be validated on a trusted server
boundary.

## Reason

A browser must never be able to directly set:

``` text
status = APPROVED
```

## Consequence

Transitions require:

-   role verification
-   current-state verification
-   transition validation
-   required data validation
-   audit event creation

------------------------------------------------------------------------

# ADR-012 --- Immutable Application Events

## Decision

Application status history will be stored as events.

## Reason

A single current status field cannot provide reliable history.

## Consequence

Applications contain current state while application events contain the
timeline.

Example:

``` text
SUBMITTED
   |
DOCUMENT_VERIFICATION
   |
UNDER_REVIEW
   |
APPROVED
```

------------------------------------------------------------------------

# ADR-013 --- Application Workflow Versioning

## Decision

Applications will reference the workflow version used when they were
created.

## Reason

Changing a workflow definition should not silently change an existing
application.

## Consequence

Example:

``` text
certificate-standard-v1
certificate-standard-v2
```

Old applications remain compatible with their original workflow.

------------------------------------------------------------------------

# ADR-014 --- Document Vault

## Decision

Sympho will provide a reusable document vault concept.

## Reason

Citizens should not repeatedly upload the same document.

## Consequence

A document can be:

``` text
Uploaded once
     |
     +--> Application A
     +--> Application B
     +--> Application C
```

Prototype implementation can use Firebase Storage and Firestore
metadata.

------------------------------------------------------------------------

# ADR-015 --- DigiLocker is Progressive Integration

## Decision

DigiLocker will be represented as:

``` text
Phase 1: Mock
Phase 2: Integration-ready
Phase 3: Real integration
```

## Reason

A prototype cannot assume production DigiLocker credentials or access.

## Consequence

The UI must clearly distinguish mock functionality from live
integration.

------------------------------------------------------------------------

# ADR-016 --- AI is Service-Grounded

## Decision

The AI assistant will be grounded in Sympho's service registry and
application context.

## Reason

A general chatbot can hallucinate fees, eligibility and government
rules.

## Consequence

The AI should:

-   search services
-   explain verified information
-   guide users
-   interpret application status
-   recommend actions

It must not invent official requirements.

------------------------------------------------------------------------

# ADR-017 --- External URLs Use an Allowlist

## Decision

External redirects will use trusted allowlisted destinations.

## Reason

Arbitrary redirect URLs create phishing and security risks.

## Consequence

External service records must be validated before deployment.

The user should see a confirmation before leaving Sympho.

------------------------------------------------------------------------

# ADR-018 --- No Secrets in Frontend or Firestore

## Decision

API secrets and credentials will never be stored in:

-   Svelte components
-   public environment variables
-   Firestore
-   GitHub

## Reason

Frontend code is visible to users.

## Consequence

Use server-side environment variables through Vercel or another secure
secret-management mechanism.

------------------------------------------------------------------------

# ADR-019 --- Department APIs Behind Adapters

## Decision

Department integrations will use adapters.

## Reason

Different departments may expose different:

-   field names
-   authentication
-   response formats
-   status codes
-   endpoint structures

## Consequence

The frontend uses a normalized Sympho model.

``` text
Sympho
   |
Integration Adapter
   |
Department API
```

This isolates external complexity.

------------------------------------------------------------------------

# ADR-020 --- Normalize External Statuses

## Decision

External status values will be mapped to Sympho's standard status model.

## Reason

Every department may use different terminology.

Example:

``` text
Dept:
IN_PROCESS

Sympho:
UNDER_REVIEW
```

## Consequence

Citizens see consistent language across services.

------------------------------------------------------------------------

# ADR-021 --- Progressive Integration Rather Than Big-Bang Migration

## Decision

Sympho will not require all government services to migrate at once.

## Reason

Government systems are heterogeneous and migration is operationally
complex.

## Consequence

Launch with external redirects and mock/native workflows, then gradually
add API integrations.

------------------------------------------------------------------------

# ADR-022 --- UX4G as Reference, Not a Clone

## Decision

UX4G principles and accessibility patterns may guide the design.

The exact UX4G website design must not be copied.

## Reason

Sympho needs an independent product identity.

## Consequence

Use accessibility and design-system principles while maintaining the
Sympho visual language.

------------------------------------------------------------------------

# ADR-023 --- Sympho Visual Identity

## Decision

Primary palette:

``` text
Deep Navy #071A28
White #FFFFFF
AliceBlue #F0F8FF
Red #FF0000
```

Supporting colors may be added for semantic states.

## Reason

The product needs a distinctive identity rather than copying existing
government portals.

## Consequence

Red should be used sparingly for emphasis/errors, not as the dominant
interface color.

------------------------------------------------------------------------

# ADR-024 --- Responsive and Accessible by Default

## Decision

All citizen workflows must support:

-   mobile
-   tablet
-   desktop
-   keyboard
-   screen readers
-   text resizing

## Reason

Government services must be accessible to a broad population.

## Consequence

Accessibility cannot be postponed to a later phase.

------------------------------------------------------------------------

# ADR-025 --- Unified Tracking

## Decision

Sympho will provide a common tracking experience for services that
expose enough status information.

## Reason

Citizens should not have to search multiple portals to understand the
state of their applications.

## Consequence

Native and API-integrated services can use a unified timeline.

External redirect services should clearly state that tracking occurs on
the official external system unless synchronization is available.

------------------------------------------------------------------------

# ADR-026 --- Contextual Grievances

## Decision

Applications can generate application-linked grievances.

## Reason

A grievance without application context requires the citizen to repeat
information.

## Consequence

A grievance can automatically reference:

-   application ID
-   service
-   current status
-   relevant history

------------------------------------------------------------------------

# ADR-027 --- Reusable Components

## Decision

The frontend will use reusable components and data-driven pages.

## Reason

Hard-coded page-by-page implementation creates duplication and makes the
platform difficult to scale.

## Consequence

Build reusable:

-   ServiceCard
-   ServiceDetail
-   EligibilityChecker
-   DocumentChecklist
-   ApplicationStepper
-   ApplicationTimeline
-   StatusBadge
-   NotificationPanel
-   GrievancePanel
-   FileUpload
-   AIChat

------------------------------------------------------------------------

# ADR-028 --- No Raw 500 Errors in Citizen UI

## Decision

All application pages must have explicit:

-   loading
-   empty
-   success
-   error

states.

## Reason

Raw 500 pages destroy trust and make prototype demonstrations look
unfinished.

## Consequence

Technical errors are logged internally and translated into safe,
human-readable messages.

------------------------------------------------------------------------

# ADR-029 --- Phase 1 Must Be Demonstrable End-to-End

## Decision

Phase 1 is considered successful only when a complete citizen journey
can be demonstrated.

## Required journey

``` text
Home
  |
Search Service
  |
Service Details
  |
Eligibility
  |
Documents
  |
Application
  |
Review
  |
Submit
  |
Tracking
  |
Officer Review
  |
Approval
  |
Citizen Notification
  |
Result
```

## Reason

A hackathon prototype should demonstrate the product concept, not merely
show disconnected screens.

------------------------------------------------------------------------

# ADR-030 --- Architecture Must Support Future Migration

## Decision

The Phase 1 prototype must not create an architecture that blocks real
integrations later.

## Reason

The prototype is intended to demonstrate a possible future platform.

## Consequence

Mock services should use the same service, workflow, application and
integration abstractions that Phase 2 and Phase 3 will use.

------------------------------------------------------------------------

# ADR-031 --- Source Accuracy

## Decision

Government service information must be marked with source and
verification metadata.

## Reason

Government fees, eligibility, service availability and processing times
can change.

## Consequence

Service records should support:

``` text
source
sourceUrl
lastVerified
version
```

Unverified values must be labelled:

``` text
MOCK_DATA
UNVERIFIED
```

------------------------------------------------------------------------

# ADR-032 --- Prototype vs Production Boundary

## Decision

The application must visibly distinguish prototype capabilities from
real integrations.

## Examples

Prototype:

``` text
Mock application
Demo officer approval
Mock DigiLocker
Mock payment
```

Production:

``` text
Verified department API
Real payment gateway
Real DigiLocker
Real government authentication
```

## Reason

A hackathon prototype must demonstrate the concept without making false
claims about government integration.

------------------------------------------------------------------------

# Final Architecture Decision

Sympho Center is built around:

``` text
Citizen-first UX
        +
Service Registry
        +
Reusable Workflow Engine
        +
Firebase Data Layer
        +
Integration Adapters
        +
Progressive Migration
        +
AI-assisted Discovery
        +
Tamil/English Accessibility
```

The platform should be capable of evolving from:

``` text
Prototype
   |
   v
Working Platform
   |
   v
API-integrated Platform
   |
   v
Large-scale Government Service Orchestration Layer
```

without replacing the entire architecture at every stage.
