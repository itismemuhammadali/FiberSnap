import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { FoodEntry, UserProfile, DaySummary, MonthSummary, ProgressMetrics } from '../types';
import { StorageService } from '../services/storage';
import { AuthService, CloudDbService, CloudStorageService, auth } from '../services/firebase';
import { calculateDailyTarget } from '../constants/guidelines';
import { classifyFiberType, estimateFiberSplit } from '../constants/keywords';
import { LIGHT_THEME, DARK_THEME, ThemeColors } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface AppContextType {
  profile: UserProfile;
  entries: FoodEntry[];
  dailyGoal: number;
  todayEntries: FoodEntry[];
  todayTotal: number;
  todaySoluble: number;
  todayInsoluble: number;
  daySummaries7: DaySummary[];
  daySummaries30: DaySummary[];
  monthSummariesYear: MonthSummary[];
  metrics: ProgressMetrics;
  paywallVisible: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  setPaywallVisible: (visible: boolean) => void;
  setAiConsent: (consent: boolean) => Promise<void>;
  addEntry: (data: {
    name: string;
    portion?: string;
    totalGrams: number;
    solubleGrams?: number;
    insolubleGrams?: number;
    source: 'usda' | 'ai_scan' | 'manual';
    tag?: 'soluble' | 'insoluble' | 'mixed';
    imageUri?: string;
  }) => Promise<void>;
  updateEntry: (id: string, updates: Partial<FoodEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  handleAiScanAttempt: (onProceed: () => void) => void;
  upgradeToPlus: (tier?: 'annual' | 'monthly') => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonStr: string) => Promise<void>;
  clearUserData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  signOut: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  const [profile, setProfile] = useState<UserProfile>({
    uid: 'local_guest',
    email: null,
    displayName: 'Fiber Explorer',
    biologicalSex: 'female',
    age: 30,
    customTargetGrams: 28,
    useCustomTarget: false,
    isPlusSubscriber: false,
    aiScanCount: 0,
    hasCompletedOnboarding: false,
    hasGivenAiConsent: false,
    createdAt: Date.now(),
  });

  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [paywallVisible, setPaywallVisible] = useState(false);

  // Load stored data and theme on startup + listen to Firebase Auth
  useEffect(() => {
    async function loadData() {
      const storedTheme = await AsyncStorage.getItem('@fibersnap_theme_mode');
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        setThemeModeState(storedTheme);
      }

      let storedProfile = await StorageService.getProfile();
      if (storedProfile.email && storedProfile.email.trim().toLowerCase() === 'muhammadali2025222@gmail.com') {
        storedProfile = { ...storedProfile, isPlusSubscriber: true };
        await StorageService.saveProfile(storedProfile);
      }
      const storedEntries = await StorageService.getEntries();

      setProfile(storedProfile);
      setEntries(storedEntries);
    }
    loadData();

    // Real-time Firebase Authentication listener & cloud hydration
    const unsubscribe = AuthService.onAuthState(async (fbUser) => {
      if (fbUser) {
        const isVipUser = fbUser.email?.trim().toLowerCase() === 'muhammadali2025222@gmail.com';
        try {
          let cloudProfile = await CloudDbService.loadProfile(fbUser.uid);
          if (cloudProfile) {
            if (isVipUser) {
              cloudProfile = { ...cloudProfile, isPlusSubscriber: true };
            }
            setProfile(cloudProfile);
            await StorageService.saveProfile(cloudProfile);
          } else {
            const currentProfile = await StorageService.getProfile();
            if (currentProfile && (!currentProfile.uid || currentProfile.uid.startsWith('guest_'))) {
              const updated = {
                ...currentProfile,
                uid: fbUser.uid,
                email: fbUser.email,
                isPlusSubscriber: isVipUser ? true : currentProfile.isPlusSubscriber,
              };
              setProfile(updated);
              await StorageService.saveProfile(updated);
              await CloudDbService.saveProfile(updated);
            }
          }

          const cloudEntries = await CloudDbService.loadEntries(fbUser.uid);
          const localEntries = await StorageService.getEntries();
          const existingIds = new Set(cloudEntries.map((e) => e.id));

          for (const entry of localEntries) {
            if (!existingIds.has(entry.id)) {
              await CloudDbService.saveEntry(fbUser.uid, entry);
              cloudEntries.push(entry);
            }
          }

          cloudEntries.sort((a, b) => b.timestamp - a.timestamp);
          setEntries(cloudEntries);
          await StorageService.saveEntries(cloudEntries);
        } catch (err) {
          console.warn('Error hydrating data from Firebase:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const syncWithCloud = async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) return;
    try {
      const cloudProfile = await CloudDbService.loadProfile(fbUser.uid);
      if (cloudProfile) {
        setProfile(cloudProfile);
        await StorageService.saveProfile(cloudProfile);
      } else {
        await CloudDbService.saveProfile(profile);
      }

      const cloudEntries = await CloudDbService.loadEntries(fbUser.uid);
      const localEntries = await StorageService.getEntries();
      const existingIds = new Set(cloudEntries.map((e) => e.id));

      for (const entry of localEntries) {
        if (!existingIds.has(entry.id)) {
          await CloudDbService.saveEntry(fbUser.uid, entry);
          cloudEntries.push(entry);
        }
      }

      cloudEntries.sort((a, b) => b.timestamp - a.timestamp);
      setEntries(cloudEntries);
      await StorageService.saveEntries(cloudEntries);
    } catch (err) {
      console.warn('syncWithCloud error:', err);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem('@fibersnap_theme_mode', mode);
  };

  // Derive dynamic theme colors
  const colors = useMemo<ThemeColors>(() => {
    if (themeMode === 'dark') {
      return DARK_THEME;
    }
    if (themeMode === 'light') {
      return LIGHT_THEME;
    }
    return systemScheme === 'dark' ? DARK_THEME : LIGHT_THEME;
  }, [themeMode, systemScheme]);

  // Compute Daily Target
  const dailyGoal = useMemo(() => {
    if (profile.useCustomTarget && profile.customTargetGrams > 0) {
      return profile.customTargetGrams;
    }
    return calculateDailyTarget(profile.biologicalSex, profile.age, profile.weightKg, profile.goalType);
  }, [profile]);

  // Compute Today's logs
  const todayStr = getTodayStr();
  const todayEntries = useMemo(() => {
    return entries.filter((e) => e.dateStr === todayStr);
  }, [entries, todayStr]);

  const { todayTotal, todaySoluble, todayInsoluble } = useMemo(() => {
    let tot = 0, sol = 0, ins = 0;
    for (const item of todayEntries) {
      tot += item.totalGrams;
      sol += item.solubleGrams;
      ins += item.insolubleGrams;
    }
    return {
      todayTotal: Math.round(tot * 10) / 10,
      todaySoluble: Math.round(sol * 10) / 10,
      todayInsoluble: Math.round(ins * 10) / 10,
    };
  }, [todayEntries]);

  // Historical Day Summaries
  const generateHistory = (dayCount: number): DaySummary[] => {
    const list: DaySummary[] = [];
    const now = new Date();

    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;

      const daysEntries = entries.filter((e) => e.dateStr === dStr);
      let totalG = 0, solG = 0, insG = 0;
      for (const e of daysEntries) {
        totalG += e.totalGrams;
        solG += e.solubleGrams;
        insG += e.insolubleGrams;
      }

      list.push({
        dateStr: dStr,
        totalGrams: Math.round(totalG * 10) / 10,
        solubleGrams: Math.round(solG * 10) / 10,
        insolubleGrams: Math.round(insG * 10) / 10,
        goal: dailyGoal,
        metGoal: totalG >= dailyGoal,
      });
    }
    return list;
  };

  const daySummaries7 = useMemo(() => generateHistory(7), [entries, dailyGoal]);
  const daySummaries30 = useMemo(() => generateHistory(30), [entries, dailyGoal]);

  const monthSummariesYear = useMemo<MonthSummary[]>(() => {
    const list: MonthSummary[] = [];
    const now = new Date();
    const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;

      const mEntries = entries.filter((e) => e.dateStr.startsWith(prefix));
      const totalG = mEntries.reduce((acc, curr) => acc + curr.totalGrams, 0);
      const uniqueDays = new Set(mEntries.map((e) => e.dateStr)).size;
      const avgG = uniqueDays > 0 ? totalG / uniqueDays : 0;

      list.push({
        monthStr: prefix,
        label: MONTH_LABELS[m],
        totalGrams: Math.round(totalG * 10) / 10,
        avgGrams: Math.round(avgG * 10) / 10,
        daysLogged: uniqueDays,
        goal: dailyGoal,
        metGoal: avgG >= dailyGoal,
      });
    }
    return list;
  }, [entries, dailyGoal]);

  // Compute Progress Metrics
  const metrics = useMemo<ProgressMetrics>(() => {
    let streak = 0;
    const now = new Date();

    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;

      const dayLogs = entries.filter((e) => e.dateStr === dStr);
      const sum = dayLogs.reduce((acc, curr) => acc + curr.totalGrams, 0);

      if (i === 0 && sum < dailyGoal) {
        continue;
      }

      if (sum >= dailyGoal) {
        streak++;
      } else {
        break;
      }
    }

    const recent7 = daySummaries7;
    const recent7Sum = recent7.reduce((acc, curr) => acc + curr.totalGrams, 0);
    const rolling7DayAvg = Math.round((recent7Sum / 7) * 10) / 10;
    const daysMetGoalLast30 = daySummaries30.filter((d) => d.metGoal).length;
    const uniqueDays = new Set(entries.map((e) => e.dateStr));

    return {
      currentStreak: streak,
      rolling7DayAvg,
      daysMetGoalLast30,
      totalDaysLogged: uniqueDays.size,
      totalEntriesCount: entries.length,
    };
  }, [entries, dailyGoal, daySummaries7, daySummaries30]);

  // Add Log Entry
  const addEntry = async (data: {
    name: string;
    portion?: string;
    totalGrams: number;
    solubleGrams?: number;
    insolubleGrams?: number;
    source: 'usda' | 'ai_scan' | 'manual';
    tag?: 'soluble' | 'insoluble' | 'mixed';
    imageUri?: string;
  }) => {
    const determinedTag = data.tag || classifyFiberType(data.name);
    let sol = data.solubleGrams;
    let ins = data.insolubleGrams;

    if (sol === undefined || ins === undefined) {
      const split = estimateFiberSplit(data.totalGrams, determinedTag);
      sol = split.solubleGrams;
      ins = split.insolubleGrams;
    }

    let cloudImageUri = data.imageUri;
    if (data.imageUri && (data.imageUri.startsWith('file:') || data.imageUri.startsWith('content:'))) {
      try {
        cloudImageUri = await CloudStorageService.uploadMealPhoto(profile.uid, data.imageUri);
      } catch (e) {
        console.warn('Failed to upload meal photo to storage:', e);
      }
    }

    const newEntry: FoodEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: data.name,
      portion: data.portion || '1 standard serving',
      totalGrams: Math.round(data.totalGrams * 10) / 10,
      solubleGrams: Math.round(sol * 10) / 10,
      insolubleGrams: Math.round(ins * 10) / 10,
      source: data.source,
      tag: determinedTag,
      dateStr: getTodayStr(),
      timestamp: Date.now(),
      imageUri: cloudImageUri,
    };

    const updated = await StorageService.addEntry(newEntry);
    setEntries(updated);

    // Sync to Cloud Firestore
    if (profile.uid && !profile.uid.startsWith('guest_') && !profile.uid.startsWith('local_')) {
      await CloudDbService.saveEntry(profile.uid, newEntry);
    }
  };

  const deleteEntry = async (id: string) => {
    const updated = await StorageService.removeEntry(id);
    setEntries(updated);

    if (profile.uid && !profile.uid.startsWith('guest_') && !profile.uid.startsWith('local_')) {
      await CloudDbService.removeEntry(profile.uid, id);
    }
  };

  const updateEntry = async (id: string, updates: Partial<FoodEntry>) => {
    const existing = entries.find((e) => e.id === id);
    if (!existing) return;

    let sol = updates.solubleGrams !== undefined ? updates.solubleGrams : existing.solubleGrams;
    let ins = updates.insolubleGrams !== undefined ? updates.insolubleGrams : existing.insolubleGrams;
    let total = updates.totalGrams !== undefined ? updates.totalGrams : existing.totalGrams;

    if (updates.totalGrams !== undefined && updates.solubleGrams === undefined && updates.insolubleGrams === undefined) {
      const split = estimateFiberSplit(updates.totalGrams, updates.tag || existing.tag);
      sol = split.solubleGrams;
      ins = split.insolubleGrams;
    }

    const updatedEntry: FoodEntry = {
      ...existing,
      ...updates,
      totalGrams: Math.round(total * 10) / 10,
      solubleGrams: Math.round(sol * 10) / 10,
      insolubleGrams: Math.round(ins * 10) / 10,
    };

    const updatedList = await StorageService.updateEntry(updatedEntry);
    setEntries(updatedList);

    if (profile.uid && !profile.uid.startsWith('guest_') && !profile.uid.startsWith('local_')) {
      await CloudDbService.saveEntry(profile.uid, updatedEntry);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    let finalUpdates = { ...updates };
    if (updates.avatarUri && (updates.avatarUri.startsWith('file:') || updates.avatarUri.startsWith('content:'))) {
      try {
        const cloudAvatar = await CloudStorageService.uploadAvatar(profile.uid, updates.avatarUri);
        finalUpdates.avatarUri = cloudAvatar;
      } catch (e) {
        console.warn('Failed to upload avatar to cloud storage:', e);
      }
    }

    let next = { ...profile, ...finalUpdates };
    if (next.email && next.email.trim().toLowerCase() === 'muhammadali2025222@gmail.com') {
      next = { ...next, isPlusSubscriber: true };
    }
    setProfile(next);
    await StorageService.saveProfile(next);

    // Sync to Cloud Firestore
    if (next.uid && !next.uid.startsWith('guest_') && !next.uid.startsWith('local_')) {
      await CloudDbService.saveProfile(next);
    }
  };

  const handleAiScanAttempt = (onProceed: () => void) => {
    onProceed();
  };

  const upgradeToPlus = async (tier: 'annual' | 'monthly' = 'annual') => {
    await updateProfile({ isPlusSubscriber: true, subscriptionTier: tier });
  };

  const exportData = async () => {
    return await StorageService.exportAllData();
  };

  const importData = async (jsonStr: string) => {
    const result = await StorageService.importAllData(jsonStr);
    setProfile(result.profile);
    setEntries(result.entries);
  };

  const clearUserData = async () => {
    // 1. Purge all food log entries locally and in cloud
    await StorageService.saveEntries([]);
    setEntries([]);

    if (profile.uid && !profile.uid.startsWith('guest_') && !profile.uid.startsWith('local_')) {
      await CloudDbService.clearEntries(profile.uid);
    }

    // 2. Reset health goals, weight, streaks, AI scans, and onboarding while preserving account credentials (Name, Email, UID)
    const resetProfile: UserProfile = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      avatarUri: profile.avatarUri,
      biologicalSex: 'female',
      age: 30,
      weightKg: undefined,
      weightUnit: undefined,
      goalType: undefined,
      customTargetGrams: 28,
      useCustomTarget: false,
      isPlusSubscriber: profile.isPlusSubscriber,
      aiScanCount: 0,
      hasCompletedOnboarding: false,
      hasGivenAiConsent: false,
      createdAt: profile.createdAt || Date.now(),
    };

    setProfile(resetProfile);
    await StorageService.saveProfile(resetProfile);

    if (resetProfile.uid && !resetProfile.uid.startsWith('guest_') && !resetProfile.uid.startsWith('local_')) {
      await CloudDbService.saveProfile(resetProfile);
    }
  };

  const clearAllData = async () => {
    if (profile.uid && !profile.uid.startsWith('guest_') && !profile.uid.startsWith('local_')) {
      await CloudDbService.clearEntries(profile.uid);
      await AuthService.signOut();
    }
    await StorageService.clearAllData();
    const freshProfile: UserProfile = {
      uid: 'guest_local',
      email: null,
      displayName: 'Fiber Explorer',
      biologicalSex: 'female',
      age: 30,
      customTargetGrams: 28,
      useCustomTarget: false,
      isPlusSubscriber: false,
      aiScanCount: 0,
      createdAt: Date.now(),
    };
    setProfile(freshProfile);
    setEntries([]);
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
    } catch (e) {
      console.warn('AuthService signOut error:', e);
    }
    await StorageService.clearSession();
    const freshProfile: UserProfile = {
      uid: 'guest_local_user',
      email: null,
      displayName: 'Fiber Explorer',
      biologicalSex: 'female',
      age: 30,
      customTargetGrams: 28,
      useCustomTarget: false,
      isPlusSubscriber: false,
      aiScanCount: 0,
      hasCompletedOnboarding: false,
      hasGivenAiConsent: false,
      createdAt: Date.now(),
    };
    setProfile(freshProfile);
    setEntries([]);
  };

  const setAiConsent = async (consent: boolean) => {
    await updateProfile({ hasGivenAiConsent: consent });
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        entries,
        dailyGoal,
        todayEntries,
        todayTotal,
        todaySoluble,
        todayInsoluble,
        daySummaries7,
        daySummaries30,
        monthSummariesYear,
        metrics,
        paywallVisible,
        themeMode,
        colors,
        setThemeMode,
        setPaywallVisible,
        setAiConsent,
        addEntry,
        updateEntry,
        deleteEntry,
        updateProfile,
        handleAiScanAttempt,
        upgradeToPlus,
        exportData,
        importData,
        clearUserData,
        clearAllData,
        signOut,
        syncWithCloud,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
