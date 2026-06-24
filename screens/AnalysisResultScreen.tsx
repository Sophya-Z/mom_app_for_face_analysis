import { HeaderBackButton } from '@react-navigation/elements';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ColorotypePalette } from '../components/ColorotypePalette';
import { GlassesFrameList } from '../components/GlassesFrameList';
import { OutfitScanScores } from '../components/OutfitScanScores';
import { SavedMakeupPhoto } from '../components/SavedMakeupPhoto';
import { getColorotypePalette } from '../constants/colorotypePalettes';
import type { RootStackParamList } from '../navigation/types';
import { fetchContourFinalImageDataUri } from '../services/fetchContourFinalImage';
import { fetchTryOnMakeupPhotoDataUri } from '../services/fetchTryOnMakeupPhoto';
import { getSeasonalTwelve, parseAnalysisForUi } from '../services/parseAnalysisResponse';
import { pickImageFromGallery } from '../services/pickImageFromGallery';
import { uploadOutfitScan, type OutfitScanResult } from '../services/uploadOutfitScan';
import {
  saveContourPhotoToHistory,
  saveTryOnMakeupToHistory,
} from '../state/analysisHistoryStore';
import { getLastAnalysisResult } from '../state/analysisResultStore';
import { fontRegular } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'AnalysisResult'>;

const HEADER_BAR = '#094A4C';
const BACK_TINT = '#F4FDFD';
const TAB_ACTIVE = '#249193';
const TAB_INACTIVE_BG = 'rgba(244, 253, 253, 0.12)';
const TAB_INACTIVE_BORDER = 'rgba(224, 240, 240, 0.45)';
const PHOTO_W = 224;
const PHOTO_H = 320;
const TRY_ON_REVEAL_MIN_MS = 2000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

type TabId = 'face' | 'colorotype';

export function AnalysisResultScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const {
    localUri,
    showTryOnMakeup = true,
    analysisData,
    historyId,
    savedContourPhotoUri,
    savedTryOnPhotoUri,
  } = route.params;
  const fromHistory = !showTryOnMakeup;
  const data = analysisData ?? getLastAnalysisResult();
  const parsed = useMemo(() => parseAnalysisForUi(data), [data]);

  const [tab, setTab] = useState<TabId>('face');
  const [contourUri, setContourUri] = useState<string | null>(null);
  const [contourLoading, setContourLoading] = useState(true);
  const [contourError, setContourError] = useState<string | null>(null);

  const [tryOnUri, setTryOnUri] = useState<string | null>(null);
  const [tryOnVisible, setTryOnVisible] = useState(false);
  const [tryOnUiLoading, setTryOnUiLoading] = useState(false);
  const [tryOnUserError, setTryOnUserError] = useState<string | null>(null);
  const tryOnPrefetchRef = useRef<Promise<{ uri: string } | { error: string }> | null>(null);

  const [outfitLoading, setOutfitLoading] = useState(false);
  const [outfitError, setOutfitError] = useState<string | null>(null);
  const [outfitResult, setOutfitResult] = useState<OutfitScanResult | null>(null);

  useEffect(() => {
    if (data === undefined || !localUri) {
      setContourLoading(false);
      return;
    }
    let cancelled = false;
    setContourLoading(true);
    setContourError(null);
    setTryOnUri(null);
    setTryOnVisible(false);
    setTryOnUserError(null);
    setTryOnUiLoading(false);
    tryOnPrefetchRef.current = null;

    void (async () => {
      try {
        if (savedContourPhotoUri) {
          if (!cancelled) {
            setContourUri(savedContourPhotoUri);
          }
        } else if (fromHistory) {
          if (!cancelled) {
            setContourError('Контур не сохранён локально для этой записи');
          }
        } else {
          const uri = await fetchContourFinalImageDataUri(localUri);
          const localPath = historyId
            ? await saveContourPhotoToHistory(historyId, uri)
            : null;
          if (!cancelled) {
            setContourUri(localPath ?? uri);
          }
        }

        const seasonTwelve = getSeasonalTwelve(data);
        if (!cancelled && showTryOnMakeup && seasonTwelve) {
          const prefetch = (async (): Promise<{ uri: string } | { error: string }> => {
            try {
              const makeupUri = await fetchTryOnMakeupPhotoDataUri(localUri, seasonTwelve);
              const displayUri = historyId
                ? (await saveTryOnMakeupToHistory(historyId, makeupUri)) ?? makeupUri
                : makeupUri;
              if (!cancelled) {
                setTryOnUri(displayUri);
              }
              return { uri: displayUri };
            } catch (e) {
              const message =
                e instanceof Error ? e.message : 'Не удалось примерить макияж';
              return { error: message };
            }
          })();
          tryOnPrefetchRef.current = prefetch;
        }
      } catch (e) {
        if (!cancelled) {
          const message =
            fromHistory && !savedContourPhotoUri
              ? 'Контур не сохранён локально для этой записи'
              : e instanceof Error
                ? e.message
                : 'Не удалось загрузить контур';
          setContourError(message);
        }
      } finally {
        if (!cancelled) {
          setContourLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    data,
    localUri,
    showTryOnMakeup,
    historyId,
    savedContourPhotoUri,
    fromHistory,
  ]);

  const missingData = data === undefined || !localUri;

  const handleCheckOutfit = () => {
    const seasonTwelve = parsed.seasonTwelve;
    if (!seasonTwelve) {
      setOutfitError('Не найден seasonal_twelve в ответе анализа');
      return;
    }
    void (async () => {
      const pick = await pickImageFromGallery();
      if (!pick.ok) {
        return;
      }
      setOutfitLoading(true);
      setOutfitError(null);
      setOutfitResult(null);
      try {
        const result = await uploadOutfitScan(pick.uri, seasonTwelve);
        setOutfitResult(result);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Не удалось проверить образ';
        setOutfitError(message);
      } finally {
        setOutfitLoading(false);
      }
    })();
  };

  const handleTryOnMakeup = () => {
    if (tryOnUiLoading) {
      return;
    }
    if (tryOnVisible) {
      setTryOnVisible(false);
      setTryOnUserError(null);
      return;
    }

    const seasonTwelve = getSeasonalTwelve(data);
    if (!seasonTwelve) {
      setTryOnUserError('Не найден seasonal_twelve в ответе анализа');
      return;
    }

    setTryOnUiLoading(true);
    setTryOnUserError(null);

    void (async () => {
      const prefetch = tryOnPrefetchRef.current;
      const [outcome] = await Promise.all([
        prefetch ?? Promise.resolve({ error: 'Не удалось примерить макияж' } as const),
        delay(TRY_ON_REVEAL_MIN_MS),
      ]);

      setTryOnUiLoading(false);
      if ('uri' in outcome && outcome.uri) {
        setTryOnUri(outcome.uri);
        setTryOnVisible(true);
      } else {
        setTryOnUserError('error' in outcome ? outcome.error : 'Не удалось примерить макияж');
      }
    })();
  };

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, backgroundColor: HEADER_BAR, paddingBottom: 8 },
        ]}
      >
        <HeaderBackButton
          displayMode="minimal"
          style={{ paddingTop: 8 }}
          tintColor={BACK_TINT}
          onPress={() => navigation.goBack()}
        />
        <Text style={{color: '#F4FDFD', paddingTop: 8, fontSize: 16, fontFamily: fontRegular}}>Результат анализа фото</Text>
      </View>

      {missingData ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            Нет данных ответа. Вернитесь и отправьте фото снова.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 56 + insets.bottom },
          ]}
          showsVerticalScrollIndicator
          removeClippedSubviews={false}
        >
          <View style={styles.photoBlock}>
            {contourLoading ? (
              <View style={[styles.photoFrame, styles.photoCenter]}>
                <ActivityIndicator color="#E0F0F0" size="large" />
              </View>
            ) : contourError !== null ? (
              <View style={[styles.photoFrame, styles.photoCenter]}>
                <Text style={styles.contourErrorText}>{contourError}</Text>
              </View>
            ) : contourUri !== null ? (
              <Image
                source={{ uri: contourUri }}
                style={styles.photoFrame}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.photoFrame, styles.photoCenter]}>
                <Text style={styles.contourErrorText}>Нет изображения</Text>
              </View>
            )}
          </View>

          <View style={styles.tabsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.tab,
                tab === 'face' ? styles.tabActive : styles.tabInactive,
                pressed && styles.tabPressed,
              ]}
              onPress={() => setTab('face')}
            >
              <Text
                style={[styles.tabText, tab === 'face' ? styles.tabTextActive : styles.tabTextInactive]}
              >
                Форма лица
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.tab,
                tab === 'colorotype' ? styles.tabActive : styles.tabInactive,
                pressed && styles.tabPressed,
              ]}
              onPress={() => setTab('colorotype')}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'colorotype' ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                Цветотип
              </Text>
            </Pressable>
          </View>

          {tab === 'face' ? (
            <View style={styles.tabPanel}>
              <Text style={styles.label}>Форма лица:</Text>
              <Text style={[styles.value, styles.valueWrap]}>{parsed.faceShapeRu}</Text>
              <Text style={[styles.label, styles.labelSpaced]}>Подходящие оправы очков:</Text>
              <GlassesFrameList
                frameNames={parsed.glassesFrameNames}
                fallbackText={parsed.glassesDetail}
              />
            </View>
          ) : (
            <View style={styles.tabPanel}>
              <Text style={styles.label}>Ваш цветотип:</Text>
              <Text style={[styles.value, styles.valueWrap]}>{parsed.colorotypeTitle}</Text>
              <Text style={[styles.label, styles.labelSpaced]}>Контрастность:</Text>
              <Text style={[styles.value, styles.valueWrap]}>{parsed.contrastDetail}</Text>
              <View style={styles.suitableSection} collapsable={false}>
                <Text style={[styles.label, styles.labelSpaced]}>Подходящие цвета:</Text>
                <Text style={[styles.value, styles.valueWrap]}>
                  {parsed.suitableColors ?? '—'}
                </Text>
                <ColorotypePalette colors={getColorotypePalette(parsed.seasonTwelve)} />
              </View>

              {!showTryOnMakeup && savedTryOnPhotoUri ? (
                <SavedMakeupPhoto uri={savedTryOnPhotoUri} />
              ) : null}

              {showTryOnMakeup ? (
                <>
                  <Pressable
                    style={({ pressed }) => [
                      styles.tryOnButton,
                      pressed && styles.tabPressed,
                      tryOnUiLoading && styles.tryOnButtonDisabled,
                    ]}
                    onPress={handleTryOnMakeup}
                    disabled={tryOnUiLoading}
                  >
                    {tryOnUiLoading ? (
                      <ActivityIndicator color="#F4FDFD" />
                    ) : (
                      <Text style={styles.tryOnButtonText}>Примерить подходящий макияж</Text>
                    )}
                  </Pressable>

                  {tryOnUserError !== null && !tryOnVisible && !tryOnUiLoading ? (
                    <Text style={[styles.contourErrorText, styles.tryOnMessage]}>{tryOnUserError}</Text>
                  ) : null}

                  {tryOnVisible && tryOnUri !== null ? <SavedMakeupPhoto uri={tryOnUri} /> : null}
                </>
              ) : null}
              <Pressable
            style={({ pressed }) => [
              styles.tryOnButton,
              styles.outfitButton,
              pressed && styles.tabPressed,
              outfitLoading && styles.tryOnButtonDisabled,
            ]}
            onPress={handleCheckOutfit}
            disabled={outfitLoading}
          >
            {outfitLoading ? (
              <ActivityIndicator color="#F4FDFD" />
            ) : (
              <Text style={styles.tryOnButtonText}>Оценка образа</Text>
            )}
          </Pressable>

          {outfitError !== null ? (
            <Text style={[styles.contourErrorText, styles.outfitMessage]}>{outfitError}</Text>
          ) : null}

          {outfitResult !== null ? <OutfitScanScores result={outfitResult} /> : null}
            </View>
          )}

          
        </ScrollView>
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  photoBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photoFrame: {
    width: PHOTO_W,
    height: PHOTO_H,
  },
  photoCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  contourErrorText: {
    fontFamily: fontRegular,
    fontSize: 13,
    color: '#E0C0C0',
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  tabActive: {
    backgroundColor: '#094A4C',
    borderColor: TAB_ACTIVE,
  },
  tabInactive: {
    backgroundColor: '#E0F1F1',
    borderColor: TAB_INACTIVE_BORDER,
  },
  tabPressed: {
    opacity: 0.9,
  },
  tabText: {
    fontFamily: fontRegular,
    fontSize: 16,
  },
  tabTextActive: {
    color: '#F4FDFD',
  },
  tabTextInactive: {
    color: '#094A4C',
  },
  tabPanel: {
    paddingBottom: 16,
    width: '100%',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(224, 240, 240, 0.35)',
    marginTop: 4,
  },
  suitableSection: {
    width: '100%',
  },
  tryOnButton: {
    marginTop: 24,
    marginHorizontal: 4,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: TAB_ACTIVE,
    borderWidth: 2,
    borderColor: '#E0F1F1',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tryOnButtonDisabled: {
    opacity: 0.75,
  },
  tryOnButtonText: {
    fontFamily: fontRegular,
    fontSize: 15,
    color: '#F4FDFD',
    textAlign: 'center',
  },
  tryOnMessage: {
    marginTop: 12,
    color: '#8B3030',
  },
  outfitButton: {
    marginTop: 8,
  },
  outfitMessage: {
    marginTop: 12,
    color: '#8B3030',
    textAlign: 'center',
  },
  label: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#094A4C',
    marginBottom: 6,
    paddingLeft: 10,
  },
  labelSpaced: {
    marginTop: 18,
  },
  value: {
    fontFamily: fontRegular,
    fontSize: 16,
    lineHeight: 24,
    color: '#094A4C',
    paddingLeft: 24,
  },
  valueWrap: {
    alignSelf: 'stretch',
    maxWidth: '100%',
  },
  emptyWrap: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#E0F0F0',
    textAlign: 'center',
  },
});
