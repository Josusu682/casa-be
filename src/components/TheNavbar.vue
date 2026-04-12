    <!-- NO UTILIZADO TODAVIA -->
<template>
  <header
    class="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-white/20"
    :class="[
      scrolled ? '-translate-y-full' : 'translate-y-0',
      navbarMobileOpened ? 'bg-white border-none' : 'bg-white/30'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">

       

        <nav class="hidden md:flex items-center space-x-10" :class="{ 'hidden': navbarMobileOpened }">
          <NuxtLink to="/precios" class="text-white hover:text-gray-200 font-medium tracking-wide transition-colors drop-shadow-md">
            Precios
          </NuxtLink>
          <NuxtLink to="/nosotros" class="text-white hover:text-gray-200 font-medium tracking-wide transition-colors drop-shadow-md">
            Nosotros
          </NuxtLink>
        </nav>

        <div class="flex items-center z-[60]">
          <NuxtLink 
            to="/" 
            class="flex-shrink-0 text-3xl font-light transition-colors drop-shadow-md"
            :class="navbarMobileOpened ? 'text-gray-800' : 'text-white'"
          >
            be.
          </NuxtLink>
        </div>

      </div>
    </div>

    <div
      class="absolute top-0 left-0 block w-screen h-screen transition-all duration-500 transform bg-white"
      :class="navbarMobileOpened ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'"
    >
      <div class="flex flex-col items-center justify-center h-full text-2xl gap-8 text-gray-800 font-medium">
        <NuxtLink to="/" class="hover:text-gray-500 transition-colors" @click="toggleMenu">Inicio</NuxtLink>
        <NuxtLink to="/precios" class="hover:text-gray-500 transition-colors" @click="toggleMenu">Precios</NuxtLink>
        <NuxtLink to="/nosotros" class="hover:text-gray-500 transition-colors" @click="toggleMenu">Nosotros</NuxtLink>
        </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Estado para el menú de pantalla completa
const navbarMobileOpened = ref(false);

const toggleMenu = () => {
  navbarMobileOpened.value = !navbarMobileOpened.value;
  // Opcional: Bloquear el scroll del body cuando el menú está abierto
  if (navbarMobileOpened.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Lógica de Scroll (Adaptada de tu código original)
const scrolled = ref(false);
let lastPosition = 0;
const limitPosition = 100;

const handleScroll = () => {
  // Solo ocultamos la barra si el menú móvil NO está abierto
  if (!navbarMobileOpened.value) {
    const currentScrollY = window.scrollY;

    // Si bajamos y pasamos el límite
    if (lastPosition < currentScrollY && limitPosition < currentScrollY) {
      scrolled.value = true;
    }

    // Si subimos o estamos hasta arriba
    if (lastPosition > currentScrollY || currentScrollY <= limitPosition) {
      scrolled.value = false;
    }

    lastPosition = currentScrollY;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>