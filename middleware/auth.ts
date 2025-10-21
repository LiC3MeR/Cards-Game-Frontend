import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Проверяем токен на клиенте
  if (process.client) {
    const token = localStorage.getItem('token')
    
    if (!token) {
      return navigateTo('/auth/login')
    }

    // Если пользователь еще не загружен, загружаем
    if (!authStore.isAuthenticated) {
      try {
        await authStore.fetchUser()
      } catch (error) {
        return navigateTo('/auth/login')
      }
    }
  }
})

