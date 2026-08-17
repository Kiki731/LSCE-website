import { Resend } from 'resend'
import { TICKET_TYPES, type TicketTier } from './ticket-config'
import { BREAKOUT_MAP } from './breakouts'

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY is not set — emails will not be sent')
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const EVENT_NAME  = 'Lagos Students Career Expo 2026'
const EVENT_DATE  = 'Saturday, October 3rd, 2026'
const EVENT_VENUE = 'Daystar Christian Centre, Ikeja, Lagos'
const BRAND_RED   = '#FF2035'
const REPLY_TO    = 'lagosstudentcareerexpo@gmail.com'
const TEAM_EMAIL  = 'lagosstudentcareerexpo@gmail.com'
const FROM_ADDRESS = process.env.RESEND_FROM ?? 'onboarding@resend.dev'
const SITE_URL     = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelscexpo.com').replace(/\/$/, '')

function assetUrl(path: string): string {
  return `${SITE_URL}${path}`
}

function qrUrl(code: string): string {
  return `${SITE_URL}/api/qr/${encodeURIComponent(code)}`
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared layout wrapper — keeps all templates visually consistent
───────────────────────────────────────────────────────────────────────────── */
function wrapEmail(body: string): string {
  const bannerUrl = assetUrl('/images/EMERGE%20Themee%20Reveal%20Header.png')
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E5E5E5;">

          <tr>
            <td style="padding:0;line-height:0;">
              <a href="${SITE_URL}" style="display:block;line-height:0;">
                <img src="${bannerUrl}" alt="Lagos Students Career Expo 3.0 — Emerge"
                  width="600" style="display:block;width:100%;max-width:600px;" />
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px 20px;">
              ${body}
            </td>
          </tr>

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

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #E5E5E5;margin:0 0 24px;" />`
}

function infoBox(content: string, style: 'red' | 'neutral' | 'green' = 'neutral'): string {
  const configs = {
    red:     { bg: '#FFF5F5', border: '#FFD5D5', label: BRAND_RED },
    neutral: { bg: '#F9F6EE', border: '#E5E5E5', label: '#999999' },
    green:   { bg: '#F0FDF4', border: '#BBF7D0', label: '#16a34a' },
  }
  const c = configs[style]
  return `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:${c.bg};border-radius:10px;border:1px solid ${c.border};margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">${content}</td></tr>
    </table>
  `
}

function ctaButton(text: string, href: string): string {
  return `
    <div style="margin-bottom:24px;">
      <a href="${href}"
        style="display:inline-block;background:${BRAND_RED};color:white;font-size:14px;font-weight:600;
               padding:13px 32px;border-radius:100px;text-decoration:none;letter-spacing:0.01em;">
        ${text}
      </a>
    </div>
  `
}

function fieldRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F0F0F0;vertical-align:top;">
        <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.07em;font-weight:600;">${label}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#1A1A1A;">${value}</p>
      </td>
    </tr>
  `
}


/* ─────────────────────────────────────────────────────────────────────────────
   1. TICKET CONFIRMATION — buyer
───────────────────────────────────────────────────────────────────────────── */
export interface TicketConfirmationPayload {
  orderId:     string
  buyerName:   string
  buyerEmail:  string
  ticketType:  TicketTier
  quantity:    number
  totalAmount: number
  paystackRef: string
  ticketCodes: string[]
  breakouts?:  string[]
}

function buildConfirmationHtml(p: TicketConfirmationPayload): string {
  const ticket         = TICKET_TYPES[p.ticketType]
  const formattedTotal = '₦' + p.totalAmount.toLocaleString('en-NG')
  const firstName      = p.buyerName.split(' ')[0]

  const qrBlocks = p.ticketCodes.map((code, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td>
          ${p.quantity > 1
            ? `<p style="margin:0 0 6px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Ticket ${i + 1} of ${p.quantity}</p>`
            : ''}
          <p style="margin:0 0 14px;font-size:14px;color:#333333;">
            <strong>Your Ticket ID:</strong>&nbsp;
            <span style="font-family:monospace;background:#F3F4F6;padding:3px 10px;border-radius:4px;font-size:13px;color:#111111;">${code}</span>
          </p>
          <img
            src="${qrUrl(code)}"
            alt="QR Code for ${code}"
            width="140" height="140"
            style="display:block;margin-bottom:18px;border-radius:8px;border:1px solid #E5E5E5;"
          />
          <a href="${SITE_URL}/tickets/view/${code}"
            style="display:inline-block;background:${BRAND_RED};color:white;font-size:14px;font-weight:600;
                   padding:12px 28px;border-radius:100px;text-decoration:none;letter-spacing:0.01em;">
            View My Ticket
          </a>
        </td>
      </tr>
    </table>
    ${i < p.ticketCodes.length - 1 ? divider() : ''}
  `).join('')

  const breakoutsSection = p.breakouts && p.breakouts.length > 0 ? `
    ${divider()}
    ${infoBox(`
      <p style="margin:0 0 4px;font-size:11px;color:${BRAND_RED};text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Your Breakout Sessions</p>
      <p style="margin:0 0 14px;font-size:14px;color:#555555;line-height:1.6;">
        You have registered for these 2 breakout sessions on the day of the event:
      </p>
      ${p.breakouts.map((id, i) => `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${i < p.breakouts!.length - 1 ? '10px' : '0'};">
          <tr>
            <td style="background:white;border-radius:8px;border:1px solid #E5E5E5;padding:12px 16px;">
              <p style="margin:0 0 2px;font-size:11px;color:${BRAND_RED};font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Session ${i + 1}</p>
              <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1A1A1A;">${BREAKOUT_MAP[id]?.title ?? id}</p>
              <p style="margin:0;font-size:13px;color:#666666;line-height:1.5;">${BREAKOUT_MAP[id]?.description ?? ''}</p>
            </td>
          </tr>
        </table>
      `).join('')}
    `, 'red')}
  ` : ''

  const cvSection = p.ticketType === 'silver' ? `
    ${divider()}
    ${infoBox(`
      <p style="margin:0 0 4px;font-size:11px;color:${BRAND_RED};text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">The Rise — Action Required</p>
      <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1A1A1A;">Upload Your CV</p>
      <p style="margin:0 0 18px;font-size:14px;color:#555555;line-height:1.7;">
        Your Rise Pass includes CV submission for employer visibility at LSCE 2026.
        Upload your CV to complete your registration and get in front of top companies.
      </p>
      <a href="${SITE_URL}/tickets/upload-cv/${p.ticketCodes[0]}"
        style="display:inline-block;background:${BRAND_RED};color:white;font-size:14px;font-weight:600;
               padding:12px 28px;border-radius:100px;text-decoration:none;letter-spacing:0.01em;">
        Upload My CV
      </a>
    `, 'red')}
  ` : ''

  const body = `
    <p style="margin:0 0 10px;font-size:19px;font-weight:700;color:#000000;">You are in, ${firstName}! 🎉</p>
    <p style="margin:0 0 28px;font-size:14px;color:#444444;line-height:1.7;">
      Your ${ticket.name} for the <strong>Lagos Students Career Expo 2026</strong> is confirmed.
      Show the QR code or Ticket ID at the entrance.
    </p>

    ${divider()}

    <p style="margin:0 0 6px;font-size:14px;color:#333333;">📅 ${EVENT_DATE}</p>
    <p style="margin:0 0 24px;font-size:14px;color:#333333;">📍 ${EVENT_VENUE}</p>

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:16px;">
            <p style="margin:0 0 8px;font-size:10px;color:#999999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Ticket Type</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#000000;">${ticket.name}</p>
          </td>
          <td style="padding-right:16px;">
            <p style="margin:0 0 8px;font-size:10px;color:#999999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Seats</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#000000;">${p.quantity}</p>
          </td>
          <td>
            <p style="margin:0 0 8px;font-size:10px;color:#999999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Total Paid</p>
            <p style="margin:0;font-size:15px;font-weight:700;color:#000000;">${formattedTotal}</p>
          </td>
        </tr>
      </table>
    `)}

    ${divider()}
    ${qrBlocks}
    ${breakoutsSection}
    ${cvSection}
    ${divider()}

    <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#000000;">What to bring on the day</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      ${['This email on your phone or printed', 'A valid student ID or government-issued ID', 'Your Ticket ID as a backup if the QR code cannot be scanned'].map(item => `
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#444444;line-height:1.6;">
            <span style="display:inline-block;width:6px;height:6px;background:${BRAND_RED};border-radius:50%;vertical-align:middle;margin-right:10px;"></span>
            ${item}
          </td>
        </tr>
      `).join('')}
    </table>
  `

  return wrapEmail(body)
}

function buildConfirmationText(p: TicketConfirmationPayload): string {
  const ticket         = TICKET_TYPES[p.ticketType]
  const formattedTotal = '₦' + p.totalAmount.toLocaleString('en-NG')
  const codes          = p.ticketCodes.map((c, i) => `  Ticket ${i + 1}: ${c}`).join('\n')
  return `
Hi ${p.buyerName},

Your ${ticket.name} for ${EVENT_NAME} is confirmed!

Order:
Ticket type: ${ticket.name}
Seats: ${p.quantity}
Total paid: ${formattedTotal}
Order ref: ${p.paystackRef}

Your Ticket ID${p.quantity > 1 ? 's' : ''}:
${codes}

Show your QR code or Ticket ID at the entrance.

Event: ${EVENT_DATE}
Venue: ${EVENT_VENUE}

What to bring:
Your ticket (this email), a valid student ID, and your Ticket ID as a backup.

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

  if (error) console.error('[email] Failed to send confirmation:', error)
}


/* ─────────────────────────────────────────────────────────────────────────────
   2. GUEST TICKET CLAIM — someone else was bought a ticket
───────────────────────────────────────────────────────────────────────────── */
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

  const body = `
    <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">You have a ticket</p>
    <p style="margin:0 0 20px;font-size:19px;font-weight:700;color:#1A1A1A;line-height:1.25;">
      ${p.buyerName} bought you a ticket to LSCE 2026 🎟️
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.7;">
      Your <strong>${ticket.name}</strong> is paid and waiting. Claim it below to complete your registration and receive your QR entry code.
    </p>

    ${infoBox(`
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
    `)}

    ${infoBox(`
      <p style="margin:0 0 4px;font-size:13px;color:#555;">📅 ${EVENT_DATE}</p>
      <p style="margin:0;font-size:13px;color:#555;">📍 ${EVENT_VENUE}</p>
    `, 'red')}

    <div style="text-align:center;">
      ${ctaButton('Claim My Ticket', claimUrl)}
      <p style="margin:0;font-size:11px;color:#bbb;">
        Or copy this link: <span style="font-family:monospace;color:#999;">${claimUrl}</span>
      </p>
    </div>
  `

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
    html:    wrapEmail(body),
    text,
  })

  if (error) console.error('[email] Failed to send guest claim email:', error)
}


/* ─────────────────────────────────────────────────────────────────────────────
   3. CONTACT FORM — auto-reply to the sender
───────────────────────────────────────────────────────────────────────────── */
export interface ContactAutoReplyPayload {
  name:    string
  email:   string
  subject: string
  message: string
}

export async function sendContactAutoReply(p: ContactAutoReplyPayload): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const firstName = p.name.split(' ')[0]

  const body = `
    <p style="margin:0 0 20px;font-size:19px;font-weight:700;color:#000000;">We got your message, ${firstName}.</p>
    <p style="margin:0 0 28px;font-size:14px;color:#444444;line-height:1.7;">
      Thank you for reaching out to the LSCE team. We have received your message and will get back to you within 48 hours.
    </p>

    ${divider()}

    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#1A1A1A;text-transform:uppercase;letter-spacing:0.06em;">Your message</p>

    ${infoBox(`
      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.07em;font-weight:600;">Subject</p>
      <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#1A1A1A;">${p.subject}</p>
      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.07em;font-weight:600;">Message</p>
      <p style="margin:0;font-size:14px;color:#555555;line-height:1.7;white-space:pre-wrap;">${p.message}</p>
    `)}

    ${divider()}

    <p style="margin:0 0 6px;font-size:14px;color:#333333;">📅 ${EVENT_DATE}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#333333;">📍 ${EVENT_VENUE}</p>

    <p style="margin:0;font-size:14px;color:#444444;line-height:1.7;">
      While you wait, you can explore the expo at
      <a href="${SITE_URL}" style="color:${BRAND_RED};text-decoration:none;font-weight:600;">thelscexpo.com</a>
      or secure your spot with a ticket.
    </p>
  `

  const text = `
Hi ${firstName},

We received your message and will get back to you within 48 hours.

Your message:
Subject: ${p.subject}

${p.message}

The LSCE Team
${REPLY_TO}
`.trim()

  const { error } = await resend.emails.send({
    from:    FROM_ADDRESS,
    replyTo: REPLY_TO,
    to:      [p.email],
    subject: `We received your message, ${firstName}`,
    html:    wrapEmail(body),
    text,
  })

  if (error) console.error('[email] Failed to send contact auto-reply:', error)
}


/* ─────────────────────────────────────────────────────────────────────────────
   4. CONTACT FORM — team notification
───────────────────────────────────────────────────────────────────────────── */
export async function sendContactTeamNotification(p: ContactAutoReplyPayload): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const body = `
    <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">New contact message</p>
    <p style="margin:0 0 24px;font-size:19px;font-weight:700;color:#000000;">Someone reached out via the website.</p>

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0">
        ${fieldRow('Name', p.name)}
        ${fieldRow('Email', `<a href="mailto:${p.email}" style="color:${BRAND_RED};text-decoration:none;">${p.email}</a>`)}
        ${fieldRow('Subject', p.subject)}
      </table>
    `)}

    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1A1A1A;text-transform:uppercase;letter-spacing:0.06em;">Message</p>
    ${infoBox(`
      <p style="margin:0;font-size:14px;color:#555555;line-height:1.8;white-space:pre-wrap;">${p.message}</p>
    `, 'neutral')}

    ${ctaButton('Reply via Email', `mailto:${p.email}?subject=Re: ${encodeURIComponent(p.subject)}`)}
  `

  const { error } = await resend.emails.send({
    from:    FROM_ADDRESS,
    replyTo: p.email,
    to:      [TEAM_EMAIL],
    subject: `New contact message from ${p.name}`,
    html:    wrapEmail(body),
    text:    `From: ${p.name} (${p.email})\nSubject: ${p.subject}\n\n${p.message}`,
  })

  if (error) console.error('[email] Failed to send contact team notification:', error)
}


/* ─────────────────────────────────────────────────────────────────────────────
   5. CV UPLOAD CONFIRMATION — to the attendee
───────────────────────────────────────────────────────────────────────────── */
export interface CVUploadPayload {
  attendeeEmail: string
  attendeeName:  string
  ticketCode:    string
}

export async function sendCVUploadConfirmation(p: CVUploadPayload): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const firstName = p.attendeeName.split(' ')[0]

  const body = `
    <p style="margin:0 0 20px;font-size:19px;font-weight:700;color:#000000;">Your CV is in, ${firstName}! 📄</p>
    <p style="margin:0 0 28px;font-size:14px;color:#444444;line-height:1.7;">
      Your CV has been received and will be shared with employers and recruiters attending the Lagos Students Career Expo 2026. You are one step ahead.
    </p>

    ${divider()}

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0">
        ${fieldRow('Ticket ID', `<span style="font-family:monospace;background:#F3F4F6;padding:2px 8px;border-radius:4px;font-size:13px;color:#111111;">${p.ticketCode}</span>`)}
        ${fieldRow('Event', EVENT_NAME)}
        ${fieldRow('Date', EVENT_DATE)}
        ${fieldRow('Venue', EVENT_VENUE)}
      </table>
    `)}

    <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#000000;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[
        'Your CV is added to the employer-facing portfolio reviewed before the event.',
        'Recruiters can shortlist attendees they want to connect with on the day.',
        'Show up on October 3rd ready to make your impression in person.',
      ].map(item => `
        <tr>
          <td style="padding:7px 0;font-size:14px;color:#444444;line-height:1.6;">
            <span style="display:inline-block;width:6px;height:6px;background:${BRAND_RED};border-radius:50%;vertical-align:middle;margin-right:10px;"></span>
            ${item}
          </td>
        </tr>
      `).join('')}
    </table>

    ${ctaButton('View My Ticket', `${SITE_URL}/tickets/view/${p.ticketCode}`)}
  `

  const text = `
Hi ${p.attendeeName},

Your CV has been received for the Lagos Students Career Expo 2026.

Ticket ID: ${p.ticketCode}
Event: ${EVENT_DATE}
Venue: ${EVENT_VENUE}

Your CV will be shared with employers attending the expo.

See you on the day,
The LSCE Team
${REPLY_TO}
`.trim()

  const { error } = await resend.emails.send({
    from:    FROM_ADDRESS,
    replyTo: REPLY_TO,
    to:      [p.attendeeEmail],
    subject: 'Your CV has been received for LSCE 2026 📄',
    html:    wrapEmail(body),
    text,
  })

  if (error) console.error('[email] Failed to send CV upload confirmation:', error)
}


/* ─────────────────────────────────────────────────────────────────────────────
   6. AMBASSADOR APPLICATION — confirmation to the applicant
───────────────────────────────────────────────────────────────────────────── */
export interface AmbassadorApplicationPayload {
  applicantName:  string
  applicantEmail: string
  university:     string
}

export async function sendAmbassadorApplicationConfirmation(p: AmbassadorApplicationPayload): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const firstName = p.applicantName.split(' ')[0]

  const body = `
    <p style="margin:0 0 20px;font-size:19px;font-weight:700;color:#000000;">Application received, ${firstName}! 🙌</p>
    <p style="margin:0 0 28px;font-size:14px;color:#444444;line-height:1.7;">
      Thank you for applying to become a Campus Ambassador for the Lagos Students Career Expo 2026. We have received your application and our team will review it shortly.
    </p>

    ${divider()}

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0">
        ${fieldRow('Applicant', p.applicantName)}
        ${fieldRow('University', p.university)}
        ${fieldRow('Event', EVENT_NAME)}
      </table>
    `)}

    <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#000000;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[
        'Our team reviews every application carefully.',
        'If you are selected, you will receive an email with your ambassador brief and next steps.',
        'Ambassadors play a key role in making LSCE 2026 a success at their campus.',
      ].map(item => `
        <tr>
          <td style="padding:7px 0;font-size:14px;color:#444444;line-height:1.6;">
            <span style="display:inline-block;width:6px;height:6px;background:${BRAND_RED};border-radius:50%;vertical-align:middle;margin-right:10px;"></span>
            ${item}
          </td>
        </tr>
      `).join('')}
    </table>

    ${divider()}

    <p style="margin:0;font-size:14px;color:#444444;line-height:1.7;">
      While you wait, share the word about LSCE 2026 at your campus and explore more at
      <a href="${SITE_URL}" style="color:${BRAND_RED};text-decoration:none;font-weight:600;">thelscexpo.com</a>.
    </p>
  `

  const text = `
Hi ${p.applicantName},

We received your Campus Ambassador application for the Lagos Students Career Expo 2026.

We will review it and get back to you if you are selected.

Event: ${EVENT_DATE}
Venue: ${EVENT_VENUE}

The LSCE Team
${REPLY_TO}
`.trim()

  const { error } = await resend.emails.send({
    from:    FROM_ADDRESS,
    replyTo: REPLY_TO,
    to:      [p.applicantEmail],
    subject: 'Ambassador application received — LSCE 2026',
    html:    wrapEmail(body),
    text,
  })

  if (error) console.error('[email] Failed to send ambassador application confirmation:', error)
}


/* ─────────────────────────────────────────────────────────────────────────────
   7. AMBASSADOR APPLICATION — team notification
───────────────────────────────────────────────────────────────────────────── */
export interface AmbassadorTeamNotificationPayload {
  applicantName:  string
  applicantEmail: string
  phone:          string
  university:     string
  course:         string
  year:           string
  instagram:      string | null
  whyApply:       string
}

export async function sendAmbassadorTeamNotification(p: AmbassadorTeamNotificationPayload): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const body = `
    <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">New ambassador application</p>
    <p style="margin:0 0 24px;font-size:19px;font-weight:700;color:#000000;">${p.applicantName} applied from ${p.university}.</p>

    ${infoBox(`
      <table width="100%" cellpadding="0" cellspacing="0">
        ${fieldRow('Name', p.applicantName)}
        ${fieldRow('Email', `<a href="mailto:${p.applicantEmail}" style="color:${BRAND_RED};text-decoration:none;">${p.applicantEmail}</a>`)}
        ${fieldRow('Phone', p.phone)}
        ${fieldRow('University', p.university)}
        ${fieldRow('Course', p.course)}
        ${fieldRow('Year', p.year)}
        ${p.instagram ? fieldRow('Instagram', p.instagram) : ''}
      </table>
    `)}

    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1A1A1A;text-transform:uppercase;letter-spacing:0.06em;">Why they want to apply</p>
    ${infoBox(`
      <p style="margin:0;font-size:14px;color:#555555;line-height:1.8;white-space:pre-wrap;">${p.whyApply}</p>
    `, 'neutral')}

    ${ctaButton('Review in Admin Portal', `${SITE_URL}/admin/applications`)}
  `

  const { error } = await resend.emails.send({
    from:    FROM_ADDRESS,
    replyTo: p.applicantEmail,
    to:      [TEAM_EMAIL],
    subject: `New ambassador application from ${p.applicantName} at ${p.university}`,
    html:    wrapEmail(body),
    text:    `${p.applicantName} (${p.applicantEmail}) applied from ${p.university}.\n\nWhy they want to apply:\n${p.whyApply}`,
  })

  if (error) console.error('[email] Failed to send ambassador team notification:', error)
}
