<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-effect rounded-2xl p-8 w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
        🎴 Cards Game
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            class="input-field"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Пароль</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            minlength="6"
            class="input-field"
            placeholder="••••••"
          />
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="btn-primary w-full"
        >
          {{ loading ? 'Загрузка...' : 'Войти' }}
        </button>

        <p v-if="error" class="text-red-600 text-sm text-center">{{ error }}</p>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Нет аккаунта?
          <NuxtLink to="/auth/register" class="text-primary-600 font-semibold hover:underline">
            Зарегистрироваться
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const { error: showError } = useNotification()

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = 'Неверный email или пароль'
    showError('Неверный email или пароль')
  } finally {
    loading.value = false
  }
}
</script>

