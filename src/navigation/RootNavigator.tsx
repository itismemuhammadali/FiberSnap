import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { GoalSetupScreen } from '../screens/GoalSetupScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { CitationsScreen } from '../screens/CitationsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { AuthService, auth } from '../services/firebase';
import { LogoMark } from '../components/LogoMark';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { colors } = useApp();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    async function determineInitialRoute() {
      try {
        // 1. Check 30-day inactivity limit per user requirement
        const session = await StorageService.checkAndTouchSession();
        if (session.isExpired) {
          console.log('Session expired due to 30 days inactivity. Forcing sign-out.');
          await AuthService.signOut();
          await StorageService.clearSession();
          setInitialRoute('Login');
          return;
        }

        // 2. Check local login flag and profile
        const isLoggedIn = await StorageService.isLoggedIn();
        const profile = await StorageService.getProfile();

        // 3. Wait briefly for Firebase Auth state restoration if marked logged in
        let fbUser = auth.currentUser;
        if (!fbUser && isLoggedIn) {
          fbUser = await new Promise<any>((resolve) => {
            const timeout = setTimeout(() => resolve(auth.currentUser), 800);
            const unsub = AuthService.onAuthState((u: any) => {
              clearTimeout(timeout);
              unsub();
              resolve(u);
            });
          });
        }

        // Persistent Session: Keep user logged in like Instagram/Facebook until explicit sign-out
        const hasActiveAccount =
          isLoggedIn ||
          Boolean(fbUser) ||
          (profile.uid && !profile.uid.startsWith('guest_')) ||
          Boolean(profile.email);

        if (hasActiveAccount) {
          // Keep session touched and active
          await StorageService.setLoggedIn(true);
          await StorageService.checkAndTouchSession();
          setInitialRoute('MainTabs');
        } else {
          setInitialRoute('Login');
        }
      } catch {
        setInitialRoute('Login');
      }
    }

    determineInitialRoute();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <LogoMark size={114} showWordmark={true} showTagline={true} direction="column" fontSize={32} useImage={true} forceTheme="light" />
        <View style={{ marginTop: 28 }}>
          <ActivityIndicator size="small" color={colors.accentDeep} />
        </View>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="GoalSetup" component={GoalSetupScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Citations" component={CitationsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

