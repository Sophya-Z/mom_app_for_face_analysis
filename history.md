# История работ

## 2026-06-04 — Бэкенд на порту 8082

- `analyzeConfig.ts`: `ANALYZE_UPLOAD_URL` → `http://192.168.0.113:8082/analyze`; try-on на том же порту (без отдельного 8002).
- Запуск: uvicorn `0.0.0.0:8082`, Expo `--lan`.

## 2026-06-04 — Интерактивный список оправ (вкладка «Форма лица»)

- Список оправ из JSON (через запятую) заменён на вертикальные кнопки (`GlassesFrameList`): тап — фото из `Оправы/`, повторный тап — сворачивает.
- `constants/glassesFrameImages.ts` — статический `require` для 8 оправ; `parseAnalysisResponse` собирает все блоки `glasses` и выбирает строку со списком (не предупреждение «очки на фото»).

## 2026-06-04 — Палитра цветотипа на экране результата

- Вкладка «Цветотип»: после текстового списка «Подходящие цвета» — блок «Палитра» (`ColorotypePalette`): сетка HEX-квадратов, 5 в ряд, перенос на следующие строки.
- Цвета из `constants/colorotypePalettes.ts` по ключу `seasonal_twelve` из ответа `/analyze` (не из API-текста). Заполнен пример `soft_summer` (5 оттенков); остальные 11 цветотипов — пустые массивы для самостоятельного дополнения.

## 2026-06-03 — Запуск dev: бэкенд + мобильное приложение

- Определён LAN IP ПК для Wi‑Fi: **192.168.0.113** (`Get-NetIPAddress`).
- Бэкенд: `D:\VKR_b\face-ai`, uvicorn `app.main:app` на `0.0.0.0:8000` (`.venv\Scripts\uvicorn.exe`).
- В `services/analyzeConfig.ts` URL обновлён на `http://192.168.0.113:8000/analyze` (был `192.168.1.35`).
- Запущен Expo: `npx expo start --lan` в `D:\VKR_M_APP`.
- Камера: обрезка снимка под видимую область видоискателя (`cropImageToViewfinder`, expo-image-manipulator) перед превью и отправкой.
- Главная: цветы уменьшены (~88×92) и перенесены под приветственный текст; «История» остаётся сверху слева.
- История: все изображения только локально — исходное фото, контур (`contour/`), макияж (`tryon/`); просмотр из истории без запросов к API.
- Сохранение сгенерированного макияжа в историю (`tryOnPhotoUri`); на детали из истории — блок «Подходящий макияж» без кнопки.
- Главная: кнопка «История» → экран сетки прошлых анализов (`analysisHistoryStore`, FileSystem); long press — удаление; tap — детальный результат без try-on.
- Кнопка «Проверить образ» на экране результата: галерея → `POST /outfit/scan` (`season_twelve` + фото) → блок `OutfitScanScores` (круг `compatibility_score`, строки одежда/обувь).
- Примерка макияжа: prefetch после контура без индикатора; по кнопке — спиннер ≥2 с, затем показ/скрытие (имитация генерации по нажатию).
- Вкладка «Цветотип»: try-on URL строится из `ANALYZE_UPLOAD_URL` с портом **8002** (`http://192.168.0.113:8002/try-on/photo`). `127.0.0.1` с телефона недоступен — была ошибка «network request failed». (`meta_json`: `season_twelve` из ответа `/analyze`, `categories: ["makeup"]`, `generative: true`, `use_mask: false` + файл). Результат — JPEG под кнопкой (224×320).
- **404 на контур лица:** мобильный клиент вызывает `POST /contour/final`, эндпоинта не было в `main.py`. Добавлен в `D:\VKR_b\face-ai\app\main.py`; исправлен `analyze_face` в `vendor/face_shape/final_contour.py` (возврат `(out, data)`, опциональные `output_path`/`json_path`).
- **500 на `/analyze`:** в логах бэкенда `TypeError: build_recommendations() takes 4 positional arguments but 5 were given` — в `orchestrator.py` передавался лишний `seasonal_sixteen`; исправлено в `D:\VKR_b\face-ai\app\pipeline\orchestrator.py`.
- QR в терминале Cursor не показывается (неинтерактивный вывод). Добавлены `scripts/expo-qr.html`, `scripts/show-expo-qr.ps1`, npm-скрипт `npm run qr` — открывает страницу с QR для `exp://<LAN-IP>:8081`.
