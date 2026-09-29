/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  productionBrowserSourceMaps: true,
  async headers() {
    return [
      {
        source: '/llms.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        source: '/images/:all*(webp|png|jpg|jpeg|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:all*(woff2|woff|ttf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicons_ph/:all*(png|ico|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/images/Mascot/Czech.webp', destination: '/images/Mascot/czech.webp' },
      { source: '/images/Mascot/Danish.webp', destination: '/images/Mascot/danish.webp' },
      { source: '/images/Mascot/Finnish.webp', destination: '/images/Mascot/finnish.webp' },
      { source: '/images/Mascot/French.webp', destination: '/images/Mascot/french.webp' },
      { source: '/images/Mascot/German.webp', destination: '/images/Mascot/german.webp' },
      { source: '/images/Mascot/Greek.webp', destination: '/images/Mascot/greek.webp' },
      { source: '/images/Mascot/Hebrew.webp', destination: '/images/Mascot/hebrew.webp' },
      { source: '/images/Mascot/Spanish.webp', destination: '/images/Mascot/spanish.webp' },
      { source: '/images/mascot/:path*', destination: '/images/Mascot/:path*' },
    ];
  },
};

export default nextConfig;
