import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export type PickFromGalleryResult =
  | { ok: false; reason: 'permission_denied' | 'cancelled' }
  | { ok: true; uri: string; width: number; height: number };

export async function pickImageFromGallery(): Promise<PickFromGalleryResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      'Нет доступа к галерее',
      'Чтобы выбрать фото, разрешите доступ в настройках приложения.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Настройки', onPress: () => Linking.openSettings() },
      ],
    );
    return { ok: false, reason: 'permission_denied' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
  });

  if (result.canceled || result.assets.length === 0) {
    return { ok: false, reason: 'cancelled' };
  }

  const asset = result.assets[0];
  return {
    ok: true,
    uri: asset.uri,
    width: asset.width ?? 0,
    height: asset.height ?? 0,
  };
}
