<template>
  <section ref="sectionRef" class="value">
    <div class="value__inner">
      <h1 class="value__heading" :style="headingStyle">
        Un espacio para entrenar tu<br />capacidad de sentirte bien.
      </h1>
      <p class="value__body" :style="bodyStyle">
        No prometemos que desaparezca lo difícil. Trabajamos directamente con el sistema nervioso — el mecanismo que regula cómo tu cuerpo procesa lo que vive. Porque eso se entrena. Y entrenar eso es lo que hace la diferencia.
      </p>
      <p class="value__tagline" :style="taglineStyle">Entrenamos tu capacidad de sentirte bien.</p>
      
      <a href="#" class="value__btn" :style="btnStyle">
        <span class="value__btn-text">Conoce Casa BE</span>
      </a>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const sectionRef = ref(null)
const scrollProgress = ref(0)
const inProgress = ref(0)
const outProgress = ref(0)

const OFFSET = 90

function updateProgress() {
  if (!sectionRef.value) return
  const { top, bottom } = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight

  inProgress.value = Math.max(0, Math.min(1, (vh - top) / (vh * 0.55)))
  outProgress.value = Math.max(0, Math.min(1, bottom / (vh * 0.35)))

  scrollProgress.value = Math.min(inProgress.value, outProgress.value)
}

onMounted(() => {
  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})

const slideX = computed(() => OFFSET * (outProgress.value - inProgress.value))

const headingStyle = computed(() => ({
  opacity: scrollProgress.value,
  transform: `translateX(${slideX.value}px)`,
}))

const bodyStyle = computed(() => ({
  opacity: scrollProgress.value,
  transform: `translateX(${slideX.value * 0.85}px)`,
}))

const taglineStyle = computed(() => ({
  opacity: scrollProgress.value,
  transform: `translateX(${slideX.value * 0.7}px)`,
}))

const btnStyle = computed(() => ({
  opacity: scrollProgress.value,
  transform: `translateX(${slideX.value * 0.5}px)`,
}))
</script>

<style scoped>
.value {
  padding: 5rem 1.5rem 5.5rem;
  text-align: center;
  /* Aplicamos el color de fondo sólido aquí */
  background-color: #D4D4D3; 
}

.value__inner {
  max-width: 600px; /* Aumentado ligeramente para balancear los textos */
  margin: 0 auto;
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
  
  transition: background-color 0.3s ease, border-color 0.3s ease;
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