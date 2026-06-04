import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTicketConfirmation } from '@/lib/email'
import type { TicketTier } from '@/lib/ticket-config'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      buyer_name,
      buyer_email,
      buyer_phone,
      ticket_type,
      quantity,
      unit_price,
      discount_code,
      discount_amount,
      total_amount,
      paystack_reference,
      attendee_emails,
    } = body

    if (!buyer_name || !buyer_email || !ticket_type || !quantity || !paystack_reference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getAdminClient() as any

    // Idempotency — don't double-create
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('paystack_reference', paystack_reference)
      .single()

    if (existing) {
      return NextResponse.json({ orderId: existing.id, duplicate: true })
    }

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        buyer_name,
        buyer_email,
        buyer_phone:     buyer_phone || null,
        ticket_type,
        quantity,
        unit_price,
        discount_code:   discount_code || null,
        discount_amount: discount_amount || 0,
        total_amount,
        paystack_reference,
        payment_status: 'completed',
      })
      .select('id')
      .single()

    if (orderErr) {
      console.error('Order insert error:', orderErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create one attendee row per seat
    const emails: string[] = attendee_emails?.length
      ? attendee_emails
      : Array(quantity).fill(buyer_email)

    const attendeeRows = emails.map((email: string) => ({ order_id: order.id, email }))

    const { data: insertedAttendees, error: attendeeErr } = await supabase
      .from('attendees')
      .insert(attendeeRows)
      .select('ticket_code')

    if (attendeeErr) {
      console.error('Attendee insert error:', attendeeErr)
    }

    // Collect ticket codes for the email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ticketCodes: string[] = (insertedAttendees ?? []).map((a: any) => a.ticket_code as string)

    // Send confirmation email with QR codes (non-fatal)
    await sendTicketConfirmation({
      orderId:     order.id,
      buyerName:   buyer_name,
      buyerEmail:  buyer_email,
      ticketType:  ticket_type as TicketTier,
      quantity,
      totalAmount: total_amount,
      paystackRef: paystack_reference,
      ticketCodes,
    })

    return NextResponse.json({
      orderId:     order.id,
      success:     true,
      buyerName:   buyer_name,
      buyerEmail:  buyer_email,
      ticketType:  ticket_type,
      quantity,
      totalAmount: total_amount,
      ticketCodes,
    })
  } catch (err) {
    console.error('create-order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
