<template>
  <div class="fixed bottom-0 left-0 right-0 glass-effect border-t border-gray-200 z-50">
    <div class="container mx-auto px-4">
      <div class="flex justify-around py-3">
        <NuxtLink 
          to="/" 
          class="flex flex-col items-center gap-1 transition-colors"
          :class="isActive('/') ? 'text-primary-600' : 'text-gray-600'"
        >
          <span class="text-2xl">🏠</span>
          <span class="text-xs font-semibold">Главная</span>
        </NuxtLink>

        <NuxtLink 
          to="/packs" 
          class="flex flex-col items-center gap-1 transition-colors"
          :class="isActive('/packs') ? 'text-primary-600' : 'text-gray-600'"
        >
          <span class="text-2xl">📦</span>
          <span class="text-xs font-semibold">Паки</span>
        </NuxtLink>

        <NuxtLink 
          to="/collection" 
          class="flex flex-col items-center gap-1 transition-colors"
          :class="isActive('/collection') ? 'text-primary-600' : 'text-gray-600'"
        >
          <span class="text-2xl">🎴</span>
          <span class="text-xs font-semibold">Коллекция</span>
        </NuxtLink>

        <NuxtLink 
          to="/battle" 
          class="flex flex-col items-center gap-1 transition-colors"
          :class="isActive('/battle') ? 'text-primary-600' : 'text-gray-300'"
        >
          <span class="text-2xl">⚔️</span>
          <span class="text-xs font-semibold">Арена</span>
        </NuxtLink>

        <NuxtLink 
          to="/games" 
          class="flex flex-col items-center gap-1 transition-colors"
          :class="isActive('/games') ? 'text-primary-600' : 'text-gray-300'"
        >
          <span class="text-2xl">🎮</span>
          <span class="text-xs font-semibold">Игры</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()

const isActive = (path) => {
  return route.path === path
}
</script>

