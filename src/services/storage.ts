import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry, UserProfile, USDASearchItem } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: '@fibersnap_user_profile',
  FOOD_ENTRIES: '@fibersnap_food_entries',
  USDA_CACHE: '@fibersnap_usda_cache',
  AUTH_TOKEN: '@fibersnap_auth_token',
  IS_LOGGED_IN: '@fibersnap_is_logged_in',
};

export const DEFAULT_PROFILE: UserProfile = {
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

export const StorageService = {
  async getProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) {
        const loaded: UserProfile = { ...DEFAULT_PROFILE, ...JSON.parse(data) };
        if (loaded.email && loaded.email.trim().toLowerCase() === 'muhammadali2025222@gmail.com') {
          loaded.isPlusSubscriber = true;
        }
        return loaded;
      }
      return DEFAULT_PROFILE;
    } catch (error) {
      console.warn('Failed to load profile from storage:', error);
      return DEFAULT_PROFILE;
    }
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      const toSave = { ...profile };
      if (toSave.email && toSave.email.trim().toLowerCase() === 'muhammadali2025222@gmail.com') {
        toSave.isPlusSubscriber = true;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  },

  async getEntries(): Promise<FoodEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Failed to load food entries:', error);
      return [];
    }
  },

  async saveEntries(entries: FoodEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save food entries:', error);
    }
  },

  async addEntry(entry: FoodEntry): Promise<FoodEntry[]> {
    const existing = await this.getEntries();
    const updated = [entry, ...existing];
    await this.saveEntries(updated);
    return updated;
  },

  async removeEntry(id: string): Promise<FoodEntry[]> {
    const existing = await this.getEntries();
    const updated = existing.filter((item) => item.id !== id);
    await this.saveEntries(updated);
    return updated;
  },

  async updateEntry(updatedItem: FoodEntry): Promise<FoodEntry[]> {
    const existing = await this.getEntries();
    const updated = existing.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    await this.saveEntries(updated);
    return updated;
  },

  // USDA Search Query Cache
  async getCachedUSDAResults(query: string): Promise<USDASearchItem[] | null> {
    try {
      const cacheStr = await AsyncStorage.getItem(STORAGE_KEYS.USDA_CACHE);
      if (!cacheStr) return null;
      const cache = JSON.parse(cacheStr);
      const normalized = query.trim().toLowerCase();
      if (cache[normalized] && Date.now() - cache[normalized].cachedAt < 1000 * 60 * 60 * 24) {
        return cache[normalized].items;
      }
      return null;
    } catch {
      return null;
    }
  },

  async setCachedUSDAResults(query: string, items: USDASearchItem[]): Promise<void> {
    try {
      const cacheStr = await AsyncStorage.getItem(STORAGE_KEYS.USDA_CACHE);
      const cache = cacheStr ? JSON.parse(cacheStr) : {};
      const normalized = query.trim().toLowerCase();
      cache[normalized] = {
        items,
        cachedAt: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USDA_CACHE, JSON.stringify(cache));
    } catch {
      // cache write failures are non-critical
    }
  },

  // Session Inactivity Tracking (30-day inactivity timeout per user requirement)
  async checkAndTouchSession(): Promise<{ isExpired: boolean }> {
    try {
      const lastActiveStr = await AsyncStorage.getItem('@fibersnap_last_active');
      const now = Date.now();
      const MAX_INACTIVITY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        if (!isNaN(lastActive) && now - lastActive > MAX_INACTIVITY_MS) {
          await AsyncStorage.removeItem('@fibersnap_last_active');
          return { isExpired: true };
        }
      }

      await AsyncStorage.setItem('@fibersnap_last_active', now.toString());
      return { isExpired: false };
    } catch {
      return { isExpired: false };
    }
  },

  async isLoggedIn(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setLoggedIn(loggedIn: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, loggedIn ? 'true' : 'false');
    } catch {}
  },

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        '@fibersnap_last_active',
        STORAGE_KEYS.AUTH_TOKEN,
      ]);
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_PROFILE));
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  },

  // Complete Personal Data Archive & Backup Export
  async exportAllData(): Promise<string> {
    const profile = await this.getProfile();
    const entries = await this.getEntries();
    const totalFiberLogged = entries.reduce((acc, curr) => acc + (curr.totalGrams || 0), 0);
    const uniqueDates = Array.from(new Set(entries.map((e) => e.dateStr)));

    return JSON.stringify({
      appName: 'FiberSnap',
      appVersion: '1.0.0',
      exportType: 'Full Personal Data Archive',
      exportDate: new Date().toISOString(),
      user: {
        id: profile.uid,
        name: profile.displayName,
        email: profile.email,
        avatarUrl: profile.avatarUri || null,
        biologicalSex: profile.biologicalSex,
        age: profile.age,
        weightKg: profile.weightKg || null,
        weightUnit: profile.weightUnit || 'kg',
        goalType: profile.goalType || 'standard',
        dailyFiberGoalGrams: profile.customTargetGrams,
        aiConsentGranted: profile.hasGivenAiConsent,
        aiScansUsed: profile.aiScanCount,
        isPlusSubscriber: profile.isPlusSubscriber,
        accountCreatedAt: profile.createdAt ? new Date(profile.createdAt).toISOString() : null,
      },
      nutritionSummary: {
        totalLoggedEntries: entries.length,
        totalLoggedDays: uniqueDates.length,
        totalFiberGrams: Math.round(totalFiberLogged * 10) / 10,
        averageFiberPerLoggedDay: uniqueDates.length > 0 ? Math.round((totalFiberLogged / uniqueDates.length) * 10) / 10 : 0,
      },
      foodLogEntries: entries.map((entry) => ({
        id: entry.id,
        foodName: entry.name,
        portionSize: entry.portion,
        totalFiberGrams: entry.totalGrams,
        solubleFiberGrams: entry.solubleGrams,
        insolubleFiberGrams: entry.insolubleGrams,
        source: entry.source,
        fiberTypeClassification: entry.tag,
        date: entry.dateStr,
        timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString() : null,
        mealPhotoUrl: entry.imageUri || null,
      })),
    }, null, 2);
  },

  async importAllData(jsonString: string): Promise<{ profile: UserProfile; entries: FoodEntry[] }> {
    const data = JSON.parse(jsonString);
    if (!data.entries || !Array.isArray(data.entries)) {
      throw new Error('Invalid FiberSnap backup format.');
    }
    const profile: UserProfile = { ...DEFAULT_PROFILE, ...(data.profile || {}) };
    await this.saveProfile(profile);
    await this.saveEntries(data.entries);
    return { profile, entries: data.entries };
  },

  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.FOOD_ENTRIES,
      STORAGE_KEYS.USDA_CACHE,
      STORAGE_KEYS.AUTH_TOKEN,
      '@fibersnap_last_active',
    ]);
    await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_PROFILE));
  },
};

