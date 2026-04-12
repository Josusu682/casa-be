<script setup>
</script>

<template>
  <header class="bg-contain bg-clip-padding bg-repeat-round bg-digital-banner bg-opacity-0">
    <div>
      <div
        class="grid h-full lg:gap-4 mx-auto max-w-screen-xl md:grid-cols-2"
      >
        <div class="flex flex-col justify-center items-start px-6 py-12">
          <h1 class="text-4xl font-normal text-cyma-purple lg:text-[42px] font-yesevaOne md:tracking-wide">
            <slot name="title" />
          </h1>
          <p class="mt-7 text-lg font-normal text-cyma-purple lg:text-xl space-y-2 flex flex-col text-pretty">
            <slot name="subtitle" />
          </p>
        </div>
        <div class="flex items-center px-6 py-12">
          <div class="w-full">
            <slot name="image" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
