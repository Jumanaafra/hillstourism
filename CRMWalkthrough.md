# Phase 6.3 CRM Walkthrough — Hills Tourism Admin CRM

## Executive Overview
Phase 6.3 elevates the Hills Tourism Admin Dashboard into a complete, enterprise-grade **Customer Relationship Management (CRM)** platform. Built without altering existing enquiry storage schemas or breaking legacy integrations, Phase 6.3 introduces deep customer email communication, automated and batch Google Sheets synchronization, rich activity analytics, internal note collaboration, and a transparent audit trail.

---

## Architecture & Component Breakdown

```
src/
├── app/
│   ├── admin/dashboard/page.tsx          # CRM Activity Health, Batch Sync Center, Quick Email Triggers
│   └── api/
│       ├── enquiries/route.ts            # Extended PATCH for 9 pipeline stages + audit + timeline
│       └── admin/crm/
│           ├── email/route.ts            # Resend dispatch API with rate limiting & validation
│           ├── sheets/route.ts           # Single & batch Google Sheets sync endpoint
│           ├── notes/route.ts            # CRUD for internal admin notes
│           └── audit/route.ts            # Query audit trail events
├── components/admin/
│   ├── EmailComposerModal.tsx           # Dynamic variable interpolation, 5 CRM templates, live editing
│   ├── SheetsSyncCenter.tsx             # Health stats, single/batch sync, row number display
│   ├── EnquiryTimeline.tsx              # Chronological vertical card timeline of enquiry lifecycle
│   ├── InternalNotes.tsx                # Admin collaboration notes (add, edit, delete, timestamp)
│   ├── AuditLogModal.tsx                # Filterable administrative audit trail modal
│   ├── EnquiryDetailModal.tsx           # Upgraded CRM detail hub with quick action bar & sync triggers
│   └── MobileEnquiryCard.tsx            # Extended with all 9 statuses, direct call/WA/email buttons
├── lib/
│   ├── repositories/
│   │   ├── enquiries.repo.ts            # Timeline events, notes CRUD, and status workflows
│   │   └── audit.repo.repo.ts           # Firestore / Memory fallback audit logging
│   └── services/
│       ├── crm-email.service.ts         # Resend integration, rate limit (10/min), HTML templates
│       └── sheets.service.ts            # Google Sheets append/sync, row extraction & batch sync
└── types/
    └── domain.ts                        # Extended EnquiryStatus, EnquiryNote, Timeline, AuditLogEntry
```

---

## Part A — Customer Email Center
* **Direct Communication**: Admin can trigger the Email Composer directly from any enquiry row in the desktop table, mobile card, or enquiry detail modal.
* **5 Standardized Templates**:
  1. **Booking Confirmation**: Confirms booking with package, stay, vehicle, date, and reference ID.
  2. **Package Details**: Tailor-made tour overview with package perks and highlights.
  3. **Quotation**: Itemized quotation with breakdown, inclusion checklist, and validity terms.
  4. **Travel Reminder**: Checklist and departure preparation reminder sent prior to trip dates.
  5. **Custom Message**: Freeform custom communication with branded header and footer.
* **Dynamic Variable Interpolation**: Automatically interpolates `{{customer_name}}`, `{{package}}`, `{{hotel}}`, `{{vehicle}}`, `{{travel_date}}`, `{{guests}}`, and `{{enquiry_id}}`.
* **Security & Rate Limiting**:
  - Validates recipient email syntax with strict RFC-compliant regex.
  - Sliding-window rate limit enforces a maximum of 10 customer emails per minute per admin account.
  - Generates full audit log and appends `email_sent` or `email_failed` to the enquiry's timeline.

---

## Part B — Google Sheets Synchronization
* **Single Enquiry Manual Sync**:
  - Dedicated "Sync Now" button inside Enquiry Details and sync status indicator.
  - Updates status badge (`Synced`, `Pending`, or `Failed`), captures the Google Sheets row number (e.g. `Row #42`), and logs the sync timestamp.
* **Batch Sync Operations**:
  - Mounted directly atop the Enquiries Tab via `<SheetsSyncCenter />`.
  - **Sync All Pending**: Queries all enquiries with `sheetsStatus !== 'synced'` and appends them in sequence.
  - **Retry Failed**: Targets only enquiries marked `failed` to resolve transient timeouts or credential glitches.
  - Live progress display with real-time success/failure counts.

---

## Part C — Visual Chronological Timeline
* **Interactive Vertical Card Timeline**:
  - Displays every lifecycle event for an enquiry in strict reverse-chronological order.
  - Distinct icons and color coding for each event type:
    - 📥 `created`: Lead receipt.
    - 🔄 `status_change`: Stage updates (e.g., from *New* to *Quotation Sent*).
    - ✉️ `email_sent` / ❌ `email_failed`: Customer email dispatch and subject.
    - 📊 `sheets_synced` / ⚠️ `sheets_failed`: Google Sheets reporting sync and row number.
    - 📝 `note_added`: Internal team collaboration notes.

---

## Part D — Internal Admin Notes
* **Team Collaboration**:
  - Admin team members can add private notes to any enquiry (e.g. "Customer requested pure vegetarian food and early check-in").
  - Displays author email/name and ISO timestamp.
  - Fully editable and deletable by administrators with inline controls.
  - Recorded in the enquiry timeline and audit log.

---

## Part E — 9-Stage CRM Status Pipeline
* **Pipeline Statuses**:
  1. `new` (New Lead — vibrant green)
  2. `contacted` (Contacted — warm amber)
  3. `quotation_sent` (Quotation Sent — purple)
  4. `confirmed` (Confirmed — emerald)
  5. `payment_pending` (Payment Pending — orange)
  6. `booked` (Booked — mountain blue)
  7. `completed` (Completed — teal)
  8. `cancelled` (Cancelled — rose red)
  9. `spam` (Spam / Archived — slate muted)
  * Legacy backward compatibility preserved for `in_progress` and `closed`.
* **Interactive Dropdowns**: Available on desktop table, mobile card, and modal header.
* **Filter Pills**: One-touch filtering across all 9 statuses with live counter badges.

---

## Part F — Operations & Activity Health Dashboard
Mounted in the Overview Tab with 7 live CRM activity metrics:
1. **Today's Enquiries**: Total leads generated during the current calendar date.
2. **Pending Emails**: Enquiries with email dispatch pending.
3. **Failed Syncs**: Critical alerts for failed Google Sheets rows.
4. **Booked Trips**: Total confirmed and booked mountain journeys.
5. **Cancelled Trips**: Churn monitoring.
6. **Email Success Rate**: Percentage calculation (`sent / (sent + failed) * 100`).
7. **Sheets Sync Rate**: Percentage calculation (`synced / (synced + failed) * 100`).

---

## Part G — Administrative Audit Trail
* **Audit Event Persistence**: Every key CRM action writes an immutable record to Firestore collection `crm_audit_logs` (with memory fallback).
* **Tracked Operations**:
  - `email_sent`
  - `sheet_sync` & `batch_sync`
  - `status_change`
  - `note_added`, `note_updated`, `note_deleted`
  - `enquiry_deleted`
* **Audit Modal**: Accessible via the "Audit Log" button in the dashboard header. Features search, action-type filtering, timestamp viewing, and expandable metadata payloads.

---

## Part H — Security & Zero-Downtime Guarantee
* **Admin Authentication**: All `/api/admin/crm/*` endpoints verify admin tokens and reject unauthorized access.
* **Resilience**: In test or staging environments without live Resend or Google Cloud credentials, all CRM services cleanly simulate responses, allowing complete UI and API verification without external network dependencies.
* **Non-Destructive Schema**: Existing enquiry properties remain intact. New fields are purely additive with defensive fallbacks.
