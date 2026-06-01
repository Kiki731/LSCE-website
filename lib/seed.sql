-- ─────────────────────────────────────────────
-- LSCE Speakers Seed
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────
-- image_url: leave NULL now, update after uploading
-- photos to Storage > speakers bucket.
-- Format: https://xbfplvaymrtzlsikiwdr.supabase.co/storage/v1/object/public/speakers/<filename>
-- ─────────────────────────────────────────────

-- Clear existing placeholder rows first (optional, safe to remove if you have real data)
-- DELETE FROM speakers;

-- ── Keynote Speakers ──────────────────────────
INSERT INTO speakers (name, role, bio, image_url, linkedin_url, twitter_url, category, display_order, is_visible) VALUES

  ('Speaker Name',
   'CEO · Company',
   NULL,
   NULL,
   NULL,
   NULL,
   'keynote', 1, true),

  ('Speaker Name',
   'Founder · Company',
   'A short bio about this speaker — what they''ve built, what they stand for, and why they''re speaking at LSCE 3.0.',
   NULL,
   NULL,
   NULL,
   'keynote', 2, true),

  ('Speaker Name',
   'Director · Company',
   NULL,
   NULL,
   NULL,
   NULL,
   'keynote', 3, true)

ON CONFLICT DO NOTHING;


-- ── General Speakers ──────────────────────────
INSERT INTO speakers (name, role, bio, image_url, linkedin_url, twitter_url, category, display_order, is_visible) VALUES

  ('Speaker Name', 'Role · Company', NULL, NULL, NULL, NULL, 'general', 4, true),
  ('Speaker Name', 'Role · Company', NULL, NULL, NULL, NULL, 'general', 5, true),
  ('Speaker Name', 'Role · Company', NULL, NULL, NULL, NULL, 'general', 6, true),
  ('Speaker Name', 'Role · Company', NULL, NULL, NULL, NULL, 'general', 7, true),
  ('Speaker Name', 'Role · Company', NULL, NULL, NULL, NULL, 'general', 8, true),
  ('Speaker Name', 'Role · Company', NULL, NULL, NULL, NULL, 'general', 9, true)

ON CONFLICT DO NOTHING;


-- ─────────────────────────────────────────────
-- After inserting, update image URLs like this:
-- UPDATE speakers
--   SET image_url = 'https://xbfplvaymrtzlsikiwdr.supabase.co/storage/v1/object/public/speakers/john-doe.jpg'
--   WHERE name = 'John Doe';
-- ─────────────────────────────────────────────
