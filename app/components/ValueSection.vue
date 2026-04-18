<template>
  <section class="value">
    <div ref="innerRef" class="value__inner">
      <h1 class="value__heading">
        Un espacio para entrenar tu<br />capacidad de sentirte bien.
      </h1>
      <p class="value__body">
        No prometemos que desaparezca lo difícil. Trabajamos directamente con el sistema nervioso — el mecanismo que regula cómo tu cuerpo procesa lo que vive. Porque eso se entrena. Y entrenar eso es lo que hace la diferencia.
      </p>
      <p class="value__tagline">Entrenamos tu capacidad de sentirte bien.</p>
      
      <a href="#" class="value__btn">
        <span class="value__btn-text">Conoce Casa BE</span>
      </a>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const innerRef = ref(null)
let rafId = null

function updateAnimation() {
  if (!innerRef.value) return
  const rect = innerRef.value.getBoundingClientRect()
  const vh = window.innerHeight

  const enter = (vh - rect.top) / (vh * 0.6)
  const exit = rect.bottom / (vh * 0.6)
  const progress = Math.min(1, Math.max(0, Math.min(enter, exit)))

  innerRef.value.style.opacity = progress
  innerRef.value.style.transform = `translateX(${60 * (1 - progress)}px)`
}

function onScroll() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(updateAnimation)
}

onMounted(() => {
  updateAnimation()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.value {
  padding: 5rem 1.5rem 5.5rem;
  text-align: center;
  /* Aplicamos el color de fondo sólido aquí */
  background-color: #D4D4D3;
  overflow: hidden;
}

.value__inner {
  max-width: 600px; /* Aumentado ligeramente para balancear los textos */
  margin: 0 auto;
  will-change: opacity, transform;
}

.value__heading {
  font-family: var(--font-serif, serif);
  font-weight: 300;
  font-size: clamp(1.6rem, 4vw, 3.1rem);
  line-height: 1.35;
  color: #394e3c;
  margin-bottom: 1.6rem;
}

.value__body {
  font-family: var(--font-sans, sans-serif);
  font-size: 1.5rem;
  font-weight: 300;
  color: #394e3c;
  line-height: 1.75;
  margin-bottom: 1.2rem;
}

.value__tagline {
  font-family: var(--font-sans, sans-serif);
  font-size: 1.2rem;
  font-weight: 300;
  color: #394e3c;
  margin-bottom: 2.5rem;
}

/* --- BOTÓN ACTUALIZADO CON BORDES CSS --- */
.value__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  
  /* Estilo del borde y fondo */
  background-color: #9FA3A6;
  border: 1.5px solid #9FA3A6; /* Borde negro nítido */
  border-radius: 100px; /* Forma de píldora */
  
  transition: all 0.3s ease;
}

.value__btn-text {
  padding: 0.8rem 2.8rem;
  font-family: var(--font-sans, sans-serif);
  font-size: 1.2rem; /* Ajustado para legibilidad */
  font-weight: 400;
  color: white; /* Color corporativo */
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* Efecto Hover */
.value__btn:hover {
  background-color: #394e3c;
  border-color: #394e3c;
}

.value__btn:hover .value__btn-text {
  color: #ffffff; /* Texto blanco al hacer hover */
}
</style>