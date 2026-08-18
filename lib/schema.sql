-- LSCE Database Schema
-- Run this in your Supabase SQL editor

-- Speakers
CREATE TABLE IF NOT EXISTS speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('keynote', 'general')),
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  quote TEXT,
  department TEXT DEFAULT 'management' CHECK (department IN ('management', 'partnerships', 'design', 'programs', 'welfare', 'technical', 'publicity', 'social_media', 'community')),
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ambassadors
CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school TEXT,
  bio TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery Images
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ticket Purchases
CREATE TABLE IF NOT EXISTS ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paystack_reference TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site Config (key-value store for event details, ticket prices, etc.)
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default site config
INSERT INTO site_config (key, value) VALUES
  ('event_date', 'October 3rd, 2026'),
  ('event_venue', 'Daystar Christian Centre, Ikeja, Lagos'),
  ('event_city', 'Lagos, Nigeria'),
  ('bronze_price', '4000'),
  ('silver_price', '8000'),
  ('gold_price', '0'),
  ('bronze_paystack_link', ''),
  ('silver_paystack_link', ''),
  ('gold_paystack_link', '')
ON CONFLICT (key) DO NOTHING;

-- Row Level Security
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Public read policies (visible content only)
CREATE POLICY "Public can read visible speakers" ON speakers
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can read visible team members" ON team_members
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can read visible ambassadors" ON ambassadors
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can read visible partners" ON partners
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can read gallery" ON gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Public can read site config" ON site_config
  FOR SELECT USING (true);

-- Ticket purchases: public can insert (on payment), service role can do everything
CREATE POLICY "Anyone can create ticket purchase" ON ticket_purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage all" ON ticket_purchases
  USING (auth.role() = 'service_role');

-- Storage buckets (run separately in Supabase dashboard or use this as reference)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('speakers', 'speakers', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('teams', 'teams', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ambassadors', 'ambassadors', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('partners', 'partners', true);
