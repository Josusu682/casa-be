<template>
  <section class="course">
    <div class="course__img-wrap">
      <img src="/images/dedo.png" alt="Probablemente en el Cuerpo" class="course__img" />
    </div>

    <div class="course__content" :style="{ backgroundImage: `url('/images/fondo_2.png')` }">
      <span class="course__meta-label">PRÓXIMO TALLER</span>
      
      <h2 class="course__title">{{ title }}</h2>
      
      <p class="course__desc">{{ description }}</p>

      <div class="course__badges">
        <span class="badge" v-for="(badge, i) in badges" :key="i">
          <img :src="badge.icon" alt="" class="badge__icon" />
          {{ badge.text }}
        </span>
      </div>

      <div class="course__actions">
        <a href="#" class="course__btn">
          <span>Reservar mi lugar</span>
        </a>
        <a href="#" class="course__btn course__btn--ghost">
          <span>Quiero recibir más info</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('Entender(te) en el Cuerpo')
const description = ref(
  'En 3 horas vas a entender por primera vez por qué tu cuerpo responde como responde — y vas a experimentar herramientas concretas para atravesarlo diferente.'
)
const badges = ref([
  { icon: '/images/ubi.png', text: 'CASA BE' },
  { icon: '/images/clock.png', text: '10:00 HRS AM duración: 3 horas' },
  { icon: '/images/home.png', text: 'FORMATO PRESENCIAL Máx. 12 personas' },
])
</script>

<style scoped>
/* Estructura Principal */
.course {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 500px;
  background-color: #fff;
}

.course__img-wrap {
  overflow: hidden;
}

.course__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course__content {
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-size: cover;
  background-position: center;
}

/* Tipografía y Colores (#394e3c) */
.course__meta-label {
  display: block;
  font-family: var(--font-sans, sans-serif);
  font-size: 1.2rem; /* Duplicado */
  letter-spacing: 0.2em;
  color: #394e3c;
  font-weight: 400;
  margin-bottom: 1rem;
}

.course__title {
  font-family: var(--font-serif, serif);
  font-weight: 300;
  font-size: 2.9rem; /* Duplicado */
  line-height: 1.2;
  color: #394e3c;
  margin-bottom: 1.5rem;
}

.course__desc {
  font-family: var(--font-sans, sans-serif);
  font-size: 1.52rem; /* Duplicado */
  font-weight: 300;
  color: #394e3c;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 650px;
}

/* Badges / Detalles */
.course__badges {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 2.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  font-family: var(--font-sans, sans-serif);
  font-size: 1.2rem; /* Duplicado */
  font-weight: 400;
  color: #394e3c;
}

.badge__icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* Botones con Bordes CSS (Sin imágenes) */
.course__actions {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.course__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 1.5px solid #000000; /* Borde negro */
  border-radius: 100px;
  transition: all 0.3s ease;
  background-color: transparent;
}

.course__btn span {
  font-family: var(--font-sans, sans-serif);
  font-size: 1.36rem; /* Duplicado */
  font-weight: 400;
  color: #394e3c;
  padding: 0.8rem 2.5rem;
  white-space: nowrap;
}

/* Efectos de Interacción */
.course__btn:hover {
  background-color: #394e3c;
  border-color: #394e3c;
}

.course__btn:hover span {
  color: #ffffff;
}

.course__btn--ghost {
  border-color: #394e3c; /* Borde color corporativo para el secundario */
}

/* Responsivo */
@media (max-width: 1024px) {
  .course__title { font-size: 2.2rem; }
  .course__desc { font-size: 1.2rem; }
}

@media (max-width: 768px) {
  .course { grid-template-columns: 1fr; }
  .course__img-wrap { height: 350px; }
  .course__content { padding: 3rem 1.5rem; }
  .course__actions { flex-direction: column; }
}
</style>