<template>
  <section class="hero">
    <img src="/images/image_1.png" alt="Casa BE" class="hero__photo" />
    <img src="/images/filtro_imagen.png" alt="" class="hero__overlay" />
    <div class="hero__cta-wrap">
      <a href="#" class="hero__btn">
        <img src="/images/sombra.png" alt="" class="hero__btn-shadow" />
        <span class="hero__btn-inner">
          <img src="/images/borde.png" alt="" class="hero__btn-border" />
          <span class="hero__btn-text">¿Por dónde te quieres mover?</span>
          <img src="/images/desplegable.png" alt="" class="hero__btn-arrow" />
        </span>
      </a>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: 68vh;
  min-height: 520px;
  overflow: hidden;
}
.hero__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
}
.hero__overlay {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: auto;
  pointer-events: none;
  opacity: 0.85;
}
.hero__cta-wrap {
  position: absolute;
  bottom: 3.5rem;
  right: 3rem;
}
.hero__btn {
  position: relative;
  display: inline-block;
  cursor: pointer;
}
.hero__btn-shadow {
  position: absolute;
  inset: 3px 0 -3px 0;
  width: 100%;
  height: 100%;
  opacity: 0.35;
}
.hero__btn-inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  z-index: 1;
}
.hero__btn-border {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.hero__btn-text {
  position: relative;
  z-index: 2;
  font-family: var(--font-sans);
  font-weight: 300;
  font-size: 0.75rem;
  color: var(--white);
  letter-spacing: 0.02em;
  padding: 0.55rem 1.4rem;
  white-space: nowrap;
}
.hero__btn-arrow {
  position: relative;
  z-index: 2;
  width: 10px;
  height: auto;
  margin-right: 0.8rem;
}

@media (max-width: 768px) {
  .hero__cta-wrap { right: 50%; transform: translateX(50%); }
}
</style>
