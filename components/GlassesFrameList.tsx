import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { getGlassesFrameImage } from '../constants/glassesFrameImages';
import { fontRegular } from '../theme/fonts';

const FRAME_IMAGE_HEIGHT = 200;

type Props = {
  frameNames: string[];
  fallbackText: string;
};

export function GlassesFrameList({ frameNames, fallbackText }: Props) {
  const [expandedFrame, setExpandedFrame] = useState<string | null>(null);

  if (frameNames.length === 0) {
    return <Text style={styles.fallback}>{fallbackText}</Text>;
  }

  const onPressFrame = (name: string) => {
    setExpandedFrame((prev) => (prev === name ? null : name));
  };

  return (
    <View style={styles.list}>
      {frameNames.map((name) => {
        const source = getGlassesFrameImage(name);
        const isExpanded = expandedFrame === name;
        const isActive = isExpanded;

        return (
          <View key={name} style={styles.item}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                isActive ? styles.buttonActive : styles.buttonInactive,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => onPressFrame(name)}
            >
              <Text style={[styles.buttonText, isActive ? styles.buttonTextActive : styles.buttonTextInactive]}>
                {name}
              </Text>
            </Pressable>
            {isExpanded && source !== undefined ? (
              <View style={styles.imageWrap}>
                <Image source={source} style={styles.image} resizeMode="contain" />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingLeft: 24,
    gap: 10,
  },
  item: {
    width: '90%',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonInactive: {
    backgroundColor: '#E0F1F1',
    borderColor: 'rgba(224, 240, 240, 0.45)',
  },
  buttonActive: {
    backgroundColor: '#094A4C',
    borderColor: '#249193',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontFamily: fontRegular,
    fontSize: 15,
    textAlign: 'center',
  },
  buttonTextInactive: {
    color: '#094A4C',
  },
  buttonTextActive: {
    color: '#F4FDFD',
  },
  imageWrap: {
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: '100%',
    height: FRAME_IMAGE_HEIGHT,
  },
  fallback: {
    fontFamily: fontRegular,
    fontSize: 16,
    lineHeight: 24,
    color: '#094A4C',
    paddingLeft: 24,
    alignSelf: 'stretch',
    maxWidth: '100%',
  },
});
