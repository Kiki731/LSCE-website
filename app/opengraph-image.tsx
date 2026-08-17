import { ImageResponse } from 'next/og'

export const runtime     = 'edge'
export const alt         = 'LSCE 2026 — Lagos Students Career Expo'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1A1A1A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        {/* Background texture — subtle radial */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 70% 30%, rgba(255,32,53,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Top-right decorative star / asterisk */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 80,
            width: 160,
            height: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 120,
            color: 'rgba(255,32,53,0.18)',
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          ✦
        </div>

        {/* Bottom-left decorative star */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 60,
            color: 'rgba(255,32,53,0.1)',
            fontWeight: 900,
          }}
        >
          ✦
        </div>

        {/* LSCE badge pill — top left */}
        <div
          style={{
            position: 'absolute',
            top: 64,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 900,
              color: 'white',
            }}
          >
            L
          </div>
          <span
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 18,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            thelscexpo.com
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1 }}>

          {/* Tagline pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,32,53,0.15)',
              border: '1px solid rgba(255,32,53,0.3)',
              borderRadius: 100,
              padding: '8px 20px',
              width: 'fit-content',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF2035' }} />
            <span style={{ color: '#FF2035', fontSize: 18, fontWeight: 600, letterSpacing: '0.06em' }}>
              October 3rd, 2026
            </span>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                color: 'white',
                fontSize: 80,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              Lagos Students
            </span>
            <span
              style={{
                color: '#FF2035',
                fontSize: 80,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              Career Expo 3.0
            </span>
          </div>

          {/* Venue */}
          <span
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: 24,
              marginTop: 8,
            }}
          >
            Daystar Christian Centre, Ikeja, Lagos
          </span>
        </div>

      </div>
    ),
    { ...size }
  )
}
