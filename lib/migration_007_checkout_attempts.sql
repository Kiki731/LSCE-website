-- Migration 007 — checkout attempt tracking
--
-- Why: a payment was only ever recorded by one of two paths (the browser
-- calling create-order, or the Paystack webhook). When both failed the
-- payment was invisible to us — no row, nothing on the admin page, no way
-- to reconcile. This table records every checkout BEFORE the user leaves
-- for Paystack, so every attempt is always accounted for.

create table if not exists checkout_attempts (
  id                 uuid primary key default gen_random_uuid(),
  paystack_reference text unique not null,
  buyer_name         text,
  buyer_email        text not null,
  buyer_phone        text,
  ticket_type        text not null,
  quantity           integer not null default 1,
  expected_total     integer not null default 0,
  discount_code      text,
  referral_code      text,
  attendee_emails    jsonb not null default '[]'::jsonb,
  breakouts          jsonb not null default '[]'::jsonb,
  status             text not null default 'initiated',
  created_at         timestamptz not null default now()
);

create index if not exists checkout_attempts_created_idx on checkout_attempts (created_at desc);
create index if not exists checkout_attempts_email_idx   on checkout_attempts (buyer_email);
create index if not exists checkout_attempts_status_idx  on checkout_attempts (status);

alter table checkout_attempts enable row level security;

-- Service role bypasses RLS; no public policy on purpose. Admin reads go
-- through the service-role client, same as orders and attendees.
