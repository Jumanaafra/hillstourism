# Hills Tourism --- Production Readiness SDD

**File:** `production.md`\
**Purpose:** Production-readiness specification for Privacy Policy,
Terms & Conditions, XML sitemap, robots configuration, SEO, indexing,
and final pre-launch validation.

## 1. Objective

Prepare the existing Hills Tourism website for production launch without
redesigning the approved UI/UX.

This specification covers:

-   Privacy Policy
-   Terms & Conditions
-   XML sitemap
-   Robots configuration
-   Technical SEO
-   Dynamic SEO for packages, hotels, vehicles and other indexable
    content
-   Canonical URLs
-   Open Graph metadata
-   Structured data
-   Search-engine indexing controls
-   404 handling
-   SEO-safe routing
-   Production environment configuration
-   Final production validation

Existing `spec.md` and `CloudinaryIntegration.md` remain authoritative
for their respective application architecture and Cloudinary
requirements.

## 2. Non-Goals

Do not:

-   redesign the website;
-   change the approved UI/UX;
-   replace the existing navigation design;
-   modify the existing Hero animation;
-   introduce payment functionality;
-   introduce booking/transaction functionality;
-   replace the existing database architecture;
-   replace the existing Cloudinary architecture;
-   create duplicate CMS systems.

Only make UI additions required for legal pages, SEO, and production
readiness.

## 3. Architecture Compatibility

Before implementation, inspect:

-   `spec.md`
-   `CloudinaryIntegration.md`
-   existing routing
-   existing Admin architecture
-   Firestore/content models
-   Cloudinary integration
-   existing metadata
-   existing sitemap/robots implementation
-   all public pages
-   dynamic package/hotel/vehicle routes

Reuse existing patterns. Do not create competing implementations.

# 4. Privacy Policy

Create a public route:

`/privacy-policy`

The page must explain how Hills Tourism handles information collected
through the actual website.

Cover, where applicable:

### Information collected

-   name
-   email
-   phone
-   travel/enquiry information
-   selected package
-   selected hotel
-   selected vehicle
-   message submitted through forms
-   technical/analytics information actually collected

### How information is used

-   responding to enquiries
-   communicating with customers
-   managing tourism enquiries
-   improving the website
-   analytics/performance
-   security and abuse prevention

### Storage and third parties

Document only services actually used by the application, such as:

-   application database
-   email provider
-   Google Sheets
-   Cloudinary
-   analytics
-   Gemini/AI service

Never expose credentials or internal secrets.

### Cookies and analytics

Describe only technologies actually implemented.

### Retention and user rights

Provide business/legal-approved wording for retention and applicable
user rights. Do not invent binding retention periods.

### Contact

Use the actual Hills Tourism contact configuration. Never invent contact
details.

# 5. Terms & Conditions

Create:

`/terms-and-conditions`

The terms must accurately describe the existing enquiry-based tourism
service.

Cover:

-   service description
-   enquiry process
-   package information
-   hotel selection
-   vehicle selection
-   pricing behaviour actually supported
-   user responsibilities
-   acceptable use
-   intellectual property
-   external services
-   appropriate limitation-of-liability language
-   changes to terms
-   contact information

Important:

The platform is enquiry-based. Do not describe an enquiry as an
automatic booking, reservation or payment.

Do not invent:

-   refund policies
-   payment terms
-   legal entity details
-   jurisdiction
-   governing law
-   registration numbers
-   addresses
-   phone numbers
-   regulatory claims

Missing legal/business information must remain configurable and be
reviewed by the business/legal advisor before publication.

# 6. Footer Legal Links

Add to the existing footer:

-   Privacy Policy
-   Terms & Conditions

Do not redesign the footer.

Verify links from desktop and mobile.

# 7. XML Sitemap

Implement a production XML sitemap using the existing framework's native
mechanism where appropriate.

Include actual public indexable routes, for example:

-   `/`
-   `/packages`
-   `/packages/[slug]`
-   `/hotels`
-   `/hotels/[slug]`
-   `/vehicles`
-   `/vehicles/[slug]`
-   `/about`
-   `/contact`
-   `/privacy-policy`
-   `/terms-and-conditions`

Use actual routes in the project.

Exclude:

-   `/admin`
-   `/api/*`
-   authentication routes
-   private routes
-   preview/debug/test routes
-   non-indexable content

## Dynamic sitemap

Generate dynamic entries from the actual content source.

For packages, hotels, vehicles and other indexable content:

`Database → active public records → valid slugs → sitemap`

Exclude deleted, archived, inactive and invalid records.

Do not hard-code dynamic URLs.

Use real `lastModified` timestamps where supported. Do not fabricate
dates or SEO priority/change-frequency values.

# 8. Robots Configuration

Implement production robots configuration.

Allow public pages.

Disallow private/utility paths such as:

-   `/admin`
-   `/api`

and other non-public paths that actually exist.

Do not accidentally block the public site.

Reference the configured production sitemap URL.

# 9. Production Site URL

Use one canonical production base URL configuration.

Example:

`NEXT_PUBLIC_SITE_URL=https://<production-domain>`

Use the actual production domain during deployment.

Do not scatter hard-coded domains throughout the codebase.

# 10. Global SEO Metadata

Every indexable public page should have appropriate:

-   title
-   description
-   canonical URL
-   Open Graph metadata
-   social metadata where supported

Do not use one generic title for every page.

# 11. Homepage SEO

Create concise, human-readable metadata describing:

-   Hills Tourism
-   hill/mountain tourism
-   actual destinations/services offered

Do not keyword-stuff.

# 12. Dynamic Package SEO

For `/packages/[slug]`, generate metadata from the package record:

`Package → title → description → canonical → Open Graph`

Do not hard-code one title for all packages.

# 13. Dynamic Hotel SEO

Generate unique metadata from actual hotel data:

-   hotel name
-   location
-   description

Do not fabricate ratings, reviews or availability.

# 14. Vehicle SEO

If vehicle detail pages are public and indexable, generate metadata from
actual vehicle records.

If they are intentionally non-indexable, configure that explicitly and
exclude them from the sitemap.

# 15. Canonical URLs

Every indexable public page must have one canonical URL using:

-   production domain
-   correct route
-   correct slug
-   no unnecessary query parameters

Avoid multiple canonical URLs for the same content.

# 16. Query Parameters

Audit filter URLs such as:

`/packages?category=family`

Do not allow every filter combination to become a separate indexable
page unless intentionally designed for SEO.

Use canonical/noindex behaviour appropriate to the existing routing.

# 17. Structured Data

Audit and implement only truthful structured data appropriate to the
actual content.

Potential types include:

-   Organization
-   WebSite
-   BreadcrumbList
-   appropriate business type
-   TouristAttraction where genuinely applicable
-   FAQPage only when actual visible FAQs exist

Never fabricate:

-   ratings
-   reviews
-   prices
-   availability
-   awards
-   business claims

Structured data must match visible content.

# 18. Breadcrumbs

Where appropriate, provide SEO-friendly breadcrumbs for dynamic pages.

Example:

`Home > Packages > Munnar Package`

Reuse the existing design system if breadcrumbs already exist. Do not
redesign the site to add them.

# 19. Heading Structure

Audit public pages for semantic heading hierarchy:

`H1 → H2 → H3`

Ensure one clear primary H1 where appropriate.

Fix semantic HTML without changing visual appearance.

# 20. Image SEO

All meaningful public images should have useful alt text.

Cloudinary-managed images should preserve/use stored metadata where
available.

Avoid generic alt text such as:

-   image
-   photo
-   img123

Do not keyword-stuff alt text.

# 21. Social Sharing

Verify Open Graph data for important public pages:

-   `og:title`
-   `og:description`
-   `og:image`
-   `og:url`

Use appropriate Cloudinary images.

Do not reference missing images.

# 22. Favicon and Site Identity

Audit:

-   favicon
-   site icon
-   manifest
-   browser metadata

Use existing Hills Tourism branding.

# 23. 404 Page

Verify a proper public 404 page.

It must:

-   show a clear message
-   provide useful navigation
-   preserve Hills Tourism visual language
-   not expose internal errors

# 24. Private/Utility Indexing

Audit:

-   Admin
-   authentication
-   dashboards
-   API routes
-   preview pages
-   debug/test pages

Use appropriate noindex/routing controls.

Do not apply noindex globally.

# 25. SEO-Friendly Routing

Audit public routes.

Prefer readable URLs such as:

-   `/packages/munnar-kolukkumalai`
-   `/hotels/mountain-view-resort`

Use stable, unique, URL-safe slugs.

# 26. Slug Safety

For every dynamic content type, verify:

-   slug uniqueness
-   valid characters
-   missing slug handling
-   deleted content handling
-   inactive content handling

Do not allow duplicate public URLs.

# 27. Indexability Rules

Useful, unique, public content should be indexable.

Private, duplicate, utility or low-value pages should not be indexable.

Do not accidentally block important public content.

# 28. Admin SEO Integration

Where existing CMS architecture supports SEO fields, Admin should be
able to manage:

-   SEO title
-   SEO description
-   canonical URL where appropriate
-   Open Graph image

Flow:

`Admin → Firestore → revalidation → dynamic metadata → public page`

Do not create a separate CMS.

# 29. Cache / Revalidation

When SEO-managed content changes:

-   revalidate the relevant public page;
-   ensure updated metadata becomes visible;
-   ensure sitemap reflects applicable changes.

Prefer targeted revalidation over unnecessary full-site rebuilds.

# 30. Production Environment

Verify required production environment variables for the existing
application, including where applicable:

-   production site URL
-   Firebase
-   Cloudinary
-   email
-   Google Sheets
-   Gemini
-   Admin/authentication
-   analytics

Never expose private secrets.

Never commit `.env.local`.

Keep `.env.example` placeholders only.

# 31. Search Engine Verification Readiness

Prepare the production website for:

-   Google Search Console
-   Bing Webmaster Tools or equivalent

Do not claim verification has occurred unless it actually has.

# 32. Performance and SEO

Before launch verify:

-   Cloudinary images are optimized
-   unnecessary client-side rendering is avoided
-   public content is server-rendered where appropriate
-   blocking scripts are minimized
-   layout shifts are minimized

Preserve the existing UI.

# 33. Accessibility and SEO

Review:

-   heading hierarchy
-   links
-   buttons
-   labels
-   alt text
-   keyboard navigation
-   focus states

Do not redesign the interface.

# 34. Production Domain Consistency

Search the codebase for:

-   `localhost`
-   `127.0.0.1`
-   temporary preview domains
-   development URLs

Production SEO metadata, sitemap, robots, canonical URLs and structured
data must use the configured production domain.

# 35. Duplicate Content Audit

Check for duplicates caused by:

-   trailing slashes
-   case differences
-   query parameters
-   duplicate slugs
-   route aliases

Use redirects/canonicalization where required.

# 36. Final Production Checklist

## Legal

-   [ ] Privacy Policy route exists
-   [ ] Terms & Conditions route exists
-   [ ] Content reflects the actual application
-   [ ] No fabricated legal/business details
-   [ ] Footer links work
-   [ ] Legal content reviewed/approved before launch

## Sitemap

-   [ ] XML sitemap works
-   [ ] Static public routes included
-   [ ] Dynamic public routes included
-   [ ] Active content only
-   [ ] Private routes excluded
-   [ ] Real modification timestamps used where applicable

## Robots

-   [ ] Public pages crawlable
-   [ ] Admin/API protected from crawling/indexing as appropriate
-   [ ] Sitemap referenced

## SEO

-   [ ] Global metadata
-   [ ] Homepage metadata
-   [ ] Dynamic package metadata
-   [ ] Dynamic hotel metadata
-   [ ] Vehicle indexability intentionally configured
-   [ ] Canonical URLs
-   [ ] Open Graph
-   [ ] Structured data
-   [ ] Breadcrumbs where applicable
-   [ ] Heading hierarchy
-   [ ] Image alt text
-   [ ] Unique slugs
-   [ ] Query parameter handling
-   [ ] 404
-   [ ] Private route noindex handling

## Production

-   [ ] Production URL configured
-   [ ] HTTPS ready
-   [ ] No localhost production SEO URLs
-   [ ] Secrets protected
-   [ ] Cloudinary working
-   [ ] Existing integrations working
-   [ ] Admin working
-   [ ] Mobile verified
-   [ ] Desktop verified
-   [ ] Build passes
-   [ ] Typecheck passes
-   [ ] Lint passes
-   [ ] Tests pass

# 37. Final Validation

Run:

``` bash
npm run lint
npm run typecheck
npm run build
```

and the existing test suite.

Manually verify:

-   Homepage
-   Packages
-   Package detail
-   Hotels
-   Hotel detail
-   Vehicles
-   Vehicle detail
-   About
-   Contact
-   Privacy Policy
-   Terms & Conditions
-   404
-   Admin

Verify desktop, tablet and mobile.

Inspect representative rendered HTML for:

-   `<title>`
-   meta description
-   canonical
-   Open Graph
-   robots directives
-   JSON-LD
-   H1
-   image alt attributes

Verify the sitemap returns valid XML and robots references the correct
sitemap.

# 38. Implementation Rules

1.  Read this entire `production.md`.
2.  Inspect the existing codebase before modifying anything.
3.  Compare current implementation with this specification.
4.  Classify requirements as COMPLETE, PARTIAL, MISSING or BROKEN.
5.  Implement missing requirements.
6.  Fix broken requirements.
7.  Preserve existing UI/UX.
8.  Reuse existing architecture.
9.  Do not create duplicate systems.
10. Do not fabricate legal/business information.
11. Do not expose secrets.
12. Test every major requirement.
13. Run lint, typecheck, tests and production build.
14. Fix critical failures before completion.

# 39. Production Launch Gate

The application is production-ready only after:

``` text
Application
    ↓
Build passes
    ↓
Routes work
    ↓
Privacy Policy works
    ↓
Terms & Conditions works
    ↓
XML sitemap works
    ↓
Robots works
    ↓
SEO metadata works
    ↓
Dynamic SEO works
    ↓
Cloudinary images work
    ↓
Admin content works
    ↓
Security checks pass
    ↓
Mobile/Desktop checks pass
    ↓
Production launch
```

## Final Rule

**Do not redesign Hills Tourism. Make the existing product
production-ready.**

The final system must provide:

`Existing Hills Tourism Website + Legal Pages + XML Sitemap + Robots + Technical SEO + Dynamic SEO + Structured Data + Production Domain Configuration + Final Production Validation`
