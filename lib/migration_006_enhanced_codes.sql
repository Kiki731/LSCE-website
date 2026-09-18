-- ── referral_codes enhancements ──────────────────────────────────────────────
ALTER TABLE referral_codes ADD COLUMN IF NOT EXISTS uses       INTEGER NOT NULL DEFAULT 0;
ALTER TABLE referral_codes ADD COLUMN IF NOT EXISTS university TEXT;

-- Only one code per university (case-insensitive, nulls are exempt)
CREATE UNIQUE INDEX IF NOT EXISTS referral_codes_university_uq
  ON referral_codes (LOWER(university))
  WHERE university IS NOT NULL;

-- ── coupons enhancements ──────────────────────────────────────────────────────
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_discount    BOOLEAN      NOT NULL DEFAULT TRUE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_type  TEXT         NOT NULL DEFAULT 'percentage'
  CHECK (discount_type IN ('percentage', 'fixed'));
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10,2) DEFAULT NULL;  -- naira, for fixed type
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS assigned_to    TEXT         DEFAULT NULL;   -- influencer email, for tracking only
