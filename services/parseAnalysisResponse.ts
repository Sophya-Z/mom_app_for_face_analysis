const FACE_SHAPE_EN_TO_RU: Record<string, string> = {
  oval: 'Овальное',
  ellipse: 'Овальное',
  elliptical: 'Овальное',
  round: 'Круглое',
  square: 'Квадратное',
  heart: 'Сердцевидное',
  diamond: 'Ромбовидное',
  oblong: 'Прямоугольное',
  rectangular: 'Прямоугольное',
  rectangle: 'Прямоугольное',
  triangle: 'Треугольное',
  inverted_triangle: 'Перевёрнутый треугольник',
  'inverted triangle': 'Перевёрнутый треугольник',
};

const FACE_SHAPE_KEYS = [
  'face_shape',
  'faceShape',
  'face_form',
  'forma_lica',
  'форма_лица',
] as const;

function collectCategoryDetails(node: unknown, out: Map<string, string>): void {
  if (node === null || node === undefined) {
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      collectCategoryDetails(item, out);
    }
    return;
  }
  if (typeof node !== 'object') {
    return;
  }
  const o = node as Record<string, unknown>;
  if (typeof o.category === 'string' && typeof o.detail === 'string') {
    if (!out.has(o.category)) {
      out.set(o.category, o.detail);
    }
  }
  for (const v of Object.values(o)) {
    collectCategoryDetails(v, out);
  }
}

function findCategoryDetail(data: unknown, category: string): string | undefined {
  const map = new Map<string, string>();
  collectCategoryDetails(data, map);
  return map.get(category);
}

function readFaceShapeFromObject(o: Record<string, unknown>): string | undefined {
  for (const key of FACE_SHAPE_KEYS) {
    const v = o[key];
    if (typeof v === 'string' && v.trim() !== '') {
      return v.trim();
    }
  }
  return undefined;
}

function getRawFaceShapeFromGeometryBlock(geom: unknown): string | undefined {
  if (geom === null || geom === undefined || typeof geom !== 'object') {
    return undefined;
  }
  return readFaceShapeFromObject(geom as Record<string, unknown>);
}

function getRawFaceShapeShallow(data: unknown): string | undefined {
  if (data === null || data === undefined || typeof data !== 'object') {
    return undefined;
  }
  const root = data as Record<string, unknown>;

  const fromRoot = readFaceShapeFromObject(root);
  if (fromRoot !== undefined) {
    return fromRoot;
  }

  const geomKeys = ['геометрия', 'geometry', 'Геометрия'];
  for (const gk of geomKeys) {
    const found = getRawFaceShapeFromGeometryBlock(root[gk]);
    if (found !== undefined) {
      return found;
    }
  }

  const wrapperKeys = ['analysis', 'result', 'data', 'response', 'payload', 'output', 'body'];
  for (const wk of wrapperKeys) {
    const inner = root[wk];
    if (inner !== null && inner !== undefined && typeof inner === 'object') {
      const nested = getRawFaceShapeShallow(inner);
      if (nested !== undefined) {
        return nested;
      }
    }
  }

  return undefined;
}

function getRawFaceShapeRecursive(node: unknown, depth: number): string | undefined {
  if (depth > 12 || node === null || node === undefined) {
    return undefined;
  }
  if (typeof node !== 'object') {
    return undefined;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      const s = getRawFaceShapeRecursive(item, depth + 1);
      if (s !== undefined) {
        return s;
      }
    }
    return undefined;
  }

  const o = node as Record<string, unknown>;

  if (typeof o.category === 'string' && typeof o.detail === 'string') {
    const onSame = readFaceShapeFromObject(o);
    if (onSame !== undefined) {
      return onSame;
    }
    for (const v of Object.values(o)) {
      if (v !== o.category && v !== o.detail) {
        const s = getRawFaceShapeRecursive(v, depth + 1);
        if (s !== undefined) {
          return s;
        }
      }
    }
    return undefined;
  }

  const here = readFaceShapeFromObject(o);
  if (here !== undefined) {
    return here;
  }

  for (const v of Object.values(o)) {
    const s = getRawFaceShapeRecursive(v, depth + 1);
    if (s !== undefined) {
      return s;
    }
  }
  return undefined;
}

function getRawFaceShapeFromCategoryBlocks(data: unknown): string | undefined {
  const keys = ['face_shape', 'geometry', 'face', 'face_form', 'форма_лица'];
  for (const k of keys) {
    const d = findCategoryDetail(data, k);
    if (d !== undefined) {
      const t = d.trim();
      if (t !== '') {
        const colonIdx = indexOfFirstColonLike(t);
        const candidate = colonIdx === -1 ? t : t.slice(0, colonIdx).trim();
        if (candidate !== '') {
          return candidate;
        }
      }
    }
  }
  return undefined;
}

function getRawFaceShape(data: unknown): string | undefined {
  const shallow = getRawFaceShapeShallow(data);
  if (shallow !== undefined) {
    return shallow;
  }
  const fromCat = getRawFaceShapeFromCategoryBlocks(data);
  if (fromCat !== undefined) {
    return fromCat;
  }
  return getRawFaceShapeRecursive(data, 0);
}

function hasCyrillic(s: string): boolean {
  return /[\u0400-\u04FF]/.test(s);
}

export function translateFaceShapeToRu(raw: string | undefined): string {
  if (raw === undefined || raw.trim() === '') {
    return '—';
  }
  const trimmed = raw.trim();
  if (hasCyrillic(trimmed)) {
    return trimmed;
  }
  const key = trimmed
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  const mapped = FACE_SHAPE_EN_TO_RU[key];
  if (mapped !== undefined) {
    return mapped;
  }
  if (trimmed.length > 0) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }
  return '—';
}

const COLON_LIKE = [':', '\uFF1A', '\u2236'] as const;

function indexOfFirstColonLike(s: string): number {
  let best = -1;
  for (const ch of COLON_LIKE) {
    const i = s.indexOf(ch);
    if (i >= 0 && (best === -1 || i < best)) {
      best = i;
    }
  }
  return best;
}

export function prefixBeforeFirstColon(text: string | undefined): string {
  if (text === undefined || text.trim() === '') {
    return '—';
  }
  const t = text.trim();
  const idx = indexOfFirstColonLike(t);
  if (idx === -1) {
    return t;
  }
  const left = t.slice(0, idx).trim();
  return left === '' ? '—' : left;
}

export function suffixAfterFirstColon(text: string | undefined): string {
  if (text === undefined || text.trim() === '') {
    return '—';
  }
  const t = text.trim();
  const idx = indexOfFirstColonLike(t);
  if (idx === -1) {
    return '—';
  }
  const right = t.slice(idx + 1).trim();
  return right === '' ? '—' : right;
}

function pickClothingColorsDetail(data: unknown): string | undefined {
  const keys = ['clothing_colors', 'clothingColors', 'одежда', 'цвета_одежды', 'clothing'];
  for (const k of keys) {
    const v = findCategoryDetail(data, k);
    if (v !== undefined && v.trim() !== '') {
      return v.trim();
    }
  }
  return undefined;
}

function pickContrastDetail(data: unknown): string | undefined {
  const contrastKeys = ['makeup', 'contrast', 'contrasts', 'контрастность'];
  for (const key of contrastKeys) {
    const v = findCategoryDetail(data, key);
    if (v !== undefined && v.trim() !== '') {
      return v.trim();
    }
  }
  return undefined;
}

export type ParsedAnalysisUi = {
  faceShapeRu: string;
  glassesDetail: string;
  colorotypeTitle: string;
  contrastDetail: string;
  suitableColors: string;
};

export function parseAnalysisForUi(data: unknown): ParsedAnalysisUi {
  const rawShape = getRawFaceShape(data);
  const glasses = findCategoryDetail(data, 'glasses');
  const clothing = pickClothingColorsDetail(data);
  const contrast = pickContrastDetail(data);

  return {
    faceShapeRu: translateFaceShapeToRu(rawShape),
    glassesDetail: glasses !== undefined && glasses.trim() !== '' ? glasses.trim() : '—',
    colorotypeTitle: prefixBeforeFirstColon(clothing),
    contrastDetail: contrast !== undefined ? contrast : '—',
    suitableColors: suffixAfterFirstColon(clothing),
  };
}
