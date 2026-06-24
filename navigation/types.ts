export type RootStackParamList = {
  Home: undefined;
  PhotoSource: undefined;
  CameraCapture: undefined;
  AnalysisHistory: undefined;
  AnalysisResult: {
    localUri: string;
    showTryOnMakeup?: boolean;
    analysisData?: unknown;
    historyId?: string;
    savedContourPhotoUri?: string;
    savedTryOnPhotoUri?: string;
  };
};
