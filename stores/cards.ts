import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useCardsStore = defineStore('cards', {
  state: () => ({
    allCards: [] as any[],
    myCards: [] as any[],
    loading: false,
  }),

  getters: {
    cardsByRarity: (state) => {
      return state.myCards.reduce((acc, userCard) => {
        const rarity = userCard.card.rarity
        if (!acc[rarity]) {
          acc[rarity] = []
        }
        acc[rarity].push(userCard)
        return acc
      }, {} as Record<string, any[]>)
    },

    totalCards: (state) => state.myCards.length,
  },

  actions: {
    async fetchAllCards() {
      try {
        const config = useRuntimeConfig()
        this.loading = true

        const cards = await $fetch(`${config.public.apiBase}/cards`)
        this.allCards = cards
        
        return cards
      } catch (error) {
        console.error('Error fetching cards:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMyCards() {
      try {
        const authStore = useAuthStore()
        const config = useRuntimeConfig()
        this.loading = true

        const cards = await $fetch(`${config.public.apiBase}/cards/my/collection`, {
          headers: authStore.getAuthHeader(),
        })

        this.myCards = cards
        return cards
      } catch (error) {
        console.error('Error fetching my cards:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    getCardById(cardId: string) {
      return this.allCards.find(c => c.id === cardId)
    },
  },
})

