import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AquaMart | Fresh Water Marketplace',
    short_name: 'AquaMart',
    description: 'Fresh Water Marketplace delivered to your doorstep.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0f9ff',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: 'https://picsum.photos/seed/aqua/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/aqua/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
