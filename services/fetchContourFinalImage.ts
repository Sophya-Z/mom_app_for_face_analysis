import { CONTOUR_FINAL_URL } from './analyzeConfig';

const CONTOUR_TIMEOUT_MS = 45_000;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function mimeFromContentType(ct: string | null): string {
  if (!ct) {
    return 'image/jpeg';
  }
  const part = ct.split(';')[0]?.trim();
  return part && part.length > 0 ? part : 'image/jpeg';
}

export async function fetchContourFinalImageDataUri(localFileUri: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, CONTOUR_TIMEOUT_MS);

  try {
    const form = new FormData();
    form.append('file', {
      uri: localFileUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    const response = await fetch(CONTOUR_FINAL_URL, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
    }

    const mime = mimeFromContentType(response.headers.get('Content-Type'));
    const buf = await response.arrayBuffer();
    const b64 = arrayBufferToBase64(buf);
    return `data:${mime};base64,${b64}`;
  } catch (e) {
    if (e !== null && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'AbortError') {
      throw new Error('Превышено время ожидания изображения контура.');
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}
