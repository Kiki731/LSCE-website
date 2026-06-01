-- ── Orders table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name          TEXT NOT NULL,
  buyer_email         TEXT NOT NULL,
  buyer_phone         TEXT,
  ticket_type         TEXT NOT NULL CHECK (ticket_type IN ('bronze', 'silver', 'gold')),
  quantity            INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price          INTEGER NOT NULL,          -- in Naira
  discount_code       TEXT,
  discount_amount     INTEGER NOT NULL DEFAULT 0,-- in Naira
  total_amount        INTEGER NOT NULL,           -- in Naira
  paystack_reference  TEXT UNIQUE,
  payment_status      TEXT NOT NULL DEFAULT 'pending'
                        CHECK (payment_status IN ('pending', 'completed', 'failed')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Attendees table (one row per ticket seat) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS attendees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name            TEXT,
  email           TEXT NOT NULL,
  ticket_code     TEXT UNIQUE DEFAULT UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  checked_in      BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS orders_buyer_email_idx ON orders (buyer_email);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders (payment_status);
CREATE INDEX IF NOT EXISTS attendees_order_id_idx ON attendees (order_id);
CREATE INDEX IF NOT EXISTS attendees_ticket_code_idx ON attendees (ticket_code);

-- ── Auto-update updated_at ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────────────
ALTER TABLE orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by API routes)
CREATE POLICY "service_role_orders"    ON orders    FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_attendees" ON attendees FOR ALL TO service_role USING (true);

-- Allow buyers to view their own orders by email
CREATE POLICY "buyer_view_own_order" ON orders
  FOR SELECT USING (buyer_email = current_setting('request.jwt.claims', true)::json->>'email');
