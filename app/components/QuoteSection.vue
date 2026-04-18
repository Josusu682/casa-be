<template>
  <section ref="sectionRef" class="quote" :style="{ backgroundImage: `url('/images/fondo_gris_2.png')`, ...sectionStyle }">
    <div class="quote__container">
      
      <button @click="prevSlide" class="quote__nav-btn" aria-label="Anterior">
        <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 12H50" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
        </svg>
      </button>

      <div class="quote__content-wrapper" :style="containerStyle">
        <Transition name="fade-slide" mode="out-in">
          <div :key="currentSlide" class="quote__slide">
            <blockquote class="quote__text">
              "{{ slides[currentSlide].text }}"
            </blockquote>
            <cite class="quote__author">— {{ slides[currentSlide].author }}</cite>
          </div>
        </Transition>
      </div>

      <button @click="nextSlide" class="quote__nav-btn" aria-label="Siguiente">
        <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 6L51 12L45 18" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M51 12H10" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
        </svg>
      </button>

    </div>

    <div class="quote__dots" :style="dotsStyle">
      <button 
        v-for="(_, index) in slides" 
        :key="index" 
        @click="currentSlide = index"
        class="quote__dot"
        :class="{ 'quote__dot--active': currentSlide === index }"
      ></button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const sectionRef = ref(null)
const inProg = ref(0)
const outProg = ref(0)

const OFFSET = 40

function updateProgress() {
  if (!sectionRef.value) return
  const { top, bottom } = sectionRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  inProg.value = Math.max(0, Math.min(1, (vh - top) / (vh * 0.45)))
  outProg.value = Math.max(0, Math.min(1, bottom / (vh * 0.35)))
}

onMounted(() => {
  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})

const sectionStyle = computed(() => ({ opacity: Math.min(inProg.value, outProg.value) }))
const slideX = computed(() => OFFSET * (outProg.value - inProg.value))
const containerStyle = computed(() => ({ transform: `translateX(${slideX.value}px)` }))
const dotsStyle = computed(() => ({ transform: `translateX(${slideX.value * 0.5}px)` }))

const currentSlide = ref(0)

const slides = [
  {
    text: "Cita de Javi — corporal, precisa, sin hipérbole. Máximo 2-3 líneas. Pendiente de proceso de consentimiento.",
    author: "Javiera, co-fundadora Casa BE"
  },
  {
    text: "Un espacio necesario para volver al cuerpo y entender nuestros procesos desde la calma y la ciencia.",
    author: "participante taller de mayo"
  },
  {
    text: "Entrenar la capacidad de sentirte bien es una herramienta que me llevo para toda la vida.",
    author: "comunidad Casa BE"
  }
]

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}
</script>

<style scoped>
.quote {
  padding: 6rem 1.5rem;
  text-align: center;
  background-size: cover;
  background-position: center;
  background-color: #f2f1eb;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quote__container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
}

.quote__content-wrapper {
  flex: 1;
  max-width: 700px;
  min-height: 200px; /* Evita que el layout salte si un texto es más corto */
  display: flex;
  align-items: center;
  justify-content: center;
}

.quote__nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #394e3c;
  opacity: 0.4;
  transition: opacity 0.3s ease, transform 0.3s ease;
  flex-shrink: 0;
}

.quote__nav-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.quote__text {
  font-family: var(--font-serif, serif);
  ;
  font-weight: 300;
  font-size: clamp(1.4rem, 2.8vw, 2.2rem); 
  line-height: 1.4;
  color: #394e3c;
  margin-bottom: 1.5rem;
}

.quote__author {
  display: block;
  font-family: var(--font-sans, sans-serif);
  font-style: normal;
  font-size: 1rem;
  font-weight: 300;
  color: #394e3c;
  opacity: 0.8;
  letter-spacing: 0.06em;
 
}

/* Indicadores */
.quote__dots {
  display: flex;
  gap: 0.8rem;
  margin-top: 3rem;
}

.quote__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #394e3c;
  opacity: 0.2;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quote__dot--active {
  opacity: 1;
  transform: scale(1.3);
}

/* Animación de cambio de Slide */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsivo */
@media (max-width: 768px) {
  .quote__container {
    flex-direction: column;
  }
  .quote__nav-btn {
    display: none; /* Ocultamos flechas grandes en móvil para usar solo dots */
  }
  .quote__text {
    font-size: 1.5rem;
  }
}
</style>