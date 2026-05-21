import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../navigation/types';
import { fontRegular } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root} collapsable={false}>
      <StatusBar style="dark" />
      <View
        style={[
          styles.topRow,
          { paddingTop: insets.top + 8, paddingRight: 16 },
        ]}
      >
        <Image
          source={require('../assets/vkr_flowers.png')}
          style={styles.flower}
          resizeMode="contain"
        />
      </View>

      <View style={styles.centerBlock}>
        <Text style={styles.welcomeText}>
          Добро пожаловать в приложение-консультант по улучшению внешнего вида.
        </Text>
      </View>

      <SafeAreaView
        edges={['bottom']}
        collapsable={false}
        style={styles.bottomBlock}
      >
        <Text style={styles.analysisLabel}>Приступить к анализу внешности</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.ctaButton, { backgroundColor: '#E0F0F0' }]}
          onPress={() => navigation.navigate('PhotoSource')}
        >
          <Text style={styles.ctaButtonText}>Нажмите сюда</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4FDFD',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  flower: {
    width: 175,
    height: 184,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 58,
  },
  welcomeText: {
    fontFamily: fontRegular,
    fontSize: 16,
    textAlign: 'left',
    color: '#111',
  },
  bottomBlock: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingBottom: 50,
    zIndex: 10,
    elevation: 10,
  },
  analysisLabel: {
    fontFamily: fontRegular,
    fontSize: 14,
    textAlign: 'center',
    color: '#140404',
    marginBottom: 12,
  },
  ctaButton: {
    width: 256,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#42ACAF',
    borderWidth: 2,
  },
  ctaButtonText: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#140404',
  },
});
