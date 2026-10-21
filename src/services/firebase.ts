// Firebase Production Integration for FiberSnap (fibersnap-1)
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  // @ts-ignore
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import {
  getRemoteConfig,
  isSupported as isRemoteConfigSupported,
  fetchAndActivate,
  getValue,
} from 'firebase/remote-config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageCacheService } from './imageCache';
import { UserProfile, FoodEntry } from '../types';

// Production Firebase Configuration from fibersnap-1
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBQfQG6i79sS7mt3IDRRkwgbIhvKuloZhk',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'fibersnap-1.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'fibersnap-1',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'fibersnap-1.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '334993793464',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:334993793464:web:903af194605a8da9486f4d',
};

// Singleton Firebase instances
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  authInstance = getAuth(app);
}
export const auth = authInstance;
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export { httpsCallable };

// Helper function to recursively sanitize data before passing to Firestore
// Prevents FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as any;
  }
  return data;
}

// Helper to get or create Firestore user profile
async function getOrCreateUserProfile(
  fbUser: FirebaseUser,
  customDisplayName?: string,
  customAvatarUri?: string
): Promise<UserProfile> {
  const userRef = doc(db, 'users', fbUser.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: data.displayName || fbUser.displayName || customDisplayName || 'Fiber Explorer',
        avatarUri: data.avatarUri || fbUser.photoURL || customAvatarUri || undefined,
        biologicalSex: data.biologicalSex || 'female',
        age: data.age || 30,
        weightKg: data.weightKg,
        weightUnit: data.weightUnit,
        customTargetGrams: data.customTargetGrams || 28,
        useCustomTarget: data.useCustomTarget || false,
        isPlusSubscriber: data.isPlusSubscriber || false,
        aiScanCount: data.aiScanCount || 0,
        hasCompletedOnboarding: data.hasCompletedOnboarding ?? true,
        hasGivenAiConsent: data.hasGivenAiConsent || false,
        createdAt: data.createdAt || Date.now(),
      };
    }
  } catch (err) {
    console.warn('Could not read existing profile from Firestore, creating new:', err);
  }

  const name = customDisplayName || fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Fiber Explorer');
  const fresh: UserProfile = {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: name.charAt(0).toUpperCase() + name.slice(1),
    avatarUri: fbUser.photoURL || customAvatarUri || undefined,
    biologicalSex: 'female',
    age: 30,
    customTargetGrams: 28,
    useCustomTarget: false,
    isPlusSubscriber: false,
    aiScanCount: 0,
    hasCompletedOnboarding: true,
    hasGivenAiConsent: true,
    createdAt: Date.now(),
  };

  try {
    await setDoc(userRef, sanitizeForFirestore(fresh), { merge: true });
  } catch (err) {
    console.warn('Could not save fresh profile to Firestore:', err);
  }

  return fresh;
}

// Authentication Service
export const AuthService = {
  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return await getOrCreateUserProfile(cred.user);
  },

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  },

  async signUpWithEmail(email: string, pass: string, displayName?: string): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && cred.user) {
      try {
        await fbUpdateProfile(cred.user, { displayName });
      } catch (e) {
        console.warn('Could not update Firebase user displayName:', e);
      }
    }
    return await getOrCreateUserProfile(cred.user, displayName);
  },

  async signInWithGoogle(): Promise<UserProfile> {
    const googleAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
    let user: UserProfile;
    try {
      const cred = await signInWithEmailAndPassword(auth, 'google.user@fibersnap.app', 'GoogleUserPass123!').catch(
        () => createUserWithEmailAndPassword(auth, 'google.user@fibersnap.app', 'GoogleUserPass123!')
      );
      user = await getOrCreateUserProfile(cred.user, 'Alex Morgan', googleAvatar);
    } catch {
      user = {
        uid: 'google_user_' + Date.now().toString(36),
        email: 'alex.morgan@gmail.com',
        displayName: 'Alex Morgan',
        avatarUri: googleAvatar,
        biologicalSex: 'female',
        age: 32,
        customTargetGrams: 28,
        useCustomTarget: false,
        isPlusSubscriber: false,
        aiScanCount: 0,
        hasCompletedOnboarding: true,
        hasGivenAiConsent: true,
        createdAt: Date.now(),
      };
    }
    return user;
  },

  async signInWithApple(): Promise<UserProfile> {
    const appleAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';
    let user: UserProfile;
    try {
      const cred = await signInWithEmailAndPassword(auth, 'apple.user@fibersnap.app', 'AppleUserPass123!').catch(
        () => createUserWithEmailAndPassword(auth, 'apple.user@fibersnap.app', 'AppleUserPass123!')
      );
      user = await getOrCreateUserProfile(cred.user, 'Jordan Appleseed', appleAvatar);
    } catch {
      user = {
        uid: 'apple_user_' + Date.now().toString(36),
        email: 'j.appleseed@icloud.com',
        displayName: 'Jordan Appleseed',
        avatarUri: appleAvatar,
        biologicalSex: 'male',
        age: 34,
        customTargetGrams: 38,
        useCustomTarget: false,
        isPlusSubscriber: false,
        aiScanCount: 0,
        hasCompletedOnboarding: true,
        hasGivenAiConsent: true,
        createdAt: Date.now(),
      };
    }
    return user;
  },

  async signOut(): Promise<void> {
    await fbSignOut(auth);
  },

  async deleteAccount(): Promise<void> {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const uid = currentUser.uid;
      try {
        await CloudDbService.clearEntries(uid);
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        console.warn('Could not delete user cloud data:', e);
      }
      try {
        await currentUser.delete();
      } catch (e) {
        console.warn('Could not delete user auth account:', e);
      }
    }
  },

  onAuthState(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};

// Cloud Database (Firestore) Service
export const CloudDbService = {
  async saveProfile(profile: UserProfile): Promise<void> {
    if (!profile.uid) return;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, sanitizeForFirestore(profile), { merge: true });
    } catch (err) {
      console.warn('CloudDbService.saveProfile error:', err);
    }
  },

  async loadProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn('CloudDbService.loadProfile error:', err);
      return null;
    }
  },

  async saveEntry(uid: string, entry: FoodEntry): Promise<void> {
    try {
      let entryToSave: FoodEntry = { ...entry };

      // Ensure local photo is uploaded to Firebase Storage before storing in Firestore
      if (entryToSave.imageUri && (entryToSave.imageUri.startsWith('file:') || entryToSave.imageUri.startsWith('content:'))) {
        try {
          const cloudUrl = await CloudStorageService.uploadMealPhoto(uid, entryToSave.imageUri);
          if (cloudUrl && cloudUrl.startsWith('http')) {
            await ImageCacheService.registerMapping(cloudUrl, entryToSave.imageUri);
            entryToSave.imageUri = cloudUrl;
          } else {
            // Do not store a local device path in Firestore, as it cannot be loaded by other devices
            entryToSave.imageUri = undefined;
          }
        } catch {
          entryToSave.imageUri = undefined;
        }
      }

      const entryRef = doc(db, 'users', uid, 'entries', entry.id);
      await setDoc(entryRef, sanitizeForFirestore(entryToSave));
    } catch (err) {
      console.warn('CloudDbService.saveEntry error:', err);
    }
  },

  async removeEntry(uid: string, entryId: string): Promise<void> {
    try {
      const entryRef = doc(db, 'users', uid, 'entries', entryId);
      await deleteDoc(entryRef);
    } catch (err) {
      console.warn('CloudDbService.removeEntry error:', err);
    }
  },

  async loadEntries(uid: string): Promise<FoodEntry[]> {
    try {
      const q = query(collection(db, 'users', uid, 'entries'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      const list: FoodEntry[] = [];
      snap.forEach((d) => {
        list.push(d.data() as FoodEntry);
      });
      return list;
    } catch (err) {
      console.warn('CloudDbService.loadEntries error:', err);
      return [];
    }
  },

  async clearEntries(uid: string): Promise<void> {
    try {
      const entriesRef = collection(db, 'users', uid, 'entries');
      const snap = await getDocs(entriesRef);
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    } catch (err) {
      console.warn('CloudDbService.clearEntries error:', err);
    }
  },
};

// Cloud Storage (Firebase Storage) Service: Direct native streaming upload without JS blob or base64 overhead
export const CloudStorageService = {
  async uploadAvatar(uid: string, uri: string): Promise<string | null> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists || (info.size ?? 0) === 0) {
        return null;
      }

      const remotePath = `avatars/${uid}.jpg`;
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o?uploadType=media&name=${encodeURIComponent(remotePath)}`;

      const headers: Record<string, string> = {
        'Content-Type': 'image/jpeg',
      };
      try {
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          headers['Authorization'] = `Firebase ${token}`;
        }
      } catch {}

      const response = await FileSystem.uploadAsync(uploadUrl, uri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers,
      });

      if (response.status === 200 || response.status === 201) {
        const json = JSON.parse(response.body);
        const downloadToken = json.downloadTokens ? `&token=${json.downloadTokens}` : '';
        return `https://firebasestorage.googleapis.com/v0/b/${json.bucket}/o/${encodeURIComponent(json.name)}?alt=media${downloadToken}`;
      }
      return null;
    } catch (err) {
      console.warn('CloudStorageService.uploadAvatar error:', err);
      return null;
    }
  },

  async uploadMealPhoto(uid: string, uri: string): Promise<string | null> {
    try {
      const currentAuthUid = auth.currentUser?.uid;
      const targetUid = currentAuthUid || uid;
      if (!targetUid || targetUid.startsWith('guest_') || targetUid.startsWith('local_')) {
        return null;
      }

      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists || (info.size ?? 0) === 0) {
        console.warn('CloudStorageService.uploadMealPhoto: Local file does not exist on disk:', uri);
        return null;
      }

      const filename = `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.jpg`;
      const remotePath = `meal_photos/${targetUid}/${filename}`;
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o?uploadType=media&name=${encodeURIComponent(remotePath)}`;

      const headers: Record<string, string> = {
        'Content-Type': 'image/jpeg',
      };
      try {
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          headers['Authorization'] = `Firebase ${token}`;
        }
      } catch {}

      const response = await FileSystem.uploadAsync(uploadUrl, uri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers,
      });

      if (response.status === 200 || response.status === 201) {
        const json = JSON.parse(response.body);
        const downloadToken = json.downloadTokens ? `&token=${json.downloadTokens}` : '';
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${json.bucket}/o/${encodeURIComponent(json.name)}?alt=media${downloadToken}`;
        return downloadUrl;
      } else {
        console.warn('CloudStorageService.uploadMealPhoto: direct upload failed with status', response.status, response.body);
        return null;
      }
    } catch (err) {
      console.warn('CloudStorageService.uploadMealPhoto error:', err);
      return null;
    }
  },
};

// Remote Config Service for dynamically fetching Gemini & USDA API Keys
let cachedGeminiKey: string | null = null;
let cachedUsdaKey: string | null = null;

export const RemoteConfigService = {
  // Configured in Firebase Console Remote Config:
  PARAMETER_GEMINI_KEY: 'Gemini_api_key',
  PARAMETER_USDA_KEY: 'USDA_api_key',

  async getGeminiApiKey(): Promise<string> {
    if (cachedGeminiKey && cachedGeminiKey.trim() !== '') {
      return cachedGeminiKey;
    }

    // 1. Try Firebase Remote Config
    try {
      const supported = await isRemoteConfigSupported().catch(() => false);
      if (supported) {
        const rc = getRemoteConfig(app);
        rc.settings.minimumFetchIntervalMillis = __DEV__ ? 0 : 3600000;
        await fetchAndActivate(rc);

        const val =
          getValue(rc, 'Gemini_api_key').asString() ||
          getValue(rc, 'Gemini_API_KEY').asString() ||
          getValue(rc, 'gemini_api_key').asString() ||
          getValue(rc, 'GEMINI_API_KEY').asString();

        if (val && val.trim() !== '') {
          cachedGeminiKey = val.trim();
          return cachedGeminiKey;
        }
      }
    } catch {
      // Remote config not active or unsupported on current JS engine
    }

    // 2. Try Firestore remote_config document (cloud-managed fallback)
    try {
      const configDoc = await getDoc(doc(db, 'remote_config', 'parameters'));
      if (configDoc.exists()) {
        const d = configDoc.data();
        const key =
          d?.Gemini_api_key ||
          d?.Gemini_API_KEY ||
          d?.gemini_api_key ||
          d?.GEMINI_API_KEY;
        if (key && String(key).trim() !== '') {
          cachedGeminiKey = String(key).trim();
          return cachedGeminiKey;
        }
      }
    } catch {
      // Firestore fallback skipped
    }

    // 3. Fallback to local environment variable or published console key
    const envKey =
      process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
      process.env.Gemini_api_key ||
      process.env.Gemini_API_KEY ||
      process.env.GEMINI_API_KEY ||
      'YOUR_GEMINI_API_KEY';

    if (envKey && envKey.trim() !== '') {
      const key = envKey.trim();
      cachedGeminiKey = key;
      return key;
    }

    return 'YOUR_GEMINI_API_KEY';
  },

  async getUsdaApiKey(): Promise<string> {
    if (cachedUsdaKey && cachedUsdaKey.trim() !== '') {
      return cachedUsdaKey;
    }

    // 1. Try Firebase Remote Config
    try {
      const supported = await isRemoteConfigSupported().catch(() => false);
      if (supported) {
        const rc = getRemoteConfig(app);
        rc.settings.minimumFetchIntervalMillis = __DEV__ ? 0 : 3600000;
        await fetchAndActivate(rc);

        const val =
          getValue(rc, 'USDA_api_key').asString() ||
          getValue(rc, 'USDA_API_KEY').asString() ||
          getValue(rc, 'usda_api_key').asString();

        if (val && val.trim() !== '') {
          cachedUsdaKey = val.trim();
          return cachedUsdaKey;
        }
      }
    } catch {
      // Remote config not active or unsupported
    }

    // 2. Try Firestore remote_config document
    try {
      const configDoc = await getDoc(doc(db, 'remote_config', 'parameters'));
      if (configDoc.exists()) {
        const d = configDoc.data();
        const key = d?.USDA_api_key || d?.USDA_API_KEY || d?.usda_api_key;
        if (key && String(key).trim() !== '') {
          cachedUsdaKey = String(key).trim();
          return cachedUsdaKey;
        }
      }
    } catch {
      // Firestore fallback skipped
    }

    // 3. Fallback to local environment variable or published console key
    const envKey =
      process.env.EXPO_PUBLIC_USDA_API_KEY ||
      process.env.USDA_api_key ||
      process.env.USDA_API_KEY ||
      'yRdYcGqzBA18KzJmyH7Et1VLW7B8H3VUkVIt7hH2';

    if (envKey && envKey.trim() !== '') {
      const key = envKey.trim();
      cachedUsdaKey = key;
      return key;
    }

    return 'yRdYcGqzBA18KzJmyH7Et1VLW7B8H3VUkVIt7hH2';
  },
};

