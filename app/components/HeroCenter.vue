<template>
  <section 
    class="hero-center" 
    :style="{ 
      backgroundImage: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0)), url('${bgImage}')`,
      backgroundColor: bgColor
    }"
  >
    <div class="hero-center__container">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  bgImage: {
    type: String,
    required: true
  },
  bgColor: {
    type: String,
    default: '#D4D4D3' // Color por defecto (el de tu tienda), pero puedes cambiarlo al usarlo
  }
})
</script>

<style scoped>
.hero-center {
  min-height: 100vh; /* O la altura que prefieras */
  width: 100%;
  
  /* 100% para el ancho (se estira a los lados)
     auto para el alto (mantiene la proporción sin deformarse) */
  background-size: 100% auto; 
  
  background-position: top center; /* Alinea la imagen arriba */
  background-repeat: no-repeat; /* Evita que se repita hacia abajo */
  
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.hero-center__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 800px; /* Limita el ancho del texto para que se lea bien */
  width: 100%;
}
/* Forzar al HeroCenter a alinearse a la izquierda en esta página */
:deep(.hero-center) {
  justify-content: flex-start; /* Empuja el contenedor a la izquierda */
  padding-left: clamp(2rem, 10vw, 10rem); /* Le da un margen izquierdo responsivo */
}
</style>