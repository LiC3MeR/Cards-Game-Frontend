import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useMarketStore = defineStore('market', {
  state: () => ({
    orders: [] as any[],
    myOrders: [] as any[],
    loading: false,
  }),

  actions: {
    async fetchOrders(rarity?: string) {
      try {
        const config = useRuntimeConfig()
        this.loading = true

        let url = `${config.public.apiBase}/market/orders`
        if (rarity) {
          url += `?rarity=${rarity}`
        }

        const orders = await $fetch(url)
        this.orders = orders

        return orders
      } catch (error) {
        console.error('Error fetching market orders:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createOrder(userCardId: string, price: number) {
      try {
        const authStore = useAuthStore()
        const config = useRuntimeConfig()
        this.loading = true

        const order = await $fetch(`${config.public.apiBase}/market/orders`, {
          method: 'POST',
          headers: authStore.getAuthHeader(),
          body: { userCardId, price },
        })

        await this.fetchOrders()
        await this.fetchMyOrders()

        return order
      } catch (error) {
        console.error('Error creating order:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async buyOrder(orderId: string) {
      try {
        const authStore = useAuthStore()
        const config = useRuntimeConfig()
        this.loading = true

        const result = await $fetch(`${config.public.apiBase}/market/orders/${orderId}/buy`, {
          method: 'POST',
          headers: authStore.getAuthHeader(),
        })

        await this.fetchOrders()

        return result
      } catch (error) {
        console.error('Error buying order:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async cancelOrder(orderId: string) {
      try {
        const authStore = useAuthStore()
        const config = useRuntimeConfig()
        this.loading = true

        const result = await $fetch(`${config.public.apiBase}/market/orders/${orderId}`, {
          method: 'DELETE',
          headers: authStore.getAuthHeader(),
        })

        await this.fetchMyOrders()

        return result
      } catch (error) {
        console.error('Error cancelling order:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMyOrders() {
      try {
        const authStore = useAuthStore()
        const config = useRuntimeConfig()

        const orders = await $fetch(`${config.public.apiBase}/market/my-orders`, {
          headers: authStore.getAuthHeader(),
        })

        this.myOrders = orders
        return orders
      } catch (error) {
        console.error('Error fetching my orders:', error)
        throw error
      }
    },
  },
})

