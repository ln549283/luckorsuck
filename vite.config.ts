import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/luckorsuck/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Luck or Suck',
        short_name: 'Luck or Suck',
        description: 'Teste ta chance. Coffre avant de tout perdre.',
        start_url: '/luckorsuck/',
        scope: '/luckorsuck/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0b0b10',
        background_color: '#0b0b10',
        icons: [
          {
            src: '/luckorsuck/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/luckorsuck/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,webmanifest}']
      }
    })
  ],
  build: {
    target: 'es2020'
  }
});
