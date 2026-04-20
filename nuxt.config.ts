export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app/',

  vite: {
    server: {
      allowedHosts: ['choosy-tropics-muck.ngrok-free.dev'],
    }
  },

  nitro: {
    externals: {
      external: ['ioredis'],
    }
  },

  runtimeConfig: {
    fintocSecretKey:     '',
    fintocWebhookSecret: '',
    fintocSuccessUrl:    'http://localhost:3000/confirmacion-pago',
    fintocCancelUrl:     'http://localhost:3000/tienda',
  },
  modules: ['@nuxtjs/tailwindcss', '@vercel/analytics'],
  css: ['~/assets/styles/main.css'],
  
  ssr: false,  // ✅ Renderizado del servidor - requerido para Vercel

  app: {
    baseURL: '/', // ✅ Raíz para Vercel
    buildAssetsDir: 'assets', 
    head: {
      title: 'Casa BE',
      meta: [
        { name: 'description', content: 'Un espacio presencial donde la neurociencia y el bienestar se encuentran.' }
      ],
    }
  }
})