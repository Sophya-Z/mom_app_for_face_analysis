import { setLastAnalysisResult } from '../state/analysisResultStore';
import { uploadImageForAnalyze } from './uploadAnalyze';

export async function uploadAnalyzeAndReplaceResult(
  localUri: string,
  navigation: { replace: (name: 'AnalysisResult', params: { localUri: string }) => void },
): Promise<void> {
  const json = await uploadImageForAnalyze(localUri);
  setLastAnalysisResult(json);
  navigation.replace('AnalysisResult', { localUri });
}
