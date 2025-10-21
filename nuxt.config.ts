export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3000/api',
    },
  },

  app: {
    head: {
      title: 'Cards Game - Collect & Trade',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: 'Мобильная карточная игра с коллекционированием и торговлей' },
        { name: 'theme-color', content: '#4F46E5' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Cards Game',
      short_name: 'Cards',
      description: 'Collect and trade cards',
      theme_color: '#4F46E5',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  devServer: {
    port: 3001,
    host: '0.0.0.0',
  },

  nitro: {
    devProxy: {
      '/images': {
        target: process.env.API_BASE_URL?.replace('/api', '') || 'http://localhost:3000',
        changeOrigin: true,
        prependPath: true,
      },
    },
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-01-01',
})

