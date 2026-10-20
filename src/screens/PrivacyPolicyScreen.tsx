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

export const PrivacyPolicyScreen: React.FC = () => {
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
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Privacy Policy</Text>
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
            Last Updated: October 2026 • Effective Immediately
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>1. Overview & Commitment</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap ("we", "our", or "us") is dedicated to safeguarding your personal health, dietary, and biometric information. This Privacy Policy outlines our practices regarding data collection, usage, AI vision processing, and your rights under Apple App Store Guidelines, GDPR, and CCPA.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>2. Information We Collect</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Account Credentials:</Text> Email address, display name, and authentication tokens managed securely through Google Firebase Authentication.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Dietary & Nutrition Data:</Text> Logged foods, portion sizes, total grams of dietary fiber, and estimated soluble/insoluble breakdowns derived from USDA FoodData Central.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Health & Biometric Profile:</Text> Age, biological sex, and optional body weight (used strictly to compute personalized 0.4g/kg targets). Biometric inputs are never shared with advertisers or third parties.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Camera & Photo Library Data:</Text> Meal images captured or selected by you solely for nutritional scanning and profile avatar customization.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>3. Artificial Intelligence & Vision Processing</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap incorporates Google Gemini AI models to analyze meal photos. In strict compliance with Apple App Store Review Guidelines (Guideline 5.1.2) and Google Play AI Policies:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Explicit Consent:</Text> AI meal scanning requires your prior opt-in consent. You can grant, deny, or revoke this consent at any time in the app settings.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Purpose Limitation:</Text> Images submitted for AI scanning are transmitted encrypted via HTTPS strictly to detect food ingredients and extract fiber values.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>No Unauthorized Model Training:</Text> User photos are never used to train public generative models or sold to third-party data brokers.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>4. Storage & Security</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            Your data is stored securely using Google Firebase Cloud Firestore and Firebase Cloud Storage with strict per-user security rules. Only authenticated owners can read or write their own documents and photos. All network requests use TLS 1.3 encryption in transit.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>5. Data Ownership & Deletion Rights</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            You maintain 100% ownership of your data at all times:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Export Data Archive:</Text> You can download a complete, readable JSON backup containing your profile, daily goals, and full meal history anytime.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Delete User Data:</Text> Instantly purge all logged foods, streaks, and custom goals while retaining your login account credentials.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Delete Account:</Text> Permanently and irreversibly delete your user credentials and all associated cloud data.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>6. Data Retention & Inactivity Policy</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            Your data is retained for the active lifetime of your account. In accordance with user security standards, your session token is automatically refreshed with usage, but expires after 30 days of continuous inactivity to prevent unauthorized device access.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>7. Children's Privacy</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap is intended for adult wellness tracking (ages 18+) and does not knowingly collect or solicit personal data from children under 13.
          </Text>

          <Text style={[styles.sectionHeading, { color: colors.ink }]}>8. Contact Us</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            If you have questions, feedback, or data privacy requests under GDPR/CCPA, please contact our privacy compliance team at: privacy@fibersnap.app.
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
});
