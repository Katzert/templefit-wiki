/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/templefit-wiki',
  trailingSlash: true,
};

export default nextConfig;
