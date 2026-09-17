# Hills Tourism — Premium Mountain Journeys Platform & Operations CRM

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFA611?style=flat&logo=firebase)](https://firebase.google.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=flat&logo=cloudinary)](https://cloudinary.com/)
[![Resend](https://img.shields.io/badge/Resend-Email_API-000000?style=flat&logo=resend)](https://resend.com/)
[![Tests](https://img.shields.io/badge/Tests-123%20Passed-brightgreen?style=flat&logo=vitest)](https://vitest.dev/)

**Hills Tourism** is a comprehensive mountain holiday and experiential travel web platform designed specifically for South India and Himalayan hill stations (Munnar, Coorg, Ooty, Wayanad, Kodaikanal, Shimla, Manali, Kashmir, and Darjeeling). 

The platform pairs a public-facing digital travel showcase with an **integrated Admin CRM** for managing enquiries, automated quotations, booking confirmations, Google Sheets synchronization, content management, and SEO metadata.

---

## Key Features

### Public Portal (Traveler Experience)
- **Cinematic Canvas Hero**: Fluid 60-frame mountain landscape scroll animation rendered with HTML5 Canvas, preloaded with WebP frames and smooth velocity-damped scrolling.
- **Trip Finder**: Search trips by destination, duration, budget, and travel style with immediate filtered recommendations.
- **Curated Mountain Packages**: Detailed day-by-day itineraries, inclusions/exclusions, stay accommodations, and private fleet options.
- **Smart Stay Accommodations**: Hand-picked boutique resorts, mountain chalets, and heritage tea estate bungalows.
- **Mountain Fleet**: Dedicated mountain-rated SUVs, sedans, and luxury travelers with hill-trained drivers.
- **Instant Enquiry Pipeline**: Modal booking system with atomic Firestore persistence, anti-spam validation, and instant Google Sheets & email notifications.
- **Interactive AI Travel Concierge**: Grounded hill station chatbot powered by Google Gemini API and a curated local knowledge repository.
- **SEO & Performance Architecture**: Server-Side Rendering (SSR) & Incremental Static Regeneration (ISR), Schema.org JSON-LD microdata, OpenGraph tags, XML sitemap, and Google Fonts self-hosting.

### Admin Operations Portal & CRM (`/admin/dashboard`)
- **Email & Password Authentication**: Secured via hardened `HttpOnly` `SameSite=Strict` cookies with support for environment credentials, Firebase Auth, and direct-token access.
- **Light / Dark / System Theme System**: 3-tier persistence priority engine (Firestore Admin Settings &rarr; `localStorage` &rarr; System OS) with 250ms smooth transition between Midnight Navy SaaS and Clean White modes.
- **Customer Email Center**: Integrated with Resend API for composing and sending rich HTML travel reminders, booking confirmations, quotations, and custom updates directly from enquiry cards.
- **Google Sheets Two-Way Synchronization**: Live Google Sheets API sync with automatic column matching, row ID tracking, status tags, and batch-retry for failed rows.
- **Enquiry Timeline & Internal Notes**: Timestamped internal team notes, communication history, and real-time activity log.
- **Searchable Audit Logs**: Full administrative audit trail tracking logins, content edits, email dispatches, and data synchronizations.
- **Content Management System (CMS)**:
  - Day-wise package editor with image picker and difficulty metrics
  - Hotel & stay directory editor with room categories and amenities
  - Fleet management with vehicle plate, capacity, and rate settings
  - Curated experiences, traveler reviews, and gallery manager
  - Social links manager and Page-by-Page SEO meta editor
  - Cloudinary asset manager with upload dropzone and live preview

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 18 |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Vanilla CSS Design Tokens, Tailwind CSS, Glassmorphism, CSS Custom Properties |
| **Database** | Firebase Firestore & Firebase Admin SDK (Node.js) |
| **Media Delivery** | Cloudinary CDN with automatic format/quality optimization |
| **Email Delivery** | Resend API (Transactional & CRM notifications) |
| **Spreadsheets** | Google Sheets API v4 via Google Cloud Service Account |
| **Artificial Intelligence** | Google Gemini API (`@google/generative-ai`) |
| **Testing** | Vitest, Testing Library, TypeScript Typechecking |

---

## Directory Structure

```text
hillstourism/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/             # Public pages (about, stays, hotels, vehicles, etc.)
│   │   ├── admin/                # Admin Portal
│   │   │   ├── dashboard/        # Main Admin CRM Operations Hub
│   │   │   ├── login/            # Email & Password Admin Authentication
│   │   │   └── layout.tsx        # Anti-flash theme bootstrap layout
│   │   ├── api/                  # Server Route Handlers
│   │   │   ├── admin/            # Protected admin APIs (auth, content, CRM, etc.)
│   │   │   │   ├── auth/         # Login & session cookie handler
│   │   │   │   ├── content/      # Firestore content CRUD & theme settings
│   │   │   │   └── crm/          # CRM Email, Sheets, Notes, and Audit APIs
│   │   │   ├── chat/             # Gemini AI chatbot endpoint
│   │   │   ├── enquiries/        # Public & admin enquiry submissions
│   │   │   └── revalidate/       # On-demand ISR revalidation handler
│   │   ├── layout.tsx            # Global Root Layout & Metadata
│   │   ├── page.tsx              # Public Homepage
│   │   ├── robots.ts             # Search engine robots configuration
│   │   └── sitemap.ts            # Dynamic XML sitemap generator
│   ├── components/               # Reusable React components
│   │   ├── admin/                # Admin dashboard widgets, modals, and drawers
│   │   │   ├── AdminMobileDrawer.tsx
│   │   │   ├── AuditLogModal.tsx
│   │   │   ├── EmailComposerModal.tsx
│   │   │   ├── EnquiryDetailModal.tsx
│   │   │   ├── EnquiryTimeline.tsx
│   │   │   ├── InternalNotes.tsx
│   │   │   ├── SheetsSyncCenter.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── CanvasHero.jsx        # 60-frame cinematic canvas animation
│   │   ├── Navbar.jsx            # Floating liquid glass responsive navbar
│   │   └── Enquiry.jsx           # Public booking modal
│   ├── context/                  # Context providers (AdminThemeContext)
│   ├── lib/                      # Core business logic & integrations
│   │   ├── auth/                 # Admin authentication & token verification
│   │   ├── cloudinary/           # Cloudinary image transform helpers
│   │   ├── firebase/             # Firebase Admin initialization & Firestore
│   │   ├── repositories/         # Repository layer for domain entities
│   │   ├── seo/                  # Metadata helpers and canonical URLs
│   │   └── services/             # CRM email and Google Sheets services
│   ├── types/                    # Domain TypeScript type definitions
│   └── index.css                 # Global design system tokens & styles
├── tests/                        # Automated test suites
│   ├── unit/                     # Unit tests (auth, CRM, validation, SEO)
│   └── integration/              # Integration tests (enquiry pipeline, CRUD)
├── public/                       # Static public assets (logos, icons, frames)
├── .env.example                  # Environment template
└── vitest.config.ts              # Vitest test runner configuration
```

---

## Getting Started

### Prerequisites
- Node.js version **18.17.0** or higher
- npm (version 9 or later) or yarn

### 1. Clone & Install
```bash
git clone https://github.com/Jumanaafra/hillstourism.git
cd hillstourism
npm install
```

### 2. Environment Configuration
Copy the environment template file:
```bash
cp .env.example .env.local
```

Configure the variables in `.env.local`:

```ini
# ─── Firebase Admin SDK ───
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ─── Admin Authentication ───
ADMIN_EMAIL=admin@hillstourism.com
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_ACCESS_TOKEN=your-32-byte-hex-token
ADMIN_SECRET_KEY=your-32-byte-hex-token

# ─── Email Communications (Resend) ───
RESEND_API_KEY=re_your_resend_api_key
SENDER_EMAIL=Hills Tourism <enquiries@hillstourism.com>
INTERNAL_NOTIFICATION_EMAIL=ops@hillstourism.com

# ─── Google Sheets Sync ───
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-sync@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_RANGE=Enquiries!A:P

# ─── Media Storage (Cloudinary) ───
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# ─── AI Concierge (Gemini) ───
GEMINI_API_KEY=your-gemini-api-key

# ─── Site & Cache ───
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATE_SECRET=your-cache-revalidation-secret
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Admin Portal Access

- **URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Default Email**: `admin@hillstourism.com` *(or username `admin`)*
- **Default Password**: `HillsAdmin@2025` *(configurable via `ADMIN_PASSWORD`)*
- **Token Mode**: Supports direct access token authentication via the toggle button for administrative scripts or headless integrations.

---

## Testing & Quality Assurance

The codebase includes comprehensive unit and integration tests powered by **Vitest**:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Verify TypeScript types
npm run typecheck

# Run Next.js linter
npm run lint
```

Current test status: **123/123 tests passing** across 19 suites covering:
- Admin authentication & cookie hardening
- Itinerary normalization & validation
- CRM Email dispatch & template interpolation
- Google Sheets synchronization & error recovery
- Internal notes & enquiry timeline audit logs
- Slug uniqueness enforcement & image optimization

---

## Production Deployment

### Vercel Deployment (Recommended)
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Add the environment variables from your `.env.local` to the Vercel Project Settings.
4. Set the build command to `npm run build` and output directory to `.next`.
5. Deploy.

### Production Build Verification
```bash
npm run build
npm start
```

---

## License

This project is proprietary and confidential to **Hills Tourism**. All rights reserved.
