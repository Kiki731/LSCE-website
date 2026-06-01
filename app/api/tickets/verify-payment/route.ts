import { NextRequest, NextResponse } from 'next/server'

/**
 * Verifies a Paystack payment reference server-side before we trust it.
 * Called from the client's Paystack callback before create-order.
 */
export async function POST(req: NextRequest) {
  try {
    const { reference, expectedAmount } = await req.json()

    if (!reference) {
      return NextResponse.json({ valid: false, message: 'Missing reference' }, { status: 400 })
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    )

    const json = await paystackRes.json()

    if (!json.status || json.data?.status !== 'success') {
      return NextResponse.json(
        { valid: false, message: json.message ?? 'Payment verification failed' },
        { status: 400 },
      )
    }

    const paidKobo: number = json.data.amount       // Paystack returns kobo
    const paidNaira = paidKobo / 100

    // Guard against tampered amounts — allow ±1 Naira for rounding
    if (expectedAmount && Math.abs(paidNaira - expectedAmount) > 1) {
      return NextResponse.json(
        { valid: false, message: 'Amount mismatch — possible tampering detected' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      valid: true,
      reference: json.data.reference as string,
      amountNaira: paidNaira,
      email: json.data.customer?.email as string,
      metadata: json.data.metadata,
    })
  } catch (err) {
    console.error('verify-payment error:', err)
    return NextResponse.json({ valid: false, message: 'Internal error' }, { status: 500 })
  }
}
