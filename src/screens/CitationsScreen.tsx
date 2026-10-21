import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CLINICAL_CITATIONS, CitationItem } from '../constants/guidelines';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';

type CitationCategory = 'all' | 'guidelines' | 'weight' | 'metabolic' | 'cardio' | 'gut' | 'nutrition';

export const CitationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useApp();

  const [activeCategory, setActiveCategory] = useState<CitationCategory>(
    route.params?.category || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (route.params?.category) {
      setActiveCategory(route.params.category);
    }
  }, [route.params?.category]);

  const categories: { key: CitationCategory; label: string; icon: string }[] = [
    { key: 'all', label: 'All Research', icon: 'layers-outline' },
    { key: 'guidelines', label: 'Dietary Reference Intakes (DRI)', icon: 'stats-chart-outline' },
    { key: 'weight', label: 'Weight & Satiety', icon: 'scale-outline' },
    { key: 'metabolic', label: 'Blood Sugar & Metabolism', icon: 'pulse-outline' },
    { key: 'cardio', label: 'Heart & Blood Pressure', icon: 'heart-outline' },
    { key: 'gut', label: 'Gut Microbiome', icon: 'fitness-outline' },
    { key: 'nutrition', label: 'USDA Food Database', icon: 'nutrition-outline' },
  ];

  const filteredCitations = useMemo(() => {
    let list = CLINICAL_CITATIONS;
    if (activeCategory !== 'all') {
      list = list.filter((c) => c.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.authors.toLowerCase().includes(q) ||
          c.source.toLowerCase().includes(q) ||
          c.keyFinding.toLowerCase().includes(q) ||
          c.appApplication.toLowerCase().includes(q) ||
          c.categoryLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const handleOpenLink = async (url?: string) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot Open Link', `Could not open ${url}`);
      }
    } catch {
      Alert.alert('Link Error', 'Unable to open browser.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Top Header with Back Navigation */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surface2 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={[styles.headerTitle, { color: colors.ink }]}>
            Scientific Citations
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.inkSoft }]}>
            Dietary Evidence & Guidelines
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Banner */}
        <View style={[styles.introCard, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}>
          <View style={styles.introHeader}>
            <Ionicons name="school-outline" size={22} color={colors.accentDeep} />
            <Text style={[styles.introTitle, { color: colors.accentDeep }]}>
              Evidence-Based Nutritional Science
            </Text>
          </View>
          <Text style={[styles.introText, { color: colors.ink }]}>
            FiberSnap’s daily goals, soluble vs. insoluble ratios, and tracking thresholds are directly modeled on peer-reviewed dietary research and official nutritional reference guidelines from the Institute of Medicine (IOM) Dietary Reference Intakes (DRI), United States Department of Agriculture (USDA), and the World Health Organization (WHO).
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.inkSoft} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.ink }]}
            placeholder="Search papers, topics (e.g. weight, metabolism, satiety)..."
            placeholderTextColor={colors.inkFaint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.inkSoft} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => setActiveCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={15}
                  color={isSelected ? colors.accentInk : colors.inkSoft}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: isSelected ? colors.accentInk : colors.ink },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results Count Banner */}
        <View style={styles.resultsHeaderRow}>
          <Text style={[styles.resultsCountText, { color: colors.inkSoft }]}>
            Showing {filteredCitations.length} of {CLINICAL_CITATIONS.length} peer-reviewed dietary & nutritional publications
          </Text>
        </View>

        {/* Citations List */}
        <View style={styles.citationsList}>
          {filteredCitations.length > 0 ? (
            filteredCitations.map((item) => (
              <CitationCard
                key={item.id}
                item={item}
                colors={colors}
                onOpenLink={handleOpenLink}
              />
            ))
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="document-text-outline" size={32} color={colors.inkFaint} />
              <Text style={[styles.emptyTitle, { color: colors.ink }]}>No matching research found</Text>
              <Text style={[styles.emptySub, { color: colors.inkSoft }]}>
                Try searching for terms like "weight", "cholesterol", or "IOM".
              </Text>
            </View>
          )}
        </View>

        {/* Medical & Wellness Disclaimer */}
        <View style={[styles.disclaimerBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.inkSoft} style={{ marginTop: 2 }} />
          <Text style={[styles.disclaimerText, { color: colors.inkSoft }]}>
            <Text style={{ fontWeight: '700', color: colors.ink }}>Medical Disclaimer: </Text>
            FiberSnap is designed for general wellness guidance and dietary education. If you suffer from irritable bowel syndrome (IBS), inflammatory bowel disease (Crohn's or colitis), or other digestive conditions, always consult a physician or registered dietitian before substantially changing fiber intake.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const CitationCard: React.FC<{
  item: CitationItem;
  colors: any;
  onOpenLink: (url?: string) => void;
}> = ({ item, colors, onOpenLink }) => {
  return (
    <View style={[styles.citationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Category Tag & Year */}
      <View style={styles.cardTopRow}>
        <View style={[styles.catBadge, { backgroundColor: colors.surface2 }]}>
          <Text style={[styles.catText, { color: colors.accentDeep }]}>
            {item.categoryLabel}
          </Text>
        </View>
        <Text style={[styles.yearText, { color: colors.inkSoft }]}>
          {item.year}
        </Text>
      </View>

      {/* Title */}
      <Text style={[styles.citationTitle, { color: colors.ink }]}>
        {item.title}
      </Text>

      {/* Authors & Source */}
      <Text style={[styles.authorText, { color: colors.inkSoft }]}>
        {item.authors}
      </Text>
      <Text style={[styles.sourceText, { color: colors.inkFaint }]}>
        {item.source}
      </Text>

      {/* Key Finding Box */}
      <View style={[styles.findingBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="bulb-outline" size={16} color={colors.accentDeep} />
          <Text style={[styles.boxTitle, { color: colors.accentDeep }]}>
            Key Research Finding
          </Text>
        </View>
        <Text style={[styles.boxContent, { color: colors.ink }]}>
          {item.keyFinding}
        </Text>
      </View>

      {/* In-App Application Box */}
      <View style={[styles.appBox, { backgroundColor: colors.isDark ? '#263321' : '#F1F6EC', borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.accent} />
          <Text style={[styles.boxTitle, { color: colors.accent }]}>
            FiberSnap Implementation
          </Text>
        </View>
        <Text style={[styles.boxContent, { color: colors.ink }]}>
          {item.appApplication}
        </Text>
      </View>

      {/* DOI / External Link Button */}
      {item.doiOrUrl && (
        <TouchableOpacity
          style={[styles.linkBtn, { borderColor: colors.border }]}
          onPress={() => onOpenLink(item.doiOrUrl)}
          activeOpacity={0.8}
        >
          <Text style={[styles.linkBtnText, { color: colors.accentDeep }]}>
            View Original Publication / DOI
          </Text>
          <Ionicons name="open-outline" size={15} color={colors.accentDeep} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.sans,
    fontWeight: '700',
    fontSize: 18,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  introCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  introTitle: {
    fontFamily: FONTS.sans,
    fontSize: 16,
    fontWeight: '700',
  },
  introText: {
    fontSize: 13,
    lineHeight: 19,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  citationsList: {
    gap: 16,
  },
  citationCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 18,
    gap: 10,
    ...SHADOWS.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  citationTitle: {
    fontFamily: FONTS.sans,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  authorText: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
  sourceText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  findingBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  appBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boxTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  boxContent: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.pill,
    paddingVertical: 10,
    gap: 6,
    marginTop: 4,
  },
  linkBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  disclaimerBox: {
    flexDirection: 'row',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
});
