-- Proshno Shala — Bulk Signup Bonus RPC
-- 2026-05-13 (follow-up patch)
--
-- Replaces the JS-loop bulk signup bonus with a single atomic SQL
-- operation. Avoids Vercel function timeout on large user bases and
-- guarantees consistency (either all eligible users get the bonus,
-- or none do — single transaction).

CREATE OR REPLACE FUNCTION grant_bulk_signup_bonus(
  p_bonus INT,
  p_admin_uid UUID
)
RETURNS TABLE (eligible INT, updated INT) AS $$
DECLARE
  total_eligible INT;
  total_updated INT;
BEGIN
  IF p_bonus IS NULL OR p_bonus <= 0 THEN
    RAISE EXCEPTION 'invalid_bonus' USING ERRCODE = 'P0001';
  END IF;

  -- Eligible = profiles with NO row in credit_purchases.
  WITH eligible_users AS (
    SELECT p.id
    FROM profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM credit_purchases cp WHERE cp.user_id = p.id
    )
  ),
  count_step AS (
    SELECT COUNT(*) AS n FROM eligible_users
  ),
  upd AS (
    UPDATE profiles
    SET ai_op_credits = p_bonus,
        updated_at = NOW()
    WHERE id IN (SELECT id FROM eligible_users)
    RETURNING id
  ),
  ins AS (
    INSERT INTO credit_purchases (user_id, amount_bdt, ai_ops_added, source, note)
    SELECT id, 0, p_bonus, 'signup',
           'Bulk retroactive signup bonus by admin ' || p_admin_uid::text
    FROM upd
    RETURNING id
  )
  SELECT
    (SELECT n FROM count_step),
    (SELECT COUNT(*) FROM ins)
  INTO total_eligible, total_updated;

  RETURN QUERY SELECT total_eligible, total_updated;
END;
$$ LANGUAGE plpgsql;
