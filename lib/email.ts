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
const FROM_ADDRESS = process.env.RESEND_FROM ?? 'LSCE Tickets <tickets@thelscexpo.com>'

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
  const logoUrl        = assetUrl('/images/lsce-logo.png')

  const qrBlocks = p.ticketCodes.map((code, i) => `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:white;border-radius:16px;border:1px solid #E5E5E5;margin-bottom:16px;">
      <tr>
        <td style="padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:top;padding-right:24px;">
                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
                  ${p.quantity > 1 ? `Ticket ${i + 1} of ${p.quantity}` : 'Your Ticket'}
                </p>
                <p style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1A1A1A;">${ticket.name}</p>

                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Ticket ID</p>
                <p style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1A1A1A;letter-spacing:0.1em;font-family:monospace;">${code}</p>

                <p style="margin:0;font-size:12px;color:#999;line-height:1.5;">
                  Show this QR code or Ticket ID at the entrance.<br/>Bring a valid ID.
                </p>
              </td>
              <td style="vertical-align:middle;text-align:center;white-space:nowrap;width:148px;">
                <img
                  src="${qrUrl(code)}"
                  alt="QR Code"
                  width="140"
                  height="140"
                  style="display:block;border-radius:8px;border:4px solid #F7F5F2;"
                />
                <p style="margin:6px 0 0;font-size:10px;color:#bbb;font-family:monospace;letter-spacing:0.08em;">${code}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your LSCE Ticket</title>
</head>
<body style="margin:0;padding:0;background:#F7F5F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="https://thelscexpo.com" style="display:inline-block;text-decoration:none;">
                <img
                  src="${logoUrl}"
                  alt="LSCE 2026"
                  height="36"
                  style="display:block;height:36px;width:auto;"
                />
              </a>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="border-radius:20px;overflow:hidden;">

              <!-- Greeting card -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:white;border-radius:20px;border:1px solid #E5E5E5;margin-bottom:16px;">
                <tr>
                  <td>
                    <div style="background:${BRAND_RED};height:5px;border-radius:4px 4px 0 0;"></div>
                    <div style="padding:32px 28px 28px;">
                      <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.08em;">Booking Confirmed</p>
                      <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1A1A1A;line-height:1.2;">
                        You&rsquo;re in, ${firstName}! 🎉
                      </h1>
                      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                        Your ${ticket.name} for <strong>${EVENT_NAME}</strong> is confirmed.
                        Your ticket(s) are below — each has a unique QR code and Ticket ID for entry.
                      </p>

                      <!-- Order summary box -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="background:#F7F5F2;border-radius:10px;border:1px solid #E5E5E5;margin-bottom:24px;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-right:16px;">
                                  <p style="margin:0 0 2px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Ticket Type</p>
                                  <p style="margin:0;font-size:14px;font-weight:700;color:#1A1A1A;">${ticket.name}</p>
                                </td>
                                <td style="padding-right:16px;">
                                  <p style="margin:0 0 2px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Qty</p>
                                  <p style="margin:0;font-size:14px;font-weight:700;color:#1A1A1A;">${p.quantity}</p>
                                </td>
                                <td>
                                  <p style="margin:0 0 2px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Total Paid</p>
                                  <p style="margin:0;font-size:14px;font-weight:700;color:#1A1A1A;">${formattedTotal}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Event info box -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="background:#FFF5F5;border-radius:10px;border:1px solid #FFD5D5;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <p style="margin:0 0 4px;font-size:11px;color:${BRAND_RED};text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Event Details</p>
                            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1A1A1A;">${EVENT_NAME}</p>
                            <p style="margin:0 0 2px;font-size:13px;color:#555;">📅 ${EVENT_DATE}</p>
                            <p style="margin:0;font-size:13px;color:#555;">📍 ${EVENT_VENUE}</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- QR ticket block(s) -->
              ${qrBlocks}

              <!-- What to bring -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:white;border-radius:16px;border:1px solid #E5E5E5;margin-bottom:16px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1A1A1A;">What to bring on the day</p>
                    <ul style="margin:0;padding-left:18px;color:#666;font-size:13px;line-height:2;">
                      <li>This email (show on your phone or printed)</li>
                      <li>A valid student ID or government-issued ID</li>
                      <li>Your Ticket ID if the QR code can&rsquo;t be scanned</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="text-align:center;padding:8px 0 24px;">
                <a href="https://thelscexpo.com"
                  style="display:inline-block;background:${BRAND_RED};color:white;font-size:14px;font-weight:600;
                         padding:14px 32px;border-radius:100px;text-decoration:none;letter-spacing:0.02em;">
                  Visit thelscexpo.com →
                </a>
              </div>

              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border-top:1px solid #E5E5E5;">
                <tr>
                  <td style="padding:20px 28px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:12px;color:#999;line-height:1.6;">
                      Questions? Reply to this email or reach us at
                      <a href="mailto:${REPLY_TO}" style="color:${BRAND_RED};text-decoration:none;">${REPLY_TO}</a>
                    </p>
                    <p style="margin:0;font-size:11px;color:#bbb;">
                      &copy; ${new Date().getFullYear()} Lagos Students Career Expo. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>

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
