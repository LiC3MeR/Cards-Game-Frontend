<template>
  <div class="min-h-screen pb-24">
    <NavBar title="Управление пользователями" />

    <div class="container mx-auto px-4 py-6 space-y-6">
      <AdminNav />

      <!-- Поиск и фильтры -->
      <div class="glass-effect rounded-xl p-4">
        <input
          v-model="searchQuery"
          type="text"
          class="input-field"
          placeholder="🔍 Поиск по email или username..."
        />
      </div>

      <!-- Список пользователей -->
      <div v-if="!loading" class="space-y-3">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="glass-effect rounded-xl p-4"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-white">{{ user.username }}</h3>
                <span v-if="user.isAdmin" class="text-xs bg-yellow-500 px-2 py-1 rounded font-bold">
                  ADMIN
                </span>
              </div>
              <p class="text-sm text-gray-400">{{ user.email }}</p>
              <p class="text-xs text-gray-500">ID: {{ user.id }}</p>
            </div>
            <button
              @click="selectUser(user)"
              class="btn-primary text-sm py-2 px-4"
            >
              ⚙️ Управление
            </button>
          </div>

          <div class="grid grid-cols-4 gap-2 text-sm">
            <div>
              <div class="text-gray-400">Монеты</div>
              <div class="font-bold text-yellow-400">🪙 {{ user.coins }}</div>
            </div>
            <div>
              <div class="text-gray-400">Гемы</div>
              <div class="font-bold text-blue-400">💎 {{ user.gems }}</div>
            </div>
            <div>
              <div class="text-gray-400">Уровень</div>
              <div class="font-bold">⭐ {{ user.level }}</div>
            </div>
            <div>
              <div class="text-gray-400">Репутация</div>
              <div class="font-bold text-purple-400">{{ user.reputation }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-400">Загрузка...</p>
      </div>
    </div>

    <!-- Модалка управления пользователем -->
    <UserManageModal
      v-if="selectedUser"
      :user="selectedUser"
      @close="selectedUser = null"
      @updated="handleUserUpdated"
    />

    <BottomNav />
  </div>
</template>

<script setup>
import { useNotification } from '~/composables/useNotification'

definePageMeta({
  middleware: 'auth',
})

const { success, error: showError } = useNotification()

const loading = ref(true)
const users = ref([])
const searchQuery = ref('')
const selectedUser = ref(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.email.toLowerCase().includes(query) ||
    u.username.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  await loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    const data = await $fetch(`${config.public.apiBase}/admin/users`, {
      headers: authStore.getAuthHeader(),
    })
    
    users.value = data.users
  } catch (error) {
    showError('Ошибка загрузки пользователей')
  } finally {
    loading.value = false
  }
}

const selectUser = (user) => {
  selectedUser.value = user
}

const handleUserUpdated = async () => {
  selectedUser.value = null
  await loadUsers()
  success('✅ Пользователь обновлен')
}
</script>

