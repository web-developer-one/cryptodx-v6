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
  webpack: (config) => {
    // Add a watchOptions to ignore the .genkit-cache directory
    // This prevents the Next.js dev server from restarting in a loop
    // when the Genkit dev server writes to its cache.
    if (!config.watchOptions) {
      config.watchOptions = {};
    }
    
    const ignored = config.watchOptions.ignored || [];
    
    const ignoredArray = Array.isArray(ignored)
      ? ignored
      : [ignored];

    if (!ignoredArray.includes('**/.genkit-cache/**')) {
      ignoredArray.push('**/.genkit-cache/**');
    }
    
    config.watchOptions.ignored = ignoredArray;
    
    return config;
  },
};

module.exports = nextConfig;
