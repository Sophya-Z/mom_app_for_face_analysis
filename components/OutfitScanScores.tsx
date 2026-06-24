import { StyleSheet, Text, View } from 'react-native';

import type { OutfitScanResult } from '../services/uploadOutfitScan';
import { fontRegular } from '../theme/fonts';

const ACCENT = '#249193';
const TEXT = '#094A4C';

function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return String(Math.round(value));
}

type Props = {
  result: OutfitScanResult;
};

export function OutfitScanScores({ result }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.overallLabel}>Общая оценка образа:</Text>
      <View style={styles.circleOuter}>
        <View style={styles.circle}>
          <Text style={styles.circleValue}>{formatScore(result.compatibility_score)}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Одежда</Text>
        <Text style={styles.rowValue}>{formatScore(result.clothing_score)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Обувь</Text>
        <Text style={styles.rowValue}>{formatScore(result.footwear_score)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(224, 241, 241, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(36, 145, 147, 0.25)',
    alignItems: 'center',
  },
  overallLabel: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: TEXT,
    marginBottom: 14,
  },
  circleOuter: {
    marginBottom: 20,
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: ACCENT,
    backgroundColor: '#F4FDFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleValue: {
    fontFamily: fontRegular,
    fontSize: 28,
    color: TEXT,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 260,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(9, 74, 76, 0.12)',
  },
  rowLabel: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: TEXT,
  },
  rowValue: {
    fontFamily: fontRegular,
    fontSize: 18,
    color: ACCENT,
  },
});
