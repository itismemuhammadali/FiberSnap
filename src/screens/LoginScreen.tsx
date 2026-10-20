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

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, profile, updateProfile, syncWithCloud } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.signInWithEmail(email, password);
      await StorageService.setLoggedIn(true);
      await StorageService.checkAndTouchSession();
      await updateProfile(user);
      await syncWithCloud();

      // If user has completed onboarding or already has a goal set, go directly to MainTabs
      if (user.hasCompletedOnboarding || (user.customTargetGrams && user.customTargetGrams > 0)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        navigation.navigate('GoalSetup');
      }
    } catch (err: any) {
      let msg = 'Could not sign in. Please verify your email and password.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        msg = 'Invalid email or password. Please check your credentials or create an account.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.message) {
        msg = err.message;
      }
      Alert.alert('Sign In Failed', msg);
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

      // If user has completed onboarding or already has a goal set, go directly to MainTabs
      if (user.hasCompletedOnboarding || (user.customTargetGrams && user.customTargetGrams > 0)) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        navigation.navigate('GoalSetup');
      }
    } catch {
      Alert.alert('Authentication Failed', `Could not sign in with ${provider}.`);
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
              paddingBottom: Math.max(insets.bottom, 20) + 360,
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
          {/* Hero Branding */}
          <View style={styles.hero}>
            <LogoMark size={64} showWordmark={true} showTagline={true} direction="column" fontSize={26} useImage={true} />
            <Text style={[styles.title, { color: colors.ink }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
              Sign in to access your fiber logs, streaks, and AI scans.
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
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={styles.appleButtonText}>Sign In with Apple</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleSocial('google')}
              disabled={loading}
              activeOpacity={0.88}
            >
              <Ionicons name="logo-google" size={18} color={colors.ink} />
              <Text style={[styles.googleButtonText, { color: colors.ink }]}>
                Sign In with Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerLabel, { color: colors.inkFaint }]}>or with email</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.inkSoft }]}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.ink },
                ]}
                placeholder="name@example.com"
                placeholderTextColor={colors.inkFaint}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.inkSoft }]}>Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: colors.ink }]}
                  placeholder="••••••••"
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
                    size={20}
                    color={colors.inkFaint}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword', { email })}
              activeOpacity={0.7}
            >
              <Text style={[styles.forgotText, { color: colors.accentDeep }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInBtn, { backgroundColor: colors.accent }]}
              onPress={handleEmailSignIn}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color={colors.accentInk} size="small" />
              ) : (
                <Text style={[styles.signInBtnText, { color: colors.accentInk }]}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer to Sign Up */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerPrompt, { color: colors.inkSoft }]}>
              Don't have an account yet?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={[styles.footerAction, { color: colors.accentDeep }]}>
                {' '}Create Account
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
    paddingHorizontal: 22,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    marginVertical: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: FONTS.serif,
    marginTop: 14,
  },
  subtitle: {
    fontSize: 13.5,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 19,
    paddingHorizontal: 14,
  },
  socialGroup: {
    gap: 10,
    marginTop: 18,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  googleButton: {
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    ...SHADOWS.soft,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    ...SHADOWS.soft,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 6,
    marginTop: -4,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  signInBtn: {
    borderRadius: RADIUS.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 2,
  },
  signInBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerPrompt: {
    fontSize: 13.5,
  },
  footerAction: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
