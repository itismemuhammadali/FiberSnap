import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { RADIUS, SHADOWS } from '../constants/theme';

interface ManageSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSwitchPlan?: () => void;
}

export const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  visible,
  onClose,
  onSwitchPlan,
}) => {
  const { colors, profile } = useApp();
  const isAnnual = (profile.subscriptionTier || 'annual') !== 'monthly';

  const handleOpenStoreSubscriptions = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Direct Apple App Store subscriptions management link
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else {
        // Direct Google Play subscriptions management link
        await Linking.openURL('https://play.google.com/store/account/subscriptions?package=com.duomatic.fibersnap');
      }
    } catch {
      Alert.alert(
        'Manage Subscription',
        Platform.OS === 'ios'
          ? 'To manage or cancel your subscription, please open the Settings app on your iPhone, tap your Apple ID, and select "Subscriptions".'
          : 'To manage or cancel your subscription, please open Google Play Store, tap your profile icon, and select "Payments & subscriptions".'
      );
    }
  };

  const handleConfirmCancelPrompt = () => {
    Alert.alert(
      'Cancel Subscription',
      'You will be redirected to your App Store / Google Play account settings where you can cancel or change your plan with 1 tap.\n\nYour Plus features will remain fully active until the end of your current billing cycle.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Proceed to Cancel',
          style: 'destructive',
          onPress: handleOpenStoreSubscriptions,
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="sparkles" size={18} color={colors.accentDeep} />
              </View>
              <Text style={[styles.title, { color: colors.ink }]}>Manage Subscription</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface2 }]} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={colors.inkSoft} />
            </TouchableOpacity>
          </View>

          {/* Current Active Plan Card */}
          <View style={[styles.planCard, { backgroundColor: colors.surface2, borderColor: colors.accentDeep }]}>
            <View style={styles.planCardHeader}>
              <View>
                <Text style={[styles.planName, { color: colors.ink }]}>
                  {isAnnual ? 'FiberSnap Plus Annual' : 'FiberSnap Plus Monthly'}
                </Text>
                <Text style={[styles.planSubtitle, { color: colors.inkSoft }]}>
                  {isAnnual ? 'Annual Plan • $49.99/year' : 'Monthly Plan • $6.99/month'}
                </Text>
              </View>
              <View style={[styles.activePill, { backgroundColor: colors.accentDeep }]}>
                <Text style={styles.activePillText}>ACTIVE</Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.accentDeep} />
                <Text style={[styles.featureText, { color: colors.inkSoft }]}>Unlimited Gemini AI meal vision scans</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.accentDeep} />
                <Text style={[styles.featureText, { color: colors.inkSoft }]}>30-day & 1-year longitudinal fiber analytics</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.accentDeep} />
                <Text style={[styles.featureText, { color: colors.inkSoft }]}>Automatic Firebase Cloud sync & backup</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Switch / Change Plan */}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                onClose();
                if (onSwitchPlan) onSwitchPlan();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color={colors.ink} />
              <Text style={[styles.actionBtnText, { color: colors.ink }]}>Change Plan (Monthly / Annual)</Text>
            </TouchableOpacity>

            {/* Cancel Subscription */}
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: '#E57373', backgroundColor: 'rgba(239, 83, 80, 0.06)' }]}
              onPress={handleConfirmCancelPrompt}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={18} color="#D32F2F" />
              <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
            </TouchableOpacity>
          </View>

          {/* Policy & Legal Disclosure */}
          <View style={styles.footer}>
            <Text style={[styles.policyText, { color: colors.inkFaint }]}>
              Under US consumer protection & App Store regulations, subscriptions can be cancelled or altered at any time without fee or hassle. If cancelled, your Plus access remains fully active until the end of your billing cycle.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
  },
  planSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuresList: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  actions: {
    gap: 10,
    marginBottom: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#D32F2F',
  },
  footer: {
    paddingTop: 8,
  },
  policyText: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
});
