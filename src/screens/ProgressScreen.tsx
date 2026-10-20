import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { SplitBar } from '../components/SplitBar';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';

export const ProgressScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    colors,
    dailyGoal,
    entries,
    todayTotal,
    daySummaries7,
    daySummaries30,
    metrics,
  } = useApp();

  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    dateStr: string;
    dayNum: number;
    grams: number;
    goal: number;
    met: boolean;
  } | null>(null);

  // 1. Current Week Data (Sunday to Saturday)
  const weekData = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - currentDayOfWeek);

    const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const days = [];
    let weekTotal = 0;
    let bestDayGrams = 0;
    let goalsHit = 0;
    let elapsedDays = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;

      const isToday = i === currentDayOfWeek;
      const isPastOrToday = i <= currentDayOfWeek;
      if (isPastOrToday) elapsedDays++;

      const daysEntries = entries.filter((e) => e.dateStr === dStr);
      const totalGrams = daysEntries.reduce((acc, curr) => acc + curr.totalGrams, 0);

      if (totalGrams > 0) {
        weekTotal += totalGrams;
        if (totalGrams > bestDayGrams) {
          bestDayGrams = totalGrams;
        }
      }

      if (totalGrams >= dailyGoal) {
        goalsHit++;
      }

      days.push({
        letter: DAY_LETTERS[i],
        dateStr: dStr,
        dayNum: d.getDate(),
        grams: Math.round(totalGrams * 10) / 10,
        isToday,
        isPastOrToday,
        metGoal: totalGrams >= dailyGoal,
      });
    }

    const avgPerDay = elapsedDays > 0 ? Math.round(weekTotal / elapsedDays) : 0;

    return {
      days,
      avgPerDay,
      bestDayGrams: Math.round(bestDayGrams),
      goalsHit,
    };
  }, [entries, dailyGoal]);

  // 2. Trailing 30 Days Heat Grid Data
  const last30Grid = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let totalGrams30 = 0;
    let bestDay30 = 0;
    let goalsHit30 = 0;
    const squares = [];

    // 30 days trailing up to today
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;

      const daysEntries = entries.filter((e) => e.dateStr === dStr);
      const totalGrams = daysEntries.reduce((acc, curr) => acc + curr.totalGrams, 0);
      const roundedGrams = Math.round(totalGrams * 10) / 10;

      totalGrams30 += totalGrams;
      if (totalGrams > bestDay30) {
        bestDay30 = totalGrams;
      }
      if (totalGrams >= dailyGoal) {
        goalsHit30++;
      }

      // Determine color tier (0 to 4)
      let tier = 0;
      if (roundedGrams > 0) {
        const pct = roundedGrams / dailyGoal;
        if (pct >= 1.0) {
          tier = 4; // Goal reached
        } else if (pct >= 0.5) {
          tier = 3;
        } else if (pct >= 0.25) {
          tier = 2;
        } else {
          tier = 1;
        }
      }

      squares.push({
        dateStr: dStr,
        dayNum: d.getDate(),
        grams: roundedGrams,
        goal: dailyGoal,
        metGoal: totalGrams >= dailyGoal,
        isToday: dStr === todayStr,
        tier,
      });
    }

    const avgPerDay30 = Math.round(totalGrams30 / 30);

    return {
      squares,
      avgPerDay30,
      bestDay30: Math.round(bestDay30),
      goalsHit30,
    };
  }, [entries, dailyGoal]);

  // Color Swatches for the 5 tiers (Light & Dark mode compatible)
  // Stripped all pink, purple, and magenta per user requirement.
  // Using pure brand palette: soft neutral, pale sage, moss green, vibrant pea green, and deep forest green.
  const tierColors = useMemo(() => {
    if (colors.isDark) {
      return {
        0: '#2A2F25',       // Empty neutral dark
        1: '#3D5033',       // Tier 1: Soft olive
        2: '#4F6F3F',       // Tier 2: Medium moss green
        3: '#6FA45B',       // Tier 3: Vibrant fresh green
        4: '#93AC72',       // Tier 4: Brand deep forest green (100% goal)
      };
    }
    return {
      0: '#E7E4DC',         // Empty neutral warm
      1: '#CCD9BE',         // Tier 1: Soft light pale sage
      2: '#9FB789',         // Tier 2: Medium moss green
      3: '#55994E',         // Tier 3: Vibrant pea green
      4: '#2C6B39',         // Tier 4: Rich deep forest green (100% goal)
    };
  }, [colors.isDark]);

  // 30-day Soluble / Insoluble sum
  const split30 = useMemo(() => {
    const totalSol = daySummaries30.reduce((acc, d) => acc + d.solubleGrams, 0);
    const totalIns = daySummaries30.reduce((acc, d) => acc + d.insolubleGrams, 0);
    return {
      soluble: Math.round(totalSol * 10) / 10,
      insoluble: Math.round(totalIns * 10) / 10,
    };
  }, [daySummaries30]);

  // Streak representation
  const streakText = metrics.currentStreak > 0
    ? `${metrics.currentStreak} ${metrics.currentStreak === 1 ? 'day' : 'days'}`
    : '—';

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
        {/* CARD 1: This Week */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>This Week</Text>

          {/* 7 Days Row: Grams + Vertical Bar Track + Letter */}
          <View style={styles.weekRow}>
            {weekData.days.map((item, index) => {
              const TRACK_HEIGHT = 60;
              const ratio = dailyGoal > 0 ? Math.min(1.0, item.grams / dailyGoal) : 0;
              const isFull = ratio >= 1.0;
              const fillHeight = item.grams === 0 ? 3 : Math.max(6, Math.round(ratio * TRACK_HEIGHT));

              let fillColor = colors.isDark ? '#4A483D' : '#D0CAC0';
              if (item.grams > 0) {
                if (isFull) {
                  fillColor = colors.isDark ? '#93AC72' : '#2C6B39'; // Rich brand forest green
                } else if (ratio >= 0.5) {
                  fillColor = colors.isDark ? '#6FA45B' : '#3F8F4F'; // Vibrant pea green
                } else {
                  fillColor = colors.isDark ? '#D97706' : '#E69138'; // Warm amber in-progress
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.dayCol}
                  onPress={() => setSelectedDayInfo({
                    dateStr: item.dateStr,
                    dayNum: item.dayNum,
                    grams: item.grams,
                    goal: dailyGoal,
                    met: item.metGoal,
                  })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayGramText,
                      {
                        color: item.isToday
                          ? colors.isDark ? '#93AC72' : '#2C6B39'
                          : colors.inkSoft,
                      },
                    ]}
                  >
                    {Math.round(item.grams)}
                  </Text>

                  {/* Vertical Progress Bar Track */}
                  <View
                    style={[
                      styles.verticalTrack,
                      { backgroundColor: colors.isDark ? colors.surface2 : '#EFEBE4' },
                    ]}
                  >
                    <View
                      style={[
                        styles.verticalBarFill,
                        {
                          height: fillHeight,
                          backgroundColor: fillColor,
                          borderTopLeftRadius: isFull ? 5 : 3,
                          borderTopRightRadius: isFull ? 5 : 3,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.dayLetterText,
                      {
                        color: item.isToday
                          ? colors.isDark ? '#93AC72' : '#2C6B39'
                          : colors.inkSoft,
                        fontWeight: item.isToday ? '800' : '600',
                      },
                    ]}
                  >
                    {item.letter}
                  </Text>

                  {item.isToday && (
                    <View
                      style={[
                        styles.todayIndicatorDot,
                        { backgroundColor: colors.isDark ? '#93AC72' : '#2C6B39' },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3 Metric Tiles Row */}
          <View style={styles.threeTilesRow}>
            <View style={[styles.statTile, { backgroundColor: colors.isDark ? colors.surface2 : '#EAE5DE' }]}>
              <Text style={[styles.tileNumber, { color: colors.ink }]}>
                {weekData.avgPerDay}g
              </Text>
              <Text style={[styles.tileLabel, { color: colors.inkSoft }]}>
                Avg / Day
              </Text>
            </View>

            <View style={[styles.statTile, { backgroundColor: colors.isDark ? colors.surface2 : '#EAE5DE' }]}>
              <Text style={[styles.tileNumber, { color: colors.ink }]}>
                {weekData.bestDayGrams}g
              </Text>
              <Text style={[styles.tileLabel, { color: colors.inkSoft }]}>
                Best Day
              </Text>
            </View>

            <View style={[styles.statTile, { backgroundColor: colors.isDark ? colors.surface2 : '#EAE5DE' }]}>
              <Text style={[styles.tileNumber, { color: colors.ink }]}>
                {weekData.goalsHit}/7
              </Text>
              <Text style={[styles.tileLabel, { color: colors.inkSoft }]}>
                Goals Hit
              </Text>
            </View>
          </View>
        </View>

        {/* CARD 2: Last 30 Days (Heat Grid with Legend) */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>Last 30 Days</Text>
          <Text style={[styles.cardSubtitle, { color: colors.inkSoft }]}>
            Each square is a day — fuller color, fuller fiber
          </Text>

          {/* 30 Squares Grid */}
          <View style={styles.gridContainer}>
            {last30Grid.squares.map((sq, idx) => {
              const bg = tierColors[sq.tier as keyof typeof tierColors];
              const isSelected = selectedDayInfo?.dateStr === sq.dateStr;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.gridSquare,
                    {
                      backgroundColor: bg,
                      borderColor: sq.isToday
                        ? colors.isDark ? '#E5EAD8' : '#1D211B'
                        : isSelected
                        ? colors.accent
                        : 'transparent',
                      borderWidth: sq.isToday ? 2.5 : isSelected ? 2 : 0,
                    },
                  ]}
                  onPress={() => setSelectedDayInfo({
                    dateStr: sq.dateStr,
                    dayNum: sq.dayNum,
                    grams: sq.grams,
                    goal: sq.goal,
                    met: sq.metGoal,
                  })}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.squareText,
                      {
                        color: sq.tier === 0
                          ? colors.isDark ? '#8A8C82' : '#736E66'
                          : '#FFFFFF',
                        fontWeight: sq.isToday ? '800' : '600',
                      },
                    ]}
                  >
                    {sq.dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend Row */}
          <View style={styles.legendRow}>
            <Text style={[styles.legendLabel, { color: colors.inkSoft }]}>LESS</Text>
            <View style={styles.swatchRow}>
              {[0, 1, 2, 3, 4].map((t) => (
                <View
                  key={t}
                  style={[
                    styles.swatch,
                    { backgroundColor: tierColors[t as keyof typeof tierColors] },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.legendLabel, { color: colors.inkSoft }]}>MORE</Text>
          </View>

          {/* Selected Day Toast Banner */}
          {selectedDayInfo && (
            <View style={[styles.selectedBanner, { backgroundColor: colors.isDark ? colors.surface2 : '#EFEBE4' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.selectedDateText, { color: colors.ink }]}>
                  {selectedDayInfo.dateStr}
                </Text>
                <Text style={[styles.selectedGramsText, { color: colors.inkSoft }]}>
                  {selectedDayInfo.grams}g fiber logged · Goal: {selectedDayInfo.goal}g (
                  {Math.round((selectedDayInfo.grams / selectedDayInfo.goal) * 100)}%)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedDayInfo(null)}>
                <Ionicons name="close-circle" size={20} color={colors.inkSoft} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* CARD 3: Monthly Summary (2x2 Grid) */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>Monthly Summary</Text>

          <View style={styles.twoByTwoGrid}>
            {/* Top-Left: Avg / day */}
            <View style={[styles.summaryTile, { backgroundColor: colors.isDark ? colors.surface2 : '#EAE5DE' }]}>
              <Text style={[styles.tileNumber, { color: colors.ink }]}>
                {last30Grid.avgPerDay30}g
              </Text>
              <Text style={[styles.tileLabel, { color: colors.inkSoft }]}>
                Avg / Day
              </Text>
            </View>

            {/* Top-Right: Best day */}
            <View style={[styles.summaryTile, { backgroundColor: colors.isDark ? colors.surface2 : '#EAE5DE' }]}>
              <Text style={[styles.tileNumber, { color: colors.ink }]}>
                {last30Grid.bestDay30}g
              </Text>
              <Text style={[styles.tileLabel, { color: colors.inkSoft }]}>
                Best Day
              </Text>
            </View>

            {/* Bottom-Left: Goals hit */}
            <View style={[styles.summaryTile, { backgroundColor: colors.isDark ? colors.surface2 : '#EAE5DE' }]}>
              <Text style={[styles.tileNumber, { color: colors.ink }]}>
                {last30Grid.goalsHit30}/30
              </Text>
              <Text style={[styles.tileLabel, { color: colors.inkSoft }]}>
                Goals Hit
              </Text>
            </View>

            {/* Bottom-Right: Current streak */}
            <View style={[styles.summaryTile, { backgroundColor: colors.isDark ? colors.surface2 : '#EAE5DE' }]}>
              <Text style={[styles.tileNumber, { color: colors.ink }]}>
                {streakText}
              </Text>
              <Text style={[styles.tileLabel, { color: colors.inkSoft }]}>
                Current Streak
              </Text>
            </View>
          </View>
        </View>

        {/* CARD 4: Soluble vs. Insoluble 30-Day Ratio */}
        <SplitBar
          solubleGrams={split30.soluble}
          insolubleGrams={split30.insoluble}
          showCardWrapper={true}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  cardTitle: {
    fontFamily: FONTS.serif,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontFamily: FONTS.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },

  // Week Row
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
    paddingHorizontal: 4,
  },
  dayCol: {
    alignItems: 'center',
    width: 40,
  },
  dayGramText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  verticalTrack: {
    width: 10,
    height: 60,
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  verticalBarFill: {
    width: '100%',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  todayIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  dayLetterText: {
    fontSize: 14,
  },

  // 3-tiles row
  threeTilesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  statTile: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileNumber: {
    fontFamily: FONTS.serif,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  tileLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },

  // Heat Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'flex-start',
    marginBottom: 18,
  },
  gridSquare: {
    width: 35,
    height: 35,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareText: {
    fontSize: 12,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 17,
    height: 17,
    borderRadius: 4,
  },

  // Selected Day Banner
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
    gap: 10,
  },
  selectedDateText: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectedGramsText: {
    fontSize: 12,
    marginTop: 2,
  },

  // 2x2 Grid for Monthly Summary
  twoByTwoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  summaryTile: {
    width: '48%',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
