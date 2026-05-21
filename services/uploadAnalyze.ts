import { ANALYZE_UPLOAD_URL } from './analyzeConfig';

const UPLOAD_TIMEOUT_MS = 45_000;

export async function uploadImageForAnalyze(localFileUri: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, UPLOAD_TIMEOUT_MS);

  try {
    const form = new FormData();
    form.append('file', {
      uri: localFileUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    const response = await fetch(ANALYZE_UPLOAD_URL, {
      method: 'POST',
      body: form,
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new Error('Ответ сервера не JSON');
    }
  } catch (e) {
    if (e !== null && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'AbortError') {
      throw new Error(
        'Превышено время ожидания ответа сервера. Проверьте адрес API, Wi‑Fi и что сервер доступен с телефона.',
      );
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}
