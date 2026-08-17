import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'

/**
 * GET /api/qr/[code]
 *
 * Generates and serves a QR code PNG for the given ticket code.
 * Used as the image URL in confirmation emails — a real hosted URL
 * that works in all email clients (Gmail, Outlook, Apple Mail, etc.)
 * since they all render standard <img src="https://..."> tags.
 *
 * Long cache headers — a given ticket code never changes.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  if (!code || code.length < 2) {
    return new NextResponse('Invalid code', { status: 400 })
  }

  const upperCode = code.toUpperCase()

  // Only generate QR codes for real ticket codes — prevents arbitrary string encoding
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any
  const { data: attendee } = await db
    .from('attendees')
    .select('id')
    .eq('ticket_code', upperCode)
    .maybeSingle()

  if (!attendee) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const pngBuffer = await QRCode.toBuffer(upperCode, {
      type:                 'png',
      width:                300,
      margin:               2,
      color:                { dark: '#1A1A1A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    })

    return new NextResponse(pngBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type':  'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('[qr] generation error:', err)
    return new NextResponse('Failed to generate QR', { status: 500 })
  }
}
