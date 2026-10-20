import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodEntry } from '../types';
import { useApp } from '../context/AppContext';

interface FoodRowProps {
  entry: FoodEntry;
  onDelete?: (id: string) => void;
  onEdit?: (entry: FoodEntry) => void;
}

export const FoodRow: React.FC<FoodRowProps> = ({ entry, onDelete, onEdit }) => {
  const { colors } = useApp();
  const [imageError, setImageError] = useState(false);

  const timeFormatted = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Pick an emoji or icon based on food type
  const getAvatarEmoji = () => {
    const n = entry.name.toLowerCase();
    if (n.includes('oat') || n.includes('cereal') || n.includes('bowl')) return '🥣';
    if (n.includes('bean') || n.includes('lentil') || n.includes('chickpea')) return '🫘';
    if (n.includes('apple') || n.includes('berry') || n.includes('fruit') || n.includes('banana')) return '🍎';
    if (n.includes('salad') || n.includes('broccoli') || n.includes('spinach') || n.includes('kale')) return '🥗';
    if (n.includes('bread') || n.includes('toast') || n.includes('wheat') || n.includes('grain')) return '🍞';
    if (n.includes('chia') || n.includes('seed') || n.includes('nut') || n.includes('almond')) return '🥜';
    if (n.includes('avocado')) return '🥑';
    return '🌱';
  };

  return (
    <View style={[styles.row, { borderTopColor: colors.border }]}>
      {/* Avatar: Real Meal Photo Thumbnail or Fallback Emoji */}
      <TouchableOpacity
        activeOpacity={onEdit ? 0.8 : 1}
        onPress={() => onEdit && onEdit(entry)}
        style={[
          styles.avatar,
          {
            backgroundColor: colors.accentSoft,
            borderColor: colors.border,
            borderWidth: entry.imageUri && !imageError ? 1 : 0,
          },
        ]}
      >
        {entry.imageUri && !imageError ? (
          <Image
            source={{ uri: entry.imageUri }}
            style={styles.avatarImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Text style={styles.avatarEmoji}>{getAvatarEmoji()}</Text>
        )}
      </TouchableOpacity>

      {/* Main Info (Tap to edit) */}
      <TouchableOpacity
        style={styles.mainInfo}
        onPress={() => onEdit && onEdit(entry)}
        activeOpacity={onEdit ? 0.7 : 1}
      >
        <Text style={[styles.name, { color: colors.ink }]} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={[styles.sub, { color: colors.inkSoft }]} numberOfLines={1}>
          {entry.portion || '1 serving'} •{' '}
          {entry.tag === 'soluble' ? 'Soluble' : entry.tag === 'insoluble' ? 'Insoluble' : 'Balanced'}
        </Text>
      </TouchableOpacity>

      {/* Side Grams & Time */}
      <View style={styles.sideInfo}>
        <Text style={[styles.grams, { color: colors.accentDeep }]}>
          {entry.totalGrams.toFixed(1).replace(/\.0$/, '')}g
        </Text>
        <Text style={[styles.time, { color: colors.inkFaint }]}>{timeFormatted}</Text>
      </View>

      {/* Action Buttons: Edit Pencil & Delete Close */}
      <View style={styles.actionBtnsRow}>
        {onEdit && (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surface2 }]}
            onPress={() => onEdit(entry)}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityLabel="Edit meal details"
          >
            <Ionicons name="pencil" size={12} color={colors.accentDeep} />
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border }]}
            onPress={() => onDelete(entry.id)}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityLabel="Delete meal entry"
          >
            <Ionicons name="close" size={14} color={colors.inkFaint} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  mainInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  sub: {
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 2,
  },
  sideInfo: {
    alignItems: 'flex-end',
  },
  grams: {
    fontFamily: 'Georgia',
    fontSize: 15,
    fontWeight: '700',
  },
  time: {
    fontSize: 10.5,
    marginTop: 2,
  },
  actionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 2,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
