<template>
  <TheBannerTool class="hero-custom">
    <!-- 
    <template #title>
      <div class="hero__title">
        Entrenar la capacidad<br />
        <span class="font-light">de sentirte bien.</span>
      </div>
    </template>
-->
    <template #subtitle>
      <div class="hero__content">
       <!-- <p class="hero__desc">
          Un espacio presencial donde la neurociencia y el bienestar se encuentran para transformar tu día a día.
        </p>                    -->
        
        <div class="hero__actions">
          <a href="#" class="btn-casa-be">
            <span>¿Por donde quieres empezar?</span>
          </a>
        </div>
      </div>
    </template>
  </TheBannerTool>
</template>

<script setup>
// Nota: Si no usas Nuxt, recuerda importar TheBannerTool manualmente
import TheBannerTool from './TheBannerTool.vue'
</script>

<style scoped>
/* 1. CONFIGURACIÓN DEL FONDO (Igual que el ejemplo de Cymasuite) */
.hero-custom {
  min-height: 100vh;
  /* Aquí ponemos tu foto principal */
  background-image: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/images/fondo.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
}

/* 2. TIPOGRAFÍA ACUMIN CONCEPT Y COLOR */
.hero__title {
  font-family: 'Acumin Concept', sans-serif;
  color: #ffffff;
  line-height: 1.1;
  /* Tamaño grande para el Hero */
  font-size: clamp(2.5rem, 6vw, 4.5rem); 
  font-weight: 700;
}

.hero__desc {
  font-family: 'Acumin Concept', sans-serif;
  color: #394e3c;
  font-size: 1.5rem;
  font-weight: 300;
  max-width: 500px;
  margin-bottom: 2.5rem;
}

/* 3. BOTÓN ESTILO CASA BE (EL QUE CONFIGURAMOS) */
.hero__actions {
  display: flex;
  gap: 1rem;
}

.btn-casa-be {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #ffffff;
  border-radius: 100px;
  background: transparent;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-casa-be span {
  padding: 0.8rem 2.5rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1.3rem;
  font-weight: 400;
  color: #ffffff;
}

.btn-casa-be:hover {
  background-color: #394e3c;
  border-color: #394e3c;
}

.btn-casa-be:hover span {
  color: #ffffff;
}

/* Forzar que el banner ocupe el ancho total */
:deep(.max-w-screen-xl) {
  margin-left: auto;
  margin-right: auto;
}

/* Hacer que el contenedor del hero ocupe todo el ancho */
:deep(header > div) {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Mover el botón a la derecha con margen del borde */
.hero__content {
  position: static;
}

.hero__actions {
  position: absolute;
  right: clamp(2rem, 5vw, 5rem);
  top: 50%;
  transform: translateY(-50%);
}
</style>