/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
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
