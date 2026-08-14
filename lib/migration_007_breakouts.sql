-- Migration 007: Add breakouts column to attendees table
-- Run in Supabase SQL editor

ALTER TABLE attendees
  ADD COLUMN IF NOT EXISTS breakouts text[] DEFAULT '{}';
