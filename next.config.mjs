/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{ source: '/review', destination: '/editor', permanent: false }];
  },
};

export default nextConfig;
