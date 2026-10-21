import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_INDEX_KEY = '@fibersnap_image_cache_index';
const CACHE_DIR = `${FileSystem.documentDirectory}fiber_photos_cache/`;

// In-memory lookup map: remoteUrl -> localFilePath
let memoryIndex: Record<string, string> = {};
let isInitialized = false;

function generateSafeHash(url: string): string {
  let hash = 5381;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) + hash) + url.charCodeAt(i);
  }
  const safeHash = Math.abs(hash).toString(36);
  const cleanPath = url.split('?')[0].replace(/[^a-zA-Z0-9]/g, '_').slice(-20);
  return `cached_${cleanPath}_${safeHash}.jpg`;
}

async function ensureCacheDir(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  } catch (err) {
    console.warn('ImageCacheService.ensureCacheDir error:', err);
  }
}

export const ImageCacheService = {
  /**
   * Initializes the in-memory cache index from AsyncStorage
   */
  async init(): Promise<void> {
    if (isInitialized) return;
    try {
      await ensureCacheDir();
      const stored = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (stored) {
        memoryIndex = JSON.parse(stored);
      }
      isInitialized = true;
    } catch (err) {
      console.warn('ImageCacheService.init error:', err);
      memoryIndex = {};
      isInitialized = true;
    }
  },

  /**
   * Fast synchronous lookup from in-memory index
   */
  getCachedUriSync(uri?: string | null): string | null {
    if (!uri) return null;
    if (uri.startsWith('file:')) {
      const docDir = FileSystem.documentDirectory ?? '';
      const cacheDir = FileSystem.cacheDirectory ?? '';
      if ((docDir && uri.startsWith(docDir)) || (cacheDir && uri.startsWith(cacheDir))) {
        return uri;
      }
      return null;
    }
    if (memoryIndex[uri]) return memoryIndex[uri];
    return null;
  },

  /**
   * Resolves an image URI from local disk cache.
   * If the URI is remote and not yet cached locally, it downloads it once
   * to permanent local disk storage, updates the index, and returns the local file URI.
   */
  async getCachedImageUri(uri?: string | null): Promise<string | null> {
    if (!uri) return null;

    // Already a local file
    if (uri.startsWith('file:')) {
      try {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists && (info.size ?? 0) > 0) return uri;
      } catch {
        return null;
      }
      return null;
    }

    await this.init();

    // Check if we already have a registered local path for this remote URL
    const existingLocal = memoryIndex[uri];
    if (existingLocal) {
      try {
        const info = await FileSystem.getInfoAsync(existingLocal);
        if (info.exists && (info.size ?? 0) > 0) {
          return existingLocal;
        }
      } catch {
        // Fall through to re-download if the file was removed
      }
    }

    // Check if deterministic target file exists in CACHE_DIR
    const targetFilename = generateSafeHash(uri);
    const targetPath = `${CACHE_DIR}${targetFilename}`;

    try {
      const info = await FileSystem.getInfoAsync(targetPath);
      if (info.exists && (info.size ?? 0) > 0) {
        await this.registerMapping(uri, targetPath);
        return targetPath;
      }

      // Download once from remote URL (Firebase Storage) into local permanent cache
      await ensureCacheDir();
      const downloadResult = await FileSystem.downloadAsync(uri, targetPath);
      if (downloadResult && downloadResult.status === 200) {
        await this.registerMapping(uri, downloadResult.uri);
        return downloadResult.uri;
      }
    } catch (err) {
      console.warn('ImageCacheService: download error for', uri, err);
    }

    // Fallback to original remote URI if download or file system fails
    return uri;
  },

  /**
   * Copies a newly taken camera/gallery photo from temporary system storage
   * into permanent app document cache, preventing OS cleanup.
   */
  async cacheLocalPhoto(sourceUri: string): Promise<string> {
    await this.init();
    await ensureCacheDir();

    try {
      const extension = sourceUri.split('.').pop() || 'jpg';
      const filename = `meal_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const destination = `${CACHE_DIR}${filename}`;

      await FileSystem.copyAsync({
        from: sourceUri,
        to: destination,
      });

      return destination;
    } catch (err) {
      console.warn('ImageCacheService.cacheLocalPhoto copy error, using original:', err);
      return sourceUri;
    }
  },

  /**
   * Associates a remote cloud URL (e.g. Firebase Storage URL) with a local cached file path.
   */
  async registerMapping(remoteUrl: string, localPath: string): Promise<void> {
    try {
      memoryIndex[remoteUrl] = localPath;
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(memoryIndex));
    } catch (err) {
      console.warn('ImageCacheService.registerMapping error:', err);
    }
  },

  /**
   * Clears the image cache on disk and resets the index
   */
  async clearCache(): Promise<void> {
    try {
      memoryIndex = {};
      await AsyncStorage.removeItem(CACHE_INDEX_KEY);
      const info = await FileSystem.getInfoAsync(CACHE_DIR);
      if (info.exists) {
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
        await ensureCacheDir();
      }
    } catch (err) {
      console.warn('ImageCacheService.clearCache error:', err);
    }
  },
};
