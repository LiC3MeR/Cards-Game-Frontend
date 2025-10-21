<template>
  <div class="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="getNotificationClass(notification.type)"
        class="glass-effect rounded-xl p-4 shadow-2xl border-l-4 flex items-start gap-3 cursor-pointer"
        @click="remove(notification.id)"
      >
        <div class="text-2xl">{{ getIcon(notification.type) }}</div>
        <div class="flex-1">
          <p class="text-white font-medium">{{ notification.message }}</p>
        </div>
        <button
          @click.stop="remove(notification.id)"
          class="text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotification } from '~/composables/useNotification'

const { notifications, remove } = useNotification()

const getNotificationClass = (type) => {
  const classes = {
    success: 'border-green-500 bg-green-900/80',
    error: 'border-red-500 bg-red-900/80',
    warning: 'border-yellow-500 bg-yellow-900/80',
    info: 'border-blue-500 bg-blue-900/80',
  }
  return classes[type] || classes.info
}

const getIcon = (type) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}
</style>

