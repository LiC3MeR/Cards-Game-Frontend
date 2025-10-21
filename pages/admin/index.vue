<template>
  <div class="min-h-screen pb-24">
    <NavBar title="Админ-панель" />

    <div class="container mx-auto px-4 py-6 space-y-6">
      <AdminNav />

      <!-- Статистика -->
      <div class="glass-effect rounded-2xl p-6">
        <h2 class="text-2xl font-bold gradient-text mb-4">📊 Статистика</h2>
        
        <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="stat-card">
            <div class="text-3xl mb-2">👥</div>
            <div class="text-2xl font-bold">{{ stats.users.total }}</div>
            <div class="text-sm text-gray-400">Пользователей</div>
          </div>
          <div class="stat-card">
            <div class="text-3xl mb-2">✅</div>
            <div class="text-2xl font-bold text-green-400">{{ stats.users.active }}</div>
            <div class="text-sm text-gray-400">Активных (7 дней)</div>
          </div>
          <div class="stat-card">
            <div class="text-3xl mb-2">🎴</div>
            <div class="text-2xl font-bold">{{ stats.cards.total }}</div>
            <div class="text-sm text-gray-400">Карт</div>
          </div>
          <div class="stat-card">
            <div class="text-3xl mb-2">📦</div>
            <div class="text-2xl font-bold">{{ stats.packs.total }}</div>
            <div class="text-sm text-gray-400">Паков</div>
          </div>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="space-y-4">
        <NuxtLink to="/admin/users" class="block glass-effect rounded-xl p-6 hover:shadow-xl transition-all border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white mb-1">👥 Управление пользователями</h3>
              <p class="text-gray-400">Баланс, уровни, права</p>
            </div>
            <div class="text-3xl">→</div>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/cards" class="block glass-effect rounded-xl p-6 hover:shadow-xl transition-all border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white mb-1">🎴 Управление картами</h3>
              <p class="text-gray-400">Создание, редактирование, удаление</p>
            </div>
            <div class="text-3xl">→</div>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/packs" class="block glass-effect rounded-xl p-6 hover:shadow-xl transition-all border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white mb-1">📦 Управление паками</h3>
              <p class="text-gray-400">Создание, цены, дроп-таблица</p>
            </div>
            <div class="text-3xl">→</div>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/ai-generator" class="block glass-effect rounded-xl p-6 hover:shadow-xl transition-all border border-yellow-500/30">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-yellow-400 mb-1">🤖 AI Генератор</h3>
              <p class="text-gray-400">Автоматическая генерация контента</p>
            </div>
            <div class="text-3xl">→</div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  middleware: 'auth',
})

const { error: showError } = useNotification()

const stats = ref(null)

onMounted(async () => {
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    const data = await $fetch(`${config.public.apiBase}/admin/stats`, {
      headers: authStore.getAuthHeader(),
    })
    
    stats.value = data
  } catch (error) {
    showError('Ошибка загрузки статистики')
  }
})
</script>

