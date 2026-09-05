/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure Node 24 native modules like node:sqlite work smoothly in API routes
  serverExternalPackages: ["node:sqlite", "bcryptjs"],
};

export default nextConfig;
