import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { GeminiScanResult } from '../types';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { CachedImage } from './CachedImage';

interface ScanResultModalProps {
  visible: boolean;
  result: GeminiScanResult | null;
  onClose: () => void;
  onConfirm: (confirmed: {
    name: string;
    portion: string;
    totalGrams: number;
    solubleGrams: number;
    insolubleGrams: number;
    imageUri?: string;
  }) => void;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  visible,
  result,
  onClose,
  onConfirm,
}) => {
  const { colors } = useApp();
  const [foodName, setFoodName] = useState('');
  const [portion, setPortion] = useState('');
  const [totalGrams, setTotalGrams] = useState('');
  const [solubleGrams, setSolubleGrams] = useState('');
  const [insolubleGrams, setInsolubleGrams] = useState('');

  useEffect(() => {
    if (result) {
      setFoodName(result.foodName || 'Scanned Meal');
      setPortion(result.portion || '1 serving');
      setTotalGrams(result.total_fiber_g != null ? String(result.total_fiber_g) : '0');
      setSolubleGrams(result.soluble_fiber_g != null ? String(result.soluble_fiber_g) : '0');
      setInsolubleGrams(result.insoluble_fiber_g != null ? String(result.insoluble_fiber_g) : '0');
    }
  }, [result]);

  const handleConfirm = () => {
    const total = parseFloat(totalGrams) || 0;
    const sol = parseFloat(solubleGrams) || 0;
    const ins = parseFloat(insolubleGrams) || 0;

    if (result) {
      onConfirm({
        name: foodName.trim() || 'AI Scanned Meal',
        portion: portion.trim() || '1 serving',
        totalGrams: Math.round(total * 10) / 10,
        solubleGrams: Math.round(sol * 10) / 10,
        insolubleGrams: Math.round(ins * 10) / 10,
        imageUri: result.imageUri,
      });
    }
    onClose();
  };

  return (
    <Modal
      visible={visible && !!result}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {result && (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoid}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
          >
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={[styles.aiBadge, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="sparkles" size={14} color={colors.accentDeep} />
                <Text style={[styles.aiBadgeText, { color: colors.accentDeep }]}>AI VISION DETECTED</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.content, { paddingBottom: 260, flexGrow: 1 }]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={true}
              bounces={true}
              alwaysBounceVertical={true}
              nestedScrollEnabled={true}
            >
              {/* Photo Thumbnail if captured */}
              {result.imageUri && (
                <View style={[styles.imageContainer, { borderColor: colors.border }]}>
                  <CachedImage source={{ uri: result.imageUri }} style={styles.previewImage} />
                </View>
              )}

              <Text style={[styles.screenTitle, { color: colors.ink }]}>Review Scanned Nutrients</Text>
              <Text style={[styles.screenSub, { color: colors.inkSoft }]}>
                Google Gemini 1.5 Flash parsed your meal. You can edit any value below before logging.
              </Text>

              {/* Form */}
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.inkSoft }]}>Meal Identification</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink }]}
                    value={foodName}
                    onChangeText={setFoodName}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.inkSoft }]}>Estimated Portion</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink }]}
                    value={portion}
                    onChangeText={setPortion}
                  />
                </View>

                <View style={styles.splitGrid}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                      style={[styles.label, { color: colors.inkSoft }]}
                    >
                      Total (g)
                    </Text>
                    <TextInput
                      style={[styles.input, styles.boldInput, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.accentDeep }]}
                      keyboardType="decimal-pad"
                      value={totalGrams}
                      onChangeText={(val) => {
                        setTotalGrams(val);
                        const n = parseFloat(val) || 0;
                        setSolubleGrams((Math.round(n * 0.45 * 10) / 10).toString());
                        setInsolubleGrams((Math.round(n * 0.55 * 10) / 10).toString());
                      }}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                      style={[styles.label, { color: COLORS.soluble }]}
                    >
                      Soluble (g)
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink }]}
                      keyboardType="decimal-pad"
                      value={solubleGrams}
                      onChangeText={setSolubleGrams}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                      style={[styles.label, { color: COLORS.insoluble }]}
                    >
                      Insoluble (g)
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink }]}
                      keyboardType="decimal-pad"
                      value={insolubleGrams}
                      onChangeText={setInsolubleGrams}
                    />
                  </View>
                </View>

                {result.notes && (
                  <View style={[styles.notesBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.accentDeep} />
                    <Text style={[styles.notesText, { color: colors.inkSoft }]}>{result.notes}</Text>
                  </View>
                )}
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.accent, borderColor: colors.accent }]}
                onPress={handleConfirm}
                activeOpacity={0.88}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.accentInk} />
                <Text style={[styles.confirmBtnText, { color: colors.accentInk }]}>Add to Today's Fiber</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
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
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceAccent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.peaDeep,
    letterSpacing: 0.6,
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
  },
  screenSub: {
    fontSize: 13,
    color: COLORS.inkSecondary,
    lineHeight: 18,
    marginTop: -8,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 14,
    ...SHADOWS.soft,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.inkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.ink,
  },
  boldInput: {
    fontWeight: '800',
    fontSize: 16,
    color: COLORS.peaDeep,
  },
  splitGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.surfaceSubtle,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  notesText: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.inkSecondary,
    lineHeight: 17,
  },
  confirmBtn: {
    backgroundColor: COLORS.peaDeep,
    borderRadius: RADIUS.pill,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.card,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.inkWhite,
  },
});
