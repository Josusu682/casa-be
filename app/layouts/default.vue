<template>
  <Transition name="app-loading-fade">
    <div v-if="appLoading" class="app-loading">
      <img src="/images/logo_be.png" alt="Casa BE" class="app-loading__logo" />
    </div>
  </Transition>

  <TheNavbar />
 <!-- <main class="pt-16 lg:pt-20">-->
    <slot />
<!--  </main> -->
  <TheFooter />
  <CartDrawer />
</template>

<script setup>
const appLoading = ref(true)

const nuxtApp = useNuxtApp()
nuxtApp.hook('page:finish', () => {
  appLoading.value = false
})

onMounted(() => {
  setTimeout(() => { appLoading.value = false }, 1800)
})
</script>

<style>
.app-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: #f2f1eb;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.app-loading__logo {
  height: 60px;
  width: auto;
  opacity: 0.9;
}

.app-loading-fade-leave-active {
  transition: opacity 0.5s ease;
}
.app-loading-fade-leave-to {
  opacity: 0;
}
</style>