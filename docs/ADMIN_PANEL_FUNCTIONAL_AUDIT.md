# Hills Tourism Admin Panel Functional Audit

## 1. Admin Architecture

The Hills Tourism Admin Panel is built on **Next.js 14 (App Router)** with TypeScript, leveraging serverless API routes, Cloud Firestore as the persistent primary store, Cloudinary for optimized media delivery, and an in-memory repository fallback layer for high availability and offline resilience.

- **Frontend Client**: `src/app/admin/dashboard/page.tsx` renders an operations cockpit designed with responsive desktop and mobile views.
- **Theme & Appearance Engine**: `AdminThemeContext.tsx` with light/dark/system schemes synchronized to Firestore user settings.
- **Notification Engine**: Global `ToastProvider` (`src/components/admin/ToastProvider.tsx`) offering accessible, mobile-responsive toast notifications with success, error, warning, info, and loading states.
- **Data Repositories**: Encapsulated data layer in `src/lib/repositories/*` with domain contracts in `src/types/domain.ts`.
- **Media Engine**: Cloudinary integration via `src/lib/cloudinary/*` with signed uploads, transformations, and responsive image optimizations.

---

## 2. Authentication & Authorization

- **Mechanism**: Admin session token verified via HTTP-only cookie (`admin_token`) and `Authorization: Bearer <token>` headers.
- **Token Verification**: Handled by `src/lib/auth/admin-auth.ts` (`verifyAdminToken`).
- **Endpoints**:
  - `POST /api/admin/auth`: Validates admin credentials (email & password), issues a secure signed token.
  - `GET /api/admin/auth`: Verifies active session token validity.
  - `DELETE /api/admin/auth`: Logs out admin and clears session cookie.
- **Security**: Timing-safe comparison, rate-limiting on login attempts, and rejection of unauthorized requests with HTTP 401 Unauthorized.

---

## 3. Dashboard

- **Overview Metrics**: Live counters for total enquiries, new unread leads, active packages, available stays, fleet vehicles, and gallery items.
- **Recent Lead Feed**: Live stream of latest customer enquiries with quick status changes, quick detail modal, and WhatsApp/phone click-to-connect.
- **Fleet & Stay Availability**: Summary widgets showing active vs. inactive inventory.
- **Sheets & CRM Sync**: Integrated Google Sheets sync center with progress tracking and audit logs.

---

## 4. General Settings

- **Purpose**: System-wide configuration for brand identity, contact phone, contact email, WhatsApp numbers, business hours, headquarters address, and official social media profiles.
- **Firestore Document**: `siteSettings/general`
- **API Endpoint**: `GET /api/admin/content`, `PATCH /api/admin/content` (`{ type: 'settings', ... }`)
- **Status**: **IMPLEMENTED & AUDITED**

### General Settings Bug (Identified & Resolved)
- **Root Cause**:
  1. In `src/lib/repositories/content.repo.ts`, `updateSiteSettings` merged incoming updates into in-memory defaults rather than fetching and merging with the live Firestore document, causing settings to revert to seed values across restarts.
  2. In `src/app/api/admin/content/route.ts`, `buildSettingsPayload` did not extract `instagram` or `facebook`, and omitted aliases (`phone`, `email`, `whatsapp`).
  3. Revalidation in `src/lib/cache/revalidate.ts` only purged `/`, leaving `/contact`, `/about`, `/stays`, `/packages`, and `/vehicles` stale.
  4. Public consumption on `/contact`, `/`, and `Footer.jsx` had static fallback strings rather than consuming server-fetched Firestore settings.
  5. In `src/app/admin/dashboard/page.tsx`, `fetchContent` lacked `cache: 'no-store'`, and the settings form rendered blind `Object.entries()`, hiding new fields.
- **Fix Applied**:
  - Domain types updated to include `instagram` and `facebook`.
  - `updateSiteSettings` hardened to fetch current Firestore state first, merge, and persist with `{ merge: true }`.
  - API payload builder updated to parse brand, contact, social, and aliases.
  - Revalidation expanded to purge `/`, `/contact`, `/about`, `/stays`, `/packages`, `/vehicles`.
  - Public pages (`/`, `/contact`, `Footer.jsx`) dynamically consume `getSiteSettings()`.
  - Dashboard UI updated with structured Brand, Contact, Social, and Metrics sections, server refresh button, loading toasts, and immediate state sync.

---

## 5. Packages

- **Purpose**: Manage curated travel packages, day-by-day itineraries, pricing, inclusions, exclusions, and connected hotels/vehicles.
- **CRUD Operations**:
  - Create: `POST /api/admin/packages`
  - Read: `GET /api/admin/packages`
  - Update: `PATCH /api/admin/packages`
  - Delete: `DELETE /api/admin/packages?id={id}`
- **Firestore Collection**: `packages`
- **Validation**: Name, destination, slug uniqueness, and sequential unique integer day numbers for itineraries.
- **Status**: **IMPLEMENTED** (Enhanced with $\ge 44\text{px}$ mobile touch targets, safe delete confirmation, and toast notifications).

---

## 6. Vehicles

- **Purpose**: Manage mountain fleet inventory (Sedan, SUV, Tempo Traveller, Luxury Coach), seating capacity, luggage capacity, and availability.
- **CRUD Operations**:
  - Create: `POST /api/admin/vehicles`
  - Read: `GET /api/admin/vehicles`
  - Update: `PATCH /api/admin/vehicles`
  - Delete: `DELETE /api/admin/vehicles?id={id}`
- **Firestore Collection**: `vehicles`
- **Uniqueness**: Server-enforced number plate uniqueness (returns HTTP 409 on duplicate).
- **Status**: **IMPLEMENTED** (Enhanced with prominent number plate badges, touch-friendly $\ge 44\text{px}$ action buttons, and loading toasts).

---

## 7. Stays / Hotels

- **Purpose**: Manage resort and hotel accommodations across Munnar, Ooty, Coorg, and other highlands.
- **CRUD Operations**:
  - Create: `POST /api/admin/hotels`
  - Read: `GET /api/admin/hotels`
  - Update: `PATCH /api/admin/hotels`
  - Delete: `DELETE /api/admin/hotels?id={id}`
- **Firestore Collection**: `hotels`
- **Uniqueness**: Server-enforced hotel name and slug uniqueness (returns HTTP 409 on duplicate).
- **Status**: **IMPLEMENTED** (Enhanced with mobile-friendly card layout, $\ge 44\text{px}$ buttons, and loading toasts).

---

## 8. Gallery

- **Purpose**: Manage high-resolution photography catalog with categories, alt texts, and display ordering.
- **CRUD Operations**:
  - Create: `POST /api/admin/gallery`
  - Read: `GET /api/admin/gallery`
  - Update: `PATCH /api/admin/gallery`
  - Delete: `DELETE /api/admin/gallery?id={id}`
- **Firestore Collection**: `gallery`
- **Status**: **IMPLEMENTED**

---

## 9. Experiences / Destinations

- **Purpose**: Curate highlight activities (Tea Garden Treks, Waterfall Abseiling, Campfire Nights).
- **CRUD Operations**:
  - Create: `POST /api/admin/content` (`type: 'experience'`)
  - Read: `GET /api/admin/content`
  - Update: `PUT /api/admin/content` (`type: 'experience'`)
  - Delete: `DELETE /api/admin/content?type=experience&id={id}`
- **Firestore Collection**: `content/experiences/items`
- **Status**: **IMPLEMENTED**

---

## 10. Testimonials

- **Purpose**: Manage guest reviews, star ratings, reviewer avatars, and trip citations.
- **CRUD Operations**:
  - Create: `POST /api/admin/content` (`type: 'testimonial'`)
  - Read: `GET /api/admin/content`
  - Update: `PUT /api/admin/content` (`type: 'testimonial'`)
  - Delete: `DELETE /api/admin/content?type=testimonial&id={id}`
- **Firestore Collection**: `content/testimonials/items`
- **Status**: **IMPLEMENTED**

---

## 11. Enquiries

- **Purpose**: Live customer lead capture, status workflow (`new` $\to$ `contacted` $\to$ `converted` $\to$ `cancelled`), note timelines, audit logging, email responses, and Google Sheets sync.
- **CRUD Operations**:
  - Read: `GET /api/enquiries`
  - Update Status / Notes: `PATCH /api/enquiries`
  - Archive / Delete: `DELETE /api/enquiries?id={id}`
  - Email Composer: `POST /api/admin/email`
- **Firestore Collection**: `enquiries`
- **Status**: **IMPLEMENTED**

---

## 12. Social Links

- **Purpose**: Configure active external social links (Instagram, Facebook, WhatsApp, YouTube, X).
- **CRUD Operations**:
  - Create: `POST /api/admin/social`
  - Read: `GET /api/admin/social`
  - Update: `PUT /api/admin/social`
  - Delete: `DELETE /api/admin/social?id={id}`
- **Firestore Collection**: `social_links`
- **Status**: **IMPLEMENTED**

---

## 13. SEO CMS

- **Purpose**: Granular metadata management per public route (`title`, `description`, `canonical`, `robots`, `ogImage`).
- **CRUD Operations**:
  - Read: `GET /api/admin/seo`
  - Update: `PUT /api/admin/seo`
  - Reset to Default: `POST /api/admin/seo` (`action: 'reset'`)
- **Firestore Collection**: `seo_pages`
- **Status**: **IMPLEMENTED**

---

## 14. Chat Knowledge

- **Purpose**: Contextual knowledge base and FAQ entries grounding the AI Hill Concierge chatbot.
- **CRUD Operations**:
  - Create: `POST /api/admin/chat-knowledge`
  - Read: `GET /api/admin/chat-knowledge`
  - Delete: `DELETE /api/admin/chat-knowledge?id={id}`
- **Firestore Collection**: `chat_knowledge`
- **Status**: **IMPLEMENTED**

---

## 15. Content Management

- **Purpose**: Categorization engine for journey types (Couples, Family, Adventure, Luxury).
- **CRUD Operations**:
  - Create: `POST /api/admin/content` (`type: 'category'`)
  - Read: `GET /api/admin/content`
  - Update: `PUT /api/admin/content` (`type: 'category'`)
  - Delete: `DELETE /api/admin/content?type=category&id={id}`
- **Firestore Collection**: `content/categories/items`
- **Status**: **IMPLEMENTED**

---

## 16. Cloudinary

- **Purpose**: Asset upload, image optimization, automatic format delivery (WebP/AVIF), and thumbnail generation.
- **Endpoint**: `POST /api/admin/upload` (multipart form-data)
- **Status**: **IMPLEMENTED** (Integrated with `ImageUploadField` toast feedback).

---

## 17. Revalidation / Cache

- **Engine**: Next.js On-Demand Tag & Path Revalidation (`src/lib/cache/revalidate.ts`).
- **Triggers**:
  - Settings: Revalidates `/`, `/contact`, `/about`, `/stays`, `/packages`, `/vehicles`.
  - Packages: Revalidates `/packages`, `/packages/[slug]`, `/`.
  - Stays / Hotels: Revalidates `/stays`, `/`.
  - Vehicles: Revalidates `/vehicles`, `/`.
  - SEO: Revalidates specific target route.
- **Status**: **IMPLEMENTED**

---

## 18. API Mapping

| Endpoint | Methods | Auth Required | Purpose |
|----------|---------|---------------|---------|
| `/api/admin/auth` | POST, GET, DELETE | No (POST) / Yes (GET, DELETE) | Session token login, verification, and logout |
| `/api/admin/content` | GET, POST, PUT, PATCH, DELETE | Yes | Site settings, categories, experiences, testimonials |
| `/api/admin/packages` | GET, POST, PATCH, DELETE | Yes | Tour packages and detailed itineraries |
| `/api/admin/hotels` | GET, POST, PATCH, DELETE | Yes | Hotels and stay accommodations |
| `/api/admin/vehicles` | GET, POST, PATCH, DELETE | Yes | Vehicle fleet inventory |
| `/api/admin/gallery` | GET, POST, PATCH, DELETE | Yes | Photography gallery items |
| `/api/admin/social` | GET, POST, PUT, DELETE | Yes | Social media channels |
| `/api/admin/seo` | GET, PUT, POST | Yes | Per-route SEO meta tags |
| `/api/admin/chat-knowledge` | GET, POST, DELETE | Yes | RAG knowledge base for hill guide |
| `/api/admin/upload` | POST | Yes | Cloudinary media uploads |
| `/api/enquiries` | GET, POST, PATCH, DELETE | Yes (GET/PATCH/DELETE) / No (POST) | Customer lead CRM & workflow |
| `/api/admin/email` | POST | Yes | CRM direct customer email composer |

---

## 19. Firestore Mapping

| Module | Firestore Collection / Path | Document Model |
|--------|-----------------------------|----------------|
| General Settings | `siteSettings/general` | `SiteSettings` |
| Packages | `packages/{packageId}` | `Package` |
| Hotels | `hotels/{hotelId}` | `Hotel` |
| Vehicles | `vehicles/{vehicleId}` | `Vehicle` |
| Gallery | `gallery/{photoId}` | `GalleryPhoto` |
| Categories | `content/categories/items/{id}` | `Category` |
| Experiences | `content/experiences/items/{id}` | `Experience` |
| Testimonials | `content/testimonials/items/{id}` | `Testimonial` |
| Enquiries | `enquiries/{enquiryId}` | `Enquiry` |
| Social Links | `social_links/{linkId}` | `SocialLink` |
| SEO Pages | `seo_pages/{pageId}` | `PageSEO` |
| Chat Knowledge | `chat_knowledge/{id}` | `KnowledgeItem` |

---

## 20. Security

- Bearer token / HttpOnly cookie authentication on all administrative mutations.
- Unsanitized user inputs stripped; URLs validated with `http:` / `https:` protocols.
- Server secrets (Firebase Private Key, Cloudinary Secret, Google Service Account) restricted to server-only runtime.
- Client notifications sanitized; stack traces and database internals never displayed.

---

## 21. Known Issues & Resolutions

1. **Stale Settings on Server Restarts**: Fixed by ensuring `updateSiteSettings` directly fetches existing Firestore document before applying updates.
2. **Missing Social Fields in Content Route**: Fixed by adding `instagram` and `facebook` extraction in `buildSettingsPayload`.
3. **Small Mobile Touch Targets**: Fixed by elevating all card action buttons (Edit, Delete, View) to $\ge 44\text{px}$ touch targets.
4. **Ad-hoc Alert UI**: Replaced with unified, fixed `ToastProvider` at `z-index: 10000`.

---

## 22. Testing Results

All 16 test suites (50 unit tests) pass cleanly:
- `site-settings.test.ts`: PASS (Default values, social links update, non-destructive merge, theme persistence)
- `content-crud.test.ts`: PASS (Category, Experience, Testimonial, Settings CRUD)
- `hotel-vehicle-uniqueness.test.ts`: PASS (Number plate and hotel name/slug uniqueness)
- `itinerary-validation.test.ts`: PASS (Sequential day validation, required fields)
- `package-detail.test.ts`: PASS (Package details, inclusions, exclusions)
- `seo-cms.test.ts`: PASS (SEO persistence, route resets)
- `social-crud.test.ts`: PASS (Social link management)
- `admin-auth-cache.test.ts`: PASS (Auth verification and caching)

---

## 23. Recommendations

1. **Automated End-to-End Cypress / Playwright Pipeline**: Add browser automation for admin workflow regressions on CI/CD.
2. **Periodic Sheets Backup**: Trigger automated Google Sheets synchronization via cron job for redundant disaster recovery.
3. **Audit Log Export**: Provide CSV export for customer enquiry audit timelines.

---

## Concise Summary Table

| Module | CRUD | API | Firestore | Auth | Revalidation | Status |
|--------|------|-----|-----------|------|--------------|--------|
| General Settings | R/U | `/api/admin/content` | `siteSettings/general` | Required | Automatic (6 paths) | **IMPLEMENTED** |
| Packages | C/R/U/D | `/api/admin/packages` | `packages` | Required | Automatic | **IMPLEMENTED** |
| Vehicles | C/R/U/D | `/api/admin/vehicles` | `vehicles` | Required | Automatic | **IMPLEMENTED** |
| Hotels / Stays | C/R/U/D | `/api/admin/hotels` | `hotels` | Required | Automatic | **IMPLEMENTED** |
| Gallery | C/R/U/D | `/api/admin/gallery` | `gallery` | Required | Automatic | **IMPLEMENTED** |
| Experiences | C/R/U/D | `/api/admin/content` | `content/experiences/items` | Required | Automatic | **IMPLEMENTED** |
| Testimonials | C/R/U/D | `/api/admin/content` | `content/testimonials/items` | Required | Automatic | **IMPLEMENTED** |
| Categories | C/R/U/D | `/api/admin/content` | `content/categories/items` | Required | Automatic | **IMPLEMENTED** |
| Enquiries | R/U/D | `/api/enquiries` | `enquiries` | Required | None (CRM) | **IMPLEMENTED** |
| Social Links | C/R/U/D | `/api/admin/social` | `social_links` | Required | Automatic | **IMPLEMENTED** |
| SEO CMS | R/U/Reset | `/api/admin/seo` | `seo_pages` | Required | Automatic | **IMPLEMENTED** |
| Chat Knowledge | C/R/D | `/api/admin/chat-knowledge` | `chat_knowledge` | Required | In-memory RAG | **IMPLEMENTED** |
| Image Uploads | C | `/api/admin/upload` | Cloudinary | Required | None | **IMPLEMENTED** |
| Email Responses | C | `/api/admin/email` | Nodemailer / CRM | Required | None | **IMPLEMENTED** |
| Sheets Sync | C/R | `/api/admin/sheets-sync` | Google Sheets API | Required | None | **IMPLEMENTED** |
