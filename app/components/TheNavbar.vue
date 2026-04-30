<template>
  <nav
    class="navbar"
    :class="{ 'navbar--solid': isScrolled, 'navbar--menu-open': isMenuOpen, 'navbar--chat': isChat }"
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
          <button class="navbar__cart-btn" @click="cart.isOpen.value = true" aria-label="Ver carrito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.2"/>
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="cart.totalItems.value > 0" class="navbar__cart-badge">{{ cart.totalItems }}</span>
          </button>
          <div v-if="user" class="navbar__account" @mouseenter="dropdownOpen = true" @mouseleave="dropdownOpen = false">
            <button class="navbar__nav-link navbar__account-btn">Mi cuenta</button>
            <div class="navbar__dropdown" :class="{ 'navbar__dropdown--open': dropdownOpen }">
              <div class="navbar__dropdown-inner">
                <span class="navbar__dropdown-email">{{ user.email }}</span>
                <NuxtLink to="/mi-cuenta" class="navbar__dropdown-link">Mi cuenta</NuxtLink>
                <button class="navbar__dropdown-logout" @click="handleLogout">Cerrar sesión</button>
              </div>
            </div>
          </div>
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

      <button class="navbar__cart-compact" @click="cart.isOpen.value = true" aria-label="Ver carrito">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.2"/>
          <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span v-if="cart.totalItems.value > 0" class="navbar__cart-badge-compact">{{ cart.totalItems }}</span>
      </button>
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
        <template v-if="user">
          <span class="navbar__overlay-email">{{ user.email }}</span>
          <NuxtLink to="/mi-cuenta" class="navbar__overlay-link" @click="toggleMenu">Mi cuenta</NuxtLink>
          <button class="navbar__overlay-link navbar__overlay-logout" @click="handleLogout">Cerrar sesión</button>
        </template>
        <NuxtLink v-else to="/login" class="navbar__overlay-link" @click="toggleMenu">Ingresar</NuxtLink>
      </div>
    </div>

  </nav>
</template>

<script setup>
const { user, logout } = useAuth()
const cart = useCart()
const router = useRouter()

const route        = useRoute()
const isMenuOpen   = ref(false)
const isScrolled   = ref(false)
const dropdownOpen = ref(false)
const isChat = computed(() => route.path === '/conversemos' || route.path === '/mi-cuenta')

async function handleLogout() {
  await logout()
  dropdownOpen.value = false
  isMenuOpen.value   = false
  document.body.style.overflow = 'auto'
  router.push('/')
}

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
  z-index: 200;
}
.navbar--chat {
  background-color: #2a3d2c;
}
.navbar--chat .navbar__nav-link,
.navbar--chat .navbar__account-btn {
  color: rgba(255, 255, 255, 0.8) !important;
}
.navbar--chat .navbar__nav-link:hover,
.navbar--chat .navbar__account-btn:hover {
  color: #ffffff !important;
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
  align-items: center;
  justify-content: flex-end;
  gap: 1.25rem;
}

/* Cart icon — desktop */
.navbar__cart-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s ease;
}
.navbar__cart-btn:hover { color: #ffffff; }
.navbar--chat .navbar__cart-btn { color: rgba(255, 255, 255, 0.8); }
.navbar--chat .navbar__cart-btn:hover { color: #ffffff; }

.navbar__cart-badge {
  position: absolute;
  top: -7px;
  right: -9px;
  background-color: #394e3c;
  color: #f2f1eb;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Cart icon — mobile compact */
.navbar__cart-compact {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  color: #394e3c;
  display: flex;
  align-items: center;
  padding: 0;
  z-index: 60;
}

.navbar__cart-badge-compact {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: #394e3c;
  color: #f2f1eb;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* ── ACCOUNT DROPDOWN ── */
.navbar__account {
  position: relative;
}
.navbar__account-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.navbar__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  padding-top: 0.75rem;
  background: transparent;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 100;
}

.navbar__dropdown-inner {
  background: #fff;
  border: 1px solid rgba(57, 78, 60, 0.12);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.navbar__dropdown--open {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.navbar__dropdown-email {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #394e3c;
  opacity: 0.6;
  word-break: break-all;
}
.navbar__dropdown-link {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #394e3c;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.navbar__dropdown-link:hover { opacity: 1; }

.navbar__dropdown-logout {
  background: none;
  border: none;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #394e3c;
  cursor: pointer;
  padding: 0;
  text-align: left;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.navbar__dropdown-logout:hover { opacity: 1; }

/* ── OVERLAY EMAIL / LOGOUT ── */
.navbar__overlay-email {
  font-family: 'Acumin Concept', sans-serif;
  font-size: clamp(0.9rem, 2vw, 1.2rem);
  color: #394e3c;
  opacity: 0.45;
  word-break: break-all;
  text-align: center;
}
.navbar__overlay-logout {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
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
