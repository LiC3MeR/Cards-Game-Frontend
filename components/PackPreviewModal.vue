<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click="$emit('close')">
    <div class="glass-effect rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
      <!-- Заголовок -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-3xl font-bold gradient-text mb-2">{{ pack.name }}</h2>
          <p class="text-gray-300">{{ pack.description }}</p>
        </div>
        <button @click="$emit('close')" class="text-3xl text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      <!-- Информация о паке -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="glass-dark rounded-xl p-4 text-center">
          <div class="text-2xl mb-1">🎴</div>
          <div class="text-lg font-bold">{{ pack.cardCount }}</div>
          <div class="text-xs text-gray-400">Карт в паке</div>
        </div>
        <div class="glass-dark rounded-xl p-4 text-center">
          <div class="text-2xl mb-1">🪙</div>
          <div class="text-lg font-bold text-yellow-400">{{ pack.coinPrice }}</div>
          <div class="text-xs text-gray-400">Монет</div>
        </div>
        <div class="glass-dark rounded-xl p-4 text-center">
          <div class="text-2xl mb-1">💎</div>
          <div class="text-lg font-bold text-blue-400">{{ pack.gemPrice }}</div>
          <div class="text-xs text-gray-400">Гемов</div>
        </div>
      </div>

      <!-- Возможные карты -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-400">Загрузка карт...</p>
      </div>

      <div v-else>
        <h3 class="text-xl font-bold mb-4">📋 Возможные карты из этого пака:</h3>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div v-for="packCard in packCards" :key="packCard.card.id" class="relative">
            <CardItem :card="packCard.card" />
            <!-- Шанс выпадения -->
            <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs font-bold">
              {{ packCard.dropChance }}%
            </div>
          </div>
        </div>

        <!-- Статистика по редкости -->
        <div class="glass-dark rounded-xl p-4">
          <h4 class="font-bold mb-3">📊 Распределение по редкости:</h4>
          <div class="space-y-2">
            <div v-for="(count, rarity) in rarityStats" :key="rarity" class="flex justify-between items-center">
              <span :class="getRarityBadgeClass(rarity)">{{ rarity }}</span>
              <span class="text-sm">{{ count }} карт</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="flex gap-3 mt-6">
        <button @click="$emit('close')" class="flex-1 btn-secondary">
          Закрыть
        </button>
        <button @click="$emit('open', pack.id)" class="flex-1 btn-primary">
          🎁 Открыть пак
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  pack: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'open'])

const loading = ref(true)
const packCards = ref([])

const rarityStats = computed(() => {
  const stats = {}
  packCards.value.forEach(pc => {
    const rarity = pc.card.rarity
    stats[rarity] = (stats[rarity] || 0) + 1
  })
  return stats
})

onMounted(async () => {
  try {
    const config = useRuntimeConfig()
    const result = await $fetch(`${config.public.apiBase}/packs/${props.pack.id}`)
    
    if (result.cards && result.cards.length > 0) {
      packCards.value = result.cards
    }
  } catch (error) {
    console.error('Error loading pack cards:', error)
  } finally {
    loading.value = false
  }
})

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
</script>

