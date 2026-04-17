<template>
  <footer class="footer" :style="{ backgroundImage: `url('/images/fondo_verde.png')` }">
    <div class="footer__inner">
      <div class="footer__left">
        <img src="/images/icono_2.png" alt="Casa BE" class="footer__logo" />
        <p class="footer__address">&copy; Casa BE 2026 • Santiago, Chile</p>
      </div>
      <div class="footer__right">
        <div class="footer__col">
          <a href="#" class="footer__link">Conoce Casa BE</a>
          <a href="#" class="footer__link">Tu Entrenamiento</a>
          <a href="#" class="footer__link">Fundación BE</a>
        </div>
        <div class="footer__col">
          <a href="#" class="footer__link footer__link--highlight">Tienda</a>
          <a href="#" class="footer__link">Aprende más</a>
          <a href="#" class="footer__link">Conversemos</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background-color: var(--sage);
  background-size: cover;
  background-position: center;
  color: var(--cream);
  padding: 3.5rem 2.5rem 2.5rem;
}
.footer__inner {
  max-width: var(--max-w);
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}
.footer__logo {
  width: 100px;
  height: auto;
  margin-bottom: 1rem;
  filter: brightness(2.5);
}
.footer__address {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 300;
  color: rgba(236,232,225,0.6);
  margin-top: 0.5rem;
}
.footer__right {
  display: flex;
  gap: 3.5rem;
}
.footer__col {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.footer__link {
  font-family: var(--font-sans);
  font-size: 1.2rem;
  font-weight: 300;
  color: rgba(236,232,225,0.7);
  transition: var(--transition);
}
.footer__link:hover { color: var(--cream); }
.footer__link--highlight {
  color: var(--cream);
  font-weight: 500;
}

@media (max-width: 768px) {
  .footer__inner { flex-direction: column; }
  .footer__right { gap: 2rem; }
}
</style>
