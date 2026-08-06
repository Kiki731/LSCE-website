-- ── Add phone column to attendees ─────────────────────────────────────────────
-- Run this in Supabase SQL Editor.
-- Allows guests to register their phone number when claiming their ticket.

ALTER TABLE attendees ADD COLUMN IF NOT EXISTS phone TEXT;
