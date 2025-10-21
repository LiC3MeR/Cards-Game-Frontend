<template>
  <div class="min-h-screen pb-24">
    <NavBar title="AI Генератор" />

    <div class="container mx-auto px-4 py-6 space-y-6">
      <AdminNav />
      
      <!-- Текущий сезон -->
      <div class="glass-effect rounded-2xl p-6">
        <h2 class="text-2xl font-bold gradient-text mb-4">🤖 AI Генератор контента</h2>
        <p class="text-gray-300 mb-4">
          Используем Gemini AI для автоматической генерации тематических карт и паков
        </p>
        
        <div v-if="currentSeason" class="glass-dark rounded-xl p-4 mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">📅</span>
            <span class="font-bold">Текущая тема:</span>
          </div>
          <p class="text-purple-400">{{ currentSeason.theme }}</p>
        </div>
      </div>

      <!-- Генерация -->
      <div class="glass-effect rounded-2xl p-6">
        <h3 class="text-xl font-bold mb-4">Создать новый тематический пак</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-2">Тема (или оставьте пустым для автоматической)</label>
          <input
            v-model="customTheme"
            type="text"
            class="input-field"
            placeholder="Например: Киберпанк, Космос, Драконы..."
          />
        </div>

        <div class="mb-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="generateImages"
              type="checkbox"
              class="w-5 h-5"
            />
            <span class="text-sm font-semibold">🎨 Генерировать изображения (займет ~1 минуту)</span>
          </label>
          <p class="text-xs text-gray-400 mt-1 ml-7">
            Использует Pollinations.ai (бесплатно, Stable Diffusion)
          </p>
        </div>

        <!-- Превью (если сгенерировано) -->
        <div v-if="previewData" class="mb-4 space-y-3">
          <h4 class="font-bold text-green-400">✨ Предпросмотр сгенерированного контента:</h4>
          
          <div class="glass-dark rounded-xl p-4">
            <h5 class="font-bold mb-2">📦 Пак: {{ previewData.pack.name }}</h5>
            <p class="text-sm text-gray-400">{{ previewData.pack.description }}</p>
          </div>

          <div class="max-h-96 overflow-y-auto space-y-2">
            <div
              v-for="(card, idx) in previewData.cards"
              :key="idx"
              class="glass-dark rounded-lg p-3"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h6 class="font-bold">{{ card.name }}</h6>
                  <p class="text-xs text-gray-400">{{ card.description }}</p>
                  <div class="flex gap-2 mt-1">
                    <span :class="getRarityBadgeClass(card.rarity)" class="text-xs">
                      {{ card.rarity }}
                    </span>
                    <span class="text-xs text-gray-300">⚡ {{ card.power }}</span>
                    <span class="text-xs text-gray-300">{{ card.type }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="flex gap-3">
          <button
            @click="generatePreview"
            :disabled="generating"
            class="flex-1 btn-secondary"
          >
            {{ generating ? '⏳ Генерация...' : '👁️ Предпросмотр' }}
          </button>
          
          <button
            v-if="previewData"
            @click="createPack"
            :disabled="creating"
            class="flex-1 btn-primary"
          >
            {{ creating ? '⏳ Создание...' : '✨ Создать пак' }}
          </button>
        </div>
      </div>

      <!-- История созданных паков -->
      <div class="glass-effect rounded-xl p-6">
        <h3 class="text-xl font-bold mb-4">📜 История генераций</h3>
        <p class="text-gray-400 text-sm text-center">Здесь будет история созданных AI паков</p>
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

const { success, error: showError } = useNotification()

const currentSeason = ref(null)
const customTheme = ref('')
const generateImages = ref(true)
const previewData = ref(null)
const generating = ref(false)
const creating = ref(false)

onMounted(async () => {
  const config = useRuntimeConfig()
  try {
    const season = await $fetch(`${config.public.apiBase}/ai/current-season`)
    currentSeason.value = season
  } catch (error) {
    console.error('Error loading season:', error)
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

const generatePreview = async () => {
  generating.value = true
  
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    const result = await $fetch(`${config.public.apiBase}/ai/preview-cards`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: { theme: customTheme.value || undefined },
    })

    previewData.value = result
    success('✨ Контент сгенерирован!')
  } catch (error) {
    showError('Ошибка генерации: ' + (error.data?.message || error.message))
  } finally {
    generating.value = false
  }
}

const createPack = async () => {
  creating.value = true
  
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    if (generateImages.value) {
      success('🎨 Генерация началась! Это займет ~1 минуту...')
    }
    
    const result = await $fetch(`${config.public.apiBase}/ai/generate-pack`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: { 
        theme: customTheme.value || undefined,
        generateImages: generateImages.value,
      },
    })

    success(`🎉 Создан пак "${result.pack.name}" с ${result.cards.length} картами${generateImages.value ? ' и изображениями' : ''}!`)
    
    // Сброс
    previewData.value = null
    customTheme.value = ''
    
    // Можно перенаправить на страницу паков
    setTimeout(() => {
      navigateTo('/packs')
    }, 2000)
  } catch (error) {
    showError('Ошибка создания: ' + (error.data?.message || error.message))
  } finally {
    creating.value = false
  }
}
</script>

