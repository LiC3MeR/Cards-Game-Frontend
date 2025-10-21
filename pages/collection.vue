<template>
  <div class="min-h-screen pb-24">
    <NavBar title="Коллекция" />

    <div class="container mx-auto px-4 py-6">
      <!-- Фильтры -->
      <div class="glass-effect rounded-xl p-4 mb-6">
        <div class="flex gap-2 overflow-x-auto">
          <button 
            @click="selectedRarity = null"
            :class="selectedRarity === null ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'"
            class="px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all"
          >
            Все
          </button>
          <button 
            v-for="rarity in rarities" 
            :key="rarity"
            @click="selectedRarity = rarity"
            :class="selectedRarity === rarity ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'"
            class="px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all"
          >
            {{ rarityLabels[rarity] }}
          </button>
        </div>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="stat-card">
          <div class="text-3xl mb-2">🎴</div>
          <div class="text-2xl font-bold">{{ uniqueCardsCount }}</div>
          <div class="text-sm text-gray-400">Уникальных</div>
        </div>
        <div class="stat-card">
          <div class="text-3xl mb-2">📚</div>
          <div class="text-2xl font-bold">{{ totalCardsCount }}</div>
          <div class="text-sm text-gray-400">Всего карт</div>
        </div>
        <div class="stat-card">
          <div class="text-3xl mb-2">🔄</div>
          <div class="text-2xl font-bold">{{ duplicatesCount }}</div>
          <div class="text-sm text-gray-400">Дублей</div>
        </div>
      </div>

      <!-- Карты с группировкой -->
      <div v-if="!loading" class="space-y-4">
        <div 
          v-for="group in filteredGroupedCards" 
          :key="group.card.id"
          class="glass-effect rounded-xl p-4"
        >
          <div class="flex gap-4">
            <!-- Превью карты -->
            <div class="w-32 flex-shrink-0">
              <CardItem :card="group.card" />
            </div>

            <!-- Информация о карте -->
            <div class="flex-1">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h3 class="text-xl font-bold text-white">{{ group.card.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span :class="getRarityBadgeClass(group.card.rarity)">
                      {{ group.card.rarity }}
                    </span>
                    <span class="text-gray-300">⚡ {{ group.card.power }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold text-purple-400">x{{ group.count }}</div>
                  <div class="text-xs text-gray-400">в коллекции</div>
                </div>
              </div>

              <p class="text-sm text-gray-400 mb-3">{{ group.card.type }} • {{ group.card.faction }}</p>

              <!-- Действия с картами -->
              <div class="flex flex-wrap gap-2">
                <!-- Кнопка продажи одной карты -->
                <button
                  v-if="group.count > 0"
                  @click="openSellDialog(group)"
                  class="btn-primary text-sm py-2 px-4"
                >
                  💰 Продать (1 шт)
                </button>

                <!-- Быстрая продажа всех дублей -->
                <button
                  v-if="group.count > 1"
                  @click="quickSellDuplicates(group)"
                  class="btn-success text-sm py-2 px-4"
                >
                  ⚡ Продать дубли ({{ group.count - 1 }} шт)
                </button>

                <!-- Fusion (если есть 3+) -->
                <button
                  v-if="group.count >= 3 && canFuse(group.card.rarity)"
                  @click="openFusionDialog(group)"
                  class="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm py-2 px-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  ⚗️ Улучшить (3 → 1)
                </button>
              </div>

              <!-- Информация о цене -->
              <div v-if="group.priceSuggestion" class="mt-3 flex items-center gap-4 text-sm">
                <div class="text-gray-400">
                  Быстрая продажа: <span class="coin-badge text-xs">🪙 {{ group.quickSellPrice }}</span>
                </div>
                <div class="text-gray-400">
                  Рынок: <span class="coin-badge text-xs">🪙 {{ group.priceSuggestion.recommended }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-400">Загрузка...</p>
      </div>

      <div v-if="!loading && filteredGroupedCards.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📦</div>
        <p class="text-gray-400 mb-4">У вас пока нет карт</p>
        <NuxtLink to="/packs" class="btn-primary inline-block">
          Открыть пак
        </NuxtLink>
      </div>
    </div>

    <!-- Модалка продажи -->
    <SellCardModal 
      v-if="showSellModal" 
      :card-group="selectedCardGroup"
      @close="showSellModal = false"
      @sold="handleSold"
    />

    <!-- Модалка Fusion -->
    <FusionModal
      v-if="showFusionModal"
      :card-group="selectedCardGroup"
      @close="showFusionModal = false"
      @fused="handleFused"
    />

    <BottomNav />
  </div>
</template>

<script setup>
import { useCardsStore } from '~/stores/cards'
import { useNotification } from '~/composables/useNotification'
import { useConfirm } from '~/composables/useConfirm'

definePageMeta({
  middleware: 'auth',
})

const cardsStore = useCardsStore()
const { success, error: showError } = useNotification()
const { confirm: showConfirm } = useConfirm()

const myCards = computed(() => cardsStore.myCards)
const loading = computed(() => cardsStore.loading)

const rarities = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC']
const rarityLabels = {
  COMMON: '⚪ Обычные',
  RARE: '🔵 Редкие',
  EPIC: '🟣 Эпические',
  LEGENDARY: '🟡 Легендарные',
  MYTHIC: '🔴 Мифические',
}

const selectedRarity = ref(null)
const showSellModal = ref(false)
const showFusionModal = ref(false)
const selectedCardGroup = ref(null)

// Группируем карты по card.id
const groupedCards = computed(() => {
  const groups = {}
  
  myCards.value.forEach(userCard => {
    const cardId = userCard.card.id
    if (!groups[cardId]) {
      groups[cardId] = {
        card: userCard.card,
        userCards: [],
        count: 0,
      }
    }
    groups[cardId].userCards.push(userCard)
    groups[cardId].count++
  })

  return Object.values(groups).sort((a, b) => {
    // Сортируем по редкости, потом по мощи
    const rarityOrder = { MYTHIC: 5, LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 }
    if (rarityOrder[a.card.rarity] !== rarityOrder[b.card.rarity]) {
      return rarityOrder[b.card.rarity] - rarityOrder[a.card.rarity]
    }
    return b.card.power - a.card.power
  })
})

const filteredGroupedCards = computed(() => {
  if (!selectedRarity.value) return groupedCards.value
  return groupedCards.value.filter(g => g.card.rarity === selectedRarity.value)
})

const uniqueCardsCount = computed(() => groupedCards.value.length)
const totalCardsCount = computed(() => myCards.value.length)
const duplicatesCount = computed(() => {
  return groupedCards.value.reduce((sum, g) => sum + Math.max(0, g.count - 1), 0)
})

onMounted(async () => {
  await cardsStore.fetchMyCards()
  await loadPricesForCards()
})

// Загружаем рекомендованные цены
const loadPricesForCards = async () => {
  const config = useRuntimeConfig()
  
  for (const group of groupedCards.value) {
    try {
      const suggestion = await $fetch(`${config.public.apiBase}/pricing/suggestion`, {
        params: {
          rarity: group.card.rarity,
          power: group.card.power,
        },
      })
      group.priceSuggestion = suggestion
      group.quickSellPrice = Math.floor(suggestion.min * 0.8)
    } catch (error) {
      console.error('Error loading price:', error)
    }
  }
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

const canFuse = (rarity) => {
  return rarity !== 'MYTHIC' // Мифические нельзя улучшить
}

const openSellDialog = (group) => {
  selectedCardGroup.value = group
  showSellModal.value = true
}

const openFusionDialog = (group) => {
  selectedCardGroup.value = group
  showFusionModal.value = true
}

// Быстрая продажа всех дублей
const quickSellDuplicates = async (group) => {
  const duplicatesCount = group.count - 1
  const totalPrice = group.quickSellPrice * duplicatesCount
  
  const confirmed = await showConfirm(
    `Продать ${duplicatesCount} дубл${duplicatesCount > 1 ? 'я' : 'ь'} карты "${group.card.name}" за ${totalPrice} монет?`,
    {
      title: 'Быстрая продажа дублей',
      confirmText: 'Продать',
      type: 'info'
    }
  )
  
  if (!confirmed) return

  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    // Продаем все дубли кроме одной
    for (let i = 1; i < group.userCards.length; i++) {
      await $fetch(`${config.public.apiBase}/market/quick-sell/${group.userCards[i].id}`, {
        method: 'POST',
        headers: authStore.getAuthHeader(),
      })
    }
    
    success(`⚡ Продано ${duplicatesCount} дублей за ${totalPrice} монет!`)
    await cardsStore.fetchMyCards()
    await loadPricesForCards()
  } catch (error) {
    showError(error.data?.message || 'Ошибка при продаже')
  }
}

const handleSold = async () => {
  showSellModal.value = false
  await cardsStore.fetchMyCards()
  await loadPricesForCards()
}

const handleFused = async () => {
  showFusionModal.value = false
  await cardsStore.fetchMyCards()
  await loadPricesForCards()
}
</script>
