import { Image, StyleSheet, Text, View } from 'react-native';

import { fontRegular } from '../theme/fonts';

const PHOTO_W = 224;
const PHOTO_H = 320;

type Props = {
  uri: string;
};

export function SavedMakeupPhoto({ uri }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Подходящий макияж</Text>
      <View style={styles.photoBlock}>
        <Image source={{ uri }} style={styles.photoFrame} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 24,
    width: '100%',
  },
  label: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#094A4C',
    marginBottom: 10,
    paddingLeft: 10,
  },
  photoBlock: {
    alignItems: 'center',
  },
  photoFrame: {
    width: PHOTO_W,
    height: PHOTO_H,
  },
});
