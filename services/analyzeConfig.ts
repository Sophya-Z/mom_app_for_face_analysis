export const ANALYZE_UPLOAD_URL = 'http://192.168.1.35:8000/analyze';

function contourFinalUrlFromAnalyzeUrl(analyzeUrl: string): string {
  const u = new URL(analyzeUrl);
  return `${u.origin}/contour/final`;
}

export const CONTOUR_FINAL_URL = contourFinalUrlFromAnalyzeUrl(ANALYZE_UPLOAD_URL);
