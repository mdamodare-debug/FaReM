# DHANASHREE CROP SOLUTIONS
## Field Force Management Application
### Comprehensive Product Specification — Phase 1

| Attribute | Detail |
|---|---|
| **Version** | 1.0 — Baseline |
| **Prepared For** | Dhanashree Crop Solutions Pvt. Ltd. |
| **Document Status** | For Review |
| **Platform** | Android Mobile App + Admin Web Interface |
| **Primary Language** | English and Marathi (Phase 1) |
| **Data Residency** | AWS / Azure Mumbai Region (ap-south-1) |

---

## Table of Contents

1. [Core Function](#task-1--core-function)
2. [User Roles & Permissions (RBAC)](#task-2--user-roles--permissions-rbac)
3. [Data Architecture](#task-3--data-architecture)
4. [Primary Workflows](#task-4--primary-workflows)
5. [Business Rules](#task-5--business-rules)
6. [Success Metrics](#task-6--success-metrics)
7. [Suggested Budget and Timeline](#suggested-budget-and-timeline)
8. [Appendix A — Automations & Notifications](#appendix-a--automations--notifications)
9. [Appendix B — Technical Constraints & Infrastructure](#appendix-b--technical-constraints--infrastructure)

---

## TASK 1 — Core Function

### Primary Value Proposition

> *Ensure that no farmer is ever forgotten — by surfacing exactly who needs a visit today, what stage their crops are at, and what content to share with them — while logging every interaction permanently so management always knows what is happening in the field.*

### Why This Matters Most

Dhanashree Crop Solutions manages 60 agronomists and ~50,000 farmers across rural Maharashtra. Every current process — visit records, crop-stage tracking, product recommendations, and promotional communications — is fragmented across paper registers, personal Excel sheets, and individual WhatsApp messages. There is no system of record, no management visibility, and no automation.

The single most valuable function of the FFMA is therefore not a feature — it is the **elimination of farmer invisibility**. When a field staff member opens the app each morning and sees a ranked list of exactly who needs attention, what their crops are doing, and what to communicate, the business moves from reactive to proactive. Every action is permanently logged, creating an audit trail that makes the entire 60-person field force measurable, manageable, and scalable.

### Business Impact Summary

- Converts a 60-person informal operation into a structured, data-driven field force
- Eliminates dependence on individual staff memory for farmer engagement history
- Provides management real-time visibility without phone-based manual check-ins
- Creates the data foundation for Phase 2 satellite, soil, and weather intelligence
- Scales without re-architecture to 200 field staff and 200,000 farmers

---

## TASK 2 — User Roles & Permissions (RBAC)

All permissions are enforced at the API layer. Client-side UI restrictions alone are insufficient — every endpoint validates the requesting user's role before returning or mutating data. A user cannot access data outside their assigned scope regardless of how the API is called.

### Permissions Matrix

| Action / Capability | Field Staff | Territory Mgr | Zonal Mgr | Admin | Content Team |
|---|---|---|---|---|---|
| View own assigned farmers only | ✅ Own only | ✅ Territory | ✅ Zone | ✅ All | ✅ Read-only |
| Add / edit farmer records | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| Delete farmer records | ❌ No | ❌ No | ❌ No | ✅ Yes | ❌ No |
| Raise farmer data deletion request | ✅ Yes | ✅ Yes | ❌ No | ✅ Approves | ❌ No |
| Log field visits | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Log calls | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Create product recommendations | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Send WhatsApp / SMS (individual) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Send bulk messages (own farmer list) | ✅ With RM approval | ✅ With RM approval | ✅ Self-approve | ✅ Yes | ❌ No |
| View territory-level reports | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Bulk export data | ❌ No | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| Upload / manage content library | ❌ No | ❌ No | ❌ No | ✅ Yes | ✅ Full access |
| Delete message history | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| Manage Crop Master data | ❌ No | ❌ No | ❌ No | ✅ Yes | ❌ No |
| Bulk farmer import | ❌ No | ❌ No | ❌ No | ✅ Yes | ❌ No |
| Create / manage staff accounts | ❌ No | ❌ No | ❌ No | ✅ Yes | ❌ No |
| Access audit logs | ❌ No | ❌ No | ❌ No | ✅ Yes | ❌ No |
| Configure territory hierarchy | ❌ No | ❌ No | ❌ No | ✅ Yes | ❌ No |
| Approve bulk message sends | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ❌ No |

---

### Role Profiles

#### Role: Field Staff / Agronomist (~60 users)

**Primary Device:** Android smartphone — must work offline

**Can do:**
- Manage their assigned farmer portfolio of 600–2,000 farmers
- Add new farmers in the field; edit existing farmer and plot records
- Log field visits with auto-captured GPS, date/time, notes, and photos
- Log calls (date and time only — no duration or direction required)
- Create and send product recommendations (product name, dose, timing)
- Push promotional content to individual farmers or bulk groups (with Regional Manager approval for bulk)
- Use the Smart Visit Planner to generate a daily ranked visit schedule
- Update crop stages after physically verifying in the field
- Raise a farmer data deletion request to the Admin

**Cannot do:**
- View other staff members' farmer portfolios
- Delete farmer records
- Access territory or zone-level reports
- Upload or manage content library items
- Send bulk messages without Regional Manager approval

---

#### Role: Territory Manager (~10–15 users)

**Primary Device:** Android smartphone + web browser

**Can do:**
- Monitor all field staff visits, calls, and recommendations within their territory
- View all farmer-level data across their territory (read-only)
- Access territory dashboards: farmers by village, crop, and stage; staff leaderboard; promotion reach
- Review and quality-check field staff recommendations
- Review overdue visit lists and follow up with field staff
- Log visits and calls directly if needed
- Export territory-level reports to Excel and PDF

**Cannot do:**
- Delete farmer records
- Access zone-level aggregated reports
- Approve bulk message sends (approval authority rests with Regional Manager)
- Upload or manage content library items

---

#### Role: Regional / Zonal Manager (~3–5 users)

**Primary Device:** Desktop / laptop browser

**Can do:**
- Access aggregated reports across all territories in their zone
- Review the staff leaderboard at zone level
- Drill down from zone → territory → staff → individual farmer activity
- Review, approve, or reject bulk message sends submitted by Field Staff or Territory Managers within their zone
- Initiate zone-level bulk campaign sends (self-approved after previewing recipient count)

**Cannot do:**
- Add, edit, or delete farmer records
- Log visits or calls
- Create individual product recommendations
- Upload or manage content library items
- Access or export bulk farmer data

---

#### Role: System Administrator (1–2 users)

**Primary Device:** Desktop / laptop browser

**Can do:**
- Full system access — all data, configuration, and master data
- Create and manage all user accounts and assign roles
- Configure and restructure the territory hierarchy (Region → Zone → Territory → Staff → Farmer)
- Manage Crop Master: add/edit crops, varieties, growth stages, inter-stage durations
- Execute bulk farmer imports from Excel (up to ~50,000 records)
- Configure WhatsApp Business API and SMS gateway credentials
- Set visit frequency norms per farmer segment
- Delete farmer records (only role with this permission)
- Access and export full audit logs
- Remotely invalidate sessions for lost or stolen devices
- Unlock accounts locked by failed OTP attempts
- Process farmer data deletion/disable requests raised by Field Staff

**Cannot do:**
- Delete message history (no role can do this)

---

#### Role: Marketing / Content Team (2–5 users)

**Primary Device:** Desktop / laptop browser

**Can do:**
- Full read access to the entire farmer list (read-only)
- Upload, edit, and delete all items in the Promotion Library
- Tag content to crops, growth stages, and languages
- Attach pre-composed WhatsApp/SMS message templates to content items
- Activate or deactivate content items

**Cannot do:**
- Log visits, calls, or recommendations
- Send messages to farmers
- Edit or delete farmer records
- Access system configuration or audit logs

---

## TASK 3 — Data Architecture

The following entities form the core data model. The Phase 1 schema is designed to support Phase 2 satellite and weather intelligence without structural changes — GPS plot coordinates and crop stage timelines are stored from day one.

### Entity 1: User (Staff Master)

| Attribute | Detail |
|---|---|
| **Fields** | UserID (system), FullName, MobileNumber (= Staff ID, used for OTP login), Email, EmployeeID, Role (enum: FieldStaff / TerritoryManager / ZonalManager / Admin / ContentTeam), TerritoryID (FK), ReportingManagerID (FK), Status (Active/Inactive), LastLoginTimestamp, DevicePushToken |
| **Relationships** | Belongs to one Territory; manages many Farmers (FieldStaff); reports to one Manager |
| **Read access** | Admin: all records. Manager: own territory/zone users. FieldStaff: own profile only |
| **Write access** | Admin: create, edit, deactivate all users. Users: own profile fields only (not role, territory) |
| **Delete** | Soft delete (status = Inactive) by Admin only. Hard delete not permitted to preserve audit trail |

### Entity 2: Farmer Master

| Attribute | Detail |
|---|---|
| **Fields** | FarmerID (system), FullName, PrimaryMobile (unique, used as merge key for imports), AlternateMobile, Village, Taluka, District, PINCode, State, PreferredLanguage (enum: English/Marathi), LandHolding (acres), FarmerPhoto (optional, compressed per app norms), AssignedStaffID (FK), TerritoryID (FK), Source (BulkImport / InApp), Status (Active / Inactive / Transferred), DateAdded, OptOutWhatsApp (bool), OptOutSMS (bool) |
| **Relationships** | Assigned to one FieldStaff; belongs to one Territory; has many Plots; has many ActivityLogs |
| **Read access** | FieldStaff: own assigned farmers. TerritoryManager: all farmers in territory. ZonalManager/Admin: all. ContentTeam: read-only all |
| **Write access** | FieldStaff + TerritoryManager: create and edit within scope. Admin: full. ZonalManager: read-only |
| **Delete** | Soft delete (Status = Inactive) by Admin. Disable-on-request workflow: FieldStaff raises request → Admin processes. Hard delete not available. |

### Entity 3: Plot

| Attribute | Detail |
|---|---|
| **Fields** | PlotID (system), FarmerID (FK), PlotName, AreaAcres, SoilType, IrrigationSource, GPSLatitude, GPSLongitude (stored for Phase 2 NDVI/satellite use) |
| **Relationships** | Belongs to one Farmer; has many CropSeasons |
| **Read access** | Follows parent Farmer access rules |
| **Write access** | FieldStaff (own farmers), TerritoryManager (territory), Admin |

### Entity 4: Crop Season (per Plot)

| Attribute | Detail |
|---|---|
| **Fields** | SeasonID (system), PlotID (FK), CropID (FK to CropMaster), VarietyName, SowingDate, CurrentStageID (FK to CropStage), PreviousCrop, Status (Active/Completed) |
| **Computed fields** | ExpectedNextStageDate = SowingDate + sum of inter-stage durations up to next stage (recalculated on each stage advance) |
| **Stage change log** | Immutable child table: SeasonID, FromStageID, ToStageID, ChangedByUserID, ChangeTimestamp. No updates or deletes permitted on this log. |
| **Relationships** | Belongs to one Plot; references CropMaster and CropStage |
| **Write access** | Stage advance: FieldStaff and TerritoryManager only, requires explicit user confirmation prompt |

### Entity 5: Crop Master (Admin-Managed Reference Data)

| Attribute | Detail |
|---|---|
| **Crop fields** | CropID, CropName, CropCategory, ScientificName, CropSchedulePDF (link), ReferenceImage, Status (Active/Inactive) |
| **Variety fields** | VarietyID, CropID (FK), VarietyName, TypicalDurationDays |
| **Stage fields** | StageID, CropID (FK), StageName, SequenceNumber, DaysFromPreviousStage, StageDescription |
| **Initial data** | 15 crops are ready. Admin must validate stage definitions and inter-stage durations before go-live. |
| **Write access** | Admin only. All other roles read-only. |

### Entity 6: Activity Log (Visits & Calls)

| Attribute | Detail |
|---|---|
| **Visit fields** | VisitID, FarmerID (FK), LoggedByUserID (FK), VisitDate, VisitTime, GPSLatitude, GPSLongitude (auto-captured), VisitPurpose, Notes, Photos[] (geo + time stamped, optional, compressed), SyncStatus (Pending/Synced) |
| **Call fields** | CallID, FarmerID (FK), LoggedByUserID (FK), CallDate, CallTime. Note: no duration, direction, or outcome fields are required per specification. |
| **Computed fields** | DaysSinceLastVisit and DaysSinceLastCall are calculated at query time from latest log entries — not stored as fields |
| **Immutability** | No updates or deletes permitted on any activity log entry. Corrections are made via new entries. |
| **Offline behaviour** | Records created offline are queued locally (SQLite / Room) and synced idempotently on reconnection. Duplicate prevention: unique constraint on (FarmerID, LoggedByUserID, VisitDate, VisitTime) to prevent double-sync. |

### Entity 7: Recommendation

| Attribute | Detail |
|---|---|
| **Fields** | RecommendationID, FarmerID (FK), CreatedByUserID (FK), ProductName, Dose, Timing, ApplicationMethod, Notes, CropID (FK), StageID (FK, stage at time of recommendation), Channel (WhatsApp/SMS), SendStatus (Sent/Delivered/Failed), Timestamp |
| **Approval** | No approval required for individual recommendations. Bulk sends require Regional Manager approval (see Workflow 4). |
| **Write access** | FieldStaff and TerritoryManager. Immutable once sent. |

### Entity 8: Promotion Library

| Attribute | Detail |
|---|---|
| **Fields** | ContentID, Title, ContentType (Video/Image/PDF/Link), FileURL, CropTags[] (FK), StageTags[] (FK), LanguageTags[] (enum), ExpiryDate, Status (Active/Inactive), WhatsAppTemplate, SMSTemplate |
| **Write access** | Admin and Content Team: full read/write/delete. All others: read-only (to send to farmers). |
| **Relationship** | Referenced by bulk send batches and individual farmer communication logs |

### Entity 9: Bulk Send Batch

| Attribute | Detail |
|---|---|
| **Fields** | BatchID, CreatedByUserID (FK), ContentID (FK), FilterCriteria (JSON: crop/stage/village/all), FarmerIDs[] (resolved list), RecipientCount, Channel (WhatsApp/SMS), ApprovalStatus (Pending/Approved/Rejected), ApprovedByUserID (FK, Regional Manager), ApprovalTimestamp, SendStatus, SentCount, FailedCount, CreatedAt |
| **Approval rule** | All bulk sends — regardless of initiating role — require Regional Manager approval before dispatch. Exception: Zonal Manager self-approves their own zone-level sends after previewing recipient count. |
| **Opt-out enforcement** | Farmers with OptOutWhatsApp = true or OptOutSMS = true are excluded from the resolved FarmerIDs list at batch creation time. FieldStaff and Admin are alerted about excluded farmers. |

### Entity 10: Territory Master

| Attribute | Detail |
|---|---|
| **Fields** | TerritoryID, TerritoryName, ParentTerritoryID (FK, supports Region → Zone → Territory hierarchy), AssignedManagerID (FK), FarmerCount (auto-aggregated), Status |
| **Write access** | Admin only. Any restructuring generates a full audit log entry. |

### Entity 11: System Audit Log

| Attribute | Detail |
|---|---|
| **Fields** | LogID, EntityType, EntityID, FieldChanged, OldValue, NewValue, UserID, Timestamp, ActionType (Create/Update/Delete/Export/Login/Logout/BulkImport) |
| **Retention** | 12 months minimum. Append-only — no modifications or deletions permitted. |
| **Access** | Admin only. |

---

## TASK 4 — Primary Workflows

### Workflow 1: Field Staff Logs a Farm Visit and Updates Crop Stage

**Trigger:** Field Staff member opens the app and begins their working day

**Actor:** Field Staff / Agronomist

**Steps:**

1. Staff opens the FFMA Android app. Device-level PIN or biometric authentication is enforced before the app loads.
2. App presents OTP login: Staff enters their registered mobile number → OTP delivered via SMS → Staff enters OTP → JWT session token issued (expires after 15 minutes of inactivity).
3. Home Dashboard loads: Today's Overdue Visit list (ranked), Upcoming Stage Transitions, and in-app notification centre showing any pending alerts.
4. Staff taps the search bar and searches for the target farmer by name or village. Farmer card shows: name, village, primary crop, current stage, and days since last visit (with 'Overdue' badge if applicable).
5. Staff taps the farmer card to open the full Farmer Profile. Tabs visible: Plots & Crops | Activity Log | Recommendations | Communications | Promotions Sent.
6. Staff taps 'Log Visit'. System auto-captures: current date, current time, and current GPS coordinates (or last known location if no signal).
7. Staff selects Visit Purpose, enters notes, and optionally attaches photos (geo-stamped and time-stamped). Photos are compressed per app norms.
8. Staff taps 'Save Visit'. If offline, the record is queued in local storage and synced idempotently on reconnection.
9. Staff navigates to the Plots tab and opens the relevant crop card. Current stage and expected next-stage date are displayed (auto-calculated from sowing date and Crop Master inter-stage durations).
10. If the crop has physically advanced, Staff taps 'Advance Stage'. System presents a confirmation prompt: *'Confirm crop has reached [Stage Name]?'*

**Decision Point:**
- If Staff confirms → an immutable stage change log entry is created (From Stage, To Stage, User, Timestamp). ExpectedNextStageDate is recalculated for the new stage.
- If Staff cancels → no change is made.

**Automations:**
- 'Days Since Last Visit' counter resets to 0 on the farmer card
- Overdue badge is cleared from the home dashboard
- Territory Manager's dashboard updates in real time: visit count, stage changes
- If network was unavailable during the visit, offline sync job dispatches all queued records within 60 seconds of reconnection

**End State:**
- Visit is permanently logged with GPS, timestamp, notes, and photos
- Crop stage is updated with an immutable audit entry
- Farmer is no longer shown as overdue until the next norm cycle

---

### Workflow 2: OTP Authentication and Session Management

**Trigger:** Any user opens the app or admin web interface

**Steps:**

1. User opens the app. Device-level PIN or biometric is enforced by the OS before the app UI loads.
2. User enters their registered mobile number.
3. OTP is dispatched via SMS (DLT-registered sender ID and template used for all sends).
4. User enters the OTP within the validity window.

**Decision Points:**
- Correct OTP → JWT session token issued. User lands on their role-appropriate home screen.
- Incorrect OTP (up to 4 times) → error shown, attempt count incremented.
- 5th consecutive failure → account locked for 30 minutes; Admin receives an in-app notification and dashboard alert.
- Admin can unlock the account early from the admin web interface.

**Automations:**
- Session automatically expires and user is logged out after 15 minutes of inactivity
- Admin can remotely invalidate any active session (for lost or stolen devices)
- Admin web interface supports an additional email-based OTP fallback for account recovery

**End State:**
- Authenticated user has a role-scoped session with data access limited to their permitted scope

---

### Workflow 3: Smart Visit Planner — Daily Schedule Generation

**Trigger:** Daily at a configurable time each morning (system scheduled job)

**Actor:** System → Field Staff

**Steps:**

1. System job runs at the configured morning time. For each active Field Staff member, it queries their assigned farmer list.
2. Each farmer is scored: overdue status (days past the configured visit norm) is the primary ranking factor. GPS proximity from the staff member's current live location — or last known location if live GPS is unavailable — is the secondary factor.
3. Ranked visit list is refreshed on the staff member's home dashboard.
4. Staff can apply filters to the planner: by crop, by distance radius, or by village.
5. Staff uses the filtered, ranked list to plan and sequence their day's route.

**Decision Points:**
- If live GPS is unavailable, last known location is used for proximity calculation. If no location data exists, distance ranking is skipped and overdue status is the sole ranking criterion.
- Filter combinations are additive (e.g. *'Grape farmers in Nashik village within 10 km overdue by 7+ days'*).

**End State:**
- Staff begins their day with a ranked, filtered, actionable visit list
- No farmer can be inadvertently skipped — overdue status surfaces them automatically

---

### Workflow 4: Bulk Message Send with Regional Manager Approval

**Trigger:** Field Staff, Territory Manager, or Zonal Manager initiates a bulk promotional or recommendation send

**Steps:**

1. Sender opens the Bulk Send screen and selects content from the Promotion Library.
2. Sender defines the farmer group using one or more filters: Crop, Crop Stage, Village, or 'All my farmers'.
3. System resolves the farmer list based on filters. Farmers with OptOutWhatsApp or OptOutSMS = true are automatically excluded from the list. Sender is shown a count of excluded farmers and an alert.
4. Sender selects channel (WhatsApp or SMS) and reviews the recipient count.
5. Sender submits the batch for approval. Batch status is set to 'Pending'.
6. Regional Manager receives an in-app notification (and dashboard alert if notifications are disabled on device) to review the pending batch.
7. Regional Manager reviews: content, filter criteria, channel, and recipient count.

**Decision Points:**
- **Approved** → batch status set to 'Approved'; system dispatches messages as a background job. UI shows a non-blocking status screen with sent/failed counts.
- **Rejected** → batch status set to 'Rejected'; sender receives an in-app notification of the rejection. No messages are sent.
- **Zonal Manager initiating a zone-level send** → self-approves after previewing recipient count. No separate approval step required.

**Automations:**
- On temporary gateway failure, system retries automatically. Final delivery status (Sent/Delivered/Failed) is logged per farmer per batch.
- Bulk campaign of 5,000 messages runs as a non-blocking background job — UI remains responsive

**End State:**
- All sent messages are logged in each farmer's Communications tab with channel, content title, timestamp, and delivery status
- Opt-out compliance is enforced automatically — no manual exclusion required

---

### Workflow 5: Bulk Farmer Import

**Trigger:** Admin uploads an Excel file of farmer records

**Actor:** System Administrator

**Steps:**

1. Admin downloads the import template from the admin web interface.
2. Admin uploads the cleaned Excel file (Dhanashree confirms data is in clean format; Staff ID = staff member's mobile number).
3. System validates each row: required fields (Full Name, Primary Mobile, Village, Staff Mobile), mobile number format (10-digit), territory resolution, duplicate detection against existing PrimaryMobile values.
4. System generates an error report listing validation failures and flagged duplicates.

**Decision Points:**
- For imports > 1,000 records: Admin must review and acknowledge the error report before committing. Admin can choose to proceed with valid rows only or abort.
- Duplicate handling: if a PrimaryMobile already exists, the import updates the existing record (merge mode) rather than creating a duplicate. Duplicates are flagged in the report but never auto-merged silently.

5. Admin commits the import. Records are created or updated. Import is idempotent: re-running the same file produces the same outcome.
6. Farmer assignment confirmation: newly imported farmers appear in the assigned staff member's app within 5 minutes of successful import.
7. Admin sees a confirmation summary: total rows processed, records created, records updated, rows skipped.

**End State:**
- All valid farmer records are live in the system and visible to their assigned field staff
- A full audit log entry is created for the import event

---

### Workflow 6: Farmer Data Deletion / Disable Request

**Trigger:** A farmer requests deletion or disabling of their data

**Steps:**

1. Farmer contacts their assigned Field Staff member and requests data deletion.
2. Field Staff raises a deletion/disable request from within the farmer's profile in the app.
3. Request is routed to the System Administrator with farmer ID, requesting staff ID, and timestamp.
4. Admin reviews the request and processes it by setting the farmer's Status to 'Inactive'.
5. Full audit log entry is created for the status change.

**Decision Point:**
- Hard deletion is not available. Only status = Inactive is applied, preserving the historical audit trail while removing the farmer from all active lists, dashboards, and future automated sends.

**End State:**
- Farmer no longer appears in any field staff list, planner, or notification
- Historical activity logs are retained for audit and compliance purposes

---

## TASK 5 — Business Rules

### Validation Rules

| Field / Action | Rule |
|---|---|
| **Mobile Number (all entities)** | Exactly 10 digits, numeric only, no country code prefix required in entry. Stored with +91 prefix internally. |
| **Farmer PrimaryMobile** | Must be unique across the entire Farmer Master. Duplicate triggers a warning — user must confirm merge or abort. |
| **Staff Mobile (Staff ID)** | Must match an existing User record. Import rows with an unmatched Staff Mobile are rejected with a row-level error. |
| **Sowing Date** | Cannot be a future date. Cannot predate the farmer's date of addition to the system by more than 3 years. |
| **Crop Stage Advance** | Stages must be advanced in sequence. Skipping stages is not permitted without Admin override. |
| **Photo upload** | Optional for visit logs. If provided, each photo is compressed per app norms. No hard file-size limit specified; general app norms apply. |
| **OTP attempts** | Maximum 5 consecutive failures before a 30-minute account lock. Admin can unlock early. |
| **Session inactivity** | JWT session expires after 15 minutes of inactivity. User must re-authenticate. |
| **Bulk import (>1,000 rows)** | Admin must review and acknowledge the error report before the commit step is available. |
| **Bulk send opt-out** | Farmers with OptOutWhatsApp = true must be excluded from all WhatsApp bulk sends. Same for OptOutSMS. Exclusions are enforced by the system, not manually. |
| **Content expiry** | Expired content items (ExpiryDate in the past) cannot be selected for new sends. Existing scheduled sends with expired content are cancelled. |
| **Territory restructuring** | Any change to the territory hierarchy generates a full audit log entry before the change is committed. |

### Business Logic Rules

- Each farmer is permanently assigned to exactly one Field Staff member. Reassignment is handled through a formal transfer workflow (Status = Transferred, new assignment created) with a full audit log entry.
- The territory hierarchy is strictly **Region → Zone → Territory → Staff → Farmer**. A user or farmer can only belong to one node at each level at any given time.
- **Crop stage auto-calculation:** ExpectedNextStageDate = SowingDate + cumulative sum of DaysFromPreviousStage for all stages from Stage 1 to the next stage in the Crop Master sequence.
- **DaysSinceLastVisit** and **DaysSinceLastCall** are always calculated at query time from the latest Activity Log entry. They are never stored as fields, ensuring they are always current.
- **Overdue status:** a farmer is 'overdue' when DaysSinceLastVisit ≥ the visit frequency norm configured by the Admin for that farmer's segment. The default norm examples cited are 7 and 14 days.
- **Smart Visit Planner ranking:** primary sort = overdue days descending (most overdue first); secondary sort = GPS proximity ascending (nearest first). Staff-applied filters (crop, village, distance) are applied before ranking.
- **Stage advance is user-confirmed only** — the system surfaces a proposal when ExpectedNextStageDate is reached, but the stage is only advanced when the Field Staff member explicitly confirms having physically observed the transition.
- All activity log entries (visits, calls, stage changes, send events) are **immutable** once created. No edit or delete operations are available to any role.
- **Offline sync idempotency:** each offline record carries a client-generated UUID. On sync, the server uses this UUID to prevent duplicate record creation if the same sync payload is received more than once.

### Approval Chains

| Action | Initiated By | Approved By | Notes |
|---|---|---|---|
| **Bulk message send (FieldStaff / TerritoryManager)** | FieldStaff or Territory Manager | Regional Manager | RM reviews content, filters, recipient count. Reject = no send. |
| **Bulk message send (Zonal Manager, zone-level)** | Zonal Manager | Self (after preview) | Must view recipient count before confirming. |
| **New staff account creation** | Admin / HR request | System Administrator | Role assigned at creation. Cannot be self-modified. |
| **Territory restructuring** | Manager request | System Administrator | Full audit log on any change. |
| **Bulk farmer import > 1,000 rows** | Admin | Admin (self, after error review) | Idempotent. Duplicates flagged, not auto-merged. |
| **Farmer data disable request** | Field Staff | System Administrator | Soft disable only. Hard delete not permitted. |
| **WhatsApp template registration** | Admin | Meta (WABA) — external | Required before communication module goes live. |
| **SMS template registration** | Admin | TRAI DLT — external (already registered) | DLT sender ID and templates already registered. |

### Calculation Formulas

| Metric | Formula |
|---|---|
| **Expected Next Stage Date** | SowingDate + Σ(DaysFromPreviousStage) for stages 1 through N+1 in CropMaster, where N = current stage sequence number |
| **Days Since Last Visit** | Current Date − MAX(VisitDate) for farmer's visit log. Returns NULL if no visit ever logged. |
| **Days Since Last Call** | Current Date − MAX(CallDate) for farmer's call log. Returns NULL if no call ever logged. |
| **Overdue Status** | DaysSinceLastVisit ≥ VisitFrequencyNorm (configured per farmer segment by Admin). True = Overdue. |
| **Planner Score** | Primary: OverdueDays DESC. Secondary: HaversineDistance(StaffCurrentGPS, FarmerVillageGPS) ASC. |
| **Territory Farmer Count** | COUNT(FarmerID) WHERE TerritoryID = X AND Status = Active. Auto-aggregated; not stored. |
| **Bulk send delivery rate** | (SentCount ÷ RecipientCount) × 100. Displayed on batch status screen. |

---

## TASK 6 — Success Metrics

The following metrics define what measurable success looks like across user experience, business impact, and operational efficiency. These should be baselined at launch and reviewed at **30, 60, and 90 days** post-deployment.

### User Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| **Daily Active Users (Field Staff)** | ≥ 80% of 60 staff log at least one action per working day within 60 days of launch | Activity log entries per user per day |
| **Visit log completion rate** | ≥ 90% of completed farm visits are logged within 2 hours of the visit | Visit timestamp vs. GPS movement pattern |
| **Overdue visit clearance rate** | Overdue list reduces by ≥ 50% within first 30 days vs. baseline estimate | Overdue farmer count on Territory Manager dashboard |
| **Stage update accuracy** | ≥ 85% of crop stage advances made within 3 days of expected transition date | Stage change timestamp vs. ExpectedNextStageDate |
| **App task completion time** | Logging a visit: < 3 minutes end-to-end on a 2G connection | In-app event timing |
| **Offline usage rate** | App correctly queues and syncs ≥ 99% of offline-created records without data loss | Sync success/failure log |
| **Farmer search time** | Farmer found within 10 seconds from home screen | Event timing from search tap to profile open |

### Business Impact Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| **Farmer coverage rate** | ≥ 95% of active farmers receive at least one logged visit per configured norm cycle within 90 days | Overdue farmer count per territory |
| **Promotional content reach** | ≥ 70% of targeted farmers receive a stage-appropriate content push within 7 days of stage transition | Bulk send delivery logs vs. stage transition events |
| **Recommendation volume** | 100% of product recommendations are digitally recorded vs. 0% currently | Recommendation log count |
| **Management call reduction** | ≥ 80% reduction in manager-to-staff status check calls within 60 days | Self-reported by Territory Managers at 30/60-day review |
| **Data completeness** | ≥ 95% of active farmer records have: crop assigned, sowing date, at least one visit in the last norm cycle | Data quality report from admin dashboard |
| **Scalability readiness** | Architecture validated against 200 staff / 200,000 farmer load test before Phase 2 development begins | Load test report |

### Operational Efficiency Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| **System availability** | ≥ 99.5% uptime 6 AM–10 PM IST | Server uptime monitoring |
| **Farmer list load time (4G)** | < 2 seconds for first 50 records | API response time logs |
| **Dashboard load time (4G)** | < 3 seconds for current-period data | API response time logs |
| **Offline sync time on reconnect** | All queued actions synced within 60 seconds of network restoration | Sync job completion logs |
| **Bulk campaign dispatch (5,000 msg)** | Non-blocking UI; background job completes within 30 minutes | Job completion timestamp |
| **Bulk import processing time** | 50,000-record import completes validation and commit within 15 minutes | Import job log |
| **Photo upload time (5 MB, 4G)** | < 10 seconds with background upload and retry | Upload completion logs |
| **App install size** | ≤ 50 MB APK | Build output size check in CI/CD pipeline |

---

## Suggested Budget and Timeline

> *The following estimates are indicative based on the documented scope. Final figures should be reviewed with the development team and revised after a technical discovery sprint.*

### Suggested Timeline — 3 Phases

| Phase | Duration | Key Deliverables |
|---|---|---|
| **Discovery & Design** | 4 weeks | Tech stack finalisation, Crop Master data validation (15 crops), WhatsApp BSP selection and WABA application initiation, UX wireframes and design system in English + Marathi, data model review, API contract definition |
| **Phase 1 Development** | 16–20 weeks | All MVP features: OTP auth, Farmer CRUD, bulk import, plot + crop tracking, visit + call logging, recommendations, WhatsApp/SMS integration, Smart Visit Planner, dashboards, offline sync, audit logs, report export |
| **UAT, Pilot & Go-Live** | 4–6 weeks | UAT with 5–10 pilot field staff, data migration of ~50,000 farmer records, staff training, production deployment on AWS/Azure Mumbai, hypercare support period |

**Total Indicative Timeline: 24–30 weeks from kick-off to production go-live.**

### Suggested Budget Range (Indicative)

| Component | Lean Estimate | Comfortable Estimate |
|---|---|---|
| **Android App + Admin Web Development** | ₹18–22 lakhs | ₹25–32 lakhs |
| **UI/UX Design (English + Marathi)** | ₹2–3 lakhs | ₹4–5 lakhs |
| **WhatsApp BSP setup + first-year API cost** | ₹1.5–2.5 lakhs/year | ₹3–5 lakhs/year |
| **AWS/Azure Mumbai hosting (first year)** | ₹1.5–2.5 lakhs/year | ₹3–4 lakhs/year |
| **QA, UAT & Data Migration** | ₹2–3 lakhs | ₹3–4 lakhs |
| **Project Management & Documentation** | ₹1–2 lakhs | ₹2–3 lakhs |
| **Total Phase 1 (one-time + year 1 ops)** | **₹26–35 lakhs** | **₹40–53 lakhs** |

> *Note: Phase 2 (NDVI, satellite, weather intelligence) costs depend entirely on third-party satellite API provider pricing agreements (Cropin, SatSure, ISRO Bhuvan, SkyMet). These should be evaluated and contracted during Phase 1 development so that API agreements are in place before Phase 2 begins.*

---

## Appendix A — Automations & Notifications

All automated actions listed below are system-triggered without manual intervention. Where push notifications are disabled on a user's device, the notification is surfaced as an in-app alert on the user's home dashboard instead.

| Automation | Trigger Condition | Recipient | Fallback if Notifications Off |
|---|---|---|---|
| **Overdue visit alert** | DaysSinceLastVisit ≥ configured norm (e.g. 7 or 14 days) | Assigned Field Staff | Home dashboard overdue list |
| **Stage transition reminder** | ExpectedNextStageDate reached for any farmer's crop | Assigned Field Staff | Home dashboard upcoming transitions widget |
| **Smart Visit Planner refresh** | Every morning at configurable time | Field Staff (updated ranked list) | Home dashboard list auto-refreshed on app open |
| **Stage advance proposal** | ExpectedNextStageDate reached | Field Staff (prompt on farmer profile) | Banner on farmer's crop card |
| **Bulk import confirmation** | Import job completes successfully | Admin | Admin dashboard import history |
| **Duplicate mobile number warning** | Farmer creation/import with existing mobile | Creating Staff or Admin | Blocking warning dialog before save |
| **Bulk send approval request** | Bulk batch submitted | Regional Manager | Pending approvals dashboard widget |
| **Bulk send result notification** | Batch approved and dispatched | Initiating user | Dashboard batch status screen |
| **Bulk send rejection notification** | Batch rejected by Regional Manager | Initiating user | Dashboard notification centre |
| **Opt-out exclusion alert** | Farmer(s) excluded from bulk send due to opt-out | Initiating user and Admin | Shown in batch preview before submission |
| **Session expiry** | 15 minutes of app inactivity | Current user (automatic logout) | N/A — always enforced |
| **Account lock notification** | 5 consecutive OTP failures | Admin (alert) | Admin dashboard security alerts widget |
| **Offline sync completion** | Network restored after offline period | Silent (no user notification) | Sync status icon in app status bar |
| **WhatsApp/SMS retry and final status** | Gateway failure on send | System retry; final status logged | Batch status screen updated |
| **Farmer assignment (post-import)** | Successful bulk import | Assigned staff see new farmers within 5 min | Farmer appears in search results |

---

## Appendix B — Technical Constraints & Infrastructure

### Device & Platform Requirements

| Constraint | Specification |
|---|---|
| **Mobile OS** | Android 8.0+ (API level 26 and above) |
| **Mobile RAM** | 2 GB minimum. App must be performant on low-end devices. |
| **iOS support** | Not required for Phase 1. |
| **App install size** | ≤ 50 MB APK |
| **Network tolerance** | Core workflows (visit log, call log, crop stage update, photo capture) fully functional offline. App must work on connections from 2G to 5G. |
| **Data efficiency** | Never require a fast connection for core workflows. Payload sizes minimised; images compressed before upload. |
| **Admin/Manager interface** | Desktop/laptop browser. No specific browser listed — standard modern browser compatibility (Chrome, Firefox, Edge). |
| **Push notifications** | Firebase Cloud Messaging (FCM) recommended for Android. Where device notifications are disabled, alerts surface on in-app dashboard. |
| **Data residency** | All data hosted on AWS or Azure Mumbai region (ap-south-1). |
| **Availability** | 99.5% uptime 6 AM–10 PM IST. Scheduled maintenance overnight windows only. |
| **Scalability** | Architecture must support 200 field staff and 200,000 farmers without re-architecture. |
| **Concurrent users** | All 60+ field staff syncing simultaneously without performance degradation. |
| **Backup** | Daily automated backups, 30-day retention, point-in-time recovery. |
| **Audit log retention** | 12 months minimum; append-only; Admin access only. |
| **Regulatory** | IT Act 2000 (farmer PII access logged), WhatsApp WABA templates required, TRAI DLT registration already in place. |
| **Tech stack** | To be confirmed in subsequent conversations. Architecture must be compatible with all constraints above. |
