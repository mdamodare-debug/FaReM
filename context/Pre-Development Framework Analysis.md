# Pre-Development Framework Analysis
## Dhanashree Crop Solutions — Field Force Management Application (FFMA)

---

## 1. CORE BUSINESS NEED

**Primary Problem Being Solved**

Dhanashree Crop Solutions operates a field force of approximately 60 agronomists and crop advisors serving a base of roughly 50,000 farmers across rural Maharashtra. Every operational process — farmer records, visit logs, crop-stage tracking, recommendations, and promotional communications — is managed through disconnected, informal methods: paper registers, personal Excel sheets, WhatsApp chats, and individual staff memory. There is no central system of record, no management visibility, no automation, and no audit trail.

**Main App Purpose**

To provide field staff with a mobile-first, offline-capable digital workspace for managing their farmer portfolios, while giving managers real-time visibility into all field activity across every territory.

**Current Pain Points**

- Farmer records are scattered across paper, Excel, and personal WhatsApp — no standardised format and no single source of truth
- Managers must phone each staff member individually to get field updates — no dashboard exists
- No digital timestamping of visits; staff rely on memory or handwritten notes
- Crop stage tracking is entirely informal; no system calculates or monitors stage transitions
- Product recommendations are shared verbally or via personal WhatsApp with no structured record of product, dose, or timing
- Promotional content is forwarded individually with no tracking of reach or timing
- Calls are not logged at all — no duration, outcome, or frequency data
- Approximately 50,000 farmer records exist in Excel files that are not accessible on-device
- No overdue visit alerts exist, meaning farmers can go weeks or months without contact and no one is notified
- The business cannot aggregate data by crop, village, territory, or stage for planning purposes

---

## 2. USERS & ROLES

**Field Staff / Agronomist (~60 users)**

These are the primary end users of the mobile application. Their core responsibilities include managing a portfolio of 600–2,000 farmers each; recording crop and plot data; logging visits and calls; creating and sending product recommendations; pushing promotional content; and using the Smart Visit Planner to organise their daily schedule. They interact exclusively with their own assigned farmers — they cannot view other staff members' portfolios. They cannot delete records, access territory-level reports, manage crop master data, or upload content. Their primary pain point is the absence of a digital tool that tells them who needs attention today, what stage each farmer's crops are at, and what to share with them.

**Territory Manager (~10–15 users)**

Territory Managers oversee all field staff and farmers within their territory. They monitor visit activity, review overdue visit lists, view farmer-level data across all staff (read-only), and access territory dashboards covering farmers by village, crop, and stage as well as a staff leaderboard. They can log visits and calls and approve or review field staff recommendations for quality assurance. They can view financial and bulk export data. They cannot delete farmer records, upload promotional content, or manage crop master data. Their pain point is the lack of any aggregated view of field activity without manually calling each staff member.

**Regional / Zonal Manager (~3–5 users)**

Zonal Managers work primarily from a desktop browser. They access aggregated reports across multiple territories, review the staff leaderboard zone-wide, initiate or approve bulk campaign sends across the zone, and drill down from zone to territory to individual staff to individual farmer activity. They can send bulk WhatsApp and SMS messages but cannot add or edit farmer records, log visits, or manage system configuration. Their primary need is strategic visibility across the zone and the ability to execute bulk communications.

**System Administrator (1–2 users)**

Administrators have full system access. They create and manage all user accounts, configure the territory hierarchy, manage crop master data (crops, varieties, growth stages, inter-stage durations), execute bulk farmer imports of up to 50,000 records, configure WhatsApp Business API and SMS gateway credentials, set visit frequency norms per farmer segment, and access and export audit logs. They are the only users who can delete farmer records. The admin web interface uses the same OTP-based authentication with an additional email-based fallback for account recovery.

**Marketing / Content Team (2–5 users)**

This team operates exclusively through the admin web interface for content management. They upload promotional materials (videos, images, PDFs, links), tag each item to specific crops, growth stages, and languages, attach pre-composed WhatsApp/SMS message templates, and activate or deactivate content items. They have no access to farmer data, visit logs, or any field activity information.

---

## 3. KEY WORKFLOWS

**Primary Documented User Journey: Field Staff Logs a Visit, Updates Crop Stage, and Sends Promotion**

1. Staff opens the Android app and authenticates via OTP on their registered mobile number
2. Home dashboard loads showing Today's Overdue List, Upcoming Stage Transitions, and Quick Stats
3. Staff searches for a farmer by name or village; the farmer card shows name, village, primary crop, current stage, and days since last visit
4. Staff opens the full Farmer Profile, which contains tabs for Plots & Crops, Activity Log, Recommendations, Communications, and Promotions Sent
5. A banner surfaces a contextually suggested promotion based on the farmer's current crop and stage
6. Staff taps "Log Visit"; the system auto-captures date, time, and GPS coordinates; staff selects visit purpose, enters notes, and attaches geo- and time-stamped photos
7. If the device is offline, the visit is stored locally and synced to the server on reconnection
8. Staff navigates to the Plots tab and opens the crop card; the current stage is auto-calculated from the sowing date and Crop Master inter-stage durations
9. Staff confirms the crop has advanced to the next stage and taps "Advance Stage"; this creates an immutable stage change log entry
10. Staff opens the suggested promotion from the profile banner and pushes it to the farmer via WhatsApp or SMS; the send event is logged with channel, timestamp, and delivery status
11. The farmer's Activity Log is updated (newest first) with the visit, stage change, and promotion send
12. The "Days Since Last Visit" counter resets to zero; the overdue badge is cleared from the home dashboard
13. The Territory Manager's dashboard is updated in real time reflecting the visit, stage change, and promotion

**Approval Workflows**

- Bulk zone-level campaign sends require the Zonal Manager to preview the recipient farmer count before self-approving and confirming
- New staff account creation requires a System Administrator to assign the role at creation; roles cannot be self-modified
- Territory restructuring requires an Administrator and generates a full audit log
- Bulk farmer imports of more than 1,000 records require the Admin to review the error report before committing — duplicates are flagged but not auto-merged; the process is idempotent
- WhatsApp and SMS template registration requires external approval from Meta (WABA) and TRAI (DLT) before templates can go live
- Phase 2 satellite API activation requires management sign-off due to third-party commercial pricing dependency

**Automation Triggers**

Detailed in Section 7.

---

## 4. FEATURES

**Must-Have (MVP) — Without These the App Is Not Launchable**

- OTP-based login with role-based access control enforced at the API layer (not client-side only)
- Farmer CRUD with all required fields, search, and filtering
- Farmer-to-staff and farmer-to-territory assignment (permanent linkage)
- Bulk farmer import from Excel (~50,000 records) with validation, error reporting, duplicate detection, and idempotent re-import (merge mode on mobile number match)
- Plot management with unlimited named plots per farmer, soil type, and irrigation source
- Crop and growth stage tracking: associate crops from Crop Master, set sowing date, auto-calculate expected next-stage dates, manually advance stage, immutable stage change log
- Crop Master managed by Admin: crop list, varieties, growth stages, inter-stage durations in days
- Visit logging with auto-captured date, time, GPS stamp, visit purpose, notes, and geo/time-stamped photos
- Call logging with click-to-call initiation, auto-logging of date/time/duration/direction, and outcome notes
- Recommendations engine: structured product recommendations (product name, dose, timing, method) linked to crop and stage; pushed via WhatsApp or SMS
- WhatsApp Business API integration for individual and bulk sends with delivery status logging
- SMS gateway integration for individual and bulk sends
- Overdue visit push notifications to field staff when days-since-last-visit exceeds the configured norm
- Stage transition reminders to field staff when a farmer's crop is expected to reach its next stage
- Smart Visit Planner: daily ranked visit schedule based on overdue status and GPS proximity, refreshed each morning at a configurable time
- Field Staff Dashboard: today's overdue visits, upcoming stage transitions, activity summary, quick stats
- Management Dashboard: territory and zone-level reports covering farmers by village/crop/stage, staff activity summary, overdue visit report, staff leaderboard
- Report export to Excel and PDF
- Offline capability for visit logging, call logging, GPS geo-tagging, crop stage updates, and photo capture — with automatic sync within 60 seconds on reconnection; sync must be idempotent
- Territory hierarchy management by Admin: Region → Zone → Territory → Staff → Farmer
- Full audit log of all data changes (entity, field, old value, new value, user identity, timestamp) retained for 12 months; accessible to Admins only
- Promotional content library with crop, stage, and language tagging and pre-composed message templates
- Device-level PIN or biometric lock enforcement before app access
- Remote session invalidation by Admin for lost or stolen devices
- JWT session tokens expiring after 15 minutes of inactivity
- Account lock after 5 consecutive failed OTP attempts (30-minute lockout; Admin can unlock early)

**Phase 2 (Explicitly Deferred)**

- NDVI and Crop Health Intelligence: satellite-derived NDVI readings per geo-tagged plot, trend charts, and alerts when NDVI drops below crop-stage benchmarks
- Soil Moisture Monitoring: satellite or sensor-based readings with alerts for out-of-norm conditions
- Hyper-Local Weather Intelligence: village or plot-level weather data with automated bulk advisory triggers based on configurable weather event thresholds
- Territory Satellite Map View: interactive map of geo-tagged plots colour-coded by NDVI health band with crop, stage, and NDVI filters
- Hindi and Kannada language UI (English and Marathi ship in Phase 1; Hindi is noted as Phase 1.5 in one reference)
- Automated weather-event bulk push triggered by configured thresholds
- AI-driven automated crop health alerts based on NDVI anomalies
- Advanced analytics: historical trend analysis, crop yield correlation, territory growth forecasting
- Digital Library: centralised repository of crop schedules, marketing taglines, videos, and social media materials for field team access

**Implied Features (Required for Documented Workflows but Not Explicitly Listed)**

- In-app notification centre or inbox for push notifications (overdue alerts, stage reminders) — the document specifies push notifications are sent but does not describe where or how they are displayed within the app
- Background photo upload with retry logic — mentioned in performance benchmarks but not listed as a named feature
- WhatsApp/SMS send retry logic — described under automations but not listed in the features section
- Duplicate mobile number warning at point of farmer creation — described under automations but not listed in the features section
- Farmer transfer workflow — "Transferred" is listed as a farmer status but no transfer process is described

---

## 5. DATA & INTEGRATIONS

**Data Stored**

The system maintains six primary data entities:

- **Farmer Master:** full name, primary and alternate mobile numbers, village, taluka, district, PIN code, state, assigned field staff, territory, farmer photo, preferred language, land holding in acres, system-generated farmer ID, date added, source (bulk import or in-app), and status (Active/Inactive/Transferred)
- **Crop and Stage Data per Plot:** crop (linked to Crop Master), variety/hybrid, planting date, sowing/transplanting date, current growth stage, previous crop, system-calculated expected next stage date, and immutable stage change log
- **Crop Master:** crop name, category, scientific name, varieties, crop schedule PDF, reference image, status, and per-stage data (stage name, sequence number, days from previous stage, description)
- **Activity and Communication Log per Farmer:** field visits (date, time, GPS, purpose, notes, photos), calls logged (date, time, duration, direction, outcome notes), recommendations given (product, dose, timing, method, notes, crop and stage at time of recommendation), promotions pushed (content title, channel, timestamp, send status), and system-calculated days-since-last-visit and days-since-last-call
- **Sales Person (Field Staff) Master:** full name, employee ID, mobile number, email, territory, reporting manager, last login timestamp, role
- **Territory Master:** territory name, region/zone hierarchy, assigned staff, assigned manager, auto-aggregated farmer count, territory map view
- **Promotion Library:** content title, type (video/image/PDF/link), file or URL, crop tags, stage tags, language tags, expiry date, status, pre-composed WhatsApp/SMS template
- **System Logs:** all data changes with entity, field changed, old and new values, user identity, and timestamp — retained 12 months; all bulk export events with user, timestamp, and record count

**External Integrations Required**

- WhatsApp Business API via a Meta-approved BSP (examples cited: Interakt, AiSensy, Gupshup) — required for all WhatsApp sends; bulk sends must use pre-approved Business API templates
- SMS gateway — required for individual and bulk SMS sends; all bulk campaigns must use TRAI DLT-registered templates and sender IDs
- GPS/location services — for auto-stamping visit logs and powering the Smart Visit Planner proximity ranking
- Push notification service — for overdue visit alerts and stage transition reminders (specific provider not named)
- Phase 2 only: satellite data provider APIs (examples cited: Cropin, SatSure, ISRO Bhuvan, SkyMet) for NDVI, soil moisture, and weather data

**Reporting Requirements**

- Territory-level reports: farmers by village, crop, and stage; staff activity summary; overdue visit report; staff leaderboard
- Zone-level aggregated versions of all the above with drill-down capability to territory → staff → farmer
- Report export to both Excel and PDF
- Audit log export accessible to Admins only
- Bulk export event logging

---

## 6. TECHNICAL CONSTRAINTS

**Device and Platform Requirements**

- Mobile app: Android primary; must run on 2 GB RAM devices with Android 8+ (API level 26 and above); iOS is referenced but not detailed beyond the IPA install size target
- Admin and manager web interface: desktop/laptop browser; requires stable internet connection
- Territory Managers require dashboard and reports accessible on both mobile and web
- APK/IPA install size must not exceed 50 MB to accommodate low-storage devices
- App must be data-efficient and functional on connections ranging from 2G to 5G
- UI must be designed for outdoor readability: minimum 48×48dp tap targets, high-contrast text, adjustable font size, high-contrast mode in settings

**Performance Benchmarks**

- Farmer list load on 4G: under 2 seconds for first 50 records
- Photo upload (5 MB on 4G): under 10 seconds with background upload and retry
- Offline sync on reconnection: all queued actions synced within 60 seconds
- Dashboard load on 4G: under 3 seconds for current-period data
- Bulk campaign of 5,000 messages: non-blocking UI via background job with status screen
- System availability: 99.5% uptime during business hours (6 AM–10 PM IST); scheduled maintenance only in overnight windows

**Expected User Load**

- Current: ~60 field staff, ~50,000 farmers
- Architecture must scale to 200 field staff and 200,000 farmers without re-architecture
- System must support all 60+ field staff syncing simultaneously without performance degradation

**Infrastructure**

- All data must be hosted on AWS or Azure Mumbai region (ap-south-1) for Indian data residency compliance under the IT Act 2000
- Daily automated backups with 30-day retention and point-in-time recovery capability required

**Budget and Timeline**

No budget range or development timeline is stated anywhere in the document. This is a notable gap.

---

## 7. AUTOMATIONS & NOTIFICATIONS

**Automated Actions and Recipients**

- **Overdue visit push notification:** triggered when days-since-last-visit exceeds the configured norm (examples given: 7 or 14 days); sent to the assigned Field Staff member
- **Stage transition reminder:** triggered when the expected next-stage date is reached for any farmer's crop; sent to the assigned Field Staff member
- **Smart Visit Planner daily refresh:** runs every morning at a configurable time; Field Staff sees an updated, ranked visit list on their home dashboard
- **Stage auto-advance proposal:** when the expected next-stage date is reached, the system surfaces a confirmation prompt to the Field Staff member — the staff must confirm before the stage is formally advanced
- **Farmer assignment confirmation:** triggered when a bulk import completes successfully; Admin sees a confirmation and newly imported farmers appear in the assigned staff member's app within 5 minutes
- **Duplicate mobile number detection:** triggered on new farmer creation or import when a mobile number already exists in the system; the creating staff member or Admin sees a warning before saving
- **Session expiry:** user is automatically logged out after 15 minutes of inactivity
- **Account lock:** triggered after 5 consecutive failed OTP attempts; user is locked for 30 minutes and Admin is notified
- **WhatsApp/SMS send retry:** on temporary gateway failure, the system retries automatically; the final status (sent/delivered/failed) is logged
- **Offline sync:** on network reconnection, all queued visits, calls, photos, and stage updates are pushed to the server within 60 seconds

**Phase 2 Automations**

- Weather alert bulk push: triggered when a configured weather threshold is crossed for a crop/stage/territory combination; farmers in the target group receive a WhatsApp/SMS advisory
- NDVI drop alert: triggered when an NDVI reading falls significantly below the crop-stage benchmark; assigned Field Staff receives an alert with plot details

**Approval Workflows**

Covered in Section 3. No financial approval workflows are defined — this is consistent with the application's scope as an operational field management tool rather than a commerce platform.

---

## 8. GAPS & ASSUMPTIONS

**Ambiguous or Underspecified Items**

- **Hindi as "Phase 1.5":** The language roadmap is internally inconsistent. Section 15 lists English and Marathi as Phase 1 defaults and Hindi as Phase 1.5, while Section 10 lists Hindi and Kannada together as Phase 2. It is unclear whether Hindi is a Phase 1 deliverable, a mid-phase addition, or a Phase 2 item.
- **iOS support:** The IPA install size target (50 MB) implies iOS support is expected, but no iOS-specific requirements, minimum OS version, or testing scope are stated anywhere. It is unclear whether iOS is in scope for Phase 1.
- **Push notification infrastructure:** The document specifies that push notifications will be sent for overdue visits and stage transitions but does not name a push notification provider (e.g. Firebase Cloud Messaging), nor does it describe behaviour on devices where notifications are disabled or on iOS.
- **Smart Visit Planner GPS logic:** The planner ranks visits by overdue status and GPS proximity, but the algorithm is not defined. It is unclear whether proximity is calculated from the staff member's current live location, their last known location, or a home-base address.
- **Farmer transfer workflow:** "Transferred" is a valid farmer status in the Farmer Master, but no process is described for how a farmer is transferred between staff members or territories — who initiates it, who approves it, and what happens to the historical activity log.
- **Recommendation approval:** The permissions table shows Territory Managers can "approve or review recommendations made by field staff for quality assurance," but no formal approval workflow is described. It is unclear whether this is a structured approve/reject flow with notifications or simply read-only review access.
- **Content push to bulk groups:** Field Staff are described as being able to push content to "individual farmers or bulk groups," but the mechanism for defining a bulk group at the field staff level is not described. Only zone-level bulk sends have an approval workflow defined.
- **Marketing/Content Team permissions gap:** The permissions matrix in Section 6 does not include a column for the Marketing/Content Team, even though this user type is defined and described in Section 5.
- **Call logging mechanism:** It is stated that staff can initiate calls from within the app (click-to-call) and that calls are auto-logged. The technical mechanism for auto-capturing call duration and direction on Android is not specified, and behaviour on iOS (where call interception is restricted) is not addressed.
- **Farmer photo storage:** Farmer photos are listed as a Farmer Master field but no storage size limits, compression requirements, or CDN delivery strategy are mentioned — relevant given the 50 MB APK constraint and 50,000-farmer scale.

**Missing Critical Information**

- **Budget and timeline:** Neither a budget range nor a development or go-live timeline is stated anywhere in the document. These are essential for scoping and prioritisation.
- **BSP selection:** The document lists three WhatsApp BSP examples (Interakt, AiSensy, Gupshup) but no selection has been made. BSP onboarding and Meta WABA approval are prerequisites for the communication module and carry lead times that are outside the development team's control.
- **DLT registration status:** SMS DLT template and sender ID registration with TRAI is listed as an Admin responsibility and an external dependency, but current registration status is not disclosed. This is a launch-blocking dependency.
- **Crop Master data readiness:** The document flags that the agronomy team must fully define crop list, stage names, and inter-stage durations before Phase 1 go-live. The current state of this data — whether it exists in any structured form — is not disclosed.
- **Farmer data cleanliness:** The document states that all 50,000 farmer records must include at minimum full name, mobile number, village, and a valid Staff ID, and that Dhanashree will cleanse the Excel file. The current quality of this data (duplicate rate, missing fields, inconsistent formats) is unknown and represents a significant implementation risk.
- **Product catalogue:** The recommendations module requires a product catalogue (product names and descriptions), which Dhanashree is expected to provide before development. Its current state is not disclosed.
- **Web app technology stack:** The admin and manager web interface is referenced extensively but no technology preferences, framework requirements, or browser compatibility targets are stated.
- **Notification opt-out handling:** No policy is described for what happens if a farmer opts out of WhatsApp or SMS communications — a compliance consideration under TRAI regulations.
- **Data deletion and right-to-erasure policy:** Given that farmer PII is stored and access-logged under the IT Act 2000, no process is described for handling a farmer's request to have their data deleted or anonymised.


Answers to all gaps and assumptions : 
Hindi as "Phase 1.5" - Phase 2
iOS support - Not required now
Push notification infrastructure - Please choose the Push notification provider according to the application use case. Where the notificATIONS are disabled or on iOS, do not push the notifications.  Show the notifications on the dashboard
Smart Visit Planner GPS logic - The proximity is calculated from the staff's current live location or their last known location. The planner should prompt for filtering by crop or distance or village to make the smart visit plan
Recommendation approval: The approval workflow is triggered only for bulk message sending, where the regional manager can review and approve or reject the messages.  For sending product recommendations, no such approval is required.
Content push to bulk groups: The bulk groups are a list of farmers chosen by the user depending on the crop, crop stage, all farmers in the user's list, village, etc. All such bulk messages would require approval by the respective regional manager
Marketing/Content Team permissions gap: The Marketing/Content team has read only access to the entire farmer list, they have read, write, delete access to all the data in the content part of the application
Call logging mechanism: Only the fact the call was made and the date/time of the call should be logged in the application.  No other details like call duration needs to be logged.
Farmer photo storage: The photo should be optional and the size should be as per general application norms
Budget and timeline: Please suggest the budget and timeline, and suggest for review.
DLT registration status: We have a current DLT registration status and sender ID is registered with TRAI.
Crop Master data readiness: The data is ready for about 15 different crops
Farmer data cleanliness: The farmer data in a clean format exists in EXCEL sheet format.  The data needs to be cleaned for duplicates, and the staff ID is the staff mobile number
Product catalogue: The product catalogue exists
Web app technology stack : We will be giving the prompt to you in further conversations regarding tech stack, so consider it accordingly
Notification opt-out handling: If the farmer opts out of the notifications for whatever reason, please do not send the notification and alert the user and admin accordingly
Data deletion and right-to-erasure policy: on request by the farmer, the staff can raise a request to the admin to have the farmer id disabled from the system