/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
    // Enable Web Vitals attribution for better debugging
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'TTFB'],

    // CRITICAL: Modern JavaScript optimizations
    optimizeServerReact: true,
    serverMinification: true,

    optimizeCss: true,
    // Optimize package imports for better tree-shaking
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

  // CRITICAL: Webpack optimizations for LCP improvement
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Split chunks more aggressively for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Apollo/GraphQL chunk
          apollo: {
            name: 'apollo',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](@apollo|graphql)/,
            priority: 40,
          },
          // FontAwesome chunk
          fontawesome: {
            name: 'fontawesome',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@fortawesome/,
            priority: 30,
          },
          // React/UI libraries chunk
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|react-select|react-slider|swiper)/,
            priority: 20,
          },
          // Vendor chunk for other packages
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
        },
      };

      // Optimize module concatenation
      config.optimization.concatenateModules = true;

      // Remove console logs in production
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress.drop_console = true;
        }
      });
    }

    return config;
  },

  // Enable compression
  compress: true,

  // Modern browser targeting for smaller bundles
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;


// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'httpsdomvourniasdev',
  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  // Disabling this to reduce the size of serialized strings in webpack cache.
  widenClientFileUpload: false,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
