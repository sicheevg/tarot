# Таро Марсель · версия 8 (офлайн)

Адрес: https://sicheevg.github.io/tarot/

- Работает полностью без интернета и без аккаунтов: Puter и ИИ-сервисы удалены.
- Алгоритм толкования «Путь Ходоровски» — `engine.js`, тексты — `data-ru.js` и `data-en.js`.
- Изображения — колода Jean Dodal (около 1701 г.), общественное достояние, Wikimedia Commons; хранятся в `cards/`.
- Офлайн-кэш — `sw.js` (при обновлении файлов меняйте `CACHE` и `?v=` в `index.html`).
- Тесты: `npm i --no-save playwright && npx playwright install webkit chromium && node offline.test.cjs` → `test-results.json`.
- Описание метода и источники — `METHOD.md`.
