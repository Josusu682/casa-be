export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
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