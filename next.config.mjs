/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'yourdomain.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Output configuration for Docker
  output: 'standalone',
  // Disable Strict Mode to prevent double WebSocket connections in dev
  reactStrictMode: false,
  // Disable build workers to prevent hanging

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
