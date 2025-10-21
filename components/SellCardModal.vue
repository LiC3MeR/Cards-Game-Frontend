<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="$emit('close')">
    <div class="glass-effect rounded-2xl p-6 max-w-md w-full" @click.stop>
      <h3 class="text-2xl font-bold gradient-text mb-4">💰 Продать карту</h3>
      
      <div class="mb-4">
        <CardItem :card="cardGroup.card" />
      </div>

      <div class="space-y-3 mb-6">
        <!-- Быстрая продажа -->
        <button
          @click="handleQuickSell"
          :disabled="loading"
          class="w-full glass-dark rounded-xl p-4 text-left hover:border-green-500 border-2 border-transparent transition-all"
        >
          <div class="flex justify-between items-center">
            <div>
              <div class="font-bold text-green-400">⚡ Быстрая продажа</div>
              <div class="text-sm text-gray-400">Моментально</div>
            </div>
            <div class="coin-badge text-lg">🪙 {{ cardGroup.quickSellPrice }}</div>
          </div>
        </button>

        <!-- Продажа на ТП -->
        <div class="glass-dark rounded-xl p-4 border-2 border-transparent">
          <div class="font-bold text-purple-400 mb-2">🏪 Торговая площадка</div>
          <input
            v-model.number="customPrice"
            type="number"
            :min="cardGroup.priceSuggestion?.min"
            class="input-field mb-2"
            placeholder="Ваша цена"
          />
          <button
            @click="handleMarketSell"
            :disabled="!customPrice || loading"
            class="btn-primary w-full"
          >
            Выставить
          </button>
        </div>
      </div>

      <button @click="$emit('close')" class="btn-secondary w-full">
        Отмена
      </button>
    </div>
  </div>
</template>

<script setup>
import { useNotification } from '~/composables/useNotification'

const props = defineProps({
  cardGroup: Object,
})

const emit = defineEmits(['close', 'sold'])

const { success, error: showError } = useNotification()
const loading = ref(false)
const customPrice = ref(props.cardGroup.priceSuggestion?.recommended || 0)

const handleQuickSell = async () => {
  loading.value = true
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    await $fetch(`${config.public.apiBase}/market/quick-sell/${props.cardGroup.userCards[0].id}`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
    })

    success(`⚡ Продано за ${props.cardGroup.quickSellPrice} монет!`)
    emit('sold')
  } catch (error) {
    showError(error.data?.message || 'Ошибка')
  } finally {
    loading.value = false
  }
}

const handleMarketSell = async () => {
  loading.value = true
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    await $fetch(`${config.public.apiBase}/market/orders`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
      body: {
        userCardId: props.cardGroup.userCards[0].id,
        price: customPrice.value,
      },
    })

    success('🏪 Выставлено на рынок!')
    emit('sold')
  } catch (error) {
    showError(error.data?.message || 'Ошибка')
  } finally {
    loading.value = false
  }
}
</script>

