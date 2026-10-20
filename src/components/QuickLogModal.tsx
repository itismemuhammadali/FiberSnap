import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FiberTag } from '../constants/keywords';
import { estimateFiberSplit } from '../constants/keywords';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

interface QuickLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entryData: {
    name: string;
    portion: string;
    totalGrams: number;
    solubleGrams: number;
    insolubleGrams: number;
    tag: FiberTag;
  }) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [foodName, setFoodName] = useState('');
  const [portion, setPortion] = useState('');
  const [grams, setGrams] = useState('');
  const [fiberType, setFiberType] = useState<FiberTag>('mixed');

  const handleSave = () => {
    const total = parseFloat(grams);
    if (!foodName.trim() || isNaN(total) || total <= 0) {
      return;
    }

    const split = estimateFiberSplit(total, fiberType);

    onSave({
      name: foodName.trim(),
      portion: portion.trim() || '1 serving',
      totalGrams: Math.round(total * 10) / 10,
      solubleGrams: split.solubleGrams,
      insolubleGrams: split.insolubleGrams,
      tag: fiberType,
    });

    // Reset fields
    setFoodName('');
    setPortion('');
    setGrams('');
    setFiberType('mixed');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Custom Fiber Entry</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {/* Food Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Food or Meal Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Homemade Chia Pudding, Bran Muffin"
                placeholderTextColor={COLORS.inkFaint}
                value={foodName}
                onChangeText={setFoodName}
              />
            </View>

            {/* Total Fiber Grams */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Total Dietary Fiber (grams) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 6.5"
                placeholderTextColor={COLORS.inkFaint}
                keyboardType="decimal-pad"
                value={grams}
                onChangeText={setGrams}
              />
            </View>

            {/* Portion */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Serving Description (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1 bowl, 2 slices, 1 cup"
                placeholderTextColor={COLORS.inkFaint}
                value={portion}
                onChangeText={setPortion}
              />
            </View>

            {/* Fiber Type Tag */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Primary Fiber Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    fiberType === 'soluble' && styles.typeBtnActiveSoluble,
                  ]}
                  onPress={() => setFiberType('soluble')}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      fiberType === 'soluble' && styles.typeBtnTextActive,
                    ]}
                  >
                    Soluble (Oats, Beans)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    fiberType === 'insoluble' && styles.typeBtnActiveInsoluble,
                  ]}
                  onPress={() => setFiberType('insoluble')}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      fiberType === 'insoluble' && styles.typeBtnTextActive,
                    ]}
                  >
                    Insoluble (Grains, Veg)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    fiberType === 'mixed' && styles.typeBtnActiveMixed,
                  ]}
                  onPress={() => setFiberType('mixed')}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      fiberType === 'mixed' && styles.typeBtnTextActive,
                    ]}
                  >
                    Balanced Blend (50/50)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!foodName.trim() || !grams.trim()) && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!foodName.trim() || !grams.trim()}
            >
              <Text style={styles.saveBtnText}>Log to Today</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
  },
  body: {
    padding: 20,
    paddingBottom: 160,
    gap: 18,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.ink,
  },
  typeSelector: {
    gap: 8,
    marginTop: 4,
  },
  typeBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  typeBtnActiveSoluble: {
    borderColor: COLORS.soluble,
    backgroundColor: COLORS.solubleLight,
  },
  typeBtnActiveInsoluble: {
    borderColor: COLORS.insoluble,
    backgroundColor: COLORS.insolubleLight,
  },
  typeBtnActiveMixed: {
    borderColor: COLORS.peaDeep,
    backgroundColor: COLORS.surfaceAccent,
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkSecondary,
  },
  typeBtnTextActive: {
    color: COLORS.ink,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: COLORS.peaDeep,
    borderRadius: RADIUS.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    ...SHADOWS.card,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.inkWhite,
  },
});
