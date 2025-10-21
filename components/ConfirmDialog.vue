<template>
  <Transition name="modal">
    <div
      v-if="showDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click="handleCancel"
    >
      <div
        class="glass-effect rounded-2xl p-6 max-w-md w-full shadow-2xl border-2"
        :class="getBorderClass"
        @click.stop
      >
        <!-- Иконка -->
        <div class="flex justify-center mb-4">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            :class="getIconBgClass"
          >
            {{ getIcon }}
          </div>
        </div>

        <!-- Заголовок -->
        <h3 class="text-2xl font-bold text-center mb-3 text-white">
          {{ currentDialog?.title }}
        </h3>

        <!-- Сообщение -->
        <p class="text-center text-gray-300 mb-6">
          {{ currentDialog?.message }}
        </p>

        <!-- Кнопки -->
        <div class="flex gap-3">
          <button
            @click="handleCancel"
            class="flex-1 btn-secondary"
          >
            {{ currentDialog?.cancelText }}
          </button>
          <button
            @click="handleConfirm"
            class="flex-1"
            :class="getConfirmButtonClass"
          >
            {{ currentDialog?.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useConfirm } from '~/composables/useConfirm'

const { showDialog, currentDialog } = useConfirm()

const getIcon = computed(() => {
  const type = currentDialog.value?.type || 'warning'
  const icons = {
    danger: '⚠️',
    warning: '❓',
    info: 'ℹ️',
  }
  return icons[type]
})

const getIconBgClass = computed(() => {
  const type = currentDialog.value?.type || 'warning'
  const classes = {
    danger: 'bg-red-500/20',
    warning: 'bg-yellow-500/20',
    info: 'bg-blue-500/20',
  }
  return classes[type]
})

const getBorderClass = computed(() => {
  const type = currentDialog.value?.type || 'warning'
  const classes = {
    danger: 'border-red-500/50',
    warning: 'border-yellow-500/50',
    info: 'border-blue-500/50',
  }
  return classes[type]
})

const getConfirmButtonClass = computed(() => {
  const type = currentDialog.value?.type || 'warning'
  const classes = {
    danger: 'btn-danger',
    warning: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 px-6 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all',
    info: 'btn-primary',
  }
  return classes[type]
})

const handleConfirm = () => {
  currentDialog.value?.onConfirm()
}

const handleCancel = () => {
  currentDialog.value?.onCancel?.()
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .glass-effect,
.modal-leave-active .glass-effect {
  transition: all 0.3s ease;
}

.modal-enter-from .glass-effect {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .glass-effect {
  transform: scale(0.9) translateY(20px);
}
</style>

