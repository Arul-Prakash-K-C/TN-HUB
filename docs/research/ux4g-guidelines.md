# Sympho Center — UX4G-Inspired Design Guidelines

## Purpose

UX4G is used as a design-system and accessibility reference.

Sympho must NOT copy:

- UX4G website layout
- UX4G branding
- UX4G page structures
- UX4G visual identity
- exact components without adaptation

Use the principles and patterns to create an independent Sympho design.

---

# 1. Design Philosophy

Sympho should be:

- citizen-first
- simple
- accessible
- multilingual
- trustworthy
- responsive
- task-oriented
- transparent
- consistent

The primary goal is:

Reduce the amount of thinking required to complete a government service.

---

# 2. Citizen-First Design

Do not make citizens understand:

- department names
- technical systems
- integration mechanisms
- workflow engines
- database architecture
- government acronyms

Instead show:

What do you need?

What can Sympho do?

What documents do you need?

What happens next?

---

# 3. Information Architecture

Recommended:

Home
    |
    +-- Services
    |      |
    |      +-- Certificates
    |      +-- Welfare
    |      +-- Land
    |      +-- Licences
    |      +-- Payments
    |      +-- Complaints
    |
    +-- My Applications
    |
    +-- Documents
    |
    +-- Notifications
    |
    +-- Grievances
    |
    +-- Ask Sympho
    |
    +-- Help

---

# 4. Homepage

The homepage should immediately communicate:

Sympho Center

One place to discover and access government services.

Primary actions:

Search for a service
Ask Sympho
Browse services
Track application

Do NOT make the homepage look like a department information portal.

---

# 5. Search

Search is a primary feature.

Support:

- English
- Tamil
- service names
- keywords
- intent
- category
- department

Example:

"I need income proof"

should find:

Income Certificate.

---

# 6. AI Service Discovery

Provide a prominent:

Ask Sympho

Example:

"I need a certificate for college."

AI can ask:

"What type of certificate do you need?"

Then recommend relevant services.

---

# 7. Service Cards

Recommended service card:

Service name
Tamil name
Short description

Eligibility:
Quick indicator

Documents:
Number required

Fee:
Displayed only when verified

Time:
Displayed only when verified

Integration:
Internal / Online / Official portal

Action:

View Service

---

# 8. Service Detail Page

Recommended order:

1. What this service does
2. Who can apply
3. Eligibility
4. Documents
5. Fee
6. Processing time
7. How it works
8. Application steps
9. FAQ
10. Start application

Do not hide important requirements behind multiple pages.

---

# 9. Progressive Disclosure

Don't show every legal or technical detail immediately.

Primary:

What you need to know to apply.

Secondary:

Detailed information.

Advanced:

Legal / policy references.

---

# 10. Forms

Forms should:

- use clear labels
- group related information
- avoid unnecessary fields
- explain errors
- preserve entered data
- support Tamil
- support keyboard navigation
- clearly show mandatory fields

---

# 11. Multi-Step Forms

For complex applications:

Step 1
Applicant

Step 2
Eligibility

Step 3
Documents

Step 4
Review

Step 5
Payment

Step 6
Submit

Show progress:

1 Applicant
2 Eligibility
3 Documents
4 Review
5 Submit

---

# 12. Draft Saving

Complex forms should automatically save drafts.

Display:

"Draft saved"

Allow:

Continue later

The citizen should not lose progress because of navigation or refresh.

---

# 13. Error Messages

Bad:

Invalid input.

Good:

"Enter your 10-digit mobile number."

Bad:

Document error.

Good:

"Upload a PDF, JPG or PNG file smaller than 5 MB."

Errors should appear next to the relevant field.

---

# 14. Confirmation

Before final submission show:

Application Summary

Applicant
Service
Documents
Fee
Declaration

Button:

Submit Application

Avoid accidental submission.

---

# 15. Application Tracking

Tracking should be visual.

Example:

Application Submitted
       ✓

Documents Verified
       ✓

Officer Review
       ●

Approval
       ○

Certificate Issued
       ○

Use plain language.

Avoid exposing internal technical states.

---

# 16. Status Explanation

Never display only:

"Processing"

Instead:

"Your documents have been verified and your application is currently
being reviewed by the responsible officer."

If possible:

Expected completion:
29 August

---

# 17. Delays

If SLA is exceeded:

Status:

Delayed

Message:

"Your application has taken longer than the expected processing period."

Actions:

View details
Raise grievance
Get help

---

# 18. Document Vault UX

Display:

My Documents

Categories:

Identity
Address
Education
Income
Family
Land
Certificates
Other

Actions:

Upload
View
Replace
Use in Application

---

# 19. Reuse Documents

When a form needs a document already available:

Use existing document

instead of:

Upload again

---

# 20. DigiLocker

Show DigiLocker as a document source only if integration is available.

For prototype:

"Connect DigiLocker"

can be represented as a clearly labelled mock/future capability.

Never imply real authentication if it is not implemented.

---

# 21. Notifications

Notification examples:

"Your application has been submitted."

"Your document requires correction."

"Your application has been approved."

"Your certificate is ready."

Notifications should link directly to the relevant application.

---

# 22. Grievance

Make grievance contextual.

Application page:

Need help?

[Raise Grievance]

Automatically associate:

Application ID
Service
Current status

---

# 23. Tamil / English

Provide an obvious language switcher.

Example:

தமிழ் | English

Language preference should persist.

Translated text should not be generated by simply concatenating
English strings.

Use proper i18n translation files.

---

# 24. Typography

Typography should prioritize:

- readability
- clear hierarchy
- large enough body text
- accessible line height
- distinguishable headings

Avoid excessive decorative typography.

---

# 25. Color System

Sympho's primary palette:

Deep Navy:
#071A28

White:
#FFFFFF

AliceBlue:
#F0F8FF

Bright Red:
#FF0000

Recommended supporting colors:

Dark Navy:
#0B2435

Muted Navy:
#163A50

Light Border:
#D9E2E8

Light Surface:
#F5F8FA

Text:
#17212B

Muted Text:
#667085

Success:
#16803C

Warning:
#B54708

Error:
#D92D20

Important:

Do not use every accent color everywhere.

Use color semantically.

---

# 26. Color Usage

Deep Navy:

- primary dark backgrounds
- header/footer
- hero sections
- high-level navigation

White:

- primary text on dark backgrounds
- cards
- page surfaces

AliceBlue:

- subtle backgrounds
- information sections
- selected states
- secondary surfaces

Red:

Use sparingly for:

- critical alerts
- errors
- important emphasis

Do NOT use bright red for every button.

---

# 27. Buttons

Primary button:

Use for the main action.

Examples:

Start Application
Submit
Continue

Secondary:

View Details
Save Draft

Tertiary:

Cancel
Back

Destructive:

Delete
Cancel Application

---

# 28. Navigation

Header should:

- remain usable while scrolling
- clearly show current section
- support mobile navigation
- provide language switch
- provide authentication state

Recommended:

Logo / Sympho
Services
Track
Documents
Help
Ask Sympho
Language
Profile

Avoid too many navigation items.

---

# 29. Sticky Header

Desktop:

Header may contain:

Top utility bar
Brand/header
Primary navigation

Primary navigation should remain accessible while scrolling.

Mobile:

Use a compact sticky header.

Do not allow content to disappear behind the header.

---

# 30. Responsive Design

Breakpoints should support:

- mobile
- tablet
- desktop
- large desktop

Citizen services must work on low-resolution phones.

Avoid desktop-only dashboards for citizen workflows.

---

# 31. Mobile Forms

Forms should use:

- single-column layout
- large touch targets
- clear labels
- sticky action area where appropriate
- minimal typing
- camera/file upload support where possible

---

# 32. Accessibility

Minimum requirements:

- semantic HTML
- keyboard navigation
- focus states
- screen reader labels
- ARIA only where necessary
- alt text
- accessible forms
- accessible dialogs
- accessible menus
- sufficient contrast

---

# 33. Skip Navigation

Provide:

Skip to main content

This should be keyboard accessible.

---

# 34. Text Resize

Support:

A-
A
A+

The UI must remain usable when text is increased.

Do not hard-code heights that cause text clipping.

---

# 35. Loading States

Never show blank pages.

Use:

Skeletons
Loading indicators
Progress indicators

Example:

Loading application...

---

# 36. Error Pages

Create custom:

404
500
Network error
Service unavailable

Example:

"We couldn't load this page."

Actions:

Try again
Go to Home
Contact support

Never expose raw stack traces to citizens.

---

# 37. Empty States

Example:

No applications yet.

Start your first government service application.

[Explore Services]

Avoid empty blank screens.

---

# 38. Trust

Government-service interfaces require high trust.

Display:

- clear service ownership
- official source when relevant
- secure connection indicators
- application ID
- transaction receipt
- status timeline

Do not make unsupported claims such as:

"Official Government of Tamil Nadu portal"

unless the product actually has that authorization.

For a hackathon:

Clearly identify Sympho as a prototype.

---

# 39. External Redirect UX

When leaving Sympho:

Show:

You are leaving Sympho Center.

You will continue on the official service website.

[Continue]
[Cancel]

This avoids unexpected redirects.

---

# 40. AI Assistant UX

Ask Sympho should be available through:

- homepage
- service discovery
- application tracking
- help

The AI should show actionable results.

Example:

AI:

"You may need an Income Certificate."

Actions:

Check Eligibility
View Documents
Start Application

---

# 41. AI Safety

AI should not:

- invent eligibility
- invent fees
- invent legal requirements
- claim application approval
- impersonate government officials
- claim a service is available without verification

If uncertain:

"I couldn't verify this requirement. Please check the official
service information."

---

# 42. UX Principle

Every screen should answer:

Where am I?
What can I do?
What happens next?
How do I go back?
Where can I get help?

---

# 43. Visual Identity

Sympho must have its own identity.

Use:

Deep Navy
AliceBlue
White
controlled accent colors
clean typography
modern cards
subtle borders
clear spacing

Avoid:

- copying government logos
- copying TNeGA logo placement
- copying e-Sevai navigation
- copying government portal screenshots
- copying exact UX4G layouts

---

# 44. Design System Components

Create reusable components:

Button
Input
Select
Checkbox
Radio
Modal
Drawer
Toast
Alert
Card
Badge
Tabs
Breadcrumb
Pagination
Stepper
Timeline
FileUpload
DocumentCard
ServiceCard
ApplicationCard
StatusBadge
EmptyState
ErrorState
LoadingState
LanguageSwitcher
SearchBar
AIChat
NotificationPanel

---

# 45. Service Workflow Components

Reusable:

EligibilityChecker
DocumentChecklist
ApplicationStepper
ReviewSummary
PaymentSummary
ApplicationTimeline
CorrectionPanel
GrievancePanel

---

# 46. Dashboard Components

Citizen dashboard:

- active applications
- recent applications
- documents
- notifications
- recommended services
- grievances

Officer dashboard:

- assigned applications
- pending review
- document verification
- corrections
- SLA alerts

Admin dashboard:

- services
- workflows
- integrations
- users
- audit logs

---

# 47. Design Principle

Do not build every page individually.

Build reusable components and data-driven pages.

Example:

Service data
    |
    v
Reusable Service Detail Page

Workflow data
    |
    v
Reusable Application Workflow

This makes Sympho scalable.

---

# 48. Final UX Objective

The citizen should feel:

"I don't need to understand how the government is organized.
I only need to tell Sympho what I need."

That is the core UX objective of Sympho Center.