import * as FileSystem from 'expo-file-system/legacy';

export type AnalysisHistoryEntry = {
  id: string;
  createdAt: number;
  photoUri: string;
  analysisJson: unknown;
  contourPhotoUri?: string;
  tryOnPhotoUri?: string;
};

type HistoryIndexFile = {
  entries: AnalysisHistoryEntry[];
};

const HISTORY_DIR_NAME = 'analysis_history';
const INDEX_FILE = 'index.json';
const PHOTOS_DIR = 'photos';
const TRYON_DIR = 'tryon';
const CONTOUR_DIR = 'contour';

let memoryCache: AnalysisHistoryEntry[] | null = null;

function historyRoot(): string {
  const base = FileSystem.documentDirectory;
  if (!base) {
    throw new Error('documentDirectory недоступен');
  }
  return `${base}${HISTORY_DIR_NAME}/`;
}

function indexPath(): string {
  return `${historyRoot()}${INDEX_FILE}`;
}

function photosDir(): string {
  return `${historyRoot()}${PHOTOS_DIR}/`;
}

function tryOnDir(): string {
  return `${historyRoot()}${TRYON_DIR}/`;
}

function contourDir(): string {
  return `${historyRoot()}${CONTOUR_DIR}/`;
}

async function ensureDirs(): Promise<void> {
  await FileSystem.makeDirectoryAsync(historyRoot(), { intermediates: true });
  await FileSystem.makeDirectoryAsync(photosDir(), { intermediates: true });
  await FileSystem.makeDirectoryAsync(tryOnDir(), { intermediates: true });
  await FileSystem.makeDirectoryAsync(contourDir(), { intermediates: true });
}

function base64FromDataUri(dataUri: string): string | null {
  const match = /^data:image\/\w+;base64,(.+)$/s.exec(dataUri);
  return match?.[1] ?? null;
}

async function writeJpegDataUriToFile(filePath: string, dataUri: string): Promise<boolean> {
  const base64 = base64FromDataUri(dataUri);
  if (!base64) {
    return false;
  }
  await FileSystem.writeAsStringAsync(filePath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return true;
}

async function updateEntry(
  entryId: string,
  patch: Partial<Pick<AnalysisHistoryEntry, 'contourPhotoUri' | 'tryOnPhotoUri'>>,
): Promise<void> {
  const { entries } = await readIndex();
  const next = entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e));
  await writeIndex(next);
}

async function readIndex(): Promise<HistoryIndexFile> {
  await ensureDirs();
  const path = indexPath();
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    return { entries: [] };
  }
  const raw = await FileSystem.readAsStringAsync(path);
  try {
    const parsed = JSON.parse(raw) as HistoryIndexFile;
    if (!Array.isArray(parsed.entries)) {
      return { entries: [] };
    }
    return parsed;
  } catch {
    return { entries: [] };
  }
}

async function writeIndex(entries: AnalysisHistoryEntry[]): Promise<void> {
  await ensureDirs();
  await FileSystem.writeAsStringAsync(indexPath(), JSON.stringify({ entries }));
  memoryCache = entries;
}

export async function listAnalysisHistory(): Promise<AnalysisHistoryEntry[]> {
  if (memoryCache !== null) {
    return [...memoryCache].sort((a, b) => b.createdAt - a.createdAt);
  }
  const { entries } = await readIndex();
  memoryCache = entries;
  return [...entries].sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAnalysisHistoryEntry(
  id: string,
): Promise<AnalysisHistoryEntry | undefined> {
  const entries = await listAnalysisHistory();
  return entries.find((e) => e.id === id);
}

async function copyPhotoToHistory(sourceUri: string, id: string): Promise<string> {
  await ensureDirs();
  const dest = `${photosDir()}${id}.jpg`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function addAnalysisHistoryEntry(
  sourcePhotoUri: string,
  analysisJson: unknown,
): Promise<AnalysisHistoryEntry> {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const photoUri = await copyPhotoToHistory(sourcePhotoUri, id);
  const entry: AnalysisHistoryEntry = {
    id,
    createdAt: Date.now(),
    photoUri,
    analysisJson,
  };
  const { entries } = await readIndex();
  const next = [entry, ...entries];
  await writeIndex(next);
  return entry;
}

export async function saveContourPhotoToHistory(
  entryId: string,
  contourDataUri: string,
): Promise<string | null> {
  await ensureDirs();
  const path = `${contourDir()}${entryId}.jpg`;
  const ok = await writeJpegDataUriToFile(path, contourDataUri);
  if (!ok) {
    return null;
  }
  await updateEntry(entryId, { contourPhotoUri: path });
  return path;
}

export async function saveTryOnMakeupToHistory(
  entryId: string,
  makeupDataUri: string,
): Promise<string | null> {
  await ensureDirs();
  const path = `${tryOnDir()}${entryId}.jpg`;
  const ok = await writeJpegDataUriToFile(path, makeupDataUri);
  if (!ok) {
    return null;
  }
  await updateEntry(entryId, { tryOnPhotoUri: path });
  return path;
}

export async function removeAnalysisHistoryEntry(id: string): Promise<void> {
  const { entries } = await readIndex();
  const target = entries.find((e) => e.id === id);
  if (target) {
    try {
      await FileSystem.deleteAsync(target.photoUri, { idempotent: true });
    } catch {
      // ignore missing file
    }
    for (const fileUri of [target.contourPhotoUri, target.tryOnPhotoUri]) {
      if (!fileUri) {
        continue;
      }
      try {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      } catch {
        // ignore missing file
      }
    }
  }
  const next = entries.filter((e) => e.id !== id);
  await writeIndex(next);
}

export function invalidateAnalysisHistoryCache(): void {
  memoryCache = null;
}
