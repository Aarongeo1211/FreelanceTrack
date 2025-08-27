/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Allow development access from network IP
  allowedDevOrigins: [
    '192.168.0.9:3000',
    'localhost:3000',
    '127.0.0.1:3000'
  ],
  // Optimize for development
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = nextConfig