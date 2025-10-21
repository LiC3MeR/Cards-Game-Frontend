<template>
  <div class="min-h-screen pb-24">
    <NavBar title="Управление паками" />

    <div class="container mx-auto px-4 py-6 space-y-6">
      <AdminNav />

      <!-- Кнопка создания -->
      <button @click="showCreateModal = true" class="btn-success w-full">
        ➕ Создать новый пак
      </button>

      <!-- Список паков -->
      <div v-if="!loading" class="space-y-4">
        <div
          v-for="pack in packs"
          :key="pack.id"
          class="glass-effect rounded-xl p-6"
        >
          <div class="flex gap-4">
            <!-- Превью пака -->
            <div class="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <img
                v-if="pack.imageUrl && pack.imageUrl !== '/images/packs/default.jpg'"
                :src="getImageUrl(pack.imageUrl)"
                :alt="pack.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-5xl">
                📦
              </div>
            </div>

            <div class="flex-1">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-xl font-bold text-white">{{ pack.name }}</h3>
                  <p class="text-sm text-gray-400">{{ pack.description }}</p>
                </div>
                <div class="flex gap-2">
                  <button @click="editPack(pack)" class="btn-secondary text-sm py-1 px-3">
                    ✏️
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div class="text-gray-400">Цена (монеты)</div>
                  <div class="font-bold text-yellow-400">🪙 {{ pack.coinPrice }}</div>
                </div>
                <div>
                  <div class="text-gray-400">Цена (гемы)</div>
                  <div class="font-bold text-blue-400">💎 {{ pack.gemPrice }}</div>
                </div>
                <div>
                  <div class="text-gray-400">Карт в паке</div>
                  <div class="font-bold">🎴 {{ pack.cardCount }}</div>
                </div>
              </div>

              <div class="mt-3">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :checked="pack.isAvailable"
                    @change="toggleAvailability(pack)"
                    class="w-5 h-5"
                  />
                  <span class="text-sm">Доступен в магазине</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup>
import { usePacksStore } from '~/stores/packs'
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  middleware: 'auth',
})

const packsStore = usePacksStore()
const { success, error: showError } = useNotification()

const loading = computed(() => packsStore.loading)
const packs = computed(() => packsStore.packs)

const showCreateModal = ref(false)

onMounted(async () => {
  await packsStore.fetchPacks()
})

const getImageUrl = (url) => {
  if (!url) return ''
  
  if (process.client) {
    const config = useRuntimeConfig()
    const backendUrl = config.public.apiBase.replace('/api', '')
    return `${backendUrl}${url}`
  }
  
  return url
}

const editPack = (pack) => {
  // TODO: модалка редактирования
  console.log('Edit pack:', pack)
}

const toggleAvailability = async (pack) => {
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()

    await $fetch(`${config.public.apiBase}/admin/packs/${pack.id}`, {
      method: 'PUT',
      headers: authStore.getAuthHeader(),
      body: { isAvailable: !pack.isAvailable },
    })

    success('✅ Статус пака обновлен')
    await packsStore.fetchPacks()
  } catch (error) {
    showError('Ошибка обновления')
  }
}
</script>

