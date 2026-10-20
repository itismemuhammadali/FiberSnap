import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { AuthService } from '../services/firebase';
import { StorageService } from '../services/storage';
import { LogoMark } from '../components/LogoMark';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';

export const SignupScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, profile, updateProfile, syncWithCloud } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your name, email, and password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Your password and confirmation password do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.signUpWithEmail(email, password, name.trim());
      await StorageService.setLoggedIn(true);
      await StorageService.checkAndTouchSession();
      await updateProfile({
        ...user,
        displayName: name.trim(),
        hasCompletedOnboarding: false,
      });
      await syncWithCloud();
      // Navigate to Step 2: Goal Setup (No tabs)
      navigation.navigate('GoalSetup');
    } catch (err: any) {
      let msg = 'Could not create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'The password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.message) {
        msg = err.message;
      }
      Alert.alert('Sign Up Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const user =
        provider === 'google'
          ? await AuthService.signInWithGoogle()
          : await AuthService.signInWithApple();

      await StorageService.setLoggedIn(true);
      await StorageService.checkAndTouchSession();
      await updateProfile(user);
      await syncWithCloud();

      if (user.hasCompletedOnboarding || (user.customTargetGrams && user.customTargetGrams > 0)) {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        navigation.navigate('GoalSetup');
      }
    } catch {
      Alert.alert('Authentication Failed', `Could not sign up with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 20) + 12,
              paddingBottom: Math.max(insets.bottom, 20) + 380,
              flexGrow: 1,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          alwaysBounceVertical={true}
          bounces={true}
          overScrollMode="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Back Button */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {/* Hero Branding */}
          <View style={styles.hero}>
            <LogoMark size={64} showWordmark={true} showTagline={false} direction="column" fontSize={26} useImage={true} />
            <Text style={[styles.title, { color: colors.ink }]}>Create Your Account</Text>
            <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
              Step 1 of 2: Create your credentials, then personalize your fiber goal.
            </Text>
          </View>

          {/* Social Logins */}
          <View style={styles.socialGroup}>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.appleButton}
                onPress={() => handleSocial('apple')}
                disabled={loading}
                activeOpacity={0.88}
              >
                <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
                <Text style={styles.appleButtonText}>Sign Up with Apple</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleSocial('google')}
              disabled={loading}
              activeOpacity={0.88}
            >
              <Ionicons name="logo-google" size={17} color={colors.ink} />
              <Text style={[styles.googleButtonText, { color: colors.ink }]}>
                Sign Up with Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerLabel, { color: colors.inkFaint }]}>or sign up with email</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.inkSoft }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink },
                ]}
                placeholder="Alex Morgan"
                placeholderTextColor={colors.inkFaint}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.inkSoft }]}>Email Address *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink },
                ]}
                placeholder="alex@example.com"
                placeholderTextColor={colors.inkFaint}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.inkSoft }]}>Password *</Text>
              <View
                style={[
                  styles.passwordContainer,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: colors.ink }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.inkFaint}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.inkSoft}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.inkSoft }]}>Confirm Password *</Text>
              <View
                style={[
                  styles.passwordContainer,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: colors.ink }]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.inkFaint}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signUpBtn, { backgroundColor: colors.accent }]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color={colors.accentInk} size="small" />
              ) : (
                <Text style={[styles.signUpBtnText, { color: colors.accentInk }]}>
                  Continue to Goal Setup →
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer to Login */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerPrompt, { color: colors.inkSoft }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.footerAction, { color: colors.accentDeep }]}>
                {' '}Log In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: FONTS.serif,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  socialGroup: {
    gap: 8,
    marginBottom: 14,
  },
  appleButton: {
    backgroundColor: '#000000',
    height: 48,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.card,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  googleButton: {
    height: 48,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.card,
  },
  googleButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    padding: 18,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    marginBottom: 22,
    ...SHADOWS.card,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },
  signUpBtn: {
    height: 50,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...SHADOWS.card,
  },
  signUpBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerPrompt: {
    fontSize: 14,
  },
  footerAction: {
    fontSize: 14,
    fontWeight: '700',
  },
});
