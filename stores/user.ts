import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as any,
    balance: {
      coins: 0,
      gems: 0,
    },
  }),

  actions: {
    async fetchProfile() {
      try {
        const authStore = useAuthStore()
        const config = useRuntimeConfig()

        const profile = await $fetch(`${config.public.apiBase}/users/profile`, {
          headers: authStore.getAuthHeader(),
        })

        this.profile = profile
        this.balance.coins = profile.coins
        this.balance.gems = profile.gems

        return profile
      } catch (error) {
        console.error('Error fetching profile:', error)
        throw error
      }
    },

    async fetchBalance() {
      try {
        const authStore = useAuthStore()
        const config = useRuntimeConfig()

        const balance = await $fetch(`${config.public.apiBase}/economy/balance`, {
          headers: authStore.getAuthHeader(),
        })

        this.balance = balance
        return balance
      } catch (error) {
        console.error('Error fetching balance:', error)
        throw error
      }
    },

    async claimDailyBonus() {
      try {
        const authStore = useAuthStore()
        const config = useRuntimeConfig()

        const result = await $fetch(`${config.public.apiBase}/economy/daily-bonus`, {
          method: 'POST',
          headers: authStore.getAuthHeader(),
        })

        if (result.success) {
          await this.fetchBalance()
        }

        return result
      } catch (error) {
        console.error('Error claiming daily bonus:', error)
        throw error
      }
    },
  },
})

