-- ── Coupons table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  description     TEXT,
  discount_pct    INTEGER NOT NULL CHECK (discount_pct > 0 AND discount_pct <= 100),
  max_uses        INTEGER,                        -- NULL = unlimited
  times_used      INTEGER NOT NULL DEFAULT 0,
  valid_from      TIMESTAMPTZ,                    -- NULL = active immediately
  valid_until     TIMESTAMPTZ,                    -- NULL = never expires
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  ticket_types    TEXT[],                         -- NULL = applies to all tiers
  created_by      TEXT,                           -- admin email
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coupons_code_idx      ON coupons (UPPER(code));
CREATE INDEX IF NOT EXISTS coupons_is_active_idx ON coupons (is_active);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS coupons_updated_at ON coupons;
CREATE TRIGGER coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_coupons" ON coupons FOR ALL TO service_role USING (true);

-- Seed a couple of starter codes
INSERT INTO coupons (code, description, discount_pct, max_uses, created_by)
VALUES
  ('LSCE10',  '10% off — general promo',            10, 200, 'system'),
  ('LSCE20',  '20% off — special campaign',          20, 50,  'system'),
  ('CAMPUS',  '15% off — campus ambassadors',        15, 100, 'system')
ON CONFLICT (code) DO NOTHING;
