/**
 * Generates a branded LSCE ticket receipt PDF entirely client-side.
 * Uses jsPDF for layout and qrcode for QR code images.
 * Dynamically imported so it doesn't affect the initial page bundle.
 */

import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { TICKET_TYPES, type TicketTier } from './ticket-config'

// Brand colours
const RED   = '#FF2035'
const DARK  = '#1A1A1A'
const GREY  = '#666666'
const LIGHT = '#F7F5F2'
const WHITE = '#FFFFFF'

const TIER_COLORS: Record<string, [number, number, number]> = {
  bronze: [205, 127, 50],
  silver: [168, 169, 173],
  gold:   [212, 175, 55],
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function setFill(doc: jsPDF, hex: string) {
  doc.setFillColor(...hexToRgb(hex))
}
function setTextColor(doc: jsPDF, hex: string) {
  doc.setTextColor(...hexToRgb(hex))
}
function setDrawColor(doc: jsPDF, hex: string) {
  doc.setDrawColor(...hexToRgb(hex))
}

export async function generateTicketPDF(params: {
  buyerName:   string
  buyerEmail:  string
  ticketType:  string
  quantity:    number
  totalAmount: number
  ticketCodes: string[]
  reference:   string
}): Promise<void> {
  const { buyerName, buyerEmail, ticketType, quantity, totalAmount, ticketCodes, reference } = params
  const ticket     = TICKET_TYPES[ticketType as TicketTier]
  const tierColor  = TIER_COLORS[ticketType] ?? [255, 32, 53]
  const tierHex    = `#${tierColor.map(n => n.toString(16).padStart(2, '0')).join('')}`
  const totalStr   = '₦' + totalAmount.toLocaleString('en-NG')
  const eventDate  = 'Saturday, October 3rd, 2026'
  const eventVenue = 'Landmark Event Centre, Victoria Island, Lagos'

  // Pre-generate QR code data URIs for all ticket codes
  const qrDataUris = await Promise.all(
    ticketCodes.map(code =>
      QRCode.toDataURL(code, {
        width:  160,
        margin: 1,
        color: { dark: '#1A1A1A', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      }).catch(() => '')
    )
  )

  // Decide page count — each QR block is ~55mm tall; header ~85mm; allow 190mm body
  const ticketBlockH = 58  // mm per ticket code block
  const headerH      = 88  // mm for header area
  const footerH      = 24  // mm for footer
  const perPage      = Math.max(1, Math.floor(190 / ticketBlockH))
  const pageCount    = Math.ceil(ticketCodes.length / perPage)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210  // A4 width

  // ── PAGE LOOP ──────────────────────────────────────────────────────────────
  for (let pg = 0; pg < pageCount; pg++) {
    if (pg > 0) doc.addPage()

    const isFirst = pg === 0
    let y = 0

    // ── Header (first page only) ─────────────────────────────────────────────
    if (isFirst) {
      // Dark background header
      setFill(doc, DARK)
      doc.rect(0, 0, W, 52, 'F')

      // Red accent stripe along left edge
      setFill(doc, RED)
      doc.rect(0, 0, 4, 52, 'F')

      // "LSCE 2026" wordmark
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      setTextColor(doc, WHITE)
      doc.text('LSCE 2026', 16, 22)

      // "LAGOS STUDENTS CAREER EXPO" sub-line
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      setTextColor(doc, 'rgba(255,255,255,0.5)')
      doc.setTextColor(180, 180, 180)
      doc.text('LAGOS STUDENTS CAREER EXPO', 16, 30)

      // "TICKET RECEIPT" pill top-right
      setFill(doc, RED)
      doc.roundedRect(W - 52, 8, 42, 10, 3, 3, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      setTextColor(doc, WHITE)
      doc.text('TICKET RECEIPT', W - 31, 14.5, { align: 'center' })

      // Event date + venue
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(210, 210, 210)
      doc.text(`${eventDate}  ·  ${eventVenue}`, 16, 44)

      y = 60

      // ── Buyer info card ──────────────────────────────────────────────────────
      setFill(doc, LIGHT)
      doc.roundedRect(12, y, W - 24, 28, 3, 3, 'F')

      // Left col — name + email
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      setTextColor(doc, DARK)
      doc.text(buyerName, 20, y + 10)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      setTextColor(doc, GREY)
      doc.text(buyerEmail, 20, y + 17)

      // Right col — ticket type + total
      const rightX = W - 20

      // Tier pill
      doc.setFillColor(...tierColor)
      doc.roundedRect(rightX - 34, y + 4, 34, 8, 2, 2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      setTextColor(doc, WHITE)
      doc.text((ticket?.name ?? ticketType).toUpperCase(), rightX - 17, y + 9.2, { align: 'center' })

      // Qty
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      setTextColor(doc, GREY)
      doc.text(`${quantity} seat${quantity > 1 ? 's' : ''}`, rightX - 17, y + 19, { align: 'center' })

      // Total
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      setTextColor(doc, DARK)
      doc.text(totalStr, rightX, y + 10, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      setTextColor(doc, GREY)
      doc.text('TOTAL PAID', rightX, y + 16.5, { align: 'right' })

      // Thin divider line
      setDrawColor(doc, '#E5E5E5')
      doc.setLineWidth(0.3)
      doc.line(12, y + 28, W - 12, y + 28)

      y = headerH + 4
    } else {
      y = 16
    }

    // ── Ticket code blocks for this page ────────────────────────────────────
    const pageStart = pg * perPage
    const pageEnd   = Math.min(pageStart + perPage, ticketCodes.length)

    for (let i = pageStart; i < pageEnd; i++) {
      const code     = ticketCodes[i]
      const qrDataUri = qrDataUris[i] ?? ''

      // Card background
      setFill(doc, WHITE)
      setDrawColor(doc, '#E5E5E5')
      doc.setLineWidth(0.4)
      doc.roundedRect(12, y, W - 24, ticketBlockH - 4, 3, 3, 'FD')

      // Left colour strip
      doc.setFillColor(...tierColor)
      doc.roundedRect(12, y, 3, ticketBlockH - 4, 2, 2, 'F')
      // Cover right side of strip to keep only left rounded
      setFill(doc, tierHex)
      doc.rect(14, y, 1, ticketBlockH - 4, 'F')

      // Seat label (if multiple)
      const labelX = 22
      if (ticketCodes.length > 1) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        setTextColor(doc, GREY)
        doc.text(`SEAT ${i + 1} OF ${ticketCodes.length}`, labelX, y + 9)
      }

      // "YOUR TICKET" label
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      setTextColor(doc, GREY)
      const labelY = ticketCodes.length > 1 ? y + 15 : y + 10
      doc.text('TICKET ID', labelX, labelY)

      // Big ticket code
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      setTextColor(doc, DARK)
      doc.text(code, labelX, labelY + 10)

      // Ticket name below code
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      setTextColor(doc, GREY)
      doc.text(ticket?.name ?? ticketType, labelX, labelY + 18)

      // Entry instruction
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(150, 150, 150)
      doc.text('Show QR code or Ticket ID at the entrance.', labelX, labelY + 25)
      doc.text('Bring a valid ID.', labelX, labelY + 31)

      // QR code image — right side
      if (qrDataUri) {
        const qrSize = 36
        const qrX    = W - 12 - qrSize - 6
        const qrY    = y + (ticketBlockH - 4 - qrSize) / 2
        doc.addImage(qrDataUri, 'PNG', qrX, qrY, qrSize, qrSize)
        // code text under QR
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(160, 160, 160)
        doc.text(code, qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' })
      }

      // Perforated divider between tickets
      if (i < pageEnd - 1) {
        doc.setLineDashPattern([1.5, 1.5], 0)
        setDrawColor(doc, '#CCCCCC')
        doc.setLineWidth(0.3)
        doc.line(16, y + ticketBlockH - 2, W - 16, y + ticketBlockH - 2)
        doc.setLineDashPattern([], 0)
      }

      y += ticketBlockH
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    const footerY = 297 - footerH
    setFill(doc, DARK)
    doc.rect(0, footerY, W, footerH, 'F')

    setFill(doc, RED)
    doc.rect(0, footerY, W, 0.8, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(170, 170, 170)
    doc.text('thelscexpo.com  ·  lagosstudentcareerexpo@gmail.com', W / 2, footerY + 8, { align: 'center' })
    doc.text(`Ref: ${reference}  ·  Order ID: ...${params.reference?.slice(-8) ?? ''}`, W / 2, footerY + 15, { align: 'center' })

    // Page number if multiple pages
    if (pageCount > 1) {
      doc.setFontSize(7)
      doc.setTextColor(120, 120, 120)
      doc.text(`Page ${pg + 1} of ${pageCount}`, W - 14, footerY + 8, { align: 'right' })
    }
  }

  // Save
  const filename = `LSCE-2026-ticket-${ticketCodes[0] ?? reference.slice(-6)}.pdf`
  doc.save(filename)
}
