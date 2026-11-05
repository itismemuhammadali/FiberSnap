import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
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

  const handleEmailPress = async () => {
    const url = 'mailto:hello@duomatic.co';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Email Client Unavailable',
          'Please send an email directly to hello@duomatic.co.'
        );
      }
    } catch {
      Alert.alert(
        'Email Client Unavailable',
        'Please send an email directly to hello@duomatic.co.'
      );
    }
  };

  const handleOpenUrl = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert('Unable to Open Link', `Please visit: ${url}`);
    }
  };

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
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Privacy Policy</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.effectiveDate, { color: colors.inkFaint }]}>
            Last Updated: November 2026 • GDPR &amp; Global Privacy Compliant
          </Text>

          {/* Section 1 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>1. Overview &amp; Data Controller</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap ("we", "our", "us", or the "Application"), developed and operated by Duomatic ("Data Controller"), is committed to upholding high standards of personal privacy, dietary data confidentiality, and digital security. This Privacy Policy governs your use of the FiberSnap mobile application across iOS and Android operating systems, detailing how personal, dietary, demographic, and visual information is collected, processed, encrypted, stored, and retained in compliance with applicable global privacy laws, including the European Union General Data Protection Regulation (GDPR), the UK Data Protection Act / UK GDPR, the California Consumer Privacy Act as amended by the California Privacy Rights Act (CCPA/CPRA), and Apple App Store Review Guidelines.
          </Text>

          {/* Section 2 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>2. Information We Collect &amp; Why</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            We collect only the minimum necessary categories of personal data required to provide dietary fiber tracking, nutritional calculations, and personalized targets:
          </Text>
          
          <Text style={[styles.subHeading, { color: colors.ink }]}>A. Account &amp; Authentication Information</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            When you register an account, we collect your email address, display name, and securely hashed authentication credentials through Google Firebase Authentication. For users utilizing Guest Mode, authentication tokens are scoped locally to your device and converted only upon voluntary account creation.
          </Text>

          <Text style={[styles.subHeading, { color: colors.ink }]}>B. Health, Demographic &amp; Target Parameters</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            To calculate daily dietary fiber intake targets, we collect your age, biological sex, and optional body weight. These parameters are referenced against established Dietary Reference Intakes (DRI) published by the National Academy of Medicine (25g/day for women, 38g/day for men) or a body-weight benchmark (~0.4g of fiber per kilogram of body weight). These demographic and health parameters are used strictly for mathematical target calculations and are never sold, rented, monetized, or shared with health insurers or data brokers.
          </Text>

          <Text style={[styles.subHeading, { color: colors.ink }]}>C. Dietary &amp; Nutrition Records</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            We store individual food entries you log, including meal names, portion sizes, meal timestamps, total dietary fiber grams, and estimated soluble and insoluble fiber breakdowns based on reference data from the USDA FoodData Central database.
          </Text>

          <Text style={[styles.subHeading, { color: colors.ink }]}>D. Camera &amp; Photo Library Access</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            With your explicit runtime device permission, the Application accesses your device camera or selected photo gallery media solely when you choose to photograph a meal for automated AI visual scanning or upload a profile avatar. Photos are processed exclusively for nutritional identification and are never mined for facial recognition, personal identity scanning, or ambient environment surveillance.
          </Text>

          <Text style={[styles.subHeading, { color: colors.ink }]}>E. Technical &amp; Device Telemetry</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            We collect non-identifiable technical diagnostic data, including device model, operating system version, application build number, and anonymized performance metrics to troubleshoot crashes, optimize rendering, and ensure cross-platform compatibility.
          </Text>

          {/* Section 3 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>3. Artificial Intelligence &amp; Vision Processing</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap integrates Google Gemini Multimodal Vision APIs to assist in recognizing foods and estimating dietary fiber from photographs. In strict adherence to Apple App Store Guideline 5.1.2 (Data Use and Sharing) and Google Play Developer Policies:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Prior Explicit Consent:</Text> The AI meal vision feature is disabled by default and requires your affirmative, informed opt-in consent before any photograph is transmitted. You can revoke this consent at any time in the app settings.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Strict Purpose Limitation:</Text> Images submitted for AI scanning are transmitted securely via encrypted HTTPS/TLS 1.3 solely to identify culinary ingredients, estimate serving portions, and calculate dietary fiber.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Ephemeral Inference Memory:</Text> During AI analysis, photo data is processed in transient inference memory solely to generate a structured JSON nutritional estimation, and is discarded from inference memory once the analysis is returned to your device.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Model Training &amp; Google Data Governance:</Text> AI inference requests are submitted to the Google Gemini API. Data submitted to Google Cloud / Gemini APIs is governed by Google's API Data Governance and privacy terms (accessible at https://policies.google.com/privacy). FiberSnap does not independently use your meal photos or personal food diary to train public foundation AI models.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Cryptographic On-Device Cache:</Text> To minimize unnecessary network bandwidth and provide deterministic consistency, cryptographic SHA-256 signatures of scanned images may be cached locally on your device.
          </Text>

          {/* Section 4 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>4. Cloud Storage, Meal Photo Retention &amp; Security</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            All cloud-synchronized user accounts and meal logs are hosted on Google Cloud infrastructure utilizing Firebase Cloud Firestore and Firebase Cloud Storage:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Photo Retention for Saved Meals:</Text> Photographs are stored persistently in cloud storage <Text style={{ fontWeight: '700' }}>only if and when you affirmatively choose to save the scanned meal</Text> into your personal dietary log. Saved meal photos are stored in your private Firebase Cloud Storage directory (scoped strictly to your authenticated User ID) so you can view your photo history in your personal diary. If you dismiss or cancel a scan without saving, the photo is never uploaded to cloud storage. Deleting a meal entry or deleting your account permanently purges the associated photo asset from cloud storage.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Granular Access Controls:</Text> Server-side security rules restrict database and storage bucket access. Only the verified authenticated owner (matched to their unique Firebase User ID) possesses authorization to read, write, update, or delete their records.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Encryption Standards:</Text> Data is encrypted in transit using Transport Layer Security (TLS 1.3) and at rest utilizing Advanced Encryption Standard with 256-bit keys (AES-256).
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Local Cache Fallback:</Text> The Application maintains an encrypted local cache on your device, allowing seamless offline meal logging with automatic bi-directional cloud synchronization upon network restoration.
          </Text>

          {/* Section 5 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>5. Legal Bases for Processing (GDPR Compliance)</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            If you reside in the European Economic Area (EEA), United Kingdom (UK), or Switzerland, our processing of your personal data is grounded in the following lawful bases under GDPR Article 6 and Article 9:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Performance of a Contract (Art. 6(1)(b)):</Text> Processing your account authentication, dietary logs, and goal preferences is necessary to fulfill our agreement and provide the Application's core features.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Explicit Consent (Art. 6(1)(a) &amp; Art. 9(2)(a)):</Text> Processing health-related demographic targets (age, sex, body weight) and transmitting food photos for AI vision analysis is performed solely pursuant to your freely given, explicit opt-in consent, which you may withdraw at any time in app settings.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Legitimate Interests (Art. 6(1)(f)):</Text> Ensuring software security, debugging crashes, detecting fraud, and optimizing application performance.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Legal Obligations (Art. 6(1)(c)):</Text> Retaining financial transaction receipts and complying with statutory tax and regulatory requirements where applicable.
          </Text>

          {/* Section 6 - International Data Transfers */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>6. International Data Transfers (EEA/UK/CH to US)</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap's backend infrastructure and cloud databases (Google Cloud and Firebase) are hosted on servers located primarily in the United States. If you reside in the European Economic Area (EEA), the United Kingdom (UK), or Switzerland, your personal data is transferred to and processed in the United States.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            To ensure that your personal information receives an essentially equivalent level of data protection as afforded under GDPR and UK GDPR, we rely on established cross-border data transfer mechanisms recognized under GDPR Article 45 and Article 46:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>EU-U.S. Data Privacy Framework (EU-U.S. DPF), UK Extension &amp; Swiss-U.S. DPF:</Text> Google LLC participates in and has certified its compliance with the EU-U.S. DPF, the UK Extension to the EU-U.S. DPF, and the Swiss-U.S. DPF as administered by the U.S. Department of Commerce.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>European Commission Standard Contractual Clauses (SCCs):</Text> In addition to DPF certification, cross-border transfers to Google Cloud and Firebase are governed by the European Commission's approved Standard Contractual Clauses (Commission Implementing Decision (EU) 2021/914) and the UK International Data Transfer Addendum, which legally bind our processors to strict European privacy and security standards.
          </Text>

          {/* Section 7 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>7. California &amp; United States Privacy Rights (CCPA/CPRA)</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            Under the California Consumer Privacy Act and California Privacy Rights Act:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • We do NOT sell your personal, health, demographic, or dietary information.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • We do NOT share your personal information with third parties for cross-context behavioral advertising.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • You have the right to request disclosure of categories of personal information collected, request deletion, request correction of inaccurate records, and not be discriminated against for exercising your statutory privacy rights.
          </Text>

          {/* Section 8 - GDPR Data Subject Rights */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>8. Your Statutory Privacy Rights &amp; Automated Decisions</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            Under applicable data protection laws, including GDPR (Articles 15–22) and UK GDPR, you have the following enforceable rights:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Right of Access (Art. 15):</Text> You have the right to obtain confirmation as to whether your personal data is being processed and to receive a copy of your personal data.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Right to Rectification (Art. 16):</Text> You have the right to correct inaccurate or incomplete health, demographic, or dietary records directly in the app.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Right to Erasure ("Right to be Forgotten", Art. 17):</Text> You have the right to request the permanent deletion of your personal data and account records.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Right to Restrict Processing (Art. 18):</Text> You have the right to request the restriction of processing of your personal data under certain circumstances (such as when the accuracy is contested).
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Right to Data Portability (Art. 20):</Text> You have the right to export and receive your dietary history in a structured, commonly used, and machine-readable JSON format via Profile &gt; Data &amp; Privacy &gt; Export Data Archive.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Right to Object (Art. 21):</Text> You have the right to object at any time to the processing of your personal data based on legitimate interests.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Right to Withdraw Consent (Art. 7(3)):</Text> Where processing is based on consent, you may withdraw your consent at any time without affecting the lawfulness of processing prior to withdrawal.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Automated Decision-Making &amp; Profiling (Art. 22):</Text> The Application uses algorithmic formulas to calculate nutritional target estimates and AI vision models for food recognition. FiberSnap does NOT perform automated decision-making or profiling that produces legal effects or similarly significantly affects you.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Right to Lodge a Complaint (Art. 77):</Text> If you believe our data processing violates applicable data protection regulations, you have the right to lodge a complaint with a competent supervisory authority in your EU Member State of habitual residence, place of work, or place of alleged infringement, or with the UK Information Commissioner's Office (ICO, https://ico.org.uk).
          </Text>

          {/* Section 9 - Data Deletion & Active Subscriptions */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>9. Data Deletion &amp; Active Subscriptions</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            We provide self-serve tools accessible at any time under Profile (Me) &gt; Data &amp; Privacy:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Delete User Data (Reset History):</Text> Permanently purges all logged meal entries, custom foods, photo links, and progress records from your device and cloud storage while preserving your authenticated login account.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Delete Account (Complete Erasure):</Text> Irreversibly erases your entire user profile, authentication credentials, cloud storage photos, and database documents in compliance with Apple App Store account deletion requirements.
          </Text>

          {/* Notice on Active Subscriptions */}
          <View style={[styles.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accentDeep }]}>
            <Ionicons name="information-circle" size={22} color={colors.accentDeep} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: colors.ink }]}>
                What Happens to an Active Subscription on Account Deletion?
              </Text>
              <Text style={[styles.alertText, { color: colors.inkSoft }]}>
                Deleting your FiberSnap account or removing the app from your device <Text style={{ fontWeight: '700' }}>does NOT automatically cancel or refund an active auto-renewing FiberSnap Plus subscription</Text>. Subscriptions are purchased through and billed directly by Apple (App Store) or Google (Google Play). App developers do not have technical access or authority to cancel store subscriptions on your behalf.
              </Text>
              <Text style={[styles.alertText, { color: colors.inkSoft, marginTop: 6 }]}>
                To avoid future automatic renewal charges, you MUST cancel your subscription directly in your device account settings prior to or immediately after deleting your account:
              </Text>
              <Text style={[styles.alertBullet, { color: colors.inkSoft, marginTop: 4 }]}>
                • <Text style={{ fontWeight: '700' }}>iOS Users:</Text> Device Settings &gt; [Your Apple ID Name] &gt; Subscriptions &gt; FiberSnap &gt; Cancel Subscription.
              </Text>
              <Text style={[styles.alertBullet, { color: colors.inkSoft, marginTop: 3 }]}>
                • <Text style={{ fontWeight: '700' }}>Android Users:</Text> Google Play Store &gt; Profile Icon &gt; Payments &amp; Subscriptions &gt; Subscriptions &gt; FiberSnap &gt; Cancel.
              </Text>
            </View>
          </View>

          {/* Section 10 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>10. Data Retention &amp; Session Security</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            Personal data is retained only for the duration of your active account lifecycle. If you choose to delete your account or specific food records, deletion from live production databases is executed immediately, with automated removal from operational backups within thirty (30) days. To protect against unauthorized physical access to unattended devices, user authentication sessions expire after thirty (30) continuous days of inactivity, requiring secure re-authentication.
          </Text>

          {/* Section 11 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>11. Third-Party Service Providers</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            We partner with reputable cloud service providers bound by strict data processing agreements:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Google Firebase &amp; Google Cloud (Google LLC):</Text> Cloud database hosting (Firestore), photo asset storage (Firebase Storage), user authentication, and Cloud Functions execution.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Google Gemini Multimodal Vision API (Google LLC):</Text> Food recognition and portion estimation pursuant to Google Cloud's API terms.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>USDA FoodData Central:</Text> Public reference database utilized strictly for standardized nutritional lookup queries (no personal user data transmitted).
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Apple StoreKit &amp; Google Play In-App Billing:</Text> Payment processing for subscription management. Financial details (credit card numbers, billing addresses) are handled directly by Apple and Google; FiberSnap never receives or stores your payment card information.
          </Text>

          {/* Section 12 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>12. Child Safety &amp; Children's Privacy (COPPA &amp; Families Policy)</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap is designed and intended strictly for adults seeking healthy dietary fiber intake management (ages 18 and older). In accordance with the Children's Online Privacy Protection Act (COPPA), EU GDPR Article 8 (GDPR-K), and Google Play Developer Families Policies, we do not knowingly solicit, collect, or process personal data from children under thirteen (13) years of age (or under sixteen in the European Union).
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            If a parent or legal guardian discovers that their child has provided personal information or registered an account without verified consent, please contact us immediately. We will take prompt steps to permanently delete the account, photos, and all associated nutritional data from our systems.
          </Text>

          {/* Section 13 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>13. Updates to This Privacy Policy</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            We reserve the right to periodically update this Privacy Policy to reflect enhancements in application functionality, emerging legal standards, or regulatory changes. Any material modifications will be prominently communicated through in-app notices or updated effective dates. Continued use of the Application following such notifications constitutes your informed acknowledgment of the revised policy.
          </Text>

          {/* Section 14 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>14. Contact &amp; Data Protection Inquiries</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            If you have questions, feedback, or wish to exercise any of your statutory privacy rights under GDPR, UK GDPR, or CCPA/CPRA, please contact our Data Protection team:
          </Text>
          <TouchableOpacity
            onPress={handleEmailPress}
            style={styles.emailTouchRow}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel="Send email to hello@duomatic.co"
          >
            <Ionicons name="mail-outline" size={17} color={colors.accentDeep} />
            <Text style={[styles.emailLinkText, { color: colors.accentDeep }]}>
              Email: hello@duomatic.co
            </Text>
          </TouchableOpacity>
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
    fontFamily: FONTS.sans,
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
    fontFamily: FONTS.sans,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FONTS.sans,
    marginTop: 22,
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.sans,
    marginTop: 12,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 21,
    fontFamily: FONTS.sans,
  },
  alertBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 10,
    marginTop: 14,
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: FONTS.sans,
  },
  alertText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: FONTS.sans,
  },
  alertBullet: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: FONTS.sans,
  },
  emailTouchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 4,
  },
  emailLinkText: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontFamily: FONTS.sans,
  },
});
