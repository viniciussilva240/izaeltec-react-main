/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/proxy/:path*',
        destination: `${process.env.API_BASE_URL || 'https://apiizaeltec.dev.vilhena.ifro.edu.br'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
