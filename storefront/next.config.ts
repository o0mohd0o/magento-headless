import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product/category media is served absolute from Magento, e.g.
    // https://magento.test/media/catalog/product/cache/.../foo.jpg
    remotePatterns: [
      {
        protocol: "https",
        hostname: "magento.test",
        pathname: "/media/**",
      },
    ],
    // The local Magento host (magento.test) resolves to 127.0.0.1, which
    // Next 16's image optimizer blocks as a private IP (SSRF protection).
    // For local dev we skip optimization and let the browser load media
    // directly from magento.test (trusted via the mkcert CA). In production
    // with a public Magento domain, remove this to re-enable optimization.
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
