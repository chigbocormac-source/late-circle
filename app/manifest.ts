import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Late Circle',
    short_name: 'Late Circle',
    description: 'Your cycle and habit tracker',
    start_url: '/today',
    display: 'standalone',
    background_color: '#FFF0F3',
    theme_color: '#FFF0F3',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}