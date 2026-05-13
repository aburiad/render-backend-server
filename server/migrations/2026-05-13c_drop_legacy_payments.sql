-- Proshno Shala — Drop Legacy SSLCommerz `payments` Table
-- 2026-05-13
--
-- The `payments` table was used by an earlier SSLCommerz gateway
-- integration that was removed on 2026-05-04. Active payment recording
-- now lives in `manual_payments` (bKash/Nagad/Rocket, admin-verified).
--
-- Columns that confirm SSLCommerz origin:
--   - tran_id          (SSLCommerz transaction ID)
--   - val_id           (SSLCommerz post-validation token)
--   - gateway_response (raw SSLCommerz API response dump)
--   - demo             (SSLCommerz sandbox mode flag)
--   - plan             (legacy 'pro/free' subscription tier)
--
-- No code references this table — verified via grep `from('payments')`
-- and `\bpayments\b` across server/, src/, api/. The only matches are
-- URL paths like /api/admin/payments/manual which query `manual_payments`.
--
-- This migration is idempotent: safe to re-run.

-- Safety: only drop if empty. Comment out this guard if you're certain
-- there's no legacy data worth retaining.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM payments LIMIT 1) THEN
    RAISE EXCEPTION 'payments table is not empty — abort drop. Inspect and migrate any retained rows first.';
  END IF;
END $$;

DROP TABLE IF EXISTS payments CASCADE;
