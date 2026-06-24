import { TRY_ON_PHOTO_URL } from './analyzeConfig';

const TRY_ON_TIMEOUT_MS = 120_000;

export type TryOnMakeupMeta = {
  season_twelve: string;
  categories: ['makeup'];
  generative: true;
  use_mask: false;
};

type TryOnBranchResult = {
  composite_b64?: string;
};

type TryOnPhotoResult = {
  generative?: TryOnBranchResult | null;
  cv?: TryOnBranchResult | null;
  active_mode?: string;
};

function compositeB64FromResponse(body: TryOnPhotoResult): string {
  const gen = body.generative?.composite_b64;
  if (typeof gen === 'string' && gen.length > 0) {
    return gen;
  }
  const cv = body.cv?.composite_b64;
  if (typeof cv === 'string' && cv.length > 0) {
    return cv;
  }
  throw new Error('Сервер не вернул изображение try-on');
}

export async function fetchTryOnMakeupPhotoDataUri(
  localFileUri: string,
  seasonTwelve: string,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TRY_ON_TIMEOUT_MS);

  const meta: TryOnMakeupMeta = {
    season_twelve: seasonTwelve,
    categories: ['makeup'],
    generative: true,
    use_mask: false,
  };

  try {
    const form = new FormData();
    form.append('meta_json', JSON.stringify(meta));
    form.append('file', {
      uri: localFileUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);

    const response = await fetch(TRY_ON_PHOTO_URL, {
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

    let body: TryOnPhotoResult;
    try {
      body = JSON.parse(text) as TryOnPhotoResult;
    } catch {
      throw new Error('Ответ try-on не JSON');
    }

    const b64 = compositeB64FromResponse(body);
    return `data:image/jpeg;base64,${b64}`;
  } catch (e) {
    if (e !== null && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'AbortError') {
      throw new Error('Превышено время ожидания генерации макияжа.');
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (/network request failed/i.test(msg)) {
      throw new Error(
        `Нет связи с сервером try-on (${TRY_ON_PHOTO_URL}). Проверьте Wi‑Fi, что бэкенд запущен с --host 0.0.0.0, и IP в analyzeConfig.ts.`,
      );
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}
