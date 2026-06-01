-- ─────────────────────────────────────────────
-- LSCE Team Members Seed
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────
-- image_url format: https://xbfplvaymrtzlsikiwdr.supabase.co/storage/v1/object/public/teams/<filename>
-- ─────────────────────────────────────────────

-- ── Organizing ────────────────────────────────
INSERT INTO team_members (name, role, image_url, linkedin_url, twitter_url, quote, department, display_order, is_visible) VALUES
  ('Team Member', 'Convener',        NULL, NULL, NULL, NULL, 'organizing', 1, true),
  ('Team Member', 'Project Manager', NULL, NULL, NULL, NULL, 'organizing', 2, true),
  ('Team Member', 'Operations Lead', NULL, NULL, NULL, NULL, 'organizing', 3, true)
ON CONFLICT DO NOTHING;

-- ── Partnerships ──────────────────────────────
INSERT INTO team_members (name, role, image_url, linkedin_url, twitter_url, quote, department, display_order, is_visible) VALUES
  ('Team Member', 'Partnerships Lead', NULL, NULL, NULL, NULL, 'partnerships', 4, true),
  ('Team Member', 'Brand Manager',     NULL, NULL, NULL, NULL, 'partnerships', 5, true),
  ('Team Member', 'Sponsorship Lead',  NULL, NULL, NULL, NULL, 'partnerships', 6, true)
ON CONFLICT DO NOTHING;

-- ── Design ────────────────────────────────────
INSERT INTO team_members (name, role, image_url, linkedin_url, twitter_url, quote, department, display_order, is_visible) VALUES
  ('Team Member', 'Creative Director', NULL, NULL, NULL, NULL, 'design', 7, true),
  ('Team Member', 'UI/UX Designer',    NULL, NULL, NULL, NULL, 'design', 8, true),
  ('Team Member', 'Visual Designer',   NULL, NULL, NULL, NULL, 'design', 9, true)
ON CONFLICT DO NOTHING;

-- ── Social Media ──────────────────────────────
INSERT INTO team_members (name, role, image_url, linkedin_url, twitter_url, quote, department, display_order, is_visible) VALUES
  ('Team Member', 'Social Media Lead',     NULL, NULL, NULL, NULL, 'social', 10, true),
  ('Team Member', 'Content Creator',       NULL, NULL, NULL, NULL, 'social', 11, true),
  ('Team Member', 'Community Manager',     NULL, NULL, NULL, NULL, 'social', 12, true)
ON CONFLICT DO NOTHING;

-- ── Programs ──────────────────────────────────
INSERT INTO team_members (name, role, image_url, linkedin_url, twitter_url, quote, department, display_order, is_visible) VALUES
  ('Team Member', 'Programs Lead',     NULL, NULL, NULL, NULL, 'programs', 13, true),
  ('Team Member', 'Events Coordinator', NULL, NULL, NULL, NULL, 'programs', 14, true),
  ('Team Member', 'Logistics Manager', NULL, NULL, NULL, NULL, 'programs', 15, true)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- After inserting, update with real data:
-- UPDATE team_members
--   SET name = 'David Jonas',
--       role = 'Convener',
--       image_url = 'https://xbfplvaymrtzlsikiwdr.supabase.co/storage/v1/object/public/teams/david-jonas.jpg',
--       linkedin_url = 'https://linkedin.com/in/davidjonas',
--       twitter_url = 'https://x.com/davidjonas',
--       quote = 'Life is short, eat more beans.'
--   WHERE display_order = 1;
-- ─────────────────────────────────────────────
