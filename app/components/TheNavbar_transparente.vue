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
          <NuxtLink to="/nosotros" class="navbar__nav-link">Conoce Casa BE</NuxtLink>
          <NuxtLink to="/#entrenamiento" class="navbar__nav-link">Tu Entrenamiento</NuxtLink>
          <NuxtLink to="/fundacion" class="navbar__nav-link">Fundación BE</NuxtLink>
          <NuxtLink to="/tienda" class="navbar__nav-link">Tienda</NuxtLink>
          <NuxtLink to="/aprende" class="navbar__nav-link">Aprende más</NuxtLink>
          <NuxtLink to="/#contacto" class="navbar__nav-link">Conversemos</NuxtLink>
        </div>

        <a href="#talleres" class="navbar__cta">Ver próximo taller</a>
      </div>
    </div>

    <!-- Estado SCROLLED: barra compacta con hamburger -->
    <div class="navbar__compact">
      <button @click="toggleMenu" class="navbar__burger" aria-label="Abrir menú">
        <span class="navbar__line" :class="{ 'navbar__line--1-open': isMenuOpen, 'navbar__line--light': useLightBurger }"></span>
        <span class="navbar__line" :class="{ 'navbar__line--2-open': isMenuOpen, 'navbar__line--light': useLightBurger }"></span>
        <span class="navbar__line" :class="{ 'navbar__line--3-open': isMenuOpen, 'navbar__line--light': useLightBurger }"></span>
      </button>

      <NuxtLink to="/" class="navbar__logo-link">
        <img src="/images/logo_be.png" alt="Casa BE" class="navbar__logo" />
      </NuxtLink>
    </div>

    <!-- Overlay menú fullscreen -->
    <div class="navbar__overlay" :class="{ 'navbar__overlay--open': isMenuOpen }">
      <div class="navbar__menu">
        <NuxtLink to="/nosotros" class="navbar__overlay-link" @click="toggleMenu">Conoce Casa BE</NuxtLink>
        <NuxtLink to="/#entrenamiento" class="navbar__overlay-link" @click="toggleMenu">Tu Entrenamiento</NuxtLink>
        <NuxtLink to="/fundacion" class="navbar__overlay-link" @click="toggleMenu">Fundación BE</NuxtLink>
        <NuxtLink to="/tienda" class="navbar__overlay-link" @click="toggleMenu">Tienda</NuxtLink>
        <NuxtLink to="/aprende" class="navbar__overlay-link" @click="toggleMenu">Aprende más</NuxtLink>
        <NuxtLink to="/#contacto" class="navbar__overlay-link" @click="toggleMenu">Conversemos</NuxtLink>
      </div>
    </div>

  </nav>
</template>

<script setup>
const isMenuOpen = ref(false)
const isScrolled = ref(false)
const isOverDarkSection = ref(true)

let threshold = 0
let sectionObserver = null

function onScroll() {
  isScrolled.value = window.scrollY > threshold
}

function setThreshold() {
  threshold = window.innerHeight * 0.85
  onScroll()
}

const useLightBurger = computed(() => !isScrolled.value || isOverDarkSection.value)

onMounted(() => {
  setThreshold()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', setThreshold, { passive: true })

  sectionObserver = new IntersectionObserver(
    (entries) => {
      isOverDarkSection.value = entries.some(e => e.isIntersecting)
    },
    { threshold: 0.05 }
  )
  const darkEls = [
    document.querySelector('.hero-custom'),
    document.querySelector('.footer')
  ]
  darkEls.forEach(el => el && sectionObserver.observe(el))
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', setThreshold)
  sectionObserver?.disconnect()
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
  display: flex;
  align-items: center;
  gap: 2rem;
}

.navbar__brand {
  display: block;
  height: 32px;
  flex-shrink: 0;
  margin-right: 1rem;
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
  flex: 1;
}

.navbar__nav-link {
  font-family: var(--font-sans, sans-serif);
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

.navbar__cta {
  margin-left: auto;
  flex-shrink: 0;
  font-family: var(--font-sans, sans-serif);
  font-size: 0.9rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  border-radius: 100px;
  padding: 0.5rem 1.4rem;
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
  white-space: nowrap;
}
.navbar__cta:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: #fff;
  color: #fff;
}

/* ── COMPACT NAV (scrolled state) ── */
.navbar__compact {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem 2.5rem;
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

.navbar__burger {
  position: relative;
  z-index: 60;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px;
}

.navbar__line {
  display: block;
  width: 28px;
  height: 1.5px;
  border-radius: 2px;
  background-color: #394e3c;
  transition: transform 0.35s ease, opacity 0.35s ease, background-color 0.3s ease;
}
.navbar__line--light {
  background-color: rgba(255, 255, 255, 0.9);
}
.navbar__line--1-open {
  transform: rotate(45deg) translate(5.5px, 5.5px);
}
.navbar__line--2-open {
  opacity: 0;
  transform: translateX(8px);
}
.navbar__line--3-open {
  transform: rotate(-45deg) translate(5.5px, -5.5px);
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
  font-family: var(--font-sans, sans-serif);
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
  .navbar__line {
    background-color: rgba(255, 255, 255, 0.9);
  }
  .navbar--solid .navbar__line:not(.navbar__line--light) {
    background-color: #394e3c;
  }
}
</style>
