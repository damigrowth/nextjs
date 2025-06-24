/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
    inlineCss: true,
    cssChunking: true,
    // Enable Web Vitals attribution for better debugging
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'TTFB'],
    // CRITICAL: Modern JavaScript optimizations
    optimizeServerReact: true,
    serverMinification: true,
    optimizeCss: true,
  },
  compress: true,
  reactStrictMode: true,
  transpilePackages: [
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
  // Turbopack configuration (stable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    // Optimized for mobile-first responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 200, 256, 331],
    formats: ['image/webp'],
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      {
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
    ];
  },
};

module.exports = nextConfig;

// Injected content via Sentry wizard below
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(module.exports, {
  org: 'httpsdomvourniasdev',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: false,
  disableLogger: true,
  automaticVercelMonitors: true,
});
