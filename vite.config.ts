import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registered manually in main.ts (non-blocking, after first paint)
      includeAssets: ['favicon.svg', 'og.png'],
      manifest: {
        name: 'Хисрав & Фариштабону — Тӯй',
        short_name: 'Тӯй',
        description: 'Даъватнома ба тӯй / Приглашение на свадьбу',
        lang: 'tg',
        start_url: '/',
        display: 'standalone',
        background_color: '#e8e7e4',
        theme_color: '#e8e7e4',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache everything the build emits (fonts included) so the second visit is instant and offline-capable.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,ics}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    target: 'es2019',
    cssCodeSplit: true,
    assetsInlineLimit: 2048, // tiny SVGs get inlined; fonts stay separate (cacheable)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // GSAP goes to its own chunk: the info block never waits for it.
          if (id.includes('node_modules/gsap')) return 'gsap'
        },
      },
    },
  },
})
