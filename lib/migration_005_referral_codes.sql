-- Migration 005: Referral codes for ambassador programme
-- Run this in the Supabase SQL editor before deploying the referral feature.

-- 1. Referral codes table
create table if not exists referral_codes (
  id               uuid primary key default gen_random_uuid(),
  ambassador_email text not null unique,
  ambassador_name  text not null,
  code             text not null unique,
  created_at       timestamptz default now()
);

-- 2. Add referral_code column to orders (nullable — most orders won't have one)
alter table orders add column if not exists referral_code text references referral_codes(code) on update cascade on delete set null;

-- 3. Index for fast lookup when an order is placed
create index if not exists orders_referral_code_idx on orders(referral_code) where referral_code is not null;

-- 4. Enable RLS — only service role can read/write (public can only call via API routes)
alter table referral_codes enable row level security;
create policy "Service role only" on referral_codes using (false);
