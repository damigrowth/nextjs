/** @type {import('next').NextConfig} */
const nextConfig = {
  // TEMPORARY: Disable strict mode to test if React double-mounting is causing realtime subscription issues
  // TODO: Re-enable after implementing useRef pattern for channel persistence
  reactStrictMode: false,

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  generateEtags: true, // Enable ETags for better caching

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
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'TTFB', 'INP'],
    optimizePackageImports: [
      '@apollo/client',
      'react-loading-skeleton',
      'zustand',
      'swiper',
      'react-countup',
      'date-fns',
      'lodash.debounce',
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@tanstack/react-table',
      'react-hook-form',
      'recharts',
      'react-select',
      'react-day-picker',
      'cmdk',
      '@hookform/resolvers',
      'embla-carousel-react',
    ],
  },

  // Server-only packages (moved out of experimental per Next.js 15.5)
  serverExternalPackages: ['bcrypt', '@prisma/client', 'cloudinary'],

  // Modularize imports for better tree-shaking
  modularizeImports: {
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/dist/{{member}}',
    },
    // Note: lucide-react already optimized via optimizePackageImports
  },

  // Compiler options for better optimization
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },
  images: {
    unoptimized: true, // Use Cloudinary optimization instead of Next.js
    // Optimized for mobile-first responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 200, 256, 285, 331],
    formats: ['image/webp'],
    minimumCacheTTL: 2678400, // 31 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // HTTP headers for performance and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
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

  // Production-only optimizations
  ...(process.env.NODE_ENV === 'production' && {
    productionBrowserSourceMaps: false, // Disable source maps in production
  }),
};

module.exports = nextConfig;
