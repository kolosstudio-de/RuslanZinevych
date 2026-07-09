# Ruslan Zinevych — Portfolio

Официальный сайт тенора Руслана Зиневича: **https://ruslanzinevych.de**

Vite + React + Tailwind. Хостинг — Vercel, деплой автоматический: любой пуш
в ветку `main` собирает и публикует сайт.

## Как обновить сайт

```bash
git add -A
git commit -m "описание изменений"
git push
```

Через ~1 минуту изменения живые. Статус сборок: https://vercel.com/info-96752013s-projects/ruslan-zinevych-portfolio

## Как добавить фото в галерею

1. Положить оригиналы в папку `../фото вебсайт/`
2. Запустить `python3 process_images.py` (нужен Pillow: `pip install pillow`)
3. Скрипт сожмёт фото в `public/gallery/` и обновит `src/galleryData.json`
4. Закоммитить и запушить

Порядок фото: сначала список `FEATURED` в `process_images.py` (лучшие кадры),
остальные — по алфавиту. Файл `фото на главную страницу.jpg` в галерею не
попадает — это фон главной страницы (`public/hero.jpg`).

## Локальная разработка

```bash
npm install
npm run dev       # дев-сервер
npm run build     # сборка в dist/
npm run preview   # предпросмотр сборки
```
