/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    globalNotFound: true,
    browserDebugInfoInTerminal: true,
    clientSegmentCache: true,
    devtoolSegmentExplorer: true,
    serverActions: {
      bodySizeLimit: '20mb',
    },
    reactCompiler: true,
    inlineCss: true,
    optimizeCss: true,
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'TTFB'],
    optimizePackageImports: [
      '@apollo/client',
      'react-loading-skeleton',
      'zustand',
      '@fortawesome/react-fontawesome',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-regular-svg-icons',
      '@fortawesome/free-brands-svg-icons',
      'swiper',
      'react-countup',
      'date-fns',
      'lodash.debounce',
    ],
  },
  images: {
    unoptimized: true,
    // Optimized for mobile-first responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 200, 256, 331],
    formats: ['image/webp'],
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/s',
        destination: '/ipiresies',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/pros',
        permanent: true,
      },
      {
        source: '/auth/sign-in',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/pros',
        destination: '/dir',
        permanent: true,
      },
      {
        source: '/pros/:category',
        destination: '/dir/:category',
        permanent: true,
      },
      {
        source: '/pros/:category/:subcategory',
        destination: '/dir/:category/:subcategory',
        permanent: true,
      },
      {
        source: '/companies',
        destination: '/dir',
        permanent: true,
      },
      {
        source: '/companies/:category',
        destination: '/dir/:category',
        permanent: true,
      },
      {
        source: '/companies/:category/:subcategory',
        destination: '/dir/:category/:subcategory',
        permanent: true,
      },
    ];
  },

  // Enable compression
  compress: true,
};

module.exports = nextConfig;
