export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app/',

  nitro: {
    externals: {
      external: ['ioredis', '@supabase/supabase-js'],
    }
  },

  runtimeConfig: {
    fintocSecretKey:     '',
    fintocWebhookSecret: '',
    fintocSuccessUrl:    '',
    fintocCancelUrl:     '',
    supabaseUrl:         '',
    supabaseServiceKey:  '',
    geminiApiKey:        '',
    public: {
      supabaseUrl:      process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL      || '',
      supabaseAnonKey:  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY || '',
    },
  },
  modules: ['@nuxtjs/tailwindcss', '@vercel/analytics'],
  css: ['~/assets/styles/main.css'],
  
  ssr: false,

  vite: {
    server: {
      allowedHosts: ['choosy-tropics-muck.ngrok-free.dev']
    }
  },

  app: {
    buildAssetsDir: 'assets',
    head: {
      title: 'Casa BE',
      meta: [
        { name: 'description', content: 'Un espacio presencial donde la neurociencia y el bienestar se encuentran.' }
      ],
    }
  }
})