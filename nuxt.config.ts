// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/styles/main.css'],
  
  app: {
    // ⚠️ REEMPLAZA 'Casa-BE-Josu' por el nombre exacto de tu repo en GitHub
    baseURL: '/casa-be/', 
    buildAssetsDir: 'assets',
    head: {
      title: 'Casa BE',



      meta: [
        { name: 'description', content: 'Un espacio presencial donde la neurociencia y el bienestar se encuentran.' }
      ],
    }
  }
})
