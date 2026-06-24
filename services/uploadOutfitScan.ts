import { OUTFIT_SCAN_URL } from './analyzeConfig';

const OUTFIT_SCAN_TIMEOUT_MS = 90_000;

export type OutfitScanResult = {
  compatibility_score: number;
  clothing_score: number;
  footwear_score: number | null;
};

export async function uploadOutfitScan(
  localFileUri: string,
  seasonTwelve: string,
): Promise<OutfitScanResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, OUTFIT_SCAN_TIMEOUT_MS);

  try {
    const form = new FormData();
    form.append('season_twelve', seasonTwelve);
    form.append('file', {
      uri: localFileUri,
      name: 'outfit.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    const response = await fetch(OUTFIT_SCAN_URL, {
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

    const body = JSON.parse(text) as OutfitScanResult;
    if (typeof body.compatibility_score !== 'number' || typeof body.clothing_score !== 'number') {
      throw new Error('Некорректный ответ сервера outfit/scan');
    }
    return body;
  } catch (e) {
    if (e !== null && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'AbortError') {
      throw new Error('Превышено время ожидания проверки образа.');
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (/network request failed/i.test(msg)) {
      throw new Error(
        `Нет связи с сервером (${OUTFIT_SCAN_URL}). Проверьте Wi‑Fi и что бэкенд запущен.`,
      );
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}
