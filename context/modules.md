Order in which these modules should be executed is as follows : (strictly follow this)
**Foundation first, then auth, then data model, then features, then UI shells.**

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


List of modules : 
MODULE 1: Database Schema & Migrations
COMPLEXITY: complex
CONTAINS: n/a
TECH: Django ORM, PostgreSQL + PostGIS (Supabase), django-migrations
INPUT: Product specification entities (Farmer, User, Plot, CropSeason, CropMaster, ActivityLog, Recommendation, BulkSendBatch, PromotionLibrary, Territory, AuditLog)
OUTPUT: Fully migrated schema with indexes, FK constraints, PostGIS geometry columns, immutable log tables, RLS policies on Supabase
DEPENDS ON: none
INTEGRATIONS: Supabase (PostgreSQL + PostGIS)
APPROVALS: no
AUTOMATIONS: no
HAS_UI: no
MANUAL SETUP: Enable PostGIS extension on Supabase; configure RLS policies per role; set Supabase project to ap-south-1 region

MODULE 2: OTP Authentication & Session Management
COMPLEXITY: complex
CONTAINS: n/a
TECH: djangorestframework-simplejwt, MSG91 SMS API, django-anymail + Resend (email fallback), expo-local-authentication (mobile biometric), AsyncStorage (secure token storage)
INPUT: Registered mobile number, OTP code, device push token
OUTPUT: JWT access token (15-min expiry), refresh token (7-day), role-scoped session, device registration record
DEPENDS ON: Module 1
INTEGRATIONS: MSG91 (OTP SMS), Resend (admin email OTP fallback)
APPROVALS: no
AUTOMATIONS: yes — account lock triggered after 5 consecutive OTP failures; auto-logout after 15 min inactivity; admin notified on account lock
HAS_UI: yes
MANUAL SETUP: Register OTP SMS template on MSG91 DLT; configure Resend domain and API key; set JWT secret in environment variables

MODULE 3: Role-Based Access Control (RBAC) & User Management
COMPLEXITY: complex
CONTAINS: n/a
TECH: Django custom permission classes (DRF), Django groups, djangorestframework-simplejwt role claims
INPUT: JWT token with role claim, requested resource + action
OUTPUT: Permit/deny decision enforced at API layer; user account CRUD for admin; remote session invalidation endpoint
DEPENDS ON: Module 1, Module 2
INTEGRATIONS: none
APPROVALS: yes — new staff account creation requires System Administrator action; role assignment only at account creation, cannot be self-modified
AUTOMATIONS: yes — remote session invalidation on admin command for lost/stolen devices
HAS_UI: yes
MANUAL SETUP: none

MODULE 4: Territory Hierarchy Management
COMPLEXITY: complex
CONTAINS: n/a
TECH: Django ORM (self-referential FK on Territory model), DRF nested serializers, recursive tree query (django-mptt or CTE query)
INPUT: Territory name, parent territory ID, assigned manager ID, assigned staff IDs
OUTPUT: Region → Zone → Territory → Staff → Farmer hierarchy; auto-aggregated farmer count per node; full audit log entry on any restructure
DEPENDS ON: Module 1, Module 3
INTEGRATIONS: none
APPROVALS: yes — territory restructuring requires System Administrator confirmation; full audit log generated before commit
AUTOMATIONS: no
HAS_UI: yes
MANUAL SETUP: none

MODULE 5: Farmer Master & Bulk Import
COMPLEXITY: complex
CONTAINS: n/a
TECH: Django ORM, openpyxl + pandas (Excel parse/validate), Celery (async import job), django-import-export, PostGIS (store GPS village centroid for future use)
INPUT: Excel file (name, mobile, village, staff mobile as staff ID); or single farmer form submission
OUTPUT: Validated, deduplicated farmer records; merge-mode update on PrimaryMobile match; error report CSV; assignment confirmation to field staff app within 5 min; full audit log entry
DEPENDS ON: Module 1, Module 3, Module 4
INTEGRATIONS: none
APPROVALS: yes — imports >1,000 records require admin review and acknowledgement of error report before commit
AUTOMATIONS: yes — duplicate mobile number detection on create/import; assignment confirmation notification dispatched on successful import; Celery async job for large imports
HAS_UI: yes
MANUAL SETUP: none

MODULE 6: Plot & Crop Stage Tracking
COMPLEXITY: complex
CONTAINS: n/a
TECH: Django ORM, PostGIS (PointField for plot GPS coordinates), GeoDjango, DRF serializers
INPUT: Plot details (name, area, soil type, irrigation, GPS lat/lng), crop selection from CropMaster, sowing date, stage advance confirmation
OUTPUT: Plot records with GPS coordinates; CropSeason with auto-calculated ExpectedNextStageDate; immutable stage change log entry on advance; updated overdue/reminder schedule
DEPENDS ON: Module 1, Module 5, Module 7
INTEGRATIONS: none
APPROVALS: no — stage advance requires explicit user confirmation prompt (not an approval chain)
AUTOMATIONS: yes — ExpectedNextStageDate recalculated on every stage advance; stage auto-advance proposal surfaced to field staff when date is reached
HAS_UI: yes
MANUAL SETUP: none

MODULE 7: Crop Master Configuration
COMPLEXITY: simple
CONTAINS: Crop CRUD, Variety CRUD, Growth Stage CRUD with sequence + inter-stage days
TECH: Django ORM, DRF ModelViewSet, Django Admin (admin-only interface)
INPUT: Crop name, category, scientific name, varieties, stage name, sequence number, days from previous stage, stage description
OUTPUT: CropMaster reference data consumed by Module 6 and Smart Visit Planner; 15 crops pre-loaded at launch
DEPENDS ON: Module 1, Module 3
INTEGRATIONS: none
APPROVALS: no
AUTOMATIONS: no
HAS_UI: yes
MANUAL SETUP: Pre-load 15 validated crop definitions with stage data before go-live; confirm inter-stage durations with Dhanashree agronomy team

MODULE 8: Visit & Call Logging (Offline-First)
COMPLEXITY: complex
CONTAINS: n/a
TECH: expo-sqlite (offline queue), expo-location (GPS auto-capture), expo-camera (photo capture + compression), expo-file-system, Cloudinary SDK (background photo upload with retry), idempotent sync endpoint (client UUID deduplication), DRF
INPUT: Farmer ID, GPS coordinates (auto), visit purpose, notes, photos; or call date/time only
OUTPUT: Visit log record (date, time, GPS, purpose, notes, photo URLs) or call log record (date, time); DaysSinceLastVisit/Call recalculated at query time; offline records queued and synced within 60 sec on reconnection
DEPENDS ON: Module 1, Module 5, Module 2
INTEGRATIONS: Cloudinary (photo upload)
APPROVALS: no
AUTOMATIONS: yes — offline sync job dispatches all queued records within 60 sec of network restoration; idempotent deduplication on client UUID; Cloudinary background upload with auto-retry on failure
HAS_UI: yes
MANUAL SETUP: none

MODULE 9: Smart Visit Planner
COMPLEXITY: complex
CONTAINS: n/a
TECH: GeoDjango + PostGIS ST_Distance (proximity ranking), Celery beat (daily scheduled refresh), DRF, React Native FlatList with filter controls
INPUT: Field staff ID, current GPS location (live or last known), configured visit frequency norm per farmer segment, filter params (crop, village, distance radius)
OUTPUT: Ranked farmer visit list (overdue days DESC, proximity ASC); filterable by crop, village, distance; refreshed daily at configurable time; displayed on home dashboard
DEPENDS ON: Module 1, Module 6, Module 8, Module 10
INTEGRATIONS: none
APPROVALS: no
AUTOMATIONS: yes — Celery beat job refreshes ranked list every morning at configurable time; fallback to last known GPS if live location unavailable; distance ranking skipped if no location data exists
HAS_UI: yes
MANUAL SETUP: Configure daily planner refresh time in Celery beat schedule

MODULE 10: Overdue Alerts & Stage Transition Reminders
COMPLEXITY: complex
CONTAINS: n/a
TECH: Celery beat (scheduled checks), Expo Push Notification Service → FCM (Android push), django-push-notifications or direct Expo Push API, in-app notification centre (React Native state + API endpoint)
INPUT: DaysSinceLastVisit per farmer vs configured norm; ExpectedNextStageDate per CropSeason
OUTPUT: Push notification to assigned field staff (or in-app dashboard alert if notifications disabled); in-app notification centre entry; home dashboard overdue list and upcoming transitions widget updated
DEPENDS ON: Module 1, Module 6, Module 8, Module 9
INTEGRATIONS: Expo Push Notification Service (FCM)
APPROVALS: no
AUTOMATIONS: yes — Celery beat runs overdue check daily; stage reminder triggered when ExpectedNextStageDate reached; fallback to in-app dashboard alert when device push notifications disabled
HAS_UI: yes
MANUAL SETUP: Configure FCM project in Firebase Console; add FCM server key to Django settings; configure Expo push credentials in EAS

MODULE 11: Recommendations Engine
COMPLEXITY: complex
CONTAINS: n/a
TECH: DRF, Django ORM (Recommendation model linked to crop + stage at send time), MSG91 SMS API, Interakt WhatsApp API, Celery (send dispatch)
INPUT: Farmer ID, product name, dose, timing, application method, notes, channel selection (WhatsApp/SMS); linked crop ID and current stage ID auto-captured at creation time
OUTPUT: Structured recommendation record (immutable once sent); message dispatched to farmer via selected channel; delivery status logged; visible in farmer profile Recommendations tab
DEPENDS ON: Module 1, Module 5, Module 6, Module 13
INTEGRATIONS: Interakt (WhatsApp Business API), MSG91 (SMS)
APPROVALS: no — individual recommendations require no approval
AUTOMATIONS: yes — WhatsApp/SMS send retry on temporary gateway failure; final delivery status (Sent/Delivered/Failed) logged automatically
HAS_UI: yes
MANUAL SETUP: none

MODULE 12: Promotion Library & Content Management
COMPLEXITY: simple
CONTAINS: Content item CRUD (upload, tag, activate/deactivate), content tagging (crop, stage, language), WhatsApp/SMS template attachment
TECH: Django ORM, Cloudinary SDK (video/image/PDF upload), DRF, React (admin web UI)
INPUT: Content title, type, file/URL, crop tags, stage tags, language tags, expiry date, WhatsApp template, SMS template
OUTPUT: Active content items available for field staff to push to farmers; expired items blocked from new sends; full read access for Marketing/Content Team
DEPENDS ON: Module 1, Module 3, Module 7
INTEGRATIONS: Cloudinary (content file storage)
APPROVALS: no
AUTOMATIONS: no
HAS_UI: yes
MANUAL SETUP: none

MODULE 13: Bulk Message Send & Approval Workflow
COMPLEXITY: complex
CONTAINS: n/a
TECH: Celery (background dispatch job, non-blocking UI), Interakt WhatsApp API, MSG91 SMS API, DRF (batch submission + approval endpoints), Expo Push / in-app notification (approval request to Regional Manager), React Native + React (batch status polling screen)
INPUT: Content item ID, farmer filter criteria (crop/stage/village/all), channel selection, sender user ID; approval action (approve/reject) from Regional Manager
OUTPUT: BulkSendBatch record with status (Pending/Approved/Rejected); opt-out farmers auto-excluded from resolved list; dispatched messages logged per farmer with delivery status; non-blocking status screen with sent/failed counts; sender and RM notified of outcome
DEPENDS ON: Module 1, Module 3, Module 5, Module 10, Module 12
INTEGRATIONS: Interakt (WhatsApp Business API), MSG91 (SMS), Expo Push (approval notifications)
APPROVALS: yes — all bulk sends require Regional Manager review and approval before dispatch; Zonal Manager self-approves after previewing recipient count
AUTOMATIONS: yes — opt-out farmer exclusion enforced at batch creation; auto-retry on gateway failure; final delivery status logged; approval request notification dispatched to RM on submission
HAS_UI: yes
MANUAL SETUP: Register all WhatsApp message templates with Meta via Interakt BSP before go-live; obtain Meta WABA approval

MODULE 14: Management Dashboards & Reports
COMPLEXITY: complex
CONTAINS: n/a
TECH: Django ORM aggregation queries (Count, Sum, annotate), PostGIS distance queries, Supabase Realtime (WebSocket subscription for live dashboard updates), DRF, React (web dashboard with TanStack Query), report export (openpyxl for Excel, ReportLab or WeasyPrint for PDF)
INPUT: Territory/zone scope from authenticated manager role; date range filters; drill-down params (zone → territory → staff → farmer)
OUTPUT: Territory/zone dashboards (farmers by village/crop/stage, staff activity summary, overdue visit report, staff leaderboard); drill-down from zone to individual farmer activity; real-time updates via Supabase Realtime WebSocket; Excel and PDF export
DEPENDS ON: Module 1, Module 3, Module 4, Module 6, Module 8, Module 9
INTEGRATIONS: Supabase Realtime (WebSocket)
APPROVALS: no
AUTOMATIONS: yes — Supabase Realtime pushes live dashboard updates to manager browser on new visit/stage/send events
HAS_UI: yes
MANUAL SETUP: Enable Supabase Realtime on relevant tables (visits, stage_changes, bulk_send_batches) in Supabase dashboard

MODULE 15: Audit Log & Farmer Data Deletion Workflow
COMPLEXITY: complex
CONTAINS: n/a
TECH: Django signals (auto-capture all model changes), custom AuditLog model (append-only, no update/delete permissions at DB level), DRF (deletion request endpoint for field staff; processing endpoint for admin), Celery (async audit write to avoid blocking request cycle)
INPUT: Any model create/update/delete event (auto-captured via Django signals); field staff deletion request (farmer ID, requesting staff ID); admin processing action
OUTPUT: Immutable audit log entry (entity, field, old value, new value, user ID, timestamp) retained 12 months; farmer status set to Inactive on admin processing (no hard delete); audit log export for admin; bulk export events logged
DEPENDS ON: Module 1, Module 3
INTEGRATIONS: none
APPROVALS: yes — farmer data deletion/disable requires System Administrator to process field staff request; hard delete is not available to any role
AUTOMATIONS: yes — Django signals auto-capture all data changes to audit log asynchronously via Celery; bulk export events auto-logged on trigger
HAS_UI: yes
MANUAL SETUP: Set append-only constraint on AuditLog table at PostgreSQL level (REVOKE UPDATE, DELETE on audit_log FROM app_user); configure 12-month retention policy

MODULE 16: Field Staff Home Dashboard & Farmer Profile Shell
COMPLEXITY: simple
CONTAINS: Home dashboard layout (overdue list widget, upcoming transitions widget, quick stats, in-app notification centre), farmer profile screen shell (tabs: Plots & Crops, Activity Log, Recommendations, Communications, Promotions Sent), shared React Native navigation structure
TECH: React Native (Expo Router), NativeWind (Tailwind), TanStack Query (data fetching + cache), Zustand (local UI state)
INPUT: Authenticated user session, farmer ID (for profile shell), notification centre entries from Module 10
OUTPUT: Rendered home dashboard consuming data from Modules 9, 10, 8; farmer profile tab shell routing to sub-modules; consistent navigation and layout across all field staff screens
DEPENDS ON: Module 2, Module 9, Module 10
INTEGRATIONS: none
APPROVALS: no
AUTOMATIONS: no
HAS_UI: yes
MANUAL SETUP: none

MODULE 17: Admin Web Interface Shell & Configuration Screens
COMPLEXITY: simple
CONTAINS: Admin web app layout shell (sidebar nav, role-gated route guards), WhatsApp/SMS gateway credential configuration screen, visit frequency norm configuration screen, app-wide settings
TECH: React + Vite, Tailwind CSS, React Router v6, TanStack Query, Cloudflare Pages (hosting)
INPUT: Authenticated admin/manager session and role; gateway API keys and configuration values
OUTPUT: Role-gated admin web interface shell routing to all management modules; stored gateway credentials (MSG91 key, Interakt key, Cloudinary key) in Django settings/environment; visit frequency norm stored in configuration table
DEPENDS ON: Module 2, Module 3
INTEGRATIONS: none
APPROVALS: no
AUTOMATIONS: no
HAS_UI: yes
MANUAL SETUP: Deploy React build to Cloudflare Pages; set environment variables for all API keys in Render dashboard