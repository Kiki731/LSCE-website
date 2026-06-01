import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTicketConfirmation } from '@/lib/email'
import type { TicketTier } from '@/lib/ticket-config'

// Uses service-role key so it bypasses RLS — only called server-side after payment verified
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
      attendee_emails,   // string[] — emails for all seats
    } = body

    // Basic validation
    if (!buyer_name || !buyer_email || !ticket_type || !quantity || !paystack_reference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Check for duplicate reference (idempotency)
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
        buyer_phone: buyer_phone || null,
        ticket_type,
        quantity,
        unit_price,
        discount_code: discount_code || null,
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

    // Create attendee rows (one per seat)
    const emails: string[] = attendee_emails?.length
      ? attendee_emails
      : Array(quantity).fill(buyer_email)

    const attendeeRows = emails.map((email: string) => ({
      order_id: order.id,
      email,
    }))

    const { error: attendeeErr } = await supabase
      .from('attendees')
      .insert(attendeeRows)

    if (attendeeErr) {
      // Non-fatal — order is saved, attendees can be backfilled
      console.error('Attendee insert error:', attendeeErr)
    }

    // Send confirmation email via Resend (non-fatal if it fails)
    await sendTicketConfirmation({
      orderId:     order.id,
      buyerName:   buyer_name,
      buyerEmail:  buyer_email,
      ticketType:  ticket_type as TicketTier,
      quantity,
      totalAmount: total_amount,
      paystackRef: paystack_reference,
    })

    return NextResponse.json({ orderId: order.id, success: true })
  } catch (err) {
    console.error('create-order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
