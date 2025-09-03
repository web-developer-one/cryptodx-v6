
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['crypto-js', '@paypal/checkout-server-sdk'],
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'seeklogo.com',
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
      {
        protocol: 'https',
        hostname: 'i.seadn.io',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

module.exports = nextConfig;
