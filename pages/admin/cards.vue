<template>
  <div class="min-h-screen pb-24">
    <NavBar title="Управление картами" />

    <div class="container mx-auto px-4 py-6 space-y-6">
      <AdminNav />

      <!-- Кнопка создания -->
      <button @click="showCreateModal = true" class="btn-success w-full">
        ➕ Создать новую карту
      </button>

      <!-- Фильтр по редкости -->
      <div class="glass-effect rounded-xl p-4">
        <div class="flex gap-2 overflow-x-auto">
          <button
            @click="filterRarity = null"
            :class="filterRarity === null ? 'bg-primary-600' : 'bg-gray-700'"
            class="px-4 py-2 rounded-lg font-semibold text-white whitespace-nowrap"
          >
            Все
          </button>
          <button
            v-for="rarity in rarities"
            :key="rarity"
            @click="filterRarity = rarity"
            :class="filterRarity === rarity ? 'bg-primary-600' : 'bg-gray-700'"
            class="px-4 py-2 rounded-lg font-semibold text-white whitespace-nowrap"
          >
            {{ rarity }}
          </button>
        </div>
      </div>

      <!-- Список карт -->
      <div v-if="!loading" class="space-y-3">
        <div
          v-for="card in filteredCards"
          :key="card.id"
          class="glass-effect rounded-xl p-4"
        >
          <div class="flex gap-4">
            <div class="w-20">
              <CardItem :card="card" />
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-white">{{ card.name }}</h3>
              <p class="text-sm text-gray-400">{{ card.description }}</p>
              <div class="flex gap-2 mt-2">
                <span :class="getRarityBadgeClass(card.rarity)">{{ card.rarity }}</span>
                <span class="text-sm text-gray-300">⚡ {{ card.power }}</span>
                <span class="text-sm text-gray-300">{{ card.type }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <button
                @click="editCard(card)"
                class="btn-secondary text-sm py-1 px-3"
              >
                ✏️
              </button>
              <button
                @click="deleteCardConfirm(card)"
                class="btn-danger text-sm py-1 px-3"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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

const loading = computed(() => cardsStore.loading)
const allCards = computed(() => cardsStore.allCards)

const searchQuery = ref('')
const filterRarity = ref(null)
const showCreateModal = ref(false)

const rarities = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC']

const filteredCards = computed(() => {
  let cards = allCards.value

  if (filterRarity.value) {
    cards = cards.filter(c => c.rarity === filterRarity.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    cards = cards.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    )
  }

  return cards
})

onMounted(async () => {
  await cardsStore.fetchAllCards()
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

const editCard = (card) => {
  // TODO: модалка редактирования
  console.log('Edit card:', card)
}

const deleteCardConfirm = async (card) => {
  const confirmed = await showConfirm(
    `Удалить карту "${card.name}"? Это действие необратимо!`,
    {
      title: 'Удаление карты',
      confirmText: 'Удалить',
      type: 'danger',
    }
  )

  if (!confirmed) return

  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()

    await $fetch(`${config.public.apiBase}/admin/cards/${card.id}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeader(),
    })

    success('🗑️ Карта удалена')
    await cardsStore.fetchAllCards()
  } catch (error) {
    showError('Ошибка удаления карты')
  }
}
</script>

