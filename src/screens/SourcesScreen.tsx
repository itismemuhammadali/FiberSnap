import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { SplitBar } from '../components/SplitBar';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';
import { FiberTag } from '../constants/keywords';

type SourcesPeriod = 'today' | '7d' | '30d';

interface AggregatedSource {
  name: string;
  totalGrams: number;
  solubleGrams: number;
  insolubleGrams: number;
  portion: string;
  tag: FiberTag;
  count: number;
}

interface FoodTableItem {
  name: string;
  category: 'veggies' | 'fruits' | 'legumes' | 'grains' | 'seeds';
  portion: string;
  fiberGrams: number;
  solubleGrams: number;
  insolubleGrams: number;
  tag: FiberTag;
}

const HIGH_FIBER_FOOD_TABLE: FoodTableItem[] = [
  { name: 'Potato (with skin)', category: 'veggies', portion: '1 medium baked (173g)', fiberGrams: 4.0, solubleGrams: 1.6, insolubleGrams: 2.4, tag: 'mixed' },
  { name: 'Sweet Potato', category: 'veggies', portion: '1 medium baked (114g)', fiberGrams: 3.8, solubleGrams: 1.8, insolubleGrams: 2.0, tag: 'mixed' },
  { name: 'Tomato', category: 'veggies', portion: '1 medium raw (123g)', fiberGrams: 1.5, solubleGrams: 0.4, insolubleGrams: 1.1, tag: 'insoluble' },
  { name: 'Broccoli', category: 'veggies', portion: '1 cup cooked (156g)', fiberGrams: 5.1, solubleGrams: 1.5, insolubleGrams: 3.6, tag: 'insoluble' },
  { name: 'Brussels Sprouts', category: 'veggies', portion: '1 cup cooked (156g)', fiberGrams: 4.1, solubleGrams: 2.0, insolubleGrams: 2.1, tag: 'mixed' },
  { name: 'Artichoke', category: 'veggies', portion: '1 medium cooked (120g)', fiberGrams: 6.8, solubleGrams: 3.0, insolubleGrams: 3.8, tag: 'soluble' },
  { name: 'Green Peas', category: 'veggies', portion: '1 cup cooked (160g)', fiberGrams: 8.8, solubleGrams: 3.2, insolubleGrams: 5.6, tag: 'insoluble' },
  { name: 'Lentils', category: 'legumes', portion: '1 cup boiled (198g)', fiberGrams: 15.6, solubleGrams: 6.8, insolubleGrams: 8.8, tag: 'soluble' },
  { name: 'Black Beans', category: 'legumes', portion: '1 cup cooked (172g)', fiberGrams: 15.0, solubleGrams: 5.4, insolubleGrams: 9.6, tag: 'soluble' },
  { name: 'Chickpeas (Garbanzo)', category: 'legumes', portion: '1 cup cooked (164g)', fiberGrams: 12.5, solubleGrams: 4.2, insolubleGrams: 8.3, tag: 'soluble' },
  { name: 'Edamame', category: 'legumes', portion: '1 cup cooked (155g)', fiberGrams: 8.1, solubleGrams: 2.5, insolubleGrams: 5.6, tag: 'mixed' },
  { name: 'Avocado', category: 'fruits', portion: '1 whole medium (150g)', fiberGrams: 9.2, solubleGrams: 3.0, insolubleGrams: 6.2, tag: 'mixed' },
  { name: 'Raspberries', category: 'fruits', portion: '1 cup fresh (123g)', fiberGrams: 8.0, solubleGrams: 0.9, insolubleGrams: 7.1, tag: 'insoluble' },
  { name: 'Blackberries', category: 'fruits', portion: '1 cup fresh (144g)', fiberGrams: 7.6, solubleGrams: 1.0, insolubleGrams: 6.6, tag: 'insoluble' },
  { name: 'Pear (with skin)', category: 'fruits', portion: '1 medium fresh (178g)', fiberGrams: 5.5, solubleGrams: 2.1, insolubleGrams: 3.4, tag: 'mixed' },
  { name: 'Apple (with skin)', category: 'fruits', portion: '1 medium fresh (182g)', fiberGrams: 4.4, solubleGrams: 1.2, insolubleGrams: 3.2, tag: 'mixed' },
  { name: 'Chia Seeds', category: 'seeds', portion: '2 tablespoons (28g)', fiberGrams: 9.8, solubleGrams: 3.5, insolubleGrams: 6.3, tag: 'mixed' },
  { name: 'Flaxseeds (ground)', category: 'seeds', portion: '2 tablespoons (14g)', fiberGrams: 3.8, solubleGrams: 1.5, insolubleGrams: 2.3, tag: 'soluble' },
  { name: 'Rolled Oats', category: 'grains', portion: '1 cup cooked (234g)', fiberGrams: 4.0, solubleGrams: 1.9, insolubleGrams: 2.1, tag: 'soluble' },
  { name: 'Quinoa', category: 'grains', portion: '1 cup cooked (185g)', fiberGrams: 5.2, solubleGrams: 1.4, insolubleGrams: 3.8, tag: 'insoluble' },
];

export const SourcesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, entries } = useApp();

  const [period, setPeriod] = useState<SourcesPeriod>('today');
  const [tableSearch, setTableSearch] = useState('');
  const [tableCategory, setTableCategory] = useState<'all' | 'veggies' | 'legumes' | 'fruits' | 'seeds' | 'grains'>('all');

  // Filter entries based on selected timeframe
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (period === 'today') {
      return entries.filter((e) => e.dateStr === todayStr);
    }

    const cutoffDays = period === '7d' ? 7 : 30;
    const cutoffTimestamp = Date.now() - cutoffDays * 24 * 60 * 60 * 1000;

    return entries.filter((e) => {
      if (e.timestamp && e.timestamp >= cutoffTimestamp) return true;
      const d = new Date(e.dateStr + 'T12:00:00');
      return d.getTime() >= cutoffTimestamp;
    });
  }, [entries, period]);

  // Aggregate and rank sources by total fiber grams
  const { rankedSources, totalPeriodFiber, totalSoluble, totalInsoluble, highestGrams } = useMemo(() => {
    const map = new Map<string, AggregatedSource>();
    let totalFiber = 0;
    let sol = 0;
    let ins = 0;

    for (const e of filteredEntries) {
      const key = e.name.trim().toLowerCase();
      totalFiber += e.totalGrams;
      sol += e.solubleGrams;
      ins += e.insolubleGrams;

      if (!map.has(key)) {
        map.set(key, {
          name: e.name,
          totalGrams: e.totalGrams,
          solubleGrams: e.solubleGrams,
          insolubleGrams: e.insolubleGrams,
          portion: e.portion,
          tag: e.tag,
          count: 1,
        });
      } else {
        const existing = map.get(key)!;
        existing.totalGrams += e.totalGrams;
        existing.solubleGrams += e.solubleGrams;
        existing.insolubleGrams += e.insolubleGrams;
        existing.count += 1;
      }
    }

    const list = Array.from(map.values()).sort((a, b) => b.totalGrams - a.totalGrams);
    const maxG = list.length > 0 ? list[0].totalGrams : 1;

    return {
      rankedSources: list,
      totalPeriodFiber: Math.round(totalFiber * 10) / 10,
      totalSoluble: Math.round(sol * 10) / 10,
      totalInsoluble: Math.round(ins * 10) / 10,
      highestGrams: maxG,
    };
  }, [filteredEntries]);

  // Filter Nutrition Table
  const filteredFoodTable = useMemo(() => {
    return HIGH_FIBER_FOOD_TABLE.filter((f) => {
      const matchesCat = tableCategory === 'all' || f.category === tableCategory;
      const matchesSearch = tableSearch.trim() === '' || f.name.toLowerCase().includes(tableSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [tableCategory, tableSearch]);

  const periodOptions: { key: SourcesPeriod; label: string; periodLabel: string }[] = [
    { key: 'today', label: 'Today', periodLabel: "Today's Sources" },
    { key: '7d', label: '7 Days', periodLabel: 'Top Sources (Last 7 Days)' },
    { key: '30d', label: '30 Days', periodLabel: 'Top Sources (Last 30 Days)' },
  ];

  const currentOption = periodOptions.find((p) => p.key === period)!;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopBar title="FiberSnap" subtitle="Fiber, in a snap." showGoalBadge={true} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Switcher (Today | 7 Days | 30 Days) */}
        <View style={[styles.periodSwitcher, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
          {periodOptions.map((opt) => {
            const isActive = period === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.periodBtn,
                  isActive && [
                    styles.periodBtnActive,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.accent,
                    },
                  ],
                ]}
                onPress={() => setPeriod(opt.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    { color: colors.inkSoft },
                    isActive && { color: colors.ink, fontWeight: '700' },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Top Fiber Sources Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                {currentOption.periodLabel}
              </Text>
              <Text style={[styles.subHint, { color: colors.inkSoft }]}>
                {rankedSources.length > 0
                  ? `${totalPeriodFiber}g total fiber across ${rankedSources.length} ${rankedSources.length === 1 ? 'food source' : 'food sources'}`
                  : 'Track meals with AI camera or search to see ranked contributors'}
              </Text>
            </View>
          </View>

          {rankedSources.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Ionicons name="nutrition-outline" size={36} color={colors.inkFaint} />
              <Text style={[styles.emptyHint, { color: colors.inkSoft }]}>
                No meals logged for {optLabelForEmpty(period)}. Log your meals on the Today screen to see your top fiber contributors here.
              </Text>
            </View>
          ) : (
            <View style={styles.sourcesList}>
              {rankedSources.map((item, index) => {
                const barWidthPct = Math.min(100, Math.max(8, Math.round((item.totalGrams / highestGrams) * 100)));
                const sharePct = totalPeriodFiber > 0
                  ? Math.round((item.totalGrams / totalPeriodFiber) * 100)
                  : 0;

                const tagColor =
                  item.tag === 'soluble'
                    ? colors.soluble
                    : item.tag === 'insoluble'
                    ? colors.insoluble
                    : colors.accent;

                return (
                  <View key={index} style={styles.sourceItem}>
                    {/* Header: Rank + Name + Grams + Share */}
                    <View style={styles.sourceTopRow}>
                      <View style={styles.nameWithRank}>
                        <View style={[styles.rankBadge, { backgroundColor: colors.surface2 }]}>
                          <Text style={[styles.rankText, { color: colors.inkSoft }]}>
                            #{index + 1}
                          </Text>
                        </View>
                        <Text style={[styles.sourceName, { color: colors.ink }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.count > 1 && (
                          <View style={[styles.countBadge, { backgroundColor: colors.accentSoft }]}>
                            <Text style={[styles.countText, { color: colors.accentDeep }]}>
                              {item.count}×
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.gramsColumn}>
                        <Text style={[styles.sourceGrams, { color: colors.ink }]}>
                          {item.totalGrams.toFixed(1).replace(/\.0$/, '')}g
                        </Text>
                        <Text style={[styles.shareText, { color: colors.inkSoft }]}>
                          {sharePct}%
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar Track */}
                    <View style={[styles.sourceBarTrack, { backgroundColor: colors.surface2 }]}>
                      <View
                        style={[
                          styles.sourceBarFill,
                          {
                            width: `${barWidthPct}%`,
                            backgroundColor: tagColor,
                          },
                        ]}
                      />
                    </View>

                    {/* Sub details: Soluble vs Insoluble tags */}
                    <View style={styles.sourceMetaRow}>
                      <Text style={[styles.metaText, { color: colors.inkFaint }]}>
                        Soluble: {item.solubleGrams.toFixed(1).replace(/\.0$/, '')}g · Insoluble: {item.insolubleGrams.toFixed(1).replace(/\.0$/, '')}g
                      </Text>
                      <Text style={[styles.tagBadgeText, { color: tagColor }]}>
                        {capitalize(item.tag)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Soluble vs. Insoluble Card for Selected Period */}
        <SplitBar
          solubleGrams={totalSoluble}
          insolubleGrams={totalInsoluble}
          showCardWrapper={true}
        />

        {/* Whole Food Fiber Nutrition Table/Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.tableHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                Fiber Content Table
              </Text>
              <Text style={[styles.subHint, { color: colors.inkSoft }]}>
                Standard United States Department of Agriculture (USDA) reference values for common high-fiber whole foods:
              </Text>
            </View>
            <View style={[styles.usdaBadge, { backgroundColor: colors.surface2 }]}>
              <Text style={[styles.usdaBadgeText, { color: colors.accentDeep }]}>USDA ARS</Text>
            </View>
          </View>

          {/* Table Search & Filter Bar */}
          <View style={[styles.tableSearchBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Ionicons name="search" size={15} color={colors.inkFaint} style={{ marginRight: 6 }} />
            <TextInput
              style={[styles.tableSearchInput, { color: colors.ink }]}
              placeholder="Filter table (e.g. potato, tomato, lentils)..."
              placeholderTextColor={colors.inkFaint}
              value={tableSearch}
              onChangeText={setTableSearch}
            />
            {tableSearch.length > 0 && (
              <TouchableOpacity onPress={() => setTableSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.inkSoft} />
              </TouchableOpacity>
            )}
          </View>

          {/* Table Category Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {[
              { key: 'all', label: 'All Foods' },
              { key: 'veggies', label: 'Vegetables' },
              { key: 'legumes', label: 'Beans & Lentils' },
              { key: 'fruits', label: 'Fruits & Berries' },
              { key: 'seeds', label: 'Seeds & Nuts' },
              { key: 'grains', label: 'Whole Grains' },
            ].map((c) => {
              const active = tableCategory === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.catPill,
                    {
                      backgroundColor: active ? colors.accent : colors.surface2,
                      borderColor: active ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => setTableCategory(c.key as any)}
                >
                  <Text style={[styles.catPillText, { color: active ? colors.accentInk : colors.inkSoft }]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Table Rows */}
          <View style={styles.tableList}>
            {/* Table Header Row */}
            <View style={[styles.tableRowHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.thFood, { color: colors.inkSoft }]}>Food & Serving</Text>
              <Text style={[styles.thFiber, { color: colors.inkSoft }]}>Total</Text>
              <Text style={[styles.thSplit, { color: colors.inkSoft }]}>Sol / Ins</Text>
            </View>

            {filteredFoodTable.map((item, i) => {
              const tagColor =
                item.tag === 'soluble'
                  ? colors.soluble
                  : item.tag === 'insoluble'
                  ? colors.insoluble
                  : colors.accent;

              return (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: colors.border },
                    i % 2 === 1 && { backgroundColor: colors.surface2 + '40' },
                  ]}
                >
                  <View style={styles.tdFood}>
                    <Text style={[styles.tdFoodName, { color: colors.ink }]}>{item.name}</Text>
                    <Text style={[styles.tdPortion, { color: colors.inkFaint }]}>{item.portion}</Text>
                  </View>

                  <View style={styles.tdFiber}>
                    <Text style={[styles.tdFiberValue, { color: tagColor }]}>
                      {item.fiberGrams.toFixed(1).replace(/\.0$/, '')}g
                    </Text>
                  </View>

                  <View style={styles.tdSplit}>
                    <Text style={[styles.tdSplitText, { color: colors.inkSoft }]}>
                      {item.solubleGrams}g / {item.insolubleGrams}g
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Scientific Citations & Clinical Research Card */}
        <View style={[styles.card, styles.citationsPromoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.citationIconRow}>
            <View style={[styles.citationIconCircle, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="school" size={24} color={colors.accentDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.citationPromoTitle, { color: colors.ink }]}>
                Scientific Research & Citations
              </Text>
              <Text style={[styles.citationPromoSub, { color: colors.inkSoft }]}>
                Validated dietary science from The Lancet, Institute of Medicine Dietary Reference Intakes (DRI), World Health Organization (WHO), and American Heart Association (AHA).
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.citationPromoBtn, { backgroundColor: colors.accent }]}
            onPress={() => navigation.navigate('Citations')}
            activeOpacity={0.88}
          >
            <Text style={[styles.citationPromoBtnText, { color: colors.accentInk }]}>
              Read Research Studies & Guidelines →
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

function optLabelForEmpty(p: SourcesPeriod) {
  if (p === 'today') return 'today';
  if (p === '7d') return 'the last 7 days';
  return 'the last 30 days';
}

function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  periodSwitcher: {
    flexDirection: 'row',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodBtnActive: {
    ...SHADOWS.soft,
  },
  periodBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  cardHeaderRow: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.serif,
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: -0.2,
  },
  subHint: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  emptyHint: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: '85%',
  },
  sourcesList: {
    gap: 16,
  },
  sourceItem: {
    gap: 6,
  },
  sourceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameWithRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '65%',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  gramsColumn: {
    alignItems: 'flex-end',
  },
  sourceGrams: {
    fontSize: 14,
    fontWeight: '700',
  },
  shareText: {
    fontSize: 11,
  },
  sourceBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sourceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sourceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11.5,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Table Styles
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  usdaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  usdaBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tableSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  tableSearchInput: {
    flex: 1,
    fontSize: 12.5,
  },
  categoryScroll: {
    gap: 6,
    paddingBottom: 10,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  tableList: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  tableRowHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  thFood: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  thFiber: {
    width: 60,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  thSplit: {
    width: 85,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tdFood: {
    flex: 1,
  },
  tdFoodName: {
    fontSize: 13,
    fontWeight: '600',
  },
  tdPortion: {
    fontSize: 11,
    marginTop: 1,
  },
  tdFiber: {
    width: 60,
    alignItems: 'flex-end',
  },
  tdFiberValue: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  tdSplit: {
    width: 85,
    alignItems: 'flex-end',
  },
  tdSplitText: {
    fontSize: 11.5,
  },

  // Citations Promo Card
  citationsPromoCard: {
    gap: 14,
  },
  citationIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  citationIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  citationPromoTitle: {
    fontFamily: FONTS.serif,
    fontSize: 17,
    fontWeight: '700',
  },
  citationPromoSub: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 3,
  },
  citationPromoBtn: {
    borderRadius: RADIUS.pill,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  citationPromoBtnText: {
    fontWeight: '700',
    fontSize: 13.5,
  },
});
