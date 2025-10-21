<template>
  <div class="glass-effect sticky top-0 z-50 border-b border-gray-200">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <button @click="goBack" class="text-2xl">
        ←
      </button>
      <h1 class="text-xl font-bold text-gray-800">{{ title }}</h1>
      <button @click="logout" class="text-2xl">
        🚪
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  title: {
    type: String,
    default: 'Cards Game',
  },
})

const authStore = useAuthStore()
const router = useRouter()

const goBack = () => {
  router.back()
}

const { confirm: showConfirm } = useConfirm()

const logout = async () => {
  const confirmed = await showConfirm('Вы действительно хотите выйти?', {
    title: 'Выход',
    confirmText: 'Выйти',
    type: 'warning'
  })
  
  if (confirmed) {
    authStore.logout()
  }
}
</script>

