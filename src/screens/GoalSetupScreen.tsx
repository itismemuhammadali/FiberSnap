import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { BiologicalSex, calculateStandardTarget, calculateWeightAdjustedTarget, calculateDailyTarget } from '../constants/guidelines';
import { LogoMark } from '../components/LogoMark';
import { AiConsentModal } from '../components/AiConsentModal';
import { StorageService } from '../services/storage';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';

export const GoalSetupScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, profile, updateProfile } = useApp();
  const isEditingFromSettings = navigation.canGoBack();

  const [sex, setSex] = useState<BiologicalSex>(profile.biologicalSex || 'female');
  const [age, setAge] = useState(profile.age ? profile.age.toString() : '28');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(profile.weightUnit || 'kg');
  const [weight, setWeight] = useState(
    profile.weightKg
      ? (profile.weightUnit === 'lbs' ? Math.round(profile.weightKg * 2.20462).toString() : profile.weightKg.toString())
      : ''
  );
  const [goalType, setGoalType] = useState<'standard' | 'weight_adjusted' | 'custom'>(
    profile.useCustomTarget ? 'custom' : (profile.goalType || 'standard')
  );
  const [customGrams, setCustomGrams] = useState(
    profile.useCustomTarget && profile.customTargetGrams ? profile.customTargetGrams.toString() : ''
  );
  const [saving, setSaving] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoTopic, setInfoTopic] = useState<'sex' | 'age' | 'weight' | 'general'>('general');

  const ageNum = parseInt(age, 10);
  const validAge = isNaN(ageNum) || ageNum <= 0 ? 30 : ageNum;

  const weightNum = parseFloat(weight);
  const weightInKg = !isNaN(weightNum) && weightNum > 0
    ? (weightUnit === 'lbs' ? weightNum / 2.20462 : weightNum)
    : undefined;

  const standardGrams = calculateStandardTarget(sex, validAge);
  const weightAdjustedGrams = weightInKg ? calculateWeightAdjustedTarget(weightInKg) : Math.round(standardGrams);

  const customNum = parseFloat(customGrams);
  const activeGoal =
    goalType === 'custom'
      ? (!isNaN(customNum) && customNum > 0 ? customNum : 0)
      : goalType === 'weight_adjusted' && weightInKg
      ? weightAdjustedGrams
      : standardGrams;

  const sexOptions: { label: string; value: BiologicalSex; icon: 'female' | 'male' }[] = [
    { label: 'Female', value: 'female', icon: 'female' },
    { label: 'Male', value: 'male', icon: 'male' },
  ];

  const [showConsentModal, setShowConsentModal] = useState(false);

  const handleFinish = async () => {
    // 1. Validate Age
    const parsedAge = parseInt(age, 10);
    if (!age.trim() || isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      Alert.alert('Age Required', 'Please enter a valid age between 1 and 120.');
      return;
    }

    // 2. Validate Body Weight if Body Weight-Tailored selected
    if (goalType === 'weight_adjusted') {
      if (!weight.trim() || !weightInKg || isNaN(weightInKg) || weightInKg <= 0) {
        Alert.alert(
          'Weight Required',
          'Please enter your body weight to calculate your Body Weight-Tailored daily fiber target.'
        );
        return;
      }
    }

    // 3. Validate Custom Target if Custom selected
    if (goalType === 'custom') {
      const parsedCustom = parseFloat(customGrams);
      if (!customGrams.trim() || isNaN(parsedCustom) || parsedCustom <= 0) {
        Alert.alert(
          'Target Required',
          'Please enter your custom daily fiber target in grams.'
        );
        return;
      }
    }

    setSaving(true);
    try {
      const finalGrams =
        goalType === 'custom'
          ? Math.round(parseFloat(customGrams))
          : goalType === 'weight_adjusted' && weightInKg
          ? weightAdjustedGrams
          : standardGrams;

      await updateProfile({
        biologicalSex: sex,
        age: parsedAge,
        weightKg: weightInKg ? Math.round(weightInKg * 10) / 10 : undefined,
        weightUnit,
        goalType,
        useCustomTarget: goalType === 'custom',
        customTargetGrams: finalGrams,
        hasCompletedOnboarding: true,
      });

      if (isEditingFromSettings) {
        Alert.alert('Goal Saved', 'Your daily fiber target and profile have been updated.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Today' }] } }],
        });
        return;
      }

      // Show Apple-compliant AI consent prompt
      setShowConsentModal(true);
    } catch (err) {
      console.warn('Could not save goal profile:', err);
      if (isEditingFromSettings) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Today' }] } }],
        });
      } else {
        setShowConsentModal(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConsentChoice = async (consented: boolean) => {
    setShowConsentModal(false);
    await StorageService.setLoggedIn(true);
    await updateProfile({ hasGivenAiConsent: consented, hasCompletedOnboarding: true });
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Today' }] } }],
    });
  };

  const handleSkip = async () => {
    await StorageService.setLoggedIn(true);
    await updateProfile({ hasCompletedOnboarding: true });
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Today' }] } }],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 20) + 12,
              paddingBottom: Math.max(insets.bottom, 20) + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Step / Back & Skip */}
          <View style={styles.navRow}>
            {isEditingFromSettings ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtnRow}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color={colors.ink} />
                <Text style={[styles.backBtnText, { color: colors.ink }]}>Back to Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.stepBadge, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Text style={[styles.stepText, { color: colors.accentDeep }]}>STEP 2 OF 2 • PERSONALIZATION</Text>
              </View>
            )}
            {!isEditingFromSettings && (
              <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                <Text style={[styles.skipText, { color: colors.inkSoft }]}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Hero Branding */}
          <View style={styles.hero}>
            <LogoMark size={52} showWordmark={true} showTagline={false} fontSize={22} />
            <Text style={[styles.title, { color: colors.ink }]}>
              {isEditingFromSettings ? 'Edit Your Fiber Goal' : 'Set Your Daily Fiber Goal'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
              {isEditingFromSettings
                ? 'Update your personal parameters, body weight, or custom target anytime.'
                : 'Tailor your daily intake recommendation based on your profile, or enter a custom target.'}
            </Text>
          </View>

          {/* Recommended Target Preview Card */}
          <View style={[styles.targetCard, { backgroundColor: colors.accentSoft, borderColor: colors.accentDeep }]}>
            <View style={styles.targetCardHeader}>
              <Text style={[styles.targetCardLabel, { color: colors.accentDeep }]}>RECOMMENDED TARGET</Text>
              <TouchableOpacity
                onPress={() => {
                  setInfoTopic('general');
                  setInfoModalVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.labelInfoBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="information-circle-outline" size={16} color={colors.accentDeep} />
              </TouchableOpacity>
            </View>
            <View style={styles.targetBigRow}>
              <Text style={[styles.targetBigNum, { color: colors.accentDeep }]}>
                {goalType === 'custom'
                  ? (activeGoal > 0 ? Math.round(activeGoal) : '—')
                  : goalType === 'weight_adjusted'
                  ? (weightInKg ? (typeof activeGoal === 'number' ? activeGoal.toFixed(1) : activeGoal) : '—')
                  : Math.round(activeGoal)}
              </Text>
              <Text style={[styles.targetBigUnit, { color: colors.accentDeep }]}>g / day</Text>
            </View>
            <Text style={[styles.targetExplanation, { color: colors.inkSoft }]}>
              {goalType === 'custom'
                ? (activeGoal > 0 ? 'Using your custom personalized daily target.' : 'Enter your custom daily fiber target below.')
                : goalType === 'weight_adjusted'
                ? (weightInKg
                    ? `Body Weight-Tailored: Scaled to ${weight}${weightUnit} body weight (~0.4g/kg).`
                    : 'Body Weight-Tailored: Enter your weight below to calculate your goal.')
                : `Standard Target (Recommended) for ${sex === 'female' ? 'women' : 'men'} aged ${validAge}.`}
            </Text>
          </View>

          {/* Setup Form Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Biological Sex Options with Info Button */}
            <View style={styles.labelWithInfoRow}>
              <Text style={[styles.inputLabel, { color: colors.inkSoft, marginBottom: 0 }]}>BIOLOGICAL SEX</Text>
              <TouchableOpacity
                onPress={() => {
                  setInfoTopic('sex');
                  setInfoModalVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.labelInfoBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="information-circle-outline" size={16} color={colors.accentDeep} />
              </TouchableOpacity>
            </View>
            <View style={styles.sexRow}>
              {sexOptions.map((opt) => {
                const selected = sex === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.sexChip,
                      {
                        backgroundColor: selected ? colors.accent : colors.surface2,
                        borderColor: selected ? colors.accentDeep : colors.border,
                      },
                    ]}
                    onPress={() => setSex(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={selected ? '#FFFFFF' : colors.inkSoft}
                    />
                    <Text
                      style={[
                        styles.sexChipText,
                        { color: selected ? '#FFFFFF' : colors.ink, fontWeight: selected ? '700' : '500' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Age Input with Info Button */}
            <View style={[styles.labelWithInfoRow, { marginTop: 18 }]}>
              <Text style={[styles.inputLabel, { color: colors.inkSoft, marginBottom: 0 }]}>AGE (YEARS)</Text>
              <TouchableOpacity
                onPress={() => {
                  setInfoTopic('age');
                  setInfoModalVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.labelInfoBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="information-circle-outline" size={16} color={colors.accentDeep} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Ionicons name="calendar-outline" size={18} color={colors.inkSoft} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, { color: colors.ink }]}
                placeholder="e.g. 29"
                placeholderTextColor={colors.inkFaint}
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
                maxLength={3}
              />
            </View>

            {/* Body Weight Input: Appears right below Age when Body-Weight Tailored is selected */}
            {goalType === 'weight_adjusted' && (
              <View style={[styles.weightInputBox, { backgroundColor: colors.surface2, borderColor: colors.border, marginTop: 18 }]}>
                <View style={styles.labelWithInfoRow}>
                  <Text style={[styles.inputLabel, { color: colors.inkSoft, marginBottom: 0 }]}>ENTER YOUR BODY WEIGHT</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setInfoTopic('weight');
                      setInfoModalVisible(true);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.labelInfoBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="information-circle-outline" size={16} color={colors.accentDeep} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.weightRow, { marginTop: 8 }]}>
                  <View style={[styles.inputContainer, styles.weightInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="scale-outline" size={18} color={colors.inkSoft} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.input, { color: colors.ink }]}
                      placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                      placeholderTextColor={colors.inkFaint}
                      keyboardType="decimal-pad"
                      value={weight}
                      onChangeText={setWeight}
                      maxLength={5}
                    />
                  </View>
                  <View style={[styles.unitToggleBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                    Personalized goal: {typeof weightAdjustedGrams === 'number' ? weightAdjustedGrams.toFixed(1) : weightAdjustedGrams}g/day (0.4g/kg dietary guideline).
                  </Text>
                ) : (
                  <Text style={[styles.weightHint, { color: colors.inkSoft }]}>
                    Enter your body weight above to calculate your personalized goal.
                  </Text>
                )}
              </View>
            )}

            {/* Goal Method Selection */}
            <View style={[styles.methodSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.inputLabel, { color: colors.inkSoft, marginBottom: 10 }]}>
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
                <View style={styles.methodHeaderRow}>
                  <View style={styles.methodRadioRow}>
                    <View
                      style={[
                        styles.radioCircle,
                        { borderColor: goalType === 'standard' ? colors.accentDeep : colors.inkFaint },
                      ]}
                    >
                      {goalType === 'standard' && (
                        <View style={[styles.radioDot, { backgroundColor: colors.accentDeep }]} />
                      )}
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
                  </View>
                  <Text style={[styles.methodGrams, { color: colors.accentDeep }]}>{standardGrams}g</Text>
                </View>
              </TouchableOpacity>

              {/* 2. Body-Weight Tailored (Personalized Alternative) */}
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
                <View style={styles.methodHeaderRow}>
                  <View style={styles.methodRadioRow}>
                    <View
                      style={[
                        styles.radioCircle,
                        { borderColor: goalType === 'weight_adjusted' ? colors.accentDeep : colors.inkFaint },
                      ]}
                    >
                      {goalType === 'weight_adjusted' && (
                        <View style={[styles.radioDot, { backgroundColor: colors.accentDeep }]} />
                      )}
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
                          : 'Scales daily fiber to ~0.4g per kg to match your metabolic mass.'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.methodGrams, { color: colors.accentDeep }]}>
                    {weightInKg ? `${typeof weightAdjustedGrams === 'number' ? weightAdjustedGrams.toFixed(1) : weightAdjustedGrams}g` : 'Enter Weight'}
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
                <View style={styles.methodHeaderRow}>
                  <View style={styles.methodRadioRow}>
                    <View
                      style={[
                        styles.radioCircle,
                        { borderColor: goalType === 'custom' ? colors.accentDeep : colors.inkFaint },
                      ]}
                    >
                      {goalType === 'custom' && (
                        <View style={[styles.radioDot, { backgroundColor: colors.accentDeep }]} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.methodTitle, { color: colors.ink }]}>Custom Goal</Text>
                      <Text style={[styles.methodSubtitle, { color: colors.inkSoft }]}>
                        Enter a personal target prescribed by your doctor or dietitian.
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.methodGrams, { color: colors.accentDeep }]}>
                    {customGrams.trim() && parseFloat(customGrams) > 0 ? `${Math.round(parseFloat(customGrams))}g` : 'Set Grams'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Custom Input Block when custom is selected */}
              {goalType === 'custom' && (
                <View style={[styles.customInputBlock, { backgroundColor: colors.surface2, borderColor: colors.border, marginTop: 10 }]}>
                  <Text style={[styles.customInputLabel, { color: colors.inkSoft }]}>CUSTOM DAILY TARGET (GRAMS)</Text>
                  <View style={styles.customGramsRow}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => {
                        const current = parseFloat(customGrams) || 28;
                        const val = Math.max(5, current - 1);
                        setCustomGrams(val.toString());
                      }}
                    >
                      <Ionicons name="remove" size={18} color={colors.ink} />
                    </TouchableOpacity>

                    <TextInput
                      style={[styles.stepperInput, { color: colors.ink }]}
                      keyboardType="number-pad"
                      placeholder="e.g. 28"
                      placeholderTextColor={colors.inkFaint}
                      value={customGrams}
                      onChangeText={setCustomGrams}
                      maxLength={3}
                    />

                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => {
                        const current = parseFloat(customGrams) || 27;
                        const val = Math.min(100, current + 1);
                        setCustomGrams(val.toString());
                      }}
                    >
                      <Ionicons name="add" size={18} color={colors.ink} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}
            onPress={handleFinish}
            disabled={saving}
            activeOpacity={0.88}
          >
            <Text style={[styles.primaryButtonText, { color: colors.accentInk }]}>
              {saving ? 'Saving Your Goal...' : 'Confirm Goal & Start Tracking →'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
              <Text style={[styles.modalHeaderTitle, { color: colors.ink, flex: 1, fontFamily: FONTS.serif }]}>
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
                    Your suggested daily target of <Text style={{ fontWeight: '700', color: colors.accentDeep }}>{standardGrams}g</Text> is grounded in the <Text style={{ fontWeight: '700' }}>Institute of Medicine (IOM) Dietary Reference Intakes (DRI)</Text> and USDA Dietary Guidelines for Americans.
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

      <AiConsentModal
        visible={showConsentModal}
        onAgree={() => handleConsentChoice(true)}
        onDecline={() => handleConsentChoice(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  stepText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: FONTS.serif,
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  targetCard: {
    padding: 16,
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    marginBottom: 18,
    alignItems: 'center',
  },
  targetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  targetCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  targetBigRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  targetBigNum: {
    fontSize: 44,
    fontWeight: '900',
    fontFamily: FONTS.serif,
  },
  targetBigUnit: {
    fontSize: 18,
    fontWeight: '700',
  },
  targetExplanation: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    padding: 18,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    marginBottom: 22,
    ...SHADOWS.card,
  },
  labelWithInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelInfoBtn: {
    padding: 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sexRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sexChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 6,
  },
  sexChipText: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  customToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customToggleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  customToggleSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  customInputBlock: {
    marginTop: 14,
    padding: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  customInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  customGramsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: FONTS.serif,
    textAlign: 'center',
    minWidth: 60,
  },
  primaryButton: {
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    ...SHADOWS.card,
  },
  infoModalCard: {
    maxHeight: '80%',
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  infoParagraph: {
    fontSize: 13,
    lineHeight: 20,
  },
  guidelineGridBox: {
    padding: 12,
    borderRadius: RADIUS.md,
    marginVertical: 10,
  },
  gridBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  gridBoxRow: {
    fontSize: 12,
    lineHeight: 18,
  },
  citationNavBtn: {
    marginTop: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  citationNavBtnText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  backBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weightInputContainer: {
    flex: 1,
  },
  unitToggleBox: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  unitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  weightHint: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  weightInputBox: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 14,
    marginTop: 10,
  },
  methodSection: {
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  methodCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    padding: 13,
  },
  methodHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  methodRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
    fontSize: 14,
    fontWeight: '700',
  },
  methodSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
  methodGrams: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: FONTS.serif,
    minWidth: 46,
    textAlign: 'right',
  },
  badgeDefault: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeDefaultText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  badgeAlt: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeAltText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
