
import withPWAInit from "@ducanh2912/next-pwa";
import runtimeCaching from "@ducanh2912/next-pwa/cache.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

const withPWA = withPWAInit({
  dest: "public",
  disable: false,
  register: true,
  skipWaiting: true,
  runtimeCaching,
});

export default withPWA(nextConfig);
