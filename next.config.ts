import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@yamada-ui/lucide"],
  },
  headers: async () => {
    await Promise.resolve()

    return [
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
        source: "/colors/:hex",
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  pageExtensions: ["page.jsx", "page.tsx", "api.js", "api.ts"],
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
}

export default nextConfig
