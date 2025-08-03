/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // This is a workaround for a build issue with a dependency of Genkit (handlebars).
    // It can be removed if the underlying issue is resolved in future versions.
    config.externals.push({
      'require.extensions': 'require.extensions',
    });
    return config;
  },
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
};

export default nextConfig;
