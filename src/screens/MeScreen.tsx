import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Modal,
  TextInput,
  Image,
  Switch,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { TopBar } from '../components/TopBar';
import { PaywallModal } from '../components/PaywallModal';
import { RateAppModal } from '../components/RateAppModal';
import { ManageSubscriptionModal } from '../components/ManageSubscriptionModal';
import { AiConsentModal } from '../components/AiConsentModal';
import { AuthService } from '../services/firebase';
import { StorageService } from '../services/storage';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';
import { CachedImage } from '../components/CachedImage';

export const MeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    colors,
    themeMode,
    setThemeMode,
    profile,
    updateProfile,
    dailyGoal,
    metrics,
    paywallVisible,
    setPaywallVisible,
    upgradeToPlus,
    exportData,
    clearUserData,
    clearAllData,
    signOut,
    syncWithCloud,
    setAiConsent,
  } = useApp();

  // Modals state
  const [avatarChoiceModalVisible, setAvatarChoiceModalVisible] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [deleteDataModalVisible, setDeleteDataModalVisible] = useState(false);
  const [manageSubVisible, setManageSubVisible] = useState(false);
  const [aiConsentModalVisible, setAiConsentModalVisible] = useState(false);

  // Avatar Photo Pickers (Camera & Gallery)
  const handleCameraAvatar = async () => {
    setAvatarChoiceModalVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Needed',
          'Please allow camera access in your device settings to take a profile photo.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        await updateProfile({ avatarUri: res.assets[0].uri });
      }
    } catch {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handleGalleryAvatar = async () => {
    setAvatarChoiceModalVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photos Permission Needed',
          'Please allow photo library access in your device settings to choose a profile picture.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        await updateProfile({ avatarUri: res.assets[0].uri });
      }
    } catch {
      Alert.alert('Error', 'Could not open photo gallery.');
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarChoiceModalVisible(false);
    await updateProfile({ avatarUri: undefined });
  };

  // Export / Download Data
  const handleExport = async () => {
    try {
      const json = await exportData();
      await Share.share({
        message: json,
        title: 'FiberSnap_Backup.json',
      });
    } catch {
      Alert.alert('Export Failed', 'Could not export backup data.');
    }
  };

  // Delete User Data Only (keep account credentials, wipe logs and goals)
  const handleExecuteDeleteData = async () => {
    try {
      await clearUserData();
      setDeleteDataModalVisible(false);
      Alert.alert(
        'User Data Deleted',
        'All your logged food entries, history, weight, and personalized fiber goals have been erased.\n\nYour account credentials (name and email) remain active. To continue using FiberSnap, please set up your fiber goal again.',
        [
          {
            text: 'Set Up Goal Now',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'GoalSetup' }],
              });
            },
          },
        ],
        { cancelable: false }
      );
    } catch {
      Alert.alert('Error', 'Could not delete data. Please try again.');
    }
  };

  // Delete Account Final Action (wipe all + sign out)
  const handleExecuteDeleteAccount = async () => {
    try {
      await AuthService.deleteAccount();
      await clearAllData();
      await signOut();
      setDeleteAccountModalVisible(false);
      Alert.alert('Account Deleted', 'Your account and all associated data have been permanently removed.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch {
      Alert.alert('Error', 'Could not delete account. Please try again.');
    }
  };

  // Sign Out Handler
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'default',
          onPress: async () => {
            await signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <TopBar title="FiberSnap" subtitle="Track dietary fiber, in a snap." showGoalBadge={true} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Profile Card matching user audio instructions */}
        <View style={[styles.card, styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Centered Circular Avatar with Camera Badge */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              style={[styles.avatarCircle, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}
              onPress={() => setAvatarChoiceModalVisible(true)}
              activeOpacity={0.85}
            >
              {profile.avatarUri ? (
                <CachedImage source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarInitials, { color: colors.accentDeep }]}>
                  {(profile.displayName || 'F').charAt(0).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cameraBadge, { backgroundColor: colors.accent, borderColor: colors.surface }]}
              onPress={() => setAvatarChoiceModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="camera" size={14} color={colors.accentInk} />
            </TouchableOpacity>
          </View>

          {/* User Name & Email */}
          <Text style={[styles.profileName, { color: colors.ink }]}>
            {profile.displayName || 'Fiber Explorer'}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.inkSoft }]}>
            {profile.email || 'guest@fibersnap.app'}
          </Text>

          {/* Key-Value Summary List */}
          <View style={styles.kvList}>
            <TouchableOpacity
              style={[styles.kvRow, { borderTopColor: colors.border }]}
              onPress={() => navigation.navigate('GoalSetup')}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.kvLabel, { color: colors.inkSoft }]}>Daily Goal</Text>
                <Ionicons name="pencil" size={12} color={colors.accentDeep} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.kvVal, { color: colors.accentDeep, fontWeight: '800' }]}>{dailyGoal}g</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.inkSoft} />
              </View>
            </TouchableOpacity>
            <View style={[styles.kvRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.kvLabel, { color: colors.inkSoft }]}>Days Tracked</Text>
              <Text style={[styles.kvVal, { color: colors.ink }]}>{metrics.totalDaysLogged}</Text>
            </View>
          </View>

          {/* Edit Goal & Personal Details Action Button */}
          <TouchableOpacity
            style={[styles.editGoalBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            onPress={() => navigation.navigate('GoalSetup')}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={16} color={colors.accentDeep} />
            <Text style={[styles.editGoalBtnText, { color: colors.accentDeep }]}>Edit Goals, Age, Sex & Weight</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance & Theme Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Appearance & Theme</Text>
          <Text style={[styles.hint, { color: colors.inkSoft }]}>
            Match the warm cream & sage palette or switch to deep dark mode.
          </Text>

          <View style={[styles.themeRow, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.themeBtn,
                themeMode === 'light' && [styles.themeBtnActive, { backgroundColor: colors.surface, borderColor: colors.accentDeep }],
              ]}
              onPress={() => setThemeMode('light')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="sunny-outline"
                size={18}
                color={themeMode === 'light' ? colors.accentDeep : colors.inkSoft}
              />
              <Text
                style={[
                  styles.themeBtnText,
                  { color: colors.inkSoft },
                  themeMode === 'light' && { color: colors.accentDeep, fontWeight: '700' },
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeBtn,
                themeMode === 'dark' && [styles.themeBtnActive, { backgroundColor: colors.surface, borderColor: colors.accentDeep }],
              ]}
              onPress={() => setThemeMode('dark')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="moon-outline"
                size={17}
                color={themeMode === 'dark' ? colors.accentDeep : colors.inkSoft}
              />
              <Text
                style={[
                  styles.themeBtnText,
                  { color: colors.inkSoft },
                  themeMode === 'dark' && { color: colors.accentDeep, fontWeight: '700' },
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeBtn,
                themeMode === 'system' && [styles.themeBtnActive, { backgroundColor: colors.surface, borderColor: colors.accentDeep }],
              ]}
              onPress={() => setThemeMode('system')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={17}
                color={themeMode === 'system' ? colors.accentDeep : colors.inkSoft}
              />
              <Text
                style={[
                  styles.themeBtnText,
                  { color: colors.inkSoft },
                  themeMode === 'system' && { color: colors.accentDeep, fontWeight: '700' },
                ]}
              >
                System
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Status Banner */}
        <View
          style={[
            styles.subBanner,
            {
              backgroundColor: profile.isPlusSubscriber ? colors.accentSoft : colors.surface2,
              borderColor: profile.isPlusSubscriber ? colors.accentDeep : colors.border,
            },
          ]}
        >
          <View style={styles.subBannerLeft}>
            <View
              style={[
                styles.subIconWrap,
                { backgroundColor: colors.accent },
              ]}
            >
              <Ionicons
                name={profile.isPlusSubscriber ? 'sparkles' : 'shield-checkmark-outline'}
                size={18}
                color={colors.accentInk}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.subTitle, { color: colors.ink }]}>
                {profile.isPlusSubscriber ? 'FiberSnap Plus Active' : 'Free Tier'}
              </Text>
              <Text style={[styles.subSubtitle, { color: colors.inkSoft }]}>
                {profile.isPlusSubscriber
                  ? `${(profile.subscriptionTier || 'annual') === 'monthly' ? 'Monthly Plan' : 'Annual Plan'} • Unlimited Gemini AI meal vision scans`
                  : '1 free AI meal vision scan remaining'}
              </Text>
            </View>
          </View>

          {profile.isPlusSubscriber ? (
            <TouchableOpacity
              style={[styles.manageBtn, { backgroundColor: colors.surface, borderColor: colors.accentDeep }]}
              onPress={() => setManageSubVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={13} color={colors.accentDeep} />
              <Text style={[styles.manageBtnText, { color: colors.accentDeep }]}>Manage</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.upgradeBtn, { backgroundColor: colors.accent }]}
              onPress={() => setPaywallVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.upgradeBtnText, { color: colors.accentInk }]}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* App Settings & Information Menu Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Settings & Information</Text>

          <View style={styles.menuList}>
            {/* Subscription & Billing Management */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                if (profile.isPlusSubscriber) {
                  setManageSubVisible(true);
                } else {
                  setPaywallVisible(true);
                }
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="card-outline" size={18} color={colors.accentDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: colors.ink }]}>Subscription & Billing</Text>
                <Text style={[styles.menuSubLabel, { color: colors.inkSoft }]}>
                  {profile.isPlusSubscriber ? 'FiberSnap Plus Active • Manage or cancel' : 'Free Tier • Upgrade to Plus'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.inkFaint} />
            </TouchableOpacity>

            {/* AI Meal Vision Consent (Apple Guideline Requirement) */}
            <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="sparkles-outline" size={19} color={colors.accentDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: colors.ink }]}>AI Meal Vision Consent</Text>
                <Text style={[styles.menuSubLabel, { color: colors.inkSoft }]}>
                  Allow Gemini AI to scan meal photos
                </Text>
              </View>
              <Switch
                value={profile.hasGivenAiConsent || false}
                onValueChange={async (val) => {
                  if (val) {
                    setAiConsentModalVisible(true);
                  } else {
                    await setAiConsent(false);
                    Alert.alert('AI Meal Vision Disabled', 'Gemini AI meal vision processing has been turned off.');
                  }
                }}
                trackColor={{
                  false: colors.isDark ? '#4A4A3E' : '#D1CEBF',
                  true: colors.accent,
                }}
                thumbColor={
                  profile.hasGivenAiConsent
                    ? '#FFFFFF'
                    : (colors.isDark ? '#A9A88F' : '#8A8778')
                }
                ios_backgroundColor={colors.isDark ? '#4A4A3E' : '#D1CEBF'}
              />
            </View>

            {/* About FiberSnap */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('About')}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="information-circle-outline" size={19} color={colors.accentDeep} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.ink }]}>About FiberSnap</Text>
              <Ionicons name="chevron-forward" size={17} color={colors.inkFaint} />
            </TouchableOpacity>

            {/* Notification Settings */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="notifications-outline" size={19} color={colors.accentDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: colors.ink }]}>Daily Reminders</Text>
                <Text style={[styles.menuSubLabel, { color: colors.inkSoft }]}>
                  {profile.dailyRemindersEnabled !== false
                    ? `Reminder at ${profile.reminderTime || '7:00 PM'}`
                    : 'Off'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.inkFaint} />
            </TouchableOpacity>

            {/* Scientific Citations & Research */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('Citations')}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="school-outline" size={18} color={colors.accentDeep} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.ink }]}>Scientific Citations & Research</Text>
              <Ionicons name="chevron-forward" size={17} color={colors.inkFaint} />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('PrivacyPolicy')}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.accentDeep} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.ink }]}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={17} color={colors.inkFaint} />
            </TouchableOpacity>

            {/* Terms of Service */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('Terms')}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="document-text-outline" size={18} color={colors.accentDeep} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.ink }]}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={17} color={colors.inkFaint} />
            </TouchableOpacity>

            {/* Rate the App */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => setRateModalVisible(true)}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="star-outline" size={18} color={colors.accentDeep} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.ink }]}>Rate the App</Text>
              <Ionicons name="chevron-forward" size={17} color={colors.inkFaint} />
            </TouchableOpacity>

            {/* Contact & Feedback */}
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate('Contact')}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="mail-outline" size={18} color={colors.accentDeep} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.ink }]}>Contact & Feedback</Text>
              <Ionicons name="chevron-forward" size={17} color={colors.inkFaint} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data & Backup Settings (Export Only - Import Removed) */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Data & Backup</Text>
          <Text style={[styles.hint, { color: colors.inkSoft }]}>
            Your dietary log is stored locally on this device. Download a backup copy anytime to keep your personal records safe.
          </Text>

          <TouchableOpacity
            style={[styles.btn, styles.btnOutline, { borderColor: colors.border, marginTop: 4 }]}
            onPress={handleExport}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={17} color={colors.ink} style={{ marginRight: 8 }} />
            <Text style={[styles.btnOutlineText, { color: colors.ink }]}>Download Data Backup</Text>
          </TouchableOpacity>
        </View>

        {/* Account Management & Data Deletion */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>Account & Data Management</Text>
          <Text style={[styles.hint, { color: colors.inkSoft }]}>
            Manage your session, clear your logged data, or permanently delete your account.
          </Text>

          <View style={styles.accountActionCol}>
            {/* Delete User Data Only (clears logs, keeps account active) */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: colors.surface2, borderColor: colors.border },
              ]}
              onPress={() => setDeleteDataModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-bin-outline" size={18} color={colors.ink} style={{ marginRight: 8 }} />
              <Text style={[styles.actionBtnText, { color: colors.ink }]}>Delete User Data</Text>
            </TouchableOpacity>

            {/* Sign Out Button */}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
              onPress={handleSignOut}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.ink} style={{ marginRight: 8 }} />
              <Text style={[styles.actionBtnText, { color: colors.ink }]}>Sign Out</Text>
            </TouchableOpacity>

            {/* Delete Account Button in RED */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.deleteBtn,
                { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
              ]}
              onPress={() => setDeleteAccountModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.actionBtnText, { color: colors.danger }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.inkSoft }]}>
            FiberSnap — a small tool for a simple habit.
          </Text>
          <Text style={[styles.footerMeta, { color: colors.inkFaint }]}>
            Version 1.0.0 • USDA FoodData Central & Gemini Vision
          </Text>
        </View>
      </ScrollView>

      {/* Profile Photo Source Choice Modal */}
      <Modal
        visible={avatarChoiceModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAvatarChoiceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setAvatarChoiceModalVisible(false)}
          />
          <View
            style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.alertIconWrap, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="camera" size={28} color={colors.accentDeep} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.ink, textAlign: 'center', marginBottom: 2 }]}>
              Profile Photo
            </Text>

            <Text style={[styles.deleteSubText, { color: colors.inkSoft, textAlign: 'center', marginBottom: 12 }]}>
              Choose how you would like to set your profile picture
            </Text>

            {/* Option 1: Take Photo */}
            <TouchableOpacity
              style={[styles.choiceBtn, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}
              onPress={handleCameraAvatar}
              activeOpacity={0.85}
            >
              <View style={[styles.choiceIconWrap, { backgroundColor: colors.accent }]}>
                <Ionicons name="camera" size={20} color={colors.accentInk} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.choiceTitle, { color: colors.ink }]}>Take Photo</Text>
                <Text style={[styles.choiceSub, { color: colors.inkSoft }]}>Use your camera</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
            </TouchableOpacity>

            {/* Option 2: Upload from Gallery */}
            <TouchableOpacity
              style={[styles.choiceBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
              onPress={handleGalleryAvatar}
              activeOpacity={0.85}
            >
              <View style={[styles.choiceIconWrap, { backgroundColor: colors.surface }]}>
                <Ionicons name="images" size={20} color={colors.accentDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.choiceTitle, { color: colors.ink }]}>Choose from Gallery</Text>
                <Text style={[styles.choiceSub, { color: colors.inkSoft }]}>Select from photo library</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
            </TouchableOpacity>

            {/* Optional Option: Remove Photo if currently set */}
            {Boolean(profile.avatarUri) && (
              <TouchableOpacity
                style={[styles.choiceBtn, { backgroundColor: colors.dangerSoft, borderColor: colors.danger }]}
                onPress={handleRemoveAvatar}
                activeOpacity={0.85}
              >
                <View style={[styles.choiceIconWrap, { backgroundColor: colors.surface }]}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.choiceTitle, { color: colors.danger }]}>Remove Photo</Text>
                  <Text style={[styles.choiceSub, { color: colors.inkSoft }]}>Revert to initial avatar</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.surface2, marginTop: 4 }]}
              onPress={() => setAvatarChoiceModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={{ color: colors.inkSoft, fontWeight: '600', fontSize: 14 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete User Data Confirmation Modal */}
      <Modal
        visible={deleteDataModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteDataModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.alertIconWrap, { backgroundColor: colors.surface2 }]}>
              <Ionicons name="trash-bin-outline" size={32} color={colors.ink} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.ink, textAlign: 'center' }]}>
              Delete User Data
            </Text>

            <Text style={[styles.deletePromptText, { color: colors.ink }]}>
              Before deleting your data, kindly download a backup if you wish to keep your records.
            </Text>

            <Text style={[styles.deleteSubText, { color: colors.inkSoft }]}>
              This will erase all logged foods and streak history. Your account and profile settings will remain active.
            </Text>

            {/* Download Data First */}
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline, { borderColor: colors.accent, marginBottom: 8 }]}
              onPress={handleExport}
              activeOpacity={0.85}
            >
              <Ionicons name="download-outline" size={18} color={colors.accentDeep} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.accentDeep, fontWeight: '700', fontSize: 14 }}>
                Download Data (Backup)
              </Text>
            </TouchableOpacity>

            {/* Delete Data Only */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.danger, marginBottom: 8 }]}
              onPress={handleExecuteDeleteData}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-bin-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                Delete Food Data Only
              </Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.surface2 }]}
              onPress={() => setDeleteDataModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={{ color: colors.inkSoft, fontWeight: '600', fontSize: 14 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteAccountModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.alertIconWrap, { backgroundColor: colors.dangerSoft }]}>
              <Ionicons name="warning-outline" size={32} color={colors.danger} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.danger, textAlign: 'center' }]}>
              Delete Account
            </Text>

            <Text style={[styles.deletePromptText, { color: colors.ink }]}>
              Before deleting your account, kindly download your data and then delete it.
            </Text>

            <Text style={[styles.deleteSubText, { color: colors.inkSoft }]}>
              This will permanently delete your account, login credentials, and all recorded data. This action cannot be reversed.
            </Text>

            {/* Download Data First */}
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline, { borderColor: colors.accent, marginBottom: 8 }]}
              onPress={handleExport}
              activeOpacity={0.85}
            >
              <Ionicons name="download-outline" size={18} color={colors.accentDeep} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.accentDeep, fontWeight: '700', fontSize: 14 }}>
                Download Data (Backup)
              </Text>
            </TouchableOpacity>

            {/* Permanent Account Delete */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.danger, marginBottom: 8 }]}
              onPress={handleExecuteDeleteAccount}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                Delete Account Now
              </Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.surface2 }]}
              onPress={() => setDeleteAccountModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={{ color: colors.inkSoft, fontWeight: '600', fontSize: 14 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rate App Interactive Pop-up */}
      {rateModalVisible && (
        <RateAppModal
          visible={rateModalVisible}
          onClose={() => setRateModalVisible(false)}
        />
      )}

      {/* Paywall Modal */}
      {paywallVisible && (
        <PaywallModal
          visible={paywallVisible}
          onClose={() => setPaywallVisible(false)}
          onUpgradeSuccess={() => {
            upgradeToPlus();
            Alert.alert('FiberSnap Plus Active', 'Welcome to unlimited AI scanning!');
          }}
        />
      )}

      {/* Manage Subscription Modal (Plan switch, upgrades & 1-tap store cancellation) */}
      {manageSubVisible && (
        <ManageSubscriptionModal
          visible={manageSubVisible}
          onClose={() => setManageSubVisible(false)}
          onSwitchPlan={() => setPaywallVisible(true)}
        />
      )}

      {/* Apple App Store AI Scanning Consent Modal */}
      {aiConsentModalVisible && (
        <AiConsentModal
          visible={aiConsentModalVisible}
          onAgree={async () => {
            setAiConsentModalVisible(false);
            await setAiConsent(true);
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status === 'granted') {
                Alert.alert(
                  'AI Meal Vision Enabled',
                  'AI meal vision is enabled and photo access is granted for scanning meal photos.'
                );
              } else {
                Alert.alert(
                  'AI Meal Vision Enabled',
                  'AI meal vision is enabled. Please allow photo library access when you upload meal photos.'
                );
              }
            } catch {
              Alert.alert('AI Meal Vision Enabled', 'Consent granted for Gemini AI meal vision scanning.');
            }
          }}
          onDecline={() => {
            setAiConsentModalVisible(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    gap: 14,
    ...SHADOWS.card,
  },
  profileCard: {
    alignItems: 'center',
    paddingTop: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 43,
  },
  avatarInitials: {
    fontFamily: FONTS.serif,
    fontSize: 34,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: -4,
  },
  kvList: {
    width: '100%',
    marginTop: 12,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  kvLabel: {
    fontSize: 13,
  },
  kvVal: {
    fontFamily: FONTS.serif,
    fontSize: 13.5,
    fontWeight: '700',
  },
  editGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: 14,
    width: '100%',
  },
  editGoalBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  themeRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeBtnActive: {
    ...SHADOWS.soft,
  },
  themeBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  subBanner: {
    borderRadius: RADIUS.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    gap: 12,
  },
  subBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  subIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    fontWeight: '700',
  },
  subSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  upgradeBtn: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...SHADOWS.soft,
  },
  upgradeBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1.5,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  menuList: {
    gap: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  menuSubLabel: {
    fontSize: 11.5,
    marginTop: 1,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  btnOutlineText: {
    fontSize: 13,
    fontWeight: '600',
  },
  accountActionCol: {
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  footerText: {
    fontFamily: FONTS.serifItalic,
    fontSize: 13,
  },
  footerMeta: {
    fontSize: 11,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 22,
    gap: 12,
    ...SHADOWS.card,
  },
  alertIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  aboutDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  infoRowBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 13,
  },
  legalText: {
    fontSize: 13,
    lineHeight: 20,
  },
  feedbackInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13.5,
    height: 100,
    textAlignVertical: 'top',
  },
  deletePromptText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 21,
  },
  deleteSubText: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  choiceIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  choiceSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
