<template>
  <div class="min-h-screen pb-24">
    <NavBar title="Рынок" />

    <div class="container mx-auto px-4 py-6">
      <!-- Табы -->
      <div class="glass-effect rounded-xl p-2 mb-6 flex gap-2">
        <button 
          @click="activeTab = 'buy'"
          :class="activeTab === 'buy' ? 'bg-primary-600 text-white' : 'bg-transparent text-gray-700'"
          class="flex-1 py-3 rounded-lg font-semibold transition-colors"
        >
          Купить
        </button>
        <button 
          @click="activeTab = 'sell'"
          :class="activeTab === 'sell' ? 'bg-primary-600 text-white' : 'bg-transparent text-gray-700'"
          class="flex-1 py-3 rounded-lg font-semibold transition-colors"
        >
          Продать
        </button>
        <button 
          @click="activeTab = 'my'"
          :class="activeTab === 'my' ? 'bg-primary-600 text-white' : 'bg-transparent text-gray-700'"
          class="flex-1 py-3 rounded-lg font-semibold transition-colors"
        >
          Мои
        </button>
      </div>

      <!-- Купить -->
      <div v-if="activeTab === 'buy'">
        <div v-if="!loading" class="space-y-4">
          <div 
            v-for="order in orders" 
            :key="order.id"
            class="glass-effect rounded-xl p-4"
          >
            <div class="flex gap-4">
              <div class="w-20 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-3xl">
                🎴
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-gray-800">{{ order.card?.name }}</h3>
                <p class="text-sm text-gray-600 mb-2">{{ order.card?.rarity }}</p>
                <p class="text-sm text-gray-600 mb-2">Продавец: {{ order.seller?.username }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xl font-bold text-yellow-600">🪙 {{ order.price }}</span>
                  <button 
                    @click="buyCard(order.id)"
                    :disabled="buying"
                    class="btn-primary"
                  >
                    Купить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="!loading && orders.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🏪</div>
          <p class="text-gray-600">На рынке пока нет предложений</p>
        </div>
      </div>

      <!-- Продать -->
      <div v-if="activeTab === 'sell'">
        <SellCardForm @sold="handleSold" />
      </div>

      <!-- Мои ордера -->
      <div v-if="activeTab === 'my'">
        <div v-if="myOrders.length > 0" class="space-y-4">
          <div 
            v-for="order in myOrders" 
            :key="order.id"
            class="glass-effect rounded-xl p-4"
          >
            <div class="flex gap-4">
              <div class="w-20 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-3xl">
                🎴
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-gray-800">{{ order.card?.name }}</h3>
                <p class="text-sm text-gray-600 mb-2">Статус: {{ statusLabels[order.status] }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xl font-bold text-yellow-600">🪙 {{ order.price }}</span>
                  <button 
                    v-if="order.status === 'ACTIVE'"
                    @click="cancelOrder(order.id)"
                    class="btn-secondary"
                  >
                    Отменить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">📋</div>
          <p class="text-gray-600">У вас нет активных ордеров</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Загрузка...</p>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { useMarketStore } from '~/stores/market'
import { useUserStore } from '~/stores/user'

definePageMeta({
  middleware: 'auth',
})

const marketStore = useMarketStore()
const userStore = useUserStore()

const orders = computed(() => marketStore.orders)
const myOrders = computed(() => marketStore.myOrders)
const loading = computed(() => marketStore.loading)

const activeTab = ref('buy')
const buying = ref(false)

const statusLabels = {
  ACTIVE: '🟢 Активен',
  SOLD: '✅ Продан',
  CANCELLED: '❌ Отменен',
}

onMounted(async () => {
  await marketStore.fetchOrders()
})

watch(activeTab, async (newTab) => {
  if (newTab === 'my') {
    await marketStore.fetchMyOrders()
  }
})

const { success, error: showError, warning } = useNotification()
const { confirm: showConfirm } = useConfirm()

const buyCard = async (orderId) => {
  const confirmed = await showConfirm('Вы уверены что хотите купить эту карту?', {
    title: 'Покупка карты',
    confirmText: 'Купить',
    type: 'info'
  })
  
  if (!confirmed) return
  
  buying.value = true
  try {
    await marketStore.buyOrder(orderId)
    await userStore.fetchBalance()
    success('✅ Карта успешно куплена!')
  } catch (error) {
    showError(error.data?.message || error.message)
  } finally {
    buying.value = false
  }
}

const cancelOrder = async (orderId) => {
  const confirmed = await showConfirm('Вы действительно хотите отменить этот ордер?', {
    title: 'Отмена ордера',
    confirmText: 'Отменить',
    type: 'warning'
  })
  
  if (!confirmed) return
  
  try {
    await marketStore.cancelOrder(orderId)
    success('Ордер отменен')
  } catch (error) {
    showError(error.data?.message || error.message)
  }
}

const handleSold = async () => {
  activeTab.value = 'my'
  await marketStore.fetchMyOrders()
}
</script>

