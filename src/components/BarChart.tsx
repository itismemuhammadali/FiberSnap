import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { DaySummary, MonthSummary } from '../types';
import { RADIUS, SHADOWS } from '../constants/theme';

export type ChartPeriod = '1d' | '7d' | '30d' | '1y';

interface BarChartProps {
  period: ChartPeriod;
  dayData7: DaySummary[];
  dayData30: DaySummary[];
  monthDataYear: MonthSummary[];
  goalGrams: number;
  todaySoluble: number;
  todayInsoluble: number;
  todayTotal: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  period,
  dayData7,
  dayData30,
  monthDataYear,
  goalGrams,
  todaySoluble,
  todayInsoluble,
  todayTotal,
}) => {
  const { colors } = useApp();
  const [selectedItem, setSelectedItem] = useState<{ label: string; value: number } | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const cardPadding = 20;
  const containerPadding = 16;
  const chartWidth = Math.max(260, screenWidth - (containerPadding * 2 + cardPadding * 2));
  const chartHeight = 176;

  const padL = 16;
  const padR = 36;
  const padT = 24;
  const padB = 26;

  const plotW = chartWidth - padL - padR;
  const plotH = chartHeight - padT - padB;

  // Day of week labels for 7D
  const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Helper to build chart bars & config depending on period
  let title = 'Last 7 days';
  let chartContent: React.ReactNode = null;

  if (period === '1d') {
    title = "Today's breakdown";
    const maxVal = Math.max(goalGrams, todayTotal, 1);
    const goalY = padT + plotH - (goalGrams / maxVal) * plotH;

    const items = [
      { label: 'Soluble', value: todaySoluble, color: colors.soluble },
      { label: 'Insoluble', value: todayInsoluble, color: colors.insoluble },
      { label: 'Total', value: todayTotal, color: colors.accentDeep },
    ];

    const gap = plotW / items.length;
    const barW = Math.min(32, gap * 0.45);

    chartContent = (
      <Svg width={chartWidth} height={chartHeight}>
        {/* Dashed Goal Benchmark Line */}
        <Line
          x1={padL}
          y1={goalY}
          x2={chartWidth - padR}
          y2={goalY}
          stroke={colors.inkFaint}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity={0.7}
        />
        <SvgText
          x={chartWidth - padR + 6}
          y={goalY + 3}
          fill={colors.inkFaint}
          fontSize="10"
          fontFamily="sans-serif"
          textAnchor="start"
        >
          goal
        </SvgText>

        {items.map((item, idx) => {
          const barH = Math.max(3, (item.value / maxVal) * plotH);
          const x = padL + gap * idx + (gap - barW) / 2;
          const y = padT + plotH - barH;
          const isSelected = selectedItem?.label === item.label;

          return (
            <G
              key={item.label}
              onPress={() =>
                setSelectedItem(isSelected ? null : { label: item.label, value: item.value })
              }
            >
              <Rect
                x={padL + gap * idx}
                y={padT}
                width={gap}
                height={plotH}
                fill="transparent"
              />
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill={isSelected ? colors.warning : item.color}
              />
              <SvgText
                x={x + barW / 2}
                y={chartHeight - 8}
                fill={colors.inkFaint}
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  } else if (period === '7d') {
    title = 'Last 7 days';
    const maxVal = Math.max(goalGrams, 1, ...dayData7.map((d) => d.totalGrams));
    const goalY = padT + plotH - (goalGrams / maxVal) * plotH;
    const gap = plotW / 7;
    const barW = Math.max(8, gap * 0.45);

    chartContent = (
      <Svg width={chartWidth} height={chartHeight}>
        <Line
          x1={padL}
          y1={goalY}
          x2={chartWidth - padR}
          y2={goalY}
          stroke={colors.inkFaint}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity={0.7}
        />
        <SvgText
          x={chartWidth - padR + 6}
          y={goalY + 3}
          fill={colors.inkFaint}
          fontSize="10"
          fontFamily="sans-serif"
          textAnchor="start"
        >
          goal
        </SvgText>

        {dayData7.map((item, idx) => {
          const barH = Math.max(3, (item.totalGrams / maxVal) * plotH);
          const x = padL + gap * idx + (gap - barW) / 2;
          const y = padT + plotH - barH;
          const isToday = idx === dayData7.length - 1;
          const isSelected = selectedItem?.label === item.dateStr;

          const dateObj = new Date(item.dateStr + 'T00:00:00');
          const dayLetter = DOW[dateObj.getDay()];

          return (
            <G
              key={item.dateStr}
              onPress={() =>
                setSelectedItem(isSelected ? null : { label: item.dateStr, value: item.totalGrams })
              }
            >
              <Rect
                x={padL + gap * idx}
                y={padT}
                width={gap}
                height={plotH}
                fill="transparent"
              />
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill={
                  isSelected
                    ? colors.warning
                    : isToday
                    ? colors.accentDeep
                    : colors.accent
                }
              />
              <SvgText
                x={x + barW / 2}
                y={chartHeight - 8}
                fill={colors.inkFaint}
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {dayLetter}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  } else if (period === '30d') {
    title = 'Last 30 days';
    const maxVal = Math.max(goalGrams, 1, ...dayData30.map((d) => d.totalGrams));
    const goalY = padT + plotH - (goalGrams / maxVal) * plotH;
    const gap = plotW / 30;
    const barW = Math.max(4.5, gap * 0.65);

    chartContent = (
      <Svg width={chartWidth} height={chartHeight}>
        <Line
          x1={padL}
          y1={goalY}
          x2={chartWidth - padR}
          y2={goalY}
          stroke={colors.inkFaint}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity={0.7}
        />
        <SvgText
          x={chartWidth - padR + 6}
          y={goalY + 3}
          fill={colors.inkFaint}
          fontSize="10"
          fontFamily="sans-serif"
          textAnchor="start"
        >
          goal
        </SvgText>

        {dayData30.map((item, idx) => {
          const barH = Math.max(2.5, (item.totalGrams / maxVal) * plotH);
          const x = padL + gap * idx + (gap - barW) / 2;
          const y = padT + plotH - barH;
          const isToday = idx === dayData30.length - 1;
          const isSelected = selectedItem?.label === item.dateStr;

          const dateObj = new Date(item.dateStr + 'T00:00:00');
          const dayNum = dateObj.getDate();
          const showLabel = idx === 0 || idx === 14 || idx === 29;

          return (
            <G
              key={item.dateStr}
              onPress={() =>
                setSelectedItem(isSelected ? null : { label: item.dateStr, value: item.totalGrams })
              }
            >
              <Rect
                x={padL + gap * idx}
                y={padT}
                width={gap}
                height={plotH}
                fill="transparent"
              />
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={2}
                fill={
                  isSelected
                    ? colors.warning
                    : isToday
                    ? colors.accentDeep
                    : colors.accent
                }
              />
              {showLabel && (
                <SvgText
                  x={x + barW / 2}
                  y={chartHeight - 8}
                  fill={colors.inkFaint}
                  fontSize="9.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {dayNum}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    );
  } else if (period === '1y') {
    title = 'Last 12 months';
    const maxVal = Math.max(goalGrams, 1, ...monthDataYear.map((m) => m.avgGrams));
    const goalY = padT + plotH - (goalGrams / maxVal) * plotH;
    const gap = plotW / 12;
    const barW = Math.max(10, gap * 0.55);

    chartContent = (
      <Svg width={chartWidth} height={chartHeight}>
        <Line
          x1={padL}
          y1={goalY}
          x2={chartWidth - padR}
          y2={goalY}
          stroke={colors.inkFaint}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity={0.7}
        />
        <SvgText
          x={chartWidth - padR + 6}
          y={goalY + 3}
          fill={colors.inkFaint}
          fontSize="10"
          fontFamily="sans-serif"
          textAnchor="start"
        >
          goal
        </SvgText>

        {monthDataYear.map((item, idx) => {
          const barH = Math.max(3, (item.avgGrams / maxVal) * plotH);
          const x = padL + gap * idx + (gap - barW) / 2;
          const y = padT + plotH - barH;
          const isCurrentMonth = idx === monthDataYear.length - 1;
          const isSelected = selectedItem?.label === item.monthStr;

          return (
            <G
              key={item.monthStr}
              onPress={() =>
                setSelectedItem(isSelected ? null : { label: item.monthStr, value: item.avgGrams })
              }
            >
              <Rect
                x={padL + gap * idx}
                y={padT}
                width={gap}
                height={plotH}
                fill="transparent"
              />
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={3.5}
                fill={
                  isSelected
                    ? colors.warning
                    : isCurrentMonth
                    ? colors.accentDeep
                    : colors.accent
                }
              />
              <SvgText
                x={x + barW / 2}
                y={chartHeight - 8}
                fill={colors.inkFaint}
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.ink }]}>{title}</Text>

      {/* Interactive Tooltip if tapped */}
      {selectedItem && (
        <View style={[styles.tooltipPill, { backgroundColor: colors.surface2 }]}>
          <Text style={[styles.tooltipText, { color: colors.ink }]}>
            {selectedItem.label}:{' '}
            <Text style={{ fontWeight: '700', color: colors.accentDeep }}>
              {selectedItem.value.toFixed(1).replace(/\.0$/, '')}g
            </Text>
          </Text>
        </View>
      )}

      {/* SVG Chart */}
      <View style={styles.chartContainer}>{chartContent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  cardTitle: {
    fontFamily: 'Georgia',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  tooltipPill: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginBottom: 4,
  },
  tooltipText: {
    fontSize: 12,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
