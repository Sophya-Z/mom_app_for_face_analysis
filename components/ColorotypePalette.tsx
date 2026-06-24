import { Dimensions, StyleSheet, Text, View } from 'react-native';

import { fontRegular } from '../theme/fonts';

const COLS = 5;
const GAP = 8;
const HORIZONTAL_PADDING = 16 + 10 + 24;

type Props = {
  colors: string[];
};

function toHexColor(raw: string): string {
  const hex = raw.trim().replace(/^#/, '');
  return hex === '' ? '#000000' : `#${hex}`;
}

function swatchSize(): number {
  const rowWidth = Dimensions.get('window').width - HORIZONTAL_PADDING;
  return Math.floor((rowWidth - GAP * (COLS - 1)) / COLS);
}

export function ColorotypePalette({ colors }: Props) {
  if (colors.length === 0) {
    return null;
  }

  const size = swatchSize();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Палитра</Text>
      <View style={styles.grid}>
        {colors.map((hex, index) => (
          <View
            key={`${hex}-${index}`}
            style={[
              styles.swatch,
              {
                width: size,
                height: size,
                backgroundColor: toHexColor(hex),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    width: '100%',
  },
  label: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#094A4C',
    marginBottom: 10,
    paddingLeft: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingLeft: 24,
  },
  swatch: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(9, 74, 76, 0.15)',
  },
});
