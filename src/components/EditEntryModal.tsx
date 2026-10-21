import React, { useState, useEffect } from 'react';
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
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { FoodEntry } from '../types';
import { FiberTag, estimateFiberSplit } from '../constants/keywords';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';
import { CachedImage } from './CachedImage';

interface EditEntryModalProps {
  visible: boolean;
  entry: FoodEntry | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<FoodEntry>) => Promise<void>;
  onDelete?: (id: string) => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({
  visible,
  entry,
  onClose,
  onSave,
  onDelete,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useApp();

  const [foodName, setFoodName] = useState('');
  const [portion, setPortion] = useState('');
  const [totalGrams, setTotalGrams] = useState('');
  const [solubleGrams, setSolubleGrams] = useState('');
  const [insolubleGrams, setInsolubleGrams] = useState('');
  const [tag, setTag] = useState<FiberTag>('mixed');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (entry) {
      setFoodName(entry.name || '');
      setPortion(entry.portion || '');
      setTotalGrams(entry.totalGrams.toString());
      setSolubleGrams(entry.solubleGrams.toString());
      setInsolubleGrams(entry.insolubleGrams.toString());
      setTag(entry.tag || 'mixed');
      setImageError(false);
    }
  }, [entry, visible]);

  if (!entry) return null;

  const handleTotalGramsChange = (val: string) => {
    setTotalGrams(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const split = estimateFiberSplit(num, tag);
      setSolubleGrams(split.solubleGrams.toString());
      setInsolubleGrams(split.insolubleGrams.toString());
    }
  };

  const handleTagChange = (newTag: FiberTag) => {
    setTag(newTag);
    const num = parseFloat(totalGrams);
    if (!isNaN(num) && num >= 0) {
      const split = estimateFiberSplit(num, newTag);
      setSolubleGrams(split.solubleGrams.toString());
      setInsolubleGrams(split.insolubleGrams.toString());
    }
  };

  const handleSave = async () => {
    const trimmedName = foodName.trim();
    if (!trimmedName) {
      Alert.alert('Missing Name', 'Please provide a name for this meal.');
      return;
    }

    const total = parseFloat(totalGrams);
    if (isNaN(total) || total < 0) {
      Alert.alert('Invalid Fiber Amount', 'Please enter a valid fiber amount in grams.');
      return;
    }

    const sol = parseFloat(solubleGrams);
    const ins = parseFloat(insolubleGrams);

    const solFinal = !isNaN(sol) && sol >= 0 ? sol : Math.round(total * 0.45 * 10) / 10;
    const insFinal = !isNaN(ins) && ins >= 0 ? ins : Math.round((total - solFinal) * 10) / 10;

    await onSave(entry.id, {
      name: trimmedName,
      portion: portion.trim() || '1 serving',
      totalGrams: Math.round(total * 10) / 10,
      solubleGrams: Math.round(solFinal * 10) / 10,
      insolubleGrams: Math.round(insFinal * 10) / 10,
      tag,
    });

    onClose();
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      'Remove Entry',
      `Are you sure you want to delete "${entry.name}" from your log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(entry.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
            <View>
              <Text style={[styles.title, { color: colors.ink }]}>Edit Meal Entry</Text>
              <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
                Update portion, fiber count, or description
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surface2 }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 30 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Meal Photo Preview if available */}
            {entry.imageUri && !imageError && (
              <View style={[styles.photoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <CachedImage
                  source={{ uri: entry.imageUri }}
                  style={styles.photo}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
                <View style={[styles.photoBadge, { backgroundColor: colors.accentDeep }]}>
                  <Ionicons name="camera" size={12} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.photoBadgeText}>Captured Photo</Text>
                </View>
              </View>
            )}

            {/* Food Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.ink }]}>Food / Meal Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.ink,
                  },
                ]}
                placeholder="e.g. Crispy Southern-Style Fried Chicken"
                placeholderTextColor={colors.inkFaint}
                value={foodName}
                onChangeText={setFoodName}
              />
            </View>

            {/* Portion Description */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.ink }]}>Portion / Serving Size</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.ink,
                  },
                ]}
                placeholder="e.g. 1 basket / approx 960g (8 pieces)"
                placeholderTextColor={colors.inkFaint}
                value={portion}
                onChangeText={setPortion}
              />
            </View>

            {/* Total Fiber (grams) */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.ink }]}>Total Dietary Fiber (grams)</Text>
              <View style={[styles.inputWithUnit, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.numericInput, { color: colors.accentDeep }]}
                  placeholder="0.0"
                  placeholderTextColor={colors.inkFaint}
                  keyboardType="decimal-pad"
                  value={totalGrams}
                  onChangeText={handleTotalGramsChange}
                />
                <Text style={[styles.unitText, { color: colors.accentDeep }]}>grams</Text>
              </View>
            </View>

            {/* Fiber Type / Dominance Tag */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.ink }]}>Fiber Dominance / Type</Text>
              <View style={styles.tagRow}>
                {(['mixed', 'soluble', 'insoluble'] as FiberTag[]).map((t) => {
                  const isActive = tag === t;
                  const label = t === 'mixed' ? 'Balanced' : t === 'soluble' ? 'Soluble' : 'Insoluble';
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.tagBtn,
                        {
                          backgroundColor: isActive ? colors.accent : colors.surface,
                          borderColor: isActive ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => handleTagChange(t)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.tagBtnText,
                          {
                            color: isActive ? colors.accentInk : colors.ink,
                            fontWeight: isActive ? '700' : '500',
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Split Breakdown */}
            <View style={[styles.splitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.splitTitle, { color: colors.ink }]}>Soluble & Insoluble Breakdown</Text>
              <View style={styles.splitRow}>
                <View style={styles.splitCol}>
                  <Text style={[styles.splitLabel, { color: colors.inkSoft }]}>Soluble Fiber</Text>
                  <View style={[styles.splitInputWrap, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.splitInput, { color: colors.ink }]}
                      keyboardType="decimal-pad"
                      value={solubleGrams}
                      onChangeText={setSolubleGrams}
                    />
                    <Text style={[styles.splitUnit, { color: colors.inkSoft }]}>g</Text>
                  </View>
                </View>

                <View style={styles.splitCol}>
                  <Text style={[styles.splitLabel, { color: colors.inkSoft }]}>Insoluble Fiber</Text>
                  <View style={[styles.splitInputWrap, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.splitInput, { color: colors.ink }]}
                      keyboardType="decimal-pad"
                      value={insolubleGrams}
                      onChangeText={setInsolubleGrams}
                    />
                    <Text style={[styles.splitUnit, { color: colors.inkSoft }]}>g</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.accentInk} style={{ marginRight: 6 }} />
                <Text style={[styles.saveBtnText, { color: colors.accentInk }]}>Save Changes</Text>
              </TouchableOpacity>

              {onDelete && (
                <TouchableOpacity
                  style={[styles.deleteBtn, { borderColor: '#E57373', backgroundColor: colors.surface }]}
                  onPress={handleDelete}
                  activeOpacity={0.85}
                >
                  <Ionicons name="trash-outline" size={16} color="#D32F2F" style={{ marginRight: 6 }} />
                  <Text style={styles.deleteBtnText}>Remove this meal</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.serif,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 160,
  },
  photoCard: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 20,
    height: 180,
    position: 'relative',
    ...SHADOWS.card,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  photoBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  numericInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.serif,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagBtnText: {
    fontSize: 13,
  },
  splitCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  splitTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  splitCol: {
    flex: 1,
  },
  splitLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  splitInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  splitInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  splitUnit: {
    fontSize: 12,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.card,
    ...SHADOWS.card,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  deleteBtnText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
  },
});
