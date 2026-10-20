import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { LIGHT_THEME, FONTS } from '../constants/theme';

interface LogoMarkProps {
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
  direction?: 'row' | 'column';
  fontSize?: number;
  forceTheme?: 'light' | 'dark';
  useImage?: boolean;
}

export const LogoMark: React.FC<LogoMarkProps> = ({
  size = 48,
  showWordmark = true,
  showTagline = false,
  direction = 'row',
  fontSize = 22,
  forceTheme,
  useImage = false,
}) => {
  let isDark = false;
  try {
    const appContext = useApp();
    isDark = forceTheme ? forceTheme === 'dark' : appContext.colors.isDark;
  } catch {
    isDark = forceTheme === 'dark';
  }

  const width = size;
  const height = size * 0.5;

  // Colors adapting dynamically to theme
  const podFill = isDark ? 'rgba(147, 172, 114, 0.22)' : '#E3F1E0';
  const podStroke = isDark ? '#A9C088' : '#2C6B39';
  const dividerStroke = isDark ? '#A9C088' : '#2C6B39';
  const peaFill = isDark ? '#93AC72' : '#3F8F4F';
  const fiberColor = isDark ? '#EFEDE0' : '#000000';
  const snapColor = isDark ? '#93AC72' : '#2C6B39';
  const taglineColor = isDark ? '#A9A88F' : '#4E4D3E';

  return (
    <View
      style={[
        styles.container,
        direction === 'column' ? styles.columnLayout : styles.rowLayout,
      ]}
    >
      {useImage ? (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.24,
            backgroundColor: isDark ? '#1F3324' : '#EFF8EC',
            borderWidth: 1,
            borderColor: isDark ? '#2D4433' : '#E7E3D6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg
            width={size * 0.65}
            height={size * 0.325}
            viewBox="0 0 120 60"
            aria-label="FiberSnap Snap Pea Pod Logo"
          >
            <Path
              d="M8,30 C8,14 28,5 60,5 C92,5 112,14 112,30 C112,46 92,55 60,55 C28,55 8,46 8,30 Z"
              fill="none"
              stroke={podStroke}
              strokeWidth="4.8"
            />
            {/* Straight vertical dividers */}
            <Path
              d="M48.5,14 L48.5,46"
              fill="none"
              stroke={dividerStroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={0.75}
            />
            <Path
              d="M71.5,14 L71.5,46"
              fill="none"
              stroke={dividerStroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={0.75}
            />
            <Circle cx="37" cy="30" r="9.5" fill={peaFill} />
            <Circle cx="60" cy="30" r="9.5" fill={peaFill} />
            <Circle cx="83" cy="30" r="9.5" fill={peaFill} />
          </Svg>
        </View>
      ) : (
        <Svg width={width} height={height} viewBox="0 0 120 60" aria-label="FiberSnap Snap Pea Pod Logo">
          {/* Pod Outer Hull */}
          <Path
            d="M8,30 C8,14 28,5 60,5 C92,5 112,14 112,30 C112,46 92,55 60,55 C28,55 8,46 8,30 Z"
            fill={podFill}
            stroke={podStroke}
            strokeWidth="3.4"
          />
          {/* Pod Inner Dividers - Straight vertical lines */}
          <Path
            d="M48.5,14 L48.5,46"
            fill="none"
            stroke={dividerStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity={isDark ? 0.75 : 0.65}
          />
          <Path
            d="M71.5,14 L71.5,46"
            fill="none"
            stroke={dividerStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity={isDark ? 0.75 : 0.65}
          />
          {/* 3 Peas */}
          <Circle cx="37" cy="30" r="9.5" fill={peaFill} />
          <Circle cx="60" cy="30" r="9.5" fill={peaFill} />
          <Circle cx="83" cy="30" r="9.5" fill={peaFill} />
        </Svg>
      )}

      {showWordmark && (
        <View style={direction === 'column' ? styles.centerText : styles.textContainer}>
          <Text style={[styles.wordmark, { fontSize }]}>
            <Text style={{ color: fiberColor, fontWeight: '700' }}>Fiber</Text>
            <Text style={{ color: snapColor, fontWeight: '800' }}>Snap</Text>
          </Text>
          {showTagline && (
            <Text style={[styles.tagline, { color: taglineColor }]}>Fiber, in a snap.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  rowLayout: {
    flexDirection: 'row',
    gap: 10,
  },
  columnLayout: {
    flexDirection: 'column',
    gap: 8,
  },
  textContainer: {
    justifyContent: 'center',
  },
  centerText: {
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: FONTS.serif,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: FONTS.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.3,
  },
});
