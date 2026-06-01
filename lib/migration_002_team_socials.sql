-- ─────────────────────────────────────────────
-- Migration 002 — Add social links + quote to team_members
-- Run this in: Supabase Dashboard → SQL Editor
-- (Only needed if team_members table already exists from schema.sql)
-- ─────────────────────────────────────────────

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS quote TEXT;

-- ─────────────────────────────────────────────
-- After running, update individual team member data:
-- UPDATE team_members
--   SET linkedin_url = 'https://linkedin.com/in/username',
--       twitter_url  = 'https://x.com/username',
--       quote        = 'Your favourite quote goes here.'
--   WHERE name = 'Team Member Name';
-- ─────────────────────────────────────────────
