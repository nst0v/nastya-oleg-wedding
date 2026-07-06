# Wedding invitation

Статическая mobile-first страница свадебного приглашения.

## Файлы

- `index.html` — разметка приглашения.
- `styles.css` — адаптивная верстка, типографика и декоративные блоки.
- `script.js` — кнопка музыки и отправка RSVP-формы в Google Таблицу.
- `google-apps-script.js` — код Google Apps Script для записи RSVP в таблицу.
- `img/blossom/` — локальные ассеты приглашения.

## Как открыть

Откройте `index.html` в браузере. Страница рассчитана на мобильный viewport, на desktop показывается заглушка.

## RSVP без VPN

Форма отправляет ответы напрямую в Google Таблицу через Google Apps Script Web App:

`https://script.google.com/macros/s/AKfycbzD3GGT68gdbmWixYG8Gyf8lKisPIY7TTzumF5iYQiYUYuXPS5sBh6IfoQ1sPnhjr1baQ/exec`

Apps Script должен принимать POST-поле `payload` с JSON-ответом формы. Запрос отправляется как `application/x-www-form-urlencoded` в режиме `no-cors`, чтобы форма работала с GitHub Pages и кастомного домена.

Код для Google Apps Script лежит в `google-apps-script.js`. После любых изменений в Apps Script нужно открыть `Deploy` → `Manage deployments` → выбрать текущий Web App → `Edit` → `New version` → `Deploy`, иначе опубликованный URL продолжит выполнять старую версию.

## Данные приглашения

- Пара: Олег и Анастасия.
- Дата: 22 августа 2026.
- Место: “Оранжевая ферма”, Владимир.
- Палитра: фон Light Yellow `#FFFFC5`, акцент Brick Orange `#C14A09`.

## Временные файлы

Папки `reference/`, `current/` и `tools/` использовались только для промежуточной проверки скриншотов и удалены из проекта.

