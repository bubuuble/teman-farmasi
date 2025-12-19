import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Naikkan limit upload ke 50MB (sesuaikan kebutuhan)
    },
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
