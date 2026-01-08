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
  // Tambahan config untuk middleware dan API routes
  httpAgentOptions: {
    keepAlive: true,
  },

  images: {
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
