# CreatorFlow — CRM для инфлюенс-маркетинга

Одностраничное React-приложение (Vite + Tailwind CSS v4): воронка сделок (Kanban с drag&drop),
база авторов, база знаний бренда, ERID-реестр по 38-ФЗ, публикации и аналитика с собственными SVG-графиками.

---

## Installation (Установка)

```bash
# 1. Клонировать репозиторий (или распаковать архив проекта)
git clone <url-репозитория> creatorflow && cd creatorflow

# 2. Установить все зависимости (production + dev)
npm install
```

Все зависимости уже зафиксированы в `package.json` / `package-lock.json` —
команда `npm install` поставит всё необходимое одной строкой.

### Зависимости, необходимые для запуска

**Runtime (используются приложением):**

| Пакет | Версия | Назначение |
|---|---|---|
| `react` | ^18.2.0 | UI-фреймворк |
| `react-dom` | ^18.2.0 | Рендеринг в DOM |
| `lucide-react` | ^0.294.0 | Иконки (стиль 1.5px, как в ТЗ) |

**Dev / сборка:**

| Пакет | Версия | Назначение |
|---|---|---|
| `vite` | ^6.3.5 | Сборщик и dev-сервер |
| `@vitejs/plugin-react` | ^4.3.4 | Поддержка React/JSX |
| `tailwindcss` | ^4.1.7 | CSS-фреймворк |
| `@tailwindcss/vite` | ^4.1.7 | Плагин Tailwind v4 для Vite |
| `typescript` | ~5.7.0 | Проверка типов (`npm run typecheck`) |
| `@types/react`, `@types/react-dom` | ^18.2.0 | Типы React |

> Остальные пакеты из `package.json` (framer-motion, recharts и т.п.) присутствуют
> в lock-файле, но кодом не используются — их можно удалить (`npm uninstall <пакет>`),
> на работу это не влияет.

---

## Getting Started (Начало работы)

### Структура проекта

```
index.html                Точка входа (шрифты Inter / Unbounded / JetBrains Mono)
src/
  main.tsx                Bootstrap React
  index.css               Tailwind v4 + дизайн-токены, анимации
  data.ts                 Типы и мок-данные (авторы, бренды, сделки, ERID, публикации)
  App.tsx                 Каркас: сайдбар, топбар, ⌘K-поиск, уведомления
  components/
    ui.tsx                Тосты, кнопки, бейджи, модалки, side-панели
    charts.tsx            Собственные SVG-графики (line, funnel, donut, gauge, scatter, карта РФ)
    icons.tsx             Иконки соцсетей, псевдо-QR, миниатюры постов
  screens/                Экраны: Kanban, DealPanel, KnowledgeBase, Authors,
                          AuthorProfile, ContractWizard, Erid, Analytics,
                          Publications, Lists
```

### Скрипты npm

| Команда | Что делает |
|---|---|
| `npm run dev` | Dev-сервер с HMR |
| `npm run build` | Production-сборка в `dist/` |
| `npm run typecheck` | Проверка типов TypeScript без сборки |

---

## Requirements (Требования)

- **Node.js ≥ 18.0** (Vite 6 требует Node 18+ или 20+; рекомендуется LTS 20/22)
- **npm ≥ 9** (или pnpm / yarn — lock-файл npm)
- Браузер: Chrome / Edge / Firefox / Safari последних двух версий
- Для production-раздачи — любой статический сервер (nginx, Caddy, `serve`, S3/CDN)

Проверка версии:

```bash
node -v   # v18.x или выше
npm -v    # 9.x или выше
```

---

## Run (Запуск)

### Режим разработки

```bash
npm run dev
```

Откроется dev-сервер на `http://localhost:5173` (порт покажет терминал).
Изменения подхватываются мгновенно (HMR).

### Production-сборка и раздача

```bash
# 1. Собрать проект
npm run build

# 2. Проверить сборку локально
npx vite preview          # http://localhost:4173
# или
npx serve dist            # http://localhost:3000
```

Результат сборки — папка `dist/` (один `index.html` + хэшированные JS/CSS-ассеты).
Для деплоя достаточно скопировать содержимое `dist/` на любой статический хостинг
(nginx, Netlify, Vercel, S3, любой VPS). Приложение полностью клиентское —
бэкенд, база данных и переменные окружения не требуются.

Пример блока nginx:

```nginx
server {
    listen 80;
    root /var/www/creatorflow/dist;
    try_files $uri $uri/ /index.html;
}
```
