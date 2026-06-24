export const ANALYZE_UPLOAD_URL = 'http://192.168.0.113:8001/analyze';

function contourFinalUrlFromAnalyzeUrl(analyzeUrl: string): string {
  const u = new URL(analyzeUrl);
  return `${u.origin}/contour/final`;
}

export const CONTOUR_FINAL_URL = contourFinalUrlFromAnalyzeUrl(ANALYZE_UPLOAD_URL);

function tryOnPhotoUrlFromAnalyzeUrl(analyzeUrl: string): string {
  const u = new URL(analyzeUrl);
  u.pathname = '/try-on/photo';
  return u.toString();
}

export const TRY_ON_PHOTO_URL = tryOnPhotoUrlFromAnalyzeUrl(ANALYZE_UPLOAD_URL);

function outfitScanUrlFromAnalyzeUrl(analyzeUrl: string): string {
  const u = new URL(analyzeUrl);
  u.pathname = '/outfit/scan';
  return u.toString();
}

export const OUTFIT_SCAN_URL = outfitScanUrlFromAnalyzeUrl(ANALYZE_UPLOAD_URL);
