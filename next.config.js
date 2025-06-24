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

  // SIMPLIFIED: Minimal chunking for better initial load
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Minimal chunking strategy - prioritize initial load speed
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 30000,
        maxSize: 250000, // Prevent huge chunks
        cacheGroups: {
          default: false,
          vendors: false,
          // Single vendor chunk for critical dependencies only
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Everything else in one optimized vendor chunk
          lib: {
            name: 'lib',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      };

      // Aggressive tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Remove console logs and optimize
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress = {
            ...minimizer.options.terserOptions.compress,
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
            unused: true,
          };
        }
      });
    }

    return config;
  },

  // Enable compression
  compress: true,

  // Modern browser targeting
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
