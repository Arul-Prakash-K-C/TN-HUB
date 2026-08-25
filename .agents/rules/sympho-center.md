---
trigger: always_on
---

# Sympho Center — Agent Rules

## 1. Product Identity

Sympho Center is a citizen-first, Tamil Nadu government-service orchestration
platform and hackathon-ready prototype. It is an upgraded alternative to the
current fragmented e-Sevai experience, NOT a rebranding, clone, or wrapper of
e-Sevai, TNeGA, e-District, or any department portal.

The goal is to give citizens ONE consistent place to discover, understand,
apply for, track, and get help with government services while hiding
departmental complexity.

Never copy another portal's branding, layout, navigation, wording, content,
code, or visual identity. Existing government portals may be researched only
to understand service domains, workflows, requirements, pain points, and
integration opportunities. Re-express that knowledge in an original Sympho
Center experience.

## 2. Core Product Principles

Always optimize for:

- Citizen intent instead of department structure.
- One unified service experience.
- Simple language and guided journeys.
- Reusable, data-driven services and workflows.
- Progressive integration instead of big-bang migration.
- Tamil + English from the beginning.
- Accessibility and mobile-first usability.
- Clear prototype/mock boundaries.
- No fake government integrations or unsupported claims.

Preferred journey:

Home → Discover/Ask Sympho → Service → Eligibility → Documents →
Application → Review → Submit → Track → Result/Next Action.

Primary navigation should focus on citizen needs such as Services, Track,
Documents, Grievances, Ask Sympho, Help, and Profile. Do not reproduce
e-Sevai/TNeGA navigation.

## 3. Technology

Use the project's selected stack:

- SvelteKit
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Vercel
- GitHub
- SvelteKit-compatible i18n library for Tamil/English

Keep server-only logic, credentials, and external API calls on trusted
server boundaries. Never expose secrets in client code, Firestore, or GitHub.

## 4. Three Development Phases

### Phase 1 — Frontend + Complete Mock Workflows

Build a complete hackathon demonstration using mock data.

Include:

- polished responsive citizen portal
- service catalogue/search/filtering
- service detail pages
- eligibility wizard
- document checklist
- application wizard
- review/submit flow
- application tracking timeline
- citizen dashboard
- operator-assisted portal
- officer review portal
- admin/service configuration concepts
- notifications
- grievances
- AI chatbot interface ("Ask Sympho")
- DigiLocker mock/ready experience
- external-service redirect experience
- Tamil/English switching
- loading, empty, success and error states

Phase 1 must work end-to-end with mock Firestore-shaped data even before
Firebase is connected.

### Phase 2 — Firebase Backend

Connect:

- Firebase Auth
- Firestore
- Firebase Storage
- users/roles
- services
- workflows
- applications
- application events
- documents
- notifications
- grievances
- payments where applicable
- audit logs

Implement server-side validation and role-based authorization.

### Phase 3 — External Integrations

Connect only when real, verified credentials/endpoints are supplied.

Support:

- department API adapters
- normalized request/response mapping
- external status synchronization
- secure authentication
- verified official external redirects
- payment integrations when actually available
- DigiLocker integration when actual access is provided

NEVER invent an API, endpoint, credential, webhook, SLA, fee, or live
government integration.

## 5. Service Execution Model

Every service must declare one of exactly these modes:

1. `NATIVE_WORKFLOW`
   - Sympho owns the prototype form and workflow.
   - Store mock/persistent application data in Firestore.
   - Use the reusable workflow engine.

2. `API_INTEGRATED`
   - Sympho owns the citizen experience.
   - A server-side integration adapter communicates with the department API.
   - Normalize external data/statuses into Sympho models.

3. `EXTERNAL_REDIRECT`
   - Sympho provides service discovery, eligibility/document information,
     and a clear handoff.
   - Then redirect only to a verified official destination.
   - The external system remains authoritative until integration exists.

Progressive migration should be possible:

`EXTERNAL_REDIRECT → API_INTEGRATED → NATIVE_WORKFLOW`

Do not make the application dependent on e-District. If a service is
historically provided through e-District, model its required workflow in
Sympho for the prototype instead of connecting Sympho directly to e-District.

## 6. Service Architecture

Services must be data-driven, not one-off hard-coded pages.

A service should support:

- id/code/slug
- bilingual name/description
- category and department metadata
- eligibility and document rules
- verified/mock fee and SLA
- workflowId and integrationMode
- trusted externalUrl when applicable
- source/lastVerified and active status

Prefer reusable components such as ServiceCard, ServiceDetail, Search,
EligibilityChecker, DocumentChecklist, FormRenderer, ApplicationStepper,
ApplicationTimeline, StatusBadge, Notifications, GrievancePanel, FileUpload
and AIChat.

Adding a service should normally require metadata + workflow configuration,
not a new custom application architecture.

## 7. Workflow Engine

Workflows are reusable state machines.

Typical states may include:

`DRAFT → SUBMITTED → DOCUMENT_VERIFICATION → UNDER_REVIEW →
APPROVED → ISSUED → COMPLETED`

Also support:

`DOCUMENT_REQUIRED`, `CORRECTION_REQUIRED`, `RESUBMITTED`,
`REJECTED`, `CANCELLED`.

Rules:

- Every transition must be valid and role-authorized.
- Citizens can submit/resubmit where allowed.
- Officers can verify, request correction, approve/reject where authorized.
- Every transition creates an immutable application event.
- Rejection requires a reason.
- Correction and rejection are different outcomes.
- Existing applications must retain their workflow version.
- Never let a browser directly set an application to APPROVED or another
  privileged state.

Citizen timelines must translate technical states into understandable
language.

## 8. Data Model

Recommended Firestore collections:

`users`, `departments`, `categories`, `services`, `workflows`, `integrations`,
`applications`, `documents`, `payments`, `notifications`, `grievances`,
`auditLogs`.

Useful subcollections:
`applications/{id}/events` and `applications/{id}/documents`.

Store file metadata in Firestore and files in Firebase Storage. Citizens
only access their own records; officers/admins require explicit
role/assignment authorization.

## 9. Roles

Support Citizen, Operator, Officer, Department/Admin, and Platform Admin.

Operators assist citizens using the same service/workflow definitions.
Officers manage assigned applications, documents, timelines, remarks and
authorized actions. Admins manage services, workflows, integrations, users
and audits. Keep administrative UI separate from citizen UX.

## 10. AI — Ask Sympho

AI is a service-grounded assistant, not an unrestricted chatbot. It may find
services, explain verified eligibility/documents, guide applications,
explain status, navigate Sympho, and suggest grievance/help actions.

Ground answers in Sympho service data. Never invent official fees,
eligibility, legal requirements, deadlines, or government status.

## 11. DigiLocker

Use progressive implementation:

- Phase 1: clearly labelled mock/demo DigiLocker experience.
- Phase 2: integration-ready data model.
- Phase 3: real integration only after credentials/access are provided.

Never claim a live DigiLocker connection when it is not actually connected.

## 12. i18n

Tamil and English are mandatory.

Use an i18n library. Do not hard-code citizen-facing text in components.

Use structures such as:

`name.en / name.ta`
`description.en / description.ta`

Language switching must work across the entire application, not just the
homepage.

Tamil text must render correctly and layouts must remain responsive.

## 13. Visual Design

Use UX4G only as an accessibility/design reference, never as a template.

Sympho needs its own identity.

Palette:
Deep Navy `#071A28`, White `#FFFFFF`, AliceBlue `#F0F8FF`, restrained Red
`#FF0000`. Add semantic supporting colors only when needed. Red is mainly
for errors/critical emphasis.

Use strong hierarchy, spacing, readable typography, accessible contrast,
clear cards/forms, responsive layouts and consistent components.

## 14. Accessibility

Every important flow must support:

- semantic HTML
- keyboard navigation
- visible focus
- screen readers
- labels and error associations
- adequate contrast
- text resizing
- responsive mobile/tablet/desktop layouts
- Tamil text

Do not treat accessibility as a later feature.

## 15. Reliability

NEVER ship broken navigation, blank screens, dead buttons, or raw 500 errors.

Every async route/component needs loading, empty, success and recoverable
error states. Log technical errors safely and show human-readable messages.

Before completion verify navigation, buttons, links, dynamic routes, form
validation, refresh behavior, authorization and mobile layouts.

Do not hide errors by deleting features; fix the route, data, state or
integration problem.

## 16. External Websites and Research

External government websites are research sources, not design templates.

Extract domain knowledge such as:

- service names
- service categories
- eligibility patterns
- document requirements
- workflow concepts
- department ownership
- access channels
- pain points
- integration opportunities

Then create an original Sympho representation.

Do not copy their page text, logos, screenshots, branding, CSS, navigation,
or proprietary implementation.

Only use verified official URLs for external redirects.

## 17. Prototype Integrity

Sympho Center is a hackathon-ready prototype.

Clearly distinguish:

`LIVE`
`MOCK`
`DEMO`
`INTEGRATION READY`

Never present simulated officer approvals, mock payments, mock DigiLocker,
mock government APIs, or mock data as real production government services.

Mock implementations must use the same abstractions intended for Phase 2/3
so they can later be replaced without rebuilding the UI.

## 18. Build Strategy

Build in this order:

1. Design system/components + i18n
2. Service registry/detail
3. Eligibility + document checklist
4. Form/application engine
5. Workflow + tracking
6. Citizen dashboard
7. Officer/operator flows
8. AI/DigiLocker mock interfaces
9. External redirect model
10. Error/loading/accessibility polish

Prefer reusable architecture over duplicated pages. Demonstrate
representative services through a scalable service engine instead of
imitating the number of existing government pages.

## 19. Definition of Done

A feature is not complete merely because its page renders.

It is complete when:

- UI is polished and responsive
- Tamil/English works
- navigation works
- state/data flow works
- validation works
- loading/empty/error states exist
- roles are respected
- mock/live boundary is clear
- no console-breaking errors remain
- no raw 500 page is exposed
- the architecture remains compatible with later Firebase/API integration

## 20. Non-Negotiable Rules

DO NOT clone e-Sevai, TNeGA or department portals; use e-District as a
required dependency; hard-code every service; invent APIs/credentials;
expose secrets; fabricate official data; copy external content/design;
leave placeholder navigation; ship raw 500s; claim mock integrations are
live; or sacrifice Tamil/English/accessibility.

ALWAYS build for Tamil Nadu citizens, use citizen-first data-driven services,
reusable workflows, separate integration adapters, replaceable mock data,
server-side authorization, application history, clear timelines, original
Sympho branding, and demonstrable end-to-end flows.

Priority: security/correctness → working end-to-end flow → citizen
usability/accessibility → maintainability → visual polish → effects.
