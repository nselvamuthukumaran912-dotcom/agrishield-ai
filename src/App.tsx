/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CropType, GeminiAdvisoryResponse, GrowthStage, LanguageCode, LocationInfo, WeatherData } from './types';
import { LANGUAGES, TRANSLATIONS, TranslationDictionary } from './constants/languages';
import { INDIAN_LOCATIONS, DEFAULT_LOCATION } from './constants/locations';
import { CROPS_DATA, GROWTH_STAGES } from './constants/crops';
import { fetchDistrictWeather } from './services/weatherService';
import { loadUserPreferences, saveUserPreferences } from './services/storageService';
import { requestGeminiAdvisory } from './services/geminiService';
import { DashboardScreen } from './components/DashboardScreen';
import { ClimateMapComponent } from './components/ClimateMapComponent';
import { WeatherScreen } from './components/WeatherScreen';
import { AdviserScreen } from './components/AdviserScreen';
import { SavedAdvisoriesScreen } from './components/SavedAdvisoriesScreen';
import { AboutScreen } from './components/AboutScreen';
import { auth, signInWithGoogle, logOut, onAuthStateChanged } from './services/firebase';
import { User } from 'firebase/auth';
import {
  Shield,
  LayoutDashboard,
  Map,
  CloudSun,
  Bot,
  Bookmark,
  Info,
  Languages,
  MapPin,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  Wifi,
  WifiOff,
  LogIn,
  LogOut,
  User as UserIcon,
  Cloud,
} from 'lucide-react';

export default function App() {
  // Load saved preferences or fall back to defaults (Tamil Nadu -> Madurai, Paddy, Flowering, Tamil)
  const [prefs, setPrefs] = useState(() => loadUserPreferences());
  const [language, setLanguage] = useState<LanguageCode>(prefs.language || 'ta');

  // Match saved district or default to Madurai
  const initialLoc = INDIAN_LOCATIONS.flatMap((s) => s.districts).find(
    (d) => d.district === prefs.district && d.state === prefs.state
  ) || DEFAULT_LOCATION;

  const [location, setLocation] = useState<LocationInfo>(initialLoc);
  const [crop, setCrop] = useState<CropType>(prefs.crop || 'paddy');
  const [customCropName, setCustomCropName] = useState<string>(prefs.customCropName || '');
  const [growthStage, setGrowthStage] = useState<GrowthStage>(prefs.growthStage || 'flowering');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'weather' | 'adviser' | 'saved' | 'about'>('dashboard');

  // Firebase Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Sign-Out error:', err);
    }
  };

  // Weather data & loading
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);

  // Gemini advisory & loading
  const [advisory, setAdvisory] = useState<GeminiAdvisoryResponse | null>(null);
  const [isAdvisoryLoading, setIsAdvisoryLoading] = useState<boolean>(false);

  // Quick switch modal for district/crop
  const [isQuickConfigOpen, setIsQuickConfigOpen] = useState(false);

  // Translation dictionary for active language
  const t: TranslationDictionary = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'ur';

  // Synchronize document direction for Urdu RTL support
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRtl]);

  // Save preferences on any change
  useEffect(() => {
    saveUserPreferences({
      state: location.state,
      district: location.district,
      crop,
      customCropName: crop === 'other' ? customCropName : undefined,
      growthStage,
      language,
    });
  }, [location.state, location.district, crop, customCropName, growthStage, language]);

  // Fetch weather data for the selected location
  const loadWeather = useCallback(async (loc: LocationInfo) => {
    setIsWeatherLoading(true);
    try {
      const res = await fetchDistrictWeather(loc.lat, loc.lng, loc.district, loc.state);
      setWeather(res.data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setWeather(null);
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

  // Fetch weather when location changes
  useEffect(() => {
    loadWeather(location);
  }, [location, loadWeather]);

  // Generate Gemini agricultural advisory
  const handleGenerateAdvisory = async (customQuestion?: string) => {
    setIsAdvisoryLoading(true);
    try {
      const res = await requestGeminiAdvisory({
        state: location.state,
        district: location.district,
        crop,
        customCropName: crop === 'other' ? customCropName : undefined,
        growthStage,
        language,
        weather,
        userQuestion: customQuestion,
      });
      setAdvisory(res);
      // Ensure we navigate to the adviser view if triggered from dashboard
      if (activeTab !== 'adviser') {
        setActiveTab('adviser');
      }
    } catch (err) {
      console.error('Advisory generation error:', err);
    } finally {
      setIsAdvisoryLoading(false);
    }
  };

  // Change location and sync
  const handleSelectLocation = (newLoc: LocationInfo) => {
    setLocation(newLoc);
  };

  return (
    <div className={`min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo & Hackathon Tag */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-800 transition-colors">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight">
                  {t.appTitle}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {t.hackathonBadge}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-stone-500 font-medium truncate max-w-[200px] sm:max-w-none">
                {t.appSubtitle}
              </div>
            </div>
          </div>

          {/* Controls: Active Location Badge & Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Profile / Location Pill */}
            <button
              onClick={() => setIsQuickConfigOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
              title="Click to edit District, Crop & Stage"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{location.district}</span>
              <span className="text-stone-300">•</span>
              <span>{CROPS_DATA[crop]?.icon} {customCropName || t.crops[crop]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl px-2.5 py-1.5 transition-colors">
                <Languages className="w-4 h-4 text-emerald-700 shrink-0" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  aria-label="Select Application Language"
                  className="bg-transparent text-xs sm:text-sm font-bold text-stone-900 focus:outline-none cursor-pointer pr-1"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeLabel} ({lang.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Google Sign-In / User Profile Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold"
                  title={`Signed in as ${currentUser.email} • Cloud Firestore Sync Active`}
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[100px]">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Sign in with Google to enable Cloud Firestore sync"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Google Sign-In</span>
              </button>
            )}
          </div>
        </div>

        {/* Translation Transparency Banner if non-English */}
        {language !== 'en' && (
          <div className="bg-amber-50/90 border-t border-amber-200 px-4 py-1.5 text-[11px] text-amber-900 text-center flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{t.disclaimer.translationNotice}</span>
          </div>
        )}

        {/* Primary Navigation Tabs */}
        <nav className="max-w-6xl mx-auto px-4 overflow-x-auto no-scrollbar border-t border-stone-100 flex items-center gap-1 sm:gap-2 py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t.nav.dashboard}</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>{t.nav.map}</span>
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'weather'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <CloudSun className="w-4 h-4" />
            <span>{t.nav.weather}</span>
          </button>

          <button
            onClick={() => setActiveTab('adviser')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'adviser'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{t.nav.adviser}</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{t.nav.saved}</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{t.nav.about}</span>
          </button>
        </nav>
      </header>

      {/* Main Screen Content */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1">
        {activeTab === 'dashboard' && (
          <DashboardScreen
            location={location}
            crop={crop}
            customCropName={customCropName}
            stage={growthStage}
            weather={weather}
            t={t}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
            onQuickAdvisory={() => handleGenerateAdvisory()}
          />
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-stone-900">Interactive Climate Map</h2>
                <p className="text-xs text-stone-500">
                  Select your district on the map or click pins to inspect agro-climatic zones and weather telemetry.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('adviser')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
              >
                Proceed to Adviser with Selected Location →
              </button>
            </div>
            <ClimateMapComponent
              currentLocation={location}
              onSelectLocation={handleSelectLocation}
              weather={weather}
              language={language}
            />
          </div>
        )}

        {activeTab === 'weather' && (
          <WeatherScreen
            location={location}
            weather={weather}
            isLoading={isWeatherLoading}
            onRefresh={() => loadWeather(location)}
            t={t}
          />
        )}

        {activeTab === 'adviser' && (
          <AdviserScreen
            location={location}
            onLocationChange={handleSelectLocation}
            crop={crop}
            onCropChange={setCrop}
            customCropName={customCropName}
            onCustomCropNameChange={setCustomCropName}
            stage={growthStage}
            onStageChange={setGrowthStage}
            language={language}
            weather={weather}
            advisory={advisory}
            isLoading={isAdvisoryLoading}
            onGenerateAdvisory={handleGenerateAdvisory}
            t={t}
          />
        )}

        {activeTab === 'saved' && (
          <SavedAdvisoriesScreen
            t={t}
            onNavigateToAdviser={() => setActiveTab('adviser')}
          />
        )}

        {activeTab === 'about' && <AboutScreen t={t} />}
      </main>

      {/* Quick Location & Crop Modal */}
      {isQuickConfigOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-lg text-stone-900">Update Farm Profile</h3>
              <button
                onClick={() => setIsQuickConfigOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700">State & District</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <select
                    value={location.state}
                    onChange={(e) => {
                      const st = INDIAN_LOCATIONS.find((s) => s.state === e.target.value);
                      if (st && st.districts.length > 0) setLocation(st.districts[0]);
                    }}
                    className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    {INDIAN_LOCATIONS.map((s) => (
                      <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                  </select>

                  <select
                    value={location.district}
                    onChange={(e) => {
                      const st = INDIAN_LOCATIONS.find((s) => s.state === location.state);
                      const d = st?.districts.find((item) => item.district === e.target.value);
                      if (d) setLocation(d);
                    }}
                    className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    {(INDIAN_LOCATIONS.find((s) => s.state === location.state)?.districts || []).map((d) => (
                      <option key={d.district} value={d.district}>{d.district}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Select Crop</label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value as CropType)}
                  className="w-full mt-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {Object.keys(CROPS_DATA).map((k) => (
                    <option key={k} value={k}>{t.crops[k as CropType] || k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">Growth Stage</label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
                  className="w-full mt-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {GROWTH_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{t.stages[s.id] || s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsQuickConfigOpen(false)}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Save & Apply Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-6 mt-12 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-extrabold text-stone-200">
              AgriShield AI — Climate Early Warning for Every Farmer
            </div>
            <p className="text-stone-400 text-[11px] max-w-xl">
              {t.weather.imdNotice} Built for the Sustainability and Social Impact Hackathon.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-400 font-medium">
            <button onClick={() => setActiveTab('about')} className="hover:text-stone-200 cursor-pointer">Sources & Transparency</button>
            <span>•</span>
            <button onClick={() => setActiveTab('weather')} className="hover:text-stone-200 cursor-pointer">IMD & Portals</button>
            <span>•</span>
            <button onClick={() => setActiveTab('saved')} className="hover:text-stone-200 cursor-pointer">Saved Farm Records</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
