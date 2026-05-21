let lastAnalysisJson: unknown | undefined;

export function setLastAnalysisResult(data: unknown): void {
  lastAnalysisJson = data;
}

export function getLastAnalysisResult(): unknown | undefined {
  return lastAnalysisJson;
}
