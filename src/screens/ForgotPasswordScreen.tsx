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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { AuthService } from '../services/firebase';
import { LogoMark } from '../components/LogoMark';
import { RADIUS, SHADOWS, FONTS } from '../constants/theme';

export const ForgotPasswordScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useApp();

  const initialEmail = route.params?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendReset = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Email Required', 'Please enter your email address to receive the reset link.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.sendPasswordReset(trimmed);
      setEmailSent(true);
    } catch (err: any) {
      let msg = 'Could not send password reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No registered account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a few minutes before trying again.';
      } else if (err.message) {
        msg = err.message;
      }
      Alert.alert('Reset Failed', msg);
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
            <Text style={[styles.title, { color: colors.ink }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
              {emailSent
                ? 'Check your inbox for the reset link.'
                : 'Enter your registered email address and we will send you an official link to reset your password.'}
            </Text>
          </View>

          {emailSent ? (
            /* Success State Card */
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.successIconCircle, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="mail-unread-outline" size={36} color={colors.accentDeep} />
              </View>

              <Text style={[styles.successTitle, { color: colors.ink }]}>Email Sent!</Text>
              <Text style={[styles.successBody, { color: colors.inkSoft }]}>
                We sent a password reset link to:
              </Text>
              <Text style={[styles.successEmailHighlight, { color: colors.accentDeep }]}>
                {email.trim()}
              </Text>

              <Text style={[styles.successInstructions, { color: colors.inkFaint }]}>
                Click the link in the email to set a new password on Firebase's secure page. If you do not see the email, please check your spam or junk folder.
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.88}
              >
                <Text style={[styles.primaryBtnText, { color: colors.accentInk }]}>
                  Back to Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleSendReset}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.accentDeep} />
                ) : (
                  <Text style={[styles.resendBtnText, { color: colors.accentDeep }]}>
                    Resend Reset Email
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Email Input Card */
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.inkSoft }]}>Email Address</Text>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: colors.surface2, borderColor: colors.border },
                  ]}
                >
                  <Ionicons name="mail-outline" size={18} color={colors.inkFaint} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.ink }]}
                    placeholder="name@example.com"
                    placeholderTextColor={colors.inkFaint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                onPress={handleSendReset}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color={colors.accentInk} size="small" />
                ) : (
                  <Text style={[styles.primaryBtnText, { color: colors.accentInk }]}>
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Footer to Sign In */}
          {!emailSent && (
            <View style={styles.footerRow}>
              <Text style={[styles.footerPrompt, { color: colors.inkSoft }]}>
                Remembered your password?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.footerAction, { color: colors.accentDeep }]}>
                  {' '}Sign In
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: FONTS.serif,
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 22,
    marginBottom: 24,
    ...SHADOWS.card,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  primaryBtn: {
    height: 50,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: FONTS.serif,
  },
  successBody: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  successEmailHighlight: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  successInstructions: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  resendBtn: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerPrompt: {
    fontSize: 14,
  },
  footerAction: {
    fontSize: 14,
    fontWeight: '700',
  },
});
