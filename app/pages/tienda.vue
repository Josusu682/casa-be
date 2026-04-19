<template>
  <HeroCenter 
    :bgImage="`${baseUrl}images/fondo-tienda.png`" 
    bgColor="#D4D4D3"
  >
    <p class="hero-tienda__overline">TIENDA</p>
    
    <h1 class="hero-tienda__title">
      Herramientas para entrenar tu <br />
      <span class="font-light">sistema nervioso en la vida cotidiana.</span>
    </h1>

    <p class="hero-tienda__desc">
      No son objetos de bienestar. Son recursos con una función específica dentro del proceso de entrenamiento — diseñados para usarse en el estado del sistema nervioso correcto.
    </p>
  </HeroCenter>
  <Products />
  <QuoteSection />
  <InstagramSection />
  <WaitlistSection />
</template>

<script setup>
// Nota: Si HeroCenter está en tu carpeta /components, Nuxt lo importa automáticamente.
import QuoteSection from '~/components/QuoteSection.vue'
import InstagramSection from '~/components/InstagramSection.vue'
import WaitlistSection from '~/components/WaitlistSection.vue'

const config = useRuntimeConfig()
const baseUrl = config.app.baseURL
</script>

<style scoped>
/* Aquí solo dejamos los estilos del texto específicos de la tienda */

.hero-tienda__overline {
  font-family: 'Acumin Concept', sans-serif;
  color: #ffffff;
  font-size: 0.9rem;
  letter-spacing: 0.15em;
 
  text-transform: uppercase;
}

.hero-tienda__title {
  font-family: 'Acumin Concept', sans-serif;
  color: #ffffff;
  line-height: 1.2;
  font-size: clamp(2.2rem, 5vw, 3.5rem); 
  font-weight: 450;
  margin-bottom: 2rem;
}

.hero-tienda__desc {
  font-family: 'Acumin Concept', sans-serif;
  color: #e5e5e5;
  font-size: 1.1rem;
  font-weight: 300;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto; /* Asegura que el párrafo se centre si es más pequeño que el contenedor */
}
</style>