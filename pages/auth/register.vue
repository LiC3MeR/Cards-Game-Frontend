<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-effect rounded-2xl p-8 w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
        🎴 Регистрация
      </h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
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
          <label class="block text-sm font-semibold text-gray-700 mb-2">Имя пользователя</label>
          <input 
            v-model="username" 
            type="text" 
            required 
            minlength="3"
            maxlength="20"
            class="input-field"
            placeholder="username"
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
          {{ loading ? 'Загрузка...' : 'Зарегистрироваться' }}
        </button>

        <p v-if="error" class="text-red-600 text-sm text-center">{{ error }}</p>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Уже есть аккаунт?
          <NuxtLink to="/auth/login" class="text-primary-600 font-semibold hover:underline">
            Войти
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
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const { error: showError, success } = useNotification()

const handleRegister = async () => {
  loading.value = true
  error.value = ''

  try {
    await authStore.register(email.value, username.value, password.value)
    success('✅ Регистрация успешна!')
    router.push('/')
  } catch (err) {
    error.value = 'Ошибка регистрации. Email или username уже заняты.'
    showError('Email или username уже заняты')
  } finally {
    loading.value = false
  }
}
</script>

