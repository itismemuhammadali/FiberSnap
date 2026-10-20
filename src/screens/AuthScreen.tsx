import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AuthService } from '../services/firebase';
import { LogoMark } from '../components/LogoMark';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

interface AuthScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ visible, onClose }) => {
  const { updateProfile } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = isSignUp
        ? await AuthService.signUpWithEmail(email, password, name)
        : await AuthService.signInWithEmail(email, password);

      await updateProfile(user);
      Alert.alert(
        'Welcome to FiberSnap!',
        isSignUp ? 'Your account has been created.' : 'Signed in successfully.'
      );
      onClose();
    } catch (e) {
      Alert.alert('Authentication Failed', 'Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const user =
        provider === 'google'
          ? await AuthService.signInWithGoogle()
          : await AuthService.signInWithApple();

      await updateProfile(user);
      Alert.alert('Success', `Signed in with ${provider === 'google' ? 'Google' : 'Apple'}.`);
      onClose();
    } catch (e) {
      Alert.alert('Sign-In Error', `Could not sign in with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.logoSection}>
              <LogoMark size={64} showWordmark={true} showTagline={true} direction="column" fontSize={26} />
              <Text style={styles.authTitle}>
                {isSignUp ? 'Create your FiberSnap Account' : 'Welcome back to FiberSnap'}
              </Text>
              <Text style={styles.authSub}>
                Sync your daily intake, streaks, and AI scans across all devices.
              </Text>
            </View>

            {/* Social Logins */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.appleBtn}
                onPress={() => handleSocialSignIn('apple')}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-apple" size={20} color={COLORS.inkWhite} />
                <Text style={styles.appleBtnText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.googleBtn}
                onPress={() => handleSocialSignIn('google')}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Ionicons name="logo-google" size={18} color={COLORS.ink} />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor={COLORS.inkFaint}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.inkFaint}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.inkFaint}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleEmailAuth}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.inkWhite} size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Toggle Sign In / Sign Up */}
            <View style={styles.switchModeRow}>
              <Text style={styles.switchModePrompt}>
                {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}
              </Text>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.switchModeAction}>
                  {isSignUp ? ' Sign In' : ' Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardWrap: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceSubtle,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
    textAlign: 'center',
    marginTop: 14,
  },
  authSub: {
    fontSize: 13,
    color: COLORS.inkSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  socialButtons: {
    gap: 10,
    marginTop: 20,
  },
  appleBtn: {
    backgroundColor: '#000000',
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appleBtnText: {
    color: COLORS.inkWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  googleBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.soft,
  },
  googleBtnText: {
    color: COLORS.ink,
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
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: COLORS.inkFaint,
    fontWeight: '500',
  },
  form: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.inkSecondary,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.ink,
  },
  submitBtn: {
    backgroundColor: COLORS.peaDeep,
    borderRadius: RADIUS.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    ...SHADOWS.card,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.inkWhite,
  },
  switchModeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  switchModePrompt: {
    fontSize: 13,
    color: COLORS.inkSecondary,
  },
  switchModeAction: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.peaDeep,
  },
});
