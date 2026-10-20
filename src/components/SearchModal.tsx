import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { USDASearchItem } from '../types';
import { searchUSDAFoods } from '../services/usdaApi';
import { estimateFiberSplit } from '../constants/keywords';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (entryData: {
    name: string;
    portion: string;
    totalGrams: number;
    solubleGrams: number;
    insolubleGrams: number;
    tag: 'soluble' | 'insoluble' | 'mixed';
  }) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSelectFood,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<USDASearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search logic (350ms)
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const items = await searchUSDAFoods(query);
        setResults(items);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, visible]);

  const handleAdd = (item: USDASearchItem) => {
    const split = estimateFiberSplit(item.fiberGrams, item.tag);
    onSelectFood({
      name: item.description,
      portion: item.servingSize
        ? `${item.servingSize}${item.servingSizeUnit || 'g'}`
        : '1 standard serving',
      totalGrams: item.fiberGrams,
      solubleGrams: split.solubleGrams,
      insolubleGrams: split.insolubleGrams,
      tag: item.tag,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>USDA Food Search</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.ink} />
          </TouchableOpacity>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.inkSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search any food (e.g. Avocado, Chia, Oats)..."
            placeholderTextColor={COLORS.inkFaint}
            value={query}
            onChangeText={setQuery}
            autoFocus
            clearButtonMode="while-editing"
          />
          {loading && <ActivityIndicator size="small" color={COLORS.peaDeep} />}
        </View>

        {/* Results List */}
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.fdcId}_${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionHeader}>
              {query.trim() === '' ? 'High-Fiber Staples' : `Results (${results.length})`}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => handleAdd(item)}
              activeOpacity={0.7}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.itemMeta}>
                  <View
                    style={[
                      styles.tagBadge,
                      item.tag === 'soluble'
                        ? styles.tagSoluble
                        : item.tag === 'insoluble'
                        ? styles.tagInsoluble
                        : styles.tagMixed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagBadgeText,
                        item.tag === 'soluble'
                          ? styles.tagTextSoluble
                          : item.tag === 'insoluble'
                          ? styles.tagTextInsoluble
                          : styles.tagTextMixed,
                      ]}
                    >
                      {item.tag.toUpperCase()}
                    </Text>
                  </View>
                  {item.servingSize ? (
                    <Text style={styles.itemPortion}>
                      {item.servingSize} {item.servingSizeUnit || 'g'}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.itemRight}>
                <View style={styles.fiberBadge}>
                  <Text style={styles.fiberNum}>{item.fiberGrams.toFixed(1)}</Text>
                  <Text style={styles.fiberUnit}>g fiber</Text>
                </View>
                <Ionicons name="add-circle" size={24} color={COLORS.peaDeep} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="nutrition-outline" size={40} color={COLORS.inkFaint} />
                <Text style={styles.emptyText}>No food matches found.</Text>
                <Text style={styles.emptySubText}>
                  Try general search terms like "beans", "berries", or "bread".
                </Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 18,
    marginVertical: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    ...SHADOWS.soft,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.ink,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: COLORS.inkSecondary,
    marginBottom: 12,
  },
  itemRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.ink,
    lineHeight: 19,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagSoluble: {
    backgroundColor: COLORS.solubleLight,
  },
  tagInsoluble: {
    backgroundColor: COLORS.insolubleLight,
  },
  tagMixed: {
    backgroundColor: COLORS.surfaceAccent,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tagTextSoluble: {
    color: COLORS.soluble,
  },
  tagTextInsoluble: {
    color: COLORS.insoluble,
  },
  tagTextMixed: {
    color: COLORS.peaDeep,
  },
  itemPortion: {
    fontSize: 12,
    color: COLORS.inkSecondary,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fiberBadge: {
    alignItems: 'flex-end',
  },
  fiberNum: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ink,
  },
  fiberUnit: {
    fontSize: 10.5,
    color: COLORS.inkSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.inkSecondary,
    textAlign: 'center',
  },
});
