@AGENTS.md

# LSCE Website — Project Context for Claude

Lagos Students Career Expo 2026 · Production URL: **https://thelscexpo.com** · Deployed on Vercel

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15+ App Router (see AGENTS.md — breaking changes apply) |
| Styling | Tailwind CSS v4 — CSS-based config via `@theme {}` in `globals.css` |
| Database | Supabase (PostgreSQL + Auth) |
| Payments | Paystack — server-side redirect flow (NOT inline popup) |
| Email | Resend — `sendTicketConfirmation` + `sendGuestTicketClaim` in `lib/email.ts` |
| Fonts | SharpGrotesk — `font-display` = Display Medium25, `font-sans` = Book20 |

---

## Key Conventions

- **`section-container`** class = max-width 1440px, 120px horizontal padding (48px tablet, 20px mobile)
- **CSS animations** use `@keyframes` in `globals.css` + inline `style={{ animation: '...' }}` — NOT Tailwind classes (JIT misses them)
- **Inline styles for arbitrary margins** — `style={{ marginTop: '...' }}` instead of Tailwind `mt-[...]`
- **Arbitrary breakpoints** — `min-[1028px]:block`, `min-[1240px]:flex` etc.
- **Admin client type workaround** — `supabase as any` used on admin client to avoid `never` inference on dynamic-import client

---

## Fonts

```css
/* globals.css */
@font-face { font-family: 'SharpGroteskDisplay Medium25'; src: url('/fonts/SharpGroteskDisplay-Medium25.woff2'); }
@font-face { font-family: 'SharpGrotesk Book20'; src: url('/fonts/SharpGrotesk-Book20.woff2'); }

@theme {
  --font-display: 'SharpGroteskDisplay Medium25', sans-serif;
  --font-sans: 'SharpGrotesk Book20', sans-serif;
}
```

---

## Database Tables (Supabase)

`speakers` · `team_members` · `ambassadors` · `partners` · `gallery_images` · `orders` · `attendees` · `coupons`

Types are in `lib/types.ts`. Convenience aliases: `Order`, `Attendee`, `Coupon`.

**Key `attendees` columns:** `id`, `order_id` (FK), `email`, `name`, `ticket_code` (auto-generated unique), `checked_in`, `checked_in_at`

**Key `orders` columns:** `id`, `buyer_name`, `buyer_email`, `buyer_phone`, `ticket_type`, `quantity`, `unit_price`, `discount_code`, `discount_amount`, `total_amount`, `paystack_reference`, `payment_status`

Migration for coupons table: `lib/migration_004_coupons.sql` (run in Supabase SQL editor).

---

## Tickets

Three tiers defined in `lib/ticket-config.ts`:
- **Bronze Pass** — ₦5,000 (`priceKobo`: 500000)
- **Silver Pass** — ₦15,000 (`priceKobo`: 1,500,000)
- **Gold Pass** — ₦30,000 (`priceKobo`: 3,000,000)

Discount codes live in `.env.local` as `DISCOUNT_CODES=CODE:PCT,CODE:PCT` — **never in client code**. Validated server-side only via `POST /api/tickets/apply-coupon` which now checks the `coupons` Supabase table.

---

## Payment Flow

1. User selects ticket + fills buyer info on `/tickets`
2. Client `POST /api/payments/initiate` → server calls Paystack with secret key → returns `authorization_url`
3. Client redirects: `window.location.href = authorization_url`
4. Paystack redirects back to `{SITE_URL}/tickets/success?reference=xxx`
5. `TicketSuccessClient` calls `/api/tickets/verify-payment` then `/api/tickets/create-order`
6. Webhook at `/api/webhooks/paystack` is a safety net (fires server-to-server, idempotent)

**Why not inline popup?** Paystack v1 inline always hits `request_inline` and requires valid public key; fails in dev + is less secure. Redirect flow sets amount server-side (tamper-proof).

---

## API Routes

### Public
| Route | Method | Purpose |
|---|---|---|
| `/api/payments/initiate` | POST | Initialize Paystack transaction |
| `/api/tickets/verify-payment` | GET | Verify payment after redirect |
| `/api/tickets/create-order` | POST | Save order + attendees + send email |
| `/api/tickets/apply-coupon` | POST | Validate discount code (server-only) |
| `/api/webhooks/paystack` | POST | Paystack webhook — idempotent order creation |
| `/api/qr/[code]` | GET | Generate QR code PNG for ticket emails |

### Admin (require auth)
| Route | Method | Purpose |
|---|---|---|
| `/api/admin/orders` | GET | Paginated orders with filters + stats |
| `/api/admin/attendees` | GET | Paginated attendees with filters |
| `/api/admin/attendees/[id]` | PATCH | Toggle check-in / update name |
| `/api/admin/attendees/by-order/[id]` | GET | Attendees for a specific order |
| `/api/admin/checkin` | GET | Search attendees for check-in |
| `/api/admin/checkin` | POST | Toggle check-in by ticket_code |
| `/api/admin/coupons` | GET/POST | List / create coupons |
| `/api/admin/coupons/[id]` | PATCH/DELETE | Update / delete coupon |
| `/api/admin/team` | GET/POST/DELETE | List / create / delete admin users |
| `/api/admin/applications` | GET | Paginated ambassador applications with filter + stats |
| `/api/admin/applications/[id]` | PATCH | Update application status (pending/approved/rejected) |
| `/api/admin/contact-messages` | GET | Paginated contact form messages |

---

## Admin Portal

URL: `/admin/login` → `/admin/dashboard`

**Auth:** Supabase email + password. No public sign-up. Admins created by existing admins via `/admin/team`. Middleware (`middleware.ts`) handles all auth redirects. Layout (`app/admin/layout.tsx`) controls sidebar render — NO redirect in layout (would cause infinite loop).

**Sidebar pages:** Overview · Orders · Attendees · Check-in · Coupons · CVs · Applications · Messages · Team

**Responsive:** sidebar always visible ≥ 1240px, hamburger + overlay below. Handled in `AdminShell.tsx`.

---

## Email

`lib/email.ts` — `FROM_ADDRESS` defaults to `LSCE Tickets <tickets@thelscexpo.com>` (override with `RESEND_FROM` env var while domain isn't verified). `REPLY_TO` = `lagosstudentcareerexpo@gmail.com`.

Two email types:
- `sendTicketConfirmation()` — branded HTML with QR codes, sent to buyer
- `sendGuestTicketClaim()` — sent to each non-buyer seat email

QR codes served by `/api/qr/[code]` — works in all email clients (no external service).

---

## Supabase Auth helpers

- `createSupabaseServerClient()` — cookie-based, for server components + API routes (uses anon key)
- `createSupabaseAdminClient()` — service role key, bypasses RLS, for admin operations

Both in `lib/supabase-server.ts`.

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxx   # switch to live before launch
PAYSTACK_SECRET_KEY=sk_live_xxx               # switch to live before launch
# Note: webhook signature verification uses PAYSTACK_SECRET_KEY (not a separate webhook secret)
RESEND_API_KEY=re_xxx
RESEND_FROM=LSCE Tickets <tickets@thelscexpo.com>   # only after domain verified in Resend
DISCOUNT_CODES=LSCE10:10,LSCE20:20,CAMPUS:15
NEXT_PUBLIC_SITE_URL=https://thelscexpo.com
```

**Security:** `.env*` is in `.gitignore`. Never commit keys. Paystack keys are test keys during dev — switch to live before launch.

---

## Pending Before Launch

- [ ] Set `PAYSTACK_WEBHOOK_SECRET` (from Paystack dashboard → Settings → API & Webhooks)
- [ ] Switch Paystack to live keys (`pk_live_` / `sk_live_`)
- [ ] Verify `thelscexpo.com` in Resend dashboard → add TXT records in Namecheap Zone Editor
- [ ] Add `https://thelscexpo.com` to Supabase Auth → Site URL + Redirect URLs
- [ ] Add all `.env.local` values to Vercel Environment Variables
- [ ] Run `lib/migration_004_coupons.sql` in Supabase SQL editor (if not done)
- [ ] DNS: A record for `thelscexpo.com` → `76.76.21.21` (Vercel); www CNAME → `cname.vercel-dns.com`

---

## Known Patterns / Gotchas

- **Never put discount codes in client-accessible files** — they appear in the JS bundle
- **Admin layout must NOT redirect to /admin/login** — causes infinite loop (middleware handles it)
- **Paystack callback_url must use `NEXT_PUBLIC_SITE_URL`** — hardcoding production URL breaks dev
- **`supabase as any`** — used throughout admin API routes; the dynamic import breaks generic inference
- **FadeUp + CSS animation conflict** — don't wrap marquee/carousel elements in FadeUp (transform clash)
- **Image `fill` + `style.height`** — can't combine; wrap in absolutely-positioned div instead
