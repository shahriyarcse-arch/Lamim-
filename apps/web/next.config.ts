import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Internal workspace packages ship TypeScript source; Next compiles them.
  transpilePackages: ['@lamim/core', '@lamim/db'],
};

export default nextConfig;
