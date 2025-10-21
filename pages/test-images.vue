<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-6">🖼️ Тест изображений</h1>

    <div class="space-y-4">
      <!-- Тест прямого URL -->
      <div class="glass-effect rounded-xl p-4">
        <h2 class="font-bold mb-2">Тест 1: Прямой URL</h2>
        <img 
          src="/images/cards/джек-фонарь_1761048659643.jpg"
          alt="Test"
          class="w-32 h-48 object-cover rounded"
          @load="() => console.log('✅ Image 1 loaded')"
          @error="(e) => console.error('❌ Image 1 failed', e)"
        />
        <p class="text-sm mt-2">/images/cards/джек-фонарь_1761048659643.jpg</p>
      </div>

      <!-- Тест карт из API -->
      <div class="glass-effect rounded-xl p-4">
        <h2 class="font-bold mb-2">Тест 2: Карты из API</h2>
        <button @click="loadCards" class="btn-primary mb-4">Загрузить карты</button>
        
        <div v-if="cards.length > 0" class="grid grid-cols-4 gap-4">
          <div v-for="card in cards.slice(0, 8)" :key="card.id" class="border rounded p-2">
            <img 
              :src="card.imageUrl"
              :alt="card.name"
              class="w-full h-32 object-cover rounded mb-2"
              @load="() => console.log('✅ Loaded:', card.imageUrl)"
              @error="(e) => { console.error('❌ Failed:', card.imageUrl); e.target.src = '' }"
            />
            <p class="text-xs truncate">{{ card.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ card.imageUrl }}</p>
          </div>
        </div>
      </div>

      <!-- Список всех файлов -->
      <div class="glass-effect rounded-xl p-4">
        <h2 class="font-bold mb-2">Доступные файлы:</h2>
        <div class="text-xs text-gray-300 space-y-1">
          <div>/images/cards/джек-фонарь_1761048659643.jpg</div>
          <div>/images/cards/зловещая_тыква_1761048564066.jpg</div>
          <div>/images/cards/испуганный_призрак_1761048466810.jpg</div>
          <div>/images/packs/мешок_сладостей_1761048840715.jpg</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const cards = ref([])

const loadCards = async () => {
  const config = useRuntimeConfig()
  const data = await $fetch(`${config.public.apiBase}/cards`)
  cards.value = data
  console.log('Cards loaded:', data.length)
  console.log('First card imageUrl:', data[0]?.imageUrl)
}
</script>

