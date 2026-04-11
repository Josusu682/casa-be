<template>
  <section class="waitlist" :style="{ backgroundImage: `url('/images/fondo_gris_3.png')` }">
    <div class="waitlist__inner">
      <div class="waitlist__left">
        <p class="waitlist__text">
          Si el momento no es ahora, déjanos saber<br />
          cuando abra el siguiente taller.
        </p>
        <p class="waitlist__sub">Es para todos los que quieran una cartera.</p>
      </div>
      <div class="waitlist__right">
        <a href="#" class="waitlist__link">Tómate</a>
        <img src="/images/flecha_linea.png" alt="" class="waitlist__arrow" />
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.waitlist {
  padding: 3rem 2rem;
  background-size: cover;
  background-position: center;
}
.waitlist__inner {
  max-width: var(--max-w);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}
.waitlist__text {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(0.9rem, 1.8vw, 1.05rem);
  line-height: 1.55;
  color: var(--text);
}
.waitlist__sub {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 300;
  color: var(--text-light);
  margin-top: 0.25rem;
}
.waitlist__link {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text);
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;
}
.waitlist__right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}
.waitlist__arrow {
  width: 200px;
  height: auto;
  object-fit: contain;
}

@media (max-width: 768px) {
  .waitlist__inner { flex-direction: column; text-align: center; }
  .waitlist__right { justify-content: center; }
  .waitlist__arrow { width: 140px; }
}
</style>
