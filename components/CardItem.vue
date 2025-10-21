<template>
  <div 
    class="glass-effect rounded-xl p-3 hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 card-shimmer"
    :class="[rarityClass, 'border-2']"
    @click="showDetails"
  >
    <div class="aspect-[2/3] bg-gradient-to-br from-purple-100/10 to-pink-100/10 rounded-lg mb-2 relative overflow-hidden">
      <!-- Изображение карты (только если загрузилось) -->
      <img 
        v-if="hasValidImage && !imageError"
        :src="getImageUrl(card.imageUrl)"
        :alt="card.name"
        class="w-full h-full object-cover"
        @error="handleImageError"
        loading="lazy"
      />
      
      <!-- Дефолтная иконка (всегда показываем если нет изображения) -->
      <div v-if="!hasValidImage || imageError" class="absolute inset-0 flex items-center justify-center text-4xl">
        🎴
      </div>
      
      <!-- Оверлей с информацией (только если есть изображение) -->
      <div v-if="hasValidImage && !imageError" class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      
      <div class="absolute top-2 right-2 text-xs font-bold bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
        ⚡{{ card.power }}
      </div>
      <!-- Редкость бейдж -->
      <div class="absolute top-2 left-2">
        <span :class="rarityBadgeClass" class="text-xs">
          {{ getRarityEmoji }}
        </span>
      </div>
    </div>
    <h3 class="font-bold text-sm text-white truncate">{{ card.name }}</h3>
    <p class="text-xs text-gray-300">{{ rarityLabel }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
})

const rarityLabels = {
  COMMON: 'Обычная',
  RARE: 'Редкая',
  EPIC: 'Эпическая',
  LEGENDARY: 'Легендарная',
  MYTHIC: 'Мифическая',
}

const rarityClasses = {
  COMMON: 'card-rarity-common',
  RARE: 'card-rarity-rare',
  EPIC: 'card-rarity-epic',
  LEGENDARY: 'card-rarity-legendary',
  MYTHIC: 'card-rarity-mythic',
}

const rarityBadgeClasses = {
  COMMON: 'rarity-badge-common',
  RARE: 'rarity-badge-rare',
  EPIC: 'rarity-badge-epic',
  LEGENDARY: 'rarity-badge-legendary',
  MYTHIC: 'rarity-badge-mythic',
}

const rarityEmojis = {
  COMMON: '⚪',
  RARE: '🔵',
  EPIC: '🟣',
  LEGENDARY: '🟡',
  MYTHIC: '🔴',
}

const imageError = ref(false)

const hasValidImage = computed(() => {
  return props.card.imageUrl && 
         props.card.imageUrl !== '/images/cards/default.jpg' &&
         props.card.imageUrl.endsWith('.jpg')
})

// Получить URL изображения
const getImageUrl = (url) => {
  if (!url) return ''
  
  // В dev режиме используем прямой URL к backend
  if (process.client) {
    const config = useRuntimeConfig()
    const backendUrl = config.public.apiBase.replace('/api', '')
    return `${backendUrl}${url}`
  }
  
  return url
}

const handleImageError = (e) => {
  // Тихо обрабатываем ошибку - просто показываем дефолтную иконку
  imageError.value = true
  e.target.style.display = 'none' // Прячем битую картинку
}

const rarityLabel = computed(() => rarityLabels[props.card.rarity] || props.card.rarity)
const rarityClass = computed(() => rarityClasses[props.card.rarity] || '')
const rarityBadgeClass = computed(() => rarityBadgeClasses[props.card.rarity] || '')
const getRarityEmoji = computed(() => rarityEmojis[props.card.rarity] || '⚪')

const showDetails = () => {
  // Можно добавить модальное окно с деталями карты
  console.log('Card details:', props.card)
  console.log('Image URL:', props.card.imageUrl)
}
</script>
