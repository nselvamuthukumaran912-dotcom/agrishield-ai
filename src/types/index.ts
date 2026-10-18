export type LanguageCode =
  | 'en' // English
  | 'hi' // Hindi
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'bn' // Bengali
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'pa' // Punjabi
  | 'or' // Odia
  | 'ur'; // Urdu

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  isRtl?: boolean;
}

export type CropType =
  | 'paddy'
  | 'maize'
  | 'groundnut'
  | 'cotton'
  | 'millets'
  | 'sugarcane'
  | 'wheat'
  | 'pulses'
  | 'vegetables'
  | 'other';

export type GrowthStage =
  | 'sowing'
  | 'vegetative'
  | 'flowering'
  | 'grain_filling'
  | 'harvesting';

export interface LocationInfo {
  state: string;
  district: string;
  lat: number;
  lng: number;
  agroZone?: string;
  majorSoil?: string;
}

export interface WeatherData {
  temperature: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  rainfall24h: number; // mm
  windSpeed: number; // km/h
  weatherCode: number;
  weatherDescription: string;
  uvIndex?: number;
  providerName: string;
  source: string;
  sourceType: 'imd_official_live' | 'live_telemetry' | 'portal_station' | 'sample_fallback';
  retrievalStatus: 'live' | 'cached' | 'unavailable' | 'not_configured' | 'access_denied' | 'timeout' | 'invalid_response';
  retrievalTimestamp: string;
  observationTimestamp?: string;
  forecastGeneratedTimestamp?: string;
  isStale?: boolean;
  forecast7Day: DailyForecast[];
  alerts: WeatherAlert[];
  seasonalOutlook?: {
    summary: string;
    ensoStatus: string;
    iodStatus: string;
    mjoStatus: string;
    scientificDisclaimer: string;
  };
  statusMessage?: string;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  condition: string;
  weatherCode: number;
}

export interface WeatherAlert {
  id: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  category: 'rainfall' | 'heat' | 'drought' | 'wind' | 'pest_climate';
  title: string;
  description: string;
  validUntil: string;
}

export interface GeminiAdvisoryResponse {
  summary: string;
  evidenceSummary?: {
    hasLiveData: boolean;
    sourceName: string;
    sourceTimestamp?: string;
    text: string;
    isGeneralGuidanceOnly: boolean;
  };
  recommendations: {
    title: string;
    action: string;
    urgency: 'immediate' | 'next_24h' | 'routine';
  }[];
  waterConservation?: {
    techniqueName: string;
    guidance: string;
    estimatedSavings?: string;
  };
  uncertaintyAndSource?: {
    uncertaintyNote: string;
    officialSourceTitle: string;
    officialSourceUrl: string;
    preservedSource?: string;
    preservedTimestamp?: string;
  };
  climateRiskLevel: 'low' | 'moderate' | 'high' | 'severe';
  waterSavingPractices: {
    title: string;
    technique: string;
    estimatedSavingsPercent?: number;
  }[];
  scientificExplanation: string;
  uncertaintyNotes: string;
  timestamp: string;
  languageCode: LanguageCode;
}

export interface SavedAdvisory {
  id: string;
  createdAt: string;
  state: string;
  district: string;
  lat?: number;
  lng?: number;
  crop: CropType;
  customCropName?: string;
  stage: GrowthStage;
  growthStage: GrowthStage;
  language: LanguageCode;
  adviceText: string;
  sourceReferences: string;
  weatherStatus: 'live' | 'unavailable' | 'cached' | 'not_configured' | 'access_denied' | 'timeout' | 'invalid_response';
  weatherSummary: {
    temperature: number;
    rainfall: number;
    condition: string;
  };
  advisory: GeminiAdvisoryResponse;
  syncedToCloud: boolean;
}

export interface UserPreferences {
  language: LanguageCode;
  state: string;
  district: string;
  crop: CropType;
  customCropName?: string;
  growthStage: GrowthStage;
  lastUpdated: string;
}
