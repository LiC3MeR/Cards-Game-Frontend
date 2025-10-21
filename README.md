# Frontend - Cards Game

Nuxt 3 frontend для карточной игры с PWA поддержкой.

## 🚀 Установка

```bash
npm install
```

## ⚙️ Конфигурация

Создайте `.env` файл:

```env
API_BASE_URL=http://localhost:3000/api
```

## 🏃 Запуск

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Превью
npm run preview
```

## 📱 Страницы

- `/` - Главная (профиль, статистика)
- `/auth/login` - Вход
- `/auth/register` - Регистрация
- `/packs` - Магазин паков
- `/collection` - Коллекция карт
- `/market` - Торговая площадка

## 🎨 UI Компоненты

### NavBar
Верхняя навигация с кнопками "Назад" и "Выход"

### BottomNav
Нижняя навигация (Главная, Паки, Коллекция, Рынок)

### CardItem
Карточка для отображения в коллекции

### PackOpenModal
Модальное окно с результатами открытия пака

### SellCardForm
Форма для выставления карты на продажу

## 🗂️ Stores (Pinia)

### authStore
- `login()` - Вход
- `register()` - Регистрация
- `logout()` - Выход
- `fetchUser()` - Получить текущего пользователя

### userStore
- `fetchProfile()` - Профиль пользователя
- `fetchBalance()` - Баланс
- `claimDailyBonus()` - Ежедневный бонус

### cardsStore
- `fetchAllCards()` - Все карты
- `fetchMyCards()` - Моя коллекция
- `cardsByRarity` - Карты по редкости (getter)

### packsStore
- `fetchPacks()` - Доступные паки
- `openPack()` - Открыть пак
- `clearOpenedCards()` - Очистить результаты

### marketStore
- `fetchOrders()` - Активные ордера
- `createOrder()` - Создать ордер
- `buyOrder()` - Купить карту
- `cancelOrder()` - Отменить ордер
- `fetchMyOrders()` - Мои ордера

## 🎨 Стили

### Tailwind Classes

**Кнопки:**
- `.btn-primary` - Основная кнопка
- `.btn-secondary` - Второстепенная кнопка

**Инпуты:**
- `.input-field` - Поле ввода

**Эффекты:**
- `.glass-effect` - Эффект матового стекла

**Редкость карт:**
- `.card-rarity-common` - Обычная
- `.card-rarity-rare` - Редкая
- `.card-rarity-epic` - Эпическая
- `.card-rarity-legendary` - Легендарная
- `.card-rarity-mythic` - Мифическая (с анимацией)

## 📱 PWA

Приложение поддерживает установку как PWA:

1. Откройте в Chrome на мобильном
2. Нажмите "Добавить на главный экран"
3. Используйте как нативное приложение

Конфигурация в `nuxt.config.ts`:

```typescript
pwa: {
  manifest: {
    name: 'Cards Game',
    short_name: 'Cards',
    theme_color: '#4F46E5',
    display: 'standalone',
    orientation: 'portrait',
  }
}
```

## 🔒 Middleware

### auth.ts
Проверяет наличие JWT токена и редиректит на `/auth/login` если не авторизован.

Использование:
```vue
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

## 🎨 Анимации

- `animate-card-flip` - Анимация переворота карты
- `animate-card-glow` - Эффект свечения для мифических карт
- `animate-bounce-slow` - Медленное подпрыгивание

## 📝 Примеры использования

### Вызов API

```typescript
const config = useRuntimeConfig()
const authStore = useAuthStore()

const data = await $fetch(`${config.public.apiBase}/cards`, {
  headers: authStore.getAuthHeader()
})
```

### Работа со Stores

```typescript
import { useCardsStore } from '~/stores/cards'

const cardsStore = useCardsStore()
await cardsStore.fetchMyCards()

const cards = computed(() => cardsStore.myCards)
```

## 🐛 Troubleshooting

### Не работает PWA
Убедитесь что используете HTTPS или localhost

### Ошибки авторизации
Проверьте что токен сохраняется в localStorage и не истек

### API не доступен
Проверьте `API_BASE_URL` в `.env`

