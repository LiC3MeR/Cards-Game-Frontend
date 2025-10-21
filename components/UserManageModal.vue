<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="$emit('close')">
    <div class="glass-effect rounded-2xl p-6 max-w-lg w-full border-2 border-purple-500/30" @click.stop>
      <h3 class="text-2xl font-bold gradient-text mb-4">⚙️ Управление пользователем</h3>
      
      <div class="glass-dark rounded-xl p-4 mb-4">
        <h4 class="font-bold mb-2">{{ user.username }}</h4>
        <p class="text-sm text-gray-400">{{ user.email }}</p>
      </div>

      <!-- Баланс -->
      <div class="mb-4">
        <h4 class="font-bold mb-2">💰 Баланс</h4>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Монеты</label>
            <input
              v-model.number="balanceForm.coins"
              type="number"
              class="input-field"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Гемы</label>
            <input
              v-model.number="balanceForm.gems"
              type="number"
              class="input-field"
            />
          </div>
        </div>
        <button
          @click="updateBalance"
          :disabled="loading"
          class="btn-primary w-full mt-2"
        >
          Установить баланс
        </button>
      </div>

      <!-- Уровень -->
      <div class="mb-4">
        <h4 class="font-bold mb-2">⭐ Уровень и опыт</h4>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Уровень</label>
            <input
              v-model.number="levelForm.level"
              type="number"
              min="1"
              class="input-field"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Опыт</label>
            <input
              v-model.number="levelForm.experience"
              type="number"
              min="0"
              class="input-field"
            />
          </div>
        </div>
        <button
          @click="updateLevel"
          :disabled="loading"
          class="btn-primary w-full mt-2"
        >
          Установить уровень
        </button>
      </div>

      <!-- Админ права -->
      <div class="mb-4">
        <button
          @click="toggleAdmin"
          :disabled="loading"
          :class="user.isAdmin ? 'btn-danger' : 'btn-success'"
          class="w-full"
        >
          {{ user.isAdmin ? '❌ Забрать админа' : '✅ Дать админа' }}
        </button>
      </div>

      <!-- Закрыть -->
      <button @click="$emit('close')" class="btn-secondary w-full">
        Закрыть
      </button>
    </div>
  </div>
</template>

<script setup>
import { useNotification } from '~/composables/useNotification'

const props = defineProps({
  user: Object,
})

const emit = defineEmits(['close', 'updated'])

const { success, error: showError } = useNotification()

const loading = ref(false)

const balanceForm = ref({
  coins: props.user.coins,
  gems: props.user.gems,
})

const levelForm = ref({
  level: props.user.level,
  experience: props.user.experience,
})

const updateBalance = async () => {
  loading.value = true
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    await $fetch(`${config.public.apiBase}/admin/users/${props.user.id}/balance`, {
      method: 'PUT',
      headers: authStore.getAuthHeader(),
      body: balanceForm.value,
    })

    success('💰 Баланс обновлен')
    emit('updated')
  } catch (error) {
    showError('Ошибка обновления баланса')
  } finally {
    loading.value = false
  }
}

const updateLevel = async () => {
  loading.value = true
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    await $fetch(`${config.public.apiBase}/admin/users/${props.user.id}/level`, {
      method: 'PUT',
      headers: authStore.getAuthHeader(),
      body: levelForm.value,
    })

    success('⭐ Уровень обновлен')
    emit('updated')
  } catch (error) {
    showError('Ошибка обновления уровня')
  } finally {
    loading.value = false
  }
}

const toggleAdmin = async () => {
  loading.value = true
  try {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    await $fetch(`${config.public.apiBase}/admin/users/${props.user.id}/toggle-admin`, {
      method: 'POST',
      headers: authStore.getAuthHeader(),
    })

    success(props.user.isAdmin ? '❌ Админ права отозваны' : '✅ Админ права выданы')
    emit('updated')
  } catch (error) {
    showError('Ошибка изменения прав')
  } finally {
    loading.value = false
  }
}
</script>

