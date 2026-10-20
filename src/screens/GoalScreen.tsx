import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { BiologicalSex, calculateStandardTarget, calculateWeightAdjustedTarget, calculateDailyTarget } from '../constants/guidelines';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';

export const GoalScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, profile, updateProfile } = useApp();

  const [sex, setSex] = useState<BiologicalSex>(profile.biologicalSex === 'male' ? 'male' : 'female');
  const [age, setAge] = useState(profile.age ? profile.age.toString() : '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(profile.weightUnit || 'kg');
  const [weight, setWeight] = useState(
    profile.weightKg
      ? (profile.weightUnit === 'lbs' ? Math.round(profile.weightKg * 2.20462).toString() : profile.weightKg.toString())
      : ''
  );
  const [goalType, setGoalType] = useState<'standard' | 'weight_adjusted' | 'custom'>('standard');
  const [customGrams, setCustomGrams] = useState(
    profile.useCustomTarget && profile.customTargetGrams ? profile.customTargetGrams.toString() : ''
  );
  const [saveNoteVisible, setSaveNoteVisible] = useState(false);
  const [sexModalVisible, setSexModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoTopic, setInfoTopic] = useState<'sex' | 'age' | 'weight' | 'general'>('general');

  useEffect(() => {
    setSex(profile.biologicalSex === 'male' ? 'male' : 'female');
    setAge(profile.age ? profile.age.toString() : '');
    setWeightUnit(profile.weightUnit || 'kg');
    setWeight(
      profile.weightKg
        ? (profile.weightUnit === 'lbs' ? Math.round(profile.weightKg * 2.20462).toString() : profile.weightKg.toString())
        : ''
    );
    setGoalType(profile.useCustomTarget ? 'custom' : (profile.goalType || 'standard'));
    setCustomGrams(
      profile.useCustomTarget && profile.customTargetGrams ? profile.customTargetGrams.toString() : ''
    );
  }, [profile]);

  // Target preview calculations
  const ageNum = parseInt(age, 10);
  const validAge = isNaN(ageNum) || ageNum <= 0 ? 30 : ageNum;

  const weightNum = parseFloat(weight);
  const weightInKg = !isNaN(weightNum) && weightNum > 0
    ? (weightUnit === 'lbs' ? weightNum / 2.20462 : weightNum)
    : profile.weightKg;

  const standardPreview = calculateStandardTarget(sex, validAge);
  const weightAdjustedPreview = weightInKg
    ? calculateWeightAdjustedTarget(weightInKg)
    : Math.round(standardPreview);

  const customNum = parseFloat(customGrams);
  const activeGoalPreview =
    goalType === 'custom'
      ? (!isNaN(customNum) && customNum > 0 ? customNum : 0)
      : goalType === 'weight_adjusted' && weightInKg
      ? weightAdjustedPreview
      : standardPreview;

  const sexOptions: { label: string; value: BiologicalSex }[] = [
    { label: 'Female', value: 'female' },
    { label: 'Male', value: 'male' },
  ];

  const currentSexLabel = sexOptions.find((o) => o.value === sex)?.label || 'Female';

  const handleSave = async () => {
    const parsedAge = parseInt(age, 10);
    if (!age.trim() || isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      Alert.alert('Age Required', 'Please enter a valid age between 1 and 120.');
      return;
    }

    if (goalType === 'weight_adjusted') {
      const parsedWeight = parseFloat(weight);
      if (!weight.trim() || isNaN(parsedWeight) || parsedWeight <= 0) {
        Alert.alert('Weight Required', 'Please enter your body weight to calculate your Body Weight-Tailored goal.');
        return;
      }
    }

    if (goalType === 'custom') {
      const parsedCustom = parseFloat(customGrams);
      if (!customGrams.trim() || isNaN(parsedCustom) || parsedCustom <= 0) {
        Alert.alert('Custom Goal Required', 'Please enter your target daily fiber in grams.');
        return;
      }
    }

    const finalGrams =
      goalType === 'custom'
        ? Math.round(parseFloat(customGrams))
        : goalType === 'weight_adjusted' && weightInKg
        ? weightAdjustedPreview
        : standardPreview;

    await updateProfile({
      biologicalSex: sex,
      age: parsedAge,
      weightKg: weightInKg ? Math.round(weightInKg * 10) / 10 : undefined,
      weightUnit,
      goalType,
      useCustomTarget: goalType === 'custom',
      customTargetGrams: finalGrams,
    });

    setSaveNoteVisible(true);
    setTimeout(() => {
      setSaveNoteVisible(false);
      navigation.navigate('Today');
    }, 400);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopBar title="FiberSnap" subtitle="Fiber, in a snap." showGoalBadge={true} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Set Your Goal</Text>
          <Text style={[styles.hint, { color: colors.inkSoft }]}>
            We suggest a daily fiber target using Adequate Intake (AI) nutritional guidelines based on your biological sex and age. You can also customize your number anytime.
          </Text>

          {/* Biological Sex with (i) Info Button */}
          <View style={styles.labelWithInfoRow}>
            <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>BIOLOGICAL SEX</Text>
            <TouchableOpacity
              onPress={() => {
                setInfoTopic('sex');
                setInfoModalVisible(true);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.labelInfoBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={17} color={colors.accentDeep} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.selectBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            onPress={() => setSexModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.selectText, { color: colors.ink }]}>{currentSexLabel}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.inkSoft} />
          </TouchableOpacity>

          {/* Age Input with (i) Info Button */}
          <View style={styles.labelWithInfoRow}>
            <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>AGE</Text>
            <TouchableOpacity
              onPress={() => {
                setInfoTopic('age');
                setInfoModalVisible(true);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.labelInfoBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={17} color={colors.accentDeep} />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <TextInput
              style={[styles.inputEl, { color: colors.ink }]}
              placeholder="e.g. 30"
              placeholderTextColor={colors.inkFaint}
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />
            <View style={styles.spinnerIconCol}>
              <Ionicons name="caret-up" size={10} color={colors.inkSoft} />
              <Ionicons name="caret-down" size={10} color={colors.inkSoft} />
            </View>
          </View>

          {/* Body Weight Input: Appears right below Age when Body-Weight Tailored is selected */}
          {goalType === 'weight_adjusted' && (
            <View style={{ marginTop: 14 }}>
              <View style={styles.labelWithInfoRow}>
                <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>BODY WEIGHT</Text>
                <TouchableOpacity
                  onPress={() => {
                    setInfoTopic('weight');
                    setInfoModalVisible(true);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.labelInfoBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="information-circle-outline" size={17} color={colors.accentDeep} />
                </TouchableOpacity>
              </View>

              <View style={styles.weightRow}>
                <View style={[styles.inputContainer, styles.weightFieldContainer, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                  <Ionicons name="scale-outline" size={18} color={colors.inkSoft} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.inputEl, { color: colors.ink }]}
                    placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                    placeholderTextColor={colors.inkFaint}
                    keyboardType="decimal-pad"
                    value={weight}
                    onChangeText={setWeight}
                    maxLength={5}
                  />
                </View>

                <View style={[styles.unitToggleBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.unitBtn, weightUnit === 'kg' && { backgroundColor: colors.accent }]}
                    onPress={() => {
                      if (weightUnit === 'lbs' && weight) {
                        const w = parseFloat(weight);
                        if (!isNaN(w)) setWeight(Math.round(w / 2.20462).toString());
                      }
                      setWeightUnit('kg');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.unitBtnText, { color: weightUnit === 'kg' ? '#FFFFFF' : colors.inkSoft }]}>kg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.unitBtn, weightUnit === 'lbs' && { backgroundColor: colors.accent }]}
                    onPress={() => {
                      if (weightUnit === 'kg' && weight) {
                        const w = parseFloat(weight);
                        if (!isNaN(w)) setWeight(Math.round(w * 2.20462).toString());
                      }
                      setWeightUnit('lbs');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.unitBtnText, { color: weightUnit === 'lbs' ? '#FFFFFF' : colors.inkSoft }]}>lbs</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {weightInKg ? (
                <Text style={[styles.weightHint, { color: colors.accentDeep }]}>
                  Personalized target: {typeof weightAdjustedPreview === 'number' ? weightAdjustedPreview.toFixed(1) : weightAdjustedPreview}g/day (0.4g/kg dietary guideline).
                </Text>
              ) : (
                <Text style={[styles.weightHint, { color: colors.inkSoft }]}>
                  Enter your body weight above to calculate your personalized goal.
                </Text>
              )}
            </View>
          )}

          {/* Recommendation Box with "i" Info Button */}
          <View style={[styles.recommendBox, { backgroundColor: colors.accentSoft }]}>
            <View style={styles.recommendHeaderRow}>
              <Text style={[styles.recommendLabel, { color: colors.accentDeep }]}>
                {goalType === 'custom' ? 'CUSTOM DAILY GOAL' : 'RECOMMENDED DAILY GOAL'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setInfoTopic('general');
                  setInfoModalVisible(true);
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={[styles.infoCircle, { backgroundColor: colors.surface }]}
                activeOpacity={0.8}
              >
                <Ionicons name="information-circle-outline" size={18} color={colors.accentDeep} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.recommendNum, { color: colors.accentDeep }]}>
              {goalType === 'custom'
                ? (activeGoalPreview > 0 ? `${Math.round(activeGoalPreview)}g` : '—')
                : goalType === 'weight_adjusted'
                ? (weightInKg ? `${typeof activeGoalPreview === 'number' ? activeGoalPreview.toFixed(1) : activeGoalPreview}g` : '—')
                : `${Math.round(activeGoalPreview)}g`}
            </Text>
            <Text style={[styles.recommendSubText, { color: colors.accentDeep }]}>
              {goalType === 'custom'
                ? (activeGoalPreview > 0
                    ? 'Your personalized custom daily fiber intake target.'
                    : 'Enter your custom daily fiber target below.')
                : goalType === 'weight_adjusted'
                ? (weightInKg
                    ? `Body Weight-Tailored: Scaled to ${weight ? `${weight}${weightUnit}` : 'your'} body weight (~0.4g/kg).`
                    : 'Body Weight-Tailored: Enter your weight to calculate your personalized goal.')
                : `Standard Target (Recommended) for ${sex === 'female' ? 'women' : 'men'} (${validAge <= 50 ? '≤50' : '51+'} yrs).`}
            </Text>
          </View>

          {/* Goal Method Selector: Standard Target vs Body Weight-Tailored vs Custom */}
          <View style={{ marginTop: 18 }}>
            <Text style={[styles.fieldLabel, { color: colors.inkSoft, marginBottom: 8 }]}>
              CHOOSE GOAL METHOD
            </Text>

            {/* 1. Standard Target (Recommended Default) */}
            <TouchableOpacity
              style={[
                styles.methodCard,
                {
                  backgroundColor: goalType === 'standard' ? colors.accentSoft : colors.surface2,
                  borderColor: goalType === 'standard' ? colors.accentDeep : colors.border,
                },
              ]}
              onPress={() => setGoalType('standard')}
              activeOpacity={0.8}
            >
              <View style={styles.methodRow}>
                <View style={[styles.radioCircle, { borderColor: goalType === 'standard' ? colors.accentDeep : colors.inkFaint }]}>
                  {goalType === 'standard' && <View style={[styles.radioDot, { backgroundColor: colors.accentDeep }]} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={[styles.methodTitle, { color: colors.ink }]}>Standard Target</Text>
                    <View style={[styles.badgeDefault, { backgroundColor: colors.accent }]}>
                      <Text style={styles.badgeDefaultText}>RECOMMENDED</Text>
                    </View>
                  </View>
                  <Text style={[styles.methodSubtitle, { color: colors.inkSoft }]}>
                    Based on age and sex from official dietary guidelines (14g / 1,000 kcal).
                  </Text>
                </View>
                <Text style={[styles.methodGrams, { color: colors.accentDeep }]}>{standardPreview}g</Text>
              </View>
            </TouchableOpacity>

            {/* 2. Body Weight-Tailored (Personalized Alternative) */}
            <TouchableOpacity
              style={[
                styles.methodCard,
                {
                  backgroundColor: goalType === 'weight_adjusted' ? colors.accentSoft : colors.surface2,
                  borderColor: goalType === 'weight_adjusted' ? colors.accentDeep : colors.border,
                  marginTop: 10,
                },
              ]}
              onPress={() => setGoalType('weight_adjusted')}
              activeOpacity={0.8}
            >
              <View style={styles.methodRow}>
                <View style={[styles.radioCircle, { borderColor: goalType === 'weight_adjusted' ? colors.accentDeep : colors.inkFaint }]}>
                  {goalType === 'weight_adjusted' && <View style={[styles.radioDot, { backgroundColor: colors.accentDeep }]} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={[styles.methodTitle, { color: colors.ink }]}>Body Weight-Tailored</Text>
                    <View style={[styles.badgeAlt, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.badgeAltText, { color: colors.inkSoft }]}>PERSONALIZED</Text>
                    </View>
                  </View>
                  <Text style={[styles.methodSubtitle, { color: colors.inkSoft }]}>
                    {weightInKg
                      ? `Calculated at ~0.4g fiber/kg for your ${weight}${weightUnit} body weight.`
                      : 'Scales daily fiber to ~0.4g per kg to match metabolic mass.'}
                  </Text>
                </View>
                <Text style={[styles.methodGrams, { color: colors.accentDeep }]}>
                  {weightInKg ? `${typeof weightAdjustedPreview === 'number' ? weightAdjustedPreview.toFixed(1) : weightAdjustedPreview}g` : 'Set Weight'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* 3. Custom Goal */}
            <TouchableOpacity
              style={[
                styles.methodCard,
                {
                  backgroundColor: goalType === 'custom' ? colors.accentSoft : colors.surface2,
                  borderColor: goalType === 'custom' ? colors.accentDeep : colors.border,
                  marginTop: 10,
                },
              ]}
              onPress={() => setGoalType('custom')}
              activeOpacity={0.8}
            >
              <View style={styles.methodRow}>
                <View style={[styles.radioCircle, { borderColor: goalType === 'custom' ? colors.accentDeep : colors.inkFaint }]}>
                  {goalType === 'custom' && <View style={[styles.radioDot, { backgroundColor: colors.accentDeep }]} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.methodTitle, { color: colors.ink }]}>Custom Goal</Text>
                  <Text style={[styles.methodSubtitle, { color: colors.inkSoft }]}>
                    Enter a personal target prescribed by your doctor or dietitian.
                  </Text>
                </View>
                <Text style={[styles.methodGrams, { color: colors.accentDeep }]}>
                  {customGrams.trim() && parseFloat(customGrams) > 0
                    ? `${Math.round(parseFloat(customGrams))}g`
                    : 'Set Grams'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Custom Input Field when custom is checked */}
            {goalType === 'custom' && (
              <View style={[styles.customWrap, { marginTop: 10 }]}>
                <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>CUSTOM GOAL (GRAMS)</Text>
                <TextInput
                  style={[
                    styles.inputEl,
                    styles.customInput,
                    { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink },
                  ]}
                  placeholder="e.g. 28"
                  placeholderTextColor={colors.inkFaint}
                  keyboardType="decimal-pad"
                  value={customGrams}
                  onChangeText={setCustomGrams}
                />
              </View>
            )}
          </View>

          {/* Save Goal Button - Full Width */}
          <View style={styles.saveWrap}>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: colors.accent }]}
              onPress={handleSave}
              activeOpacity={0.88}
            >
              <Text style={[styles.btnPrimaryText, { color: colors.accentInk }]}>
                Save goal
              </Text>
            </TouchableOpacity>

            {saveNoteVisible && (
              <View style={[styles.saveNoteBadge, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.accentDeep} />
                <Text style={[styles.saveNote, { color: colors.accentDeep }]}>
                  Goal saved successfully!
                </Text>
              </View>
            )}
          </View>

          {/* Medical Disclaimer */}
          <Text style={[styles.disclaimer, { color: colors.inkFaint }]}>
            General wellness guidance, not medical advice. If you have a digestive condition or are increasing fiber significantly, raise your intake gradually and drink plenty of water — check with a healthcare provider if unsure.
          </Text>
        </View>
      </ScrollView>

      {/* Sex Picker Modal */}
      <Modal
        visible={sexModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSexModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSexModalVisible(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.ink }]}>Select Biological Sex</Text>
            {sexOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.modalOption,
                  { borderBottomColor: colors.border },
                  sex === opt.value && { backgroundColor: colors.accentSoft },
                ]}
                onPress={() => {
                  setSex(opt.value);
                  setSexModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: colors.ink },
                    sex === opt.value && { color: colors.accentDeep, fontWeight: '700' },
                  ]}
                >
                  {opt.label}
                </Text>
                {sex === opt.value && (
                  <Ionicons name="checkmark" size={18} color={colors.accentDeep} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* "i" Guideline Citation Info Modal */}
      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setInfoModalVisible(false)}
        >
          <View style={[styles.modalCard, styles.infoModalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoHeaderRow}>
              <View style={[styles.infoIconWrap, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="school-outline" size={20} color={colors.accentDeep} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.ink, flex: 1, marginBottom: 0 }]}>
                {infoTopic === 'sex'
                  ? 'Biological Sex & Fiber Targets'
                  : infoTopic === 'age'
                  ? 'Age & Fiber Intake Science'
                  : infoTopic === 'weight'
                  ? 'Body Weight & Fiber Intake'
                  : 'Target Recommendation Science'}
              </Text>
              <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.inkSoft} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 12 }}>
              {infoTopic === 'sex' ? (
                <>
                  <Text style={[styles.infoParagraph, { color: colors.ink }]}>
                    The Institute of Medicine (IOM) sets fiber guidelines based on caloric requirements (<Text style={{ fontWeight: '700', color: colors.accentDeep }}>14g per 1,000 kcal</Text>).
                  </Text>
                  <Text style={[styles.infoParagraph, { color: colors.inkSoft, marginTop: 8 }]}>
                    Because adult males typically have higher lean muscle mass and greater median caloric expenditure (~2,600–3,000 kcal/day) compared to adult females (~1,800–2,200 kcal/day), the baseline Adequate Intake (AI) is established at <Text style={{ fontWeight: '700', color: colors.ink }}>38g/day for men</Text> and <Text style={{ fontWeight: '700', color: colors.ink }}>25g/day for women</Text>.
                  </Text>
                  <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2, marginTop: 10 }]}>
                    <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Scientific Reference:</Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                      • <Text style={{ fontWeight: '700', color: colors.ink }}>Institute of Medicine (IOM):</Text> Food and Nutrition Board Dietary Reference Intakes (2005).
                    </Text>
                  </View>
                </>
              ) : infoTopic === 'age' ? (
                <>
                  <Text style={[styles.infoParagraph, { color: colors.ink }]}>
                    Fiber intake recommendations adjust after age 50 from <Text style={{ fontWeight: '700', color: colors.accentDeep }}>38g to 30g/day</Text> for men, and from <Text style={{ fontWeight: '700', color: colors.accentDeep }}>25g to 21g/day</Text> for women.
                  </Text>
                  <Text style={[styles.infoParagraph, { color: colors.inkSoft, marginTop: 8 }]}>
                    This shift accounts for natural age-related changes in daily energy expenditure, preserving the standard 14g/1,000 kcal dietary ratio across the lifespan.
                  </Text>
                  <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2, marginTop: 10 }]}>
                    <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Scientific Reference:</Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                      • <Text style={{ fontWeight: '700', color: colors.ink }}>Institute of Medicine (IOM):</Text> Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, and Amino Acids (National Academies Press, 2005).
                    </Text>
                  </View>
                </>
              ) : infoTopic === 'weight' ? (
                <>
                  <Text style={[styles.infoParagraph, { color: colors.ink }]}>
                    How does body weight influence dietary fiber requirements?
                  </Text>
                  <Text style={[styles.infoParagraph, { color: colors.inkSoft, marginTop: 8 }]}>
                    Because official dietary fiber targets are formulated on energy expenditure (<Text style={{ fontWeight: '700', color: colors.accentDeep }}>14g fiber per 1,000 kcal consumed</Text>), individuals with higher body weights naturally expend and consume more total calories.
                  </Text>
                  <Text style={[styles.infoParagraph, { color: colors.inkSoft, marginTop: 8 }]}>
                    Nutritional guidelines commonly calculate a tailored fiber intake of <Text style={{ fontWeight: '700', color: colors.ink }}>0.35g to 0.45g per kilogram of body weight</Text> (~0.18g–0.20g/lb). Entering your weight allows FiberSnap to scale your recommended target to match your everyday nutritional needs.
                  </Text>

                  <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2, marginTop: 8 }]}>
                    <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Nutritional Research & Evidence:</Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                      • <Text style={{ fontWeight: '700', color: colors.ink }}>Howarth et al. (Nutr Rev):</Text> +14g/day fiber supports healthy satiety and daily calorie balance.
                    </Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                      • <Text style={{ fontWeight: '700', color: colors.ink }}>Slavin (Nutrition):</Text> Confirms daily caloric burn scales with body mass, validating ~0.4g/kg tailored targets.
                    </Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>
                      • <Text style={{ fontWeight: '700', color: colors.ink }}>Mozaffarian et al. (NEJM):</Text> 20-year study of 120,877 adults found fiber is a top factor supporting long-term healthy weight management.
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.infoParagraph, { color: colors.ink }]}>
                    Your suggested daily target of <Text style={{ fontWeight: '700', color: colors.accentDeep }}>{standardPreview}g</Text> is grounded in the <Text style={{ fontWeight: '700' }}>Institute of Medicine (IOM) Dietary Reference Intakes (DRI)</Text> and USDA Dietary Guidelines for Americans.
                  </Text>

                  <View style={[styles.guidelineGridBox, { backgroundColor: colors.surface2 }]}>
                    <Text style={[styles.gridBoxTitle, { color: colors.ink }]}>Official IOM DRI Targets:</Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>• Women (19–50 yrs): <Text style={{ fontWeight: '700', color: colors.ink }}>25g / day</Text></Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>• Women (51+ yrs): <Text style={{ fontWeight: '700', color: colors.ink }}>21g / day</Text></Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>• Men (19–50 yrs): <Text style={{ fontWeight: '700', color: colors.ink }}>38g / day</Text></Text>
                    <Text style={[styles.gridBoxRow, { color: colors.inkSoft }]}>• Men (51+ yrs): <Text style={{ fontWeight: '700', color: colors.ink }}>30g / day</Text></Text>
                  </View>

                  <Text style={[styles.infoParagraph, { color: colors.inkSoft, marginTop: 8 }]}>
                    Published research in <Text style={{ fontStyle: 'italic' }}>The Lancet (Reynolds et al., 2019)</Text> shows that achieving 25g–35g of dietary fiber daily is strongly linked to long-term health, digestive vitality, and overall wellness.
                  </Text>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.citationNavBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                setInfoModalVisible(false);
                navigation.navigate('Citations', {
                  category: infoTopic === 'weight' ? 'weight' : 'guidelines',
                });
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
  content: {
    padding: 16,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontFamily: FONTS.serif,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  labelWithInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 6,
  },
  labelInfoBtn: {
    padding: 2,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  selectBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputEl: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
  },
  spinnerIconCol: {
    gap: 2,
    paddingLeft: 8,
  },
  recommendBox: {
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  recommendHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recommendLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  infoCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendNum: {
    fontFamily: FONTS.serif,
    fontSize: 34,
    fontWeight: '700',
    marginVertical: 4,
  },
  recommendSubText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.85,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  customWrap: {
    marginTop: 10,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  saveWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 22,
    gap: 8,
  },
  btnPrimary: {
    width: '100%',
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  btnPrimaryText: {
    fontWeight: '700',
    fontSize: 15,
  },
  saveNoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveNote: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  infoModalCard: {
    maxWidth: 380,
    maxHeight: '82%',
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: FONTS.serif,
    fontSize: 16.5,
    fontWeight: '700',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalOptionText: {
    fontSize: 14,
  },
  infoParagraph: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  guidelineGridBox: {
    borderRadius: 10,
    padding: 12,
    gap: 5,
    marginVertical: 6,
  },
  gridBoxTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  gridBoxRow: {
    fontSize: 12,
    lineHeight: 17,
  },
  citationNavBtn: {
    width: '100%',
    borderRadius: RADIUS.pill,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  citationNavBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  methodCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    padding: 12,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  methodTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  methodSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  methodGrams: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: FONTS.serif,
    minWidth: 44,
    textAlign: 'right',
  },
  badgeDefault: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeDefaultText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  badgeAlt: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeAltText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  weightFieldContainer: {
    flex: 1,
  },
  unitToggleBox: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    height: 48,
    alignItems: 'center',
  },
  unitBtn: {
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  weightHint: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
});
