    <!-- NO UTILIZADO TODAVIA -->
<script setup lang="ts">
defineProps<{
  href: string;
  text: string;
  bgClass?: string;
}>();
</script>

<template>
  <a
    :href="href"
    rel="noopener noreferrer"
    target="_blank"
    :class="[
      'inline-block px-16 py-4 font-semibold text-center sm:w-full lg:w-auto rounded-full outline focus:outline-none focus:ring-2 transition-all duration-300 ease-linear text-lg',
      'sm:max-w-[75%]',
      bgClass || 'bg-gray-800 text-white'
    ]"
  >
    {{ text }}
  </a>
</template>