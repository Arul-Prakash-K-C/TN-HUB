# Sympho Center — Government Service Catalog

## Purpose

This document defines the service catalogue model for Sympho Center.

The catalogue is designed to transform government services from a
department-centric structure into a citizen-centric service discovery
system.

IMPORTANT:

Service names, fees, SLAs and availability must be verified against
current official sources before being presented as live information.

Do not invent government service codes, fees or processing times.

---

# 1. Service Classification

Sympho uses two classification layers.

## Layer 1 — Citizen Intent

This is the primary navigation.

## Layer 2 — Government Ownership

Department information is retained as metadata.

Example:

Citizen Category:
Certificates

Service:
Income Certificate

Department:
Revenue Administration

---

# 2. Citizen Categories

Recommended categories:

1. Certificates
2. Land & Property
3. Ration & Family Services
4. Welfare & Financial Assistance
5. Licences & Permits
6. Payments & Taxes
7. Transport
8. Police & Public Safety
9. Registration
10. Education
11. Employment
12. Utilities
13. Complaints & Grievances
14. Business & Professional Services
15. Other Government Services

---

# 3. Service Metadata

Every service should have:

serviceId
serviceCode
slug
name
nameTamil
category
department
description
descriptionTamil
eligibility
requiredDocuments
fee
processingTime
workflowId
integrationMode
externalUrl
status
source
lastVerified

---

# 4. Integration Modes

Allowed values:

NATIVE_WORKFLOW
API_INTEGRATED
EXTERNAL_REDIRECT

---

# 5. Example Service Record

{
  "serviceId": "income-certificate",
  "serviceCode": "REV-103",
  "slug": "income-certificate",
  "name": {
    "en": "Income Certificate",
    "ta": "வருமானச் சான்றிதழ்"
  },
  "category": "certificates",
  "department": "Revenue Administration",
  "integrationMode": "NATIVE_WORKFLOW",
  "status": "prototype"
}

The actual production record should contain verified eligibility,
documents, fees and workflow information.

---

# 6. Certificate Services

Representative services include:

## Community Certificate

Purpose:

Proof of community/category for government and educational purposes.

Potential workflow:

Application
    |
Document Verification
    |
Officer Review
    |
Approval
    |
Certificate Issuance

Integration:

Prototype:
NATIVE_WORKFLOW

Production:
Depends on available official integration.

---

## Nativity Certificate

Purpose:

Proof of nativity/residency-related status where officially required.

Potential workflow:

Application
    |
Document Verification
    |
Verification
    |
Approval
    |
Certificate Issuance

---

## Income Certificate

Purpose:

Certification of income for eligible government, education and welfare
purposes.

Potential workflow:

Application
    |
Document Verification
    |
Officer Review
    |
Approval
    |
Certificate Issuance

---

## Birth Certificate

Possible service types may include:

- certificate search
- certificate printing
- certificate retrieval

Actual availability and responsible authority must be verified.

---

## Death Certificate

Possible service types may include:

- certificate search
- certificate printing
- certificate retrieval

Actual availability and responsible authority must be verified.

---

# 7. Land & Property

Representative categories:

- Patta transfer
- Joint Patta transfer
- Subdivision
- Land record extracts
- A-register related services
- Chitta related services

Possible citizen intent:

"I want to change land ownership."

"I need a land record."

"I need a land extract."

Workflow varies according to service.

Do not use one universal land workflow.

---

# 8. Ration & Family Services

Representative services:

- new ration/smart card
- card modification
- family member changes
- smart card printing
- Aadhaar-related PDS services where officially supported

Citizen intent:

"I want to manage my ration card."

---

# 9. Welfare Services

Representative categories:

- pensions
- marriage assistance
- differently abled welfare
- social welfare schemes
- financial assistance
- girl-child protection schemes

Each scheme requires:

- eligibility
- age conditions
- income conditions where applicable
- documents
- application process
- approval process

These must be stored as structured metadata.

---

# 10. Police Services

Representative categories may include:

- CSR status
- FIR status
- online complaint
- complaint status
- vehicle-related searches

The exact service and external system must be verified before integration.

---

# 11. Transport Services

Representative categories:

- learner licence
- driving licence
- appointment
- application status
- reprint services

External department integration may be required.

---

# 12. Registration Services

Representative categories:

- registration appointment
- challan-related services
- document registration
- marriage registration-related services

Workflow differs by service.

---

# 13. Utility Services

Possible categories:

- electricity bill
- water charges
- sewerage charges
- municipal payments
- property tax
- professional tax

These are commonly suitable for API integration or external redirect.

---

# 14. Business & Regulatory Services

Potential categories:

- trade licences
- professional licences
- fire-related approvals
- electrical approvals
- drug-control services
- boiler-related services
- contractor-related services

These should normally expose:

- eligibility
- documents
- fee
- processing expectations
- official authority
- application route

---

# 15. Grievance Services

Sympho should distinguish:

## General Grievance

Citizen submits a complaint.

## Application Grievance

Complaint is linked to an existing Sympho application.

Example:

Application:
SYM-REV-2026-00125

    |
    v

Raise Grievance

    |
    v

GRV-2026-00542

This provides context to the grievance process.

---

# 16. Service Discovery Fields

Search should support:

- service name
- Tamil service name
- keywords
- category
- department
- service code
- citizen intent
- eligibility
- integration mode

Example:

Search:

"income"

Results:

Income Certificate

Search:

"சான்றிதழ்"

Results:

Certificate-related services.

---

# 17. Service Card

Every service card should display:

Service Name
Tamil Name
Short Description
Category
Estimated Time
Fee
Availability
Integration Mode

Actions:

View Details
Check Eligibility
Start Application

For external services:

Open Official Service

---

# 18. Service Detail Page

Recommended structure:

1. Service title
2. Simple explanation
3. Who can apply
4. Eligibility
5. Required documents
6. Fee
7. Expected processing time
8. Application process
9. What happens after submission
10. Common problems
11. Frequently asked questions
12. Integration type
13. Start / Visit official service

---

# 19. Eligibility Engine

Eligibility should not be stored only as paragraphs.

Use structured questions.

Example:

{
  "question": "Are you a resident of Tamil Nadu?",
  "type": "boolean",
  "required": true
}

Then:

YES
    |
Continue

NO
    |
Show explanation

The engine should support:

- boolean
- single choice
- multiple choice
- number
- date
- text
- document verification

---

# 20. Document Requirements

Document metadata:

documentId
documentType
displayName
displayNameTamil
mandatory
acceptableFormats
source
verificationRequired
reusable

Example:

{
  "documentType": "identity-proof",
  "mandatory": true,
  "reusable": true
}

---

# 21. Service Lifecycle

A service can have:

DRAFT
ACTIVE
TEMPORARILY_UNAVAILABLE
MIGRATING
DEPRECATED

Never remove historical applications when a service becomes inactive.

---

# 22. Service Integration Migration

Example:

Income Certificate

Current:
EXTERNAL_REDIRECT

Future:
API_INTEGRATED

Later:
NATIVE_WORKFLOW

The service ID should remain stable.

Only integration metadata changes.

---

# 23. Service Versioning

Every service should have:

version
lastVerified
source
sourceUrl
verifiedBy
verificationDate

Example:

{
  "version": "2026.08",
  "lastVerified": "2026-08-23",
  "source": "official-government-source"
}

---

# 24. Prototype Services

For Phase 1, prioritize a small number of representative services.

Recommended:

1. Income Certificate
2. Community Certificate
3. Nativity Certificate
4. Ration Card service
5. Property Tax / Utility payment
6. Grievance
7. One external service

These should demonstrate different workflow types.

Example:

Income Certificate
    -> Native Workflow

Community Certificate
    -> Native Workflow

Ration Service
    -> Native Mock / API-ready

Property Tax
    -> External/API mock

Grievance
    -> Native Workflow

---

# 25. Why Not Implement Every Service in Phase 1?

The objective is not to create hundreds of static pages.

The objective is to demonstrate that one reusable platform can support
many service types.

Therefore:

Service Registry
        +
Reusable Form Engine
        +
Reusable Workflow Engine
        +
Reusable Document System
        +
Reusable Tracking
        =
Scalable Government Service Platform

---

# 26. Data Model

Recommended Firestore collections:

services
categories
departments
workflows
eligibilityRules
documentsMetadata
integrations

Applications should be stored separately:

applications
applicationEvents
applicationDocuments
applicationPayments
applicationNotifications
grievances

---

# 27. Service Registry Example

{
  "serviceId": "rev-income",
  "serviceCode": "REV-103",
  "name": {
    "en": "Income Certificate",
    "ta": "வருமானச் சான்றிதழ்"
  },
  "categoryId": "certificates",
  "departmentId": "revenue",
  "workflowId": "certificate-standard",
  "integrationMode": "NATIVE_WORKFLOW",
  "status": "ACTIVE"
}

---

# 28. Important Accuracy Rule

Never fabricate:

- service codes
- fees
- SLA
- department ownership
- API endpoints
- official URLs
- eligibility
- legal requirements

If information is uncertain:

mark it as:

UNVERIFIED

or:

MOCK_DATA

---

# 29. Source Strategy

Each service should eventually have:

sourceName
sourceUrl
sourceType
lastVerified

Possible source types:

OFFICIAL_PORTAL
OFFICIAL_POLICY
OFFICIAL_SERVICE_CATALOG
DEPARTMENT_PORTAL
MOCK_DATA

---

# 30. Sympho Service Philosophy

The citizen should not have to ask:

"Which department provides this?"

Instead Sympho should answer:

"You need this service."

Then explain:

- why
- eligibility
- documents
- fee
- time
- process
- where it happens
- how to track it