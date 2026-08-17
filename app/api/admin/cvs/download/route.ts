import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? 'lsce-cvs'

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  })
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const key = req.nextUrl.searchParams.get('path')
  if (!key) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  try {
    const r2  = getR2Client()
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
    const url = await getSignedUrl(r2, cmd, { expiresIn: 60 })
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[admin/cvs/download] R2 signed URL error:', err)
    return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 })
  }
}
