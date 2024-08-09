/** @type {import('next').NextConfig} */

const nextConfig = {
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
        destination: "/profiles",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
