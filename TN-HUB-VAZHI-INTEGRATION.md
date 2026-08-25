# TN HUB → VAZHI INTEGRATION DISCOVERY

This document outlines the architectural boundaries and integration requirements for connecting **TN Hub** (the citizen-facing portal) with **VAZHI** (the specialized transport and bus booking engine). 

Both systems are built on SvelteKit + Firebase + Vercel.

---

## 1. TN Hub Architecture Overview
**TN Hub** is a unified service orchestration platform. It operates as the single front door for citizens.
- **Frontend**: SvelteKit, Tailwind CSS
- **Backend/API**: SvelteKit Server Routes (`+server.ts`, `+page.server.ts`)
- **Database**: Firestore (`users`, `applications`, `departments`, `services`, `notifications`)
- **Authentication**: Firebase Authentication (Email/Password, custom claims for roles)
- **Service Integration Modes**: `NATIVE_WORKFLOW`, `API_INTEGRATED`, `EXTERNAL_REDIRECT`

For VAZHI, the integration mode must be **`API_INTEGRATED`** to achieve the requested native "TN Hub → Bus Booking" experience without visual redirects.

---

## 2. TN Hub Customer Identity
TN Hub stores customer identity in Firebase Auth and the Firestore `users` collection.

**Actual Customer Profile Structure (`CitizenProfile`):**
- `id` / `uid`: Immutable Firebase UID (String)
- `email`: Customer email (String)
- `phone`: Customer phone number (String)
- `name` / `displayName`: Full name (String)
- `nameTA`: Localized Tamil name (String)
- `preferredLanguage`: `'en' | 'ta'`
- `role`: `'citizen'`
- *Additional fields:* `dateOfBirth`, `gender`, `address`, `aadhaarLast4`

---

## 3. Data TN Hub Can Send to VAZHI
TN Hub must follow data minimization principles.

| Field | Status | Purpose |
|---|---|---|
| `tnHubUserId` | **REQUIRED** | To map bookings to a persistent citizen identity. |
| `name` | **REQUIRED** | For passenger ticketing. |
| `email` | **REQUIRED** | For booking communication/e-tickets. |
| `phone` | **REQUIRED** | For SMS alerts/driver contact. |
| `preferredLanguage` | **OPTIONAL** | So VAZHI knows which localized strings to favor (if any). |
| `passengerData` | **REQUIRED** | Specific travel details (Age, Gender) required for ticketing. |

**VAZHI DATA TN HUB MUST NEVER RECEIVE / SHARE:**
- `aadhaarLast4`, `annualIncome`, `community`, `rationCardNumber` — VAZHI is a transport app and has no legal reason to access core citizen socioeconomic records.

---

## 4. TN Hub Service Architecture
In TN Hub, VAZHI bus booking will be represented as an **`API_INTEGRATED`** service in the `services` collection.

- **Category:** `transport`
- **Department:** `dept-transport` (Transport Department)
- **Implementation Mode:** `API_INTEGRATED`

This mode tells TN Hub to render a native booking UI but route all actual validation, submission, and state management via secure server-to-server calls to VAZHI, rather than TN Hub's internal workflow engine.

---

## 5. Booking User Journey
The integration conceptual flow inside TN Hub:

1. **Citizen** logs into TN Hub.
2. Navigates to **TN Hub Service Catalog** → Selects "Bus Booking".
3. **TN Hub Booking UI** (Native Svelte components) takes inputs (Source, Dest, Date).
4. **TN Hub Server** makes an authenticated S2S call to **VAZHI API**.
5. **VAZHI** returns bus schedules and seat maps.
6. **Citizen** selects seats and pays via TN Hub Payment Gateway.
7. **TN Hub Server** submits booking confirmation to **VAZHI API**.
8. **VAZHI** issues the ticket and returns the PDF/reference.
9. **TN Hub Server** saves a lightweight reference in TN Hub's `applications` collection and displays the success screen to the citizen.

---

## 6. TN Hub Booking Data (Database Mapping)
TN Hub will NOT duplicate VAZHI's complex seat, trip, and fleet tables.
TN Hub will store the booking as a standard `Application` record so the citizen can track it in their "My Applications" dashboard.

**Lightweight TN Hub Record (`applications` collection):**
- `id`: TN Hub unique record ID
- `applicationNumber`: e.g., `TNH-BUS-8493` (TN Hub Reference)
- `serviceId`: `svc-vazhi-bus-booking`
- `citizenId`: `tnHubUserId`
- `status`: `COMPLETED` (Booked) or `CANCELLED`
- `formData`: *(JSON block storing VAZHI references)*
  - `vazhiBookingId`: UUID (Reference-only)
  - `vazhiTicketId`: String (Reference-only)
  - `tripId`: String
  - `route`: String
  - `journeyDate`: String
  - `seatNumbers`: Array of Strings
  - `amount`: Number

---

## 7. API Requirements from VAZHI
To support the native TN Hub experience, VAZHI must expose a headless API for TN Hub.

| Endpoint | Purpose | Status |
|---|---|---|
| `GET /api/v1/routes` | Fetch available boarding/dropping points | REQUIRED FROM VAZHI |
| `GET /api/v1/trips` | Search buses for a date and route | REQUIRED FROM VAZHI |
| `GET /api/v1/trips/:id/seats` | Live seat availability map | REQUIRED FROM VAZHI |
| `POST /api/v1/booking/hold` | Temporarily hold selected seats | PROPOSED |
| `POST /api/v1/booking/confirm`| Create official booking post-payment | REQUIRED FROM VAZHI |
| `POST /api/v1/booking/:id/cancel`| Cancel a ticket | REQUIRED FROM VAZHI |
| `GET /api/v1/booking/:id/ticket` | Fetch PDF or ticket HTML | REQUIRED FROM VAZHI |

*(All endpoints require Idempotency Keys and Server-to-Server Auth)*

---

## 8. Authentication
**TN Hub Server → VAZHI API**
- Because both use Firebase and Vercel, the best approach is **Secure Service-to-Service JWTs**.
- TN Hub's backend uses a private `VAZHI_API_KEY` or signs a JWT using a private RSA key.
- VAZHI verifies the JWT/Key. 
- *Crucially, these credentials never leave SvelteKit's `+server.ts` layer.*

**Customer Authentication**
- VAZHI does not verify customer passwords. It trusts TN Hub's identity assertion via the `tnHubUserId` in the API payload.

---

## 9. Firebase Boundary
- **TN Hub Firebase:** Single Source of Truth for Citizen Identity, Profiles, general Service History ("My Applications"), and Citizen Notifications.
- **VAZHI Firebase:** Single Source of Truth for Fleet management, Driver assignments, Trip schedules, Seat layouts, and core Transport Operations.
- **Rule:** Do NOT use cross-project Firestore rules. All data exchange happens through the VAZHI REST API.

---

## 10. Email / Ticket Architecture
- **Who sends the email?** TN Hub. 
- **Reason:** The citizen requested the service via TN Hub. Receiving an email from an unknown "VAZHI" domain causes phishing fears and brand fragmentation.
- **Mechanism:** VAZHI returns ticket data (or a PDF link) in the API response. TN Hub's internal notification system formats the "TN Hub Booking Confirmation" email and dispatches it.

---

## 11. Multilingual (i18n) Requirements
Because TN Hub is natively bilingual (Tamil/English), VAZHI API responses must support localization.
- VAZHI should return master data with localized properties.
  - Example: `route: { en: "Chennai - Madurai", ta: "சென்னை - மதுரை" }`
  - Example: `busType: { en: "AC Sleeper", ta: "குளிர்சாதன படுக்கை வசதி" }`
- TN Hub will consume these and inject them into its localized Svelte templates based on the user's `preferredLanguage`.

---

## 12. UI Integration Recommendation
**Recommendation: API-Driven TN Hub-Native UI**
- Do NOT use iframes (bad UX, accessibility issues, cookie issues).
- Do NOT use remote module federation (too fragile in serverless environments).
- **The Solution:** Build the Booking Search and Passenger Data components natively in TN Hub's `src/routes/(citizen)/services/bus-booking/` using the TN Hub Design System. These components simply submit to TN Hub `+page.server.ts` actions, which proxy the requests to VAZHI. 
- This guarantees 100% visual consistency, flawless accessibility, and zero branding clash.

---

## 13. Role Boundaries
- **TN Hub Customer Role (`citizen`)**: Can only search, book, and cancel their own tickets via the TN Hub UI.
- **VAZHI Roles (`driver`, `conductor`, `transport_admin`)**: Manage actual bus operations exclusively within the separate VAZHI administrative application. TN Hub has zero knowledge of these roles.

---

## 14. Security Architecture
- **Idempotency:** TN Hub must generate a UUID `idempotencyKey` for every booking/payment attempt. VAZHI must validate this to prevent double-bookings on network retries.
- **Rate Limiting:** VAZHI must rate-limit TN Hub's IP/API Key to prevent scraping of seat maps.
- **PII Minimization:** Only pass `tnHubUserId`, name, phone, and age/gender. Never pass full profiles.
- **Error Handling:** TN Hub must catch VAZHI 500 errors and return a friendly TN Hub localized error (`"Transport service is temporarily unavailable"`). Never expose raw VAZHI stack traces to the citizen.

---

## 15. Summary of Data Contracts

**TN HUB SENDS TO VAZHI:**
- `tnHubUserId`
- `passengerDetails` (Name, Age, Gender)
- `contactDetails` (Email, Phone)
- `tripId`, `seatIds`, `boardingPointId`, `droppingPointId`
- `idempotencyKey`

**TN HUB EXPECTS FROM VAZHI:**
- Live trip schedules and seat layouts
- `vazhiBookingId` and `vazhiTicketId`
- Localized master data (Tamil/English for routes/bus types)
- Total authoritative Fare calculation

**VAZHI DATA TN HUB MUST NEVER RECEIVE:**
- Complete fleet data
- Driver information
- VAZHI Admin session tokens

**VAZHI QUESTIONS THAT MUST BE CONFIRMED:**
1. Does VAZHI support temporary seat holding (e.g., locking a seat for 10 minutes while TN Hub processes payment)?
2. What is VAZHI's refund/cancellation SLA and API workflow?
3. How will VAZHI notify TN Hub of unexpected trip cancellations (Webhooks)?
