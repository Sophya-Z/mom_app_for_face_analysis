import { HeaderBackButton } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmDialog } from '../components/ConfirmDialog';

import type { RootStackParamList } from '../navigation/types';
import {
  invalidateAnalysisHistoryCache,
  listAnalysisHistory,
  removeAnalysisHistoryEntry,
  type AnalysisHistoryEntry,
} from '../state/analysisHistoryStore';
import { fontRegular } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'AnalysisHistory'>;

const HEADER_BAR = '#094A4C';
const BACK_TINT = '#F4FDFD';
const NUM_COLUMNS = 3;
const GRID_GAP = 10;
const GRID_PADDING = 12;
const THUMB_W =
  (Dimensions.get('window').width - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;
const THUMB_H = Math.round(THUMB_W * (320 / 224));

export function AnalysisHistoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<AnalysisHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entryToDelete, setEntryToDelete] = useState<AnalysisHistoryEntry | null>(null);

  const reload = useCallback(() => {
    invalidateAnalysisHistoryCache();
    void (async () => {
      setLoading(true);
      try {
        const list = await listAnalysisHistory();
        setEntries(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const confirmDelete = (entry: AnalysisHistoryEntry) => {
    setEntryToDelete(entry);
  };

  const handleDeleteConfirm = () => {
    if (!entryToDelete) {
      return;
    }
    const id = entryToDelete.id;
    setEntryToDelete(null);
    void (async () => {
      await removeAnalysisHistoryEntry(id);
      reload();
    })();
  };

  const openDetail = (entry: AnalysisHistoryEntry) => {
    navigation.navigate('AnalysisResult', {
      localUri: entry.photoUri,
      showTryOnMakeup: false,
      analysisData: entry.analysisJson,
      historyId: entry.id,
      savedContourPhotoUri: entry.contourPhotoUri,
      savedTryOnPhotoUri: entry.tryOnPhotoUri,
    });
  };

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
        <Text style={styles.headerTitle}>История запросов на анализ</Text>
      </View>

      {loading ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Загрузка…</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Пока нет сохранённых анализов</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: 24 + insets.bottom },
          ]}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.thumbWrap, pressed && styles.thumbPressed]}
              onPress={() => openDetail(item)}
              onLongPress={() => confirmDelete(item)}
              delayLongPress={400}
            >
              <Image source={{ uri: item.photoUri }} style={styles.thumb} resizeMode="cover" />
            </Pressable>
          )}
        />
      )}
      <ConfirmDialog
        visible={entryToDelete !== null}
        title="Удалить результат анализа фото?"
        onCancel={() => setEntryToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4FDFD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  headerTitle: {
    color: '#F4FDFD',
    paddingTop: 8,
    fontSize: 16,
    fontFamily: fontRegular,
    flex: 1,
    paddingRight: 12,
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 16,
  },
  gridRow: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  thumbWrap: {
    width: THUMB_W,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(9, 74, 76, 0.2)',
    backgroundColor: '#E0F1F1',
  },
  thumbPressed: {
    opacity: 0.85,
  },
  thumb: {
    width: THUMB_W,
    height: THUMB_H,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: fontRegular,
    fontSize: 16,
    color: '#094A4C',
    textAlign: 'center',
  },
});
