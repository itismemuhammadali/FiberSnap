import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#2C6B39', // Forest brand green
  '#6FA45B', // Pea brand green
  '#F59E0B', // Bright gold / amber
  '#10B981', // Vivid emerald
  '#F43F5E', // Coral pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EAB308', // Yellow
  '#3B82F6', // Royal blue
  '#EC4899', // Hot pink
];

interface ParticleConfig {
  id: number;
  startX: number;
  startY: number;
  peakX: number;
  peakY: number;
  destX: number;
  destY: number;
  color: string;
  width: number;
  height: number;
  isCircle: boolean;
  rotations: number;
  anim: Animated.Value;
  wobbleAnim: Animated.Value;
}

interface ConfettiCelebrationProps {
  visible: boolean;
  goalGrams?: number;
  onDismiss: () => void;
}

const PARTICLE_COUNT = 65;

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  visible,
  onDismiss,
}) => {
  // Generate cannon particles shooting upwards from bottom corners
  const particles = useRef<ParticleConfig[]>(
    Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const fromLeft = i % 2 === 0;
      const startX = fromLeft
        ? SCREEN_WIDTH * 0.1 + (Math.random() - 0.5) * 40
        : SCREEN_WIDTH * 0.9 + (Math.random() - 0.5) * 40;
      const startY = SCREEN_HEIGHT + 10;

      // Peak target near the upper half of screen
      const peakX = fromLeft
        ? SCREEN_WIDTH * 0.2 + Math.random() * (SCREEN_WIDTH * 0.7)
        : SCREEN_WIDTH * 0.1 + Math.random() * (SCREEN_WIDTH * 0.7);
      const peakY = SCREEN_HEIGHT * 0.08 + Math.random() * (SCREEN_HEIGHT * 0.28);

      // Final fall landing spread
      const destX = Math.max(10, Math.min(SCREEN_WIDTH - 10, peakX + (Math.random() - 0.5) * 120));
      const destY = SCREEN_HEIGHT + 30;

      const isRibbon = Math.random() > 0.6;
      const width = isRibbon ? Math.random() * 4 + 5 : Math.random() * 5 + 7;
      const height = isRibbon ? Math.random() * 10 + 12 : Math.random() * 6 + 7;

      return {
        id: i,
        startX,
        startY,
        peakX,
        peakY,
        destX,
        destY,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        width,
        height,
        isCircle: !isRibbon && Math.random() > 0.5,
        rotations: (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 3),
        anim: new Animated.Value(0),
        wobbleAnim: new Animated.Value(0),
      };
    })
  ).current;

  useEffect(() => {
    if (!visible) return;

    // Trigger subtle native success haptics
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // safe fallback
    }

    // Reset animations
    particles.forEach((p) => {
      p.anim.setValue(0);
      p.wobbleAnim.setValue(0);
    });

    // Launch all confetti particles with staggered initial bursts
    const anims = particles.map((p, idx) => {
      const delay = (idx % 12) * 35;
      const duration = 2600 + Math.random() * 900;

      return Animated.parallel([
        Animated.timing(p.anim, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.bezier(0.2, 0.7, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(p.wobbleAnim, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(10, anims).start();

    // Auto-dismiss after animation concludes
    const timer = setTimeout(() => {
      onDismiss();
    }, 3800);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => {
        // Trajectory: 0 -> 0.28 (shoots up to peak), 0.28 -> 1 (floats down to dest)
        const translateY = p.anim.interpolate({
          inputRange: [0, 0.28, 1],
          outputRange: [p.startY, p.peakY, p.destY],
        });

        const translateX = p.anim.interpolate({
          inputRange: [0, 0.28, 0.6, 1],
          outputRange: [
            p.startX,
            p.peakX,
            p.peakX + (p.destX - p.peakX) * 0.5,
            p.destX,
          ],
        });

        // 3D rotation and tumbling
        const rotate = p.wobbleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.rotations * 360}deg`],
        });

        const rotateY = p.wobbleAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ['0deg', '180deg', '360deg'],
        });

        const opacity = p.anim.interpolate({
          inputRange: [0, 0.1, 0.85, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                width: p.width,
                height: p.height,
                backgroundColor: p.color,
                borderRadius: p.isCircle ? p.width / 2 : 2,
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { rotate },
                  { rotateY },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
