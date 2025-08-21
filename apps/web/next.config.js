/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@projectkaf/ui', '@projectkaf/utils'],
  images: {
    domains: ['images.pexels.com', 'localhost'],
  },
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000',
  },
}

module.exports = nextConfig