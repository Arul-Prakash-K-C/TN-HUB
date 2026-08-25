Yes. I did the deeper research pass using **official Tamil Nadu Government / TNeGA / IT Department sources**, and there is a much stronger story for Sympho Center than the earlier report suggested.

The most important discovery is this:

> **The current public e-Sevai page, the published service catalogue, and the 2025–26 Tamil Nadu IT policy note do not describe exactly the same service universe.**

That itself is an important finding for Sympho.

# Sympho Center — Deep Government Service Domain Research

**Research basis:** Official Tamil Nadu Information Technology & Digital Services Department, TNeGA, e-Sevai portal, and UX4G.
**Research date:** August 23, 2026.
**Purpose:** Understand the existing ecosystem, not copy it.

---

# 1. Executive Summary

Tamil Nadu's digital public-service ecosystem is **not simply one website called e-Sevai**.

It is an ecosystem consisting of:

```text
TNeGA / DeG
      │
      ├── e-Sevai
      ├── e-District
      ├── Department portals
      ├── TNSSO
      ├── Digital document/data systems
      ├── Government workflows
      ├── Service Centre Agencies
      └── External government systems
```

The current ecosystem combines:

* citizen self-service
* assisted service centres
* departmental systems
* API integrations
* webpage integrations
* workflow-based services
* external portals
* payments
* document handling
* authentication
* grievance handling

The official 2025–26 policy note states that **410 services were available through the e-Sevai portal**, up from 273 in FY 2022–23, with 35 new services added from 12 departments during FY 2024–25. ([TNEGA][1])

However, the public e-Sevai homepage still says:

> "We have 119 services"

and is marked **Last Updated: 07/07/2022**. ([TNeGA][2])

This creates an important Sympho opportunity:

> **Government-service information itself is fragmented across portals, catalogues and publication dates.**

Sympho should therefore not merely be a service portal.

It should maintain a **single, structured Service Registry**.

---

# 2. What e-Sevai Actually Is

The public e-Sevai portal describes its model as an **operator-assisted service delivery platform**.

The published citizen journey is:

```text
Visit e-Sevai Centre
        ↓
Tell operator required service
        ↓
Provide requested information
        ↓
Pay service charge
        ↓
Receive receipt
        ↓
Application processed
        ↓
Receive status/result
        ↓
Collect certificate/result
```

The portal explicitly provides **Franchisee Login** and **Citizen Login**, while its main service instructions emphasize visiting an e-Sevai centre and telling the operator which government service is required. ([TNeGA][2])

The Tamil Nadu IT Department describes e-Sevai centres as **front-end delivery points** for government, private and social-sector services, particularly bringing services closer to rural citizens. ([TN IT Department][3])

So:

### e-Sevai is primarily a service-delivery ecosystem.

It is **not just an information website**.

---

# 3. The Scale Is Much Larger Than the Old Website Suggests

This is one of the strongest pieces of research.

### Public e-Sevai homepage

```text
119 services
Last updated: 07/07/2022
```

([TNeGA][2])

### 2025–26 Tamil Nadu Government policy note

```text
410 services
```

as of FY 2024–25, compared with 273 in FY 2022–23. ([TNEGA][1])

The same document says:

* 35 new services were added from 12 departments in FY 2024–25.
* 24 e-Contractor services were enabled in 8 departments.
* A Geology & Mining service for permission to remove clay/silt from tanks was developed online and launched in July 2024. ([TNEGA][1])

### This gives Sympho an important problem statement:

**Service discovery and service metadata need versioning.**

Sympho should store:

```text
service
service_code
service_name
department
source
source_date
last_verified
current_status
```

Instead of assuming that one static list is the truth.

---

# 4. Publicly Published Service Catalogue

The official IT Department's published e-Sevai-centre catalogue contains service codes, departments and charges. The currently accessible catalogue contains entries such as:

### Revenue

* REV-101 — Community Certificate
* REV-102 — Nativity Certificate
* REV-103 — Income Certificate
* REV-104 — No Graduate Certificate
* REV-105 — Deserted Woman Certificate
* REV-106 — Agricultural Income Certificate
* REV-107 — Family Migration Certificate
* REV-108 — Unemployment Certificate
* REV-109 — Widow Certificate
* REV-110 — Birth Certificate print for Revenue Villages
* REV-112 — Death Certificate print
* REV-201–207 — various pension schemes
* REV-501 — Full Field Patta Transfer
* REV-502 — Joint Patta Transfer
* REV-503 — Subdivision
* REV-701 — Grievance Day Petition
* REV-702 — A-register extract
* REV-703 — Chitta extract ([TN IT Department][4])

### Social Welfare

Includes marriage assistance and girl-child protection schemes such as:

* SWN-201
* SWN-202
* SWN-203
* SWN-204
* SWN-205
* SWN-206
* SWN-207 ([TN IT Department][5])

### Civil Supplies / PDS

* PDS-501 — New Card
* PDS-502 — Card Mutation
* PDS-504 — Smart Card Printing
* CSC-024 — PDS Aadhaar Enrollment ([TN IT Department][6])

### Police

* TNP-701 — CSR Status
* TNP-702 — FIR Status
* TNP-703 — Online Complaint Registration
* TNP-704 — Status Viewing
* TNP-705 — Vehicle Search ([TN IT Department][5])

### Transport

* STA-301 — Driving Licence Appointment
* STA-501 — Learner's Licence Online Application
* STA-701 — Learner's Licence Reprint ([TN IT Department][5])

### Registration

* IGR-601 — Application through Offline Payment
* IGR-701 — Challan Printing
* IGR-301 — Marriage/Document Registration Appointment
* IGR-702 — Appointment Acknowledgement ([TN IT Department][6])

### Utilities / Local Government

* TEB-601 — Electricity Bill Payment
* COC-101 — Birth Certificate Printing
* COC-102 — Death Certificate Printing
* COC-401 — Trade Licence Renewal
* COC-601 — Company Tax
* COC-602 — Professional Tax
* COC-603 — Property Tax
* CMW-601 — Water & Sewerage Tax
* CMA-601–605 — municipal collections ([TN IT Department][6])

### Licences / Regulatory

The catalogue also includes:

* Boiler licences
* Drug-control licences
* Fire & Rescue NOCs/licences
* Electrical Inspectorate services
* Employment registration
* Fisheries assistance
* Differently Abled Welfare services ([TN IT Department][6])

This demonstrates that e-Sevai isn't merely a **"certificate portal."**

It spans:

```text
Certificates
Pensions
Land
PDS
Police
Transport
Registration
Utilities
Taxes
Licences
Welfare
Education
Employment
Complaints
Payments
```

---

# 5. Service Categories — What Sympho Should Do Differently

Existing services are largely organized according to **administrative ownership**.

For example:

```text
Revenue
Civil Supplies
Police
Transport
Registration
TANGEDCO
Corporation
Social Welfare
```

That makes sense internally.

But citizens usually think:

> "I need a certificate."

not:

> "Which department owns this certificate?"

### Sympho should introduce a second layer.

## Administrative taxonomy

```text
Department
    ↓
Service
```

## Citizen taxonomy

```text
What do you want to accomplish?
```

For example:

### I need a document

* Income Certificate
* Community Certificate
* Nativity Certificate
* Birth Certificate
* Death Certificate

### I need to manage my family/ration services

* New ration card
* Card modification
* Smart card

### I need land services

* Patta transfer
* Joint patta
* Subdivision
* Land extracts

### I need financial assistance

* Pension
* Marriage assistance
* Welfare schemes

### I need to pay something

* Electricity
* Property tax
* Professional tax
* Water charges
* Challans

### I need a licence/approval

* Driving licence
* Fire licence
* Drug licence
* Boiler licence

### I need to report something

* Grievance
* Consumer complaint
* Police complaint

This is one of Sympho's biggest UX differentiators.

---

# 6. Existing Service Centre Ecosystem

A very important discovery is that **physical service centres remain fundamental**.

The 2025–26 policy note reports:

> **34,843 active e-Sevai centres across Tamil Nadu as of 31 March 2025.** ([TNEGA][1])

The centres are operated through multiple Service Centre Agencies, including:

* PACCS
* TACTV
* VPRC
* Fisheries Department
* Cooperative Housing Societies
* MLA offices
* e-Sevai for All
* VKP
* CSC-SPV
* others. ([TNEGA][1])

Therefore Sympho should **not** make the mistake of saying:

> "Everything should become self-service."

Instead:

```text
                   SYMPHO
                     │
          ┌──────────┴──────────┐
          │                     │
      SELF SERVICE        ASSISTED SERVICE
          │                     │
      Citizen Portal       Sympho Centre
          │                     │
          └──────────┬──────────┘
                     │
              SAME APPLICATION
                     │
              SAME TRACKING
                     │
              SAME DOCUMENTS
```

That is much more inclusive.

---

# 7. e-Sevai for All Is Important

The **e-Sevai for All (EFA)** initiative was launched in March 2023 to encourage entrepreneurs to establish e-Sevai centres throughout villages, wards and habitations. ([TNEGA][1])

The policy note reports that:

* EFA handled 58.31% of total e-Sevai transactions in FY 2023–24.
* Its share increased to around 60% through March 2025.
* Training was provided to EFA centre operators. ([TNEGA][1])

This means the physical/operator layer isn't a temporary legacy.

It is an important **last-mile digital service model**.

### Sympho improvement

Make the operator a first-class Sympho user:

```text
Citizen
    │
    ├── Self Service
    │
    └── Assisted Service
             │
             ▼
       Sympho Operator
             │
             ▼
       Same Workflow
```

---

# 8. Integration Architecture — This Is Where Sympho Gets Technically Strong

The TNISP RFP is extremely valuable.

It explicitly documents two existing e-Sevai integration approaches:

### API integration

```text
e-Sevai UI
     ↓
External API
     ↓
Department system
```

The document gives **TANGEDCO payment API** as an example.

### Webpage integration

```text
e-Sevai
    ↓
Headless browser
    ↓
External service webpage
    ↓
Form submission
```

The document states that payment redirection can return to e-Sevai. ([TNEGA][7])

The same RFP lists:

```text
API / Webpage Integration = 67
Workflow = 32
Total = 99
```

for that TNISP scope. ([TNEGA][7])

### This validates your Sympho architecture.

But we should distinguish:

**Existing terminology**

```text
API Integration
Webpage Integration
Workflow
```

from:

**Sympho abstraction**

```text
NATIVE_WORKFLOW
API_INTEGRATED
EXTERNAL_REDIRECT
```

That's an excellent design decision.

---

# 9. Sympho's Progressive Migration Architecture

This can become one of your strongest hackathon features.

### Stage 1 — External

```text
Sympho
   ↓
Service information
   ↓
External department portal
```

Citizen still gets:

* eligibility
* documents
* explanation
* instructions
* official link

before leaving Sympho.

---

### Stage 2 — API

```text
Sympho
   ↓
Sympho Backend
   ↓
Department API
   ↓
Department System
```

Citizen doesn't need to leave Sympho.

---

### Stage 3 — Native

```text
Sympho
   ↓
Sympho Workflow
   ↓
Officer
   ↓
Department
```

Therefore:

> **Sympho does not need every department to integrate on day one.**

It can progressively migrate services.

```text
External Redirect
        ↓
API Integration
        ↓
Native Workflow
```

That is much more realistic than saying:

> "We'll replace every government backend."

---

# 10. Current Government Ecosystem Already Has a Unified Authentication Direction

The 2025–26 policy note describes **Tamil Nadu Single Sign-On (TNSSO)**.

Its purpose is to reduce the need for multiple credentials and multiple departmental URLs through unified authentication. It also describes a proposed centralized multi-factor authentication mechanism. ([TNEGA][1])

The policy note says nine applications had been integrated at the time of the report, including:

* e-Office
* Case Monitoring
* TANFINET Unified Portal
* DBT Portal
* KMUT
* State Scholarship Portal
* Crop Survey
* GRAINS
* TNGIS. ([TNEGA][1])

### Important implication for Sympho

Don't claim:

> "No unified authentication exists."

Instead:

> **"Sympho extends the unified-service concept from authentication to the complete citizen service journey."**

That's a much stronger argument.

---

# 11. Documents and AI — There Is Strong Evidence for Your Idea

This is another major discovery.

The TNISP RFP requires an:

> **AI-enabled Document Management System**

for uploaded and generated records.

The document specifically says OCR is required for **filling form fields**. 

That means your:

```text
Document Vault
+
OCR
+
AI document processing
```

idea isn't arbitrary.

### Sympho evolution

```text
Upload document
      ↓
OCR
      ↓
Extract fields
      ↓
Validate
      ↓
Suggest form values
      ↓
Citizen confirms
      ↓
Submit
```

For Phase 1:

```text
MOCK OCR
MOCK DOCUMENT VAULT
MOCK DIGILOCKER
```

Phase 3 can become real integrations.

---

# 12. DigiLocker Should Be a Future Integration, Not a Fake Claim

The TNISP documentation includes DigiLocker among the digital ecosystem components considered for integration.

So Sympho can architect:

```text
Document Vault
       │
       ├── Upload
       ├── OCR
       ├── Reuse
       └── DigiLocker
```

But your prototype should say:

> **DigiLocker-ready**

rather than claiming:

> "Sympho is connected to DigiLocker."

---

# 13. Application Workflow Model

The earlier report was too simplistic.

Don't use one universal workflow such as:

```text
Citizen
 ↓
VAO
 ↓
RI
 ↓
Tahsildar
```

That applies only to particular revenue workflows.

Instead Sympho needs a **generic workflow engine**.

```text
SERVICE
   ↓
WORKFLOW
   ↓
STAGES
```

Example:

### Certificate

```text
Draft
 ↓
Submitted
 ↓
Document Verification
 ↓
Officer Review
 ↓
Approval
 ↓
Certificate Issued
```

### Welfare

```text
Submitted
 ↓
Eligibility Verification
 ↓
Document Verification
 ↓
Department Review
 ↓
Sanction
 ↓
Benefit Processing
```

### Payment

```text
Bill Retrieval
 ↓
Payment
 ↓
Gateway Confirmation
 ↓
Receipt
```

### Complaint

```text
Submitted
 ↓
Assigned
 ↓
Under Investigation
 ↓
Response
 ↓
Resolved
 ↓
Closed
```

This gives Sympho a **workflow abstraction layer**.

---

# 14. Application State Machine

Sympho should normalize service status into:

```text
DRAFT
SUBMITTED
PAYMENT_PENDING
PAYMENT_COMPLETED
UNDER_VERIFICATION
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
```

Then the UI can present:

```text
Application #SYM-2026-001245

✓ Submitted
✓ Documents verified
● Officer review
○ Approval
○ Certificate issued
```

This is much more useful than simply:

> "Status: Processing"

---

# 15. Exception Handling — Major Sympho Opportunity

This was almost completely missing from your previous report.

Government-service systems need to handle:

### Missing document

```text
Document Required
     ↓
Citizen receives notification
     ↓
Upload
     ↓
Resubmit
```

### Incorrect document

```text
Document Rejected
     ↓
Why?
     ↓
Replace document
```

### Application correction

```text
Correction Required
     ↓
Show exact field
     ↓
Citizen edits
     ↓
Resubmit
```

### Department unavailable

```text
Department service unavailable

[Retry]
[Save & Continue Later]
[View official portal]
```

### Payment failure

```text
Payment Failed
     ↓
Retry
     ↓
Don't duplicate application
```

### SLA exceeded

```text
Expected by: 28 Aug

⚠ Service is delayed

[Raise Grievance]
```

This is where **Sympho can go beyond merely aggregating services.**

---

# 16. Unified Application Timeline

Every application should have:

```text
Application ID
Service
Department
Submitted date
Current stage
Expected completion
SLA
Documents
Payments
Status history
Officer actions
Corrections
Notifications
Grievance
Result
```

Example:

```text
Income Certificate

SYM-REV-2026-000145

Submitted
23 Aug

Documents verified
23 Aug

Under officer review
24 Aug

Expected completion
29 Aug

Current status:
UNDER REVIEW
```

---

# 17. Grievance Is Already a Major Part of the Ecosystem

The 2025–26 policy note says TNeGA's grievance call centre had been migrated to the **Mudhalvarin Mugavari Call Centre**.

For FY up to March 2025:

* 295,134 calls were received.
* 97% were resolved at operator level.
* Capacity was increased from 10 to 20 seats.
* Abandoned-call rate fell from 37% to 1.12% between May and December 2024. ([TNEGA][1])

This is significant.

### Sympho should not merely have:

```text
Contact Us
```

It should have:

```text
Application
   ↓
Problem?
   ↓
Raise Grievance
   ↓
Linked to Application ID
   ↓
Track grievance
```

That creates **context-aware grievance management**.

---

# 18. Accessibility

The existing e-Sevai portal provides:

* Tamil
* Screen-reader access
* A− / A / A+
* Skip-to-content functionality. ([TNeGA][2])

UX4G 3.0 goes considerably further.

It currently presents:

* 50+ production-ready components/patterns
* accessibility-oriented components
* WCAG support
* OTP patterns
* payment patterns
* application pipeline patterns
* language selection
* draft-saving patterns
* grievance patterns
* service/application patterns. ([UX4G Design System 3.0][8])

UX4G also explicitly connects its system to government-service requirements including accessibility, grievance and SLA-oriented patterns. ([UX4G Design System 3.0][8])

### Sympho should use the principles, not copy UX4G's screens.

---

# 19. Data Governance Is Another Important Discovery

The 2025–26 policy note describes Tamil Nadu's Data Policy with principles including:

* openness
* privacy
* ethics and equity
* transparency
* interoperability
* quality
* security
* accountability
* usability. ([TNEGA][1])

This gives Sympho a strong architectural principle:

> **A unified citizen experience does not mean centralizing every department's database.**

Instead:

```text
                 SYMPHO
                    │
             Service Registry
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
   Native DB    Department    External
                API/System     Portal
```

Sympho can unify the **experience and orchestration**, while data ownership remains with the appropriate system.

That is a much more realistic architecture.

---

# 20. Security

Tamil Nadu's current government digital ecosystem also treats security as a formal lifecycle requirement.

The 2025–26 policy note says security audits are mandatory for websites/web applications hosted in the Tamil Nadu State Data Centre and are conducted annually, with audits also required before deployment or after relevant modifications. ([TNEGA][1])

The TNISP RFP also specifies security administration involving:

* firewall
* intrusion prevention/detection
* content filtering
* malware protection
* DDoS protection
* event logging
* vulnerability protection
* identity and access management. 

For your hackathon prototype, you don't need to implement all of this, but your architecture should be **security-ready**.

---

# 21. Current Service Scale

The 2025–26 policy note reports:

**34,843 active e-Sevai centres** as of March 31, 2025. ([TNEGA][1])

It also reports:

**10,966,215 e-Sevai transactions during FY 2024–25.** ([TNEGA][1])

The TNISP RFP separately described the existing e-Sevai 1.0 system at approximately **50,000 service requests/day** in its capacity-planning context. ([TNEGA][7])

These figures are from different documents/timeframes and should **not be combined as if they measure exactly the same thing**.

But they clearly establish that this is a **large-scale public-service ecosystem**.

---

# 22. Verified Pain Points vs Assumptions

This is where I want to correct the previous report strongly.

### Evidence-supported

| Finding                                             | Evidence                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| Service catalogue fragmentation/version differences | Public portal says 119 and last updated 2022; 2025 policy says 410 |
| Multiple integration mechanisms                     | API/Webpage + Workflow                                             |
| Large number of service centres                     | 34,843                                                             |
| Multiple Service Centre Agencies                    | Official policy note                                               |
| Multiple departmental systems                       | TNSSO integrations                                                 |
| Need for document processing                        | AI document-management requirement                                 |
| Need for OCR                                        | Explicit TNISP requirement                                         |
| Grievance demand                                    | 295,134 calls                                                      |
| Multiple service channels                           | e-Sevai centres + digital systems                                  |

### Needs separate UX audit

Don't claim these as facts without testing:

* "search is bad"
* "navigation is confusing"
* "deep links don't work"
* "login is contradictory"
* "users upload duplicate documents"
* "status tracking is poor"

Those can become **Sympho research observations** after we perform a systematic UX audit.

---

# 23. Root Cause Analysis

The deeper issue isn't simply:

> "e-Sevai has an old UI."

The ecosystem's complexity comes from:

```text
Many Departments
      +
Many Applications
      +
Different Workflows
      +
Different Data Owners
      +
Different Integration Methods
      +
Different Service Lifecycles
      +
Physical Service Centres
      +
External Portals
      ↓
Fragmented Citizen Experience
```

That's the problem Sympho should solve.

---

# 24. Sympho's Core Concept

Therefore:

## Existing model

```text
Citizen
   ↓
Find department/service
   ↓
e-Sevai / department / centre
   ↓
Different workflow
   ↓
Different tracking
   ↓
Different result
```

## Sympho

```text
Citizen
   ↓
"What do I need?"
   ↓
Sympho Intelligence
   ↓
Service Discovery
   ↓
Eligibility
   ↓
Documents
   ↓
Application
   ↓
Workflow Orchestrator
   ↓
┌──────────────┬──────────────┬───────────────┐
│              │              │
Native       API          External
Workflow     Service       Portal
│              │              │
└──────────────┴──────────────┘
               ↓
       Unified Tracking
               ↓
          Notification
               ↓
             Result
```

---

# 25. Sympho's Unique Layers

I would now define Sympho with **seven layers**.

### 1. Service Discovery Layer

```text
Search
Categories
Natural language
AI recommendations
```

### 2. Service Intelligence Layer

```text
Eligibility
Documents
Fees
SLA
Department
Service availability
```

### 3. Application Layer

```text
Dynamic forms
Draft saving
Document reuse
OCR
Validation
Payment
```

### 4. Workflow Orchestration Layer

```text
Native
API
External
```

### 5. Citizen Data Layer

```text
Profile
Document Vault
DigiLocker-ready
Application history
Notifications
```

### 6. Assistance Layer

```text
Ask Sympho
Tamil
English
Accessibility
Operator assistance
```

### 7. Transparency Layer

```text
Application timeline
SLA
Status
Reason for rejection
Correction
Grievance
Audit history
```

---

# 26. The Most Important Sympho Innovation

I would describe your product like this:

> **Sympho Center is not another government portal. It is a citizen-facing service orchestration layer that unifies discovery, eligibility, documents, workflows, tracking and assistance across a fragmented government-service ecosystem.**

That is much stronger than:

> "Sympho is an upgraded e-Sevai."

Because technically, Sympho is doing something more specific.

---

# 27. Sympho Service Registry

Your Firestore model should eventually look like:

```text
services
 ├── serviceId
 ├── code
 ├── names
 │    ├── en
 │    └── ta
 ├── citizenCategory
 ├── departmentId
 ├── description
 ├── eligibility
 ├── documents
 ├── fees
 ├── SLA
 ├── applicationType
 ├── workflowId
 ├── integrationMode
 ├── externalUrl
 ├── apiConfig
 ├── status
 ├── source
 ├── sourceVersion
 ├── lastVerified
 └── languageContent
```

---

# 28. Service Integration Registry

Separate this from service metadata:

```text
serviceIntegrations

serviceId
integrationMode
provider
endpoint
authentication
requestMapping
responseMapping
paymentMode
redirectUrl
fallbackMode
status
lastVerified
```

This allows:

```text
Service
   ↓
EXTERNAL_REDIRECT
```

to eventually become:

```text
Service
   ↓
API_INTEGRATED
```

without changing the citizen-facing service page.

---

# 29. Workflow Registry

```text
workflows

workflowId
serviceId

steps:
  1. application
  2. documentVerification
  3. officerReview
  4. approval
  5. issuance

roles
sla
conditions
transitions
notifications
exceptionHandlers
```

This is what makes your architecture scalable.

---

# 30. Document Registry

```text
documents

documentId
userId
documentType
source

UPLOAD
DIGILOCKER
DEPARTMENT
OCR

verificationStatus
issuedDate
expiryDate
metadata
storageReference
consent
```

The user should not repeatedly upload the same document.

---

# 31. Application Registry

```text
applications

applicationId
userId
serviceId
workflowId
departmentId

status

createdAt
submittedAt
updatedAt
expectedCompletion

formData
documents
payments

timeline[]
corrections[]
notifications[]
grievanceId
result
```

---

# 32. Officer Model

Sympho needs an internal workflow model:

```text
Officer
   ↓
Assigned Applications
   ↓
Verification
   ↓
Request Correction
   ↓
Approve
   ↓
Reject
```

The officer should see:

```text
Applicant
Service
Documents
Eligibility
Application data
Previous corrections
Timeline
SLA
Actions
```

Not the entire citizen portal.

---

# 33. AI "Ask Sympho"

This should **not** just be a chatbot.

Its workflow should be:

```text
Citizen:
"I need proof of my income."

          ↓

Intent Detection

          ↓

Service Registry

          ↓

Candidate Services

          ↓

Eligibility

          ↓

Document requirements

          ↓

Recommendation

          ↓

"Income Certificate"

[Check Eligibility]
[View Documents]
[Start Application]
```

Later:

```text
"Why is my application delayed?"

       ↓

Application Registry
       ↓
Workflow State
       ↓
SLA
       ↓
Explain current stage
```

That's much more powerful.

---

# 34. Sympho's Phase Strategy

## Phase 1 — Prototype

Use:

```text
Mock Service Registry
Mock Users
Mock Applications
Mock Documents
Mock DigiLocker
Mock AI
Mock Officer
Mock Workflows
```

Main demo:

```text
Citizen
 ↓
Ask Sympho
 ↓
Income Certificate
 ↓
Eligibility
 ↓
Documents
 ↓
Application
 ↓
Mock DigiLocker
 ↓
Submit
 ↓
Tracking
 ↓
Officer
 ↓
Verify
 ↓
Approve
 ↓
Citizen notification
```

---

## Phase 2 — Platform

Your stack:

```text
SvelteKit
      ↓
Firebase Authentication
      ↓
Firestore
      ↓
Firebase Storage
```

Collections:

```text
users
departments
categories
services
workflows
applications
documents
payments
notifications
grievances
integrations
auditLogs
```

---

## Phase 3 — Integration

```text
Sympho
   ↓
Service Registry
   ↓
Integration Adapter
   ↓
┌─────────────────────────────┐
│                             │
API                         External
│                             │
Department backend        Department site
```

And migrate:

```text
External
   ↓
API
   ↓
Native
```

---

# 35. Final Sympho Problem Statement

I recommend using this as your official hackathon problem statement:

> **Tamil Nadu has a large and increasingly digital government-service ecosystem, but services are distributed across departments, workflows, service centres, APIs and external portals. Citizens often need to understand administrative structures, service terminology, document requirements and different application processes to accomplish a simple task. Sympho Center proposes a unified citizen-first service orchestration platform that abstracts this complexity without requiring every government system to be replaced.**

Then:

> **Sympho combines intelligent service discovery, eligibility guidance, reusable documents, AI-assisted applications, unified tracking, workflow orchestration and progressive department integration into one Tamil-English citizen experience.**

---

# 36. The strongest evidence for your project

These are the facts I'd put into your hackathon presentation:

**410 services** — e-Sevai portal's 2025–26 policy-reported service count. ([TNEGA][1])

**34,843 active e-Sevai centres** — as of March 31, 2025. ([TNEGA][1])

**10.97 million transactions** — reported for FY 2024–25. ([TNEGA][1])

**67 API/Webpage + 32 Workflow = 99 services** — documented in the TNISP integration scope. ([TNEGA][7])

**AI document management + OCR** — explicitly specified in the TNISP requirements. 

**TNSSO** — existing government initiative aimed at reducing multiple credentials and departmental URLs. ([TNEGA][1])

**295,134 grievance calls** — handled through the e-Sevai grievance call-centre ecosystem through FY 2024–25. ([TNEGA][1])

**119 services / last updated 2022** — still shown on the public e-Sevai homepage, demonstrating a service-information freshness/versioning problem. ([TNeGA][2])

---

## The conclusion I would use for Sympho

**Don't pitch Sympho as "e-Sevai 2.0."**

Pitch it as:

> ### **Sympho Center**
>
> **The Citizen Service Orchestration Layer for Tamil Nadu**
>
> Existing government systems continue to own their services and data.
>
> **Sympho owns the citizen experience.**

And the architecture becomes:

```text
                    CITIZEN
                       │
                       ▼
              ┌─────────────────┐
              │  SYMPHO CENTER  │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     Discover      Documents     AI Assist
          │            │            │
          └────────────┼────────────┘
                       ▼
              SERVICE ORCHESTRATOR
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     NATIVE           API          EXTERNAL
     WORKFLOW      INTEGRATION      PORTAL
        │              │              │
        └──────────────┼──────────────┘
                       ▼
              UNIFIED APPLICATION
                    TRACKING
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        NOTIFICATION          GRIEVANCE
```

**This is now a defensible Sympho architecture based on actual characteristics of Tamil Nadu's existing digital-service ecosystem, rather than assumptions about e-Sevai.** ([TNEGA][7])

And importantly, **your original three-mode idea was directionally correct**. The official TNISP documentation is the evidence that makes it credible: existing services already use different integration mechanisms, so Sympho's job can be to **normalize that complexity behind one citizen experience** rather than pretending all departments can be replaced at once. ([TNEGA][7])

[1]: https://tnega.tn.gov.in/assets/pdf/it_e_pn_2025_26.pdf "D 31 - IT Tam - Policy wrapper - 2025 english final.cdr"
[2]: https://www.tnesevai.tn.gov.in/NewIndex.html "TNeGA"
[3]: https://it.tn.gov.in/en/TNEGA/e-Sevai?utm_source=chatgpt.com "e-Sevai | Tamil Nadu Information Technology Department"
[4]: https://it.tn.gov.in/en/node/162?utm_source=chatgpt.com "List of services offered in e-sevai centres | Tamil Nadu Information Technology Department"
[5]: https://www.it.tn.gov.in/en/List_of_services_offered_in_e-sevai_centres?utm_source=chatgpt.com "List of services offered in e-sevai centres | Tamil Nadu Information Technology Department"
[6]: https://it.tn.gov.in/en/node/162 "List of services offered in e-sevai centres | Tamil Nadu Information Technology Department"
[7]: https://tnega.tn.gov.in/cmsimages/TNeGALCAP20222023/25042023010401-3.Pdf?utm_source=chatgpt.com "Tamil Nadu e-Governance Agency Request for Proposal for the Selection of System Integrator for Tamil Nadu Integrated Services Platform (TNISP) – a Low Code Application Platform (Tender Ref No: TNeGA/LCAP/2022-2023) |  |  |  |"
[8]: https://www.ux4g.gov.in/ "UX4G Design System 3.0"
