<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="$emit('close')">
    <div class="glass-effect rounded-2xl p-6 max-w-lg w-full" @click.stop>
      <h3 class="text-2xl font-bold gradient-text mb-4">⚗️ Улучшение карты</h3>
      
      <!-- Текущая карта -->
      <div class="mb-4">
        <div class="text-center text-gray-400 text-sm mb-2">Текущая карта (x{{ cardGroup.count }})</div>
        <div class="flex justify-center">
          <div class="w-32">
            <CardItem :card="cardGroup.card" />
          </div>
        </div>
      </div>

      <!-- Анимация -->
      <div class="flex items-center justify-center gap-4 mb-4">
        <div class="text-2xl">3 x</div>
        <div :class="getRarityBadgeClass(cardGroup.card.rarity)">
          {{ cardGroup.card.rarity }}
        </div>
        <div class="text-3xl">→</div>
        <div class="text-2xl">1 x</div>
        <div :class="getRarityBadgeClass(nextRarity)">
          {{ nextRarity }}
        </div>
      </div>

      <!-- Информация -->
      <div class="glass-dark rounded-xl p-4 mb-4">
        <div class="flex justify-between mb-2">
          <span class="text-gray-400">Стоимость:</span>
          <span class="coin-badge">🪙 {{ fusionCost }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Результат:</span>
          <span class="text-purple-400 font-bold">Случайная {{ nextRarityLabel }}</span>
        </div>
      </div>

      <!-- Предупреждение -->
      <div class="bg-yellow-500/20 rounded-xl p-3 mb-4 text-sm text-center">
        ⚠️ 3 карты будут уничтожены навсегда!
      </div>

      <!-- Кнопки -->
      <div class="flex gap-3">
        <button @click="$emit('close')" class="flex-1 btn-secondary">
          Отмена
        </button>
        <button
          @click="handleFusion"
          :disabled="loading || cardGroup.count < 3"
          class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 active:scale-95 transition-all"
        >
          {{ loading ? '⏳ Улучшение...' : '⚗️ Улучшить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotification } from '~/composables/useNotification'

const props = defineProps({
  cardGroup: Object,
})

const emit = defineEmits(['close', 'fused'])

const { success, error: showError } = useNotification()
const loading = ref(false)

const rarityUpgrade = {
  COMMON: 'RARE',
  RARE: 'EPIC',
  EPIC: 'LEGENDARY',
  LEGENDARY: 'MYTHIC',
}

const rarityLabels = {
  RARE: 'Редкая',
  EPIC: 'Эпическая',
  LEGENDARY: 'Легендарная',
  MYTHIC: 'Мифическая',
}

const fusionCosts = {
  COMMON: 100,
  RARE: 500,
  EPIC: 2000,
  LEGENDARY: 5000,
}

const nextRarity = computed(() => rarityUpgrade[props.cardGroup.card.rarity])
const nextRarityLabel = computed(() => rarityLabels[nextRarity.value])
const fusionCost = computed(() => fusionCosts[props.cardGroup.card.rarity] || 0)

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

const handleFusion = async () => {
  loading.value = true
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    const cardIds = props.cardGroup.userCards.slice(0, 3).map(uc => uc.id)
    
    const result = await $fetch(`${config.public.apiBase}/fusion/fuse`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: { cardIds },
    })

    success(`✨ Получена ${result.newCard.card.rarity} карта: ${result.newCard.card.name}!`)
    emit('fused')
  } catch (error) {
    showError(error.data?.message || 'Ошибка улучшения')
  } finally {
    loading.value = false
  }
}
</script>

