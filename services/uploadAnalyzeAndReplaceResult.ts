import { addAnalysisHistoryEntry } from '../state/analysisHistoryStore';
import { setLastAnalysisResult } from '../state/analysisResultStore';
import { uploadImageForAnalyze } from './uploadAnalyze';

export async function uploadAnalyzeAndReplaceResult(
  localUri: string,
  navigation: {
    replace: (
      name: 'AnalysisResult',
      params: { localUri: string; showTryOnMakeup?: boolean; historyId?: string },
    ) => void;
  },
): Promise<void> {
  const json = await uploadImageForAnalyze(localUri);
  setLastAnalysisResult(json);
  let historyId: string | undefined;
  try {
    const entry = await addAnalysisHistoryEntry(localUri, json);
    historyId = entry.id;
  } catch {
    // history is best-effort; result screen still works
  }
  navigation.replace('AnalysisResult', { localUri, showTryOnMakeup: true, historyId });
}
