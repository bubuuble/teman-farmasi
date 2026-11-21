import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom'],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Naikkan limit upload ke 50MB untuk file besar
    },
    proxyClientMaxBodySize: '50mb', // Limit untuk middleware/proxy
  },
  // Hindari ECONNRESET akibat reuse socket yang sudah ditutup upstream/CDN
  httpAgentOptions: {
    keepAlive: false,
  },

  images: {
    // Sanity & Unsplash sudah memiliki optimasi/resizing CDN bawaan.
    // unoptimized: true mencegah server Next.js mem-proxy gambar (menghindari error SSRF DNS64 "resolved to private ip").
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};
export default nextConfig;
