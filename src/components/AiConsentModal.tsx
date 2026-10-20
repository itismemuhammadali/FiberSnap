import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { RADIUS, SHADOWS } from '../constants/theme';

interface AiConsentModalProps {
  visible: boolean;
  onAgree: () => void;
  onDecline: () => void;
}

export const AiConsentModal: React.FC<AiConsentModalProps> = ({
  visible,
  onAgree,
  onDecline,
}) => {
  const { colors } = useApp();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="sparkles" size={28} color={colors.accentDeep} />
          </View>

          <Text style={[styles.title, { color: colors.ink }]}>AI Meal Scanning Consent</Text>
          <Text style={[styles.versionTag, { color: colors.inkFaint }]}>Apple App Store & Privacy Compliance</Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
              FiberSnap uses advanced Google Gemini AI vision models to detect foods and estimate fiber content from your photos.
            </Text>

            <View style={[styles.infoBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <View style={styles.bulletRow}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.accentDeep} style={{ marginTop: 2 }} />
                <Text style={[styles.bulletText, { color: colors.ink }]}>
                  <Text style={{ fontWeight: '700' }}>Nutritional Analysis Only: </Text>
                  Photos are sent securely solely to recognize ingredients and estimate soluble/insoluble fiber.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.accentDeep} style={{ marginTop: 2 }} />
                <Text style={[styles.bulletText, { color: colors.ink }]}>
                  <Text style={{ fontWeight: '700' }}>Your Privacy: </Text>
                  Your meal photos are not sold to third parties or used for external advertising.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Ionicons name="toggle-outline" size={18} color={colors.accentDeep} style={{ marginTop: 2 }} />
                <Text style={[styles.bulletText, { color: colors.ink }]}>
                  <Text style={{ fontWeight: '700' }}>Full Control: </Text>
                  You can enable or disable AI scanning at any time from your Profile settings in the Me tab.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.agreeBtn, { backgroundColor: colors.accent }]}
            onPress={onAgree}
            activeOpacity={0.88}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.accentInk} />
            <Text style={[styles.agreeBtnText, { color: colors.accentInk }]}>
              I Agree & Enable AI Scan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.declineBtn, { borderColor: colors.border }]}
            onPress={onDecline}
            activeOpacity={0.7}
          >
            <Text style={[styles.declineBtnText, { color: colors.inkSoft }]}>
              Maybe Later
            </Text>
          </TouchableOpacity>
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
    maxHeight: '82%',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  versionTag: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollArea: {
    width: '100%',
    maxHeight: 220,
    marginBottom: 18,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 14,
  },
  infoBox: {
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  agreeBtn: {
    width: '100%',
    height: 50,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
    ...SHADOWS.card,
  },
  agreeBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  declineBtn: {
    width: '100%',
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
