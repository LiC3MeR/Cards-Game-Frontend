<template>
  <div class="glass-effect rounded-xl p-2 mb-6">
    <div class="flex gap-2 overflow-x-auto">
      <NuxtLink
        to="/admin"
        :class="isActive('/admin') && !isActive('/admin/', true) ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'"
        class="px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all"
      >
        📊 Главная
      </NuxtLink>
      
      <NuxtLink
        to="/admin/users"
        :class="isActive('/admin/users') ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'"
        class="px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all"
      >
        👥 Пользователи
      </NuxtLink>

      <NuxtLink
        to="/admin/cards"
        :class="isActive('/admin/cards') ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'"
        class="px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all"
      >
        🎴 Карты
      </NuxtLink>

      <NuxtLink
        to="/admin/packs"
        :class="isActive('/admin/packs') ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'"
        class="px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all"
      >
        📦 Паки
      </NuxtLink>

      <NuxtLink
        to="/admin/ai-generator"
        :class="isActive('/admin/ai-generator') ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'"
        class="px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all"
      >
        🤖 AI
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()

const isActive = (path, exact = false) => {
  if (exact) {
    return route.path === path
  }
  return route.path.startsWith(path)
}
</script>

