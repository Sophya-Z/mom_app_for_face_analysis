import * as FileSystem from 'expo-file-system/legacy';

export async function saveImageLocal(sourceUri: string): Promise<string> {
  const base = FileSystem.documentDirectory;
  if (!base) {
    throw new Error('documentDirectory недоступен');
  }
  const dir = `${base}captures/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const dest = `${dir}img_${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}
