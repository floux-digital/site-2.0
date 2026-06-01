import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compress: true,
  allowedDevOrigins: ['192.168.15.3', '10.131.119.50'],
}

export default nextConfig
