const { withBlitz } = require("@blitzjs/next")

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ["localhost"],
  },
}

module.exports = withBlitz(nextConfig)
