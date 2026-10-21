import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { FONTS } from '../constants/theme';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showGoalBadge?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  showGoalBadge = true,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, dailyGoal } = useApp();

  return (
    <View
      style={[
        styles.topbar,
        {
          backgroundColor: colors.accent,
          borderBottomColor: colors.accentDeep,
          paddingTop: Math.max(insets.top, 14) + 6,
        },
      ]}
    >
      <View style={styles.brandRow}>
        {/* Pea Pod SVG Mark */}
        <Svg width={36} height={18} viewBox="0 0 120 60" aria-label="FiberSnap Pod">
          <Path
            d="M8,30 C8,14 28,5 60,5 C92,5 112,14 112,30 C112,46 92,55 60,55 C28,55 8,46 8,30 Z"
            fill="none"
            stroke={colors.accentInk}
            strokeWidth="5"
          />
          <Path
            d="M48.5,14 L48.5,46"
            fill="none"
            stroke={colors.accentInk}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity={0.7}
          />
          <Path
            d="M71.5,14 L71.5,46"
            fill="none"
            stroke={colors.accentInk}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity={0.7}
          />
          <Circle cx="37" cy="30" r="9.5" fill={colors.accentInk} />
          <Circle cx="60" cy="30" r="9.5" fill={colors.accentInk} />
          <Circle cx="83" cy="30" r="9.5" fill={colors.accentInk} />
        </Svg>

        <View style={styles.titleCol}>
          <Text style={[styles.brandWord, { color: colors.accentInk }]}>
            {title || 'FiberSnap'}
          </Text>
          <Text style={[styles.brandTag, { color: colors.accentInk }]}>
            {subtitle || 'Track dietary fiber, in a snap.'}
          </Text>
        </View>
      </View>

      {showGoalBadge && (
        <View style={[styles.goalBadge, { borderColor: 'rgba(255,255,255,0.3)' }]}>
          <Text style={[styles.goalBadgeLabel, { color: colors.accentInk }]}>
            DAILY GOAL
          </Text>
          <Text style={[styles.goalBadgeNum, { color: colors.accentInk }]}>
            {dailyGoal}g
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topbar: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  titleCol: {
    justifyContent: 'center',
  },
  brandWord: {
    fontFamily: FONTS.serif,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  brandTag: {
    fontFamily: FONTS.serifItalic,
    fontStyle: 'italic',
    fontSize: 11.5,
    opacity: 0.85,
    marginTop: 1,
  },
  goalBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
  },
  goalBadgeLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  goalBadgeNum: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 1,
  },
});

