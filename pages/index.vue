<template>
  <div class="min-h-screen">
    <NavBar />
    
    <div class="container mx-auto px-4 py-8 pb-24">
      <!-- Профиль и баланс -->
      <div class="glass-effect rounded-2xl p-6 mb-6 border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-white mb-1">Привет, {{ user?.username }}! 👋</h1>
            <p class="text-purple-400 font-semibold">Уровень {{ profile?.level || 1 }}</p>
          </div>
          <div class="text-right">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-2xl">🪙</span>
              <span class="text-2xl font-bold text-yellow-400">{{ balance.coins }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xl">💎</span>
              <span class="text-xl font-bold text-blue-400">{{ balance.gems }}</span>
            </div>
          </div>
        </div>

        <!-- Прогресс бар -->
        <div class="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            class="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
            :style="`width: ${experiencePercent}%`"
          ></div>
        </div>
        <p class="text-sm text-gray-400 mt-1">{{ profile?.experience || 0 }} XP • Следующий уровень: {{ nextLevelXP }} XP</p>
      </div>

      <!-- Ежедневный бонус -->
      <div 
        class="glass-effect rounded-2xl p-6 mb-6 border"
        :class="bonusClaimed ? 'border-gray-500/30' : 'border-green-500/30'"
      >
        <h2 class="text-xl font-bold mb-3 flex items-center gap-2">
          <span>{{ bonusClaimed ? '✅' : '🎁' }}</span>
          <span class="gradient-text">Ежедневный бонус</span>
        </h2>
        
        <button 
          v-if="!bonusClaimed"
          @click="claimBonus" 
          :disabled="bonusLoading"
          class="btn-success w-full"
        >
          {{ bonusLoading ? '⏳ Загрузка...' : '🎁 Получить 100 монет' }}
        </button>

        <div v-else class="glass-dark rounded-xl p-4 text-center">
          <div class="text-green-400 font-bold mb-1">✅ Бонус получен!</div>
          <div class="text-sm text-gray-400">Приходите завтра за новым бонусом</div>
          <div class="text-xs text-gray-500 mt-2">{{ timeUntilNextBonus }}</div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="stat-card">
          <div class="text-3xl mb-2">🎴</div>
          <div class="text-2xl font-bold text-white">{{ profile?.stats?.cardCount || 0 }}</div>
          <div class="text-sm text-gray-400">Карт</div>
        </div>
        <div class="stat-card">
          <div class="text-3xl mb-2">📦</div>
          <div class="text-2xl font-bold text-white">{{ profile?.stats?.packsOpened || 0 }}</div>
          <div class="text-sm text-gray-400">Паков</div>
        </div>
        <div class="stat-card">
          <div class="text-3xl mb-2">🏆</div>
          <div class="text-2xl font-bold text-white">{{ profile?.stats?.achievementsCount || 0 }}</div>
          <div class="text-sm text-gray-400">Достижений</div>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="space-y-4">
        <NuxtLink to="/packs" class="block glass-effect rounded-xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white mb-1">📦 Открыть паки</h3>
              <p class="text-gray-400">Получите новые карты!</p>
            </div>
            <div class="text-3xl">→</div>
          </div>
        </NuxtLink>

        <NuxtLink to="/collection" class="block glass-effect rounded-xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white mb-1">🎴 Моя коллекция</h3>
              <p class="text-gray-400">Просмотр и продажа карт</p>
            </div>
            <div class="text-3xl">→</div>
          </div>
        </NuxtLink>

        <NuxtLink to="/games" class="block glass-effect rounded-xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white mb-1">🎮 Мини-игры</h3>
              <p class="text-gray-400">Выиграй монеты!</p>
            </div>
            <div class="text-3xl">→</div>
          </div>
        </NuxtLink>

        <NuxtLink v-if="user?.isAdmin" to="/admin/ai-generator" class="block glass-effect rounded-xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all border border-yellow-500/30">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-yellow-400 mb-1">🤖 AI Генератор</h3>
              <p class="text-gray-400">Создавать тематические паки</p>
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
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const userStore = useUserStore()
const { success, error: showError } = useNotification()

const user = computed(() => authStore.user)
const profile = computed(() => userStore.profile)
const balance = computed(() => userStore.balance)

const experiencePercent = computed(() => {
  const exp = profile.value?.experience || 0
  const level = profile.value?.level || 1
  const currentLevelXP = level * level * 100
  const nextLevelXP = (level + 1) * (level + 1) * 100
  const xpInLevel = exp - currentLevelXP
  const xpForLevel = nextLevelXP - currentLevelXP
  
  return Math.min(100, (xpInLevel / xpForLevel) * 100)
})

const nextLevelXP = computed(() => {
  const level = profile.value?.level || 1
  return (level + 1) * (level + 1) * 100
})

const bonusLoading = ref(false)

const bonusClaimed = computed(() => {
  return profile.value?.canClaimDailyBonus === false
})

const timeUntilNextBonus = computed(() => {
  if (!bonusClaimed.value) return ''
  
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const diff = tomorrow - now
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return `Следующий бонус через ${hours}ч ${minutes}м`
})

onMounted(async () => {
  await userStore.fetchProfile()
})

const claimBonus = async () => {
  bonusLoading.value = true
  
  try {
    const result = await userStore.claimDailyBonus()
    if (result.success) {
      success(result.message)
      // Обновляем профиль чтобы получить новый статус
      await userStore.fetchProfile()
    } else {
      showError(result.message)
    }
  } catch (error) {
    showError('Ошибка при получении бонуса')
  } finally {
    bonusLoading.value = false
  }
}
</script>
