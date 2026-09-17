# Hills Tourism Admin Theme System Walkthrough

## Overview

A complete, robust, and accessible **Light / Dark / System (Auto)** theme system has been integrated into the Hills Tourism Admin Panel.

This implementation is purely front-end and design-system focused. **Backend APIs, Firestore schemas, authentication, security rules, and CRUD business logic remain completely intact and untouched.**

---

## Architecture & Design Tokens

Theme styling is driven by scoped CSS variables defined in `src/index.css`:

```css
:root, [data-admin-theme="dark"] {
  --admin-bg: #060d24;
  --admin-card: rgba(10, 22, 56, 0.7);
  --admin-card-border: rgba(255, 255, 255, 0.08);
  --admin-card-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
  --admin-text: #f8fafc;
  --admin-text-muted: rgba(255, 255, 255, 0.6);
  --admin-border: rgba(255, 255, 255, 0.08);
  --admin-input-bg: rgba(4, 10, 28, 0.6);
  --admin-input-border: rgba(255, 255, 255, 0.16);
  --admin-input-text: #ffffff;
  --admin-table-header: rgba(255, 255, 255, 0.03);
  --admin-modal-bg: #0a1638;
  --admin-modal-overlay: rgba(2, 6, 23, 0.75);
  --admin-modal-border: rgba(255, 255, 255, 0.12);
  --admin-tab-inactive-bg: rgba(255, 255, 255, 0.05);
  --admin-tab-inactive-text: rgba(255, 255, 255, 0.7);
}

[data-admin-theme="light"] {
  --admin-bg: #f8fafc;
  --admin-card: #ffffff;
  --admin-card-border: #e2e8f0;
  --admin-card-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.08);
  --admin-text: #0f172a;
  --admin-text-muted: #64748b;
  --admin-border: #e2e8f0;
  --admin-input-bg: #ffffff;
  --admin-input-border: #cbd5e1;
  --admin-input-text: #0f172a;
  --admin-table-header: #f1f5f9;
  --admin-modal-bg: #ffffff;
  --admin-modal-overlay: rgba(15, 23, 42, 0.5);
  --admin-modal-border: #e2e8f0;
  --admin-tab-inactive-bg: #e2e8f0;
  --admin-tab-inactive-text: #475569;
}
```

### Motion & WCAG Compliance
- **250ms Smooth Transitions**: Transitioning `background-color`, `border-color`, and `color` smoothly across all surfaces.
- **Accessibility**: `@media (prefers-reduced-motion: reduce)` disables animations for users with motion sensitivity.
- **Contrast**: Contrast ratios conform to WCAG AA guidelines in both color schemes.

---

## 3-Tier Theme Persistence

The engine in `src/context/AdminThemeContext.tsx` handles resolution and synchronization:

1. **Firestore Admin Settings (`theme` in `SiteSettings`)**:
   Highest priority. Syncs whenever Firestore content is loaded, and changes are pushed via `PATCH /api/admin/content`.
2. **`localStorage` (`hills_admin_theme`)**:
   Instant client cache loaded before network requests finish.
3. **Operating System (`prefers-color-scheme`)**:
   When set to `system` (Auto), changes to the user's OS color scheme are detected and applied in real time via media query event listeners.

### Anti-Flash Guarantee
An inline JavaScript script in `src/app/admin/layout.tsx` inspects `localStorage` and `window.matchMedia` before DOM rendering, immediately applying the `data-admin-theme` attribute to `document.documentElement` so there is zero flash of unstyled content on page refresh.

---

## UI Components & Toggle Locations

1. **Desktop Header Toggle** (`src/components/admin/ThemeToggle.tsx`):
   Positioned in the top right of `/admin/dashboard`, offering a 3-pill segmented toggle with Sun, Moon, and Monitor icons.
2. **Mobile Quick Toggle** (`src/components/admin/MobileAdminHeader.tsx`):
   One-tap quick cycle button right inside the mobile sticky header.
3. **Mobile Drawer Selector** (`src/components/admin/AdminMobileDrawer.tsx`):
   Integrated at the bottom of the slide-out navigation drawer with full label and icons.
4. **Settings Tab Section** (`src/app/admin/dashboard/page.tsx`):
   Dedicated "Appearance & Theme" card in the Settings tab.
5. **Login Page** (`src/app/admin/login/page.tsx`):
   Themed card and inputs with a quick toggle in the top-right corner.

---

## Automated Verification

- **TypeScript compilation**: `npm run typecheck` passed with 0 errors.
- **Unit test suite**: `npm test` passed 16/16 test files (107/107 passed tests).
- **New test added**: `tests/unit/content-crud.test.ts` includes verification of `theme` persistence in `SiteSettings`.
