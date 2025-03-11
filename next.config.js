/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: false,
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      // Basic redirect
      {
        source: "/s",
        destination: "/ipiresies",
        permanent: true,
      },
      {
        source: "/profile",
        destination: "/pros",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
