<p align="center">
  <img src="public/logo.svg" alt="AI-Records Logo" width="80" height="80" />
</p>

<h1 align="center">AI-Records</h1>

<p align="center">
  <strong>Платформа за създаване на българска музика от ново поколение</strong>
</p>

<p align="center">
  <a href="#функционалности">Функционалности</a> •
  <a href="#технологии">Технологии</a> •
  <a href="#инсталация">Инсталация</a> •
  <a href="#структура">Структура</a> •
  <a href="#api">API</a> •
  <a href="#лиценз">Лиценз</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Latest-3FCF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
</p>

---

## Общ преглед

**AI-Records** е модерна SaaS платформа за създаване на професионални български текстове за песни и генериране на музика. Платформата комбинира интуитивен потребителски интерфейс с мощни инструменти за музикално творчество.

### Защо AI-Records?

- 🇧🇬 **100% Български** — Специализирано в българския език с правилна граматика и рими
- 🎵 **8 Музикални Стила** — Поп, чалга, рок, фолк, R&B, хип-хоп и още
- ⚡ **Бързо Генериране** — Текстове в реално време с streaming
- 🎧 **Вграден Плейър** — Слушай и управлявай своите творби
- 💳 **Кредитна Система** — Гъвкаво ценообразуване за всеки бюджет

---

## Функционалности

### Основни

| Функция | Описание |
|---------|----------|
| **Генератор на текстове** | Създавай професионални текстове с метатагове за структура |
| **Генератор на музика** | Превръщай текстове в пълноценни песни |
| **Музикална библиотека** | Управлявай и слушай генерираните творби |
| **Потребителски профил** | Персонализирани настройки и история |

### Административни

| Функция | Описание |
|---------|----------|
| **Табло за управление** | Статистики за потребители и генерации |
| **Управление на потребители** | Преглед и модификация на акаунти |
| **Системен мониторинг** | Статус на API и услуги |
| **Финансови отчети** | Преглед на абонаменти и приходи |

---

## Технологии

### Frontend

```
Next.js 16.1        — React framework с App Router
React 19            — UI библиотека
TypeScript 5        — Type-safe JavaScript
Tailwind CSS 4      — Utility-first CSS
Framer Motion       — Анимации
Lucide React        — Икони
```

### Backend & Infrastructure

```
Supabase            — База данни, Auth, Storage
Zustand             — State management
React Hook Form     — Форми с валидация
Zod                 — Schema валидация
```

### Инструменти за разработка

```
ESLint              — Linting
Prettier            — Code formatting
Turbopack           — Bundler
pnpm/npm            — Package manager
```

---

## Инсталация

### Изисквания

- Node.js 20.x или по-нова версия
- npm, yarn или pnpm
- Supabase акаунт

### Стъпки

```bash
# 1. Клонирай репозиторито
git clone https://github.com/your-org/ai-records.git
cd ai-records

# 2. Инсталирай зависимостите
npm install

# 3. Конфигурирай environment variables
cp .env.example .env.local

# 4. Стартирай development сървър
npm run dev
```

### Environment Variables

Създай `.env.local` файл в root директорията:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter (за генериране на текстове)
OPENROUTER_API_KEY=your_openrouter_key

# SUNO API (за генериране на музика)
SUNO_API_KEY=your_suno_api_key
SUNO_API_BASE_URL=https://api.sunoapi.com
```

---

## Структура

```
ai-records/
├── public/                     # Статични файлове
│   ├── audio/                  # Демо песни
│   ├── robots.txt              # SEO
│   └── sitemap.xml             # SEO
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/            # Admin панел (route group)
│   │   │   └── admin/
│   │   ├── (auth)/             # Auth страници (route group)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Dashboard (route group)
│   │   │   ├── dashboard/
│   │   │   ├── player/
│   │   │   ├── settings/
│   │   │   └── studio/
│   │   ├── about/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── pricing/
│   │   ├── privacy/
│   │   ├── terms/
│   │   ├── api/                # API Routes
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── not-found.tsx       # 404 страница
│   │
│   ├── components/
│   │   ├── admin/              # Admin компоненти
│   │   ├── auth/               # Auth компоненти
│   │   ├── landing/            # Landing page секции
│   │   ├── layout/             # Layout компоненти
│   │   ├── studio/             # Studio компоненти
│   │   └── ui/                 # UI примитиви
│   │
│   ├── lib/
│   │   ├── supabase/           # Supabase client & types
│   │   ├── types.ts            # TypeScript типове
│   │   └── utils.ts            # Utility функции
│   │
│   └── store/
│       └── userStore.ts        # Zustand store
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## API

### Endpoints

#### Генериране на текстове

```http
POST /api/generate
Content-Type: application/json

{
  "style": "chalga",
  "mood": "romantic",
  "topic": "Любов и раздяла"
}
```

**Response:** Server-Sent Events (SSE) stream

#### Генериране на музика

```http
POST /api/suno/generate
Content-Type: application/json

{
  "style": "pop",
  "mood": "happy",
  "lyrics": "[Verse]\nТекст на песента...",
  "customPrompt": "Female vocals, 120 BPM"
}
```

#### Проверка на статус

```http
GET /api/suno/status?taskId={taskId}
```

#### Управление на кредити

```http
GET /api/credits
POST /api/credits
```

---

## База данни

### Схема

```sql
-- Потребителски профили
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 10,
  subscription_tier TEXT DEFAULT 'FREE',
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Генерации
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL, -- 'lyrics' | 'music'
  style TEXT NOT NULL,
  mood TEXT NOT NULL,
  input_text TEXT,
  output_text TEXT,
  audio_url TEXT,
  credits_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Песни
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  lyrics TEXT,
  audio_url TEXT NOT NULL,
  style TEXT,
  mood TEXT,
  duration INTEGER,
  is_public BOOLEAN DEFAULT FALSE,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Скриптове

```bash
# Development
npm run dev           # Стартирай dev сървър
npm run build         # Production build
npm run start         # Стартирай production сървър
npm run lint          # Провери за lint грешки
npm run type-check    # TypeScript проверка
```

---

## Deployment

### Vercel (Препоръчително)

1. Свържи GitHub репозиторито с Vercel
2. Добави environment variables
3. Deploy автоматично при push към `main`

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Принос

Приветстваме приноси към проекта! Моля, следвай тези стъпки:

1. Fork репозиторито
2. Създай feature branch (`git checkout -b feature/amazing-feature`)
3. Commit промените (`git commit -m 'Add amazing feature'`)
4. Push към branch (`git push origin feature/amazing-feature`)
5. Отвори Pull Request

### Стандарти за код

- Използвай TypeScript за всички нови файлове
- Следвай ESLint конфигурацията
- Пиши смислени commit съобщения
- Добавяй типове за всички функции и компоненти

---

## Roadmap

### Q1 2026
- [x] Генератор на текстове
- [x] Интеграция с музикално API
- [x] Потребителска автентикация
- [x] Кредитна система

### Q2 2026
- [ ] Мобилно приложение (React Native)
- [ ] Колаборативно редактиране
- [ ] AI гласово генериране
- [ ] Разширен плейър с визуализации

### Q3 2026
- [ ] Marketplace за текстове
- [ ] Интеграция със стрийминг платформи
- [ ] API за външни разработчици

---

## Лиценз

Този проект е лицензиран под [MIT License](LICENSE).

---

## Контакти

- **Уебсайт:** [ai-records.com](https://ai-records.com)
- **Имейл:** support@ai-records.com
- **GitHub:** [github.com/your-org/ai-records](https://github.com/your-org/ai-records)

---

<p align="center">
  Направено с ❤️ в България
</p>

<p align="center">
  <sub>© 2026 AI-Records. Всички права запазени.</sub>
</p>
