# Build Prompt — Dhanashree Crop Solutions Field Force Management Application (FFMA)

You are building a production-ready web and mobile application for a real client. All the information you need is in the context files listed below. Read every file completely before writing any code. The documents are authoritative — do not invent requirements, do not skip details, do not add anything not listed.

---

## Context files and what each one is

**`Pre-Development Framework Analysis.md`**
The raw business requirement document. Start here to understand the client's problem, who the users are, what the current process looks like, and what pain points the app solves. This is your "why". It explains how 60 agronomists serving ~50,000 farmers across rural Maharashtra currently operate through disconnected paper registers, personal Excel sheets, and WhatsApp chats — and how the FFMA replaces that chaos with a single, structured field force management system. It also contains the resolved answers to all identified gaps and assumptions — treat these answers as binding constraints alongside the rest of the document.

**`FFMA_Product_Specification_v1_0.md`**
The complete product specification. This is your primary build reference. It contains:
- The full RBAC permissions matrix for all five roles (Field Staff, Territory Manager, Zonal Manager, System Administrator, Marketing/Content Team)
- The complete data architecture with every entity and field (Farmer Master, Plot, CropSeason, CropMaster, ActivityLog, Recommendation, BulkSendBatch, PromotionLibrary, Territory, AuditLog, SalesPerson)
- All primary workflows with step-by-step detail (visit logging, crop stage tracking, bulk message send with RM approval, farmer data deletion request)
- All business rules (OTP auth, JWT expiry, account lockout, offline sync idempotency, immutable audit log, overdue visit norms, bulk import merge rules, farmer status lifecycle)
- The complete feature list split into MVP / Phase 2 / Implied
- All automations and notification triggers

Every decision you make must be consistent with this document.

**`tech_stack.md`**
The technology decisions for this project with the full reasoning behind each choice. Use exactly the stack described here — do not substitute alternatives. The stack is:

| Layer | Technology | Provider |
|---|---|---|
| Mobile App | React Native (Expo) | EAS Build |
| Web Frontend | React + Vite + Tailwind CSS | Cloudflare Pages |
| Backend API | Django + Django REST Framework | Render (ap-south-1) |
| Background Jobs | Celery + Redis | Render + Render Redis |
| Database | PostgreSQL + PostGIS | Supabase (Mumbai, ap-south-1) |
| Auth | Custom OTP + JWT | MSG91 + djangorestframework-simplejwt |
| File Storage | Cloudinary | Cloudinary |
| WhatsApp | Business API | Interakt (BSP) |
| SMS | Bulk + OTP | MSG91 |
| Push Notifications | FCM via Expo Push | Firebase (free tier) |
| Email | Transactional | Resend |

The rationale behind each choice is documented (e.g., why React Native over Flutter, why Django over FastAPI, why Supabase over Neon, why Render over Railway, why a DRF monolith over microservices). Respect those constraints — do not substitute alternatives.

**`design_brief.md`**
The visual and UX design specification. It defines:
- **Personality:** Grounded, purposeful — Linear.app's information density mapped onto the warmth of a well-worn field notebook
- **Fonts:** Sora SemiBold (headings), DM Sans Regular (body), JetBrains Mono Regular (GPS coords, crop stage codes, IDs)
- **Exact color palette with CSS variable names:**
  - `--color-bg: #F7F4EE` — warm off-white, evokes sunlit paper
  - `--color-surface: #FFFFFF` — clean card surfaces
  - `--color-border: #DDD8CE` — warm stone dividers
  - `--color-text: #1E1C18` — near-black with warmth
  - `--color-text-muted: #6B6658` — earthy secondary text
  - `--color-primary: #2B7A3B` — deep agricultural green (brand anchor)
  - `--color-accent: #D4620A` — burnt orange — high-contrast CTAs, alerts, overdue badges
  - `--color-success: #2A7A48` — forest green confirmations
  - `--color-warning: #B87D0C` — harvest amber
  - `--color-danger: #C0341D` — terracotta red
- **Background:** Warm off-white base (#F7F4EE) with a subtle 40px diagonal fine-grain hatching in #EDE9E0 at 6% opacity — evokes field notebook paper without being decorative
- **Motion:** Page load cards stagger in with 60ms delay increments at translateY(8px)→0 + opacity 0→1 over 200ms; visit-log submit button compresses to scale(0.96) on tap with 80ms spring return; overdue badge pulses once on first load
- **Layout:** High information density with generous vertical rhythm; farmer cards use compact 56px-tall list-row pattern on mobile expanding to detail panels on tap; tables preferred over cards for manager dashboards; minimum 48×48dp tap targets throughout
- **Avoid:** Tailwind green-500 (#22c55e — too bright, no agricultural weight); loading spinners on every action (use optimistic UI — this is a field tool); hero illustrations of smiling farmers (patronising and irrelevant to a professional operations tool)

Apply the CSS variables exactly as specified to every screen that has a UI.

**`modules.md`**
The build plan broken into 17 modules with a strict execution order. Follow this order exactly:

```
1 → 2 → 3 → 4 → 7 → 5 → 6 → 8 → 15 → 12 → 11 → 10 → 9 → 13 → 14 → 16 → 17
```

Which maps to:
1. Module 1 — Database Schema & Migrations
2. Module 2 — OTP Authentication & Session Management
3. Module 3 — RBAC & User Management
4. Module 4 — Territory Hierarchy Management
5. Module 7 — Crop Master Configuration
6. Module 5 — Farmer Master & Bulk Import
7. Module 6 — Plot & Crop Stage Tracking
8. Module 8 — Visit & Call Logging (Offline-First)
9. Module 15 — Audit Log & Farmer Data Deletion Workflow
10. Module 12 — Promotion Library & Content Management
11. Module 11 — Recommendations Engine
12. Module 10 — Overdue Alerts & Stage Transition Reminders
13. Module 9 — Smart Visit Planner
14. Module 13 — Bulk Message Send & Approval Workflow
15. Module 14 — Management Dashboards & Reports
16. Module 16 — Field Staff Home Dashboard & Farmer Profile Shell
17. Module 17 — Admin Web Interface Shell & Configuration Screens

Each module specifies its complexity, the exact technologies to use, its inputs and outputs, which other modules it depends on, whether it contains automations, whether it has a UI, and what manual setup is required before it can go live.

---

## Resolved gaps and assumptions (binding constraints)

The following decisions resolve ambiguities identified during the pre-development analysis. Treat these as authoritative requirements alongside the product specification:

- **Hindi language:** Phase 2 only. Phase 1 ships English and Marathi.
- **iOS support:** Not required for Phase 1. Android only.
- **Push notification provider:** Expo Push Notification Service → FCM (Android). Where notifications are disabled on a device, do not push — surface the alert in the in-app notification centre on the home dashboard instead.
- **Smart Visit Planner GPS logic:** Proximity is calculated from the staff member's current live GPS location, falling back to their last known location if live location is unavailable. The planner must include filter controls for crop, distance radius, and village to allow the staff member to refine the plan.
- **Recommendation approval:** No approval workflow required for individual product recommendations. Approval (by Regional Manager) is only triggered for bulk message sends.
- **Bulk group definition:** Bulk recipient groups are defined by the sender using filter criteria — crop, crop stage, village, or all farmers in the sender's assigned list. All bulk sends (by Field Staff or Territory Manager) require Regional Manager review and approval before dispatch. Zonal Managers self-approve after previewing the recipient count.
- **Marketing/Content Team permissions:** Read-only access to the entire farmer list. Full read, write, and delete access to all content library data (promotion items, templates, tags).
- **Call logging:** Log only the fact that a call was made and its date and time. Do not log call duration, direction, or any other metadata.
- **Farmer photo:** Optional field. Apply standard mobile application image size and compression norms.
- **DLT registration:** Dhanashree already has DLT registration and a registered sender ID with TRAI. Use MSG91 with the existing registration.
- **Crop Master data:** 15 crops with full stage data are ready and must be pre-loaded at go-live. Confirm inter-stage durations with the Dhanashree agronomy team before seeding.
- **Farmer data:** Clean farmer data exists in Excel format with staff mobile number used as the Staff ID. The import pipeline must clean duplicates against mobile number as the merge key.
- **Product catalogue:** Exists and must be integrated into the Recommendations Engine before go-live.
- **Web app technology stack:** React + Vite as specified in `tech_stack.md`. Further technology decisions will be provided in subsequent conversations — build to the spec in `tech_stack.md` as the current authoritative reference.
- **Notification opt-out:** If a farmer has opted out of WhatsApp or SMS communications for any reason, exclude them from all sends — do not dispatch the message. Alert the sending staff member and the Admin of the opt-out exclusion.
- **Data deletion / right to erasure:** Field Staff can raise a request to the Admin to have a farmer's record disabled. The Admin processes the request by setting the farmer status to Inactive — no hard delete is available to any role. All deletion requests and Admin processing actions are captured in the Audit Log.
- **Budget and timeline:** To be suggested by the development team and submitted for client review. Do not block the build on this — propose a range at the end in `SETUP.md`.

---

## How to approach the build

1. Read all 5 files fully before writing a single line of code.
2. Build modules in the dependency order defined in `modules.md` (1 → 2 → 3 → 4 → 7 → 5 → 6 → 8 → 15 → 12 → 11 → 10 → 9 → 13 → 14 → 16 → 17).
3. For each module, cross-reference `FFMA_Product_Specification_v1_0.md` to ensure every business rule, validation, workflow step, and calculation that touches that module is fully implemented.
4. Apply the design system from `design_brief.md` to every screen that has a UI — use the CSS variables exactly as specified, enforce 48×48dp minimum tap targets throughout, and follow the motion and layout rules without exception.
5. Enforce all RBAC rules at the API layer — not just client-side. Every endpoint must validate the requesting user's role and scope before returning or mutating data.
6. Build the offline-first architecture for the mobile app (Module 8) using expo-sqlite as the local queue with idempotent sync on reconnection via client-side UUID deduplication.
7. At the end, generate a `SETUP.md` file that compiles all `MANUAL SETUP` instructions from every module in `modules.md` into a single ordered deployment checklist for the client, plus a suggested budget and timeline range for client review.

Build the complete application. Do not scaffold, do not leave placeholders, do not defer anything listed as MVP.
