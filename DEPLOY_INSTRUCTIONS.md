# Инструкции по деплою

## 1. Создание репозитория на GitHub

Выполните следующие команды в терминале:

```bash
# Убедитесь, что вы в директории проекта
cd /Users/vvv/kg1

# Создайте репозиторий на GitHub (через веб-интерфейс):
# 1. Перейдите на https://github.com/new
# 2. Название репозитория: kg1
# 3. Выберите Public или Private
# 4. НЕ инициализируйте с README, .gitignore или лицензией
# 5. Нажмите "Create repository"

# Затем подключите удаленный репозиторий:
git remote add origin https://github.com/YOUR_USERNAME/kg1.git

# Замените YOUR_USERNAME на ваш GitHub username

# Отправьте код:
git branch -M main
git push -u origin main
```

## 2. Деплой в Vercel

### Вариант 1: Через веб-интерфейс Vercel

1. Перейдите на https://vercel.com
2. Войдите в аккаунт (можно через GitHub)
3. Нажмите "Add New Project"
4. Импортируйте репозиторий `kg1` из GitHub
5. Vercel автоматически определит настройки для Vite
6. **ВАЖНО: Добавьте переменные окружения перед деплоем!**
   - В разделе "Environment Variables" добавьте:
     - `VITE_TELEGRAM_BOT_TOKEN` = `8136331739:AAEB_664JnOr65ck8uaewLluwA_Unrwg9N8`
     - `VITE_TELEGRAM_CHAT_ID` = `-1003685986044`
   - Выберите все окружения (Production, Preview, Development)
7. Нажмите "Deploy"

### Вариант 2: Через Vercel CLI

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в Vercel
vercel login

# Деплой проекта
cd /Users/vvv/kg1
vercel

# Следуйте инструкциям в терминале
```

## Настройки проекта

Проект уже настроен для Vercel:
- ✅ `vercel.json` создан с правильными настройками
- ✅ Build команда: `npm run build`
- ✅ Output директория: `dist`
- ✅ Framework: Vite

После деплоя ваш сайт будет доступен по адресу вида: `https://kg1.vercel.app`

## 3. Настройка переменных окружения в Vercel (ОБЯЗАТЕЛЬНО!)

**Если формы не работают, скорее всего проблема в отсутствии переменных окружения!**

### Как добавить переменные окружения в Vercel:

1. Перейдите на https://vercel.com
2. Откройте ваш проект `kg1`
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте следующие переменные:

   | Имя переменной | Значение | Окружения |
   |---------------|----------|-----------|
   | `VITE_TELEGRAM_BOT_TOKEN` | `8136331739:AAEB_664JnOr65ck8uaewLluwA_Unrwg9N8` | Production, Preview, Development |
   | `VITE_TELEGRAM_CHAT_ID` | `-1003685986044` | Production, Preview, Development |

5. После добавления переменных **обязательно передеплойте проект**:
   - Перейдите в раздел **Deployments**
   - Найдите последний деплой
   - Нажмите на три точки (⋯) → **Redeploy**

### Как проверить, что переменные загружены:

**Способ 1: Использовать файл проверки (рекомендуется)**

1. Скопируйте файл `check-env.html` в папку `public/` вашего проекта
2. После деплоя откройте `https://ваш-сайт.vercel.app/check-env.html`
3. Файл автоматически покажет, какие переменные загружены, а какие отсутствуют

**Способ 2: Через консоль браузера**

1. Откройте консоль браузера (F12) на вашем сайте
2. В консоли выполните:
   ```javascript
   console.log('Token:', import.meta.env.VITE_TELEGRAM_BOT_TOKEN);
   console.log('Chat ID:', import.meta.env.VITE_TELEGRAM_CHAT_ID);
   ```
3. Если переменные не определены (undefined), значит они не загружены в Vercel

### Альтернативный способ через Vercel CLI:

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в Vercel
vercel login

# Добавьте переменные окружения
vercel env add VITE_TELEGRAM_BOT_TOKEN
# Введите значение: 8136331739:AAEB_664JnOr65ck8uaewLluwA_Unrwg9N8
# Выберите окружения: Production, Preview, Development

vercel env add VITE_TELEGRAM_CHAT_ID
# Введите значение: -1003685986044
# Выберите окружения: Production, Preview, Development

# Передеплойте проект
vercel --prod
```

## 4. Проверка работы форм

После настройки переменных окружения и передеплоя:

1. Откройте ваш сайт на Vercel
2. Попробуйте отправить форму
3. Если форма не работает:
   - Откройте консоль браузера (F12)
   - Проверьте ошибки в консоли
   - Проверьте вкладку Network, чтобы увидеть запросы к Telegram API
   - Убедитесь, что переменные окружения добавлены в Vercel
