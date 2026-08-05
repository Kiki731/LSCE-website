import { Resend } from 'resend'
import { TICKET_TYPES, type TicketTier } from './ticket-config'

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY is not set — emails will not be sent')
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const EVENT_NAME   = 'Lagos Students Career Expo 2026'
const EVENT_DATE   = 'Saturday, October 3rd, 2026'
const EVENT_VENUE  = 'Landmark Event Centre, Victoria Island, Lagos'
const BRAND_RED    = '#FF2035'
const REPLY_TO     = 'lagosstudentcareerexpo@gmail.com'
// Use RESEND_FROM once thelscexpo.com is verified in the Resend dashboard.
// Until then, leave RESEND_FROM unset and emails send from onboarding@resend.dev.
const FROM_ADDRESS = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

// Production base URL — used to build absolute image URLs for emails
// Update NEXT_PUBLIC_SITE_URL in .env.local to https://thelscexpo.com in production
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelscexpo.com').replace(/\/$/, '')

export interface TicketConfirmationPayload {
  orderId:     string
  buyerName:   string
  buyerEmail:  string
  ticketType:  TicketTier
  quantity:    number
  totalAmount: number
  paystackRef: string
  ticketCodes: string[]
}

/* ── QR code URL — served by /api/qr/[code], works in all email clients ── */
function qrUrl(code: string): string {
  return `${SITE_URL}/api/qr/${encodeURIComponent(code)}`
}

/* ── Absolute URL for static assets ── */
function assetUrl(path: string): string {
  return `${SITE_URL}${path}`
}

function buildConfirmationHtml(p: TicketConfirmationPayload): string {
  const ticket         = TICKET_TYPES[p.ticketType]
  const formattedTotal = '₦' + p.totalAmount.toLocaleString('en-NG')
  const firstName      = p.buyerName.split(' ')[0]
  const bannerUrl      = assetUrl('/images/EMERGE%20Themee%20Reveal%20Header.png')

  const qrBlocks = p.ticketCodes.map((code, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td>
          ${p.quantity > 1 ? `<p style="margin:0 0 6px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Ticket ${i + 1} of ${p.quantity}</p>` : ''}
          <p style="margin:0 0 14px;font-size:14px;color:#333333;">
            <strong>Your Ticket ID:</strong>&nbsp;
            <span style="font-family:monospace;background:#F3F4F6;padding:3px 10px;border-radius:4px;font-size:13px;color:#111111;">${code}</span>
          </p>
          <img
            src="${qrUrl(code)}"
            alt="QR Code for ${code}"
            width="140"
            height="140"
            style="display:block;margin-bottom:18px;border-radius:8px;border:1px solid #E5E5E5;"
          />
          <a href="${SITE_URL}/tickets/view/${code}"
            style="display:inline-block;background:${BRAND_RED};color:white;font-size:14px;font-weight:600;
                   padding:12px 28px;border-radius:100px;text-decoration:none;letter-spacing:0.01em;">
            Download Ticket
          </a>
        </td>
      </tr>
    </table>
    ${i < p.ticketCodes.length - 1 ? '<hr style="border:none;border-top:1px solid #E5E5E5;margin:0 0 24px;" />' : ''}
  `).join('')

  const cvSection = p.ticketType === 'silver' ? `
    <hr style="border:none;border-top:1px solid #E5E5E5;margin:0 0 24px;" />
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#FFF5F5;border-radius:10px;border:1px solid #FFD5D5;margin-bottom:24px;">
      <tr>
        <td style="padding:22px 24px;">
          <p style="margin:0 0 4px;font-size:11px;color:${BRAND_RED};text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Silver Pass — Action Required</p>
          <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1A1A1A;">Upload Your CV</p>
          <p style="margin:0 0 18px;font-size:14px;color:#555555;line-height:1.7;">
            Your Silver Pass includes CV submission for employer visibility at LSCE 2026.
            Upload your CV to complete your registration and get in front of top companies.
          </p>
          <a href="${SITE_URL}/tickets/upload-cv/${p.ticketCodes[0]}"
            style="display:inline-block;background:${BRAND_RED};color:white;font-size:14px;font-weight:600;
                   padding:12px 28px;border-radius:100px;text-decoration:none;letter-spacing:0.01em;">
            Upload My CV →
          </a>
        </td>
      </tr>
    </table>
  ` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your LSCE Ticket</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E5E5E5;">

          <!-- Banner -->
          <tr>
            <td style="padding:0;line-height:0;">
              <a href="${SITE_URL}" style="display:block;line-height:0;">
                <img
                  src="${bannerUrl}"
                  alt="Lagos Students Career Expo 3.0 — Emerge"
                  width="600"
                  style="display:block;width:100%;max-width:600px;"
                />
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 12px;">

              <!-- Greeting -->
              <p style="margin:0 0 10px;font-size:19px;font-weight:700;color:#000000;">You&rsquo;re in, ${firstName}! 🎉</p>
              <p style="margin:0 0 28px;font-size:14px;color:#444444;line-height:1.7;">
                Your ${ticket.name} for the <strong>Lagos Students Career Expo 2026</strong> is confirmed.
                Below is your ticket — show the QR code or Ticket ID at the entrance.
              </p>

              <hr style="border:none;border-top:1px solid #E5E5E5;margin:0 0 24px;" />

              <!-- Event info -->
              <p style="margin:0 0 6px;font-size:14px;color:#333333;">📅 ${EVENT_DATE}</p>
              <p style="margin:0 0 24px;font-size:14px;color:#333333;">📍 ${EVENT_VENUE}</p>

              <!-- Order summary -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#F9F6EE;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:16px;">
                          <p style="margin:0 0 8px;font-size:10px;color:#999999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Ticket Type</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#000000;">${ticket.name}</p>
                        </td>
                        <td style="padding-right:16px;">
                          <p style="margin:0 0 8px;font-size:10px;color:#999999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Qty</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#000000;">${p.quantity}</p>
                        </td>
                        <td>
                          <p style="margin:0 0 8px;font-size:10px;color:#999999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Total Paid</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#000000;">${formattedTotal}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #E5E5E5;margin:0 0 28px;" />

              <!-- QR + Download Ticket (one block per ticket) -->
              ${qrBlocks}

              <!-- CV upload section — Silver ticket holders only -->
              ${cvSection}

              <hr style="border:none;border-top:1px solid #E5E5E5;margin:0 0 24px;" />

              <!-- What to bring -->
              <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#000000;">What to bring:</p>
              <ul style="margin:0 0 28px;padding-left:20px;color:#444444;font-size:14px;line-height:2.2;">
                <li>This email (phone or printed)</li>
                <li>A valid student ID or government-issued ID</li>
                <li>Your Ticket ID as backup if QR can&rsquo;t be scanned</li>
              </ul>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #E5E5E5;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#666666;line-height:1.6;">
                Questions? Reply to this email or write to
                <a href="mailto:${REPLY_TO}" style="color:${BRAND_RED};text-decoration:none;">${REPLY_TO}</a>
              </p>
              <p style="margin:0;font-size:12px;color:#999999;">
                &copy;${new Date().getFullYear()} Lagos Students Career Expo. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

function buildConfirmationText(p: TicketConfirmationPayload): string {
  const ticket         = TICKET_TYPES[p.ticketType]
  const formattedTotal = '₦' + p.totalAmount.toLocaleString('en-NG')
  const codes          = p.ticketCodes.map((c, i) => `  Ticket ${i + 1}: ${c}`).join('\n')
  return `
Hi ${p.buyerName},

Your ${ticket.name} for ${EVENT_NAME} is confirmed!

Order:
- Ticket type: ${ticket.name}
- Quantity:    ${p.quantity}
- Total paid:  ${formattedTotal}
- Order ref:   ${p.paystackRef}

Your Ticket ID${p.quantity > 1 ? 's' : ''}:
${codes}

Show your QR code or Ticket ID at the entrance on the day.

Event: ${EVENT_DATE}
Venue: ${EVENT_VENUE}

What to bring:
- This email
- A valid student ID or government-issued ID
- Your Ticket ID as backup if QR can't be scanned

See you there,
The LSCE Team
${REPLY_TO}
`.trim()
}

/* ── Guest ticket claim email ─────────────────────────────────────────────── */
export interface GuestTicketPayload {
  guestEmail:  string
  buyerName:   string
  ticketType:  TicketTier
  ticketCode:  string
}

export async function sendGuestTicketClaim(p: GuestTicketPayload): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const ticket   = TICKET_TYPES[p.ticketType]
  const claimUrl = `${SITE_URL}/tickets/claim/${p.ticketCode}`
  const logoUrl  = assetUrl('/images/Lsce red.png')

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#F7F5F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F2;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:28px;">
          <a href="https://thelscexpo.com" style="display:inline-block;text-decoration:none;">
            <img src="${logoUrl}" alt="LSCE 2026" height="36" style="display:block;height:36px;width:auto;" />
          </a>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:white;border-radius:20px;border:1px solid #E5E5E5;overflow:hidden;">
          <div style="background:${BRAND_RED};height:5px;border-radius:4px 4px 0 0;"></div>
          <div style="padding:36px 32px;">

            <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.08em;">You have a ticket</p>
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;line-height:1.25;">
              ${p.buyerName} bought you<br/>a ticket to LSCE 2026 🎟️
            </h1>
            <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
              Your <strong>${ticket.name}</strong> is paid and waiting. Claim it to complete your registration and get your QR entry code.
            </p>

            <!-- Ticket preview -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#F7F5F2;border-radius:10px;border:1px solid #E5E5E5;margin-bottom:28px;">
              <tr><td style="padding:16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin:0 0 2px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Ticket</p>
                      <p style="margin:0;font-size:15px;font-weight:700;color:#1A1A1A;">${ticket.name}</p>
                    </td>
                    <td style="text-align:right;">
                      <p style="margin:0 0 2px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Event</p>
                      <p style="margin:0;font-size:13px;color:#1A1A1A;">LSCE 2026</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Event details -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#FFF5F5;border-radius:10px;border:1px solid #FFD5D5;margin-bottom:28px;">
              <tr><td style="padding:14px 20px;">
                <p style="margin:0 0 2px;font-size:13px;color:#555;">📅 ${EVENT_DATE}</p>
                <p style="margin:0;font-size:13px;color:#555;">📍 ${EVENT_VENUE}</p>
              </td></tr>
            </table>

            <!-- CTA -->
            <div style="text-align:center;">
              <a href="${claimUrl}"
                style="display:inline-block;background:${BRAND_RED};color:white;font-size:15px;font-weight:700;
                       padding:16px 36px;border-radius:100px;text-decoration:none;letter-spacing:0.01em;">
                Claim My Ticket →
              </a>
              <p style="margin:16px 0 0;font-size:11px;color:#bbb;">
                Or copy this link: <span style="font-family:monospace;color:#999;">${claimUrl}</span>
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div style="border-top:1px solid #E5E5E5;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              Questions? <a href="mailto:${REPLY_TO}" style="color:${BRAND_RED};text-decoration:none;">${REPLY_TO}</a>
            </p>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = `
${p.buyerName} bought you a ${ticket.name} for ${EVENT_NAME}!

Claim your ticket here: ${claimUrl}

Event: ${EVENT_DATE}
Venue: ${EVENT_VENUE}

Questions? ${REPLY_TO}
`.trim()

  const { error } = await resend.emails.send({
    from:    FROM_ADDRESS,
    replyTo: REPLY_TO,
    to:      [p.guestEmail],
    subject: `${p.buyerName} bought you a ticket to LSCE 2026 🎟️`,
    html,
    text,
  })

  if (error) console.error('[email] Failed to send guest claim email:', error)
}

export async function sendTicketConfirmation(p: TicketConfirmationPayload): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const ticket = TICKET_TYPES[p.ticketType]

  const { error } = await resend.emails.send({
    from:    FROM_ADDRESS,
    replyTo: REPLY_TO,
    to:      [p.buyerEmail],
    subject: `Your ${ticket.name} for LSCE 2026 is confirmed 🎟️`,
    html:    buildConfirmationHtml(p),
    text:    buildConfirmationText(p),
  })

  if (error) {
    console.error('[email] Failed to send confirmation:', error)
  }
}
