import { CropType, GrowthStage, LanguageCode, SavedAdvisory, UserPreferences } from '../types';
import { auth, db, handleFirestoreError, OperationType, getConnectionStatus } from './firebase';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  PREFERENCES: 'agrishield_user_prefs_v1',
  ADVISORIES: 'agrishield_saved_advisories_v1',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'ta',
  state: 'Tamil Nadu',
  district: 'Madurai',
  crop: 'paddy',
  growthStage: 'flowering',
  lastUpdated: new Date().toISOString(),
};

export interface StorageStatus {
  cloudFirestoreConnected: boolean;
  activeDriver: 'firestore_cloud' | 'local_storage_persistent';
  totalSavedAdvisories: number;
  message: string;
  userEmail?: string | null;
  dbId: string;
  projectId: string;
  verifiedAt: string | null;
}

export function getStorageStatus(): StorageStatus {
  const list = getSavedAdvisories();
  const user = auth.currentUser;
  const conn = getConnectionStatus();
  return {
    cloudFirestoreConnected: Boolean(user && conn.verified),
    activeDriver: user && conn.verified ? 'firestore_cloud' : 'local_storage_persistent',
    totalSavedAdvisories: list.length,
    message: user && conn.verified
      ? `Real Cloud Firestore active for ${user.email} (DB: ${conn.dbId}). Advisories sync automatically to the cloud.`
      : user
      ? `Authenticated as ${user.email}. Checking Firestore connection...`
      : 'Local persistent storage active. Sign in with Google to enable real cross-device Cloud Firestore sync.',
    userEmail: user?.email,
    dbId: conn.dbId,
    projectId: conn.projectId,
    verifiedAt: conn.verifiedAt,
  };
}

export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function saveUserPreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
  const current = loadUserPreferences();
  const updated: UserPreferences = {
    ...current,
    ...prefs,
    lastUpdated: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save preferences to local storage:', err);
  }

  // If signed in, execute REAL Cloud Firestore write
  const user = auth.currentUser;
  if (user) {
    const path = `users/${user.uid}/preferences/current`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'preferences', 'current'), {
        userId: user.uid,
        language: updated.language,
        state: updated.state,
        district: updated.district,
        crop: updated.crop,
        customCropName: updated.customCropName || '',
        growthStage: updated.growthStage,
        updatedAt: updated.lastUpdated,
      });
    } catch (err) {
      console.warn('Could not sync preferences to Firestore:', err);
    }
  }

  return updated;
}

export function getSavedAdvisories(): SavedAdvisory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADVISORIES);
    if (!raw) return [];
    const list: SavedAdvisory[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to load advisories from storage:', err);
    return [];
  }
}

export async function fetchCloudAdvisories(): Promise<{ list: SavedAdvisory[]; error: string | null }> {
  const user = auth.currentUser;
  if (!user) {
    return { list: getSavedAdvisories(), error: null };
  }

  const path = `users/${user.uid}/advisories`;
  try {
    const snap = await getDocs(collection(db, 'users', user.uid, 'advisories'));
    const cloudList: SavedAdvisory[] = [];
    snap.forEach((docItem) => {
      const data = docItem.data();
      cloudList.push({
        id: data.id || docItem.id,
        createdAt: data.createdAt,
        state: data.state,
        district: data.district,
        lat: data.lat,
        lng: data.lng,
        crop: data.crop as CropType,
        customCropName: data.customCropName,
        stage: data.growthStage as GrowthStage,
        growthStage: data.growthStage as GrowthStage,
        language: data.language as LanguageCode,
        adviceText: data.adviceText || data.summary || '',
        sourceReferences: data.sourceReferences || 'Global Telemetry & IMD Framework',
        weatherStatus: data.weatherStatus || 'live',
        weatherSummary: {
          temperature: data.weatherTemp ?? 30,
          rainfall: data.weatherRain ?? 0,
          condition: data.weatherCondition ?? 'Observed',
        },
        advisory: {
          summary: data.summary,
          climateRiskLevel: data.climateRiskLevel || 'moderate',
          recommendations: data.recommendations || [],
          waterSavingPractices: data.waterSavingPractices || [],
          scientificExplanation: data.scientificExplanation || '',
          uncertaintyNotes: data.uncertaintyNotes || '',
          timestamp: data.createdAt,
          languageCode: data.language,
        },
        syncedToCloud: true,
      });
    });

    if (cloudList.length > 0) {
      // Merge with local storage
      const local = getSavedAdvisories();
      const mergedMap = new Map<string, SavedAdvisory>();
      local.forEach((a) => mergedMap.set(a.id, a));
      cloudList.forEach((a) => mergedMap.set(a.id, a));
      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      localStorage.setItem(STORAGE_KEYS.ADVISORIES, JSON.stringify(combined));
      return { list: combined, error: null };
    }
    return { list: getSavedAdvisories(), error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Firestore fetch failed:', errorMsg);
    return { list: getSavedAdvisories(), error: errorMsg };
  }
}

export interface SaveAdvisoryResult {
  success: boolean;
  savedToCloud: boolean;
  id: string;
  error?: string;
  message: string;
}

export async function saveAdvisoryRecord(advisory: SavedAdvisory): Promise<SaveAdvisoryResult> {
  try {
    // 1. Save to local storage cache
    const list = getSavedAdvisories();
    const filtered = list.filter((item) => item.id !== advisory.id);
    const updated = [advisory, ...filtered];
    localStorage.setItem(STORAGE_KEYS.ADVISORIES, JSON.stringify(updated));

    // 2. If user is authenticated, execute real Firestore operation
    const user = auth.currentUser;
    if (user) {
      const path = `users/${user.uid}/advisories/${advisory.id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'advisories', advisory.id), {
          id: advisory.id,
          userId: user.uid,
          createdAt: advisory.createdAt,
          state: advisory.state,
          district: advisory.district,
          lat: advisory.lat || 0,
          lng: advisory.lng || 0,
          crop: advisory.crop,
          customCropName: advisory.customCropName || '',
          growthStage: advisory.growthStage,
          language: advisory.language,
          adviceText: advisory.adviceText,
          summary: advisory.advisory.summary,
          climateRiskLevel: advisory.advisory.climateRiskLevel,
          recommendations: advisory.advisory.recommendations,
          waterSavingPractices: advisory.advisory.waterSavingPractices,
          scientificExplanation: advisory.advisory.scientificExplanation,
          uncertaintyNotes: advisory.advisory.uncertaintyNotes,
          sourceReferences: advisory.sourceReferences,
          weatherStatus: advisory.weatherStatus,
          weatherTemp: advisory.weatherSummary.temperature,
          weatherRain: advisory.weatherSummary.rainfall,
          weatherCondition: advisory.weatherSummary.condition,
        });

        advisory.syncedToCloud = true;
        // Update local status with syncedToCloud = true
        localStorage.setItem(STORAGE_KEYS.ADVISORIES, JSON.stringify([advisory, ...filtered]));

        return {
          success: true,
          savedToCloud: true,
          id: advisory.id,
          message: `Saved to Cloud Firestore for user ${user.email}`,
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Real Firestore save failed:', errorMsg);
        return {
          success: false,
          savedToCloud: false,
          id: advisory.id,
          error: errorMsg,
          message: `Firestore write failed: ${errorMsg}`,
        };
      }
    }

    // Unauthenticated: explicitly report saved locally without faking cloud success
    return {
      success: true,
      savedToCloud: false,
      id: advisory.id,
      message: 'Saved to local device storage. Sign in with Google to sync with Cloud Firestore.',
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Storage write error:', err);
    return {
      success: false,
      savedToCloud: false,
      id: advisory.id,
      error: errorMsg,
      message: errorMsg,
    };
  }
}

export async function deleteSavedAdvisory(id: string): Promise<boolean> {
  try {
    const list = getSavedAdvisories();
    const updated = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.ADVISORIES, JSON.stringify(updated));

    const user = auth.currentUser;
    if (user) {
      const path = `users/${user.uid}/advisories/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'advisories', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to delete advisory:', err);
    return false;
  }
}

export function exportAdvisoriesToJson(): string {
  const list = getSavedAdvisories();
  const prefs = loadUserPreferences();
  const exportPayload = {
    app: 'AgriShield AI',
    exportedAt: new Date().toISOString(),
    cloudUser: auth.currentUser?.email || null,
    userPreferences: prefs,
    advisories: list,
  };
  return JSON.stringify(exportPayload, null, 2);
}
