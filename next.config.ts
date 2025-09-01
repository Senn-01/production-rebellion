import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable TypeScript strict mode
  typescript: {
    // We want build to fail on type errors
    ignoreBuildErrors: false,
  },
  
  // Enable ESLint during builds
  eslint: {
    // We want build to fail on linting errors
    ignoreDuringBuilds: false,
  },

  // Performance optimizations
  experimental: {
    // Enable optimizePackageImports for better bundle size
    optimizePackageImports: [
      '@tanstack/react-query',
      'lucide-react',
      'recharts',
      'framer-motion'
    ],
  },

  // Image optimization
  images: {
    // For production, we'll likely host on Vercel/Netlify
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle analysis (can be enabled when needed)
  // This will be useful for Phase 4 performance optimization
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
      return config;
    },
  }),

  // Security headers for production
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
