<template>
  <section class="value" :style="{ backgroundImage: `url('/images/fondo_gris.png')` }">
    <div class="value__inner">
      <h1 class="value__heading">
        Un espacio para entrenar tu<br />capacidad de sentirte bien.
      </h1>
      <p class="value__body">
        No prometemos que la experiencia lo cambiará todo — trabajamos, en encontrarte,
        con lo que necesitás, como espacio, y está en vos crecer. Porque eso es enfocarse.
        Y eso es lo que hacés, eso lo que ofrecemos.
      </p>
      <p class="value__tagline">Entrenamos tu capacidad de sentirte bien.</p>
      <a href="#" class="value__btn">
        <img src="/images/boton_conoce.png" alt="" class="value__btn-bg" />
        <span class="value__btn-text">Conoce Casa BE</span>
      </a>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.value {
  padding: 5rem 1.5rem 5.5rem;
  text-align: center;
  background-size: cover;
  background-position: center;
}
.value__inner {
  max-width: 540px;
  margin: 0 auto;
}
.value__heading {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  line-height: 1.35;
  color: var(--text);
  margin-bottom: 1.6rem;
}
.value__body {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 300;
  color: var(--text-mid);
  line-height: 1.75;
  margin-bottom: 0.5rem;
}
.value__tagline {
  font-family: var(--font-sans);
  font-size: 0.76rem;
  font-weight: 300;
  color: var(--text-light);
  margin-bottom: 2.2rem;
}

.value__btn {
  display: inline-block;
  position: relative;
  cursor: pointer;
}
.value__btn-bg {
  width: 180px;
  height: auto;
}
.value__btn-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--white);
  letter-spacing: 0.03em;
}
</style>
