<template>
  <div class="min-h-screen pb-24">
    <NavBar title="Арена" />

    <div class="container mx-auto px-4 py-6 space-y-6">
      <!-- Выбор сложности -->
      <div class="glass-effect rounded-2xl p-6">
        <h2 class="text-2xl font-bold gradient-text mb-4">⚔️ PvE Бой</h2>
        <p class="text-gray-300 mb-4">Выберите 5 карт и сложность противника</p>

        <div class="grid grid-cols-3 gap-3 mb-4">
          <button
            @click="selectedDifficulty = 'EASY'"
            :class="selectedDifficulty === 'EASY' ? 'bg-green-600 border-green-400' : 'bg-gray-700 border-gray-600'"
            class="p-4 rounded-xl border-2 transition-all"
          >
            <div class="font-bold">🟢 Легко</div>
            <div class="text-xs text-gray-300">80-120 силы</div>
            <div class="text-sm text-yellow-400 mt-1">🪙 100</div>
          </button>

          <button
            @click="selectedDifficulty = 'MEDIUM'"
            :class="selectedDifficulty === 'MEDIUM' ? 'bg-yellow-600 border-yellow-400' : 'bg-gray-700 border-gray-600'"
            class="p-4 rounded-xl border-2 transition-all"
          >
            <div class="font-bold">🟡 Средне</div>
            <div class="text-xs text-gray-300">150-200 силы</div>
            <div class="text-sm text-yellow-400 mt-1">🪙 300</div>
          </button>

          <button
            @click="selectedDifficulty = 'HARD'"
            :class="selectedDifficulty === 'HARD' ? 'bg-red-600 border-red-400' : 'bg-gray-700 border-gray-600'"
            class="p-4 rounded-xl border-2 transition-all"
          >
            <div class="font-bold">🔴 Сложно</div>
            <div class="text-xs text-gray-300">250-350 силы</div>
            <div class="text-sm text-yellow-400 mt-1">🪙 800</div>
          </button>
        </div>
      </div>

      <!-- Выбор карт -->
      <div class="glass-effect rounded-2xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Выберите 5 карт ({{ selectedCards.length }}/5)</h3>
          <button
            v-if="selectedCards.length > 0"
            @click="selectedCards = []"
            class="btn-secondary text-sm py-2 px-4"
          >
            Очистить
          </button>
        </div>

        <!-- Выбранные карты -->
        <div v-if="selectedCards.length > 0" class="mb-4">
          <div class="flex gap-2 overflow-x-auto pb-2">
            <div
              v-for="card in selectedCards"
              :key="card.id"
              @click="removeCard(card)"
              class="w-20 flex-shrink-0 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
            >
              <CardItem :card="card.card" />
              <div class="text-center text-xs mt-1">✕</div>
            </div>
          </div>
          <div class="text-center text-sm text-gray-400">
            Общая сила: <span class="text-purple-400 font-bold text-lg">{{ playerTotalPower }}</span>
          </div>
        </div>

        <!-- Доступные карты -->
        <div class="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          <div
            v-for="userCard in availableCards"
            :key="userCard.id"
            @click="selectCard(userCard)"
            :class="isSelected(userCard) ? 'opacity-50' : ''"
            class="cursor-pointer transform hover:scale-105 transition-all"
          >
            <CardItem :card="userCard.card" />
          </div>
        </div>
      </div>

      <!-- Кнопка боя -->
      <button
        @click="startBattle"
        :disabled="selectedCards.length !== 5 || battling"
        class="btn-primary w-full text-lg py-4"
      >
        {{ battling ? '⚔️ Бой...' : '⚔️ Начать бой!' }}
      </button>

      <!-- Результат боя -->
      <div v-if="battleResult" class="glass-effect rounded-2xl p-6 border-2" :class="battleResult.win ? 'border-green-500' : 'border-red-500'">
        <div class="text-center">
          <div class="text-6xl mb-4">{{ battleResult.win ? '🏆' : '💀' }}</div>
          <h3 class="text-2xl font-bold mb-2" :class="battleResult.win ? 'text-green-400' : 'text-red-400'">
            {{ battleResult.win ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ' }}
          </h3>
          <p class="text-gray-300 mb-4">{{ battleResult.message }}</p>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="glass-dark rounded-xl p-4">
              <div class="text-sm text-gray-400">Ваша сила</div>
              <div class="text-2xl font-bold text-blue-400">{{ battleResult.playerPower }}</div>
            </div>
            <div class="glass-dark rounded-xl p-4">
              <div class="text-sm text-gray-400">{{ battleResult.enemyName }}</div>
              <div class="text-2xl font-bold text-red-400">{{ battleResult.enemyPower }}</div>
            </div>
          </div>

          <div v-if="battleResult.win" class="glass-dark rounded-xl p-4 mb-4">
            <div class="font-bold mb-2">🎁 Награды:</div>
            <div class="flex justify-center gap-4">
              <div class="coin-badge text-lg">🪙 {{ battleResult.reward }}</div>
              <div class="gem-badge text-lg">⭐ {{ battleResult.xpReward }} XP</div>
            </div>
          </div>

          <button @click="battleResult = null; selectedCards = []" class="btn-primary w-full">
            Новый бой
          </button>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { useCardsStore } from '~/stores/cards'
import { useUserStore } from '~/stores/user'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  middleware: 'auth',
})

const cardsStore = useCardsStore()
const userStore = useUserStore()
const { success, error: showError } = useNotification()

const myCards = computed(() => cardsStore.myCards)
const selectedCards = ref([])
const selectedDifficulty = ref('EASY')
const battling = ref(false)
const battleResult = ref(null)

const availableCards = computed(() => myCards.value)

const playerTotalPower = computed(() => {
  return selectedCards.value.reduce((sum, uc) => sum + uc.card.power, 0)
})

onMounted(async () => {
  await cardsStore.fetchMyCards()
})

const selectCard = (userCard) => {
  if (selectedCards.value.length >= 5) {
    showError('Максимум 5 карт')
    return
  }
  
  if (!isSelected(userCard)) {
    selectedCards.value.push(userCard)
  }
}

const removeCard = (userCard) => {
  selectedCards.value = selectedCards.value.filter(c => c.id !== userCard.id)
}

const isSelected = (userCard) => {
  return selectedCards.value.some(c => c.id === userCard.id)
}

const startBattle = async () => {
  if (selectedCards.value.length !== 5) return

  battling.value = true

  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()

    const result = await $fetch(`${config.public.apiBase}/battle/pve`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        cardIds: selectedCards.value.map(c => c.id),
        difficulty: selectedDifficulty.value,
      },
    })

    battleResult.value = result

    if (result.win) {
      await userStore.fetchBalance()
      await userStore.fetchProfile()
    }
  } catch (error) {
    showError(error.data?.message || 'Ошибка боя')
  } finally {
    battling.value = false
  }
}
</script>

