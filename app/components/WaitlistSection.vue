<template>
  <section ref="sectionRef" class="waitlist" :style="{ backgroundImage: `url('/images/fondo_gris_3.png')`, ...sectionStyle }">
    <div class="waitlist__inner">
      <div class="waitlist__left" :style="leftStyle">
        <p class="waitlist__text">
          Si el momento no es ahora, déjanos saber<br />
          cuando abra el siguiente taller.
        </p>
        <p class="waitlist__sub">Sin spam. Solo cuando hay algo real que contarte.</p>
      </div>
      
      <form class="waitlist__right" @submit.prevent="registrarMail" :style="rightStyle">
        
        <input 
          type="email" 
          v-model="email" 
          placeholder="Tu mail" 
          class="waitlist__input" 
          required 
        />
        
        <button type="submit" class="waitlist__btn" :disabled="loading">
          <img src="/images/flecha_linea.png" alt="Enviar" class="waitlist__arrow" :style="{ opacity: loading ? 0.4 : 1 }" />
        </button>

      </form>
      <p v-if="message" class="waitlist__message" :style="leftStyle">{{ message }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const sectionRef = ref(null)
const inProg = ref(0)
const outProg = ref(0)

const OFFSET = 60

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
const leftStyle = computed(() => ({ transform: `translateX(${slideX.value}px)` }))
const rightStyle = computed(() => ({ transform: `translateX(${slideX.value * 0.7}px)` }))

const email   = ref('')
const loading = ref(false)
const message = ref('')

const registrarMail = async () => {
  if (loading.value) return
  loading.value = true
  message.value = ''

  try {
    const res = await fetch('/api/waitlist', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email.value }),
    })
    const data = await res.json()

    if (!res.ok) throw new Error(data.statusMessage || 'Error')

    message.value = data.already
      ? 'Ya estás en la lista.'
      : '¡Listo! Te avisamos cuando abra el siguiente taller.'
    email.value = ''
  } catch {
    message.value = 'Algo salió mal. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* CONFIGURACIÓN GLOBAL DE FUENTE */
.waitlist {
  padding: 5rem 2rem;
  background-size: cover;
  background-position: center;
  background-color: #f2f1eb;
  font-family: var(--font-inter);
}

.waitlist__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
}

.waitlist__text {
  font-family: var(--font-inter);
  font-weight: 300;
  font-size: clamp(2rem, 5.4vw, 2.15rem); 
  line-height: 1.3;
  color: #394e3c;
}

.waitlist__sub {
  font-family: var(--font-inter);
  font-size: 1.4rem;
  font-weight: 300;
  color: #394e3c;
  opacity: 0.8;
  margin-top: 1rem;
}

/* EL FORMULARIO (Mantiene la posición ancla) */
.waitlist__right {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* NUEVO ESTILO: El campo para escribir */
.waitlist__input {
  position: absolute;
  z-index: 2; /* Por encima de la flecha */
  left: 20px; /* Ajusta esto para mover el texto sobre la línea */
  top: 50%;
  transform: translateY(-50%);
  width: 220px; /* Espacio para escribir un correo largo */
  
  /* Quitamos estilos feos de los inputs por defecto */
  background: transparent;
  border: none;
  outline: none; /* Quita el borde azul al hacer clic */
  
  /* Estética del texto */
  font-family: var(--font-inter);
  font-size: 1.6rem;
  font-weight: 300; /* Inter Light */
  color: #ffffff;
}

/* Estilo para el texto "Tu mail" cuando está vacío */
.waitlist__input::placeholder {
  color: rgba(255, 255, 255, 0.8); /* Blanco ligeramente transparente */
}

/* NUEVO ESTILO: El botón invisible que envuelve la flecha */
.waitlist__btn {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  z-index: 1; /* Por debajo del texto */
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Efecto hover: la flecha avanza un poquito cuando pasas el mouse */
.waitlist__btn:hover {
  opacity: 0.8;
  transform: translateX(5px); 
}

.waitlist__arrow {
  width: 350px;
  height: auto;
  object-fit: contain;
  display: block; /* Evita márgenes fantasma debajo de las imágenes */
}

.waitlist__message {
  font-family: var(--font-inter);
  font-size: 1rem;
  font-weight: 300;
  color: #394e3c;
  margin-top: 1.5rem;
  width: 100%;
}

/* RESPONSIVO */
@media (max-width: 1024px) {
  .waitlist__inner {
    flex-direction: column;
    text-align: center;
  }
  .waitlist__right {
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .waitlist__text {
    font-size: 2.2rem;
  }
  .waitlist__sub {
    font-size: 1.5rem;
  }
  .waitlist__arrow {
    width: 200px;
  }
  .waitlist__input {
    font-size: 1.3rem;
    width: 150px;
    left: 10px; /* Se ajusta el texto en móviles */
  }
}
</style>