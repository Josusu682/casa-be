    <!-- NO UTILIZADO TODAVIA -->
<template>
  <header class="nav">
    <button class="nav__hamburger" aria-label="Menú">
      <span></span><span></span><span></span>
    </button>
    <a href="/" class="nav__logo">
      <img src="/images/logo_be.png" alt="Casa BE" class="nav__logo-img" />
    </a>
  </header>
</template>

<script setup>
</script>

<style scoped>
.nav {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.6rem 2rem;
}

.nav__hamburger {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 6px 4px;
}
.nav__hamburger span {
  display: block;
  width: 24px;
  height: 1.5px;
  background: var(--white);
  transition: var(--transition);
}

.nav__logo-img {
  width: 56px;
  height: auto;
}

@media (max-width: 768px) {
  .nav { padding: 1.2rem 1.2rem; }
}
</style>
