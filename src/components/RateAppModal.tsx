import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { RADIUS, SHADOWS } from '../constants/theme';

interface RateAppModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RateAppModal: React.FC<RateAppModalProps> = ({ visible, onClose }) => {
  const { colors } = useApp();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating >= 4) {
      // Direct happy users to App Store / Play Store
      const storeUrl =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com'
          : 'https://play.google.com/store';
      Linking.openURL(storeUrl).catch(() => {});
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
      onClose();
    }, 1800);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {submitted ? (
            <View style={styles.submittedBox}>
              <View style={[styles.checkCircle, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="checkmark" size={32} color={colors.accentDeep} />
              </View>
              <Text style={[styles.title, { color: colors.ink }]}>Thank You!</Text>
              <Text style={[styles.subText, { color: colors.inkSoft }]}>
                Your feedback helps us make FiberSnap even better.
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.starIconWrap, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="star" size={28} color={colors.accentDeep} />
              </View>

              <Text style={[styles.title, { color: colors.ink }]}>Enjoying FiberSnap?</Text>
              <Text style={[styles.subText, { color: colors.inkSoft }]}>
                Tap a star to rate your experience tracking fiber and gut health.
              </Text>

              {/* Star Rating Row */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                    style={styles.starBtn}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={34}
                      color={star <= rating ? '#F5A623' : colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Optional Feedback Input */}
              {rating < 4 && (
                <View style={styles.inputWrap}>
                  <TextInput
                    style={[
                      styles.feedbackInput,
                      { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink },
                    ]}
                    placeholder="Tell us how we can improve..."
                    placeholderTextColor={colors.inkFaint}
                    value={feedback}
                    onChangeText={setFeedback}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}

              {/* Buttons */}
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                onPress={handleSubmit}
                activeOpacity={0.88}
              >
                <Text style={[styles.primaryBtnText, { color: colors.accentInk }]}>
                  {rating >= 4 ? 'Rate on App Store' : 'Submit Feedback'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.laterBtn}>
                <Text style={[styles.laterBtnText, { color: colors.inkSoft }]}>Maybe Later</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  starIconWrap: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  starBtn: {
    padding: 4,
  },
  inputWrap: {
    width: '100%',
    marginBottom: 16,
  },
  feedbackInput: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 64,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...SHADOWS.card,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  laterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  laterBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submittedBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
});
