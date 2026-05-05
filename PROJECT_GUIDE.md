# Proshno Shala — Complete Project Guide

> বাংলা AI-powered question paper builder। Teachers, schools, coaching centers, admission prep, private tutors-দের জন্য।
> এই গাইড: full project কী আছে, admin কীভাবে operate করবে, developer কীভাবে কাজ করবে, নতুন feature কীভাবে যোগ করবে।

---

## 1. এক নজরে কী আছে

- **Frontend**: React 19 + Vite 8 + Tailwind 4 + Zustand + React Router 7 + framer-motion
- **Backend**: Express 5 (Vercel Serverless Function হিসেবে চলে)
- **Database & Auth**: Supabase (Postgres + Auth)
- **AI**: 8-provider failover chain (Groq → OpenRouter → Mistral → SambaNova → Cohere → Novita → HuggingFace → Z.ai)
- **Payment**: Manual (bKash/Nagad/Rocket) — admin verify করে
- **Hosting**: Vercel (single project, frontend + API)

---

## 2. Tech Stack বিস্তারিত

| Layer | Tech | কাজ |
|---|---|---|
| UI | React 19, framer-motion, Tailwind 4 | Page rendering, animations, styling |
| Routing | React Router 7 | Pages, protected routes, role-based redirect |
| State | Zustand (`authStore`, `paperStore`, `examStore`) | Persisted client state |
| HTTP | axios via [src/services/api.js](src/services/api.js) | All backend calls, JWT auto-attach |
| Forms / Editors | Custom components in [src/components/questions/](src/components/questions/) | MCQ, CQ, Short, Broad, Fill-blank, Matching, Rearranging, Table, Translation |
| PDF | `html2pdf.js` (client-side) | Paper print/preview |
| Math rendering | `katex` | LaTeX in questions |
| DnD | `@dnd-kit/*` | Question reordering in editor |
| Backend | Express 5 + helmet + cors + morgan | REST API |
| Serverless | `api/index.js` | Vercel function entry |
| AI | 8 providers, uniform `chat()` interface | Vision (image scan) + text (book generate) |

---

## 3. Folder Structure

```
proshno-shala-v1/
├── api/
│   └── index.js              # Vercel serverless entry — wraps server/app
├── server/                   # CommonJS backend
│   ├── app.js                # Express app (no .listen) — used by Vercel + dev
│   ├── index.js              # Local dev entry (calls .listen on :5000)
│   ├── package.json          # { "type": "commonjs" } — overrides root ESM
│   ├── config/
│   │   └── supabase.js       # Supabase admin client (service-role key)
│   ├── middleware/
│   │   ├── auth.js           # JWT verify + tier compute (pro/trial/free)
│   │   ├── subscription.js   # checkLimit + recordAiScan
│   │   └── errorHandler.js   # Central error handler + AppError class
│   ├── routes/
│   │   ├── auth.js           # /me, /set-role
│   │   ├── papers.js         # CRUD + OMR
│   │   ├── questions.js      # Question Bank CRUD
│   │   ├── exam.js           # Online exam portal
│   │   ├── ai.js             # /scan (image → questions)
│   │   ├── generate.js       # /generate-question (alias)
│   │   ├── book.js           # Book curriculum generator
│   │   ├── payment.js        # /config (public), /manual (user submit)
│   │   └── admin.js          # /subscription/config, /payments/manual, /users, /stats
│   ├── services/
│   │   ├── aiService.js              # scanImage, generateFromBook
│   │   ├── aiProviders/              # 8 provider adapters + chain registry
│   │   ├── paperService.js           # papers table CRUD
│   │   ├── questionService.js        # question_bank CRUD
│   │   ├── examService.js            # exam sessions
│   │   ├── bookService.js            # book curriculum
│   │   ├── manualPaymentService.js   # manual_payments + verify → upgrade
│   │   └── configService.js          # subscription_config (1-row table)
│   └── data/
│       └── bookCurriculumFallback.json
│
├── src/                      # React frontend (ESM)
│   ├── App.jsx               # Routes + Protected/Guest/Admin route wrappers
│   ├── main.jsx              # ReactDOM root, BrowserRouter mount
│   ├── components/
│   │   ├── AuthBootstrap.jsx       # Supabase session listener → authStore
│   │   ├── shared/
│   │   │   ├── AppShell.jsx        # Auth-protected layout (sidebar + outlet)
│   │   │   ├── DesktopSidebar.jsx  # Left nav + tier badge
│   │   │   ├── MobileHeader.jsx    # Mobile top bar + bottom sheet menu
│   │   │   ├── BottomNav.jsx       # Mobile bottom tab bar
│   │   │   ├── BottomSheet.jsx     # Reusable modal sheet
│   │   │   ├── Modal.jsx           # Generic modal
│   │   │   ├── ProGate.jsx         # Wraps pro-only UI; opens upgrade prompt
│   │   │   ├── Loader.jsx, FAB.jsx, SkeletonCard.jsx
│   │   ├── paper/
│   │   │   ├── PaperSetupForm.jsx       # Header/layout setup
│   │   │   ├── PaperTemplate.jsx        # Print preview render
│   │   │   ├── OmrSettingsModal.jsx     # OMR options
│   │   │   ├── OmrTemplate.jsx          # OMR sheet render
│   │   │   ├── ExamPublishModal.jsx     # Online exam publish flow
│   │   ├── questions/
│   │   │   ├── McqEditor / CqEditor / ShortEditor / BroadEditor
│   │   │   ├── FillBlankEditor / MatchingEditor / RearrangingEditor
│   │   │   ├── TableEditor / TranslationEditor
│   │   │   ├── QuestionWrapper.jsx      # Common toolbar/dnd wrapper
│   │   │   ├── MagicScanModal.jsx       # Image upload → AI scan
│   │   │   ├── BookGenerateModal.jsx    # Book → AI generate
│   │   │   ├── ImportFromBankModal.jsx  # Pull from Question Bank
│   │   │   ├── MathSymbolPicker.jsx     # LaTeX symbol palette
│   ├── pages/
│   │   ├── Login.jsx / Register.jsx / AuthCallback.jsx
│   │   ├── Dashboard.jsx                # Home, stats, quick actions
│   │   ├── PapersList.jsx               # Saved papers list
│   │   ├── PaperEditor.jsx              # Build/edit paper
│   │   ├── PDFPreview.jsx               # Print-ready render + html2pdf
│   │   ├── OmrPreview.jsx
│   │   ├── ScanUpload.jsx               # AI image scan landing
│   │   ├── QuestionBank.jsx             # Saved questions library
│   │   ├── ExamPortal.jsx               # Public exam-taking page
│   │   ├── Results.jsx                  # Exam results
│   │   ├── Pricing.jsx                  # Plans + manual payment modal
│   │   ├── AdminDashboard.jsx           # Admin panel (/admin)
│   ├── store/
│   │   ├── authStore.js                 # Supabase session + user profile
│   │   ├── paperStore.js                # Current paper draft
│   │   └── examStore.js                 # Exam state
│   ├── lib/
│   │   └── supabase.js                  # Supabase browser client (anon key)
│   ├── services/
│   │   └── api.js                       # axios instance + JWT interceptor
│   └── utils/
│       └── formatting.js                # Bengali number, date formatters
│
├── public/                              # Static assets
├── vercel.json                          # /api rewrites + SPA fallback
├── vite.config.js                       # Dev proxy /api → :5000
├── package.json                         # Merged frontend + backend deps
└── .env.example                         # All required env vars
```

---

## 4. Features (User-facing)

| Feature | Page/Component | Free | Trial | Pro |
|---|---|---|---|---|
| Manual question paper তৈরি | `PaperEditor` | ✅ ১০টি total | ✅ unlimited | ✅ unlimited |
| Question Bank-এ save | `QuestionBank` | ✅ ৩০টি total | ✅ unlimited | ✅ unlimited |
| AI scan (ছবি → প্রশ্ন) | `MagicScanModal` | ✅ ৩০টি/মাস | ✅ unlimited | ✅ unlimited |
| Book থেকে generate | `BookGenerateModal` | ✅ ৩০টি/মাস | ✅ unlimited | ✅ unlimited |
| OMR Generator | `OmrSettingsModal` | ❌ blocked | ✅ | ✅ |
| Watermark ছাড়া print | `PaperTemplate` | ❌ "AI Question Hub" forced | ✅ | ✅ |
| নিজের logo | `PaperSetupForm` | ❌ | ✅ | ✅ |
| Online exam publish | `ExamPublishModal` | ✅ | ✅ | ✅ |
| Pricing/Upgrade | `Pricing` | বাটন দেখাবে | বাটন দেখাবে | "বর্তমান প্ল্যান" |
| Admin panel | `/admin` | ❌ | ❌ | role=admin হলে ✅ |

**Question types supported:** MCQ, CQ (creative question), Short, Broad, Fill-in-blank, Matching, Rearranging, Table, Translation।

---

## 5. Subscription / Tier System

### তিনটা tier:

```
created_at + trialDays > now  →  TRIAL (full pro features)
subscription='pro' && subscription_end_at > now  →  PRO
otherwise  →  FREE (limited)
```

### কোথায় enforce হয়:

| File | কী করে |
|---|---|
| [server/middleware/auth.js](server/middleware/auth.js) | প্রতি request-এ tier compute করে `req.user.tier` সেট করে |
| [server/middleware/subscription.js](server/middleware/subscription.js) | `checkLimit(type)` middleware — paper/question/AI count cap |
| [server/routes/papers.js](server/routes/papers.js) | watermark/logo gate (`tier === 'free'`) |

### Free tier limits (hardcoded):

```js
const FREE_LIMITS = {
  papers: 10,
  question_bank: 30,
  ai_scan: 30, // per calendar month, auto-reset
}
```

### `trialDays` setting:

`subscription_config` table-এ store হয় (single row, id=1)। Admin panel-এর "সেটিংস" tab থেকে change করা যায়। Backend 60 sec cache-এ রাখে।

---

## 6. Admin User Guide (তোমার জন্য)

### A. নিজেকে admin বানানো (একবারই)

Supabase → SQL Editor:

```sql
UPDATE profiles SET role = 'admin', updated_at = NOW()
WHERE email = 'YOUR_EMAIL@example.com';
```

App-এ logout → login করো। তারপর `/admin` URL-এ যেতে পারবে।

### B. Admin Dashboard (`/admin`) কী কী আছে

৫টা tab:

#### 1. **একনজরে (Overview)**
- মোট ইউজার, মোট পেপার, মোট আয় (৳)
- শুধু read — কোনো action নেই

#### 2. **ইউজার (Users)**
- সব registered user list (সর্বশেষ ৫০০টি)
- প্রতিটায় "এডিট" button:
  - Role বদলানো (school/coaching/admission/tutor/admin/user)
  - Subscription manually free ↔ pro toggle
  - Account ban/unban
- যেকোনো user-কে instantly Pro বানিয়ে দেওয়া যায়

#### 3. **সকল লেনদেন (Transactions)**
- সব manual payment (verified/pending/rejected) এর history
- শুধু read

#### 4. **সেটিংস (Settings)** ⭐ সবচেয়ে important
- **প্রো প্ল্যান প্রাইস** (৳) — কত টাকা চার্জ করবে
- **ফ্রি ট্রায়াল দিন** — নতুন user কত দিন trial পাবে (default 90)
- **ফিচার লিস্ট** — Pricing page-এ Pro plan-এর bullet points
- **ম্যানুয়াল পেমেন্ট নম্বর** — bKash/Nagad/Rocket এর number list (Add/Delete button আছে)
- নিচে **"সেভ সেটিংস"** চাপলে DB-তে সেভ হয়

> ⚠️ ম্যানুয়াল পেমেন্ট নম্বর খালি থাকলে user Pricing-এ "পেমেন্ট নম্বর কনফিগার হয়নি" warning দেখবে। তাই কমপক্ষে একটা নম্বর সেট করো।

#### 5. **ম্যানুয়াল পেমেন্ট (Pending Requests)** ⭐ daily routine
- যত user manual payment submit করেছে এবং এখনো verify হয়নি — সব এখানে
- প্রতিটা request-এ:
  - Screenshot thumbnail (click করলে full-size lightbox)
  - User-এর email, phone, transaction ID, submission time
  - Method (bKash/Nagad/Rocket), amount
  - **বাতিল** / **ভেরিফাই করুন** button
- Verify করলে user instantly Pro হয়ে যায়, expiry = এখন থেকে ৩০ দিন

### C. দৈনিক admin workflow

1. Pending Manual Payment tab-এ গিয়ে নতুন request দেখো
2. Screenshot/tranId verify করো (নিজের bKash/Nagad/Rocket app-এ মিলিয়ে দেখো)
3. সঠিক হলে "ভেরিফাই", ভুল/spam হলে "বাতিল"
4. মাসে একবার "Overview" দেখে revenue/user growth track করো

---

## 7. Developer Guide

### A. Local Setup

```bash
# 1. Clone + install
git clone <repo>
cd proshno-shala-v1
npm install

# 2. .env তৈরি করো
cp .env.example .env
# Supabase URL/keys + at least one AI key দাও

# 3. দুই terminal-এ চালাও (অথবা npm run dev:all)
npm run dev          # Vite frontend on :5173
npm run dev:server   # Express backend on :5000

# OR একসাথে:
npm run dev:all
```

Vite-এর dev server `/api/*` request-গুলো `:5000`-এ proxy করে দেয়। ব্রাউজার-এ `http://localhost:5173`।

### B. Required env vars

```
# Frontend (browser-exposed)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Backend (secret)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# AI (অন্তত একটা — Groq recommended)
GROQ_API_KEY=
OPENROUTER_API_KEY=
MISTRAL_API_KEY=
NOVITA_API_KEY=
HUGGINGFACE_API_KEY=
SAMBANOVA_API_KEY=
COHERE_API_KEY=
Z_API_KEY=

# Optional
AI_PROVIDER_TIMEOUT_MS=4500
```

### C. Test, Build, Deploy

```bash
npm test            # vitest
npm run lint        # eslint
npm run build       # production build → dist/
npm run preview     # preview production build
```

**Vercel deploy:**
1. Repo GitHub-এ push করো
2. Vercel-এ import করো (auto-detect Vite)
3. Project Settings → Environment Variables-এ সব .env value দাও (`VITE_*` সহ)
4. Deploy

`vercel.json` automatic configure করেছে: `/api/*` → serverless function, বাকি সব → `index.html` (SPA)।

### D. Database (Supabase) tables

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | User profile (auth.users-এর extension) | id (FK auth.users), email, display_name, role, subscription, subscription_end_at, ai_scan_count, ai_scan_month, is_banned |
| `papers` | Question papers | id, user_id, exam_title, questions (JSONB), watermark, logo_url, deleted |
| `question_bank` | Saved questions library | id, user_id, type, data (JSONB), subject, chapter |
| `subscription_config` | Single-row settings | id=1, pro_price, trial_days, is_trial_active, manual_payment_methods (JSONB), features |
| `manual_payments` | Pending/verified bKash/Nagad/Rocket | id, user_id, email, amount, method, tran_id, phone, screenshot, status, verified_by |
| `exam_sessions` | Online exam attempts | id, paper_id, student details, answers, score |

### E. Common dev tasks

**নতুন route যোগ করা:**
1. `server/services/myService.js` — DB logic
2. `server/routes/myRoute.js` — Express router
3. `server/app.js`-এ mount: `app.use('/api/my-route', require('./routes/myRoute'))`
4. Frontend থেকে `api.get('/my-route')` দিয়ে call

**নতুন page যোগ করা:**
1. `src/pages/MyPage.jsx`
2. `src/App.jsx`-এ Route যোগ করো (Protected হলে ProtectedRoute wrapper)
3. Sidebar/BottomNav-এ link যোগ করো

**নতুন question type:**
1. `src/components/questions/MyTypeEditor.jsx`
2. `src/components/questions/QuestionWrapper.jsx`-এ register করো
3. `src/components/paper/PaperTemplate.jsx`-এ render logic
4. AI provider response parser-এ type handle করো (যদি AI generate করতে চাও)

**নতুন AI provider যোগ করা:**
1. `server/services/aiProviders/myprovider.js` — export `{ name, supportsVision, supportsText, chat }`
2. `server/services/aiProviders/index.js`-এর `VISION_CHAIN` / `TEXT_CHAIN`-এ যোগ করো
3. `.env.example`-এ key যোগ করো

---

## 8. নতুন Upgrade Feature যোগ করার গাইড

ধরো নতুন একটা **"Pro-only feature"** যোগ করতে চাও। সাধারণত ৩-৫টা layer touch করতে হয়।

### Pattern: Free tier-এ block / Pro-তে allow

**উদাহরণ — "Custom Cover Page" feature যোগ করি (Pro only):**

#### Step 1: Backend gate
```js
// server/routes/papers.js
router.post('/:id/cover', requireAuth, async (req, res, next) => {
  if (req.user.tier === 'free') {
    return res.status(403).json({
      success: false,
      message: 'Custom Cover শুধু Pro user-দের জন্য',
      limitReached: true,
    })
  }
  // ...actual logic
})
```

#### Step 2: Frontend gate (UI level)
```jsx
// src/components/paper/CoverPageEditor.jsx
import ProGate from '@/components/shared/ProGate'

<ProGate feature="cover">
  <CoverPageEditor />
</ProGate>
```
`ProGate` automatically free user-কে blur + "Pro feature" badge দেখাবে এবং click করলে Pricing-এ পাঠাবে।

#### Step 3: Pricing page-এ feature add
[src/pages/Pricing.jsx](src/pages/Pricing.jsx)-এর Pro features list-এ যোগ করো অথবা admin panel-এর "ফিচার লিস্ট" textarea থেকে add করো (দ্বিতীয়টা কোড না বদলেই হবে)।

### Pattern: Free tier-এ limit বাড়ানো/কমানো

[server/middleware/subscription.js](server/middleware/subscription.js)-এ `FREE_LIMITS` object বদলাও:

```js
const FREE_LIMITS = {
  papers: 10,        // ← এখানে number বদলাও
  question_bank: 30,
  ai_scan: 30,
}
```

Cache lagবে না — instantly effect হবে (next request থেকে)। তবে Pricing page UI-এর hardcoded text-ও সাথে update করতে ভুলো না।

### Pattern: নতুন quota type যোগ করা

ধরো `pdf_export` — মাসে ৫টা PDF export limit free user-দের।

#### 1. Schema (Supabase SQL):
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pdf_export_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS pdf_export_month TEXT;
```

#### 2. Middleware extension:
```js
// server/middleware/subscription.js
const FREE_LIMITS = { ..., pdf_export: 5 }

// inside checkLimit():
} else if (limitType === 'pdf_export') {
  const month = currentMonth()
  const profile = req.profile
  let used = profile?.pdf_export_count || 0
  if (profile?.pdf_export_month !== month) used = 0
  if (used >= FREE_LIMITS.pdf_export) {
    return res.status(403).json({ success: false, message: 'মাসে সর্বোচ্চ ৫টি PDF export' })
  }
}

async function recordPdfExport(userId, profile) {
  // similar to recordAiScan
}
module.exports = { ..., recordPdfExport }
```

#### 3. Route-এ apply:
```js
// server/routes/papers.js
router.post('/:id/export-pdf', checkLimit('pdf_export'), async (req, res) => {
  // ... export
  await recordPdfExport(req.user.uid, req.profile)
})
```

#### 4. /auth/me response-এ counter expose:
[server/routes/auth.js](server/routes/auth.js)-এর `buildUserPayload`-এর `usage` object-এ যোগ করো:
```js
usage: {
  ...,
  pdfExport: profile.pdf_export_month === month ? profile.pdf_export_count || 0 : 0,
  pdfExportLimit: FREE_LIMITS.pdf_export,
}
```

#### 5. Frontend display:
`user.usage.pdfExport / user.usage.pdfExportLimit` দিয়ে progress bar, badge ইত্যাদি দেখাও।

### Pattern: Admin panel থেকে configurable করতে চাইলে

Limits hardcoded থেকে DB-driven করতে চাইলে:

1. `subscription_config` table-এ নতুন কলাম: `free_papers_limit INT`
2. [configService.js](server/services/configService.js)-এ default এবং getConfig/updateConfig-এ field যোগ করো
3. [middleware/subscription.js](server/middleware/subscription.js)-এ `FREE_LIMITS` কে static না রেখে `await configService.getConfig()` দিয়ে fetch করো (already 60s cached)
4. AdminDashboard "সেটিংস" tab-এ input field add করো

---

## 9. Common Bugs / Troubleshooting

| Symptom | কারণ | Fix |
|---|---|---|
| `/admin` থেকে dashboard-এ redirect | তোমার role = 'admin' না | Supabase SQL দিয়ে role update + logout/login |
| Pricing modal-এ পেমেন্ট নম্বর নেই | `manual_payment_methods` খালি | Admin → সেটিংস → "+ নতুন যোগ করুন" |
| Free user pro features পাচ্ছে | tier compute হয়নি বা trialDays = 0 | Admin সেটিংস-এ trialDays চেক, profile-এর created_at চেক |
| AI scan 502 দিচ্ছে | সব AI provider fail | `/api/health` দিয়ে check, env keys verify |
| `/api/*` থেকে HTML আসছে | Vercel function deploy হয়নি | `vercel.json` rewrite check, redeploy |
| Bengali text render হচ্ছে না | Font import miss | [src/index.css](src/index.css)-এ `@import` চেক |
| Login-এর পরে role miss | Profile auto-create-এ delay | `/auth/me` retry, frontend-এ `applySession` flow check |

---

## 10. Important Files Quick Reference

| কাজ | File |
|---|---|
| Tier logic | [server/middleware/auth.js](server/middleware/auth.js#L18-L34) |
| Limit enforcement | [server/middleware/subscription.js](server/middleware/subscription.js) |
| Manual payment verify | [server/services/manualPaymentService.js](server/services/manualPaymentService.js#L82-L94) |
| Admin routes | [server/routes/admin.js](server/routes/admin.js) |
| Subscription config | [server/services/configService.js](server/services/configService.js) |
| Frontend tier check | [src/components/shared/ProGate.jsx](src/components/shared/ProGate.jsx) |
| Pricing page | [src/pages/Pricing.jsx](src/pages/Pricing.jsx) |
| Admin dashboard | [src/pages/AdminDashboard.jsx](src/pages/AdminDashboard.jsx) |
| Auth state | [src/store/authStore.js](src/store/authStore.js) |
| API client | [src/services/api.js](src/services/api.js) |
| Vercel routing | [vercel.json](vercel.json) |

---

## 11. AI Failover Chain (Reference)

`server/services/aiProviders/index.js`:

```
VISION: groq → openrouter → mistral → sambanova → cohere → novita → huggingface → zai
TEXT:   groq → sambanova → mistral → openrouter → cohere → novita → huggingface → zai
```

প্রতি provider attempt 4.5 second cap। সবগুলো fail করলে route 502 with last error message।

**নতুন provider যোগ করতে:**
1. `server/services/aiProviders/X.js` — export `{ name, supportsVision, supportsText, chat({ messages, vision, jsonMode, temperature }) }`
2. `index.js`-এর chain array-এ যোগ করো

---

## 12. Database Migrations (যা যা run করেছি বা করতে পারো)

```sql
-- 1. Manual payment screenshot column
ALTER TABLE manual_payments
ADD COLUMN IF NOT EXISTS screenshot TEXT;

-- 2. AI scan monthly tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ai_scan_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_scan_month TEXT;

-- 3. Promote yourself to admin
UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL';
```

---

## 13. Roadmap Ideas

পরে চাইলে যোগ করা যায়:
- Annual subscription (currently শুধু monthly)
- Auto-downgrade cron — `subscription_end_at` past হলে subscription = 'free' করে দেওয়া
- Per-user trial extension (admin manually trial বাড়ানো)
- Coupon/discount code
- Referral bonus
- Email notification (payment verified, trial expiring soon)
- Analytics dashboard (popular subjects, user retention)
- Bulk question import (CSV/Excel)
- Multi-language (English UI option)

---

**End of Guide।** কোনো section আরো বিস্তারিত চাইলে বলো।
