import { HeaderBackButton } from '@react-navigation/elements';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
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

import type { RootStackParamList } from '../navigation/types';
import { fetchContourFinalImageDataUri } from '../services/fetchContourFinalImage';
import { parseAnalysisForUi } from '../services/parseAnalysisResponse';
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

type TabId = 'face' | 'colorotype';

export function AnalysisResultScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { localUri } = route.params;
  const data = getLastAnalysisResult();
  const parsed = useMemo(() => parseAnalysisForUi(data), [data]);

  const [tab, setTab] = useState<TabId>('face');
  const [contourUri, setContourUri] = useState<string | null>(null);
  const [contourLoading, setContourLoading] = useState(true);
  const [contourError, setContourError] = useState<string | null>(null);

  useEffect(() => {
    if (data === undefined || !localUri) {
      setContourLoading(false);
      return;
    }
    let cancelled = false;
    setContourLoading(true);
    setContourError(null);
    void (async () => {
      try {
        const uri = await fetchContourFinalImageDataUri(localUri);
        if (!cancelled) {
          setContourUri(uri);
        }
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Не удалось загрузить контур';
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
  }, [data, localUri]);

  const missingData = data === undefined || !localUri;

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
              <Text style={[styles.value, styles.valueWrap]}>{parsed.glassesDetail}</Text>
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
              </View>
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
