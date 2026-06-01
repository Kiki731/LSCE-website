-- ─────────────────────────────────────────────
-- Migration 001 — Add social links to speakers
-- Run this in: Supabase Dashboard → SQL Editor
-- (Only needed if speakers table already exists from schema.sql)
-- ─────────────────────────────────────────────

ALTER TABLE speakers ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- ─────────────────────────────────────────────
-- After running, update individual speaker links:
-- UPDATE speakers
--   SET linkedin_url = 'https://linkedin.com/in/username',
--       twitter_url  = 'https://x.com/username'
--   WHERE name = 'Speaker Name';
-- ─────────────────────────────────────────────
