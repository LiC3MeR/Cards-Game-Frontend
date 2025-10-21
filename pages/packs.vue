<template>
  <div class="min-h-screen pb-24">
    <NavBar title="Паки" />

    <div class="container mx-auto px-4 py-6">
      <!-- Баланс -->
      <div class="glass-effect rounded-xl p-4 mb-6 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🪙</span>
            <span class="text-xl font-bold text-yellow-600">{{ balance.coins }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xl">💎</span>
            <span class="text-xl font-bold text-blue-600">{{ balance.gems }}</span>
          </div>
        </div>
      </div>

      <!-- Паки -->
      <div v-if="!loading" class="space-y-4">
        <div 
          v-for="pack in packs" 
          :key="pack.id"
          class="glass-effect rounded-xl p-6 hover:shadow-xl transition-all"
        >
          <div class="flex items-start gap-4">
            <!-- Изображение пака -->
            <div class="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <img 
                v-if="pack.imageUrl && pack.imageUrl !== '/images/packs/default.jpg'"
                :src="getImageUrl(pack.imageUrl)"
                :alt="pack.name"
                class="w-full h-full object-cover"
                @error="e => { e.target.style.display = 'none' }"
              />
              <div class="w-full h-full flex items-center justify-center text-5xl">
                📦
              </div>
            </div>
            
            <div class="flex-1">
              <h3 class="text-xl font-bold text-white mb-1">{{ pack.name }}</h3>
              <p class="text-gray-300 text-sm mb-3">{{ pack.description }}</p>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-sm text-gray-400">{{ pack.cardCount }} карт</span>
                <button 
                  @click="showPackPreview(pack)"
                  class="text-sm text-purple-400 hover:text-purple-300 underline"
                >
                  👁️ Посмотреть карты
                </button>
              </div>
              <div class="flex items-center gap-3">
                <button 
                  v-if="pack.coinPrice > 0"
                  @click="openPack(pack.id)"
                  :disabled="balance.coins < pack.coinPrice || opening"
                  class="btn-primary flex items-center gap-2"
                >
                  <span>🪙 {{ pack.coinPrice }}</span>
                  <span>Открыть</span>
                </button>
                <button 
                  v-if="pack.gemPrice > 0"
                  @click="openPack(pack.id)"
                  :disabled="balance.gems < pack.gemPrice || opening"
                  class="btn-primary flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <span>💎 {{ pack.gemPrice }}</span>
                  <span>Открыть</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Загрузка...</p>
      </div>
    </div>

    <!-- Модалка с открытыми картами -->
    <PackOpenModal 
      v-if="showModal" 
      :cards="openedCards" 
      @close="closeModal" 
    />

    <!-- Модалка превью пака -->
    <PackPreviewModal
      v-if="showPreviewModal"
      :pack="selectedPack"
      @close="showPreviewModal = false"
      @open="handleOpenFromPreview"
    />

    <BottomNav />
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user'
import { usePacksStore } from '~/stores/packs'

definePageMeta({
  middleware: 'auth',
})

const userStore = useUserStore()
const packsStore = usePacksStore()

const balance = computed(() => userStore.balance)
const packs = computed(() => packsStore.packs)
const loading = computed(() => packsStore.loading)
const openedCards = computed(() => packsStore.openedCards)

const opening = ref(false)
const showModal = ref(false)
const showPreviewModal = ref(false)
const selectedPack = ref(null)

onMounted(async () => {
  await Promise.all([
    packsStore.fetchPacks(),
    userStore.fetchBalance(),
  ])
})

const { error: showError } = useNotification()

const showPackPreview = (pack) => {
  selectedPack.value = pack
  showPreviewModal.value = true
}

const handleOpenFromPreview = (packId) => {
  showPreviewModal.value = false
  openPack(packId)
}

const getImageUrl = (url) => {
  if (!url) return ''
  
  if (process.client) {
    const config = useRuntimeConfig()
    const backendUrl = config.public.apiBase.replace('/api', '')
    return `${backendUrl}${url}`
  }
  
  return url
}

const openPack = async (packId) => {
  opening.value = true
  
  try {
    console.log('Opening pack:', packId)
    const result = await packsStore.openPack(packId)
    console.log('Pack opened, result:', result)
    console.log('Opened cards:', packsStore.openedCards)
    
    if (packsStore.openedCards && packsStore.openedCards.length > 0) {
      showModal.value = true
      console.log('Modal should be visible now')
    } else {
      showError('Не удалось получить карты из пака')
      console.error('No cards in openedCards')
    }
  } catch (error) {
    console.error('Error opening pack:', error)
    showError('Ошибка при открытии пака: ' + (error.data?.message || error.message))
  } finally {
    opening.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  packsStore.clearOpenedCards()
}
</script>

