/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: [
      'graph.facebook.com',
      'platform-lookaside.fbsbx.com',
      'lh3.googleusercontent.com',
      'res.cloudinary.com',
      'img.vietqr.io',
    ],
  },
};

module.exports = nextConfig;
