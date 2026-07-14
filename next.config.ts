import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — no iframing this site from other origins
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send origin in Referer header (not full URL path)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features the site does not use
  {
    key: "Permissions-Policy",
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")',
  },
  // Force HTTPS for 2 years, including subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy
  // Stripe domains are pre-allowed for when checkout is wired up.
  // Update script-src and frame-src here when adding analytics or embeds.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' for its style injection; nonce-based CSP
      // can be added later via middleware if stricter control is needed.
      "style-src 'self' 'unsafe-inline'",
      // 'self' covers Next.js bundled scripts; Stripe JS is loaded from js.stripe.com
      "script-src 'self' 'unsafe-inline' https://js.stripe.com",
      // Images: allow self, data URIs (for inline SVGs), and https (for any future CDN images)
      "img-src 'self' data: https:",
      // Fonts served from the same origin only
      "font-src 'self'",
      // API calls: self + Supabase (auth/db) + Stripe API (checkout/webhooks)
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      // Stripe checkout uses an iframe from stripe.com
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      // Prevent loading any objects/plugins (Flash etc.)
      "object-src 'none'",
      // Only allow same-origin base URL
      "base-uri 'self'",
      // Prevent form submissions to external URLs
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      {
        // Apply security headers to every route
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
