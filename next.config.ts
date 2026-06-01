import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Never expose source maps in production ─────────────────────────────────
  // This prevents attackers from reading your original source code via DevTools.
  productionBrowserSourceMaps: false,

  images: {
    remotePatterns: [
      {
        // Supabase Storage — speaker photos, team photos, gallery images, etc.
        protocol: 'https',
        hostname: 'xbfplvaymrtzlsikiwdr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // ── Security headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          // Only your own origin can call these API routes
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_SITE_URL ?? '' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
          // Prevent caching of API responses
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // Block iframes (clickjacking protection)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stop MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Force HTTPS
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Control referrer leakage
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
};

export default nextConfig;
