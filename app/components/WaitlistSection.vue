<template>
  <section class="waitlist" :style="{ backgroundImage: `url('/images/fondo_gris_3.png')` }">
    <div class="waitlist__inner">
      <div class="waitlist__left">
        <p class="waitlist__text">
          Si el momento no es ahora, déjanos saber<br />
          cuando abra el siguiente taller.
        </p>
        <p class="waitlist__sub">Sin spam. Solo cuando hay algo real que contarte.</p>
      </div>
      <div class="waitlist__right">
        <a href="#" class="waitlist__link">Tú email</a>
        <img src="/images/flecha_linea.png" alt="" class="waitlist__arrow" />
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
/* CONFIGURACIÓN GLOBAL DE FUENTE */
.waitlist {
  padding: 5rem 2rem;
  background-size: cover;
  background-position: center;
  background-color: #f2f1eb;
  /* Aplicamos Acumin Concept como base para la sección */
  font-family: 'Acumin Concept', sans-serif;
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
  /* Mantenemos el estilo italic pero con la nueva fuente */
  font-family: 'Acumin Concept', sans-serif;

  font-weight: 300;
  font-size: clamp(2rem, 5.4vw, 2.15rem); 
  line-height: 1.3;
  color: #394e3c;
}

.waitlist__sub {
  font-family: 'Acumin Concept';
  font-size: 1.4rem;
  font-weight: 300;
  color: #394e3c;
  opacity: 0.8;
  margin-top: 1rem;
}

.waitlist__link {
  font-family: 'Acumin Concept';
  font-size: 1.6rem;
  font-weight: 500;
  color: #394e3c;
  text-decoration: underline;
  text-underline-offset: 8px;
  white-space: nowrap;
  transition: opacity 0.3s ease;
}

.waitlist__link:hover {
  opacity: 0.7;
}

.waitlist__right {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  flex-shrink: 0;
}

.waitlist__arrow {
  width: 350px;
  height: auto;
  object-fit: contain;
  opacity: 0.8;
}

/* RESPONSIVO */
@media (max-width: 1024px) {
  .waitlist__inner {
    flex-direction: column;
    text-align: center;
  }
  .waitlist__right {
    justify-content: center;
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .waitlist__text {
    font-size: 2.2rem;
  }
  .waitlist__sub, .waitlist__link {
    font-size: 1.5rem;
  }
  .waitlist__arrow {
    width: 200px;
  }
}
</style>