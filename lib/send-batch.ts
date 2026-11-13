import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export type BatchPayload = Parameters<typeof resend.emails.send>[0]

export interface BatchResult {
  succeeded: number
  failed:    number
  errors:    string[]
}

/**
 * Bulk-send through Resend's batch endpoint.
 *
 * Sending one request per recipient does not work: Resend allows roughly two
 * requests per second, so a bulk send is almost entirely rate-limited away.
 * The batch endpoint takes up to 100 fully distinct messages (content can
 * differ per recipient) as a SINGLE request.
 *
 * The SDK also resolves rather than throws on API errors, so a rejected send
 * is indistinguishable from a delivered one unless the error field is read.
 * Counting settled promises therefore reports success while nothing arrives —
 * every caller must use this helper rather than mapping over emails.send.
 */
export async function sendBatched(payloads: BatchPayload[]): Promise<BatchResult> {
  let succeeded = 0
  const errors: string[] = []

  for (let i = 0; i < payloads.length; i += 100) {
    const chunk = payloads.slice(i, i + 100)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (resend as any).batch.send(chunk)
      if (error) {
        errors.push(error.message ?? 'Resend rejected the batch')
      } else {
        succeeded += data?.data?.length ?? chunk.length
      }
    } catch (err) {
      errors.push((err as Error).message)
    }
    // Stay clear of the per-second request limit between chunks.
    if (i + 100 < payloads.length) await new Promise(r => setTimeout(r, 600))
  }

  return { succeeded, failed: payloads.length - succeeded, errors }
}
