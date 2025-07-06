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
    
    // Ensure watchOptions exists
    config.watchOptions = config.watchOptions || {};
    
    // Safely get the existing ignored paths
    const existingIgnored = config.watchOptions.ignored || [];
    
    // Ensure the ignored paths are in an array
    const ignoredArray = Array.isArray(existingIgnored) ? existingIgnored : [existingIgnored];

    // Add our new path to the array
    config.watchOptions.ignored = [...ignoredArray, '**/.genkit-cache/**'];

    return config;
  },
};

module.exports = nextConfig;
