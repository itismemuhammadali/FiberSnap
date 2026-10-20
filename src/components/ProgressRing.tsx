import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { RADIUS, SHADOWS } from '../constants/theme';

interface ProgressRingProps {
  currentGrams: number;
  goalGrams: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  currentGrams,
  goalGrams,
}) => {
  const { colors } = useApp();

  const size = 136;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const validGoal = Math.max(1, goalGrams);
  const ratio = Math.min(1.5, Math.max(0, currentGrams / validGoal));
  const progressRatio = Math.min(1.0, ratio);
  const strokeDashoffset = circumference - circumference * progressRatio;

  const percentage = Math.round((currentGrams / validGoal) * 100);
  const isGoalMet = currentGrams >= validGoal;
  const remaining = Math.max(0, validGoal - currentGrams);
  const over = Math.max(0, currentGrams - validGoal);

  // Exact headline & subtext matching fibersnap.html
  let headline = `${remaining.toFixed(1).replace(/\.0$/, '')}g remaining today`;
  let subtext = "Let's get started — log your first food";
  let statRemainingText = `${remaining.toFixed(1).replace(/\.0$/, '')}g to go`;

  if (currentGrams > 0 && currentGrams < validGoal) {
    subtext = 'Keep going — every gram feeds your microbiome';
  } else if (isGoalMet) {
    if (over > 0.1) {
      headline = `${over.toFixed(1).replace(/\.0$/, '')}g over your goal`;
      subtext = 'Goal reached today — excellent fiber intake';
      statRemainingText = 'Goal exceeded';
    } else {
      headline = 'Goal reached today';
      subtext = 'Nice work — daily fiber target achieved';
      statRemainingText = 'Goal met';
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.headline, { color: colors.ink }]}>{headline}</Text>
      <Text style={[styles.subtext, { color: colors.accentDeep }]}>{subtext}</Text>

      <View style={styles.ringRow}>
        {/* Ring SVG with center content */}
        <View style={styles.ringWrap}>
          <Svg width={size} height={size}>
            {/* Background Track */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.surface2}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Stroke */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.accent}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>

          <View style={styles.ringCenter}>
            <Text style={[styles.ringNum, { color: colors.ink }]}>
              {currentGrams.toFixed(1).replace(/\.0$/, '')}
            </Text>
            <Text style={[styles.ringLabel, { color: colors.inkFaint }]}>
              OF {validGoal}G FIBER
            </Text>
            <Text style={[styles.ringPct, { color: colors.accentDeep }]}>
              {percentage}%
            </Text>
          </View>
        </View>

        {/* Side Stats */}
        <View style={styles.ringStats}>
          <Text style={[styles.statBig, { color: colors.ink }]}>
            {currentGrams.toFixed(1).replace(/\.0$/, '')}
          </Text>
          <Text style={[styles.statLabel, { color: colors.inkFaint }]}>
            G FIBER EATEN
          </Text>
          <Text style={[styles.statRemaining, { color: colors.accentDeep }]}>
            {statRemainingText}
          </Text>
          <Text style={[styles.statGoal, { color: colors.inkSoft }]}>
            Goal: {validGoal}g
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    marginHorizontal: 16,
    ...SHADOWS.card,
  },
  headline: {
    fontFamily: 'Georgia',
    fontWeight: '700',
    fontSize: 21,
    letterSpacing: -0.3,
  },
  subtext: {
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontSize: 13.5,
    marginTop: 4,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 18,
  },
  ringWrap: {
    width: 136,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringNum: {
    fontFamily: 'Georgia',
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 32,
  },
  ringLabel: {
    fontSize: 9.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
    fontWeight: '600',
  },
  ringPct: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  ringStats: {
    flex: 1,
  },
  statBig: {
    fontFamily: 'Georgia',
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 2,
    fontWeight: '700',
  },
  statRemaining: {
    marginTop: 12,
    fontWeight: '700',
    fontSize: 14,
  },
  statGoal: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '500',
  },
});
