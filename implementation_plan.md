# Production-Grade Database Seeding System for JobSprint

Build a complete, realistic database seeding system that populates JobSprint with production-quality demo data simulating a live Indian job portal.

---

## Existing Architecture Analysis

### Models Inventory (10 models — **all will be reused, none duplicated**)

| Model | File | Key Fields | Relationships |
|-------|------|-----------|---------------|
| **User** | [User.js](file:///c:/NodeProjects/JobSprint/backend/src/models/User.js) | email, passwordHash, role (`candidate`/`recruiter`/`admin`), isVerified, isActive, lastLoginAt, failedLoginAttempts | Root identity entity |
| **Company** | [Company.js](file:///c:/NodeProjects/JobSprint/backend/src/models/Company.js) | name (unique), logo, website, description, industry, size (enum), foundedYear, locations[], isVerified | Has many Jobs, RecruiterProfiles |
| **CandidateProfile** | [CandidateProfile.js](file:///c:/NodeProjects/JobSprint/backend/src/models/CandidateProfile.js) | userId (1:1), firstName, lastName, phone, resumeUrl, summary, skills[], experience[], education[], portfolioLinks{github,linkedin,website} | Belongs to User |
| **RecruiterProfile** | [RecruiterProfile.js](file:///c:/NodeProjects/JobSprint/backend/src/models/RecruiterProfile.js) | userId (1:1), companyId, jobTitle, phone | Belongs to User & Company |
| **Job** | [Job.js](file:///c:/NodeProjects/JobSprint/backend/src/models/Job.js) | title, description, requirements[], skillsRequired[], companyId, recruiterId, locationType (enum), location, salaryRange{min,max,currency}, jobType (enum), status, expiresAt | Belongs to Company & User(recruiter) |
| **Application** | [Application.js](file:///c:/NodeProjects/JobSprint/backend/src/models/Application.js) | jobId, candidateId (compound unique), resumeUrl, coverLetter, status (enum), statusTimeline[], recruiterNotes[] | Belongs to Job & User(candidate) |
| **SavedJob** | [SavedJob.js](file:///c:/NodeProjects/JobSprint/backend/src/models/SavedJob.js) | candidateId, jobId (compound unique) | Belongs to User & Job |
| **Notification** | [Notification.js](file:///c:/NodeProjects/JobSprint/backend/src/models/Notification.js) | userId, title, message, type (enum), isRead | Belongs to User |
| **AuditLog** | [AuditLog.js](file:///c:/NodeProjects/JobSprint/backend/src/models/AuditLog.js) | userId (nullable), action, ipAddress, userAgent, details (Mixed), severity | Belongs to User |
| **JobAlert** | [JobAlert.js](file:///c:/NodeProjects/JobSprint/backend/src/models/JobAlert.js) | userId, keyword, locationType, jobType, minSalary, isActive | Belongs to User |

### Schema Constraints to Respect During Seeding

> [!IMPORTANT]
> These constraints must be enforced by the seed system to avoid validation errors:

- **User.email** — unique, lowercase, E.164 regex validated
- **Company.name** — unique, max 100 chars
- **Company.size** — enum: `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1000+`
- **Job.locationType** — enum: `remote`, `onsite`, `hybrid`
- **Job.jobType** — enum: `full-time`, `part-time`, `contract`, `internship`
- **Job.status** — enum: `active`, `closed`, `archived`
- **Job.salaryRange.currency** — default `USD` (we'll set to `INR` for Indian portal)
- **Application.status** — enum: `applied`, `screening`, `interviewing`, `offered`, `rejected`, `withdrawn`
- **Application** — compound unique on `{jobId, candidateId}` (no duplicate applications)
- **SavedJob** — compound unique on `{candidateId, jobId}`
- **Notification.type** — enum: `application_status`, `new_job`, `profile_view`, `system`
- **AuditLog.severity** — enum: `info`, `warning`, `critical`
- **CandidateProfile.phone** — E.164 regex: `+91XXXXXXXXXX`
- **CandidateProfile.portfolioLinks.github** — must match GitHub URL regex
- **CandidateProfile.portfolioLinks.linkedin** — must match LinkedIn URL regex
- **User.passwordHash** — triggers bcrypt pre-save hook (salt rounds 12)

### Tech Stack Compatibility

- **Module system**: ES Modules (`"type": "module"`)
- **Node**: ≥22.0.0
- **DB**: MongoDB via Mongoose 8.x
- **Logging**: Winston
- **Env**: dotenv + Zod validation
- **Connection**: [db.js](file:///c:/NodeProjects/JobSprint/backend/src/config/db.js) — `connectDB()` / `disconnectDB()`

---

## Open Questions

> [!IMPORTANT]
> **Password for seed users**: All seed users will use the password `JobSprint@2024` — is this acceptable, or would you prefer per-role passwords (e.g., `Candidate@2024`, `Recruiter@2024`)?

> [!NOTE]
> **Image strategy**: Since this is demo/seed data, I'll use deterministic placeholder URLs from services like `ui-avatars.com` (for profile photos based on initials), `logo.clearbit.com` (for real company logos), and `picsum.photos` (for cover images). No images will be downloaded or stored locally — only URLs. This keeps the seed lightweight and fast.

---

## Proposed Changes

### Phase 1: Project Setup & Data Foundation

#### [NEW] [scripts/seed/](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/) — Seed directory structure

```
backend/scripts/seed/
├── index.js              # Master orchestrator (seed all)
├── clear.js              # Clear all seeded data
├── seedCompanies.js      # 150+ companies
├── seedRecruiters.js     # 300 recruiters (User + RecruiterProfile)
├── seedCandidates.js     # 1000 candidates (User + CandidateProfile)
├── seedJobs.js           # 3000 jobs
├── seedApplications.js   # 10000 applications
├── seedNotifications.js  # Realistic notifications
├── seedSavedJobs.js      # Saved/bookmarked jobs
├── seedAuditLogs.js      # Security audit trail
├── seedAdmin.js          # Admin user(s)
├── seedAnalytics.js      # Analytics summary data (generates via aggregation)
├── utils/
│   ├── connection.js     # DB connect/disconnect for standalone scripts
│   ├── progress.js       # CLI progress logging utility
│   └── helpers.js        # Shared helpers (random pick, date gen, etc.)
└── data/
    ├── companies.js      # 150+ company definitions
    ├── skills.js         # Skill pools mapped by role
    ├── jobTemplates.js   # Job titles, descriptions, requirements by role
    ├── names.js          # Indian first/last name pools
    ├── institutions.js   # Indian universities & colleges
    └── locations.js      # City data with coordinates
```

---

### Phase 2: Static Data Files (`scripts/seed/data/`)

#### [NEW] [companies.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/data/companies.js)
- 150+ companies with: name, logo URL (clearbit), cover image, industry, website, size, HQ, description, foundedYear, social links
- Categories: MNCs (Google, Microsoft, Amazon, etc.), Product cos (Flipkart, Razorpay, etc.), Service cos (TCS, Infosys, etc.), Startups (Meesho, Groww, etc.), Consulting (Deloitte, EY, etc.)
- Company `size` values mapped to the schema enum (`1-10` through `1000+`)

#### [NEW] [skills.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/data/skills.js)
- Skill pools mapped to job roles (e.g., "React Developer" → React, Redux, TypeScript, Jest, etc.)
- 200+ unique skills across frontend, backend, mobile, DevOps, AI/ML, QA, security, and management

#### [NEW] [jobTemplates.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/data/jobTemplates.js)
- 26 role templates with: title variations, realistic multi-paragraph descriptions, responsibilities (5-8 per role), qualifications, required skills, preferred skills, benefits
- Experience level modifiers to generate junior/mid/senior variants

#### [NEW] [names.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/data/names.js)
- 200+ Indian first names (male/female), 150+ Indian last names
- Ensures unique combinations for 1300 users (300 recruiters + 1000 candidates)

#### [NEW] [institutions.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/data/institutions.js)
- 100+ Indian universities/colleges (IITs, NITs, IIITs, BITS, private universities, state universities)
- Degree programs: B.Tech, M.Tech, BCA, MCA, B.Sc, M.Sc, MBA

#### [NEW] [locations.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/data/locations.js)
- 10 tier-1 Indian cities: Hyderabad, Bangalore, Pune, Chennai, Mumbai, Delhi, Noida, Gurgaon, Kochi, Ahmedabad

---

### Phase 3: Utility Modules (`scripts/seed/utils/`)

#### [NEW] [connection.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/utils/connection.js)
- Reuses existing `dotenv` config and `MONGODB_URI`
- Standalone Mongoose connect/disconnect (does not import app.js to avoid starting HTTP server)

#### [NEW] [progress.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/utils/progress.js)
- CLI progress bar with: current/total count, percentage, elapsed time, ETA
- Colored output for different seed phases

#### [NEW] [helpers.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/utils/helpers.js)
- `randomPick(array)` — random element from array
- `randomPicks(array, count)` — random N unique elements
- `randomBetween(min, max)` — random integer in range
- `randomDate(start, end)` — random date in range
- `generatePhone()` — valid Indian E.164 phone number (+91...)
- `generateLinkedIn(name)` — realistic LinkedIn URL
- `generateGitHub(name)` — realistic GitHub URL
- `generateEmail(firstName, lastName, domain)` — unique email generator
- `generateSalaryRange(experienceLevel)` — realistic LPA ranges for Indian market
- `batchInsert(Model, documents, batchSize)` — insert in batches with progress

---

### Phase 4: Individual Seed Scripts

#### [NEW] [seedAdmin.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/seedAdmin.js)
- Creates 1 admin user: `admin@jobsprint.com` / `JobSprint@2024`
- Idempotent (skips if already exists)

#### [NEW] [seedCompanies.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/seedCompanies.js)
- Inserts 150+ companies from static data
- Sets `isVerified: true` for all
- Uses `insertMany` with `ordered: false` for idempotent re-runs

#### [NEW] [seedRecruiters.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/seedRecruiters.js)
- Creates 300 User documents (role: `recruiter`, isVerified: true)
- Creates 300 matching RecruiterProfile documents
- Distributes recruiters across companies: MNCs get 3-5, mid-size get 2-3, startups get 1-2
- Designations: HR Manager, Technical Recruiter, Talent Acquisition Lead, etc.

#### [NEW] [seedCandidates.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/seedCandidates.js)
- Creates 1000 User documents (role: `candidate`, isVerified: true)
- Creates 1000 matching CandidateProfile documents with:
  - Realistic skills (3-8 per candidate, role-coherent)
  - 1-3 experience entries with real company names
  - 1-2 education entries from Indian institutions
  - Portfolio links (GitHub, LinkedIn, personal website)
  - Summary/bio
  - Resume URL placeholder
  - Indian phone numbers

#### [NEW] [seedJobs.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/seedJobs.js)
- Creates 3000 jobs distributed across companies and recruiters
- Each job has: meaningful multi-line description, 5-8 responsibilities, 4-6 qualifications, role-appropriate required skills, preferred skills, benefits
- Salary in INR (LPA): Fresher 3-8, 1-3yr 6-15, 3-5yr 12-25, 5-8yr 20-40, 8+ 35-70
- Posted dates spread over last 90 days
- Expiry dates 30-90 days after posting
- ~70% active, ~20% closed, ~10% archived
- Hiring count: 1-15 per job
- Views: 50-5000 (correlated with company brand)
- Applications count, bookmark count (will be reconciled after applications seed)

#### [NEW] [seedApplications.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/seedApplications.js)
- Creates 10000 applications
- Status distribution: 40% applied, 20% screening, 15% interviewing, 10% offered, 10% rejected, 5% withdrawn
- Each application has:
  - Cover letter (role-specific template with variation)
  - Applied date (after job posted date)
  - Status timeline with realistic progression timestamps
  - Recruiter notes for advanced-stage applications
- Enforces unique `{jobId, candidateId}` constraint
- Uses `insertMany` to bypass pre-save middleware for performance, then manually builds statusTimeline

#### [NEW] [seedNotifications.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/seedNotifications.js)
- Generates notifications tied to real application events:
  - `application_status`: "Your application for {title} at {company} has been shortlisted"
  - `new_job`: "New {title} position at {company} matches your profile"
  - `profile_view`: "A recruiter from {company} viewed your profile"
  - `system`: "Complete your profile to increase visibility"
- ~60% read, ~40% unread
- Timestamps aligned with application events

#### [NEW] [seedSavedJobs.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/seedSavedJobs.js)
- ~3000 saved job entries across candidates
- Each candidate saves 1-8 jobs (weighted toward 2-4)
- Enforces unique constraint

#### [NEW] [seedAuditLogs.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/seedAuditLogs.js)
- Generates realistic security activity:
  - `LOGIN_SUCCESS`, `LOGOUT`, `PASSWORD_CHANGE`, `LOGIN_FAILED`, `EMAIL_VERIFIED`, `PROFILE_UPDATED`, `RESUME_UPLOADED`, `JOB_POSTED`, `APPLICATION_SUBMITTED`, `APPLICATION_STATUS_CHANGED`
- Realistic IP addresses (Indian ISP ranges)
- Realistic user agents (Chrome, Firefox, Safari on Windows/Mac/Android)
- Severity: mostly `info`, some `warning` (failed logins), rare `critical`
- Timestamps spread over 90 days

---

### Phase 5: Master Orchestrator & NPM Scripts

#### [NEW] [index.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/index.js)
- Orchestrates all seeders in dependency order:
  1. Admin → 2. Companies → 3. Recruiters → 4. Candidates → 5. Jobs → 6. Applications → 7. Notifications → 8. SavedJobs → 9. AuditLogs → 10. Analytics
- Accepts CLI flags: `--only=companies,jobs` for selective seeding
- Total execution time logging
- Error handling with rollback information

#### [NEW] [clear.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/clear.js)
- Drops all collections in reverse dependency order
- Confirmation prompt before clearing
- Can target specific collections: `--only=applications,jobs`

#### [MODIFY] [package.json](file:///c:/NodeProjects/JobSprint/backend/package.json)
Add NPM scripts:
```json
{
  "seed": "node scripts/seed/index.js",
  "seed:clear": "node scripts/seed/clear.js",
  "seed:companies": "node scripts/seed/index.js --only=companies",
  "seed:candidates": "node scripts/seed/index.js --only=candidates",
  "seed:jobs": "node scripts/seed/index.js --only=jobs",
  "seed:applications": "node scripts/seed/index.js --only=applications"
}
```

---

### Phase 6: Analytics Seeder

#### [NEW] [seedAnalytics.js](file:///c:/NodeProjects/JobSprint/backend/scripts/seed/seedAnalytics.js)
- Runs MongoDB aggregation pipelines against seeded data to compute:
  - Top 20 most in-demand skills
  - Top 10 most applied-to jobs
  - Top 10 most active hiring companies
  - Monthly application volume (last 3 months)
  - Hiring funnel conversion rates
  - Application success rate by company
- Outputs summary to console as a formatted table
- Optionally writes summary JSON to `backend/scripts/seed/output/analytics.json`

---

## Image Strategy

| Entity | Service | URL Pattern |
|--------|---------|-------------|
| Company logos | Clearbit Logo API | `https://logo.clearbit.com/{domain}` |
| Company covers | Picsum Photos | `https://picsum.photos/seed/{company}/1200/400` |
| Candidate photos | UI Avatars | `https://ui-avatars.com/api/?name={First}+{Last}&background=random&size=200` |
| Recruiter photos | UI Avatars | `https://ui-avatars.com/api/?name={First}+{Last}&background=0D8ABC&color=fff&size=200` |
| Resume PDFs | Static placeholder | `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf` |

---

## Git Strategy

The feature branch `feature/production-database-seeding` will have the following incremental commits:

| # | Commit Message | Files |
|---|---------------|-------|
| 1 | `chore: create seed directory structure and utility modules` | `utils/connection.js`, `utils/progress.js`, `utils/helpers.js` |
| 2 | `feat(seed): add static data files for companies, skills, and locations` | `data/companies.js`, `data/skills.js`, `data/locations.js` |
| 3 | `feat(seed): add name pools, institutions, and job templates` | `data/names.js`, `data/institutions.js`, `data/jobTemplates.js` |
| 4 | `feat(seed): implement company and admin seeders` | `seedCompanies.js`, `seedAdmin.js` |
| 5 | `feat(seed): implement recruiter seeder with company distribution` | `seedRecruiters.js` |
| 6 | `feat(seed): implement candidate seeder with profiles and portfolios` | `seedCandidates.js` |
| 7 | `feat(seed): implement job seeder with realistic descriptions` | `seedJobs.js` |
| 8 | `feat(seed): implement application seeder with status pipelines` | `seedApplications.js` |
| 9 | `feat(seed): implement notifications, saved jobs, and audit log seeders` | `seedNotifications.js`, `seedSavedJobs.js`, `seedAuditLogs.js` |
| 10 | `feat(seed): implement analytics seeder and master orchestrator` | `seedAnalytics.js`, `index.js`, `clear.js` |
| 11 | `chore: add npm seed scripts to package.json` | `package.json` |

---

## Verification Plan

### Automated Tests
```bash
# Seed everything
npm run seed

# Verify collection counts
node -e "
import mongoose from 'mongoose';
await mongoose.connect('mongodb://localhost:27017/jobsprint');
const db = mongoose.connection.db;
const collections = ['users','companies','candidateprofiles','recruiterprofiles','jobs','applications','savedjobs','notifications','auditlogs'];
for (const c of collections) {
  const count = await db.collection(c).countDocuments();
  console.log(c + ': ' + count);
}
await mongoose.disconnect();
"

# Clear and re-seed
npm run seed:clear
npm run seed

# Selective seeding
npm run seed:companies
npm run seed:jobs
```

### Manual Verification
- Run the full backend server (`npm run dev`) and verify that API endpoints return seeded data
- Check MongoDB Compass/mongosh for data integrity and referential consistency
- Verify no duplicate emails, no orphaned references

> [!WARNING]
> The seeder bypasses the `User.passwordHash` pre-save bcrypt hook by pre-hashing passwords before `insertMany`. This is intentional for performance — hashing 1300 passwords with salt rounds 12 sequentially would take ~15 minutes. Instead, we hash once and reuse the hash for all seed users sharing the same password.
