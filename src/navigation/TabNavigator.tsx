import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { TodayScreen } from '../screens/TodayScreen';
import { GoalScreen } from '../screens/GoalScreen';
import { SourcesScreen } from '../screens/SourcesScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { MeScreen } from '../screens/MeScreen';
import { useApp } from '../context/AppContext';

const Tab = createBottomTabNavigator();

// Prototype SVG Icons matching fibersnap.html
const TodayIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.8" />
    <Circle cx="12" cy="12" r="2.6" fill={color} />
  </Svg>
);

const GoalIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M5 21V3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path
      d="M5 4h12l-2.6 3.2L17 10.4H5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SourcesIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.5c-4.2 1.8-7 5.6-7 9.8a7 7 0 0 0 14 0c0-4.2-2.8-8-7-9.8z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M12 21V10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const ProgressIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="12" width="3.4" height="8" rx="0.5" stroke={color} strokeWidth="1.8" />
    <Rect x="10.3" y="7" width="3.4" height="13" rx="0.5" stroke={color} strokeWidth="1.8" />
    <Rect x="16.6" y="3" width="3.4" height="17" rx="0.5" stroke={color} strokeWidth="1.8" />
  </Svg>
);

const MeIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8.2" r="3.3" stroke={color} strokeWidth="1.8" />
    <Path
      d="M5.3 20c1.2-3.8 4-5.7 6.7-5.7s5.5 1.9 6.7 5.7"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Svg>
);

export const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useApp();

  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 8 : 14);
  const tabHeight = 58 + bottomInset;

  return (
    <Tab.Navigator
      initialRouteName="Today"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomInset + 2,
          paddingTop: 4,
          paddingHorizontal: 6,
        },
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Today') return <TodayIcon color={color} />;
          if (route.name === 'Goal') return <GoalIcon color={color} />;
          if (route.name === 'Sources') return <SourcesIcon color={color} />;
          if (route.name === 'Progress') return <ProgressIcon color={color} />;
          if (route.name === 'Me') return <MeIcon color={color} />;
          return null;
        },
        tabBarButton: (props: BottomTabBarButtonProps) => {
          const focused = props.accessibilityState?.selected;
          return (
            <TouchableOpacity
              {...(props as any)}
              activeOpacity={0.8}
              style={[
                props.style,
                styles.tabButton,
                focused && [
                  styles.tabButtonActive,
                  { borderColor: colors.accent, backgroundColor: 'transparent' },
                ],
              ]}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Goal" component={GoalScreen} />
      <Tab.Screen name="Sources" component={SourcesScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Me" component={MeScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarItem: {
    paddingVertical: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginHorizontal: 2,
  },
  tabButtonActive: {
    borderWidth: 1.5,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
