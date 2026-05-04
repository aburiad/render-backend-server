# Proshno Shala

Bengali AI-powered question paper builder for teachers, schools, and coaching centers.
Frontend (React + Vite) and backend (Express) live in **the same repo** and deploy as a **single Vercel project**.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8, Tailwind 4, Zustand, react-router 7, framer-motion |
| Backend | Express 5 on Vercel Serverless Functions (via `serverless-http`) |
| Database / Auth | Supabase (Postgres + Auth) |
| AI | 7-provider failover chain (Groq → OpenRouter → Mistral → Novita → HuggingFace + text-only Cohere, SambaNova) |
| Hosting | Vercel (frontend + serverless API), Supabase (DB) — **all free tier** |

PDF generation is **not** done on the server — print to PDF from the client (planned: `html2pdf.js` integration).

---

## Repository layout

```
proshno-shala-v1/
├── api/
│   └── index.js           # Vercel serverless entry — wraps server/app.js
├── server/
│   ├── app.js             # Express app (no .listen — used by both Vercel and local dev)
│   ├── index.js           # Local dev entry (calls .listen)
│   ├── routes/            # auth, papers, exam, payment, admin, ai, questions, book, generate
│   ├── services/
│   │   ├── aiService.js          # Unified AI interface — scanImage, generateFromBook
│   │   ├── aiProviders/          # 7 provider adapters + fallback chain registry
│   │   ├── paperService.js
│   │   ├── examService.js
│   │   ├── paymentService.js
│   │   ├── manualPaymentService.js
│   │   ├── configService.js
│   │   ├── bookService.js
│   │   └── questionService.js
│   ├── middleware/        # auth (Supabase JWT), errorHandler, subscription
│   ├── config/supabase.js
│   ├── data/              # bookCurriculumFallback.json
│   └── package.json       # { type: "commonjs" } — overrides root ESM
├── src/                   # React frontend
├── public/
├── vercel.json            # rewrites /api/* to /api/index, SPA fallback for everything else
├── vite.config.js         # dev proxy /api → http://localhost:5000
└── package.json           # merged frontend + backend dependencies
```

---

## Local development

### 1. Install
```bash
npm install
```

### 2. Configure env
Copy `.env.example` → `.env` and fill in:

- **Supabase** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **At least one AI key** (vision-capable for image scan; any for book generation):
  - `GROQ_API_KEY` *(recommended — fastest, generous free tier, has vision)*
  - `OPENROUTER_API_KEY`
  - `MISTRAL_API_KEY`
  - `NOVITA_API_KEY`
  - `HUGGINGFACE_API_KEY`
  - `COHERE_API_KEY` *(text only)*
  - `SAMBANOVA_API_KEY` *(text only)*

Set as many as you have — the system tries them in order and falls back to the next on any failure.

### 3. Run both web + api
```bash
npm run dev:all
```

Or in two terminals:
```bash
npm run dev          # Vite on :5173
npm run dev:server   # Express on :5000
```

Vite proxies `/api/*` to the local Express server.

---

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import into Vercel — pick this repo, no special build settings needed.
3. In Vercel **Project → Settings → Environment Variables**, add every variable from `.env.example`. The `VITE_*` ones must also be present at build time (they're inlined into the bundle).
4. Deploy. Same `*.vercel.app` domain serves both the React app and `/api/*`.

The `vercel.json` routes `/api/*` to the serverless function and falls back to `index.html` for SPA routing.

### Free tier limits to know
- **Vercel Hobby**: serverless function timeout = **10s**. Each AI provider attempt is capped at 4.5s (`AI_PROVIDER_TIMEOUT_MS`) so the fallback chain stays in budget.
- **Supabase free**: 500MB DB, 1GB storage, project pauses after a week of inactivity.
- **AI providers**: each has its own free quota. The fallback chain insulates against any single one being throttled.

---

## AI failover chain

`server/services/aiProviders/index.js`:

```
VISION_CHAIN = [groq, openrouter, mistral, novita, huggingface]
TEXT_CHAIN   = [groq, sambanova, mistral, openrouter, cohere, novita, huggingface]
```

Each provider implements a uniform `chat({ messages, vision, jsonMode, temperature })` interface that returns text. `aiService.js` walks the chain, parses the JSON-array response, and returns on first success.

Failure is logged but transparent to the caller. If **all** providers fail, the route returns `502` with the last error message.

To change the order or add a new provider:
1. Drop a new file in `server/services/aiProviders/` exporting `{ name, supportsVision, supportsText, chat }`.
2. Add it to `VISION_CHAIN` and/or `TEXT_CHAIN` in `index.js`.

---

## Auth flow

1. User logs in with Supabase (email/password or Google OAuth).
2. Frontend gets a session JWT and calls `GET /api/auth/me` with `Authorization: Bearer <jwt>`.
3. Backend `requireAuth` middleware verifies the JWT against Supabase and loads the `profiles` row.
4. First-time hit auto-creates the profile row with role inferred from `user_metadata` (set during signup).
5. If role is still missing (e.g. fresh Google signup), frontend redirects to `/register?step=role` for selection, then `PUT /api/auth/set-role` persists it.

**Roles:** `school`, `coaching`, `admission`, `private_tutor`, `admin`.

---

## What's removed

- Student panel (all `src/pages/student/*`, `studentStore`, curriculum data — gone)
- Puppeteer + backend PDF generation — incompatible with Vercel functions; do PDFs client-side
- Gemini-only AI — replaced by 7-provider fallback chain
- Mock auth — real Supabase JWT verification

## Known follow-ups

- Add client-side PDF generation (recommended: `html2pdf.js` since the paper template is B&W with simple borders)
- Delete the standalone `proshno-shala-v1-server/` folder (now merged into `server/`)
- Tune free-tier quota limits in `server/middleware/subscription.js` (currently a no-op)
