<template>
  <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" @click="close">
    <div class="glass-effect rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-purple-500/30" @click.stop>
      <!-- Заголовок -->
      <div class="text-center mb-6">
        <div class="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 class="text-4xl font-bold gradient-text mb-2">Поздравляем!</h2>
        <p class="text-gray-300 text-lg">Вы получили {{ cards.length }} карт!</p>
      </div>

      <!-- Проверка что карты есть -->
      <div v-if="cards && cards.length > 0" class="mb-6">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div 
            v-for="(userCard, index) in cards" 
            :key="index"
            class="transform hover:scale-105 transition-all"
            :style="`animation: fadeIn 0.5s ease-in-out ${index * 0.1}s both`"
          >
            <CardItem :card="userCard.card" />
          </div>
        </div>
      </div>

      <!-- Если карт нет -->
      <div v-else class="text-center py-8">
        <div class="text-4xl mb-4">❌</div>
        <p class="text-gray-400">Карты не загрузились</p>
      </div>

      <button @click="close" class="btn-primary w-full text-lg py-4">
        ✨ Отлично!
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup>
const props = defineProps({
  cards: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

