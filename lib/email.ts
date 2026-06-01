import { Resend } from 'resend'
import { TICKET_TYPES, type TicketTier } from './ticket-config'

// Initialised lazily so the module can be imported without crashing
// if RESEND_API_KEY isn't set yet (e.g. during local dev without email)
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY is not set — emails will not be sent')
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

// ── Event constants ────────────────────────────────────────────────────────────
const EVENT_NAME = 'Lagos Students Career Expo 2026'
const EVENT_DATE = 'Saturday, 14th March 2026'
const EVENT_VENUE = 'Landmark Event Centre, Victoria Island, Lagos'
const BRAND_RED = '#FF2035'
const REPLY_TO = 'lagosstudentcareerexpo@gmail.com'

// FROM: use onboarding@resend.dev until domain is verified.
// Once thelscexpo.com is verified in Resend, set:
//   RESEND_FROM=LSCE Tickets <tickets@thelscexpo.com>
const FROM_ADDRESS = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface TicketConfirmationPayload {
  orderId:      string
  buyerName:    string
  buyerEmail:   string
  ticketType:   TicketTier
  quantity:     number
  totalAmount:  number
  paystackRef:  string
}

// ── HTML email template ────────────────────────────────────────────────────────
function buildConfirmationHtml(p: TicketConfirmationPayload): string {
  const ticket = TICKET_TYPES[p.ticketType]
  const formattedTotal = '₦' + p.totalAmount.toLocaleString('en-NG')
  const shortRef = p.paystackRef.replace('LSCE-', '')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your LSCE Ticket Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#F7F5F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header / Logo bar -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;background:#1A1A1A;border-radius:12px;padding:14px 24px;">
                <span style="color:white;font-size:18px;font-weight:700;letter-spacing:-0.3px;">LSCE 2026</span>
              </div>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:white;border-radius:20px;overflow:hidden;border:1px solid #E5E5E5;">

              <!-- Red top bar -->
              <div style="background:${BRAND_RED};height:6px;"></div>

              <!-- Body -->
              <div style="padding:36px 32px;">

                <!-- Greeting -->
                <p style="margin:0 0 8px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:0.08em;">
                  Ticket Confirmation
                </p>
                <h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#1A1A1A;line-height:1.2;">
                  You&rsquo;re in, ${p.buyerName.split(' ')[0]}. 🎉
                </h1>
                <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">
                  Your ${ticket.name} for <strong>${EVENT_NAME}</strong> has been confirmed.
                  See you there!
                </p>

                <!-- Ticket summary box -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#F7F5F2;border-radius:12px;border:1px solid #E5E5E5;margin-bottom:28px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom:12px;border-bottom:1px solid #E5E5E5;">
                            <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Ticket</span><br/>
                            <span style="font-size:16px;font-weight:700;color:#1A1A1A;">${ticket.name}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top:12px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-right:16px;">
                                  <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Quantity</span><br/>
                                  <span style="font-size:14px;font-weight:600;color:#1A1A1A;">${p.quantity}</span>
                                </td>
                                <td style="padding-right:16px;">
                                  <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Total Paid</span><br/>
                                  <span style="font-size:14px;font-weight:600;color:#1A1A1A;">${formattedTotal}</span>
                                </td>
                                <td>
                                  <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.06em;">Order Ref</span><br/>
                                  <span style="font-size:13px;font-weight:600;color:#1A1A1A;font-family:monospace;">${shortRef}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Event details -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#FFF5F5;border-radius:12px;border:1px solid #FFD5D5;margin-bottom:32px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 4px;font-size:11px;color:#FF2035;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
                        Event Details
                      </p>
                      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1A1A1A;">${EVENT_NAME}</p>
                      <p style="margin:0 0 2px;font-size:13px;color:#555;">📅 ${EVENT_DATE}</p>
                      <p style="margin:0;font-size:13px;color:#555;">📍 ${EVENT_VENUE}</p>
                    </td>
                  </tr>
                </table>

                <!-- What to bring -->
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1A1A1A;">
                  What to bring on the day
                </p>
                <ul style="margin:0 0 28px;padding-left:20px;color:#555;font-size:13px;line-height:1.8;">
                  <li>This email (digital or printed)</li>
                  <li>A valid student ID or government-issued ID</li>
                  <li>Your registered email address for check-in</li>
                </ul>

                <!-- CTA -->
                <div style="text-align:center;margin-bottom:8px;">
                  <a href="https://thelscexpo.com"
                    style="display:inline-block;background:${BRAND_RED};color:white;font-size:14px;font-weight:600;
                           padding:14px 32px;border-radius:100px;text-decoration:none;letter-spacing:0.02em;">
                    Visit thelscexpo.com →
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background:#F7F5F2;border-top:1px solid #E5E5E5;padding:20px 32px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
                  Questions? Reply to this email or reach us at
                  <a href="mailto:${REPLY_TO}" style="color:${BRAND_RED};text-decoration:none;">${REPLY_TO}</a>
                </p>
                <p style="margin:8px 0 0;font-size:11px;color:#bbb;">
                  &copy; ${new Date().getFullYear()} Lagos Students Career Expo. All rights reserved.
                </p>
              </div>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// Plain-text fallback
function buildConfirmationText(p: TicketConfirmationPayload): string {
  const ticket = TICKET_TYPES[p.ticketType]
  const formattedTotal = '₦' + p.totalAmount.toLocaleString('en-NG')
  return `
Hi ${p.buyerName},

Your ${ticket.name} for ${EVENT_NAME} is confirmed!

Order details:
- Ticket:    ${ticket.name} × ${p.quantity}
- Total:     ${formattedTotal}
- Reference: ${p.paystackRef}

Event: ${EVENT_DATE} at ${EVENT_VENUE}

Bring this email and a valid ID on the day.

See you there,
The LSCE Team
${REPLY_TO}
`.trim()
}

// ── Public send function ───────────────────────────────────────────────────────
export async function sendTicketConfirmation(p: TicketConfirmationPayload): Promise<void> {
  const resend = getResend()
  if (!resend) return   // Silently skip if not configured

  const ticket = TICKET_TYPES[p.ticketType]

  const { error } = await resend.emails.send({
    from:     FROM_ADDRESS,
    replyTo:  REPLY_TO,
    to:       [p.buyerEmail],
    subject:  `You're in! Your ${ticket.name} for LSCE 2026 🎟️`,
    html:     buildConfirmationHtml(p),
    text:     buildConfirmationText(p),
  })

  if (error) {
    // Non-fatal — order is already saved. Log and move on.
    console.error('[email] Failed to send confirmation:', error)
  }
}
