-- Proshno Shala — Drop Legacy SSLCommerz `payments` Table
-- 2026-05-13
--
-- The `payments` table was used by an earlier SSLCommerz gateway
-- integration that was removed on 2026-05-04. Active payment recording
-- now lives in `manual_payments` (bKash/Nagad/Rocket, admin-verified).
--
-- Columns that confirmed SSLCommerz origin:
--   - tran_id          (SSLCommerz transaction ID)
--   - val_id           (SSLCommerz post-validation token)
--   - gateway_response (raw SSLCommerz API response dump)
--   - demo             (SSLCommerz sandbox mode flag)
--   - plan             (legacy 'pro/free' subscription tier)
--
-- IDEMPOTENT: safe to re-run even after the table has already been dropped.
-- Uses to_regclass() instead of direct SELECT so a missing table is a
-- no-op rather than a query error.

DO $$
BEGIN
  IF to_regclass('public.payments') IS NULL THEN
    RAISE NOTICE 'payments table already removed — nothing to do.';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.payments LIMIT 1) THEN
    RAISE EXCEPTION 'payments table is not empty — aborting drop. Inspect and migrate any retained rows first.';
  END IF;

  EXECUTE 'DROP TABLE public.payments CASCADE';
  RAISE NOTICE 'public.payments dropped successfully.';
END $$;
