import { Camera } from 'expo-camera';
import { Alert, Linking } from 'react-native';

export async function requestCameraAccess(): Promise<boolean> {
  const result = await Camera.requestCameraPermissionsAsync();

  if (!result.granted) {
    Alert.alert(
      'Нет доступа к камере',
      'Чтобы сделать фото, разрешите доступ к камере в настройках приложения.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Настройки', onPress: () => Linking.openSettings() },
      ],
    );
    return false;
  }

  return true;
}
