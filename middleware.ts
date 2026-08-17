import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate-limited public API routes (requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars)
// Set these in Vercel → Settings → Environment Variables after creating a free Upstash Redis database
// at https://console.upstash.com — copy "REST URL" and "REST Token" from the database page.
const RATE_LIMITED_ROUTES: Array<{ prefix: string; limit: number; windowSeconds: number }> = [
  { prefix: '/api/payments/initiate',     limit: 5,  windowSeconds: 60  },  // 5 payment attempts/min
  { prefix: '/api/tickets/apply-coupon',  limit: 10, windowSeconds: 60  },  // 10 coupon checks/min
  { prefix: '/api/contact',              limit: 3,  windowSeconds: 3600 },  // 3 contact messages/hr
  { prefix: '/api/ambassadors/apply',    limit: 3,  windowSeconds: 3600 },  // 3 applications/hr
  { prefix: '/api/tickets/upload-cv',    limit: 10, windowSeconds: 3600 },  // 10 uploads/hr
]

function getRateLimiter(limit: number, windowSeconds: number) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  const redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
  })
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const matchedRoute = RATE_LIMITED_ROUTES.find(r => path.startsWith(r.prefix))
  if (matchedRoute) {
    const rl = getRateLimiter(matchedRoute.limit, matchedRoute.windowSeconds)
    if (rl) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
               ?? request.headers.get('x-real-ip')
               ?? 'unknown'
      const { success, limit, remaining, reset } = await rl.limit(`${matchedRoute.prefix}:${ip}`)
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests — please try again later' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit':     String(limit),
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset':     String(reset),
              'Retry-After':           String(Math.ceil((reset - Date.now()) / 1000)),
            },
          },
        )
      }
    }
  }
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — IMPORTANT: do not add logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = path.startsWith('/admin')
  const isLoginPage  = path === '/admin/login'

  // Unauthenticated → redirect to login
  if (isAdminRoute && !isLoginPage && !user) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', path)   // remember where they were going
    return NextResponse.redirect(loginUrl)
  }

  // Already logged in → skip login page
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',      // belt-and-suspenders: middleware also guards admin API routes
    '/api/payments/initiate',
    '/api/tickets/apply-coupon',
    '/api/contact',
    '/api/ambassadors/apply',
    '/api/tickets/upload-cv',
  ],
}
