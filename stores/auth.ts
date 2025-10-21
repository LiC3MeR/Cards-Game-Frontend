import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    token: null as string | null,
    isAuthenticated: false,
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          body: { email, password },
        })

        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true

        // Сохраняем токен
        if (process.client) {
          localStorage.setItem('token', response.token)
        }

        return response
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    async register(email: string, username: string, password: string) {
      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/auth/register`, {
          method: 'POST',
          body: { email, username, password },
        })

        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true

        // Сохраняем токен
        if (process.client) {
          localStorage.setItem('token', response.token)
        }

        return response
      } catch (error) {
        console.error('Register error:', error)
        throw error
      }
    },

    async fetchUser() {
      try {
        const config = useRuntimeConfig()
        const token = process.client ? localStorage.getItem('token') : null

        if (!token) {
          return
        }

        const user = await $fetch(`${config.public.apiBase}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        this.user = user
        this.token = token
        this.isAuthenticated = true
      } catch (error) {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false

      if (process.client) {
        localStorage.removeItem('token')
      }

      navigateTo('/auth/login')
    },

    getAuthHeader() {
      return {
        Authorization: `Bearer ${this.token}`,
      }
    },
  },
})

