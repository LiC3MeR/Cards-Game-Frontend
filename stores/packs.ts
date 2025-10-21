import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useUserStore } from './user'
import { useCardsStore } from './cards'

export const usePacksStore = defineStore('packs', {
  state: () => ({
    packs: [] as any[],
    openedCards: [] as any[],
    loading: false,
  }),

  actions: {
    async fetchPacks() {
      try {
        const config = useRuntimeConfig()
        this.loading = true

        const packs = await $fetch(`${config.public.apiBase}/packs`)
        this.packs = packs

        return packs
      } catch (error) {
        console.error('Error fetching packs:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async openPack(packId: string) {
      try {
        const authStore = useAuthStore()
        const config = useRuntimeConfig()
        this.loading = true

        console.log('Requesting pack open:', packId)
        const result = await $fetch(`${config.public.apiBase}/packs/${packId}/open`, {
          method: 'POST',
          headers: authStore.getAuthHeader(),
        })

        console.log('Pack open response:', result)
        console.log('Cards received:', result.cards)

        this.openedCards = result.cards || []

        if (this.openedCards.length === 0) {
          console.warn('No cards in response!')
        }

        // Обновляем баланс и коллекцию
        const userStore = useUserStore()
        const cardsStore = useCardsStore()
        
        await userStore.fetchBalance()
        await cardsStore.fetchMyCards()

        return result
      } catch (error) {
        console.error('Error opening pack:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    clearOpenedCards() {
      this.openedCards = []
    },
  },
})

