<template>
  <div id="app" class="min-h-screen">
    <NuxtPage />
    <NotificationContainer />
    <ConfirmDialog />
  </div>
</template>

<script setup>
useHead({
  htmlAttrs: {
    lang: 'ru',
  },
})
</script>

