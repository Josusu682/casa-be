<template>
  <section class="course">
    <div class="course__img-wrap">
      <img src="/images/dedo.png" alt="Probablemente en el Cuerpo" class="course__img" />
    </div>
    <div class="course__content" :style="{ backgroundImage: `url('/images/fondo_2.png')` }">
      <span class="course__meta-label">PRÓXIMO TALLER</span>
      <div class="course__days">
        <div class="course__days-frame">
          <img src="/images/marco.png" alt="" class="course__marco" />
          <span class="course__days-num">{{ daysLeft }}</span>
        </div>
        <span class="course__days-unit">días</span>
      </div>
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
          <img src="/images/borde_2.png" alt="" class="course__btn-border" />
          <span>Reservar bien</span>
        </a>
        <a href="#" class="course__btn course__btn--ghost">
          <img src="/images/borde_2.png" alt="" class="course__btn-border" />
          <span>Quiero más info</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const daysLeft = ref(14)
const title = ref('Probablemente en el Cuerpo')
const description = ref(
  'Lo básico es entender por primera vez por qué tu cuerpo aparece como espacio — y está a experimentar cómo moverse. Como-real en el espacio diferente.'
)
const badges = ref([
  { icon: '/images/home.png', text: 'CASA BE' },
  { icon: '/images/clock.png', text: 'EN LÍNEA · Casa De Bienes' },
  { icon: '/images/ubi.png', text: 'Mín. 1 por persona' },
])
</script>

<style scoped>
.course {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 460px;
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
  padding: 3.2rem 3rem 3.2rem 3.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-size: cover;
  background-position: center;
}
.course__meta-label {
  display: block;
  font-family: var(--font-sans);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: var(--text-light);
  font-weight: 400;
  margin-bottom: 0.8rem;
}
.course__days {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.course__days-frame {
  position: relative;
  width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.course__marco {
  width: 100%;
  height: auto;
}
.course__days-num {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  font-family: var(--font-serif);
  font-size: 2.8rem;
  font-weight: 300;
  line-height: 1;
  color: var(--text);
}
.course__days-unit {
  font-family: var(--font-sans);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: var(--text-light);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.course__title {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: 1.45rem;
  line-height: 1.25;
  color: var(--text);
  margin-bottom: 0.9rem;
}
.course__desc {
  font-family: var(--font-sans);
  font-size: 0.76rem;
  font-weight: 300;
  color: var(--text-mid);
  line-height: 1.7;
  margin-bottom: 1.4rem;
  max-width: 360px;
}

.course__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.9rem;
  margin-bottom: 1.6rem;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-sans);
  font-size: 0.6rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--text-mid);
}
.badge__icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.course__actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}
.course__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}
.course__btn-border {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}
.course__btn span {
  position: relative;
  z-index: 1;
  font-family: var(--font-sans);
  font-size: 0.68rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--text);
  padding: 0.45rem 1.4rem;
  white-space: nowrap;
}
.course__btn:hover { opacity: 0.75; }
.course__btn--ghost span { color: var(--text-light); }

@media (max-width: 768px) {
  .course { grid-template-columns: 1fr; }
  .course__img-wrap { height: 300px; }
  .course__content { padding: 2.5rem 1.5rem; }
}
</style>
