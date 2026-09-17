# Phase 7 — React and JavaScript performance

## 1. Objective

Reduce public page hydration, avoid duplicate admin reads, and defer admin modal code while preserving the approved UI, ISR, the Hero sequence, and all integrations.

## 2. Baseline

The first `npm run build` compiled and generated 31 static pages, then failed during Next.js export with `PageNotFoundError: Cannot find module for page: /_error` (`ENOENT`). Firestore reads repeatedly timed out at 15 seconds in this local environment. That build did not emit a reliable route size table, so no numerical before bundle baseline is available. The source baseline had `HomePageClient.tsx` as a client boundary around the entire homepage and two admin effects that both requested enquiries on initial overview mount.

## 3. Client component audit

Every `use client` directive in `src` was reviewed with its browser behavior. Server page routes for `/`, `/packages`, `/packages/[slug]`, `/stays`, `/hotels/[slug]`, `/vehicles`, `/experiences`, `/gallery`, `/about`, `/privacy-policy`, and `/terms-and-conditions` already use server rendering or ISR. API handlers, repositories, services, and server layouts have no client directive.

| Class | Components | Reason / action |
| --- | --- | --- |
| A, interactive client | `Navbar`, `Footer`, `TripFinder`, `TripCategoryCarousel`, `FeaturedTrips`, `Experiences`, `Testimonials`, `Stays`, `SmartStayMatcher`, `Enquiry`, `NewsletterForm`, `PackageItineraryView` | Navigation/menu, accordions, filters, selectors, forms, or expanded itinerary state require event handlers. Retained. |
| D, browser API or animation | `Hero`, `Journey`, `StatsStrip`, `Gallery`, `LoadingScreen`, `HomeLoadingOverlay`, `HillGuide`, `LazyHillGuide` | Canvas, GSAP, observers, scroll, animation, storage, or chat state. Retained. |
| B, server eligible | `HomePageClient` page composition | Removed the client directive. This lets `Vehicles` and `WhyChooseUs`, which have no client directive, remain server rendered on the homepage. Loader state moved to a small client component. |
| A, admin interactive | `admin/dashboard/page`, `admin/login/page`, `AdminThemeContext`, `ToastProvider`, `ThemeToggle`, `AdminMobileDrawer`, `MobileAdminHeader`, `MobileEnquiryCard`, `ImageUploadField`, `InternalNotes`, `EnquiryTimeline`, `SheetsSyncCenter`, `EnquiryDetailModal`, `EmailComposerModal`, `AuditLogModal` | Authentication, CRUD, uploads, theme state, mobile navigation, CRM actions, and modals require client behavior. Retained. |
| D, error boundary | `app/error.tsx` | Next.js error boundary reset interaction requires a client component. Retained. |

Static content within interactive components is still hydrated. Splitting each carousel, accordion, and filter into additional server/client pieces would require broader changes and was not done without profiling evidence.

Public route verification exposed a pre-existing package data shape mismatch: server packages use `name` while legacy card data uses `title`. `FeaturedTrips` and `TripFinder` now render `name || title` for card headings and accessible image/link labels so the server-provided content remains visible.

## 4. Hydration changes

The homepage now composes sections in a server component. Static `Vehicles` and `WhyChooseUs` sections no longer inherit the page-wide client boundary. `HomeLoadingOverlay` owns the session-based loader state; the same `LoadingScreen` remains dynamically imported. Hero composition and visual behavior were not changed.

## 5. `useEffect` audit and changes

All effects in `src` were located. Public effects are for scroll reveal observers, Hero frame loading and GSAP lifecycle, scroll/resize/keyboard listeners, reduced-motion detection, loading animation, form behavior, or chat focus/scroll. Those effects do not refetch server-provided packages, hotels, vehicles, or gallery data. Observer/listener and animation effects reviewed in `Hero`, `useFrameSequence`, `Journey`, `Navbar`, `TripCategoryCarousel`, `Gallery`, `StatsStrip`, and modal components include cleanup. `HomeLoadingOverlay` uses a layout effect to preserve the previous no-flash session check.

On the admin dashboard, the initial data effect already fetches enquiries and content. The tab effect previously repeated the overview enquiry fetch on mount. It now skips its first invocation and continues to refresh on later tab changes. Existing hook dependency lint warnings remain in dashboard and `AuditLogModal`; resolving their function identity model requires a separate behavior review.

| Effect group | Trigger | Network / state | Cleanup and decision |
| --- | --- | --- | --- |
| `HomeLoadingOverlay`, `LoadingScreen` | Mount | Session check and loader animation state; no API GET | Timer cleanup retained; loader state isolated. |
| `Hero`, `useFrameSequence` (five effects) | Mount, enabled state, resize, progress callback | Image frames, canvas, GSAP; no catalogue API | ScrollTrigger, resize listener, RAF and image-load guards retained. |
| `Journey`, `FeaturedTrips`, `Experiences`, `Gallery` (two), `SmartStayMatcher`, `Stays`, `Testimonials`, `TripFinder`, `StatsStrip` (two) | Mount, section visibility, or filter/props | Reveal/count state; no API GET | Observers/timers/listeners disconnect or clear. |
| `Navbar` (four), `TripCategoryCarousel` (two) | Mount, path, menu, resize | Menu/scroll/carousel state; no API GET | Scroll/resize/keyboard listeners and menu timer cleaned up. |
| `Enquiry` (two), `HillGuide` (two) | Initial selection props, mount, open, messages | Form sync or chat UI state; chat request only on send | Observer and close timer cleanup retained. |
| `AdminThemeContext` (two), `AdminMobileDrawer` | Mount, theme/menu state | Local storage/theme and mobile menu state | Media/keyboard listener cleanup retained. |
| `EnquiryDetailModal` (two), `EmailComposerModal` (two), `AuditLogModal` (two) | Open, selected record/filter | Modal state; audit GET only when opened or filtered | Keyboard listener cleanup retained; modals now mount only when open. |
| Admin dashboard (two) | Mount/token and tab change | Admin API reads | Initial tab effect skipped to avoid duplicate enquiry/content reads. |

## 6. API request optimization

Public catalogue data is fetched in server page code and passed to interactive components. A search of `src/components` found no browser GETs to `/api/packages`, `/api/hotels`, `/api/vehicles`, `/api/gallery`, `/api/social-links`, `/api/content`, or `/api/seo`. Public component fetches are the user-triggered `/api/enquiries` and `/api/chat` POST paths. Navbar and Footer use supplied/default social data and do not fetch social links on mount. The admin initial overview now avoids one duplicate `/api/enquiries` request by code path.

## 7. Re-render optimization

Removing the homepage-wide client boundary prevents page-level loader state from owning every homepage child. Existing filtering memoization was retained. No blanket `React.memo`, `useMemo`, or `useCallback` changes were added without profiler evidence.

## 8. Dynamic imports and loading

The three admin CRM modals (`EnquiryDetailModal`, `EmailComposerModal`, `AuditLogModal`) now load through `next/dynamic` and only mount when opened. `LazyHillGuide` continues to defer the chat widget. `LoadingScreen` remains a client-only dynamic import. Primary Hero and catalogue content remain in the initial render path to avoid delaying LCP or SEO content. No new spinner or Suspense boundary was added.

## 9. Dependency and icon audit

`package.json` includes Firebase Admin, Google APIs, Cloudinary, Gemini, GSAP, React Icons, and Zod. Firebase Admin, Google Sheets, Gemini, and Cloudinary server SDK entrypoints use `server-only`; Cloudinary's client-imported `transform.ts` is a URL helper. React Icons imports target specific `fi`, `fa`, and `md` subpaths, and `next.config.mjs` already lists them in `optimizePackageImports`. No dependency was removed without a verified unused-module result.

## 10. GSAP and event listeners

The 100 WebP frames, canvas renderer, ScrollTrigger, bird animation, frame counter, progressive loading, and desktop/mobile Hero behavior were left unchanged. The frame hook's resize listener, ScrollTrigger, and animation frame loops have cleanup paths. Navbar and Journey scroll listeners are passive and removed on unmount. Carousel resize and keyboard listeners, modal keyboard listeners, and reveal observers are also removed/disconnected. No additional memoization or animation rewrite was warranted by the available evidence.

## 11. Admin optimization

The admin dashboard still fetches its five core data collections in parallel at mount. The duplicate overview enquiry fetch was removed. Infrequently used CRM modals are now separate chunks loaded when opened. Full admin tab splitting and list virtualization remain opportunities, but require profiling before implementation. Authenticated browser verification confirmed live dashboard counts and records, all admin sections, and the three deferred CRM modals opening; no live CRUD mutation was performed.

## 12. Bundle analysis and before/after metrics

The final production build passed. Next.js reported **87.4 kB shared First Load JS**. The largest raw emitted client JS files are `app/admin/dashboard/page` (193.5 KiB), the shared `fd9d1056` chunk (168.8 KiB), and the shared `framework` chunk (136.7 KiB). The homepage route chunk is 25.9 KiB raw. These are raw file sizes, not transfer sizes, and are not directly comparable with the Next.js First Load JS figure. `node scripts/phase7-bundle-audit.mjs` reproduces the file and marker scan. No valid pre-change route table exists because the baseline build failed, so no byte reduction is claimed.

| Area | Before | Change | After | Verified |
| --- | --- | --- | --- | --- |
| Homepage client boundary | Entire homepage composed under `use client` | Moved composition to server | Static sections can remain server rendered | Source audit; build pass |
| Admin initial enquiry requests | Two code paths on initial overview mount | Skip first tab effect | One code path on initial overview mount | Source audit; authenticated network capture unavailable |
| Admin CRM modals | Statically imported and always mounted | Dynamic imports and conditional mount | Separate emitted chunks; requested when opened | Source audit; build pass |
| First Load JS | No valid baseline from failed first build | Optimizations above | 87.4 kB shared; homepage 25.9 KiB raw route chunk | After only; no reduction claim |
| LCP, INP, CLS, FCP, TBT, TTFB | No Phase 6 measurement provided | No measurement change claimed | Not measured | No claim |

## 13. Functional testing

`npm run typecheck` passed. `npm test` passed: 20 test files, 126 tests. The final `npm run build` passed, with Firestore timeout fallbacks and existing hook dependency lint warnings. The built site was opened locally: homepage, all ten specified public routes, package detail, hotel detail, and admin login rendered with headings and without captured browser console errors. The homepage mobile menu opened and closed with route links present. The Hero section, frame counter, filters, enquiry form, footer, and chat control were present; desktop and 390-pixel mobile Hero screenshots were inspected. The final built homepage showed package card headings and accessible labels using the server `name` field, with no `undefined` labels. With a signed-in session and Firestore reachable outside the network sandbox, the dashboard loaded live counts and records; Enquiries, Packages, Hotels, Vehicles, Gallery, Content, Chat Knowledge, Image Library, Social Links, SEO, and Settings sections rendered. Enquiry Detail, Email Composer, and Audit Log modals opened; no email was sent or live record mutated. CRUD domain and API behavior has existing automated coverage, but a live create/edit/delete was not performed. Lighthouse and Web Vitals were not measured.

## 14. Responsive testing

The built homepage and authenticated admin dashboard were checked at 320, 375, 390, 414, 430, 768, 1024, 1280, 1440, and 1920 pixels. At each width, `document.documentElement.scrollWidth` equaled `clientWidth`. On the homepage, Hero, navbar, and enquiry form elements were present; the mobile menu opened and closed at 390 pixels. Admin login was also checked at 320, 390, 768, 1280, and 1920 pixels with no document overflow. This is an overflow and DOM-presence check, not a pixel-by-pixel visual comparison.

## 15. Security verification

Server entrypoints for Firebase Admin, Google Sheets, Gemini, Cloudinary upload/delete, and repositories carry `server-only`. Source inspection found no server SDK imports in client components. The emitted `.next/static` JavaScript scan found zero files containing `firebase-admin`, `@google/generative-ai`, `ADMIN_ACCESS_TOKEN`, `RESEND_API_KEY`, `GEMINI_API_KEY`, `GOOGLE_SERVICE_ACCOUNT`, or `CLOUDINARY_API_SECRET`. One file contains `googleapis` only as part of Next.js's `https://fonts.googleapis.com/` URL; it is not the Google Sheets SDK. This marker scan is not a complete secret audit of every possible credential value.

## 16. Remaining bottlenecks and limits

The Hero necessarily loads and renders a 100-frame sequence. The admin dashboard remains a large client component and fetches all five core collections on mount. Several public interactive sections hydrate static markup alongside their controls. Firestore timeouts during sandboxed static generation prevent reliable build time comparisons. No Phase 6 bundle or Lighthouse baseline was provided, so numerical improvement cannot be claimed. Live CRUD mutation, email dispatch, and enquiry submission were not run against the connected production data.
