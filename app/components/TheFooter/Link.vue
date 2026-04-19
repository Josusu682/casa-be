<script setup lang="ts">
defineProps<{
  to: string
}>()
</script>

<template>
  <NuxtLink :to="to" class="transition-transform duration-500 hover:scale-105">
    <slot></slot>
  </NuxtLink>
</template>


