/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'graph.facebook.com',
      'platform-lookaside.fbsbx.com',
      'lh3.googleusercontent.com',
    ],
  },
};

module.exports = nextConfig;
