import { TICKET_TYPES, type TicketTier } from './ticket-config'

const SITE_URL = (
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelscexpo.com'
)

const TIER_COLORS: Record<string, string> = {
  bronze: '#00CF01',
  silver: '#FFBD4D',
  gold:   '#F11429',
}

const TIER_BG: Record<string, string> = {
  bronze: '#BAFFBA',
  silver: '#FDF0D9',
  gold:   '#FFE3E6',
}

const TICKET_IMAGES: Record<string, string> = {
  bronze: '/gallery/The%20Spark.png',
  silver: '/gallery/The%20Rise.png',
  gold:   '/gallery/The%20Emergence.png',
}

export function generateTicketPDF(params: {
  buyerName:   string
  buyerEmail:  string
  ticketType:  string
  quantity:    number
  totalAmount: number
  ticketCodes: string[]
  reference:   string
}): void {
  const { buyerName, buyerEmail, ticketType, quantity, totalAmount, ticketCodes, reference } = params
  const ticket     = TICKET_TYPES[ticketType as TicketTier]
  const tierColor  = TIER_COLORS[ticketType] ?? '#FF2035'
  const tierBg     = TIER_BG[ticketType] ?? '#F7F5F2'
  const totalStr   = '₦' + totalAmount.toLocaleString('en-NG')
  const ticketImgUrl = `${SITE_URL}${TICKET_IMAGES[ticketType] ?? '/gallery/The%20Spark.png'}`
  const flyerUrl   = `${SITE_URL}/gallery/EMERGE%20BEYOND%202.png`
  const logoUrl    = `${SITE_URL}/images/Lsce red.png`

  // One ticket block per seat — ticket image + details + QR side-by-side
  const ticketBlocks = ticketCodes.map((code, i) => `
    <div class="ticket-block">
      <!-- Perforated left edge strip -->
      <div class="ticket-strip" style="background:${tierColor};"></div>

      <div class="ticket-inner">
        <!-- Left: ticket image + event details -->
        <div class="ticket-left">
          <img
            src="${ticketImgUrl}"
            alt="${ticket?.name ?? ticketType}"
            class="ticket-type-img"
            onerror="this.style.display='none'"
          />
          <div class="ticket-event-info">
            <p class="event-label">LSCE 2026</p>
            <p class="event-detail">📅 Nov 28th, 2026</p>
            <p class="event-detail">📍 Daystar Christian Centre</p>
            <p class="event-detail" style="color:#999;">Ikeja, Lagos</p>
          </div>
          ${quantity > 1 ? `<p class="seat-tag" style="background:${tierColor}22;color:${tierColor};">SEAT ${i + 1} OF ${quantity}</p>` : ''}
        </div>

        <!-- Dotted separator -->
        <div class="ticket-perf"></div>

        <!-- Right: attendee details + QR -->
        <div class="ticket-right">
          <div>
            <p class="field-label">ATTENDEE</p>
            <p class="attendee-name">${escapeHtml(buyerName)}</p>
            <p class="attendee-email">${escapeHtml(buyerEmail)}</p>
          </div>
          <div style="margin-top:14px;">
            <p class="field-label">TICKET ID</p>
            <p class="ticket-code" style="color:${tierColor};">${code}</p>
          </div>
          <div style="margin-top:14px;text-align:center;">
            <img
              src="${SITE_URL}/api/qr/${encodeURIComponent(code)}"
              width="120"
              height="120"
              alt="QR Code"
              class="qr-img"
            />
            <p class="qr-hint">Scan at entrance</p>
          </div>
        </div>
      </div>
    </div>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LSCE 2026 — Ticket</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #F0EDEA;
      color: #1A1A1A;
      padding: 24px 20px 40px;
    }

    .page { max-width: 620px; margin: 0 auto; }

    /* ── Event flyer ── */
    .flyer-wrap {
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 16px;
      line-height: 0;
    }
    .flyer-wrap img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* ── Header bar ── */
    .header {
      background: #1A1A1A;
      border-radius: 12px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .header img { height: 26px; width: auto; }
    .header-right { text-align: right; }
    .header-right p { font-size: 10px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.08em; }
    .header-right strong { font-size: 12px; color: white; }

    /* ── Buyer summary strip ── */
    .buyer-strip {
      background: white;
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border: 1px solid #E5E5E5;
    }
    .buyer-name { font-size: 16px; font-weight: 700; }
    .buyer-email { font-size: 11px; color: #888; margin-top: 2px; }
    .buyer-right { text-align: right; }
    .tier-pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: ${tierBg};
      color: ${tierColor};
      margin-bottom: 4px;
    }
    .buyer-total { font-size: 18px; font-weight: 700; }
    .buyer-total-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; }

    /* ── Ticket block ── */
    .ticket-block {
      background: white;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 10px;
      display: flex;
      border: 1px solid #E5E5E5;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .ticket-strip { width: 6px; flex-shrink: 0; }
    .ticket-inner {
      flex: 1;
      display: flex;
      align-items: stretch;
    }

    /* Left panel */
    .ticket-left {
      flex: 1;
      padding: 18px 16px 18px 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-right: 2px dashed #E5E5E5;
    }
    .ticket-type-img {
      width: 100%;
      max-width: 180px;
      height: auto;
      object-fit: contain;
    }
    .ticket-event-info { display: flex; flex-direction: column; gap: 3px; }
    .event-label { font-size: 11px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; letter-spacing: 0.06em; }
    .event-detail { font-size: 11px; color: #555; line-height: 1.5; }
    .seat-tag {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      width: fit-content;
    }

    /* Dotted separator handle circles */
    .ticket-perf {
      width: 0;
      position: relative;
      flex-shrink: 0;
    }

    /* Right panel */
    .ticket-right {
      width: 180px;
      flex-shrink: 0;
      padding: 18px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .field-label {
      font-size: 9px;
      color: #bbb;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 3px;
    }
    .attendee-name { font-size: 13px; font-weight: 700; color: #1A1A1A; line-height: 1.3; }
    .attendee-email { font-size: 10px; color: #999; margin-top: 2px; word-break: break-all; }
    .ticket-code {
      font-family: monospace;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.1em;
      line-height: 1.2;
      word-break: break-all;
    }
    .qr-img {
      border-radius: 8px;
      border: 3px solid #F0EDEA;
      display: block;
      margin: 0 auto;
    }
    .qr-hint { font-size: 9px; color: #bbb; text-align: center; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.05em; }

    /* ── Footer ── */
    .footer {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px;
    }
    .footer p { font-size: 10px; color: #bbb; }
    .footer a { color: #FF2035; text-decoration: none; }

    /* ── Print button ── */
    .print-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px auto 0;
      padding: 12px 28px;
      background: #FF2035;
      color: white;
      border: none;
      border-radius: 60px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      width: fit-content;
      gap: 8px;
    }

    @media print {
      body { background: white; padding: 0; }
      .print-btn { display: none !important; }
      .ticket-block { break-inside: avoid; box-shadow: none; }
      .flyer-wrap { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Event flyer -->
    <div class="flyer-wrap">
      <img src="${flyerUrl}" alt="LSCE 2026 — Emerge Beyond" onerror="this.parentElement.style.display='none'" />
    </div>

    <!-- LSCE header -->
    <div class="header">
      <img src="${logoUrl}" alt="LSCE" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
      <span style="display:none;color:white;font-size:16px;font-weight:700;">LSCE</span>
      <div class="header-right">
        <p>Official Ticket Receipt</p>
        <strong>Lagos Students Career Expo 2026</strong>
      </div>
    </div>

    <!-- Buyer strip -->
    <div class="buyer-strip">
      <div>
        <p class="buyer-name">${escapeHtml(buyerName)}</p>
        <p class="buyer-email">${escapeHtml(buyerEmail)}</p>
      </div>
      <div class="buyer-right">
        <div class="tier-pill">${ticket?.name ?? ticketType}</div>
        <p class="buyer-total-label">${quantity} seat${quantity !== 1 ? 's' : ''} · Total paid</p>
        <p class="buyer-total">${totalStr}</p>
      </div>
    </div>

    <!-- Ticket block(s) -->
    ${ticketBlocks}

    <!-- Footer -->
    <div class="footer">
      <p>Ref: <span style="font-family:monospace">${escapeHtml(reference)}</span></p>
      <p>Questions? <a href="mailto:lagosstudentcareerexpo@gmail.com">lagosstudentcareerexpo@gmail.com</a></p>
    </div>

    <!-- Print / Save as PDF button -->
    <button class="print-btn" onclick="window.print()">
      🖨&nbsp; Save as PDF / Print
    </button>

  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print() }, 900)
    })
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=700,height=960,scrollbars=yes')
  if (!win) {
    const blob = new Blob([html], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `LSCE-2026-ticket-${ticketCodes[0] ?? 'receipt'}.html`
    a.click()
    URL.revokeObjectURL(url)
    return
  }

  win.document.write(html)
  win.document.close()
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
