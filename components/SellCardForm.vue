<template>
  <div class="space-y-4">
    <!-- Выбор карты -->
    <div class="glass-effect rounded-2xl p-6">
      <h3 class="text-2xl font-bold gradient-text mb-4">💰 Продать карту</h3>
      
      <!-- Карты для продажи -->
      <div v-if="!selectedCardId" class="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        <div
          v-for="userCard in myCards"
          :key="userCard.id"
          @click="selectCard(userCard)"
          class="cursor-pointer transform hover:scale-105 transition-all"
        >
          <CardItem :card="userCard.card" />
        </div>
      </div>

      <!-- Выбранная карта и опции продажи -->
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-bold">Выбранная карта:</h4>
          <button @click="resetSelection" class="btn-secondary text-sm py-2 px-4">
            ← Назад
          </button>
        </div>

        <!-- Карточка -->
        <div class="glass-dark rounded-xl p-4">
          <div class="flex gap-4">
            <div class="w-32">
              <CardItem :card="selectedCard.card" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-2">{{ selectedCard.card.name }}</h3>
              <div class="flex items-center gap-2 mb-2">
                <span :class="getRarityBadgeClass(selectedCard.card.rarity)">
                  {{ selectedCard.card.rarity }}
                </span>
                <span class="text-gray-300">⚡ {{ selectedCard.card.power }}</span>
              </div>
              <p class="text-sm text-gray-400">{{ selectedCard.card.type }} • {{ selectedCard.card.faction }}</p>
            </div>
          </div>
        </div>

        <!-- Ценовые рекомендации -->
        <div v-if="priceSuggestion" class="glass-effect rounded-xl p-4">
          <h4 class="font-bold mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Рекомендации по цене</span>
          </h4>
          
          <div class="grid grid-cols-3 gap-3 mb-3">
            <div class="text-center">
              <div class="text-xs text-gray-400">Минимум</div>
              <div class="coin-badge">🪙 {{ priceSuggestion.min }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400">Рекомендуется</div>
              <div class="coin-badge text-base">🪙 {{ priceSuggestion.recommended }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-400">Максимум</div>
              <div class="coin-badge">🪙 {{ priceSuggestion.max }}</div>
            </div>
          </div>

          <div class="bg-purple-500/20 rounded-lg p-3 text-sm text-center">
            {{ priceSuggestion.suggestion }}
          </div>
        </div>

        <!-- Варианты продажи -->
        <div class="space-y-3">
          <!-- Быстрая продажа -->
          <div class="glass-dark rounded-xl p-4 border-2 border-green-500/30">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h4 class="font-bold text-green-400 flex items-center gap-2">
                  <span>⚡</span>
                  <span>Быстрая продажа</span>
                </h4>
                <p class="text-sm text-gray-400">Продать системе моментально</p>
              </div>
              <div class="coin-badge text-lg">
                🪙 {{ quickSellPrice }}
              </div>
            </div>
            <button 
              @click="handleQuickSell"
              :disabled="loading"
              class="btn-success w-full"
            >
              {{ loading ? '⏳ Продажа...' : '⚡ Продать мгновенно' }}
            </button>
          </div>

          <!-- ИЛИ разделитель -->
          <div class="text-center text-gray-500 font-bold">ИЛИ</div>

          <!-- Продажа на ТП -->
          <div class="glass-dark rounded-xl p-4 border-2 border-purple-500/30">
            <div class="mb-3">
              <h4 class="font-bold text-purple-400 flex items-center gap-2 mb-2">
                <span>🏪</span>
                <span>Выставить на торговую площадку</span>
              </h4>
              <p class="text-sm text-gray-400 mb-3">Установите свою цену</p>
              
              <div class="flex gap-3">
                <input 
                  v-model.number="customPrice" 
                  type="number" 
                  :min="priceSuggestion?.min || 1"
                  :max="priceSuggestion?.max * 2 || 100000"
                  class="input-field flex-1"
                  placeholder="Введите цену"
                />
                <button 
                  v-if="priceSuggestion"
                  @click="customPrice = priceSuggestion.recommended"
                  class="btn-secondary whitespace-nowrap"
                >
                  Авто
                </button>
              </div>
              
              <!-- Предупреждения о цене -->
              <div v-if="customPrice && priceSuggestion" class="mt-2 text-sm">
                <div v-if="customPrice < priceSuggestion.min" class="text-red-400">
                  ⚠️ Цена слишком низкая! Используйте быструю продажу.
                </div>
                <div v-else-if="customPrice > priceSuggestion.max * 1.5" class="text-yellow-400">
                  ⚠️ Цена очень высокая, карта может долго не продаваться.
                </div>
                <div v-else-if="customPrice >= priceSuggestion.recommended * 0.9 && customPrice <= priceSuggestion.recommended * 1.1" class="text-green-400">
                  ✅ Отличная цена!
                </div>
              </div>
            </div>

            <button 
              @click="handleMarketSell"
              :disabled="!customPrice || customPrice < 1 || loading"
              class="btn-primary w-full"
            >
              {{ loading ? '⏳ Размещение...' : '🏪 Выставить на ТП' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCardsStore } from '~/stores/cards'
import { useMarketStore } from '~/stores/market'
import { useUserStore } from '~/stores/user'
import { useNotification } from '~/composables/useNotification'

const emit = defineEmits(['sold'])

const cardsStore = useCardsStore()
const marketStore = useMarketStore()
const userStore = useUserStore()
const { success, error: showError } = useNotification()

const myCards = computed(() => cardsStore.myCards)
const loading = ref(false)

const selectedCardId = ref('')
const customPrice = ref(0)
const priceSuggestion = ref(null)

const selectedCard = computed(() => {
  return myCards.value.find(c => c.id === selectedCardId.value)
})

const quickSellPrice = computed(() => {
  if (!priceSuggestion.value) return 0
  return Math.floor(priceSuggestion.value.min * 0.8)
})

onMounted(async () => {
  await cardsStore.fetchMyCards()
})

const selectCard = async (userCard) => {
  selectedCardId.value = userCard.id
  
  // Получаем ценовые рекомендации
  try {
    const config = useRuntimeConfig()
    const suggestion = await $fetch(`${config.public.apiBase}/pricing/suggestion`, {
      params: {
        rarity: userCard.card.rarity,
        power: userCard.card.power,
      },
    })
    
    priceSuggestion.value = suggestion
    customPrice.value = suggestion.recommended
  } catch (err) {
    console.error('Error fetching price suggestion:', err)
  }
}

const resetSelection = () => {
  selectedCardId.value = ''
  customPrice.value = 0
  priceSuggestion.value = null
}

const getRarityBadgeClass = (rarity) => {
  const classes = {
    COMMON: 'rarity-badge-common',
    RARE: 'rarity-badge-rare',
    EPIC: 'rarity-badge-epic',
    LEGENDARY: 'rarity-badge-legendary',
    MYTHIC: 'rarity-badge-mythic',
  }
  return classes[rarity] || 'rarity-badge-common'
}

// Быстрая продажа
const handleQuickSell = async () => {
  if (!selectedCardId.value) return

  loading.value = true

  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    const result = await $fetch(`${config.public.apiBase}/market/quick-sell/${selectedCardId.value}`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
    })

    success(`⚡ ${result.message}`)
    
    await userStore.fetchBalance()
    await cardsStore.fetchMyCards()
    
    resetSelection()
    emit('sold')
  } catch (err) {
    showError(err.data?.message || 'Ошибка при продаже')
  } finally {
    loading.value = false
  }
}

// Продажа на ТП
const handleMarketSell = async () => {
  if (!selectedCardId.value || customPrice.value < 1) {
    showError('Укажите корректную цену')
    return
  }

  loading.value = true

  try {
    await marketStore.createOrder(selectedCardId.value, customPrice.value)
    success('🏪 Карта выставлена на торговую площадку!')
    
    await cardsStore.fetchMyCards()
    
    resetSelection()
    emit('sold')
  } catch (err) {
    showError(err.data?.message || 'Ошибка при размещении')
  } finally {
    loading.value = false
  }
}
</script>
