<template>
  <div class="min-h-screen pb-24">
    <NavBar title="Мини-игры" />

    <div class="container mx-auto px-4 py-6 space-y-6">
      <!-- Баланс -->
      <div class="glass-effect rounded-xl p-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🪙</span>
            <span class="text-xl font-bold text-yellow-400">{{ balance.coins }}</span>
          </div>
        </div>
      </div>

      <!-- Игра 1: Угадай карту -->
      <div class="glass-effect rounded-2xl p-6 border-2 border-purple-500/30">
        <div class="text-center mb-4">
          <h2 class="text-3xl font-bold gradient-text mb-2">🎴 Угадай карту</h2>
          <p class="text-gray-300">Угадайте карту по подсказке и удвойте ставку!</p>
        </div>

        <div v-if="!guessGame.active">
          <div class="mb-4">
            <label class="block text-sm font-semibold mb-2">Ставка (монеты)</label>
            <input
              v-model.number="guessGame.bet"
              type="number"
              min="10"
              max="1000"
              class="input-field"
              placeholder="Мин: 10 монет"
            />
          </div>
          <button
            @click="startGuessGame"
            :disabled="guessGame.bet < 10 || balance.coins < guessGame.bet"
            class="btn-primary w-full text-lg"
          >
            🎮 Начать игру
          </button>
        </div>

        <div v-else class="space-y-4">
          <!-- Подсказка -->
          <div class="glass-dark rounded-xl p-4 text-center">
            <div class="text-sm text-gray-400 mb-2">💡 Подсказка:</div>
            <div class="text-lg font-bold text-purple-400">{{ guessGame.hint }}</div>
          </div>

          <!-- Варианты -->
          <div class="space-y-3">
            <button
              v-for="option in guessGame.options"
              :key="option.id"
              @click="answerGuessGame(option.id)"
              :disabled="guessGame.answering"
              class="w-full glass-dark rounded-xl p-4 text-left hover:border-purple-500 border-2 border-transparent transition-all"
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-bold">{{ option.name }}</div>
                  <div class="text-sm text-gray-400">{{ option.rarity }}</div>
                </div>
                <div class="text-2xl">→</div>
              </div>
            </button>
          </div>

          <div class="text-center text-sm text-gray-400">
            Ставка: 🪙 {{ guessGame.bet }} • Выигрыш: 🪙 {{ guessGame.bet * 2 }}
          </div>
        </div>
      </div>

      <!-- Игра 2: Удвой или ничего -->
      <div class="glass-effect rounded-2xl p-6 border-2 border-red-500/30">
        <div class="text-center mb-4">
          <h2 class="text-3xl font-bold gradient-text mb-2">🎰 Удвой или ничего</h2>
          <p class="text-gray-300">50% шанс удвоить ставку!</p>
        </div>

        <div class="bg-red-500/20 rounded-xl p-3 mb-4 text-center text-sm">
          ⚠️ Высокий риск! Можете потерять всю ставку!
        </div>

        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Ставка (монеты)</label>
          <input
            v-model.number="doubleGame.bet"
            type="number"
            min="50"
            max="5000"
            class="input-field"
            placeholder="Мин: 50 монет"
          />
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div class="glass-dark rounded-lg p-3 text-center">
            <div class="text-gray-400">Выигрыш (50%)</div>
            <div class="text-xl font-bold text-green-400">🪙 {{ doubleGame.bet * 2 }}</div>
          </div>
          <div class="glass-dark rounded-lg p-3 text-center">
            <div class="text-gray-400">Проигрыш (50%)</div>
            <div class="text-xl font-bold text-red-400">-🪙 {{ doubleGame.bet }}</div>
          </div>
        </div>

        <button
          @click="playDouble"
          :disabled="doubleGame.bet < 50 || balance.coins < doubleGame.bet || doubleGame.playing"
          class="btn-danger w-full text-lg"
        >
          {{ doubleGame.playing ? '⏳ Игра...' : '🎰 Играть!' }}
        </button>
      </div>

      <!-- Статистика -->
      <div class="glass-effect rounded-xl p-4">
        <h3 class="font-bold mb-3">📊 Ваша статистика</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div class="text-gray-400">Игр сыграно:</div>
            <div class="text-2xl font-bold">{{ stats.gamesPlayed }}</div>
          </div>
          <div>
            <div class="text-gray-400">Выиграно:</div>
            <div class="text-2xl font-bold text-green-400">{{ stats.gamesWon }}</div>
          </div>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  middleware: 'auth',
})

const userStore = useUserStore()
const { success, error: showError } = useNotification()

const balance = computed(() => userStore.balance)

const guessGame = ref({
  active: false,
  bet: 100,
  hint: '',
  options: [],
  gameId: '',
  correctCardId: '',
  answering: false,
})

const doubleGame = ref({
  bet: 100,
  playing: false,
})

const stats = ref({
  gamesPlayed: 0,
  gamesWon: 0,
})

onMounted(async () => {
  await userStore.fetchBalance()
})

const startGuessGame = async () => {
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    const result = await $fetch(`${config.public.apiBase}/games/guess-card/start`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: { bet: guessGame.value.bet },
    })

    guessGame.value.active = true
    guessGame.value.hint = result.hint
    guessGame.value.options = result.options
    guessGame.value.gameId = result.gameId
    guessGame.value.correctCardId = result._serverData
  } catch (error) {
    showError(error.data?.message || 'Ошибка запуска игры')
  }
}

const answerGuessGame = async (answerId) => {
  guessGame.value.answering = true
  
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    const result = await $fetch(`${config.public.apiBase}/games/guess-card/answer`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        gameId: guessGame.value.gameId,
        answerId,
        correctCardId: guessGame.value.correctCardId,
        bet: guessGame.value.bet,
      },
    })

    if (result.correct) {
      success(result.message)
      stats.value.gamesWon++
    } else {
      showError(result.message)
    }

    stats.value.gamesPlayed++
    
    await userStore.fetchBalance()
    
    // Сброс игры
    guessGame.value.active = false
    guessGame.value.answering = false
  } catch (error) {
    showError(error.data?.message || 'Ошибка')
    guessGame.value.answering = false
  }
}

const playDouble = async () => {
  doubleGame.value.playing = true
  
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    const result = await $fetch(`${config.public.apiBase}/games/double-or-nothing`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: { bet: doubleGame.value.bet },
    })

    if (result.win) {
      success(result.message)
      stats.value.gamesWon++
    } else {
      showError(result.message)
    }

    stats.value.gamesPlayed++
    
    await userStore.fetchBalance()
  } catch (error) {
    showError(error.data?.message || 'Ошибка')
  } finally {
    doubleGame.value.playing = false
  }
}
</script>

