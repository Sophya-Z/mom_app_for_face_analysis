import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { fontRegular } from '../theme/fonts';

type Props = {
  visible: boolean;
  title: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  cancelLabel = 'Нет',
  confirmLabel = 'Да',
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.button, styles.buttonCancel, pressed && styles.buttonPressed]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, styles.buttonTextCancel]}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.button, styles.buttonConfirm, pressed && styles.buttonPressed]}
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, styles.buttonTextConfirm]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 74, 76, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#F4FDFD',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#42ACAF',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontFamily: fontRegular,
    fontSize: 16,
    lineHeight: 24,
    color: '#094A4C',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonCancel: {
    backgroundColor: '#E0F1F1',
    borderColor: 'rgba(224, 240, 240, 0.45)',
  },
  buttonConfirm: {
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
  buttonTextCancel: {
    color: '#094A4C',
  },
  buttonTextConfirm: {
    color: '#F4FDFD',
  },
});
