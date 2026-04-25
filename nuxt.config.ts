export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app/',

  future: {
    compatibilityVersion: 4,
  },

  nitro: {
    externals: {
      external: ['ioredis', '@supabase/supabase-js'],
    },
  },

  runtimeConfig: {
    fintocSecretKey:     '',
    fintocWebhookSecret: '',
    fintocSuccessUrl:    '',
    fintocCancelUrl:     '',
    supabaseUrl:         '',
    supabaseServiceKey:  '',
    geminiApiKey:        '',
    deepseekApiKey:      '',
    public: {
      supabaseUrl:      process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL               || '',
      supabaseAnonKey:  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY          || '',
      siteUrl:          process.env.NUXT_PUBLIC_SITE_URL                           || 'https://casa-be.cl',
    },
  },
  modules: ['@nuxtjs/tailwindcss', '@vercel/analytics'],
  css: ['~/assets/styles/main.css'],
  
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