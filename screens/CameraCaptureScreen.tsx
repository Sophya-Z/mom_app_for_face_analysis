import { HeaderBackButton } from '@react-navigation/elements';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/types';
import { saveImageLocal } from '../services/saveImageLocal';
import { uploadAnalyzeAndReplaceResult } from '../services/uploadAnalyzeAndReplaceResult';
import { fontRegular } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'CameraCapture'>;

const INSTRUCTION_TEXT = `Как сфотографироваться для анализа формы лица и цветотипа

• Снимайте при дневном естественном свете (лучше у окна), без жёлтой лампы сверху — так точнее определяется цветотип.

• Снимите очки, уберите волосы с лица (чёлка, пряди), чтобы были видны брови, скулы и линия челюсти — это важно для оценки формы лица.

• Держите телефон на уровне глаз, смотрите прямо в камеру, без сильного наклона головы в стороны.

• Лицо должно занимать крупный план по центру кадра, по краям оставьте небольшой запас.

• Избегайте жёсткого бокового света и глубоких теней на половинах лица — освещение должно быть по возможности ровным.`;

const HEADER_BG = 'rgba(9, 74, 76, 0.92)';
const PANEL_BG = 'rgba(8, 62, 63, 0.95)';
const DIM = 'rgba(0, 0, 0, 0.5)';

export function CameraCaptureScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [instructionOpen, setInstructionOpen] = useState(true);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const takePicture = useCallback(async () => {
    if (
      !cameraRef.current ||
      !cameraReady ||
      capturing ||
      instructionOpen ||
      previewUri
    ) {
      return;
    }
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      setPreviewUri(photo.uri);
    } catch {
      // ignore
    } finally {
      setCapturing(false);
    }
  }, [cameraReady, capturing, instructionOpen, previewUri]);

  const handleRetake = useCallback(async () => {
    setPreviewUri(null);
    try {
      await cameraRef.current?.resumePreview();
    } catch {
      // ignore
    }
  }, []);

  const handleDone = useCallback(async () => {
    if (!previewUri || uploading) {
      return;
    }
    setUploading(true);
    try {
      const saved = await saveImageLocal(previewUri);
      await uploadAnalyzeAndReplaceResult(saved, navigation);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Не удалось сохранить или отправить фото';
      Alert.alert('Ошибка', message);
    } finally {
      setUploading(false);
    }
  }, [navigation, previewUri, uploading]);

  if (permission === null) {
    return (
      <View style={[styles.gate, { paddingTop: insets.top }]}>
        <ActivityIndicator color="#E0F0F0" size="large" />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.gate, { paddingTop: insets.top }]}>
        <Text style={styles.gateText}>Нет доступа к камере</Text>
        <Pressable
          style={styles.gateBack}
          onPress={() => {
            void requestPermission();
          }}
        >
          <Text style={styles.gateBackText}>Запросить доступ</Text>
        </Pressable>
        <Pressable style={styles.gateBack} onPress={() => navigation.goBack()}>
          <Text style={styles.gateBackText}>Назад</Text>
        </Pressable>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
        mode="picture"
        mirror
        onCameraReady={() => setCameraReady(true)}
      />

      {instructionOpen && (
        <View
          pointerEvents="auto"
          style={[styles.dimOverlay, { backgroundColor: DIM }]}
        />
      )}

      <View pointerEvents="box-none" style={[styles.layers, { zIndex: 2 }]}>
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <HeaderBackButton
            displayMode="minimal"
            style={{ paddingTop: 8 }}
            tintColor="#F4FDFD"
            onPress={() => navigation.goBack()}
          />
        </View>

        {instructionOpen && (
          <View style={styles.instructionWrap} pointerEvents="box-none">
            <View style={styles.instructionCard}>
              <ScrollView
                style={styles.instructionScroll}
                contentContainerStyle={styles.instructionScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <Text style={styles.instructionTitle}>Инструкция</Text>
                <Text style={styles.instructionBody}>{INSTRUCTION_TEXT}</Text>
              </ScrollView>
              <Pressable
                style={({ pressed }) => [
                  styles.startPhotoButton,
                  pressed && styles.startPhotoButtonPressed,
                ]}
                onPress={() => setInstructionOpen(false)}
              >
                <Text style={styles.startPhotoButtonText}>Приступить к фото</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!instructionOpen && !previewUri && (
          <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
            <Pressable
              style={({ pressed }) => [
                styles.shutterOuter,
                pressed && styles.shutterPressed,
                (!cameraReady || capturing) && styles.shutterDisabled,
              ]}
              disabled={!cameraReady || capturing}
              onPress={() => {
                void takePicture();
              }}
            >
              <View style={styles.shutterInner} />
            </Pressable>
          </SafeAreaView>
        )}

        {previewUri !== null && (
          <View style={styles.previewRoot} pointerEvents="auto">
            <View style={styles.previewImageWrap}>
              <Image
                source={{ uri: previewUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              {uploading && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color="#F4FDFD" size="large" />
                  <Text style={styles.uploadOverlayText}>Отправка на анализ…</Text>
                </View>
              )}
            </View>
            <SafeAreaView edges={['bottom']} style={styles.previewActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.previewButton,
                  styles.previewButtonRetake,
                  pressed && styles.previewButtonPressed,
                  uploading && styles.previewButtonDisabled,
                ]}
                disabled={uploading}
                onPress={() => {
                  void handleRetake();
                }}
              >
                <Text style={styles.previewButtonTextRetake}>Переснять</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.previewButton,
                  styles.previewButtonDone,
                  pressed && styles.previewButtonPressed,
                  uploading && styles.previewButtonDisabled,
                ]}
                disabled={uploading}
                onPress={() => {
                  void handleDone();
                }}
              >
                <Text style={styles.previewButtonTextDone}>Готово</Text>
              </Pressable>
            </SafeAreaView>
          </View>
        )}
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  layers: {
    ...StyleSheet.absoluteFillObject,
  },
  gate: {
    flex: 1,
    backgroundColor: '#094A4C',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  gateText: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#E0F0F0',
  },
  gateBack: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  gateBackText: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#249193',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEADER_BG,
    paddingBottom: 8,
    paddingHorizontal: 4,
    zIndex: 10,
  },
  instructionWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    marginTop: 8,
  },
  instructionCard: {
    maxHeight: '72%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: PANEL_BG,
    borderWidth: 1,
    borderColor: '#249193',
  },
  instructionScroll: {
    maxHeight: 420,
  },
  instructionScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  instructionTitle: {
    fontFamily: fontRegular,
    fontSize: 17,
    color: '#F4FDFD',
    marginBottom: 8,
  },
  instructionBody: {
    fontFamily: fontRegular,
    fontSize: 14,
    lineHeight: 21,
    color: '#E0F0F0',
  },
  startPhotoButton: {
    marginHorizontal: 14,
    marginBottom: 14,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#249193',
    alignItems: 'center',
  },
  startPhotoButtonPressed: {
    opacity: 0.88,
  },
  startPhotoButtonText: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#F4FDFD',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: HEADER_BG,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#F4FDFD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F4FDFD',
  },
  shutterPressed: {
    opacity: 0.85,
  },
  shutterDisabled: {
    opacity: 0.45,
  },
  previewRoot: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  previewImageWrap: {
    flex: 1,
    width: '100%',
    marginTop: 56,
    position: 'relative',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  previewButton: {
    minWidth: 140,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  previewButtonPressed: {
    opacity: 0.88,
  },
  previewButtonDisabled: {
    opacity: 0.45,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  uploadOverlayText: {
    fontFamily: fontRegular,
    fontSize: 15,
    color: '#E0F0F0',
  },
  previewButtonRetake: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E0F0F0',
  },
  previewButtonDone: {
    backgroundColor: '#249193',
  },
  previewButtonTextRetake: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#E0F0F0',
  },
  previewButtonTextDone: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#F4FDFD',
  },
});
