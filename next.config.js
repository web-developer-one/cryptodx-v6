/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: {
    allowedDevOrigins: [
      '*.cloudworkstations.dev',
    ],
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avataaars.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's2.coinmarketcap.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'walletguide.walletconnect.network',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
