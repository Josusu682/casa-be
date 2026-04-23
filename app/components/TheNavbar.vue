<template>
  <nav
    class="navbar"
    :class="{ 'navbar--solid': isScrolled, 'navbar--menu-open': isMenuOpen }"
  >

    <!-- Estado TOP: barra completa con links -->
    <div class="navbar__full">
      <div class="navbar__full-inner">
        <NuxtLink to="/" class="navbar__brand">
          <img src="/images/logo_be.png" alt="Casa BE" class="navbar__brand-img" />
        </NuxtLink>

        <div class="navbar__links">
          <NuxtLink to="/" class="navbar__nav-link">Conoce Casa BE</NuxtLink>
          <NuxtLink to="/entrenamiento" class="navbar__nav-link">Tu Entrenamiento</NuxtLink>
          <NuxtLink to="/fundacion" class="navbar__nav-link">Fundación BE</NuxtLink>
          <NuxtLink to="/tienda" class="navbar__nav-link">Tienda</NuxtLink>
          <NuxtLink to="/aprende" class="navbar__nav-link">Aprende más</NuxtLink>
          <NuxtLink to="/conversemos" class="navbar__nav-link">Conversemos</NuxtLink>
        </div>
        <div class="navbar__auth">
          <NuxtLink v-if="user" to="/mi-cuenta" class="navbar__nav-link">Mi cuenta</NuxtLink>
          <NuxtLink v-else to="/login" class="navbar__nav-link">Ingresar</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Estado SCROLLED: barra compacta con hamburger -->
    <div class="navbar__compact">
      <button
        @click="toggleMenu"
        class="relative z-[60] flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none"
        aria-label="Abrir menú"
      >
        <div
          class="w-10 h-[4px] rounded-full transition-all duration-300 bg-[#394e3c]"
          :class="isMenuOpen ? 'rotate-45 translate-y-[8px]' : ''"
        ></div>
        <div
          class="w-10 h-[4px] rounded-full transition-all duration-300 bg-[#394e3c]"
          :class="isMenuOpen ? 'opacity-0 translate-x-4' : ''"
        ></div>
        <div
          class="w-10 h-[4px] rounded-full transition-all duration-300 bg-[#394e3c]"
          :class="isMenuOpen ? '-rotate-45 -translate-y-[8px]' : ''"
        ></div>
      </button>

      <NuxtLink to="/" class="navbar__logo-link">
        <img src="/images/logo_be.png" alt="Casa BE" class="navbar__logo" />
      </NuxtLink>
    </div>

    <!-- Overlay menú fullscreen -->
    <div class="navbar__overlay" :class="{ 'navbar__overlay--open': isMenuOpen }">
      <div class="navbar__menu">
        <NuxtLink to="/" class="navbar__overlay-link" @click="toggleMenu">Conoce Casa BE</NuxtLink>
        <NuxtLink to="/entrenamiento" class="navbar__overlay-link" @click="toggleMenu">Tu Entrenamiento</NuxtLink>
        <NuxtLink to="/fundacion" class="navbar__overlay-link" @click="toggleMenu">Fundación BE</NuxtLink>
        <NuxtLink to="/tienda" class="navbar__overlay-link" @click="toggleMenu">Tienda</NuxtLink>
        <NuxtLink to="/aprende" class="navbar__overlay-link" @click="toggleMenu">Aprende más</NuxtLink>
        <NuxtLink to="/conversemos" class="navbar__overlay-link" @click="toggleMenu">Conversemos</NuxtLink>
        <NuxtLink v-if="user" to="/mi-cuenta" class="navbar__overlay-link" @click="toggleMenu">Mi cuenta</NuxtLink>
        <NuxtLink v-else to="/login" class="navbar__overlay-link" @click="toggleMenu">Ingresar</NuxtLink>
      </div>
    </div>

  </nav>
</template>

<script setup>
const { user } = useAuth()

const isMenuOpen = ref(false)
const isScrolled = ref(false)

let threshold = 0

function onScroll() {
  isScrolled.value = window.scrollY > threshold
}

function setThreshold() {
  threshold = window.innerHeight * 0.85
  onScroll()
}

onMounted(() => {
  setThreshold()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', setThreshold, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', setThreshold)
  document.body.style.overflow = 'auto'
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : 'auto'
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
}

/* ── FULL NAV (top state) ── */
.navbar__full {
  padding: 1.4rem 2.5rem;
  transition: opacity 0.35s ease, transform 0.35s ease;
  opacity: 1;
  pointer-events: auto;
}
.navbar--solid .navbar__full {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-8px);
}

.navbar__full-inner {
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.navbar__brand {
  display: block;
  height: 56px;
  flex-shrink: 0;
}
.navbar__brand-img {
  height: 100%;
  width: auto;
  object-fit: contain;
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: 2rem;
  justify-content: center;
}

.navbar__auth {
  display: flex;
  justify-content: flex-end;
}

.navbar__nav-link {
  font-family: 'Acumin', sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  white-space: nowrap;
  letter-spacing: 0.02em;
  transition: color 0.2s ease;
}
.navbar__nav-link:hover {
  color: #ffffff;
}

/* ── COMPACT NAV (scrolled state) ── */
.navbar__compact {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0.5rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: opacity 0.35s ease, transform 0.35s ease;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-8px);
}
.navbar--solid .navbar__compact {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.navbar__logo-link {
  position: relative;
  z-index: 60;
  height: 32px;
  display: block;
}
.navbar__logo {
  height: 100%;
  width: auto;
  object-fit: contain;
}

/* ── OVERLAY MENU ── */
.navbar__overlay {
  position: fixed;
  inset: 0;
  z-index: 55;
  background-color: #f2f1eb;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-100%);
  transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
}
.navbar__overlay--open {
  transform: translateY(0);
}

.navbar__menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

.navbar__overlay-link {
  font-family: 'Acumin', sans-serif;
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 300;
  color: #394e3c;
  text-decoration: none;
  transition: opacity 0.3s ease;
}
.navbar__overlay-link:hover {
  opacity: 0.5;
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .navbar__full {
    display: none;
  }
  .navbar__compact {
    opacity: 1 !important;
    pointer-events: auto !important;
    transform: translateY(0) !important;
    background-color: transparent;
    box-shadow: none;
  }
}
</style>
