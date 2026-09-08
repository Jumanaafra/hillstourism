# Hills Tourism — Production SDD Specification

**Document:** `spec.md`  
**Version:** 1.0  
**Status:** Implementation Specification  
**Purpose:** This file is the single source of truth for implementing the Hills Tourism website and its backend functionality.

---

## 0. Implementation Directive

Build the Hills Tourism application strictly from this specification.

### Existing UI/UX is already implemented

The existing Hills Tourism UI/UX code is the visual source of truth.

**DO NOT redesign the UI.**

The implementation agent MUST:

- inspect the existing project before creating new UI;
- preserve the existing layout, styling, components, responsive behaviour, typography, spacing, animations, visual hierarchy and interaction patterns wherever they already exist;
- reuse existing pages/components/forms/modals/cards/navigation/footer/chatbot shells where available;
- connect the existing UI to the new backend, database and integrations;
- add only the minimum UI required for functionality that does not already have a corresponding interface;
- never replace an existing working UI with a newly invented design;
- never import branding, UI or UX from another tourism website;
- treat the current Hills Tourism codebase as the visual source of truth.

The objective is:

> **Existing Hills UI + production-grade functionality defined by this SDD.**

---

# 1. Product Definition

Hills Tourism is an enquiry-led tourism website.

The platform allows customers to:

1. discover tour packages;
2. view package details;
3. browse/select hotels;
4. browse/select vehicles;
5. submit an enquiry;
6. receive confirmation by email;
7. have enquiry data stored in Firestore;
8. have enquiry data synchronized to Google Sheets;
9. ask questions through a Gemini-powered company-aware chatbot.

The platform does **not** provide transactional booking or online payment.

---

# 2. Explicit Scope

## 2.1 In Scope

- Public tourism website
- Tour packages
- Categories
- Destinations
- Hotels
- Vehicles
- Hotel selection
- Vehicle selection
- Customer enquiry
- Email notifications
- Google Sheets integration
- Admin dashboard
- Admin authentication
- Role-ready authorization
- Gemini chatbot
- Company knowledge retrieval
- SEO
- Sitemap
- Robots
- Structured data
- ISR/cache
- Analytics
- Production deployment
- Monitoring
- Security
- Validation
- Rate limiting
- Anti-spam protection
- Error handling
- Testing

## 2.2 Out of Scope

The following MUST NOT be implemented unless explicitly added to a future specification:

- online booking confirmation;
- payment gateway;
- credit/debit card processing;
- UPI payment;
- payment webhooks;
- booking payment status;
- refund processing;
- online reservation ledger;
- hotel room availability calendar;
- vehicle availability calendar;
- customer accounts;
- customer login;
- separate chatbot server;
- separate AI backend;
- unnecessary microservices.

---

# 3. Architecture

```text
                         INTERNET
                            |
                    DNS / HTTPS / TLS
                            |
                            v
                    VERCEL EDGE / CDN
                            |
                            v
                     NEXT.JS APP
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
      PUBLIC WEB        ADMIN CMS          API LAYER
          |                 |                  |
          +-----------------+------------------+
                            |
          +-----------------+-------------------+
          |                 |                   |
          v                 v                   v
      FIRESTORE        EMAIL SERVICE       GOOGLE SHEETS
          |
          |
          +------------------------+
                                   |
                                   v
                              CHAT SERVICE
                                   |
                                   v
                              GEMINI API
                                   |
                                   v
                         COMPANY KNOWLEDGE
```

---

# 4. Technology Contract

Use the existing project technology where already established.

Recommended baseline:

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | Existing Hills Tourism UI |
| Database | Firebase Firestore |
| Authentication | Firebase Authentication |
| Server access | Firebase Admin SDK |
| Backend | Next.js Route Handlers / Server Actions |
| Email | Transactional email provider |
| Spreadsheet | Google Sheets API |
| AI | Gemini API |
| Cache | Next.js cache / ISR |
| Hosting | Vercel |
| Source control | Git |
| Validation | Zod or equivalent |
| Testing | Unit + integration + E2E |

Do not introduce another framework or backend server without a documented architectural reason.

---

# 5. System Layers

## 5.1 Presentation Layer

Responsible for:

- rendering existing UI;
- fetching public content;
- form interactions;
- hotel selection;
- vehicle selection;
- chatbot interaction;
- responsive behaviour.

The presentation layer MUST NOT contain:

- Gemini API keys;
- Google service account credentials;
- email provider secrets;
- Firebase Admin credentials;
- authorization decisions.

---

## 5.2 Application/API Layer

Responsible for:

- request validation;
- authentication;
- authorization;
- business rules;
- database operations;
- enquiry creation;
- email triggering;
- Google Sheets synchronization;
- Gemini requests;
- cache invalidation.

---

## 5.3 Data Layer

Firestore is the primary system of record.

Google Sheets is only an operational/reporting destination.

---

# 6. Project Structure

Use this logical structure. Adapt it to the existing project rather than unnecessarily moving working files.

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── packages/
│   │   ├── hotels/
│   │   ├── vehicles/
│   │   ├── contact/
│   │   └── ...
│   │
│   ├── admin/
│   │   └── dashboard/
│   │       ├── packages/
│   │       ├── categories/
│   │       ├── hotels/
│   │       ├── vehicles/
│   │       ├── enquiries/
│   │       ├── content/
│   │       ├── chat-knowledge/
│   │       └── settings/
│   │
│   └── api/
│       ├── enquiries/
│       ├── hotels/
│       ├── vehicles/
│       ├── packages/
│       ├── chat/
│       └── revalidate/
│
├── components/
│   ├── existing-ui/
│   ├── public/
│   ├── forms/
│   ├── hotels/
│   ├── vehicles/
│   ├── enquiry/
│   ├── chatbot/
│   └── admin/
│
├── lib/
│   ├── firebase/
│   ├── auth/
│   ├── data/
│   ├── services/
│   ├── email/
│   ├── google-sheets/
│   ├── gemini/
│   ├── rag/
│   ├── validation/
│   ├── cache/
│   ├── security/
│   └── analytics/
│
├── types/
│   ├── package.ts
│   ├── category.ts
│   ├── hotel.ts
│   ├── vehicle.ts
│   ├── enquiry.ts
│   ├── chat.ts
│   └── admin.ts
│
└── constants/
    └── siteConfig.ts
```

---

# 7. Core Entities

## 7.1 Package

```ts
Package {
  id: string
  name: string
  slug: string
  destination: string
  categoryId?: string
  duration?: string
  description?: string
  itinerary?: ItineraryItem[]
  inclusions?: string[]
  exclusions?: string[]
  media?: MediaItem[]
  active: boolean
  seo?: SEOData
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 7.2 Hotel

```ts
Hotel {
  id: string
  name: string
  normalizedName: string
  slug: string
  location?: string
  description?: string
  amenities?: string[]
  media?: MediaItem[]
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Hotel uniqueness

`name` MUST be unique after normalization.

Normalization should:

1. trim whitespace;
2. convert to lowercase;
3. collapse repeated whitespace;
4. optionally normalize punctuation consistently.

Example:

```text
"  Hill View Resort  "
"hill view resort"
"HILL VIEW RESORT"
```

All represent the same normalized identity:

```text
hill view resort
```

Uniqueness MUST be enforced server-side.

A client-side duplicate check alone is insufficient.

---

# 8. Vehicle Entity

```ts
Vehicle {
  id: string
  numberPlate: string
  normalizedNumberPlate: string
  type: string
  model?: string
  capacity?: number
  features?: string[]
  description?: string
  media?: MediaItem[]
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Vehicle uniqueness

Number plate MUST be unique after normalization.

Example:

```text
TN 01 AB 1234
tn01ab1234
TN-01-AB-1234
```

The exact normalization format should be consistent across create, update and lookup operations.

Uniqueness MUST be enforced server-side.

---

# 9. Enquiry Entity

```ts
Enquiry {
  id: string

  customer: {
    name: string
    phone: string
    email?: string
  }

  package?: {
    id: string
    nameSnapshot?: string
  }

  hotel?: {
    id: string
    nameSnapshot?: string
  }

  vehicle?: {
    id: string
    numberPlateSnapshot?: string
  }

  travel: {
    date?: string
    groupSize?: number
  }

  message?: string

  source?: string

  status:
    | "new"
    | "contacted"
    | "in_progress"
    | "closed"
    | "spam"

  integrations: {
    emailStatus?: "pending" | "sent" | "failed"
    sheetsStatus?: "pending" | "synced" | "failed"
  }

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

An enquiry is NOT a booking.

---

# 10. Firestore Collections

```text
packages/
categories/
hotels/
vehicles/
enquiries/
gallery/
testimonials/
experiences/
siteSettings/
chatKnowledge/
adminUsers/
```

Optional future collections:

```text
chatSessions/
auditLogs/
integrationJobs/
```

Do not create these unless required by implementation.

---

# 11. Database Rules

## 11.1 General

- Firestore is the source of truth.
- Never expose admin credentials to the browser.
- Use server-side repositories/services for privileged operations.
- Use server timestamps.
- Avoid unbounded arrays.
- Avoid monolithic documents.
- Use pagination for admin lists.
- Create appropriate Firestore indexes.

## 11.2 Historical snapshots

When an enquiry selects an entity, preserve useful display information.

Example:

```text
hotel.id = "abc123"
hotel.nameSnapshot = "Mountain View Resort"
```

If the hotel is later renamed, historical enquiries remain understandable.

---

# 12. Public Package Flow

```text
Home
 |
 v
Package Listing
 |
 v
Package Details
 |
 +---- Select Hotel
 |
 +---- Select Vehicle
 |
 v
Enquiry Form
 |
 v
Submit
```

Package pages should be server-renderable and SEO-friendly.

---

# 13. Hotel Flow

```text
Hotels Page
    |
    v
Active Hotel List
    |
    v
Hotel Details / Selection
    |
    v
Enquiry
```

Only `active === true` hotels are publicly selectable.

---

# 14. Vehicle Flow

```text
Vehicles Page
    |
    v
Active Vehicles
    |
    v
Vehicle Selection
    |
    v
Enquiry
```

Only active vehicles are publicly selectable.

---

# 15. Combined Selection Flow

The customer may select:

```text
Package only
Package + Hotel
Package + Vehicle
Package + Hotel + Vehicle
Hotel only
Vehicle only
Hotel + Vehicle
```

The exact available combinations should follow the existing UI.

The backend MUST NOT assume that a package is always present unless the specific form requires it.

---

# 16. Enquiry API

## Endpoint

```http
POST /api/enquiries
```

## Request

```json
{
  "name": "Customer Name",
  "phone": "9876543210",
  "email": "customer@example.com",
  "packageId": "package-id",
  "hotelId": "hotel-id",
  "vehicleId": "vehicle-id",
  "travelDate": "2026-10-10",
  "groupSize": 4,
  "message": "Need details",
  "source": "package-detail"
}
```

## Processing

```text
Request
  |
  v
Validate
  |
  v
Rate Limit
  |
  v
Anti-spam
  |
  v
Validate referenced entities
  |
  v
Create Firestore enquiry
  |
  +------> Email
  |
  +------> Google Sheets
  |
  +------> Analytics
  |
  v
Success
```

---

# 17. Enquiry Validation

Required:

- customer name;
- phone;
- valid selected entity IDs when supplied.

Recommended:

- email.

Constraints:

- reasonable maximum name length;
- reasonable maximum message length;
- valid email format;
- valid phone format;
- valid group size;
- valid date format;
- referenced package/hotel/vehicle must exist;
- selected hotel/vehicle should be active at submission time.

Never trust IDs supplied by the browser.

---

# 18. Anti-Spam

Implement:

- honeypot field;
- server-side validation;
- request rate limiting;
- duplicate-submission protection;
- optional CAPTCHA only if spam volume justifies it.

The honeypot field must never be persisted as normal customer data.

---

# 19. Idempotency

Repeated browser submissions MUST NOT create duplicate enquiries.

Use an idempotency mechanism such as:

```text
client generated submission key
        +
server-side validation
        +
short-lived duplicate protection
```

The database record remains authoritative.

---

# 20. Email Workflow

After successful enquiry creation:

```text
Firestore
   |
   v
Email Service
   |
   +----> Internal notification
   |
   +----> Customer confirmation
```

## Internal email

Include:

- enquiry ID;
- customer name;
- phone;
- email;
- package;
- hotel;
- vehicle;
- travel date;
- group size;
- message;
- source.

## Customer email

Confirm:

> Your enquiry has been received.

Do NOT say:

- booking confirmed;
- hotel booked;
- vehicle reserved;
- payment received.

---

# 21. Email Failure Rule

If Firestore succeeds and email fails:

```text
DO NOT delete enquiry.
DO NOT report data loss.
Record emailStatus = failed.
Log the failure.
Retry if supported.
```

---

# 22. Google Sheets Workflow

Firestore is the system of record.

Google Sheets is the operational/reporting view.

```text
POST /api/enquiries
       |
       v
Firestore
       |
       v
Google Sheets
       |
       v
Operations Team
```

Suggested columns:

```text
Enquiry ID
Timestamp
Customer Name
Phone
Email
Package
Hotel
Vehicle
Vehicle Number Plate
Travel Date
Group Size
Message
Source
Status
Email Status
Sheet Sync Status
```

Credentials MUST remain server-side.

---

# 23. Google Sheets Failure Rule

If Sheets fails:

```text
Firestore enquiry = preserved
Sheets status = failed
Log failure
Retry if possible
```

Never make a successful customer enquiry dependent on Google Sheets availability.

---

# 24. Admin Authentication

Admin access MUST use:

- Firebase Authentication;
- server-side session/token verification;
- middleware protection;
- per-API authorization.

Never trust:

- client-set admin cookies;
- hidden form fields;
- localStorage admin flags;
- client-provided roles.

---

# 25. RBAC

Design authorization to support roles.

Initial role:

```text
admin
```

Future roles may include:

```text
super_admin
content_manager
operations_manager
```

Do not expose role selection to unauthenticated clients.

---

# 26. Admin Modules

## Dashboard

Show useful operational summaries such as:

- new enquiries;
- recent enquiries;
- active packages;
- active hotels;
- active vehicles.

## Packages

- create;
- edit;
- delete/archive;
- activate/deactivate;
- ordering;
- SEO fields.

## Hotels

- create;
- edit;
- archive;
- activate/deactivate;
- unique name validation.

## Vehicles

- create;
- edit;
- archive;
- activate/deactivate;
- unique number plate validation.

## Enquiries

- list;
- search;
- filter;
- inspect;
- change status;
- archive;
- inspect integration status.

## Content

- gallery;
- testimonials;
- experiences;
- settings.

## Chat Knowledge

- create;
- edit;
- activate/deactivate;
- categorize.

---

# 27. Admin API Security

Every protected API route MUST independently verify authorization.

Do not assume middleware alone is sufficient.

---

# 28. API Inventory

```text
GET    /api/packages
GET    /api/hotels
GET    /api/vehicles

POST   /api/enquiries

GET    /api/enquiries
GET    /api/enquiries/:id
PATCH  /api/enquiries/:id
DELETE /api/enquiries/:id

POST   /api/admin/packages
PATCH  /api/admin/packages/:id
DELETE /api/admin/packages/:id

POST   /api/admin/hotels
PATCH  /api/admin/hotels/:id
DELETE /api/admin/hotels/:id

POST   /api/admin/vehicles
PATCH  /api/admin/vehicles/:id
DELETE /api/admin/vehicles/:id

POST   /api/chat

POST   /api/revalidate
```

Only expose endpoints actually needed by the UI.

---

# 29. Service Layer

Business logic MUST NOT be duplicated across route handlers.

Recommended services:

```text
PackageService
HotelService
VehicleService
EnquiryService
EmailService
GoogleSheetsService
ChatService
KnowledgeService
AuthService
CacheService
```

---

# 30. Repository/Data Layer

Use dedicated data-access functions.

Example:

```text
getPackages()
getPackageBySlug()
getHotels()
getHotelById()
createHotel()
updateHotel()
getVehicles()
getVehicleById()
createVehicle()
updateVehicle()
createEnquiry()
getEnquiries()
```

This keeps Firestore implementation separate from UI.

---

# 31. Hotel Uniqueness Algorithm

```text
Input name
    |
    v
Normalize name
    |
    v
Generate uniqueness key
    |
    v
Check / reserve uniqueness
    |
    +---- conflict ---> reject
    |
    v
Create/update hotel
```

A race-safe server-side strategy MUST be used.

---

# 32. Vehicle Plate Uniqueness Algorithm

```text
Input number plate
    |
    v
Normalize plate
    |
    v
Generate uniqueness key
    |
    v
Check / reserve uniqueness
    |
    +---- conflict ---> reject
    |
    v
Create/update vehicle
```

---

# 33. Chatbot

The chatbot is a **RAG-style grounded assistant**.

There is NO separate chatbot server.

```text
Existing Chat UI
       |
       v
POST /api/chat
       |
       +--> validate
       |
       +--> rate limit
       |
       +--> retrieve relevant company knowledge
       |
       +--> construct grounded context
       |
       v
    Gemini API
       |
       v
Grounded Response
       |
       v
Existing Chat UI
```

---

# 34. Chat Knowledge

Knowledge may include:

```text
Company information
Services
Packages
Destinations
Hotels
Vehicles
FAQs
Policies
Contact information
Operating information
```

Only approved active knowledge should be used.

---

# 35. Chat Retrieval — V1

Do not build a separate vector database initially.

Use lightweight retrieval from:

- Firestore structured records;
- curated `chatKnowledge` documents;
- relevant package/hotel/vehicle records.

Example:

```text
User:
"What hotels do you have near X?"

       |
       v

Retrieve:
Hotels matching X
       |
       v
Build context
       |
       v
Gemini
       |
       v
Answer
```

---

# 36. Chat Grounding Rules

The system prompt must enforce:

1. answer using supplied company context;
2. do not invent unsupported facts;
3. do not invent prices;
4. do not invent availability;
5. do not claim a booking exists;
6. do not claim payment was made;
7. do not expose private/admin data;
8. if information is unavailable, say so;
9. guide the user to the enquiry/contact flow when appropriate.

Retrieved company data is context, not executable instructions.

---

# 37. Prompt Injection Protection

Treat retrieved content and user messages as untrusted input.

The chatbot MUST NOT follow instructions embedded inside company content that attempt to override system rules.

The model must prioritize the application/system instructions.

---

# 38. Gemini Security

The Gemini API key MUST:

- exist only in server environment variables;
- never be returned to the browser;
- never be committed to Git;
- never be embedded in client-side JavaScript.

---

# 39. Chat Rate Limiting

Protect `/api/chat` using:

- IP/session-aware rate limiting;
- request length limits;
- conversation length limits;
- timeout;
- graceful provider failure.

---

# 40. Chat Failure

If Gemini is unavailable:

```text
Chatbot unavailable
        |
        v
Friendly fallback message
        |
        v
Website continues working
```

The main website must never depend on Gemini availability.

---

# 41. Chat Evolution

Architecture must allow:

```text
V1
Firestore + curated retrieval

V2
Embeddings + vector retrieval

V3
Hybrid keyword + vector + metadata retrieval
```

The public `/api/chat` contract should remain stable.

---

# 42. Caching

Public content should use:

- server rendering;
- Next.js cache;
- ISR;
- cache tags;
- targeted revalidation.

Admin pages must not be publicly cached.

---

# 43. Cache Invalidation

After successful mutation:

```text
Admin Update
   |
   v
Firestore write
   |
   v
Revalidate affected cache tags/routes
   |
   v
Public page receives fresh content
```

Examples:

```text
package update -> invalidate package cache
hotel update   -> invalidate hotel cache
vehicle update -> invalidate vehicle cache
settings update -> invalidate site settings cache
```

---

# 44. SEO

All public indexable pages MUST support:

- unique title;
- unique meta description;
- canonical URL;
- Open Graph metadata;
- social metadata;
- crawlable server-rendered content;
- structured data where valid.

---

# 45. SEO Routes

Recommended:

```text
/
/packages
/packages/[slug]

/hotels
/hotels/[slug]

/vehicles

/about
/contact
```

Use the existing UI routing if already established.

---

# 46. Sitemap

Generate dynamically from active/indexable content.

Include:

- home;
- package pages;
- hotel pages where intended;
- other indexable public content.

Exclude:

```text
/admin
/api
/private
utility pages
```

No duplicate sitemap implementation should exist.

---

# 47. Robots

Provide a production robots configuration.

Allow public content.

Disallow:

```text
/admin
/api
```

Do not accidentally block the entire site.

---

# 48. Structured Data

Use valid structured data only where the page content supports it.

Potential schemas:

```text
Organization
WebSite
BreadcrumbList
TouristTrip / tourism-related schema where valid
```

Do not fabricate schema properties.

---

# 49. SEO Content Rules

Package/hotel pages should have:

- descriptive headings;
- unique content;
- semantic HTML;
- meaningful image alt text;
- stable slugs;
- internal links;
- useful metadata.

Avoid:

- keyword stuffing;
- duplicate metadata;
- hidden SEO text;
- fake reviews;
- fabricated structured data.

---

# 50. Performance

Target:

- fast initial render;
- minimal client JavaScript;
- optimized images;
- server rendering where useful;
- cached public data;
- paginated admin queries;
- bounded API payloads.

Use existing UI components without sacrificing performance.

---

# 51. Accessibility

Existing UI must remain visually consistent while meeting:

- keyboard navigation;
- semantic HTML;
- accessible labels;
- focus states;
- form error association;
- alt text;
- sufficient contrast;
- screen-reader compatibility.

Chatbot must also be keyboard accessible.

---

# 52. Security

Implement:

- HTTPS;
- secure authentication;
- authorization;
- server-side validation;
- rate limiting;
- anti-spam;
- secure headers where appropriate;
- secret management;
- safe error messages;
- input/output handling;
- least-privilege service accounts.

---

# 53. Secret Management

Required secrets are server-only:

```text
Firebase Admin credentials
Gemini API key
Email provider API key
Google service account credentials
```

Never commit `.env` files containing real secrets.

Use:

```text
.env.local
```

for local development and deployment-platform secret storage for staging/production.

---

# 54. Google Service Account Security

The Google service account should have only the permissions required to write to the designated spreadsheet.

Do not expose the service account JSON to the browser.

---

# 55. Firebase Security

Use Firebase Security Rules for client-accessible Firebase resources.

Privileged server operations use Firebase Admin SDK.

Admin access must not depend solely on Firestore rules.

---

# 56. Error Handling Contract

API errors should use predictable responses.

Example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please provide a valid phone number."
  }
}
```

Success:

```json
{
  "success": true,
  "data": {}
}
```

Do not expose stack traces.

---

# 57. Integration Failure Matrix

| Failure | Required behaviour |
|---|---|
| Firestore failure | enquiry fails safely |
| Email failure | enquiry preserved; email marked failed |
| Sheets failure | enquiry preserved; Sheets marked failed |
| Gemini failure | chatbot fallback |
| Duplicate hotel | reject mutation |
| Duplicate vehicle plate | reject mutation |
| Unauthorized admin | HTTP 401/403 |
| Invalid request | HTTP 400 |
| Missing resource | HTTP 404 |
| Unexpected server error | HTTP 500 without internals |

---

# 58. Observability

Track:

```text
Application errors
API latency
Firestore failures
Email failures
Sheets failures
Gemini failures
Gemini usage/cost
Enquiry conversion
Chat usage
Authentication failures
Suspicious request rates
```

Use structured server logs.

Never log:

- API keys;
- passwords;
- service account private keys;
- unnecessary sensitive customer information.

---

# 59. Analytics

Track at minimum:

```text
page_view
package_view
hotel_view
vehicle_view
enquiry_start
enquiry_submit
chat_open
chat_message
```

Do not allow analytics failures to break the website.

---

# 60. Testing Strategy

## Unit Tests

Test:

- hotel-name normalization;
- vehicle-plate normalization;
- uniqueness logic;
- validation;
- enquiry mapping;
- chatbot context construction.

## Integration Tests

Test:

- Firestore repositories;
- email adapter;
- Google Sheets adapter;
- Gemini adapter;
- authentication;
- authorization.

## API Tests

Test:

- valid requests;
- invalid requests;
- unauthorized requests;
- duplicate hotel;
- duplicate vehicle;
- duplicate enquiry submission;
- integration failures.

## E2E Tests

Test:

```text
Home
 -> Package
 -> Hotel selection
 -> Vehicle selection
 -> Enquiry
 -> Success
```

Also:

```text
Admin login
 -> Hotel CRUD
 -> Vehicle CRUD
 -> Enquiry management
```

---

# 61. AI Evaluation

The chatbot must be evaluated for:

- groundedness;
- factuality;
- unsupported-claim refusal;
- prompt injection resistance;
- company information accuracy;
- package accuracy;
- hotel accuracy;
- vehicle accuracy;
- graceful unknown responses.

Example test:

```text
Question:
"What is your payment policy?"

Expected:
Do not invent a payment policy.
Explain only what is present in company context.
```

---

# 62. CI/CD

```text
Developer
   |
   v
Git
   |
   v
Pull Request
   |
   +--> Lint
   +--> Type Check
   +--> Unit Tests
   +--> Integration Tests
   +--> Build
   +--> Security/Dependency Checks
   |
   v
Preview Deployment
   |
   v
QA
   |
   v
Production
```

Production deployment must be controlled through Git.

---

# 63. Environment Strategy

## Local

```text
local/dev Firebase
test email
test Sheets
test Gemini
```

## Staging

```text
staging Firebase
staging integrations
staging domain
```

## Production

```text
production Firebase
production email
production Sheets
production Gemini
production domain
```

Never mix production data into local development.

---

# 64. Deployment

Recommended production deployment:

```text
Git Repository
      |
      v
Vercel
      |
      +--> Next.js Build
      |
      +--> Edge/CDN
      |
      v
Production Application
```

Configure:

- custom domain;
- HTTPS;
- environment variables;
- preview deployments;
- production deployment;
- rollback capability.

---

# 65. Domain / DNS

Production should use:

```text
HTTPS
TLS
custom domain
canonical base URL
```

Transactional email domain should be configured with:

```text
SPF
DKIM
DMARC
```

---

# 66. Deployment Configuration

Production environment must include the required:

```text
Firebase
Gemini
Email
Google Sheets
Application URL
```

Do not hard-code environment-specific values.

---

# 67. Backup & Recovery

Production Firestore must have an appropriate backup/export strategy.

Recovery procedures should cover:

- accidental deletion;
- corrupted content;
- failed deployment;
- credential rotation;
- third-party integration outage.

Google Sheets is NOT the backup authority.

Firestore remains the source of truth.

---

# 68. Production Readiness Checklist

Before production:

### UI

- [ ] Existing UI preserved
- [ ] Responsive behaviour verified
- [ ] Forms work
- [ ] Existing components reused
- [ ] No accidental redesign

### Database

- [ ] Collections created
- [ ] Indexes created
- [ ] Security rules verified
- [ ] Hotel uniqueness tested
- [ ] Vehicle plate uniqueness tested

### Enquiry

- [ ] Validation
- [ ] Anti-spam
- [ ] Rate limiting
- [ ] Idempotency
- [ ] Firestore persistence
- [ ] Success state

### Email

- [ ] Sender domain verified
- [ ] SPF
- [ ] DKIM
- [ ] DMARC
- [ ] Customer email tested
- [ ] Internal email tested

### Google Sheets

- [ ] Service account configured
- [ ] Spreadsheet permissions configured
- [ ] Column contract verified
- [ ] Failure handling tested

### Chatbot

- [ ] Gemini key server-only
- [ ] Company knowledge loaded
- [ ] Grounding tested
- [ ] Prompt injection tested
- [ ] Rate limiting enabled
- [ ] Failure fallback tested

### Admin

- [ ] Authentication
- [ ] Authorization
- [ ] Protected routes
- [ ] Protected APIs
- [ ] Hotel CRUD
- [ ] Vehicle CRUD
- [ ] Enquiry management

### SEO

- [ ] Metadata
- [ ] Canonicals
- [ ] Sitemap
- [ ] Robots
- [ ] Structured data
- [ ] Open Graph
- [ ] 404 handling
- [ ] Redirect handling

### Deployment

- [ ] Production environment variables
- [ ] HTTPS
- [ ] Domain
- [ ] CI/CD
- [ ] Preview deployment
- [ ] Production deployment
- [ ] Rollback plan
- [ ] Monitoring
- [ ] Backup

---

# 69. Definition of Done

The implementation is complete only when:

1. the existing Hills Tourism UI is preserved;
2. all required pages are connected to real data;
3. packages work through Firestore;
4. hotels work through Firestore;
5. hotel names are uniquely enforced;
6. vehicles work through Firestore;
7. vehicle number plates are uniquely enforced;
8. customers can select hotels and vehicles;
9. enquiries are stored in Firestore;
10. enquiry data reaches Google Sheets;
11. company notification email works;
12. customer confirmation email works;
13. email/Sheets failures do not lose enquiries;
14. admin authentication is secure;
15. admin APIs are protected;
16. Gemini chatbot works through the existing backend;
17. chatbot responses are grounded in company data;
18. Gemini credentials are server-only;
19. no booking/payment system has been accidentally introduced;
20. caching/revalidation works;
21. SEO is production-ready;
22. sitemap and robots are correct;
23. tests pass;
24. production deployment succeeds;
25. monitoring and backup/recovery are configured.

---

# 70. Non-Negotiable Rules for the Implementation Agent

### Rule 1 — Preserve Existing UI

Do not redesign existing Hills Tourism UI.

### Rule 2 — Backend First, UI Wiring Second

Implement services/data/API and connect them to the existing UI.

### Rule 3 — Firestore Is the Source of Truth

Google Sheets is not the database.

### Rule 4 — Enquiry Is Not Booking

Never create booking/payment semantics.

### Rule 5 — Unique Inventory

Hotel names and vehicle number plates must be enforced as unique server-side.

### Rule 6 — Secrets Stay Server-Side

Gemini, Google and email credentials must never reach the browser.

### Rule 7 — Admin Security

Every protected API must verify authorization.

### Rule 8 — AI Must Be Grounded

Gemini must answer from approved company context and must not invent facts.

### Rule 9 — External Integrations Must Fail Safely

Email, Sheets or Gemini failures must not bring down the website.

### Rule 10 — Production Quality

Do not implement a demo-only solution. Implement validation, error handling, security, caching, SEO, testing and deployment readiness.

---

# 71. Implementation Sequence

Follow this order unless the existing codebase requires a safe dependency-first variation:

```text
1. Inspect existing UI/codebase
        |
2. Map existing pages/components/forms
        |
3. Preserve UI and identify integration points
        |
4. Configure Firebase
        |
5. Create TypeScript domain types
        |
6. Create Firestore collections/repositories
        |
7. Implement hotel uniqueness
        |
8. Implement vehicle plate uniqueness
        |
9. Implement package/hotel/vehicle services
        |
10. Implement admin authentication/authorization
        |
11. Implement admin CRUD
        |
12. Implement enquiry API
        |
13. Connect enquiry UI
        |
14. Implement email service
        |
15. Implement Google Sheets service
        |
16. Implement cache/revalidation
        |
17. Implement Gemini service
        |
18. Implement knowledge retrieval
        |
19. Connect chatbot UI
        |
20. Implement SEO
        |
21. Add analytics/observability
        |
22. Run tests
        |
23. Staging deployment
        |
24. Production deployment
```

---

# 72. Final Architecture Contract

```text
                    HILLS TOURISM
                         |
          +--------------+---------------+
          |              |               |
          v              v               v
       PACKAGES       HOTELS          VEHICLES
          |              |               |
          +--------------+---------------+
                         |
                         v
                    ENQUIRY FORM
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
         FIRESTORE     EMAIL      GOOGLE SHEETS
             |
             |
             v
       ADMIN OPERATIONS

CUSTOMER
    |
    v
CHAT UI
    |
    v
/api/chat
    |
    v
KNOWLEDGE RETRIEVAL
    |
    v
GEMINI API
    |
    v
GROUNDED RESPONSE

PUBLIC PLATFORM
    |
    +--> SEO
    +--> ISR / CACHE
    +--> CDN
    +--> ANALYTICS

PRODUCTION
    |
    +--> Git
    +--> CI/CD
    +--> Vercel
    +--> HTTPS
    +--> Monitoring
    +--> Backup / Recovery
```

---

# 73. Final Product Boundary

Hills Tourism is an **enquiry and lead-generation tourism platform**, not a transactional booking platform.

The central business flow is:

```text
DISCOVER
   ↓
EXPLORE
   ↓
SELECT TOUR / HOTEL / VEHICLE
   ↓
SEND ENQUIRY
   ↓
STORE LEAD
   ↓
EMAIL
   ↓
GOOGLE SHEETS
   ↓
BUSINESS FOLLOW-UP
```

The AI flow is:

```text
ASK QUESTION
   ↓
RETRIEVE COMPANY DATA
   ↓
GEMINI
   ↓
GROUNDED ANSWER
   ↓
OPTIONALLY DIRECT USER TO ENQUIRY
```

The production deployment flow is:

```text
CODE
 ↓
CI
 ↓
PREVIEW
 ↓
QA
 ↓
PRODUCTION
 ↓
MONITOR
 ↓
BACKUP / RECOVER
```

**This specification is the implementation contract. Existing Hills Tourism UI is preserved; functionality is implemented around it.**
