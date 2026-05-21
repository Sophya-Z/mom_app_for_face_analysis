import { HeaderBackButton } from '@react-navigation/elements';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/types';
import { pickImageFromGallery } from '../services/pickImageFromGallery';
import { requestCameraAccess } from '../services/requestCameraAccess';
import { saveImageLocal } from '../services/saveImageLocal';
import { uploadAnalyzeAndReplaceResult } from '../services/uploadAnalyzeAndReplaceResult';
import { fontRegular } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoSource'>;

const HEADER_BAR = '#094A4C';
const BACK_TINT = '#F4FDFD';

export function PhotoSourceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [uploading, setUploading] = useState(false);

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, backgroundColor: HEADER_BAR },
        ]}
      >
        <HeaderBackButton
          displayMode="minimal"
          tintColor={BACK_TINT}
          style={{ paddingTop: 8 }}
          onPress={() => navigation.goBack()}
        />
      </View>

      <View style={styles.center}>
        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              uploading && styles.buttonDisabled,
            ]}
            disabled={uploading}
            onPress={async () => {
              const ok = await requestCameraAccess();
              if (ok) {
                navigation.navigate('CameraCapture');
              }
            }}
          >
            <Text style={styles.buttonText}>Сделать фото</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              uploading && styles.buttonDisabled,
            ]}
            disabled={uploading}
            onPress={async () => {
              const r = await pickImageFromGallery();
              if (!r.ok) {
                return;
              }
              setUploading(true);
              try {
                const saved = await saveImageLocal(r.uri);
                await uploadAnalyzeAndReplaceResult(saved, navigation);
              } catch (e) {
                const message =
                  e instanceof Error ? e.message : 'Не удалось сохранить или отправить фото';
                Alert.alert('Ошибка', message);
              } finally {
                setUploading(false);
              }
            }}
          >
            <Text style={styles.buttonText}>Загрузить фото</Text>
          </Pressable>
        </View>
      </View>
      {uploading && (
        <View style={[styles.uploadOverlay, { paddingTop: insets.top }]} pointerEvents="auto">
          <ActivityIndicator color="#F4FDFD" size="large" />
          <Text style={styles.uploadOverlayText}>Отправка на анализ…</Text>
        </View>
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#094A4C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    gap: 16,
  },
  button: {
    width: 256,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#083E3F',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#249193',
    borderWidth: 2,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#E0F0F0',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 74, 76, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  uploadOverlayText: {
    fontFamily: fontRegular,
    fontSize: 15,
    color: '#E0F0F0',
  },
});
