/** @type {import('next').NextConfig} */

const nextConfig = {
  bundlePagesRouterDependencies: true,
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
      {
        source: "/register",
        destination: "https://prelaunch.doulitsa.gr/",
        permanent: false,
      },
      {
        source: "/become-seller",
        destination: "https://prelaunch.doulitsa.gr/",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
