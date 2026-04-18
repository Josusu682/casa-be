export default defineNuxtConfig({
  // 1. Apagamos el Server Side Rendering
  ssr: false, 
  
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/styles/main.css'],

  app: {
    // 2. Rutas correctas
    baseURL: '/casa-be/', 
    buildAssetsDir: 'assets', 
    head: {
      title: 'Casa BE',
      meta: [
        { name: 'description', content: 'Un espacio presencial donde la neurociencia y el bienestar se encuentran.' }
      ],
    }
  },

  // 3. EL TRUCO MÁGICO: Le decimos al motor cómo compilar para GitHub
  nitro: {
    preset: 'github-pages'
  }
})