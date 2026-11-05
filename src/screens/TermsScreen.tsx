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

export const TermsScreen: React.FC = () => {
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

  const handleAppleEulaPress = async () => {
    const url = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to Open Link', `Please visit: ${url}`);
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
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Terms of Service</Text>
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
            Last Updated: November 2026 • Official Terms of Service &amp; EULA
          </Text>

          {/* Section 1 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>1. Acceptance of Terms &amp; Agreement</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            These Terms of Service (the "Terms", or "Agreement") constitute a legally binding agreement between you ("User", "you", or "your") and Duomatic ("Company", "we", "our", or "us"), regarding your access to and use of the FiberSnap mobile software application, website, and related digital services (collectively, the "Service"). By downloading, installing, registering, accessing, or using the Service, you represent that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you do not agree with all of these Terms, you are expressly prohibited from using the Service and must immediately uninstall and discontinue use.
          </Text>

          {/* Section 2 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>2. Strict Wellness &amp; Nutritional Disclaimer (Not Medical Advice)</Text>
          <View style={[styles.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accentDeep }]}>
            <Ionicons name="alert-circle-outline" size={22} color={colors.accentDeep} style={{ marginTop: 2 }} />
            <Text style={[styles.alertText, { color: colors.ink }]}>
              FIBERSNAP IS A GENERAL NUTRITION, DIETARY FIBER TRACKING, AND WELLNESS INFORMATIONAL UTILITY ONLY. THE SERVICE DOES NOT PROVIDE MEDICAL ADVICE, CLINICAL DIAGNOSIS, PRESCRIPTION, OR TREATMENT OF ANY MEDICAL CONDITION. ALWAYS CONSULT A LICENSED PHYSICIAN OR REGISTERED DIETITIAN BEFORE UNDERTAKING SUBSTANTIAL DIETARY CHANGES, PARTICULARLY IF YOU HAVE ANY DIGESTIVE, METABOLIC, OR OTHER CHRONIC HEALTH CONDITION, OR ARE OTHERWISE UNDER THE CARE OF A PHYSICIAN.
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 8 }]}>
            Nutritional fiber targets recommended by the Service (including 25g/day for women, 38g/day for men, or ~0.4g per kilogram of body weight) represent generalized scientific guidelines established by the National Academy of Medicine and peer-reviewed dietary references. Individual metabolic rates, digestive tolerance, and medical requirements vary significantly. You assume full responsibility for your nutritional choices and dietary habits.
          </Text>

          {/* Section 3 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>3. User Eligibility &amp; Account Security</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            To register an account or use the Service, you must be at least 18 years of age (or the legal age of majority in your jurisdiction). By registering, you warrant that all information provided is accurate and truthful. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your account. You agree to notify us immediately at hello@duomatic.co of any unauthorized access or security breach.
          </Text>

          {/* Section 4 - Standard Apple EULA */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>4. End User License Agreement (Apple Standard EULA &amp; Platform Terms)</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            Your license to download, install, and use the FiberSnap application on Apple iOS devices is governed by Apple's Standard Licensed Application End User License Agreement ("Apple Standard EULA"), which is incorporated into these Terms by reference.
          </Text>
          <TouchableOpacity
            onPress={handleAppleEulaPress}
            style={styles.linkTouchRow}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel="View Apple Standard EULA"
          >
            <Ionicons name="open-outline" size={16} color={colors.accentDeep} />
            <Text style={[styles.linkText, { color: colors.accentDeep }]}>
              View Apple Standard EULA (apple.com/legal/internet-services/itunes/dev/stdeula/)
            </Text>
          </TouchableOpacity>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 8 }]}>
            For users acquiring FiberSnap through the Apple App Store, the Apple Standard EULA applies between you and Duomatic, supplemented by these Terms. For Android users acquiring FiberSnap through Google Play, your license is governed by standard Google Play Terms of Service. Subject to these platform terms, you agree not to:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Application.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • Scrape, automate, crawl, or extract database records, food lists, or AI models from the Service.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • Circumvent, disable, or interfere with security features, subscription entitlement verification, or rate limits.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • Sub-license, rent, lease, distribute, or commercially exploit the Service without our prior written consent.
          </Text>

          {/* Section 5 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>5. Free Baseline Tier &amp; FiberSnap Plus Subscriptions</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap offers both free baseline functionality and premium auto-renewing subscription tiers in compliance with Apple App Store Review Guidelines (Guideline 3.1.1) and Google Play In-App Billing specifications:
          </Text>
          
          <Text style={[styles.subHeading, { color: colors.ink }]}>A. Free Baseline Tier</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            The Free Tier grants unlimited access to USDA FoodData Central manual food search and logging, custom food entries, personalized fiber target calculations, 7-day trend visualizations, streak tracking, and one (1) single lifetime complimentary AI meal scan. Subsequent AI meal scans require an active FiberSnap Plus subscription.
          </Text>

          <Text style={[styles.subHeading, { color: colors.ink }]}>B. FiberSnap Plus Subscriptions</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap Plus unlocks unlimited Gemini AI camera and photo gallery meal scans, and 30-day longitudinal analytics. FiberSnap Plus is offered under the following subscription options:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Monthly Subscription:</Text> $6.99 USD per month, billed monthly on an auto-renewing basis.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Annual Subscription:</Text> $49.99 USD per year (saving ~40%), billed annually on an auto-renewing basis.
          </Text>

          <Text style={[styles.subHeading, { color: colors.ink }]}>C. Billing, Auto-Renewal &amp; Cancellation</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            Subscription payments are billed directly through your Apple App Store or Google Play account at confirmation of purchase. Subscriptions automatically renew at the established rate unless auto-renew is disabled at least 24 hours prior to the conclusion of the active subscription period. You may manage, modify, or cancel your active subscription at any time via:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>iOS Users:</Text> Device Settings &gt; [Your Apple ID Name] &gt; Subscriptions &gt; FiberSnap &gt; Cancel Subscription.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Android Users:</Text> Google Play Store &gt; Profile Icon &gt; Payments &amp; Subscriptions &gt; Subscriptions &gt; FiberSnap &gt; Cancel.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            Cancelling a subscription disables automatic future renewals; you retain full Plus access until the conclusion of your current paid billing period.
          </Text>

          {/* Subscriptions & Account Deletion Notice */}
          <View style={[styles.alertBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.accentDeep} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertNoticeTitle, { color: colors.ink }]}>
                Important: What Happens to Active Subscriptions on Account Deletion?
              </Text>
              <Text style={[styles.alertNoticeText, { color: colors.inkSoft }]}>
                Deleting your FiberSnap account or removing the app from your device <Text style={{ fontWeight: '700' }}>does NOT automatically cancel, stop, or refund an active auto-renewing subscription</Text>. Because subscriptions are billed directly by Apple or Google, third-party developers do not have technical or billing permission to cancel your store subscription on your behalf.
              </Text>
              <Text style={[styles.alertNoticeText, { color: colors.inkSoft, marginTop: 4 }]}>
                You must manually cancel your subscription in your Apple ID or Google Play account settings prior to or immediately after deleting your FiberSnap account to prevent continued recurring billing.
              </Text>
            </View>
          </View>

          <Text style={[styles.subHeading, { color: colors.ink }]}>D. Refunds &amp; Billing Inquiries</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            Because subscription billing is administered directly through Apple and Google app store platforms, refund requests must be submitted directly to Apple (reportaproblem.apple.com) or Google Play in accordance with their respective refund policies.
          </Text>

          {/* Section 6 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>6. AI Meal Vision &amp; USDA Nutritional Data Disclaimers</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            Dietary fiber statistics and estimations are calculated using multimodal Google Gemini AI computer vision models and the USDA FoodData Central nutritional database:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Estimation Nature:</Text> All nutritional quantities (grams of total, soluble, and insoluble fiber) represent automated algorithmic approximations. Culinary preparation methods, moisture content, brand formulations, and hidden ingredients naturally influence actual fiber values.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>User Verification:</Text> You are provided with a full interactive preview screen following every AI meal scan, allowing you to review, adjust grams, modify portion sizes, or edit ingredients prior to committing the entry to your daily log.
          </Text>

          {/* Section 7 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>7. User Content &amp; Photo Ownership</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            You retain sole and exclusive ownership of all photos, food descriptions, and personal notes that you upload to the Application ("User Content"). By uploading meal photos or avatars, you grant Duomatic a limited, non-exclusive, royalty-free, worldwide license solely to host, cache, transmit, and display your User Content for the sole purpose of operating and providing the Service to you. You represent and warrant that your User Content does not infringe upon third-party copyrights, trademarks, or privacy rights.
          </Text>

          {/* Section 8 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>8. Account Termination &amp; Data Deletion</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            You may discontinue use of the Service at any time. The Application includes self-serve account and data deletion mechanisms under Profile (Me) &gt; Data &amp; Privacy:
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 6 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Delete User Data:</Text> Immediately and permanently wipes all meal logs, custom food items, streak records, and photo associations while keeping your login account open.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            • <Text style={{ fontWeight: '700', color: colors.ink }}>Delete Account:</Text> Permanently and irreversibly deletes your authentication record, cloud storage media, and Firestore database documents. As noted in Section 5, deleting your account does not cancel an active Apple or Google subscription, which must be cancelled in your device store settings.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 5 }]}>
            We reserve the right to suspend or terminate your account without notice if you materially breach these Terms or engage in fraudulent activities.
          </Text>

          {/* Section 9 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>9. Disclaimer of Warranties</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            THE SERVICE IS PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM BUGS, DATA TRANSMISSION OMISSIONS, OR SERVER OUTAGES.
          </Text>

          {/* Section 10 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>10. Limitation of Liability</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL DUOMATIC, ITS DIRECTORS, EMPLOYEES, AFFILIATES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA LOSS, MEDICAL EXPENSES, DIGESTIVE DISCOMFORT, OR PERSONAL DISTRESS) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL OUR AGGREGATE LIABILITY EXCEED THE GREATER OF FIFTY US DOLLARS ($50.00 USD) OR THE AMOUNT PAID BY YOU TO DUOMATIC IN THE PAST TWELVE (12) MONTHS.
          </Text>

          {/* Section 11 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>11. Indemnification</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            You agree to defend, indemnify, and hold harmless Duomatic, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorney fees) arising out of or related to your breach of these Terms, your User Content, or your misuse of the Service.
          </Text>

          {/* Section 12 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>12. Governing Law &amp; Dispute Resolution</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles. Any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved through good-faith informal negotiations, or if unresolved, through binding individual arbitration administered under the Commercial Arbitration Rules of the American Arbitration Association (AAA), waiving any right to participate in a class action lawsuit or class-wide arbitration.
          </Text>

          {/* Section 13 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>13. Modifications to Terms</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            We reserve the right to revise or modify these Terms at our discretion. Material changes will be communicated via in-app notifications or updated effective dates. Your continued use of the Application following such changes constitutes your binding agreement to the amended Terms.
          </Text>

          {/* Section 14 */}
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>14. Contact Information &amp; Legal Inquiries</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            For any questions, legal notices, terms inquiries, or feedback regarding FiberSnap, please contact:
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
    marginTop: 8,
    marginBottom: 10,
  },
  alertText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: FONTS.sans,
  },
  alertNoticeTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: FONTS.sans,
  },
  alertNoticeText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: FONTS.sans,
  },
  linkTouchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
