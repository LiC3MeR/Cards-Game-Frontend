import { ref } from 'vue'

interface ConfirmDialog {
  message: string
  title?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel?: () => void
}

const showDialog = ref(false)
const currentDialog = ref<ConfirmDialog | null>(null)

export const useConfirm = () => {
  const confirm = (
    message: string,
    options: {
      title?: string
      confirmText?: string
      cancelText?: string
      type?: 'danger' | 'warning' | 'info'
    } = {}
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      currentDialog.value = {
        message,
        title: options.title || 'Подтверждение',
        confirmText: options.confirmText || 'Да',
        cancelText: options.cancelText || 'Отмена',
        type: options.type || 'warning',
        onConfirm: () => {
          showDialog.value = false
          resolve(true)
        },
        onCancel: () => {
          showDialog.value = false
          resolve(false)
        },
      }
      showDialog.value = true
    })
  }

  const hide = () => {
    showDialog.value = false
    currentDialog.value = null
  }

  return {
    confirm,
    hide,
    showDialog,
    currentDialog,
  }
}

