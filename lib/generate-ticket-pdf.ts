/**
 * Opens a print-ready ticket receipt in a new browser window and triggers the
 * system print dialog (where users can "Save as PDF").
 *
 * Why not jsPDF? It has bundling issues in Next.js production — the dynamic
 * import fails silently in certain environments. A browser print window
 * requires zero dependencies and works in every browser.
 */

import { TICKET_TYPES, type TicketTier } from './ticket-config'

const SITE_URL = (
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelscexpo.com'
)

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold:   '#D4AF37',
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
  const ticket    = TICKET_TYPES[ticketType as TicketTier]
  const tierColor = TIER_COLORS[ticketType] ?? '#FF2035'
  const totalStr  = '₦' + totalAmount.toLocaleString('en-NG')
  const logoUrl   = `${SITE_URL}/images/Lsce red.png`

  // Build one ticket block per seat
  const ticketBlocks = ticketCodes.map((code, i) => `
    <div class="ticket-block">
      <div class="ticket-stripe" style="background:${tierColor}"></div>
      <div class="ticket-body">
        <div class="ticket-left">
          ${ticketCodes.length > 1 ? `<p class="seat-label">SEAT ${i + 1} OF ${ticketCodes.length}</p>` : ''}
          <p class="field-label">TICKET ID</p>
          <p class="ticket-code">${code}</p>
          <p class="ticket-name">${ticket?.name ?? ticketType}</p>
          <p class="ticket-hint">Show this QR code or Ticket ID at the entrance. Bring a valid ID.</p>
        </div>
        <div class="ticket-right">
          <img
            src="${SITE_URL}/api/qr/${encodeURIComponent(code)}"
            width="130"
            height="130"
            alt="QR Code"
            class="qr-img"
          />
          <p class="qr-label">${code}</p>
        </div>
      </div>
    </div>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LSCE 2026 — Ticket Receipt</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #F7F5F2;
      color: #1A1A1A;
      padding: 32px 24px;
    }

    .page { max-width: 600px; margin: 0 auto; }

    /* ── Header ── */
    .header {
      background: #1A1A1A;
      border-radius: 14px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .header img { height: 32px; width: auto; }
    .header-right { text-align: right; }
    .header-right p { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; }
    .header-right strong { font-size: 13px; color: white; letter-spacing: 0.04em; }

    /* ── Buyer card ── */
    .buyer-card {
      background: white;
      border-radius: 14px;
      border: 1px solid #E5E5E5;
      padding: 20px 24px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .buyer-name { font-size: 18px; font-weight: 700; color: #1A1A1A; }
    .buyer-email { font-size: 12px; color: #888; margin-top: 2px; }
    .buyer-meta { text-align: right; }
    .tier-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: ${tierColor}22;
      color: ${tierColor};
      margin-bottom: 6px;
    }
    .buyer-total { font-size: 20px; font-weight: 700; color: #1A1A1A; }
    .buyer-total-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.06em; }

    /* ── Event info bar ── */
    .event-bar {
      background: #FFF5F5;
      border: 1px solid #FFD5D5;
      border-radius: 10px;
      padding: 12px 20px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .event-bar p { font-size: 12px; color: #555; }
    .event-bar strong { color: #1A1A1A; }

    /* ── Ticket blocks ── */
    .ticket-block {
      background: white;
      border-radius: 14px;
      border: 1px solid #E5E5E5;
      margin-bottom: 10px;
      display: flex;
      overflow: hidden;
    }
    .ticket-stripe { width: 5px; flex-shrink: 0; }
    .ticket-body {
      flex: 1;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .ticket-left { flex: 1; }
    .ticket-right { text-align: center; flex-shrink: 0; }

    .seat-label {
      font-size: 10px; color: #aaa;
      text-transform: uppercase; letter-spacing: 0.08em;
      margin-bottom: 8px;
    }
    .field-label {
      font-size: 10px; color: #999;
      text-transform: uppercase; letter-spacing: 0.06em;
      margin-bottom: 4px;
    }
    .ticket-code {
      font-family: monospace;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #1A1A1A;
      margin-bottom: 6px;
    }
    .ticket-name { font-size: 13px; color: #666; margin-bottom: 10px; }
    .ticket-hint { font-size: 11px; color: #aaa; line-height: 1.5; }

    .qr-img {
      border-radius: 8px;
      border: 4px solid #F7F5F2;
      display: block;
    }
    .qr-label {
      font-family: monospace;
      font-size: 10px;
      color: #bbb;
      margin-top: 5px;
      letter-spacing: 0.08em;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 16px;
      border-top: 1px solid #E5E5E5;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer p { font-size: 11px; color: #aaa; }
    .footer a { color: #FF2035; text-decoration: none; }

    /* ── Print button (hidden when printing) ── */
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
    }

    /* ── Print media — hide UI chrome ── */
    @media print {
      body { background: white; padding: 0; }
      .print-btn { display: none !important; }
      .ticket-block { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <img src="${logoUrl}" alt="LSCE 2026" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
      <span style="display:none;color:white;font-size:18px;font-weight:700;">LSCE 2026</span>
      <div class="header-right">
        <p>Ticket Receipt</p>
        <strong>LSCE 2026</strong>
      </div>
    </div>

    <!-- Buyer -->
    <div class="buyer-card">
      <div>
        <p class="buyer-name">${escapeHtml(buyerName)}</p>
        <p class="buyer-email">${escapeHtml(buyerEmail)}</p>
      </div>
      <div class="buyer-meta">
        <div class="tier-pill">${ticket?.name ?? ticketType}</div>
        <p class="buyer-total-label">${quantity} seat${quantity !== 1 ? 's' : ''} · Total Paid</p>
        <p class="buyer-total">${totalStr}</p>
      </div>
    </div>

    <!-- Event info -->
    <div class="event-bar">
      <p>📅 <strong>Saturday, October 3rd, 2026</strong></p>
      <p>📍 <strong>Landmark Event Centre, Victoria Island, Lagos</strong></p>
    </div>

    <!-- Ticket blocks -->
    ${ticketBlocks}

    <!-- Footer -->
    <div class="footer">
      <p>Ref: <span style="font-family:monospace">${escapeHtml(reference)}</span></p>
      <p>
        Questions? <a href="mailto:lagosstudentcareerexpo@gmail.com">lagosstudentcareerexpo@gmail.com</a>
      </p>
    </div>

    <!-- Print button -->
    <button class="print-btn" onclick="window.print()">
      🖨 Save as PDF / Print
    </button>

  </div>

  <script>
    // Auto-trigger print after QR images load
    window.addEventListener('load', function() {
      // Small delay to ensure QR images are rendered
      setTimeout(function() { window.print() }, 800)
    })
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=700,height=900,scrollbars=yes')
  if (!win) {
    // Pop-up blocked — fall back to a data URL
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
