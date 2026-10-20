import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { LogoMark } from '../components/LogoMark';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';

export const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors } = useApp();
  const [infoModalTopic, setInfoModalTopic] = useState<'targets' | 'types' | null>(null);

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
        <Text style={[styles.headerTitle, { color: colors.ink }]}>About FiberSnap</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Hero Card with Official Logo */}
        <View style={[styles.card, styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <LogoMark size={76} showWordmark={true} showTagline={true} fontSize={26} direction="column" useImage={true} />
          <View style={[styles.versionPill, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Text style={[styles.versionText, { color: colors.inkSoft }]}>Version 1.0.0 • AI-Powered Fiber Tracker</Text>
          </View>
        </View>

        {/* Product Mission & Concept */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>About FiberSnap</Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft }]}>
            FiberSnap is a dedicated dietary fiber tracker using state-of-the-art AI computer vision, crafted specifically to make fiber tracking effortless, beautiful, and accurate.
          </Text>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginTop: 10 }]}>
            Over 95% of adults do not meet the recommended daily dietary fiber intake. FiberSnap was built to make tracking fiber frictionless. By combining camera vision powered by Google Gemini AI with the USDA FoodData Central database, you can log meals in seconds, edit manually, and understand your exact soluble and insoluble fiber splits.
          </Text>
          <Text style={[styles.cardCitationText, { color: colors.inkFaint, marginTop: 10 }]}>
            Citation: Quagliani & Felt-Glover, Am J Lifestyle Med (2017); USDA/HHS Dietary Guidelines for Americans (2020–2025).
          </Text>
        </View>

        {/* Daily Targets by Sex and Age */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>Daily Targets by Sex & Age</Text>
            <TouchableOpacity
              onPress={() => setInfoModalTopic('targets')}
              style={[styles.infoBtn, { backgroundColor: colors.surface2 }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
            >
              <Ionicons name="information-circle-outline" size={17} color={colors.accentDeep} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.bodyText, { color: colors.inkSoft, marginBottom: 12 }]}>
            Daily goals are personalized using official Adequate Intake (AI) dietary guidelines based on biological sex and age:
          </Text>

          <View style={[styles.targetTable, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <View style={[styles.targetRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.targetRowLabel, { color: colors.ink }]}>Ages 19–50 (Adults)</Text>
              <Text style={[styles.targetRowVal, { color: colors.accentDeep }]}>Women: 25g · Men: 38g / day</Text>
            </View>
            <View style={styles.targetRow}>
              <Text style={[styles.targetRowLabel, { color: colors.ink }]}>Ages 51+ (Mature Adults)</Text>
              <Text style={[styles.targetRowVal, { color: colors.accentDeep }]}>Women: 21g · Men: 30g / day</Text>
            </View>
          </View>

          <Text style={[styles.cardCitationText, { color: colors.inkFaint, marginTop: 10 }]}>
            Citation: Institute of Medicine (IOM) Dietary Reference Intakes (DRI), Food and Nutrition Board, National Academies Press (2005).
          </Text>
        </View>

        {/* The Science of Fiber: Soluble vs Insoluble */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>Soluble vs. Insoluble Fiber</Text>
            <TouchableOpacity
              onPress={() => setInfoModalTopic('types')}
              style={[styles.infoBtn, { backgroundColor: colors.surface2 }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.75}
            >
              <Ionicons name="information-circle-outline" size={17} color={colors.accentDeep} />
            </TouchableOpacity>
          </View>

          <View style={styles.pillarRow}>
            <View style={[styles.pillarIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="water-outline" size={20} color={colors.accentDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pillarTitle, { color: colors.ink }]}>Soluble Fiber</Text>
              <Text style={[styles.pillarBody, { color: colors.inkSoft }]}>
                Dissolves in water into a gel in your digestive tract. Feeds beneficial gut microbiota, slows glucose absorption, and reduces LDL cholesterol. Rich in oats, barley, chia seeds, beans, and avocados.
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.pillarRow}>
            <View style={[styles.pillarIcon, { backgroundColor: colors.surface2 }]}>
              <Ionicons name="leaf-outline" size={20} color={colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pillarTitle, { color: colors.ink }]}>Insoluble Fiber</Text>
              <Text style={[styles.pillarBody, { color: colors.inkSoft }]}>
                Adds bulk and accelerates digestive transit. Essential for bowel regularity, satiety, and gut wall integrity. Rich in whole wheat, brown rice, nuts, and vegetable skins.
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.cardCitationText, { color: colors.inkFaint }]}>
            Citation: Brown et al., Am J Clin Nutr (1999); Aune et al., BMJ (2011).
          </Text>
        </View>

        {/* Primary Scientific Citations */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>Primary Scientific Citations</Text>

          <View style={[styles.citationBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Text style={[styles.citationHeading, { color: colors.ink }]}>
              1. National Academies / Institute of Medicine (IOM) DRI Report
            </Text>
            <Text style={[styles.citationBody, { color: colors.inkSoft }]}>
              "Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids", Food and Nutrition Board, National Academies Press, 2005.
            </Text>
          </View>

          <View style={[styles.citationBox, { backgroundColor: colors.surface2, borderColor: colors.border, marginTop: 10 }]}>
            <Text style={[styles.citationHeading, { color: colors.ink }]}>
              2. The Lancet Systematic Review & Meta-Analysis
            </Text>
            <Text style={[styles.citationBody, { color: colors.inkSoft }]}>
              Reynolds A, Mann J, Cummings J, et al. "Carbohydrate quality and human health: a series of systematic reviews and meta-analyses." The Lancet, 2019;393(10170):434-445. DOI: 10.1016/S0140-6736(18)31809-9.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.linkBtn, { backgroundColor: colors.accent, marginTop: 14 }]}
            onPress={() => navigation.navigate('Citations')}
            activeOpacity={0.88}
          >
            <Text style={[styles.linkBtnText, { color: colors.accentInk }]}>
              View All Scientific Citations & Research →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Membership & Subscription Tiers */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.ink }]}>Membership & Access Tiers</Text>

          <View style={[styles.tierRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tierTitle, { color: colors.ink }]}>Free Tier</Text>
              <Text style={[styles.tierDesc, { color: colors.inkSoft }]}>
                Full USDA food search & manual logging, custom entries, daily goal + progress ring, soluble/insoluble split, 7-day trend, plus one-time AI camera scan trial.
              </Text>
            </View>
            <Text style={[styles.tierBadge, { color: colors.accentDeep }]}>FREE</Text>
          </View>

          <View style={[styles.tierRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tierTitle, { color: colors.ink }]}>FiberSnap Plus</Text>
              <Text style={[styles.tierDesc, { color: colors.inkSoft }]}>
                Unlimited AI computer vision meal scanning, camera & photo library analysis, 30-day and 1-year longitudinal trends, and automatic cloud backup.
              </Text>
            </View>
            <Text style={[styles.tierBadge, { color: colors.accentDeep }]}>$6.99/mo · $49.99/yr</Text>
          </View>
        </View>

        {/* Legal & Policies Navigation */}
        <View style={styles.legalLinksRow}>
          <TouchableOpacity
            style={[styles.policyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Terms')}
          >
            <Text style={[styles.policyBtnText, { color: colors.ink }]}>Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.policyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={[styles.policyBtnText, { color: colors.ink }]}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Scientific Info Modal */}
      <Modal
        visible={infoModalTopic !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInfoModalTopic(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setInfoModalTopic(null)}
        >
          <View
            style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconWrap, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="school-outline" size={20} color={colors.accentDeep} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.ink, flex: 1 }]}>
                {infoModalTopic === 'targets'
                  ? 'Daily Targets Science'
                  : 'Soluble vs. Insoluble Science'}
              </Text>
              <TouchableOpacity onPress={() => setInfoModalTopic(null)}>
                <Ionicons name="close" size={22} color={colors.inkSoft} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 12, maxHeight: 360 }}>
              {infoModalTopic === 'targets' ? (
                <>
                  <Text style={[styles.infoParagraph, { color: colors.ink }]}>
                    Daily dietary fiber intake standards are formulated by the Institute of Medicine (IOM) and Food and Nutrition Board:
                  </Text>
                  <Text style={[styles.infoParagraph, { color: colors.inkSoft, marginTop: 8 }]}>
                    Based on an Adequate Intake (AI) benchmark of 14g per 1,000 kcal consumed, adult recommendations scale by median biological caloric expenditure: 38g for men and 25g for women under 50, and 30g for men and 21g for women age 51 and older.
                  </Text>
                  <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2, marginTop: 12 }]}>
                    <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Primary Scientific Citation:</Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                      • <Text style={{ fontWeight: '700', color: colors.ink }}>Institute of Medicine (IOM):</Text> Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, and Amino Acids (National Academies Press, 2005).
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.infoParagraph, { color: colors.ink }]}>
                    Fiber components perform two essential, complementary physiological functions:
                  </Text>
                  <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2, marginTop: 10 }]}>
                    <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Soluble Viscous Fiber:</Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                      Forms a gel matrix in the gut, binding digestive bile acids to safely lower LDL cholesterol and dampening postprandial glucose spikes.
                    </Text>
                  </View>
                  <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2, marginTop: 10 }]}>
                    <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Insoluble Bulking Fiber:</Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                      Accelerates intestinal motility, supports healthy bowel frequency, and protects colonic epithelial integrity.
                    </Text>
                  </View>
                  <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2, marginTop: 10 }]}>
                    <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Primary Scientific Citations:</Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                      • <Text style={{ fontWeight: '700', color: colors.ink }}>Brown et al. (Am J Clin Nutr, 1999):</Text> Viscous fiber significantly reduces total and LDL cholesterol.
                    </Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft, marginTop: 4 }]}>
                      • <Text style={{ fontWeight: '700', color: colors.ink }}>Aune et al. (BMJ, 2011):</Text> Insoluble fiber and whole grains linked to long-term colorectal wellness.
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.citationNavBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                const targetCat = infoModalTopic === 'targets' ? 'guidelines' : 'cardio';
                setInfoModalTopic(null);
                navigation.navigate('Citations', { category: targetCat });
              }}
              activeOpacity={0.88}
            >
              <Text style={[styles.citationNavBtnText, { color: colors.accentInk }]}>
                View Full Scientific Citations & Research →
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    gap: 16,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    marginTop: 14,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.serif,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  targetTable: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  targetRow: {
    padding: 12,
    borderBottomWidth: 1,
  },
  targetRowLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  targetRowVal: {
    fontSize: 13.5,
    fontWeight: '800',
    marginTop: 2,
  },
  pillarRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  pillarIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  pillarBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  citationBox: {
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  citationHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  citationBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  linkBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tierRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  tierTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  tierDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  tierBadge: {
    fontSize: 12,
    fontWeight: '800',
  },
  legalLinksRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  policyBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  policyBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardCitationText: {
    fontSize: 11.5,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '700',
  },
  infoParagraph: {
    fontSize: 13.5,
    lineHeight: 19.5,
  },
  guidelineGridBox: {
    padding: 12,
    borderRadius: RADIUS.md,
  },
  gridBoxTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  gridBoxRow: {
    fontSize: 12,
    lineHeight: 17,
  },
  citationNavBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  citationNavBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
