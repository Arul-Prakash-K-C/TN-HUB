# VAZHI to TN Hub integration discovery

**Status:** Discovery and contract proposal only. No API, Firebase, authentication, or application implementation has been changed.

**Evidence base:** The current repository was inspected directly, including `package.json`, SvelteKit routes, Firebase client setup, Cloud Functions, Firestore rules and indexes, services, stores, types, fixtures, seed/reconciliation scripts, payment code, ticket/email code, and tests. In this document, **Current** means code that exists now; **Proposed** means a future integration design and must not be mistaken for an available API.

## 1. Executive summary

VAZHI can supply TN Hub with transport search, availability, booking, ticket, and cancellation capabilities, but it does not currently expose a server-to-server API. It is a static SvelteKit application (`@sveltejs/adapter-static`) whose browser talks to Firebase Auth, Firestore, and 16 Firebase callable Functions. There are no SvelteKit server-route files and no HTTP `onRequest` Functions.

The existing roles are `traveller`, `conductor`, `driver`, and `operations`. TN Hub's citizen/customer role maps to VAZHI's `traveller`. There is no `admin` application role; an `admin: true` custom claim only protects privileged role assignment.

The main integration decisions are:

1. **Identity:** Current booking ownership is `bookings.travellerId == Firebase Auth UID`. A TN Hub customer has no such UID. The recommended future model is a partner-scoped booking identified by `partnerId` and an opaque TN Hub customer reference, accessible only through a VAZHI API.
2. **Payment:** Current booking creation is inseparable from a verified Razorpay Checkout response. TN Hub and VAZHI must decide who collects and settles payment before implementing booking APIs.
3. **Payment binding:** Current `verifyPayment` verifies the Razorpay `order_id|payment_id` signature, but does not prove that the order belongs to the submitted hold, trip, seats, or fare, and does not enforce one-time use of a payment ID. This must be corrected before partner booking is exposed.
4. **Data consistency:** Search reads Firestore, while booking-page service lookup and parts of operations joining still use bundled fixtures. That hybrid works for seeded demo trips but is not a safe integration boundary for newly created trips.
5. **Non-production capabilities:** Refund processing and live tracking are simulated. They must not be represented to TN Hub as real financial or telemetry services.

Recommended boundary:

```text
TN Hub frontend -> TN Hub backend -> VAZHI HTTPS API -> VAZHI Firebase / Razorpay
```

TN Hub must never receive Firebase Admin credentials, service-account JSON, Razorpay secrets, internal crew data, manifests, or operations controls.

## 2. VAZHI architecture

### 2.1 Runtime and deployment

| Area | Current implementation |
| --- | --- |
| Frontend | SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS 4 |
| Rendering | Static adapter with prerendering and `200.html` SPA fallback |
| Hosting | Firebase Hosting and a Vercel configuration targeting `build` |
| Server code | Firebase Functions v2, Node 22, region `asia-south1` |
| Authentication | Firebase Auth email/password; role and duty identifiers in custom claims |
| Database | Cloud Firestore with persistent multi-tab browser cache |
| Storage | `storageBucket` is accepted in config, but Firebase Storage SDK is not used |
| Payments | Razorpay Standard Checkout; current repository/UI identify test mode |
| Email | Firestore Trigger Email extension draining protected `mail` documents |
| QR | Generated in the traveller browser with `qrcode` |
| Tracking | Browser-clock interpolation over route geometry; explicitly simulated |
| Notifications | Device preferences in `localStorage`; no push token or delivery service |

The browser initializes Auth with local persistence, Firestore with persistent multi-tab cache, and callable Functions in `VITE_FIREBASE_FUNCTIONS_REGION` or `asia-south1`.

### 2.2 Current server surface

These are Firebase **callables**, not REST endpoints:

| Function | Authentication/authorization | Purpose |
| --- | --- | --- |
| `searchTrips` | No role check | Sellable trips for one date; no corridor filter |
| `getSeatAvailability` | `traveller` | Currently blocked seat IDs |
| `holdSeats` | `traveller` | Hold 1-6 valid seats for five minutes |
| `createPaymentOrder` | `traveller` | Validate hold, compute fare, create Razorpay order |
| `verifyPayment` | `traveller` | Verify signature and convert a hold into a booking |
| `cancelBooking` | Owning `traveller` | Cancel before departure and record simulated refund |
| `registerTraveller` | Authenticated self | Assign `traveller` claim and Auth display name |
| `verifyDutyIdentity` | `driver`/`conductor` | Compare badge input with Auth claim |
| `createCrewWithAccount` | `operations` | Create Auth account and `crew` document |
| `setUserRole` | Operations/admin restrictions | Write custom role/duty claims |
| `validateTripAssignment` | `operations` | Detect resource/time conflicts |
| `saveTrip` | `operations` | Write a trip through Admin SDK |
| `transitionTrip` | Assigned crew/operations | Advance or cancel shared trip status |
| `getAssignedTrip` | `driver`/`conductor` | Privacy-filtered assigned trip |
| `verifyPnr` | Assigned `conductor` | Verify PNR against trip/manifest |
| `updateBoarding` | Assigned `conductor` | Update manifest entries under a PNR |

Event-driven Functions:

- `expireSeatHolds`: every five minutes; deletes expired held-seat documents.
- `sendTicketEmail`: on `bookings/{pnr}` creation; queues bilingual email in `mail`.

There is no current TN Hub integration and no current HTTP API.

### 2.3 Actual traveller flow

```text
Firebase sign-in
  -> searchTrips callable + public Firestore buses/routes
  -> client-side corridor filtering and joins
  -> bundled service lookup for booking page
  -> generated/bundled deck + getSeatAvailability overlay
  -> in-memory passenger form
  -> holdSeats -> createPaymentOrder -> Razorpay browser modal
  -> verifyPayment
  -> booking + booked seats + manifest transaction
  -> sendTicketEmail -> mail extension
  -> booking/ticket pages read owning booking from Firestore
```

Only passenger `name`, `seatId`, and optional non-`none` concession are sent to the booking Function. Age, gender, and accessibility are collected and validated in the browser but discarded at the payment boundary.

### 2.4 Operational flow

- Operations reads buses, crew, routes, and trips from Firestore. Bus/crew writes use the client SDK under rules; trip writes use callables.
- Driver/conductor assignment queries `trips` using the `dutyId` claim.
- Conductors read only their assigned trip manifest. They can directly update the boarding fields allowed by rules; `verifyPnr` also uses a callable.
- Drivers receive no manifest or booking data.
- Routes are seeded/read; there is no dedicated operations route editor.

## 3. VAZHI source-of-truth map

| Data | Source of truth | Collection/table | Used by |
| --- | --- | --- | --- |
| Users/accounts | Firebase Auth | No Firestore collection | Every role |
| Customers/travellers | Auth account with `role: traveller` | No `customers`/`users` collection | Traveller UI, ownership, email |
| Roles | Auth custom claims | No collection | Functions, rules, route guards |
| Drivers/conductors | Auth sign-in plus roster record | `crew/{dutyId}` | Operations and assigned crew |
| Districts | Firestore, seeded from fixtures | `districts/{id}` | Stop picker |
| Boarding/dropping points | Same stop model | `stops/{id}` | Search and route display |
| Routes | Firestore reads; fixtures remain a client join source | `routes/{id}` | Search, maps, operations |
| Schedules/trips | A dated trip is the schedule | `trips/{tripId}` | All roles |
| Buses | Firestore, seeded from fixtures | `buses/{busId}` | Search, seats, operations |
| Seat geometry | Derived/bundled client data | None | Seat maps |
| Seat occupancy/holds | Firestore; Functions are authoritative writers | `trips/{tripId}/seats/{seatId}` | Availability/booking |
| Bookings | Firestore; only payment verification creates | `bookings/{pnr}` | Owner, verification, email |
| Passenger snapshot | Embedded in booking | `bookings/{pnr}.passengers[]` | Ticket email; not conductor |
| Boarding manifest | Firestore booking projection | `trips/{tripId}/manifest/{pnr}_{seatId}` | Assigned conductor |
| Tickets | Derived from booking | No ticket collection | Ticket UI/email |
| Payments | Razorpay; evidence mirrored in booking | No payment collection | Confirmation/ledger |
| Transactions | Browser projection of bookings | No transaction collection | Account ledger |
| Cancellations | Booking/seat/manifest transaction | Booking and trip subcollections | Traveller/conductor |
| Refunds | Simulated status in booking; derived display | `bookings/{pnr}.refund` | Refund UI/ledger |
| Notifications | Browser-local preferences | `localStorage: vazhi.notifications` | One device |
| Ticket email queue | Trigger Email queue | `mail/{ticket-PNR}` | Server/extension only |
| Live location | Not available; simulated | None | Tracking UI |
| Storage objects | Not used | None | Nobody |

The hybrid lookup matters: Firestore is operational authority, but `buses.service.findService` resolves booking URLs from bundled `busFixtures` or a derived timetable. An operations-created Firestore trip not in those fixtures can appear operationally yet fail the booking-page lookup. A TN Hub API must join Firestore records server-side.

## 4. Required TN Hub to VAZHI data

These are minimum inbound values for a partner-safe implementation. Proposed fields do not exist today.

| TN Hub data | Why needed | Handling |
| --- | --- | --- |
| Partner token | Identify server, issuer, audience, expiry | Verify server-side; never trust a browser directly |
| `requestId` | Cross-system trace | Return it; log without customer data |
| `Idempotency-Key` | Replay-safe mutation | Persist partner + operation + key + request hash + result |
| `tnHubUserId` | Opaque customer ownership | Proposed `externalCustomerRef` |
| TN Hub booking reference | Support/reconciliation | Proposed unique `externalBookingRef` per partner |
| Search criteria | Find eligible services | Stop IDs, service date, passenger count 1-6 |
| Trip/seat selection | Book chosen service | VAZHI `tripId`, `seatIds[]`; fare/status never authoritative input |
| `holdId` | Prove reservation | Generated by VAZHI, returned by TN Hub later |
| Passenger snapshot | Current backend minimum | `{seatId,name,concessionType?}` only |
| Payment evidence | Confirm payment | Depends on agreed model; VAZHI must verify binding/one-time use |
| Cancellation reason | Audit/support | Optional proposed context; cannot control refund value |
| Webhook configuration | Asynchronous delivery | Server-side configuration only |

TN Hub must not submit fare, availability count, trip status, PNR, refund amount, or payment status as facts. VAZHI derives or verifies them.

## 5. Required VAZHI to TN Hub data

| Capability | Current implementation/API | Input/output | Collections | Current auth | Safe via proposed API? |
| --- | --- | --- | --- | --- | --- |
| 1. Bus search | `searchBuses`: `searchTrips` + bus/route reads | Date/criteria -> flattened results after client join | trips, buses, routes | Function public; UI traveller-only | Yes, server join/filter |
| 2. Route search | Stop picker/route records; no API | Local query -> stops/routes | districts, stops, routes | Public reads | Yes |
| 3. Trip search | `searchTrips` | `serviceDate` -> all sellable trips that date | trips | No role check | Yes, add corridor filter/rate limit |
| 4. Trip details | Client-assembled; no single-trip callable | Trip ID -> joined offer | trips, buses, routes | Split public/operations access | Yes, strip internal fields |
| 5. Seat availability | `getSeatAvailability` | `tripId` -> `blockedSeatIds[]` | trips, seats | traveller | Yes, return plan/state only |
| 6. Seat selection | `holdSeats` | trip/seats -> hold and expiry | trips, buses, seats | traveller UID owner | Yes, partner-scoped/idempotent |
| 7. Boarding points | Stops + trip boarding ID | Stop/trip projection | stops, routes, trips | Stops public | Yes |
| 8. Dropping points | Same model + destination ID | Stop/trip projection | stops, routes, trips | Stops public | Yes |
| 9. Fare | Client `calculateFare`; server `fareForTrip` | Trip paise x held seats -> breakdown | trips, seats; Razorpay | traveller for order | Yes, add quote without order |
| 10. Passenger details | Memory form reduced at payment | UI has five fields; backend keeps name/seat/concession | embedded booking | Owner | Yes, minimal fields only |
| 11. Booking creation | Internal `createBookingFromHold` via `verifyPayment` | Payment/hold/passengers -> PNR | trips, buses, routes, seats, manifest, bookings | traveller/owned hold | Yes, after security changes |
| 12. Confirmation | Return from `verifyPayment` | Booking projection | Same | traveller | Yes |
| 13. Ticket generation | Client ticket/file + server email composer | Booking -> UI, text, ICS, HTML email, QR | bookings, mail | Owner/server | Yes, payload/QR content |
| 14. Booking status | `getBooking` direct Firestore | PNR -> booking | bookings | owner UID rule | Yes, partner ownership |
| 15. Ticket retrieval | Ticket route calls `getBooking` | PNR -> rendered ticket | bookings | owner | Yes |
| 16. Cancellation | `cancelBooking` | PNR -> refund ID and transaction | booking/trip/seats/manifest | owner; before departure | Yes, idempotent |
| 17. Refund | `estimateRefund`, `getRefund`; no provider refund | Booking total -> 20% fee/synthetic timeline | booking.refund | owner | Estimate only until real |
| 18. Payment status | `paid` + Razorpay IDs on booking | Successful booking -> paid evidence | bookings, Razorpay | owner | Yes after binding/replay fix |
| 19. Booking history | `listTrips` | UID -> bookings ordered by creation | bookings | owner UID | Yes, partner/customer query |
| 20. Notifications | Local settings only | Device toggles only | none | browser | No current service; webhooks instead |
| 21. Email/delivery | `sendTicketEmail` -> `mail` extension | Auth email + booking -> email | Auth, bookings, mail | server | TN Hub should deliver partner mail |

## 6. Actual database schemas

Legend: **R** required; **O** optional; **G** generated; **D** derived/denormalized.

### 6.1 Firebase Auth user

No Firestore user document exists.

| Field/claim | Class | Notes |
| --- | --- | --- |
| `uid` | G/R | Current traveller booking owner |
| `email` | O | Normal registration uses email; crew/operations use synthetic email |
| `displayName` | O | Traveller name or roster label |
| `role` claim | R after provisioning | traveller/conductor/driver/operations |
| `dutyId` claim | R crew | `DRV-###` or `CON-###` |
| `badgeId` claim | R crew | `TN-DVR-####` second credential |
| `admin` claim | O | Privileged role assignment, not app role |

Phone Authentication is not used. A phone-shaped identifier can map to a synthetic `@phone.vazhi.app` email, but normal registration collects email.

### 6.2 District, stop, route

- `districts/{id}`: `id` **R**, `name` **R**, `nameTa` **R**, `updatedAt` **O/G**.
- `stops/{id}`: `id`, `name`, `nameTa`, `districtId`, `kind`, `coordinates`, `accessibleBoarding` **R**; `updatedAt` **O/G**. `kind` is `bus_stand|bypass|terminal|waypoint`; coordinates are `[longitude, latitude]`.
- `routes/{id}`: `id`, `name`, `nameTa`, `stops[]`, `distanceKm` **R**; `geometryId`, `updatedAt` **O**. A route stop has `stopId`, `name`, `nameTa`, `role` (`origin|intermediate|destination`), `coordinates`.

There is no separate boarding-point/dropping-point entity. Intermediate route stops exist, but a trip currently has one boarding and one destination stop.

### 6.3 `buses/{id}`

`id`, `registrationNumber`, `operator`, `serviceType`, `cabinClass`, `seatLayout`, `totalSeats`, `amenities`, `accessibleBoardingPoint` **R**; `status`, `updatedAt` **O**. Cabin class is `ultra_deluxe|deluxe|sleeper|express`; layout is `2+2|2+1`; status is `active|maintenance|retired`. Amenities contain `airConditioned`, `seatLayout`, `chargingPoints`, `restStop`.

### 6.4 `crew/{dutyId}`

`id`, `role`, `name`, `depot`, `status`, `aliases[]` **R**; `retired`, `updatedAt` **O**. Role is `driver|conductor`; status is `available|assigned|on-trip|off-duty`. No phone, address, licence, or government ID exists.

### 6.5 `trips/{tripId}`

| Field | Class | Notes |
| --- | --- | --- |
| `id`, `code` | R | Document ID/human reference |
| `routeId`, `busId`, `driverId`, `conductorId` | R | Central join |
| `serviceName` | R | Public label |
| `serviceDate` | R | `YYYY-MM-DD` |
| `departureTime`, `arrivalTime` | R | `HH:mm`; may cross midnight |
| `boardingStopId`, `destinationStopId` | R | Termini |
| `platform` | O | Origin platform |
| `status` | R | Client type: scheduled/boarding/departed/in-transit/completed/cancelled; Functions also handle draft/published |
| `baseFare`, `taxes` | R | Per passenger, integer paise |
| `seatsAvailable` | R/D | Mutated on booking/cancel |
| `distanceKm` | O | Falls back to route distance |
| `sellable`, `canonical` | R | Visibility/demo marker |
| `highlights[]` | R | fast/recommended |
| `updatedAt` | O/G | Server timestamp on managed writes |

`durationMinutes` is not part of the typed Trip or normal seed. Client offers derive it. Booking creation reads a possible field and otherwise writes `0`; booking reads repair non-positive duration from times. A partner API should derive it server-side.

### 6.6 `trips/{tripId}/seats/{seatId}`

This stores occupancy, not geometry.

- Held: `state: held`, `holdId`, `ownerId`, `expiresAt`, `updatedAt`.
- Booked: `state: booked`, `bookingId`, `ownerId`, `updatedAt`.

Seat geometry is derived as `Seat {id,row,column,availability,signals,berth?}` inside a `SeatDeck {busId,kind,layout,rows,leftColumns,rightColumns,seats}` and is not persisted.

### 6.7 `bookings/{pnr}`

- Identity/reference: `id` **G**, `pnr` **G**, `travellerId` **R**, `tripId`/`busId` **R**.
- Status: `status` **R** (`confirmed|completed|cancelled`).
- Journey snapshot **D/R**: `serviceName`, `vehicleNumber`, origin/destination IDs and names, `departure`, `arrival`, `durationMinutes`, `distanceKm`, `boardingPlatform`, `travelDate`.
- Seats: `seatIds[]`, `passengerCount` **R**.
- Fare **D/R**: `passengerCount`, per-passenger base/taxes, aggregate base/taxes, `concessionDiscount`, `concessionRequested`, `total`; integer paise.
- Payment: `paymentMethod` **D/R**, `paymentStatus: paid` **G**, `razorpayOrderId`, `razorpayPaymentId` **G**.
- Passenger snapshot: `passengers[]` **R**, each `{bookingId,seatId,name,concessionType?}`.
- Time: `createdAt` Firestore Timestamp **G**, `bookedAt` ISO string **G**, `updatedAt` **O/G**.
- Cancellation/refund: `refund` **O**, currently `{status: simulated_pending, requestedAt}`.

The public TypeScript `Booking` interface omits `id`, `travellerId`, `passengers`, and `createdAt`, although the Function writes them. Comments claiming confirmed bookings cannot carry passenger identity are stale; the database writer is authoritative here.

### 6.8 `trips/{tripId}/manifest/{pnr}_{seatId}`

`bookingId`, `pnr`, `seatId`, `ticketStatus` (`valid|cancelled`), `boardingStatus` (`pending|boarded`), `boarded` **R**; `createdAt`, `boardedAt`, `updatedAt` **O/G**. It deliberately has no passenger name/contact.

### 6.9 Non-document models

| Model | Actual persistence |
| --- | --- |
| Ticket | None; derived from booking; ticket ID effectively PNR |
| Payment | None; Razorpay external, evidence embedded in booking |
| Cancellation | No record; transactional status/seat/manifest/count changes |
| Refund | No collection/provider call; simulated booking field + derived 20% fee |
| Notification | No backend model; browser settings only |
| Email queue | `mail/{ticket-PNR}` with `to[]` and `message.{subject,text,html}`; extension adds delivery data |

## 7. Customer identity mapping

### Current

- Traveller sign-in uses Firebase Auth email/password.
- `sessionFromUser` exposes UID as traveller session ID, despite an outdated type comment suggesting email.
- Email/display name remain in Firebase Auth; no profile/customer document or phone is stored.
- Booking ownership and Firestore read access both depend on matching Auth UID.

### Proposed

```text
TN Hub user -> opaque tnHubUserId
            -> partnerId + externalCustomerRef
            -> VAZHI-generated PNR
```

Proposed booking fields:

```ts
channel: 'vazhi' | 'tnhub';
partnerId: 'tn-hub';
externalCustomerRef: string;
externalBookingRef: string;
travellerId?: string; // required for native VAZHI bookings only
```

This avoids Firebase shadow users, duplicated emails, and lifecycle synchronization. Partner bookings must be accessible only through partner APIs, not by weakening traveller rules. Creating a Firebase user per TN Hub customer would reuse current paths but is not recommended.

## 8. Authentication recommendation

| Option | Assessment |
| --- | --- |
| Firebase ID token | Requires VAZHI Auth user per TN Hub customer |
| Firebase custom token | Same provisioning/impersonation problem |
| Service-account JSON | Prohibited; broad Admin access and severe leakage risk |
| Static API key | Replayable and weakly scoped/rotated |
| Signed partner JWT | Recommended baseline: short-lived, scoped, rotatable |
| Cloud-provider OIDC | Preferred if both environments reliably support it |

TN Hub backend should sign a short-lived asymmetric JWT. VAZHI verifies issuer, audience, expiry/not-before, key ID, and partner against JWKS/pinned public key. Claims identify the partner service, not the citizen. Partner/customer ownership is then checked on each resource. Keys and webhook secrets stay server-side in Firebase Secret Manager.

## 9. Correlation IDs

| ID | Generator | Use |
| --- | --- | --- |
| `requestId` | TN Hub per HTTP request | Trace/logging; echoed in response |
| `Idempotency-Key` | TN Hub per logical mutation | Replay-safe hold/order/booking/cancel |
| `partnerId` | VAZHI config | Tenant/security partition |
| `tnHubUserId` | TN Hub | Opaque customer reference |
| `tnHubBookingId` | TN Hub | Partner support/order reference |
| `tripId` | VAZHI | Scheduled service document |
| `holdId` | VAZHI | Random 16-byte hex; five-minute life currently |
| `pnr`/`vazhiBookingId` | VAZHI | Booking document/customer reference (`VZ-` + 10 hex for new bookings) |
| `vazhiTicketId` | VAZHI | No separate current ID; use PNR unless a ticket entity is added |
| Razorpay IDs | Razorpay | Payment reconciliation/replay prevention |
| `eventId` | VAZHI | Proposed webhook deduplication |

PNR remains VAZHI-generated. The TN Hub reference is correlation data, not the document ID.

## 10. Proposed API contract

**None of these endpoints exists today.** Implement them as versioned HTTPS handlers. Common requirements:

- `Authorization: Bearer <partner JWT>` and required `X-Request-Id`.
- `Idempotency-Key` on mutating POSTs; store request hash and result. Different payload with reused key returns `409`.
- Integer paise/`INR`; ISO dates/timestamps.
- Error envelope: `{ "error": { "code": "...", "message": "...", "retryable": false }, "requestId": "..." }`.
- Common statuses: 400 invalid, 401 token, 403 scope, 404 missing/tenant-hidden, 409 conflict, 410 expired hold, 422 validation, 429 rate limit, 502 provider, 500 internal.

### `GET /api/v1/transport/stops`

- **Purpose:** Locations/district grouping.
- **Auth:** Partner JWT, read scope.
- **Request:** Optional `districtId`, text `query`.
- **Response:** Narrow district/stop projections.
- **Database:** Read `districts`, `stops`; no writes.
- **Errors:** 400 invalid filter.
- **Idempotency:** Natural; short caching allowed.

### `GET /api/v1/transport/trips`

- **Purpose:** Sellable corridor search.
- **Auth:** Partner JWT, search scope.
- **Request:** `serviceDate`, `originStopId`, `destinationStopId`, `passengers` 1-6.
- **Response:** Public joined trip/bus/route projection including derived duration/distance, fare, platform, amenities, layout/capacity and availability; no crew IDs.
- **Database:** Query `trips` by date/endpoints/sellability; read buses/routes.
- **Errors:** 400 validation; empty list is 200.
- **Idempotency:** Natural; availability is a snapshot.

### `GET /api/v1/transport/trips/{tripId}`

- **Purpose:** One joined public trip.
- **Auth:** Partner read scope.
- **Request:** VAZHI `tripId` path parameter.
- **Response:** Search projection plus route stop order.
- **Database:** Read trip, bus, route.
- **Errors:** 404; 409 if known but closed.
- **Idempotency:** Natural.

### `GET /api/v1/transport/trips/{tripId}/seats`

- **Purpose:** Full seat/berth plan and current availability.
- **Auth:** Partner availability scope.
- **Request:** VAZHI `tripId` path parameter.
- **Response:** Plan version, geometry/signals, `available|blocked`; never owner/hold/booking IDs for others.
- **Database:** Read trip, bus, non-expired seat occupancy; generate canonical plan server-side.
- **Errors:** 404, 409 not bookable.
- **Idempotency:** Natural; avoid long caching.

### `POST /api/v1/transport/holds`

- **Purpose:** Atomically reserve seats.
- **Auth:** Partner book scope and external customer reference.
- **Request:** `tripId`, unique `seatIds[]` (1-6), `externalCustomerRef`.
- **Response:** `holdId`, trip/seats, `expiresAt`.
- **Database:** Transaction reads trip/bus/seats; writes partner-scoped held seats and idempotency result.
- **Errors:** 404, 409 unavailable/not bookable, 422 invalid seat.
- **Idempotency:** Required; same payload/key returns original hold state.

### `POST /api/v1/transport/fare-quotes`

- **Purpose:** Authoritative fare without opening gateway order.
- **Auth:** Partner book scope.
- **Request:** `tripId`, `holdId`, `seatIds[]`.
- **Response:** Current fare breakdown, currency, `quoteExpiresAt` no later than hold expiry.
- **Database:** Read trip and validate owned hold; optional cache only.
- **Errors:** 404, 410 expired, 409 mismatch, 422 no payable fare.
- **Idempotency:** Natural during the hold; always derive fare from VAZHI.

### `POST /api/v1/transport/payment-orders`

- **Purpose:** Open VAZHI-owned Razorpay order if that model is selected.
- **Auth:** Partner payment scope.
- **Request:** Trip/hold/seats, external customer/booking references.
- **Response:** Publishable key ID, order ID, amount/currency, hold expiry; never secret.
- **Database/provider:** Validate hold/fare, create Razorpay order, proposed payment-intent record binding partner/customer/hold/trip/seats/amount/order/idempotency.
- **Errors:** 410, 409 mismatch, 422 no fare, 502 provider.
- **Idempotency:** Required; retry returns the same order.

If TN Hub collects payment, replace this with a settlement-authorized design; never accept `paid: true` from a client.

### `POST /api/v1/transport/bookings`

- **Purpose:** Convert verified payment and valid hold into one booking/PNR.
- **Auth:** Partner book scope.
- **Request:** Hold/trip/seats, external customer/booking references, passengers `{seatId,name,concessionType?}[]`, agreed payment evidence.
- **Response:** Partner-safe booking, PNR/status/fare/payment state and ticket reference.
- **Database/provider:** Verify payment intent/order amount, currency, receipt, signature and unused payment; transaction creates booking, marks seats, creates manifest, decrements count, completes intent/idempotency.
- **Errors:** 409 duplicate external booking/payment used, 410 hold expired, 422 passenger/payment mismatch, 502 provider.
- **Idempotency:** Mandatory; same booking returns original PNR. Also enforce unique `(partnerId, externalBookingRef)` and payment use.

### `GET /api/v1/transport/bookings/{pnr}`

- **Purpose:** Partner booking/status retrieval.
- **Auth:** Partner booking-read scope.
- **Request:** VAZHI PNR path parameter; optional `externalBookingRef` consistency check.
- **Response:** Partner-safe booking only when `partnerId` matches; omit UID and unnecessary gateway fields.
- **Database:** Read booking and verify partner ownership.
- **Errors:** 404 for missing or other tenant.
- **Idempotency:** Natural.

### `GET /api/v1/transport/bookings`

- **Purpose:** Customer booking history.
- **Auth:** Partner booking-read scope.
- **Request:** Required `externalCustomerRef`, cursor/limit, optional status/date.
- **Response:** Partner-owned summaries and cursor.
- **Database:** Query by partner + external customer + creation time; new index.
- **Errors:** 400 filters/cursor.
- **Idempotency:** Natural.

### `POST /api/v1/transport/bookings/{pnr}/cancel`

- **Purpose:** Cancel partner booking before departure.
- **Auth:** Partner cancel scope and ownership.
- **Request:** Optional reason/external reference.
- **Response:** Status, released seats, timestamp and clearly labelled refund estimate/status.
- **Database:** Transaction updates booking, deletes seats, flags manifest, increments trip count; later real refund requires provider state machine.
- **Errors:** 404, 409 already cancelled/departed, 422 not cancellable.
- **Idempotency:** Required; repeat returns original result.

### `GET /api/v1/transport/tickets/{pnr}`

- **Purpose:** Stable render-neutral ticket payload.
- **Auth:** Partner ticket scope and ownership.
- **Request:** VAZHI PNR path parameter.
- **Response:** Journey/platform/seats, contractually required passenger names, fare/payment status, PNR and `qrContent` for VAZHI verification. No PDF exists currently.
- **Database:** Read partner booking; no ticket write.
- **Errors:** 404; optionally 409 cancelled.
- **Idempotency:** Natural.

## 11. Webhooks and events

| Event | Recommendation | Reason |
| --- | --- | --- |
| `booking.confirmed` | Optional | Response already confirms; useful after lost response |
| `payment.completed` | Usually omit | Current payment and booking are one flow; useful only if asynchronous later |
| `booking.cancelled` | Yes | May originate outside TN Hub later |
| `refund.processed` | Not yet | Current refund is simulated |
| `trip.cancelled` | Required | Operations can cancel trips with partner bookings |
| `trip.rescheduled` | Required once edit events exist | TN Hub must update/notify |

Proposed envelope:

```json
{
  "eventId": "evt_...",
  "type": "trip.cancelled",
  "occurredAt": "2026-08-25T12:00:00Z",
  "partnerId": "tn-hub",
  "data": { "tripId": "...", "affectedBookings": [{ "pnr": "...", "externalBookingRef": "..." }] }
}
```

Sign the raw body, include timestamp/key ID, retry with backoff, and require deduplication by `eventId`. Never include passenger details, crew IDs, or manifests.

## 12. Ticket and email architecture

Current sequence:

1. `verifyPayment` creates the booking.
2. `sendTicketEmail` resolves `travellerId` through Auth and reads email.
3. It composes bilingual HTML/text containing journey, seats, passenger names and fare.
4. It creates `mail/ticket-{pnr}`. `create` prevents an at-least-once trigger from overwriting extension delivery state and resending.
5. The extension delivers the email.
6. Web ticket is booking-derived. Browser QR encodes absolute `/conductor/verify?pnr=...`; scanning opens verification but does not board automatically.
7. Downloads are client-created `.txt` and `.ics`; no PDF exists.

Recommendation: VAZHI owns authoritative ticket data/QR content because VAZHI conductors verify the PNR. TN Hub sends customer-facing communication for TN Hub bookings because VAZHI has no Auth email for partner customers. The trigger should later skip `channel: tnhub`; TN Hub calls the ticket endpoint and renders/sends it.

## 13. Security boundaries

TN Hub may access public stops/routes, sellable public trip/bus/fare/amenity projections, anonymous seat availability, its own holds/bookings/tickets/cancellations, and trip change events affecting its bookings.

TN Hub must not access:

- Firebase Admin keys, service-account JSON, refresh tokens, or Razorpay secret.
- Direct Firestore or unrestricted Firebase authorization.
- Crew records, names, duty/badge IDs, depot states, or assignments.
- Manifests/boarding operations or driver/conductor/private operational data.
- Operations Functions (`setUserRole`, `createCrewWithAccount`, `saveTrip`, `transitionTrip`, `validateTripAssignment`).
- Native/other-partner bookings, seat owner/hold/booking IDs, or unnecessary gateway IDs.
- `mail` documents or maintenance/retired fleet details not needed for sale.

Before integration: strict schemas/size limits, rate limits, scopes, PII-safe audit logs, secret rotation, replay windows, idempotency, timeouts and tenant-hidden errors are required.

## 14. Firebase boundaries

TN Hub should communicate only through VAZHI APIs.

Current rules depend on end-user claims: traveller UID ownership, operations role, and assigned conductor `dutyId`. Trip/seat/booking direct writes are denied; mail is denied to all clients. A TN Hub server has no compatible end-user identity. A service account would bypass all rules, while loosening rules would weaken the native app. The API should use Admin SDK internally and enforce partner ownership itself. Firestore rules remain the native-client boundary.

## 15. Reusable UI components

| Component/location | Purpose/dependencies | Firebase/server dependency | Recommendation |
| --- | --- | --- | --- |
| `booking/SeatMap.svelte` | Seater plan; Svelte, coach components, Paraglide, seat service | Prepared deck only | Reusable only in compatible Svelte stack; share logic first |
| `booking/SleeperMap.svelte` | Berth plan; Svelte, Paraglide, deck/seat services | Prepared deck only | Same |
| `booking/SeatButton.svelte`, `BerthButton.svelte` | Selection controls; VAZHI tokens/icons | None | Design-system coupled |
| `booking/PassengerForm.svelte` | Passenger form; global store/Paraglide/primitives | No direct Firebase | Do not share unchanged; fields differ from backend persistence |
| `booking/FareSummary.svelte` | Paise fare display; locale/format/tokens | None | Portable after dependency extraction |
| `booking/TicketCodePanel.svelte` | QR/PNR; `qrcode`, browser origin | Hardcodes VAZHI verification pattern | Share contract/utility, not default component |
| `transit/BusResultCard.svelte` | Service result; messages/format/bookability | None direct | Share data shape, not necessarily component |
| `transit/SearchFilters.svelte` | Time/price/AC/access/type filters | Pure client logic | Filter logic can be shared |
| `journey/LocationSelect.svelte` | Bilingual grouped stop picker | Data supplied externally | Adaptable after design/i18n extraction |
| `journey/JourneySearchForm.svelte` | Search/nav; SvelteKit, stores/session/guards | Auth/navigation coupled | Not reusable unchanged |
| `transit/TransitMap.svelte` | MapLibre/MapTiler map; theme/preferences | No Firebase direct | Share GeoJSON contract instead |
| `conductor/*`, `driver/*`, `operations/*` | Internal operational UI | Role/Firestore coupled | Never expose/share with TN Hub |

Do not create a shared package yet. Prefer API/data contracts. If both products use compatible Svelte stacks, first extract framework-free fare, ticket-reference, seat-plan, formatting, and ledger logic with conformance tests.

## 16. Environment variables required

Current client variables:

- `VITE_MAPTILER_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET` (configured; Storage unused)
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_FUNCTIONS_REGION` (optional, defaults `asia-south1`)
- `VITE_RAZORPAY_KEY_ID` (publishable)

The Firebase client also reads optional `VITE_FIREBASE_MESSAGING_SENDER_ID`, but it is absent from `.env.example`, not required by the configured check, and no Messaging code exists.

Current server secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.

Proposed integration configuration: `TNHUB_PARTNER_ID`, `TNHUB_JWKS_URL` or `TNHUB_JWT_PUBLIC_KEY`, `TNHUB_JWT_ISSUER`, `TNHUB_JWT_AUDIENCE`, `TNHUB_WEBHOOK_URL`, and webhook signing secret/private key. Secrets belong in Firebase Secret Manager, never `VITE_*`.

## 17. Risks

1. No server-to-server API exists; this is a new security boundary.
2. Payment ownership/settlement is undecided and blocks booking semantics.
3. Current payment verification is not bound to hold/trip/seats/amount/currency/receipt and has no one-time payment constraint.
4. No durable mutation idempotency exists; a lost response cannot return the original outcome safely.
5. Refunds and tracking are simulated.
6. Search is date-only server-side and corridor-filtered in the browser, increasing reads/exposure.
7. `searchTrips` has no role check, rate limit, or App Check enforcement.
8. Seat availability falls back to a local deck if the callable fails, potentially showing stale state; partner API should fail closed or label staleness.
9. Search uses Firestore while booking service lookup uses fixtures; operations-created trips may not be bookable.
10. Operations joins also retain fixture/store dependencies.
11. Age, gender, and accessibility are collected but discarded; only name/seat/concession survive.
12. Booking TypeScript comments/types omit persisted passenger names and ownership fields.
13. Trip status type and Function lifecycle differ (`draft`/`published`).
14. `seatsAvailable` can drift from seat documents after out-of-band edits; reconciliation is not automatic proof.
15. Trip cancellation sends no customer/partner event.
16. Five-minute holds may be short for a partner checkout; scheduled cleanup may lag although transactions reject expiry.
17. Email depends on Firebase Auth email and cannot work unchanged for partner identity.
18. Persistent browser cache creates an extra privacy surface on shared devices; native sign-out attempts to clear it.
19. Cloud region/data residency, retention, SLA, and volume require operational confirmation; repository code does not fully specify them.

## 18. Migration considerations

- Preserve native bookings: proposed partner fields stay optional; missing `channel` means native.
- Keep `travellerId` required for native creation/rules; partner creation is server-only.
- Do not backfill invented TN Hub ownership onto historical native bookings.
- Add server-side document validators/mappers rather than arbitrary casts.
- Use Firestore-only partner trip/bus/route joins; do not reuse fixture lookup.
- Resolve status enum drift and derive duration server-side.
- Version seat-plan generation so both systems keep identical seat IDs.
- Add partner/customer/external-reference indexes and uniqueness records.
- Add payment-intent binding and one-time payment constraints before partner bookings.
- Decide merchant-of-record/settlement/refund model.
- Replace simulated refund with a real financial state machine before advertising it.
- Define retention/deletion for external references, names, idempotency and webhook attempts.
- Keep native ticket email; deliberately skip partner bookings and let TN Hub deliver.
- Roll out reads, then sandbox holds/payment, then limited bookings with reconciliation.

## 19. Exact files that would need modification later

Future change map only.

Existing files likely modified:

- `functions/src/index.ts` — export/mount HTTP API and extract authoritative hold/booking logic.
- `functions/src/razorpay.ts` — validate order/payment amount, currency, receipt/notes, status and binding.
- `functions/src/ticket-email.ts` — retain native composition and support explicit partner skip/projection.
- `src/lib/types/booking.ts` — reflect actual persisted fields and proposed partner ownership.
- `src/lib/types/fleet.ts` — align lifecycle status.
- `src/lib/types/transit.ts` — stable wire/seat-plan projections if shared internally.
- `firestore.rules` — deny client access to new partner/idempotency/payment/webhook records while retaining native ownership.
- `firestore.indexes.json` — partner/customer/history/external reference queries.
- `firebase.json` — only if routing/deployment configuration requires it.
- `.env.example`, `FIREBASE.md`, `README.md` — non-secret config/deployment/runbooks.

Proposed new files:

- `functions/src/api/router.ts`
- `functions/src/api/auth.ts`
- `functions/src/api/errors.ts`
- `functions/src/api/validation.ts`
- `functions/src/api/idempotency.ts`
- `functions/src/api/projections.ts`
- `functions/src/api/trips.ts`
- `functions/src/api/holds.ts`
- `functions/src/api/payments.ts`
- `functions/src/api/bookings.ts`
- `functions/src/api/tickets.ts`
- `functions/src/api/webhooks.ts`
- `functions/src/api/types.ts`
- `tests/tnhub-api.test.ts`
- `tests/tnhub-booking-idempotency.test.ts`
- `tests/tnhub-webhooks.test.ts`

No traveller, driver, conductor, or operations component needs to change merely to expose a server API.

## 20. Recommended implementation order

1. Decide merchant-of-record, checkout, settlement, cancellation, and real refund responsibilities.
2. Approve partner-scoped identity/ownership and retention policy.
3. Version wire schemas/errors and align current stored/types data.
4. Implement partner JWT/scopes, request IDs, rate limits and audit policy.
5. Implement idempotency and unique external booking/payment constraints.
6. Bind payments to partner, hold, trip, seats, amount, currency, receipt and one-time use.
7. Build read-only stops/search/trip/seats with Firestore-only joins.
8. Build partner holds and fare quotes.
9. Build sandbox payment order/booking; test lost responses/replays.
10. Build booking history/retrieval and ticket payload; skip partner native email.
11. Build cancellation; do not expose processed refunds until real.
12. Build transactional/outbox webhooks for trip changes and necessary booking events.
13. Add emulator/contract/load/security tests, reconciliation, alerts and key-rotation runbooks.
14. Pilot reads, then test bookings, then limited production traffic with daily reconciliation.

## TN HUB NEEDS FROM VAZHI

- A versioned partner-authenticated HTTP API; callables are not that boundary.
- Server-filtered stop/corridor/trip search and Firestore-joined trip details.
- Versioned seat plan, authoritative availability, and holds.
- Server fare quotes and an agreed payment/settlement contract.
- Replay-safe booking creation with VAZHI-generated PNR.
- Partner-scoped history, status, cancellation, ticket payload, and QR content.
- Trip cancellation/reschedule webhooks.
- Honest disclosure that tracking and refunds are currently simulated.

## VAZHI NEEDS FROM TN HUB

- Stable partner identity, JWT issuer/JWKS (or workload identity), scopes and rotation process.
- Opaque `tnHubUserId`, booking reference, request ID, and mutation idempotency key.
- Search criteria, VAZHI trip/seat/hold IDs, and only accepted passenger fields.
- Decision on payment collection, merchant-of-record, settlement, disputes, cancellation and refunds.
- Signed webhook endpoint with deduplication/retry semantics.
- TN Hub ownership of customer email/notifications unless another PII agreement is approved.
- Expected volume/SLA, retention/deletion needs, support contacts and reconciliation procedures.
- Agreement that crew, manifests, operations controls, Firebase credentials and other customers' data remain excluded.
