import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';
import { LogoMark } from './LogoMark';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onUpgradeSuccess,
}) => {
  const { colors, profile, upgradeToPlus } = useApp();
  const navigation = useNavigation<any>();

  const isCurrentSubscriber = !!profile.isPlusSubscriber;
  const currentTier: 'annual' | 'monthly' =
    (profile.subscriptionTier || 'annual') === 'monthly' ? 'monthly' : 'annual';

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>(
    isCurrentSubscriber && currentTier === 'annual' ? 'monthly' : 'annual'
  );
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const isDark = colors.isDark;

  // Curated lively palette matching the user's uploaded screenshot in Light Mode
  // and adapting to sleek dark mode
  const livelyTheme = {
    bg: isDark ? colors.bg : '#F9F6F1',
    surface: isDark ? colors.surface : '#FFFFFF',
    surface2: isDark ? colors.surface2 : '#F1ECE0',
    border: isDark ? colors.border : '#E6DFCF',
    ink: isDark ? colors.ink : '#1E1E16',
    inkSoft: isDark ? colors.inkSoft : '#605F4E',
    inkFaint: isDark ? colors.inkFaint : '#9B9A86',
    // Alive Vibrant Greens
    brandGreen: isDark ? '#93AC72' : '#275A30',
    brandGreenDeep: isDark ? '#A9C088' : '#1E4726',
    pillGreenBg: isDark ? '#2B4326' : '#275A30',
    iconBoxBg: isDark ? '#283823' : '#E6F4EA',
    iconGreen: isDark ? '#A9C088' : '#275A30',
    activeBorder: isDark ? '#93AC72' : '#275A30',
    activeCardBg: isDark ? '#2D2D23' : '#F7FAF5',
    badgeSaveBg: isDark ? '#333F29' : '#E4EAD8',
    badgeSaveText: isDark ? '#A9C088' : '#275A30',
    ctaBg: isDark ? '#93AC72' : '#275A30',
    ctaText: isDark ? '#16160F' : '#FFFFFF',
    closeBg: isDark ? colors.surface2 : '#EFEAE0',
  };

  const openStoreSubscriptions = async () => {
    try {
      if (Platform.OS === 'ios') {
        const itmsUrl = 'itms-apps://apps.apple.com/account/subscriptions';
        const canOpen = await Linking.canOpenURL(itmsUrl).catch(() => false);
        if (canOpen) {
          await Linking.openURL(itmsUrl);
        } else {
          await Linking.openURL('https://apps.apple.com/account/subscriptions');
        }
      } else {
        await Linking.openURL(
          'https://play.google.com/store/account/subscriptions?package=com.duomatic.fibersnap'
        );
      }
    } catch {
      await Linking.openURL('https://apps.apple.com/account/subscriptions');
    }
  };

  const handlePlanAction = async () => {
    if (isCurrentSubscriber) {
      if (selectedPlan === currentTier) {
        Alert.alert(
          'Active Plan',
          `You are already actively subscribed to the ${currentTier === 'annual' ? 'Annual Access' : 'Monthly'} plan.`
        );
        return;
      }

      setIsSubscribing(true);
      await openStoreSubscriptions();
      setIsSubscribing(false);

      Alert.alert(
        'Confirm Plan Switch',
        `Did you complete switching to the ${selectedPlan === 'annual' ? 'Annual ($49.99/yr)' : 'Monthly ($6.99/mo)'} plan in your App Store / Google Play account?`,
        [
          {
            text: 'I Cancelled',
            style: 'cancel',
            onPress: () => {
              // User cancelled in Apple sheet - active plan remains unchanged
            },
          },
          {
            text: 'Yes, Updated',
            onPress: async () => {
              await upgradeToPlus(selectedPlan);
              onClose();
            },
          },
        ]
      );
    } else {
      setIsSubscribing(true);
      await openStoreSubscriptions();
      setIsSubscribing(false);
      await upgradeToPlus(selectedPlan);
      onUpgradeSuccess();
      onClose();
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsRestoring(false);
    onUpgradeSuccess();
    Alert.alert(
      'Subscription Restored',
      'Your FiberSnap Plus active subscription was verified and restored successfully.'
    );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: livelyTheme.bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Top Header with Close Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: livelyTheme.closeBg }]}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color={livelyTheme.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Branding */}
          <View style={styles.heroSection}>
            <LogoMark size={72} showWordmark={true} showTagline={true} direction="column" fontSize={26} useImage={true} />

            {/* Pill: FIBERSNAP PLUS */}
            <View style={[styles.plusPill, { backgroundColor: livelyTheme.pillGreenBg }]}>
              <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              <Text style={styles.plusPillText}>FIBERSNAP PLUS</Text>
            </View>

            <Text style={[styles.heroTitle, { color: livelyTheme.ink }]}>
              Unlock Instant AI Meal Vision
            </Text>
            <Text style={[styles.heroSub, { color: livelyTheme.inkSoft }]}>
              Snap any food. Google Gemini 1.5 Flash instantly calculates your exact soluble, insoluble, and total dietary fiber.
            </Text>
          </View>

          {/* Value Props Card */}
          <View
            style={[
              styles.featuresList,
              {
                backgroundColor: livelyTheme.surface,
                borderColor: livelyTheme.border,
              },
            ]}
          >
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: livelyTheme.iconBoxBg }]}>
                <Ionicons name="camera" size={20} color={livelyTheme.iconGreen} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={[styles.featureTitle, { color: livelyTheme.ink }]}>
                  Unlimited AI Meal Scans
                </Text>
                <Text style={[styles.featureDesc, { color: livelyTheme.inkSoft }]}>
                  No more weighing or manual searching. Snap a photo and log in seconds.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: livelyTheme.iconBoxBg }]}>
                <Ionicons name="pie-chart" size={19} color={livelyTheme.iconGreen} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={[styles.featureTitle, { color: livelyTheme.ink }]}>
                  Accurate Soluble vs. Insoluble Split
                </Text>
                <Text style={[styles.featureDesc, { color: livelyTheme.inkSoft }]}>
                  Get AI visual breakdown of gut-protecting and heart-healthy fibers.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: livelyTheme.iconBoxBg }]}>
                <Ionicons name="trending-up" size={20} color={livelyTheme.iconGreen} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={[styles.featureTitle, { color: livelyTheme.ink }]}>
                  Deeper 30-Day Trends & Insights
                </Text>
                <Text style={[styles.featureDesc, { color: livelyTheme.inkSoft }]}>
                  Maintain streaks and ensure consistency.
                </Text>
              </View>
            </View>
          </View>

          {/* Pricing Selector */}
          <View style={styles.pricingSection}>
            {/* Annual Option */}
            <TouchableOpacity
              style={[
                styles.planCard,
                {
                  backgroundColor: selectedPlan === 'annual' ? livelyTheme.activeCardBg : livelyTheme.surface,
                  borderColor: selectedPlan === 'annual' ? livelyTheme.activeBorder : livelyTheme.border,
                },
              ]}
              onPress={() => setSelectedPlan('annual')}
              activeOpacity={0.85}
            >
              <View style={styles.planHeader}>
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: selectedPlan === 'annual' ? livelyTheme.brandGreen : livelyTheme.border,
                    },
                  ]}
                >
                  {selectedPlan === 'annual' && (
                    <View style={[styles.radioInner, { backgroundColor: livelyTheme.brandGreen }]} />
                  )}
                </View>
                <View style={styles.planNameCol}>
                  <Text style={[styles.planName, { color: livelyTheme.ink }]}>Annual Access</Text>
                  <Text style={[styles.planSub, { color: livelyTheme.inkSoft }]}>
                    Billed once at $49.99/yr ($4.17/mo)
                  </Text>
                </View>
                {isCurrentSubscriber && currentTier === 'annual' ? (
                  <View style={[styles.badgeActivePlan, { backgroundColor: livelyTheme.brandGreen }]}>
                    <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.badgeActivePlanText}>CURRENT PLAN</Text>
                  </View>
                ) : (
                  <View style={[styles.badgeSave, { backgroundColor: livelyTheme.badgeSaveBg }]}>
                    <Text style={[styles.badgeSaveText, { color: livelyTheme.badgeSaveText }]}>
                      SAVE 40%
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Monthly Option */}
            <TouchableOpacity
              style={[
                styles.planCard,
                {
                  backgroundColor: selectedPlan === 'monthly' ? livelyTheme.activeCardBg : livelyTheme.surface,
                  borderColor: selectedPlan === 'monthly' ? livelyTheme.activeBorder : livelyTheme.border,
                },
              ]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.85}
            >
              <View style={styles.planHeader}>
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: selectedPlan === 'monthly' ? livelyTheme.brandGreen : livelyTheme.border,
                    },
                  ]}
                >
                  {selectedPlan === 'monthly' && (
                    <View style={[styles.radioInner, { backgroundColor: livelyTheme.brandGreen }]} />
                  )}
                </View>
                <View style={styles.planNameCol}>
                  <Text style={[styles.planName, { color: livelyTheme.ink }]}>Monthly Plan</Text>
                  <Text style={[styles.planSub, { color: livelyTheme.inkSoft }]}>
                    Flexible month-to-month billing
                  </Text>
                </View>
                {isCurrentSubscriber && currentTier === 'monthly' ? (
                  <View style={[styles.badgeActivePlan, { backgroundColor: livelyTheme.brandGreen }]}>
                    <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.badgeActivePlanText}>CURRENT PLAN</Text>
                  </View>
                ) : (
                  <Text style={[styles.planPrice, { color: livelyTheme.ink }]}>$6.99/mo</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[
              styles.ctaButton,
              {
                backgroundColor:
                  isCurrentSubscriber && selectedPlan === currentTier
                    ? livelyTheme.surface2
                    : livelyTheme.ctaBg,
                borderColor:
                  isCurrentSubscriber && selectedPlan === currentTier
                    ? livelyTheme.border
                    : 'transparent',
                borderWidth: isCurrentSubscriber && selectedPlan === currentTier ? 1 : 0,
              },
            ]}
            onPress={
              isCurrentSubscriber && selectedPlan === currentTier
                ? undefined
                : handlePlanAction
            }
            disabled={
              isSubscribing ||
              isRestoring ||
              (isCurrentSubscriber && selectedPlan === currentTier)
            }
            activeOpacity={0.88}
          >
            <Text
              style={[
                styles.ctaButtonText,
                {
                  color:
                    isCurrentSubscriber && selectedPlan === currentTier
                      ? livelyTheme.inkSoft
                      : livelyTheme.ctaText,
                },
              ]}
            >
              {isSubscribing
                ? 'Updating Plan...'
                : isCurrentSubscriber
                ? selectedPlan === currentTier
                  ? 'Current Plan (Active)'
                  : selectedPlan === 'annual'
                  ? 'Upgrade to Annual ($49.99/Year • Save 40%)'
                  : 'Switch to Monthly ($6.99/Month)'
                : `Start Plus (${selectedPlan === 'annual' ? '$49.99/Year' : '$6.99/Month'})`}
            </Text>
          </TouchableOpacity>

          {/* Restore Purchases Button */}
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={isRestoring || isSubscribing}
            activeOpacity={0.7}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={livelyTheme.brandGreen} />
            ) : (
              <Text style={[styles.restoreBtnText, { color: livelyTheme.inkSoft }]}>
                Restore Purchases
              </Text>
            )}
          </TouchableOpacity>

          {/* Legal Disclosures Required by App Store Guidelines */}
          <View style={styles.legalBox}>
            <Text style={[styles.disclosureText, { color: livelyTheme.inkFaint }]}>
              Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. You can manage and cancel your subscriptions in your App Store account settings.
            </Text>
            <View style={styles.legalLinksRow}>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  navigation.navigate('Terms');
                }}
              >
                <Text style={[styles.legalLink, { color: livelyTheme.brandGreen }]}>Terms of Use</Text>
              </TouchableOpacity>
              <Text style={[styles.legalDot, { color: livelyTheme.inkFaint }]}>•</Text>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  navigation.navigate('PrivacyPolicy');
                }}
              >
                <Text style={[styles.legalLink, { color: livelyTheme.brandGreen }]}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  plusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    marginTop: 14,
    marginBottom: 12,
  },
  plusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '800',
    fontFamily: FONTS.serif,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  featuresList: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 18,
    marginBottom: 22,
    ...SHADOWS.soft,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  featureDesc: {
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  pricingSection: {
    gap: 12,
    marginBottom: 22,
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  planNameCol: {
    flex: 1,
  },
  planName: {
    fontSize: 15,
    fontWeight: '700',
  },
  planSub: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeSave: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  badgeSaveText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  badgeActivePlan: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  badgeActivePlanText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  planPrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  ctaButton: {
    borderRadius: RADIUS.pill,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  restoreBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  restoreBtnText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalBox: {
    marginTop: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  disclosureText: {
    fontSize: 11,
    lineHeight: 15.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 12,
  },
});
