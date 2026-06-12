-- Proshno Shala — Credit System Migration
-- 2026-05-13
--
-- Adds pay-as-you-go AI credit pool to replace subscription tiers.
-- Each user has `ai_op_credits` (total AI operations remaining).
-- Top-ups via manual bKash payment add credits at admin-configurable rate.
--
-- Idempotent: safe to re-run on partially migrated DB.

-- 1. Credit pool on profile
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_op_credits INT NOT NULL DEFAULT 25;

COMMENT ON COLUMN profiles.ai_op_credits IS
  'Total AI operations remaining in user pool. Default 25 = 1 free paper on signup.';

-- 2. Per-paper analytics counter (informational, not enforcement)
ALTER TABLE papers
  ADD COLUMN IF NOT EXISTS ai_ops_used INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN papers.ai_ops_used IS
  'AI operations consumed on this paper. Analytics only.';

-- 3. Credit purchase history (audit trail)
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_bdt INT NOT NULL CHECK (amount_bdt >= 0),
  ai_ops_added INT NOT NULL CHECK (ai_ops_added > 0),
  payment_id UUID REFERENCES manual_payments(id) ON DELETE SET NULL,
  bonus_ops INT NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'purchase',  -- 'purchase' | 'signup' | 'referral' | 'admin_grant' | 'promo'
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_created
  ON credit_purchases (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_purchases_payment
  ON credit_purchases (payment_id);

-- 4. Atomic decrement function (race-safe credit consumption)
CREATE OR REPLACE FUNCTION decrement_ai_credits(p_uid UUID, p_count INT)
RETURNS INT AS $$
DECLARE
  remaining INT;
BEGIN
  IF p_count <= 0 THEN
    RAISE EXCEPTION 'invalid_count: must be > 0' USING ERRCODE = 'P0001';
  END IF;

  UPDATE profiles
  SET ai_op_credits = ai_op_credits - p_count,
      updated_at = NOW()
  WHERE id = p_uid AND ai_op_credits >= p_count
  RETURNING ai_op_credits INTO remaining;

  IF remaining IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits' USING ERRCODE = 'P0001';
  END IF;

  RETURN remaining;
END;
$$ LANGUAGE plpgsql;

-- 5. Atomic increment function (top-ups and bonuses)
CREATE OR REPLACE FUNCTION increment_ai_credits(p_uid UUID, p_count INT)
RETURNS INT AS $$
DECLARE
  new_balance INT;
BEGIN
  IF p_count <= 0 THEN
    RAISE EXCEPTION 'invalid_count: must be > 0' USING ERRCODE = 'P0001';
  END IF;

  UPDATE profiles
  SET ai_op_credits = ai_op_credits + p_count,
      updated_at = NOW()
  WHERE id = p_uid
  RETURNING ai_op_credits INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'user_not_found' USING ERRCODE = 'P0001';
  END IF;

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- 6. Atomic per-paper AI ops counter increment (analytics)
CREATE OR REPLACE FUNCTION increment_paper_ai_ops(p_paper_id UUID, p_count INT)
RETURNS VOID AS $$
BEGIN
  UPDATE papers
  SET ai_ops_used = ai_ops_used + p_count,
      updated_at = NOW()
  WHERE id = p_paper_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Extend subscription_config to carry credit settings.
--    We keep the existing JSONB structure; admin UI writes a `credit_config`
--    object into the row alongside existing fields. configService normalises.
--
--    Default values are applied at the application layer (configService.js)
--    so this migration touches no row data; it just allows admins to set:
--      credit_config = {
--        bdt_per_paper: 10,
--        ops_per_paper: 25,
--        signup_bonus_ops: 25,
--        referral_bonus_ops: 25,
--        min_topup_bdt: 10,
--        suggested_topups_bdt: [10, 50, 200, 500, 1000, 5000]
--      }
ALTER TABLE subscription_config
  ADD COLUMN IF NOT EXISTS credit_config JSONB;

COMMENT ON COLUMN subscription_config.credit_config IS
  'Admin-editable credit system settings: bdt_per_paper, ops_per_paper, '
  'signup_bonus_ops, referral_bonus_ops, min_topup_bdt, suggested_topups_bdt.';

-- 8. Backfill: existing users get default signup bonus
--    Only sets credit to 25 if NULL/0 (idempotent — won't overwrite existing top-ups).
UPDATE profiles
SET ai_op_credits = 25
WHERE ai_op_credits IS NULL OR ai_op_credits = 0;
