import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';

export const TermsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 20) + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Terms of Service</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.effectiveDate, { color: colors.inkFaint }]}>
            Last Updated: October 2026 • Official Terms
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            By downloading, accessing, or using FiberSnap, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>2. Medical Disclaimer (Not Medical Advice)</Text>
          <View style={[styles.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accentDeep }]}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.accentDeep} style={{ marginTop: 2 }} />
            <Text style={[styles.alertText, { color: colors.ink }]}>
              FiberSnap is an informational nutrition and wellness tracking tool. It does NOT provide medical advice, diagnosis, or treatment. Always consult with a licensed physician or registered dietitian before making substantial changes to your diet, especially if you have gastrointestinal conditions.
            </Text>
          </View>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>3. User Accounts & Data Ownership</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            You are responsible for safeguarding your login credentials. You maintain 100% ownership of your logged food entries, photos, and health goals. You may export or permanently delete your account and data at any time from the app settings.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>4. Free Tier & Plus Subscriptions (EULA)</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap offers both free access and premium auto-renewing subscription tiers:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 4 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Free Tier:</Text> Includes full USDA FoodData Central manual search & logging, custom food entries, personalized clinical goals, soluble vs. insoluble breakdowns, 7-day trend history, and 1 complimentary AI camera meal scan trial.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 4 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>FiberSnap Plus ($6.99/month or $49.99/year with 7-Day Free Trial):</Text> Unlocks unlimited Gemini AI camera and gallery meal vision scans, and 30-day trend analytics.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 4 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Billing & Auto-Renewal:</Text> Payment is charged to your Apple App Store or Google Play account at confirmation of purchase. Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current billing cycle.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 4 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Managing Subscriptions:</Text> You can manage or cancel your subscription at any time through your device settings (iOS: Settings &gt; Apple ID &gt; Subscriptions; Android: Google Play &gt; Payments &amp; Subscriptions). Any unused portion of a free trial is forfeited upon purchase of a subscription.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>5. AI & USDA Data Accuracy</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            Nutritional values are calculated using the USDA FoodData Central scientific database and multimodal Gemini AI vision estimation. While designed with high nutritional precision, values are estimates and should not replace clinical medical advice or individual metabolic evaluations.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>6. Account Termination & Data Deletion</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            You may erase your logged dietary history via "Delete User Data" or permanently remove your account and all stored records via "Delete Account" in the app settings at any time without penalty.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>7. Contact Information</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            For legal inquiries, terms clarifications, or customer support, please contact us at: hello@duomatic.co.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONTS.serif,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 22,
    ...SHADOWS.card,
  },
  effectiveDate: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FONTS.serif,
    marginTop: 18,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 21,
  },
  alertBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
});
