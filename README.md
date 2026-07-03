# Blood Bank Management System - نظام إدارة بنوك الدم

نظام متكامل لإدارة بنوك الدم يشمل المخزون اليومي والتقارير الشهرية ومؤشرات الأداء للبنوك التجميعية والتخزينية.

## Features

- **Daily Operations**: مخزون يومي، كشوف يومية، تقارير فروع
- **Monthly Indicators**: مؤشرات أداء للبنوك التجميعية (`monthly_big_indicators`) والتخزينية (`monthly_small_indicators`)
- **Consumption**: استهلاك شهري
- **Employee Statement**: بيان العاملين ببنوك الدم — CRUD من `/api/employee-statements` مع جدول منفصل لمشرفي الفروع
- **Monthly Review**: مراجعة شهرية لبيان العاملين — كارت أحمر في لوحة التحكم للمستخدم `hospital` مع زر "مراجعه" → زر "تمت المراجعه" داخل الصفحة → يتتبع شهرياً في جدول `employee_monthly_updates`
- **Archive**: أرشفة واسترجاع البيانات مع دعم اللصق المباشر من Excel وقفل/فتح التعديل
- **Strategic Stock**: الرصيد الاستراتيجي
- **Readiness Sheet**: شيت الجاهزية للإجازات الرسمية — مناسبات + مستشفيات + جدول موظفين + ملخص رصيد/صيانة/أعطال/عجز مع تنبيهات وطباعة احترافية
- **RBAC**: 6 أدوار مع صلاحيات لكل صفحة
- **Dark Mode**: واجهة ليلية
- **Export**: تصدير XLSX/PDF/CSV

## Tech Stack

- **Backend**: Node.js + Express 4.18 (1421 lines)
- **Database**: JSON File (dev, jsondb.js 479 lines) / PostgreSQL (prod)
- **Frontend**: Vanilla JS SPA (5490 lines), CSS (763 lines)
- **Session**: memorystore (dev) / connect-pg-simple (prod)
- **Auth**: Express-session + RBAC middleware
- **Excel**: xlsx library for XLSX generation

## Project Structure

```
blood-bank-server/
├── server.js              # Express server (1421 lines)
├── jsondb.js              # JSON file database (479 lines)
├── init-db.js             # Database initializer
├── package.json
├── backup.ps1             # Backup PowerShell script
├── backup.bat             # Backup batch launcher
├── README.md              # This file
├── public/
│   ├── index.html         # SPA entry point
│   ├── css/style.css      # All styles (763 lines)
│   ├── js/app.js          # SPA client (5490 lines)
│   └── img/               # Logo images
├── data/
│   ├── db.json            # JSON database file
│   ├── جاھزية بنوك الدم.xlsx  # Readiness reference Excel
│   ├── seed-*.js          # Seed scripts
│   ├── create-users.js    # User creation
│   └── start-server.js    # Daemon launcher
├── scripts/
│   ├── import-desktop.js  # Main import from Excel
│   ├── import-ward.js     # Import وارد data
│   ├── import-from-excel.js
│   ├── audit-data.js      # Data integrity audit
│   ├── check-data.js      # Data checker
│   ├── investigate.js     # Data investigation
│   ├── investigate2.js    # Column value investigation
│   ├── test-match.js      # Hospital name matching tests
│   ├── debug-match.js     # Matching debug
│   └── create-managers.js # Manager user creation
├── import_*.js            # Legacy import scripts
├── indicators_2026.xlsx   # Excel data source
├── backups/               # Auto-generated backups (script: backup.ps1)
└── blood-bank/            # Legacy frontend copy (index.html, css/, js/)
```

## Running

```bash
npm start              # Start on port 3001
npm run build          # Initialize database
npx pm2 restart blood-bank   # Restart via PM2
```

## Endpoints (server.js)

### Auth
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Current user info

### Master Data
- `GET/POST /api/hospitals` - Hospitals CRUD
- `GET/POST /api/governorates` - Governorates CRUD
- `GET/POST /api/hospital-types` - Hospital types
- `GET/POST /api/users` - Users CRUD
- `GET/POST /api/roles-perms` - Role permissions

### Monthly Operations
- `GET/POST /api/monthly-big-indicators` - مؤشرات البنوك التجميعية
- `GET/POST /api/monthly-small-indicators` - مؤشرات البنوك التخزينية
- `DELETE /api/monthly-big-indicators/:id`
- `DELETE /api/monthly-small-indicators/:id`

### Employee Statements
- `GET /api/employee-statements` - بيان العاملين (returns `{rows, hospitalStatus}` where `hospitalStatus[].monthlyUpdated` = تمت المراجعة هذا الشهر)
- `POST /api/employee-statements` - إضافة موظف
- `PUT /api/employee-statements/:id` - تعديل موظف
- `DELETE /api/employee-statements/:id` - حذف موظف
- `POST /api/employee-statements/mark-updated` - تأكيد مراجعة شهرية (للمستخدم `hospital` فقط)
- `POST /api/employee-statements/track-view` - تسجيل مشاهدة الصفحة

### Readiness Sheet (شيت الجاهزيه)
- `GET /api/readiness-occasions` - المناسبات (إجازات رسمية)
- `POST /api/readiness-occasions` - إضافة مناسبة (ينشئ تنبيهاً للمستخدمين)
- `PUT /api/readiness-occasions/:id` - تعديل مناسبة
- `DELETE /api/readiness-occasions/:id` - حذف مناسبة
- `GET /api/readiness-reports` - تقارير المستشفيات لكل مناسبة (مرشحة حسب دور المستخدم)
- `POST /api/readiness-reports` - إضافة تقرير مستشفى
- `PUT /api/readiness-reports/:id` - تعديل تقرير
- `DELETE /api/readiness-reports/:id` - حذف تقرير
- `GET /api/readiness-notifications` - التنبيهات غير المقروءة
- `PUT /api/readiness-notifications/:id/dismiss` - إخفاء تنبيه
- `GET /api/readiness-export/xlsx` - تصدير Excel منسق بكل المناسبات والتقارير (مع تذييل "إعداد وبرمجة / محمد ندا")
- `GET /api/readiness-sheet` - (قديم) قراءة ملف Excel "جاهزية بنوك الدم"

### Other
- `GET/POST /api/daily-stock`
- `GET/POST /api/daily-statements`
- `GET/POST /api/daily-reports`
- `GET/POST /api/monthly-storage`
- `GET/POST /api/monthly-aggregate`
- `GET/POST /api/monthly-consumption`
- `GET/POST /api/strategic-reserves`
- `GET/POST /api/archive`
- `POST /api/monthly-big-indicators/archive-direct` - كتابة مؤشرات تجميعية مباشرة في الأرشيف
- `POST /api/monthly-small-indicators/archive-direct` - كتابة مؤشرات تخزينية مباشرة في الأرشيف

## Database Schema (jsondb)

### monthly_big_indicators
| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-increment |
| hospital_id | number | FK to hospitals |
| year | number | Year |
| month | number | Month (1-12) |
| data | JSON string | All indicator values as JSON |
| user_id | number | FK to users |
| created_at | timestamp | |
| updated_at | timestamp | |

### monthly_small_indicators
(Same structure as big)

### readiness_occasions
| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-increment |
| name | string | اسم المناسبة (الإجازة) |
| date_from | string | تاريخ البداية |
| date_to | string | تاريخ النهاية |
| day_labels | string[] | أسماء الأيام |
| user_id | number | FK to users |
| created_at | timestamp | |
| updated_at | timestamp | |

### readiness_reports
| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-increment |
| occasion_id | number | FK to readiness_occasions |
| hospital_id | number | FK to hospitals |
| hospital_name | string | |
| governorate | string | |
| staff_data | JSON string | `[{name, phone, schedule[]}]` |
| deficit | JSON string | `{has, desc}` |
| stock | string | كافي/غير كافي |
| stock_details | string | بيان الرصيد (فصائل الدم) |
| maintenance | string | تم/لم تتم |
| breakdowns | JSON string | `{has, desc, affects}` |
| consumables | string | كافية/غير كافية |
| substitution | string | جهة التعويض |
| mgr_notes | string | ملاحظات مدير بنك الدم |
| sup_notes | string | تعليق مشرف الفرع |
| org_notes | string | تعليق مشرف الهيئة |
| user_id | number | |
| created_at | timestamp | |
| updated_at | timestamp | |

### readiness_notifications
| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-increment |
| occasion_id | number | |
| occasion_name | string | |
| message | string | نص التنبيه |
| created_by | string | اسم منشئ المناسبة |
| created_at | timestamp | |
| dismissed | boolean | |

## Indicator Fields

### BIG (monthly_big_indicators) - التجميعي

| Key | Label | Type |
|-----|-------|------|
| collect_total | التجميع | input |
| inc_blood, inc_plasma, inc_sdp, inc_rdp | إجمالي الوارد | input |
| out_blood_int, out_blood_branch, out_blood_auth, out_blood_ext | منصرف دم | input |
| out_plasma_int, out_plasma_ext | منصرف بلازما | input |
| out_sdp, out_rdp | منصرف صفائح | input |
| blood_groups | الفصائل | input |
| compatibility | التوافق | input |
| donation_therapeutic | تبرع علاجي | input |
| uncompleted | لم يكتمل | input |
| refused_fatty, refused_icteric | عينات مرفوضة | input |
| disp_exp_blood/plasma/sdp/rdp | إعدام - إنتهاء صلاحية | input |
| disp_returned, disp_reaction, disp_open, disp_other | إعدامات أخرى | input |
| virology_c, virology_b, virology_i, virology_dollar | فيروسات | input |
| child_inc_collected, child_inc_regional | وارد أطفال | input |
| child_out_blood | منصرف أطفال | input |
| child_blood_groups, child_compatibility | فصائل/توافق أطفال | input |
| child_disp_* | إعدامات أطفال | input |

### Formula Fields (BIG)

| Key | Formula | Target |
|-----|---------|--------|
| total_blood | collectTotal | - |
| tested | collectTotal - icteric - دهون - لم يكتمل - علاجي | > last |
| ct | التوافق ÷ (منصرف داخلي + خارجي) | <2 |
| virology_total | C + B + I + $ | - |
| ratio_uncompleted | لم يكتمل ÷ (collectTotal - علاجي) | <2% |
| ratio_refused | (دهون + Icteric) ÷ (collectTotal - علاجي - لم يكتمل) | <1% |
| ratio_c/b/i/$ | فيروس ÷ tested | <3% / <1% / <0.5% |
| ratio_exp | Exp ÷ (collectTotal + incBlood - علاجي - لم يكتمل - Icteric - فيروسات) | 0 |
| ratio_returned/reaction/open/other | disp ÷ out_blood_int | <1% / <2% |
| child_ct | child_out_blood ÷ child_compatibility | <2 |
| child_pct_* | child_disp ÷ child_out_blood | <1-2% |

## Backup

### Scripts
- `backup.bat` - Double-click to backup entire project to `backups/` folder
- `backup.ps1` - PowerShell version with timestamped zip (includes all source files + db.json)
- Auto-backup: تشغيل `.\backup.bat` بعد أي تعديل على المشروع

### Restore
Simply extract the zip to the project root, overwriting files.

## Import Scripts

### `scripts/import-desktop.js`
Imports data from desktop Excel files (`indicators_2026.xlsx`) into the database:
- Reads `مؤشرات تجميعي` and `مؤشرات تخزيني` sheets
- Maps columns via `BIG_COL_MAP` / `SMALL_COL_MAP`
- Matches hospital names with fuzzy matching + lookup table (`SHEET_NAME_MAP`, `EXTRA_NAMES`)
- Auto-creates new hospitals if not found
- Dedup: skips duplicate rows (fixed: was summing values, causing doubled data)
- Output: creates archive records in `db.json`

## Archive Features

### أرشيف منصرف الفصائل (`showArchiveConsumption`)
- Admin form: direct entry of blood type consumption by hospital/month
- Filter by: governorate, year, month, hospital
- Table: displays all saved records with edit/delete

### أرشيف مؤشرات الأداء (`showArchiveIndicators`)
- Admin form: direct entry of BIG (تجميعي) or SMALL (تخزيني) indicators using the same `buildIndicatorFormHTML` form system
- Type toggle switches between BIG_COL_DEFS and SMALL_COL_DEFS form
- Filter by: governorate, year, month, period (شهري/ربع/نصف/سنوي), type (تجميعي/تخزيني), hospital
- Table: renders all non-formula fields from BIG_COL_DEFS and SMALL_COL_DEFS
- Uses `archive-direct` endpoints to bypass the monthly table validation

### 🔒 Edit Lock / 🔓 Unlock
- Button in the filters bar (admin only)
- When **locked** (default): all cells are read-only
- When **unlocked**: cells become `contenteditable="true"`, allowing direct data entry
- Locking triggers `blur()` on all cells to save pending changes
- Controlled by `window._archiveEditLocked` and `window._isArchiveAdmin`

### 📋 Smart Paste from Excel
- `handleArchivePaste()` function in `app.js`
- Paste data copied from Excel (tab-separated) directly into the table
- **Row paste**: tab-separated values distribute across cells to the right
- **Column paste**: newline-separated values distribute to same column in rows below
- **Block paste**: multi-row × multi-column data distributed as a grid
- Admin only and respects edit lock state

### Table Features
- **Month sorting**: records sorted by year then month ascending (يناير→ديسمبر)
- **Formula cells**: computed fields match regular cell styling (no purple/gradient/sigma)
- **Font size**: 12px base, responsive across all screen sizes

## Maintaining Documentation & Backup

After any changes to the project, run:

```bash
# PowerShell
.\backup.ps1

# or double-click backup.bat
```

This creates a timestamped zip in `backups/` with all source files, database, and docs.

## Changelog

### 2026-07-01 (late night) — Readiness Overhaul
- **Readiness notifications**: New `readiness_notifications` array in db schema. Creating an occasion via `POST /api/readiness-occasions` auto-creates a notification. `checkAlerts()` fetches and displays them on the home screen with dismiss button (`rdnDismissNotif()`).
- **New endpoints**: `GET /api/readiness-notifications`, `PUT /api/readiness-notifications/:id/dismiss`, `GET /api/readiness-export/xlsx`
- **Role-based filtering**: `GET /api/readiness-reports` now filters by user role — `hospital` sees only own hospital, `branch_supervisor` sees only governorate hospitals, `admin/org_supervisor` sees all
- **Excel export**: Server-side XLSX generation via xlsx library — formatted columns, per-occasion sheets, footer "إعداد وبرمجة / محمد ندا"
- **PDF/Print enhancement**: Professional print layout with thicker borders, header background, footer "إعداد وبرمجة / محمد ندا"
- **Day schedule dropdown**: Each day column now a `<select>` with options (12A, 12P, 24, AB, 12A 6L, أخرى). Selecting "أخرى" converts to text input. Updated `rdnAddStaff()`, `rdnSaveReport()`, `rdnRenumberStaff()` accordingly.

### 2026-07-01 (night)
- **Monthly review system**: New `employee_monthly_updates` table tracks monthly review per hospital. Red dashboard card with "مراجعه" button for `hospital` users who haven't reviewed this month. "تمت المراجعه" button inside `renderEmployeeStatement()` calls `POST /api/employee-statements/mark-updated`. Card turns green once reviewed. Tracked monthly by `{hospital_id, month, year}`.
- **New endpoint**: `POST /api/employee-statements/mark-updated` — marks the current month as reviewed for the logged-in hospital user.
- **GET /api/employee-statements** now returns `monthlyUpdated: true/false` in each `hospitalStatus` entry.
- **Backup script**: Updated `backup.ps1` to include all `scripts/`, entire `public/` folder, and `temp_restore/`.
- **Readiness Sheet**: New icon "شيت الجاهزيه" under "أخرى" category. Opens `renderReadinessSheet()` which reads `data/جاهزية بنوك الدم.xlsx` via `GET /api/readiness-sheet` endpoint and displays both sheets (مشرفي بنوك الدم + الجاهزية) in tabbed tables. Excel file copied from `C:\Users\PC\Downloads`. README.md and backup now auto-updated after changes.

### 2026-07-01 (evening)
- **Employee statement print/export credit**: Added "إعداد و برمجة محمد ندا 01068880999" footer to `printEmployeeTable()` (PDF) and `exportEmployeeExcel()` (CSV) to match other report exports.
- **Archive menu tip**: Added `items` to the archive category in `MENU_CATS` so the main menu shows a hover tip with its sub-items (منصرف الفصائل, مؤشرات الأداء). Updated `showMenu()` to show tips for items that have both `page` and `items`.
- **Monthly update notification**: Removed auto `track-view` call from `renderEmployeeStatement()` — viewing the page no longer counts as "updating". Alert now only clears when actual data is added/edited (POST/PUT set `updated_at`). Prominent red banner on employee statement page lists overdue hospitals. Dashboard alert shows red for hospital user's own overdue status.

### 2026-07-01 (afternoon)
- **jsondb.js INSERT fix**: regex `/VALUES\s*\((.+?)\)/i` (lazy) matched only up to first `)` — broke on `NOW()`. Changed to `/VALUES\s*\((.+)\)\s*(?:RETURNING|;|$)/i` (greedy, stop at RETURNING/; or EOL)
- **Supervisor table rewrite**: Branch supervisors now sourced from `employee_statements` (category = 'مشرف فرع') instead of `/users` (role === 'branch_supervisor')
- **Supervisor CRUD**: Dedicated `showAddSupInEmpPage`, `showEditSupInEmpPage`, `showDeleteSupInEmpPage` — all wrapped in try-catch with toast errors
- **Search for supervisors**: `supSearch` input with `applySupFilter()` — search by name in supervisor table
- **Employee edit fix**: `empShowEditModal` now wrapped in try-catch with toast error
- **String safety**: All template literal `.replace()` calls wrapped with `String()` to prevent crash when `national_id`, `phone`, `email` are numeric types
- **Search null safety**: `applyEmpFilter()` / print / export — null-safe `d.employee` check in search filter
- **Page layout reorder**: Stats summary → supervisor section (collapsible) → employee filter & table
- **Org name**: Print template uses "هيئة التامين الصحي الشامل"
- **التصنيف field**: Changed from `<input>` to `<select>` (تعاقد/اساسي/منتدب) in add & edit modals
- **Shift fields removed**: الدوام and الشفتات removed from all modals, POST/PUT bodies, missing data scan, and print filter

### 2026-07-01 (morning)
- **Employee Statement page**: `renderEmployeeStatement()` — reads Excel from desktop, 12-column table with filters (gov/hospital/category/classification), search, stats summary, CSV export
- **Permissions fix**: Restricted `role_perms` management to admin only; added `supervisor_data` to org_supervisor/branch_supervisor; added `strategic_stock` to permission editor; fixed hospital role having full role_perms access
- **Consumption → Employees**: Replaced "استهلاك" menu item with "بيان العاملين" under "أخرى"; permission key renamed `consumption` → `employees` in db.json and PERM_PAGES
- **Archive restored**: Accidentally removed from MENU_CATS during merge; restored as standalone item
- **Smart paste**: `handleArchivePaste()` — paste rows/columns/blocks from Excel into archive table cells
- **Edit lock**: Toggle button to lock/unlock editing (default locked), admin only
- **Month sorting**: Archive records sorted by year/month ascending
- **Font size**: Increased table font to 12px base, better responsive scaling
- **Visual polish**: Toast notification component, page-title gradient, global scrollbar, card/button refinements
- **Dedup fix**: Import no longer sums duplicate rows (was doubling values)
