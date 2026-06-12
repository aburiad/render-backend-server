-- Proshno Shala — Enable RLS on All Public Tables
-- 2026-05-13
--
-- WHY:
--   Supabase exposes the `public` schema via PostgREST. Anyone with the
--   anon key (which is embedded in the frontend JS bundle, visible to all
--   visitors) can hit the REST API directly. With RLS disabled, those
--   anon-key requests can read/write any row.
--
--   Our backend uses the SERVICE ROLE key which bypasses RLS, so the
--   backend continues to function normally. The frontend NEVER queries
--   these tables directly (verified by grep `supabase.from(` in src/)
--   — all data flows through our Express API.
--
-- STRATEGY:
--   Enable RLS on every public table. With no policies attached, the
--   default is DENY-ALL for anon and authenticated roles. Service role
--   is unaffected (it bypasses RLS by design).
--
-- IDEMPOTENT: `ENABLE ROW LEVEL SECURITY` is a no-op if already enabled.

ALTER TABLE IF EXISTS public.book_chapters       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.book_questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.class_routines      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_purchases    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exam_submissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exams               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.manual_payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.papers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.question_bank       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rate_limit_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_api_keys       ENABLE ROW LEVEL SECURITY;

-- Special case: the public exam-taking page (/exam/:examId) is the ONLY
-- frontend path that needs anon read access to a couple of tables —
-- students submit answers without logging in. Currently this also goes
-- through the backend (/api/exam/...) so anon DB access isn't required.
-- If you ever switch to direct browser-to-DB calls for that flow, add
-- targeted SELECT/INSERT policies here. Until then, deny-all is correct.

-- Note on `profiles`: Supabase's auth helpers may have already enabled
-- RLS on this table when the project was created. The IF EXISTS guard
-- + idempotent ENABLE means re-running is harmless.
