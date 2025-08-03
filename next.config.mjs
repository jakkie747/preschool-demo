/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  allowedDevOrigins: [
    'https://3001-firebase-preschool-demo-1754202345068.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev',
  ],
  webpack: (config, { isServer }) => {
    // Fix for the 'handlebars' issue with Next.js App Router
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
        },
      };
    }
    // This is needed for 'require.extensions' to not throw an error
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });
    return config;
  },
};

export default nextConfig;
