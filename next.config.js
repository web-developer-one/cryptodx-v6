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
    const watchOptions = config.watchOptions || {};
    const existingIgnored = watchOptions.ignored || [];
    
    const ignoredPaths = Array.isArray(existingIgnored)
      ? existingIgnored
      : [existingIgnored];

    if (!ignoredPaths.includes('**/.genkit-cache/**')) {
      ignoredPaths.push('**/.genkit-cache/**');
    }
    
    config.watchOptions = {
        ...watchOptions,
        ignored: ignoredPaths,
    };

    return config;
  },
};

module.exports = nextConfig;
