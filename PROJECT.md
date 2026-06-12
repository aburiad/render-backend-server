# 🏫 প্রশ্ন শালা — Complete Project Reference (V1)

> **Last Updated:** June 2026 | **Version:** V1 Stable  
> **Repositories:** `questionbankk` (frontend + server) | `render-backend-server` (backend API)

---

## 📌 Quick Navigation

- [Architecture Overview](#architecture-overview)
- [🔴 STABLE Files — Never Touch](#-stable-files--never-touch)
- [🟡 ACTIVE Files — Continuous Feature Addition](#-active-files--continuous-feature-addition)
- [🟢 NEW Files — Planned](#-new-files--planned)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React 19 + Vite + Zustand + Framer Motion + Tailwind   │   │
│  │  questionbankk/src/                                      │   │
│  └──────────────┬───────────────────────────────────────────┘   │
└─────────────────┼───────────────────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│  Vercel       │   │  Render.com   │
│  (Frontend +  │   │  (Backend API │
│   Server)     │   │   + AI)       │
│               │   │               │
│ questionbankk │   │ render-backend│
│ /api/         │   │ -server       │
│ /server/      │   │               │
└───────┬───────┘   └───────┬───────┘
        │                   │
        └─────────┬─────────┘
                  ▼
        ┌───────────────────┐
        │    Supabase       │
        │  (PostgreSQL +    │
        │   Auth + Storage) │
        └───────────────────┘
```

### Data Flow
```
User → React UI → API call → Backend → Supabase (data)
                                        → AI Provider (generation)
                                        → Return JSON → UI render
```

---

## 🔴 STABLE Files — Never Touch

> These files are foundational. Changing them risks breaking auth, DB connection, security, and core routing.  
> **Rule:** If it's 🔴, don't modify unless absolutely necessary.

---

### 🔴 questionbankk (Frontend)

#### Core Setup
| File | Purpose |
|------|---------|
| `package.json` | Dependencies — frozen for V1 |
| `vite.config.js` | Build config, plugins |
| `vercel.json` | Deployment routes |
| `index.html` | HTML entry point |
| `src/main.jsx` | React DOM mount |
| `src/App.jsx` | Router definitions |
| `src/index.css` | Global styles (Tailwind) |
| `src/App.css` | App-level styles |

#### Infrastructure
| File | Purpose |
|------|---------|
| `src/lib/supabase.js` | Supabase client init — **DO NOT CHANGE** |
| `src/services/api.js` | Axios instance + interceptors — stable |
| `src/store/authStore.js` | Auth state management — stable |
| `src/components/AuthBootstrap.jsx` | Auth initialization on app load |
| `src/components/AppInitializer.jsx` | App config fetch on startup |

#### Pages (Complete — no major changes needed)
| File | Purpose |
|------|---------|
| `src/pages/Login.jsx` | Login form |
| `src/pages/Register.jsx` | Registration form |
| `src/pages/AuthCallback.jsx` | OAuth callback handler |
| `src/pages/Pricing.jsx` | Subscription pricing page |
| `src/pages/PaymentSuccess.jsx` | Payment success redirect |
| `src/pages/PaymentFail.jsx` | Payment failure redirect |
| `src/pages/ScanUpload.jsx` | Image upload for OCR scanning |

#### Utilities (Stable)
| File | Purpose |
|------|---------|
| `src/utils/formatting.js` | Text/number formatting helpers |
| `src/utils/sectionNumbering.js` | Section numbering (ক, খ, গ…) |
| `src/utils/subNumbering.js` | Sub-numbering (i, ii, iii…) |
| `src/utils/paperLabels.js` | Paper label constants |
| `src/utils/stripOklchForPdf.js` | CSS compat for PDF |
| `src/utils/mathRender.jsx` | KaTeX math rendering |
| `src/utils/mathRender.css` | Math styles |
| `src/utils/imageCompress.js` | Client-side image compression |
| `src/lib/imageProcessor.js` | Image enhancement |
| `src/lib/enhanceImage.js` | Image quality boost |

---

### 🔴 questionbankk/server (Frontend Server)

| File | Purpose |
|------|---------|
| `server/app.js` | Express setup, CORS, middleware |
| `server/index.js` | Server entry point |
| `server/package.json` | Server dependencies |
| `server/config/` | DB & service configs |
| `server/middleware/` | Auth, error handling, rate limiting |
| `server/routes/auth.js` | Auth proxy routes |
| `server/routes/health.js` | Health check |

---

### 🔴 render-backend-server (Backend API)

#### Core Setup
| File | Purpose |
|------|---------|
| `package.json` | Dependencies |
| `app.js` | Express app, CORS, helmet, routes mount |
| `index.js` | Server entry, graceful shutdown, keep-alive |
| `config/supabase.js` | Supabase admin client — **DO NOT CHANGE** |

#### Middleware (Stable)
| File | Purpose |
|------|---------|
| `middleware/auth.js` | JWT verification (requireAuth) |
| `middleware/errorHandler.js` | Global error handler (AppError class) |
| `middleware/rateLimit.js` | Rate limiters (global, auth, AI, payment) |
| `middleware/rateLimitStore.js` | In-memory rate limit store |
| `middleware/credits.js` | AI credit check + charge system |
| `middleware/subscription.js` | Subscription tier middleware |

#### Services (Stable Core)
| File | Purpose |
|------|---------|
| `services/configService.js` | Dynamic config from Supabase |
| `services/creditService.js` | Credit system logic |
| `services/cryptoService.js` | Encryption utilities |
| `services/userApiKeyService.js` | User API key management |
| `services/paymentService.js` | Payment processing |
| `services/manualPaymentService.js` | Manual payment handling |
| `services/examService.js` | Exam system logic |
| `services/noticeService.js` | Notice CRUD |
| `services/routineService.js` | Routine CRUD |
| `services/paperService.js` | Paper CRUD |
| `services/pdfServerClient.js` | PDF generation client |

#### Routes (Stable)
| File | Purpose |
|------|---------|
| `routes/auth.js` | Auth routes (login, register, credits) |
| `routes/payment.js` | Payment + subscription routes |
| `routes/admin.js` | Admin panel routes |
| `routes/user.js` | User profile routes |
| `routes/limits.js` | Rate limit status routes |
| `routes/exam.js` | Exam portal routes |
| `routes/notice.js` | Notice routes |
| `routes/routine.js` | Routine routes |
| `routes/papers.js` | Paper CRUD routes |
| `routes/pdfServer.js` | PDF generation routes |

#### Utilities (Stable)
| File | Purpose |
|------|---------|
| `utils/imagePreprocessor.js` | Image preprocessing for AI |
| `utils/imageQualityAssessor.js` | Image quality scoring |
| `utils/strictOcrPrompts.js` | Zero-hallucination OCR prompts |

#### Data (Stable)
| File | Purpose |
|------|---------|
| `data/bookCurriculumFallback.json` | Curriculum structure fallback |
| `data/books/` | Seeded book data |

---

## 🟡 ACTIVE Files — Continuous Feature Addition

> These files are where features are actively added. Changes here are expected and safe.

---

### 🟡 questionbankk/src — Frontend Active Files

#### Question Components (ACTIVE — new question types, UI improvements)
| File | What Gets Added |
|------|-----------------|
| `src/components/questions/` | **New question types**, drag-drop, better MCQ/CQ UI |
| `src/components/questions/BookGenerateModal.jsx` | **New features:** class selection, subchapter picker, count picker, type filters |
| `src/components/paper/` | Paper layout improvements, new templates |
| `src/components/notice/` | Notice editor improvements |
| `src/components/routine/` | Routine editor improvements |
| `src/components/shared/` | **New shared components:** LoadingSpinner, EmptyState, etc. |

#### Pages (ACTIVE — new features, analytics)
| File | What Gets Added |
|------|-----------------|
| `src/pages/Dashboard.jsx` | **New:** analytics charts, usage stats, quick actions |
| `src/pages/AdminDashboard.jsx` | **New:** user management, AI provider stats, system health |
| `src/pages/PaperEditor.jsx` | **New:** section templates, drag reorder |
| `src/pages/ExamPortal.jsx` | **New:** timer improvements, question navigation |
| `src/pages/Results.jsx` | **New:** analytics, grade distribution |
| `src/pages/PDFPreview.jsx` | **New:** PDF template selection |
| `src/pages/LearningHub.jsx` | **New:** content sections, book viewer |
| `src/pages/SettingsAIKeys.jsx` | **New:** more provider options |
| `src/pages/OmrPreview.jsx` | **New:** OMR sheet improvements |
| `src/pages/TeachersList.jsx` | **New:** teacher profiles |
| `src/pages/TeacherSchedulePage.jsx` | **New:** schedule management |

#### Store (ACTIVE — new state slices)
| File | What Gets Added |
|------|-----------------|
| `src/store/paperStore.js` | New paper operations |
| `src/store/examStore.js` | Exam state improvements |
| `src/store/noticeStore.js` | Notice state |
| `src/store/routineStore.js` | Routine state |

#### Utils (ACTIVE)
| File | What Gets Added |
|------|-----------------|
| `src/utils/geometryTemplates.js` | **New shapes, GeoGebra commands** |
| `src/utils/paperToPdfHtml.js` | PDF template improvements |
| `src/utils/teacherSchedule.js` | Schedule features |

---

### 🟡 questionbankk/server — Frontend Server Active

| File | What Gets Added |
|------|-----------------|
| `server/routes/book.js` | **New:** endpoints for chapters, questions, generation |
| `server/services/bookService.js` | **New:** chapter queries, question fetching, content extraction |
| `server/scripts/` | **New:** seed scripts for new classes/subjects |
| `server/migrations/` | **New:** DB schema updates |

---

### 🟡 render-backend-server — Backend Active Files

#### AI System (ACTIVE — most changed area)
| File | What Gets Added |
|------|-----------------|
| `services/aiService.js` | **New:** prompt improvements, caching, response parsing |
| `services/aiProviders/` | **New providers:** HuggingFace, new models, cost optimization |
| `services/aiProviders/gemini.js` | Queue improvements, multi-key rotation |
| `services/aiProviders/groq.js` | Model updates |
| `services/aiProviders/mistral.js` | Model updates |

#### Book System (ACTIVE)
| File | What Gets Added |
|------|-----------------|
| `routes/book.js` | **New:** smart-prompt improvements, multi-chapter parallel |
| `services/bookService.js` | **New:** query optimization, caching, count limits |
| `routes/generate.js` | Generation improvements |

#### Geometry System (ACTIVE)
| File | What Gets Added |
|------|-----------------|
| `routes/geometry.js` | **New:** shape templates, AI geometry |
| `services/aiService.js` | Geometry-related AI prompts |

#### Data (ACTIVE)
| File | What Gets Added |
|------|-----------------|
| `data/bookCurriculumFallback.json` | **New classes, subjects, chapters** |

---

## 🟢 NEW Files — Planned

> Files that will be created for upcoming features.

### Planned for V1.1
| File | Purpose |
|------|---------|
| `src/components/questions/SmartPrompt.jsx` | Bangla natural language question generator |
| `src/components/questions/QuestionBank.jsx` | Browse/search all saved questions |
| `src/components/questions/DragDropQuestion.jsx` | Drag-drop question type |
| `src/pages/Analytics.jsx` | Usage analytics dashboard |
| `src/pages/BookViewer.jsx` | Textbook content viewer |
| `src/store/bookStore.js` | Book state management |
| `src/utils/huggingface.js` | HuggingFace integration |

### Planned for V1.2
| File | Purpose |
|------|---------|
| `src/components/shared/VoiceInput.jsx` | Speech-to-text input |
| `src/components/shared/AudioPlayer.jsx` | TTS playback |
| `src/utils/embeddings.js` | Duplicate detection |
| `services/aiProviders/huggingface.js` | HuggingFace provider (backend) |

### Planned for V1.3
| File | Purpose |
|------|---------|
| `src/pages/Collaboration.jsx` | Multi-user paper editing |
| `src/utils/offlineStorage.js` | Offline mode support |
| `src/pages/PublicPapers.jsx` | Public paper sharing |

---

## Database Schema

### Core Tables

```sql
-- Supabase PostgreSQL

-- Auth (managed by Supabase Auth)
-- users table auto-created by Supabase

-- Papers
papers (
  id, user_id, title, class_num, subject, 
  sections (jsonb), settings (jsonb),
  created_at, updated_at
)

-- Questions (book-based)
book_questions (
  id, class_num, subject, chapter_id, subchapter_id,
  question_type, question_data (jsonb),
  source_section, ordering,
  created_at
)

-- Chapters
book_chapters (
  id, class_num, subject, chapter_id, subchapter_id,
  parent_chapter_id, is_subchapter,
  title, payload (jsonb: full_text, question_points, ai_summary),
  created_at, updated_at
)

-- Exams
exams (
  id, user_id, paper_id, title, duration_minutes,
  settings (jsonb), status,
  created_at
)

-- Exam Answers
exam_answers (
  id, exam_id, student_id, answers (jsonb),
  score, submitted_at
)

-- Subscription Config
subscription_config (
  id, plan_name, credits, price,
  features (jsonb)
)

-- AI Provider Usage Log
ai_provider_usage (
  id, provider, success, created_at
)

-- Notices & Routines
notices (id, user_id, title, content, images, created_at)
routines (id, user_id, title, schedule_data, created_at)
```

---

## API Reference

### Backend (render-backend-server)

#### Auth
```
POST   /api/auth/register     → Register user
POST   /api/auth/login        → Login user
GET    /api/auth/me           → Current user info
GET    /api/auth/credits      → Credit balance
```

#### Papers
```
GET    /api/papers             → List user's papers
POST   /api/papers             → Create paper
PUT    /api/papers/:id         → Update paper
DELETE /api/papers/:id         → Delete paper
```

#### Book System
```
GET    /api/book/subjects/:classNum          → Available subjects
GET    /api/book/chapters/:classNum/:subject → Chapter list
GET    /api/book/subchapters/:classNum/:subject/:chapterId → Subchapters
POST   /api/book/existing-questions          → Fetch DB questions
POST   /api/book/generate                    → AI generate questions
POST   /api/book/smart-prompt                → Natural language → questions
```

#### AI
```
POST   /api/ai/scan            → Scan image → questions
POST   /api/ai/generate        → Generate from prompt
```

#### Geometry
```
POST   /api/geometry/translate  → AI geometry translation
```

#### Other
```
GET    /api/health             → Health check
GET    /api/health/deep        → Deep health check
GET    /api/backend-config     → Active backend URL
POST   /api/pdf-server/render  → PDF generation
```

### Frontend Server (questionbankk/server)
```
GET    /api/health             → Health check
POST   /api/auth/*             → Auth proxy to Supabase
```

---

## Deployment

### Frontend — Vercel
```
URL: proshno-shala.vercel.app
Build: npm run build
Output: dist/
Env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
```

### Backend — Render.com
```
URL: render-backend-server.onrender.com
Entry: index.js
Start: node index.js
Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY*, MISTRAL_API_KEY, etc.
Health: /api/health (keep-alive ping every 14 min)
```

### Database — Supabase
```
Region: ap-southeast-1 (Singapore)
Free tier: 500MB, 50K rows
Auth: Supabase Auth (JWT)
```

---

## 🔑 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=https://render-backend-server.onrender.com
```

### Backend (.env)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
GEMINI_API_KEY=AIza...
GEMINI_API_KEY_TWO=AIza...
GEMINI_API_KEY_THREE=AIza...
GEMINI_API_KEY_FOUR=AIza...
GEMINI_API_KEY_FIVE=AIza...
GROQ_API_KEY=gsk_...
MISTRAL_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
ALLOWED_ORIGINS=https://proshno-shala.vercel.app,https://proshno-shala.com
CLIENT_URL=https://proshno-shala.vercel.app
```

---

## Roadmap

### V1 (Current — Stable)
- [x] Paper creation & editing
- [x] MCQ + CQ + Short question types
- [x] Image OCR scanning
- [x] Book-based question generation (Classes 6-10)
- [x] Smart prompt (Bangla natural language)
- [x] PDF generation
- [x] Exam portal
- [x] Notice & Routine system
- [x] AI provider fallback chain
- [x] Credit system
- [x] Subscription & payment
- [x] Admin dashboard

### V1.1 (Next)
- [ ] Question Bank browser
- [ ] More question types (fill_blank, matching, broad)
- [ ] Learning Hub content
- [ ] Performance optimization (caching, compression)
- [ ] HuggingFace fallback provider
- [ ] Better analytics dashboard

### V1.2
- [ ] Voice input (Whisper)
- [ ] Text-to-Speech (Bangla)
- [ ] Duplicate question detection
- [ ] Offline mode
- [ ] Public paper sharing

### V1.3
- [ ] Collaboration
- [ ] Mobile app (React Native)
- [ ] Advanced geometry (GeoGebra integration)
- [ ] Multi-language support
- [ ] API for third-party integration

---

## ⚠️ Development Rules

1. **🔴 files:** Never modify without team review
2. **🟡 files:** Safe to modify, follow existing patterns
3. **New features:** Create new files when possible, don't bloat existing ones
4. **Database changes:** Always via Supabase migrations, never direct SQL
5. **API changes:** Maintain backward compatibility
6. **Testing:** Write tests for new features in `*.test.js` files
7. **Deployment:** Push to `main` branch triggers auto-deploy

---

> **Maintained by:** প্রশ্ন শালা Team  
> **Contact:** GitHub Issues