import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { RADIUS, SHADOWS } from '../constants/theme';

interface SplitBarProps {
  solubleGrams: number;
  insolubleGrams: number;
  showCardWrapper?: boolean;
}

export const SplitBar: React.FC<SplitBarProps> = ({
  solubleGrams,
  insolubleGrams,
  showCardWrapper = true,
}) => {
  const { colors } = useApp();
  const navigation = useNavigation<any>();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const total = solubleGrams + insolubleGrams;
  const solPercent = total > 0 ? (solubleGrams / total) * 100 : 50;
  const insPercent = total > 0 ? 100 - solPercent : 50;

  const content = (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>
          Soluble vs. Insoluble
        </Text>
        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          style={[styles.infoBtn, { backgroundColor: colors.surface2 }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.75}
        >
          <Ionicons name="information-circle-outline" size={17} color={colors.accentDeep} />
        </TouchableOpacity>
      </View>

      {/* Legend Row */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.soluble }]} />
          <Text style={[styles.legendText, { color: colors.inkSoft }]}>Soluble</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.insoluble }]} />
          <Text style={[styles.legendText, { color: colors.inkSoft }]}>Insoluble</Text>
        </View>
      </View>

      {/* Split Bar */}
      <View style={[styles.splitBar, { backgroundColor: colors.surface2 }]}>
        <View
          style={[
            styles.splitSeg,
            { width: `${solPercent}%`, backgroundColor: colors.soluble },
          ]}
        />
        <View
          style={[
            styles.splitSeg,
            { width: `${insPercent}%`, backgroundColor: colors.insoluble },
          ]}
        />
      </View>

      {/* Split Values matching fibersnap.html: 0g soluble / 0g insoluble */}
      <View style={styles.splitValues}>
        <Text style={[styles.splitValText, { color: colors.inkSoft }]}>
          {solubleGrams.toFixed(1).replace(/\.0$/, '')}g soluble
        </Text>
        <Text style={[styles.splitValText, { color: colors.inkSoft }]}>
          {insolubleGrams.toFixed(1).replace(/\.0$/, '')}g insoluble
        </Text>
      </View>

      <Text style={[styles.hint, { color: colors.inkSoft }]}>
        Most foods contain some of both — this is an estimate based on each food's primary type. Soluble fiber (oats, beans, fruit) helps manage cholesterol and blood sugar; insoluble fiber (whole grains, vegetable skins, nuts) supports regularity.
      </Text>
      <Text style={[styles.citation, { color: colors.inkFaint }]}>
        Citation: Brown et al., Am J Clin Nutr (1999); Aune et al., BMJ (2011).
      </Text>
    </View>
  );

  const modalElement = (
    <Modal
      visible={showInfoModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowInfoModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowInfoModal(false)}
      >
        <View
          style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeaderRow}>
            <View style={[styles.modalIconWrap, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="school-outline" size={20} color={colors.accentDeep} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.ink, flex: 1, marginBottom: 0 }]}>
              Soluble vs. Insoluble Science
            </Text>
            <TouchableOpacity onPress={() => setShowInfoModal(false)}>
              <Ionicons name="close" size={22} color={colors.inkSoft} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 12, maxHeight: 360 }}>
            <Text style={[styles.infoParagraph, { color: colors.ink }]}>
              Extensive dietary science demonstrates that plant fiber functions via two distinct, complementary physiological mechanisms:
            </Text>

            <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2, marginTop: 10 }]}>
              <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Soluble Fiber (Gel-Forming):</Text>
              <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                Dissolves in water into a viscous gel. Feeds probiotic gut flora to produce anti-inflammatory Short-Chain Fatty Acids (SCFAs), slows glucose absorption, and binds digestive bile acids to reduce LDL cholesterol.
              </Text>
            </View>

            <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2, marginTop: 10 }]}>
              <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Insoluble Fiber (Bulking):</Text>
              <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                Remains intact through digestion. Accelerates intestinal transit time, lowers colonic intraluminal pressure, and protects digestive mucosal lining.
              </Text>
            </View>

            <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2, marginTop: 10 }]}>
              <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Scientific Research Citations:</Text>
              <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                • <Text style={{ fontWeight: '700', color: colors.ink }}>Brown et al. (Am J Clin Nutr, 1999):</Text> Viscous soluble fiber significantly lowers total and LDL cholesterol.
              </Text>
              <Text style={[styles.gridBoxRow, { color: colors.inkSoft, marginTop: 4 }]}>
                • <Text style={{ fontWeight: '700', color: colors.ink }}>Aune et al. (BMJ, 2011):</Text> Systematic review linking insoluble fiber and intact whole grains to long-term colorectal health.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.citationNavBtn, { backgroundColor: colors.accent }]}
            onPress={() => {
              setShowInfoModal(false);
              navigation.navigate('Citations', { category: 'cardio' });
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
  );

  if (!showCardWrapper) {
    return (
      <>
        {content}
        {modalElement}
      </>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {content}
      {modalElement}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  container: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Georgia',
    fontWeight: '700',
    fontSize: 18,
  },
  infoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
  },
  splitBar: {
    height: 14,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  splitSeg: {
    height: '100%',
  },
  splitValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  splitValText: {
    fontSize: 12.5,
  },
  hint: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 14,
  },
  citation: {
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
    marginTop: 8,
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
