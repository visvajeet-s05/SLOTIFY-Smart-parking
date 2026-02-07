/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'yourdomain.com'],
  },
  // Output configuration for Docker
  output: 'standalone',
  // Disable Strict Mode to prevent double WebSocket connections in dev
  reactStrictMode: false,
  // Disable build workers to prevent hanging
  experimental: {
    webpackBuildWorker: false,
    parallelServerBuildTraces: false,
    parallelServerCompiles: false,
  },
  // Webpack configuration to handle large builds
  webpack: (config, { isServer }) => {
    // Increase memory limit for builds
    config.performance = {
      hints: false,
    };
    return config;
  },
}

export default nextConfig
