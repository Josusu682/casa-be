<template>
  <section class="quote" :style="{ backgroundImage: `url('/images/fondo_gris_2.png')` }">
    <blockquote class="quote__text">
      "Guía de Jade — corporal, cerebral, sin<br />
      hipérbole. Máximo 2-3 líneas. Pendiente de<br />
      proceso de consentimiento."
    </blockquote>
    <cite class="quote__author">— alumna frecuente de Casa BE</cite>
  </section>
</template>

<script setup>
</script>

<style scoped>
.quote {
  padding: 5.5rem 1.5rem;
  text-align: center;
  background-size: cover;
  background-position: center;
}
.quote__text {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(1.1rem, 2.4vw, 1.5rem);
  line-height: 1.55;
  color: var(--text);
  max-width: 600px;
  margin: 0 auto 1.2rem;
}
.quote__author {
  display: block;
  font-family: var(--font-sans);
  font-style: normal;
  font-size: 0.68rem;
  font-weight: 300;
  color: var(--text-light);
  letter-spacing: 0.04em;
}
</style>
