<template>
  <nav class="absolute top-0 left-0 w-full z-50 bg-transparent py-4 px-6 md:px-12">
    <div class="mx-auto flex max-w-screen-xl items-center justify-between">
      
      <button 
        @click="toggleMenu" 
        class="relative z-[60] flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none"
        aria-label="Abrir menú"
      >
        <div 
          class="w-10 h-[4px] rounded-full transition-all duration-300"
          :class="[
            isMenuOpen ? 'rotate-45 translate-y-[8px] bg-[#394e3c]' : 'bg-white'
          ]"
        ></div>
        <div 
          class="w-10 h-[4px] rounded-full transition-all duration-300"
          :class="[
            isMenuOpen ? 'opacity-0 translate-x-4 bg-[#394e3c]' : 'bg-white'
          ]"
        ></div>
        <div 
          class="w-10 h-[4px] rounded-full transition-all duration-300"
          :class="[
            isMenuOpen ? '-rotate-45 -translate-y-[8px] bg-[#394e3c]' : 'bg-white'
          ]"
        ></div>
      </button>

      <NuxtLink to="/" class="relative z-[60] h-17">
        <img 
          src="/images/logo_be.png" 
          alt="Casa BE" 
          class="h-full w-auto object-contain"
          :class="isMenuOpen ? 'invert-0' : ''" 
        />
      </NuxtLink>

    </div>

    <div 
      class="fixed inset-0 bg-[#f2f1eb] z-50 transition-transform duration-500 ease-in-out flex flex-col items-center justify-center"
      :class="isMenuOpen ? 'translate-y-0' : '-translate-y-full'"
    >
      <div class="flex flex-col items-center gap-8 text-[#394e3c] font-sans text-2xl md:text-4xl font-light">
        <NuxtLink to="/" class="hover:opacity-60 transition-opacity" @click="toggleMenu">Inicio</NuxtLink>
        <NuxtLink to="/#talleres" class="hover:opacity-60 transition-opacity" @click="toggleMenu">Próximos Talleres</NuxtLink>
        <NuxtLink to="/nosotros" class="hover:opacity-60 transition-opacity" @click="toggleMenu">Nosotros</NuxtLink>
        <NuxtLink to="/#contacto" class="hover:opacity-60 transition-opacity" @click="toggleMenu">Contacto</NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
}

onUnmounted(() => {
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.font-sans {
  font-family: 'Acumin', sans-serif;
}
</style>
