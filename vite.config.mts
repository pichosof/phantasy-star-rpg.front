import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDemo = String(env.VITE_DEMO_MODE ?? '').toLowerCase() === 'true';
  // Demo build is published under https://<org>.github.io/<repo>/, so we need
  // a non-root base for asset URLs. The repo slug is configurable via env so
  // a fork can publish under its own org without editing vite.config.
  const demoBase = env.VITE_DEMO_BASE ?? '/picho-rpg-front/';

  return {
    base: isDemo ? demoBase : '/',
    plugins: [
      react(),
      tsconfigPaths(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.ico', 'favicon-*.png', 'logo192.png', 'logo512.png', 'robots.txt'],
        manifest: {
          name: 'RPG Companion',
          short_name: 'RPG',
          description: 'RPG Companion — GM tools and session management',
          theme_color: '#040A16',
          background_color: '#040A16',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: 'logo192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: 'logo512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'favicon.ico',
              sizes: '64x64 32x32 24x24 16x16',
              type: 'image/x-icon',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              // Google Fonts — cache-first, 1 year
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // API calls — network-first, fallback to cache
              urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Remote images/assets (S3 bucket, CDN) — stale-while-revalidate
              urlPattern: ({ url }) =>
                url.hostname.includes('amazonaws.com') || url.hostname.includes('cloudfront.net'),
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'remote-assets',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: { '@app': srcPath },
    },
    server: { host: '0.0.0.0', open: false, port: 3000 },
    preview: { host: '0.0.0.0' },
    build: { outDir: isDemo ? 'demo-build' : 'build', sourcemap: false },
  };
});
