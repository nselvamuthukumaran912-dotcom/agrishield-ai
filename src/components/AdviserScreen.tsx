import React, { useState } from 'react';
import { CropType, GeminiAdvisoryResponse, GrowthStage, LanguageCode, LocationInfo, SavedAdvisory, WeatherData } from '../types';
import { TranslationDictionary } from '../constants/languages';
import { CROPS_DATA, GROWTH_STAGES } from '../constants/crops';
import { INDIAN_LOCATIONS } from '../constants/locations';
import { saveAdvisoryRecord } from '../services/storageService';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Bookmark,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  Info,
  Clock,
  Radio,
} from 'lucide-react';

interface AdviserScreenProps {
  location: LocationInfo;
  onLocationChange: (loc: LocationInfo) => void;
  crop: CropType;
  onCropChange: (c: CropType) => void;
  customCropName: string;
  onCustomCropNameChange: (name: string) => void;
  stage: GrowthStage;
  onStageChange: (s: GrowthStage) => void;
  language: LanguageCode;
  weather: WeatherData | null;
  advisory: GeminiAdvisoryResponse | null;
  isLoading: boolean;
  onGenerateAdvisory: (customQuestion?: string) => void;
  t: TranslationDictionary;
}

export const AdviserScreen: React.FC<AdviserScreenProps> = ({
  location,
  onLocationChange,
  crop,
  onCropChange,
  customCropName,
  onCustomCropNameChange,
  stage,
  onStageChange,
  language,
  weather,
  advisory,
  isLoading,
  onGenerateAdvisory,
  t,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [, setSaveSuccess] = useState(false);

  // States & districts dropdown
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = INDIAN_LOCATIONS.find((s) => s.state === e.target.value);
    if (selectedState && selectedState.districts.length > 0) {
      onLocationChange(selectedState.districts[0]);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = INDIAN_LOCATIONS.find((s) => s.state === location.state);
    if (selectedState) {
      const dist = selectedState.districts.find((d) => d.district === e.target.value);
      if (dist) onLocationChange(dist);
    }
  };

  const currentStateData = INDIAN_LOCATIONS.find((s) => s.state === location.state) || INDIAN_LOCATIONS[0];

  const isLiveTelemetry = Boolean(weather && (weather.retrievalStatus === 'live' || weather.sourceType === 'imd_official_live'));

  // Text to speech handler in native language
  const handleSpeak = () => {
    if (!advisory) return;

    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      setSaveFeedback({
        type: 'error',
        message: 'Audio speech playback is not supported in this browser.',
      });
      return;
    }

    const evidenceText = advisory.evidenceSummary?.text || advisory.summary;
    const actionsText = advisory.recommendations
      .map((r, i) => `Action ${i + 1}: ${r.title}. ${r.action}`)
      .join('. ');
    const waterText = advisory.waterConservation?.guidance || advisory.waterSavingPractices?.[0]?.technique || '';
    const uncertaintyText = advisory.uncertaintyAndSource?.uncertaintyNote || advisory.uncertaintyNotes || '';
    const mandatoryNotice = 'For decisions affected by weather warnings, verify the latest official IMD advisory and consult a local agricultural extension officer.';

    const textToSpeak = `${evidenceText}. ${actionsText}. Water guidance: ${waterText}. ${uncertaintyText}. ${mandatoryNotice}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const langVoice = voices.find((v) => v.lang.startsWith(language));
    if (langVoice) utterance.voice = langVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: 'idle' | 'saving' | 'success_cloud' | 'success_local' | 'error';
    message: string;
    id?: string;
  }>({ type: 'idle', message: '' });

  // Save to persistent farm record
  const handleSave = async () => {
    if (!advisory) return;
    setIsSaving(true);
    setSaveFeedback({ type: 'saving', message: 'Saving advisory record to Cloud Firestore...' });

    const evidenceSummaryText = advisory.evidenceSummary?.text || advisory.summary;
    const waterGuidance = advisory.waterConservation?.guidance || advisory.waterSavingPractices?.[0]?.technique || '';
    const uncertaintyText = advisory.uncertaintyAndSource?.uncertaintyNote || advisory.uncertaintyNotes || '';

    const fullAdviceText = `1. EVIDENCE SUMMARY:\n${evidenceSummaryText}\n\n2. THREE PRACTICAL ACTIONS:\n${advisory.recommendations
      .map((r, i) => `${i + 1}. [${r.urgency.toUpperCase()}] ${r.title}: ${r.action}`)
      .join('\n')}\n\n3. WATER CONSERVATION:\n${waterGuidance}\n\n4. UNCERTAINTY & OFFICIAL SOURCE:\n${uncertaintyText}\n\nNOTICE: For decisions affected by weather warnings, verify the latest official IMD advisory and consult a local agricultural extension officer.`;

    const record: SavedAdvisory = {
      id: `adv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      state: location.state,
      district: location.district,
      lat: location.lat,
      lng: location.lng,
      crop,
      customCropName: crop === 'other' ? customCropName : undefined,
      stage,
      growthStage: stage,
      language,
      adviceText: fullAdviceText,
      sourceReferences: advisory.uncertaintyAndSource?.preservedSource || weather?.source || 'IMD Agromet Framework',
      weatherStatus: weather ? (weather.retrievalStatus || 'live') : 'unavailable',
      weatherSummary: {
        temperature: weather?.temperature ?? 30,
        rainfall: weather?.rainfall24h ?? 0,
        condition: weather?.weatherDescription ?? 'Observed telemetry',
      },
      advisory,
      syncedToCloud: false,
    };

    const res = await saveAdvisoryRecord(record);
    setIsSaving(false);

    if (res.success) {
      if (res.savedToCloud) {
        setSaveFeedback({
          type: 'success_cloud',
          message: `Saved to Cloud Firestore! Document ID: ${res.id}`,
          id: res.id,
        });
      } else {
        setSaveFeedback({
          type: 'success_local',
          message: `${res.message} (ID: ${res.id})`,
          id: res.id,
        });
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } else {
      setSaveFeedback({
        type: 'error',
        message: res.message || 'Failed to save to Firestore.',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Permanent Visible Official Notice as required */}
      <div className="bg-amber-50 border-2 border-amber-300/80 p-4 rounded-3xl shadow-xs flex items-start gap-3.5">
        <div className="p-2 bg-amber-500 text-white rounded-2xl shrink-0 mt-0.5 shadow-xs">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
              Official Safety Protocol
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
            For decisions affected by weather warnings, verify the latest official IMD advisory and consult a local agricultural extension officer.
          </p>
        </div>
      </div>

      {/* Configuration & Farmer Selection Form */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900">
              Evidence-Aware Gemini Farmer Adviser
            </h2>
            <p className="text-xs text-stone-500">
              Strictly grounded recommendations based on verified telemetry and official IMD Agromet guidelines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gemini 3.8 Flash</span>
            </span>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* State */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
              <span>{t.labels.state}</span>
            </label>
            <div className="relative">
              <select
                value={location.state}
                onChange={handleStateChange}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-stone-900 appearance-none pr-8 focus:outline-emerald-600"
              >
                {INDIAN_LOCATIONS.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* District */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
              <span>{t.labels.district}</span>
            </label>
            <div className="relative">
              <select
                value={location.district}
                onChange={handleDistrictChange}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-stone-900 appearance-none pr-8 focus:outline-emerald-600"
              >
                {currentStateData.districts.map((d) => (
                  <option key={d.district} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Crop */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
              <span>{t.labels.crop}</span>
            </label>
            <div className="relative">
              <select
                value={crop}
                onChange={(e) => onCropChange(e.target.value as CropType)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-stone-900 appearance-none pr-8 focus:outline-emerald-600"
              >
                {Object.keys(CROPS_DATA).map((cropKey) => (
                  <option key={cropKey} value={cropKey}>
                    {t.crops[cropKey as CropType] || cropKey}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Growth Stage */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
              <span>{t.labels.stage}</span>
            </label>
            <div className="relative">
              <select
                value={stage}
                onChange={(e) => onStageChange(e.target.value as GrowthStage)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium text-stone-900 appearance-none pr-8 focus:outline-emerald-600"
              >
                {GROWTH_STAGES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {t.stages[st.id] || st.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Custom Crop Name if 'Other' is chosen */}
        {crop === 'other' && (
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-stone-700">Specify Crop Name:</label>
            <input
              type="text"
              value={customCropName}
              onChange={(e) => onCustomCropNameChange(e.target.value)}
              placeholder={t.labels.customCropPlaceholder}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-900 focus:outline-emerald-600"
            />
          </div>
        )}

        {/* Optional Custom Farmer Question */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
            <span>{t.advisory.askCustomPrompt}</span>
          </label>
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder={t.advisory.askPlaceholder}
            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 focus:outline-emerald-600 placeholder:text-stone-400"
          />
        </div>

        {/* Grounding Status Indicator & Generate Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs">
            {isLiveTelemetry ? (
              <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Verified Telemetry: {weather?.temperature}°C • {weather?.weatherDescription} ({weather?.source})</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>Live weather data unavailable / not connected (General guidance mode)</span>
              </span>
            )}
          </div>

          <button
            onClick={() => onGenerateAdvisory(customQuestion)}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? t.advisory.buttonGenerating : t.advisory.buttonGenerate}</span>
          </button>
        </div>
      </div>

      {/* Advisory Output Display - 4 Mandatory Sections */}
      {advisory ? (
        <div className="bg-white p-5 md:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
          {/* Header with Risk Level and Action Tools */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full border ${
                    advisory.climateRiskLevel === 'severe'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : advisory.climateRiskLevel === 'high'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : advisory.climateRiskLevel === 'moderate'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {advisory.climateRiskLevel} Climate Risk
                </span>
                <span className="text-xs text-stone-400">• {new Date(advisory.timestamp).toLocaleTimeString()}</span>
              </div>
              <h3 className="text-xl font-extrabold text-stone-900">
                {t.crops[crop] || crop} — {t.stages[stage] || stage} ({location.district}, {location.state})
              </h3>
            </div>

            {/* Field Tools (Listen, Save, Print) */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <button
                onClick={handleSpeak}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
                <span>{isSpeaking ? t.advisory.buttonStopAudio : t.advisory.buttonListen}</span>
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSaving
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : saveFeedback.type === 'success_cloud'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : saveFeedback.type === 'error'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                }`}
              >
                <Bookmark className="w-4 h-4 text-amber-600" />
                <span>
                  {isSaving
                    ? 'Saving to Firestore...'
                    : saveFeedback.type === 'success_cloud'
                    ? 'Saved to Cloud Firestore'
                    : t.advisory.buttonSave}
                </span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-stone-600" />
                <span>{t.advisory.buttonPrint}</span>
              </button>
            </div>
          </div>

          {/* Real Save Feedback Banner */}
          {saveFeedback.type !== 'idle' && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                saveFeedback.type === 'saving'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : saveFeedback.type === 'success_cloud'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : saveFeedback.type === 'success_local'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-red-50 border-red-200 text-red-950'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {saveFeedback.type === 'saving' && <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>}
                {saveFeedback.type === 'success_cloud' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {saveFeedback.type === 'success_local' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                {saveFeedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
              </div>
              <div className="space-y-1">
                <div className="font-bold">{saveFeedback.message}</div>
                {saveFeedback.type === 'error' && (
                  <div className="text-[11px] text-red-800 space-y-0.5">
                    <p>Troubleshooting Firestore: Ensure you are signed in via Google Sign-In and your internet connection is active.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 1: Brief summary of the available evidence */}
          <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h4 className="font-extrabold text-sm text-stone-900">
                  Summary of Available Evidence
                </h4>
              </div>
              {advisory.evidenceSummary?.hasLiveData ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span>Verified Telemetry: {advisory.evidenceSummary.sourceName}</span>
                  {advisory.evidenceSummary.sourceTimestamp && (
                    <span className="text-emerald-700 text-[10px] flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(advisory.evidenceSummary.sourceTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Info className="w-3 h-3 text-amber-700" />
                  <span>General Guidance (Live Telemetry Unavailable)</span>
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-stone-800 leading-relaxed">
              {advisory.evidenceSummary?.text || advisory.summary}
            </p>
          </div>

          {/* SECTION 2: Three practical actions the farmer can consider */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                2
              </span>
              <h4 className="font-extrabold text-base text-stone-900">
                Three Practical Actions for the Farmer
              </h4>
            </div>
            <div className="grid gap-3">
              {advisory.recommendations.slice(0, 3).map((rec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-start gap-3.5 shadow-2xs hover:bg-stone-50 transition-colors"
                >
                  <span className="w-7 h-7 rounded-xl bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-stone-900">{rec.title}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          rec.urgency === 'immediate'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : rec.urgency === 'next_24h'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {rec.urgency.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Water-conservation guidance relevant to the crop and stage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                3
              </span>
              <h4 className="font-extrabold text-base text-stone-900">
                Water-Conservation Guidance ({t.crops[crop] || crop} at {t.stages[stage] || stage} stage)
              </h4>
            </div>

            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60 flex items-start gap-3.5">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-extrabold text-sm text-blue-950">
                    {advisory.waterConservation?.techniqueName || advisory.waterSavingPractices?.[0]?.title || 'Crop-Stage Water Conservation'}
                  </span>
                  {(advisory.waterConservation?.estimatedSavings || advisory.waterSavingPractices?.[0]?.estimatedSavingsPercent) && (
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-900 border border-blue-300">
                      {advisory.waterConservation?.estimatedSavings || `~${advisory.waterSavingPractices[0].estimatedSavingsPercent}% Water Saved`}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-blue-950/90 leading-relaxed font-medium">
                  {advisory.waterConservation?.guidance || advisory.waterSavingPractices?.[0]?.technique}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: Clear uncertainty note and an official source link */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                4
              </span>
              <h4 className="font-extrabold text-base text-stone-900">
                Uncertainty Note & Official Source Link
              </h4>
            </div>

            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 space-y-3.5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-xs uppercase text-amber-900 tracking-wider">
                    Scientific Uncertainty & Microclimate Note
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                    {advisory.uncertaintyAndSource?.uncertaintyNote || advisory.uncertaintyNotes}
                  </p>
                </div>
              </div>

              {/* Preserved Telemetry Source Details if Real Data Used */}
              {advisory.uncertaintyAndSource?.preservedSource && (
                <div className="text-[11px] bg-white/70 border border-amber-200 rounded-xl p-2.5 text-stone-700 flex flex-wrap items-center gap-2">
                  <span className="font-bold">Preserved Ground Truth:</span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono text-[10px]">
                    {advisory.uncertaintyAndSource.preservedSource}
                  </span>
                  {advisory.uncertaintyAndSource.preservedTimestamp && (
                    <span className="text-stone-500">
                      (Telemetry recorded: {new Date(advisory.uncertaintyAndSource.preservedTimestamp).toLocaleString()})
                    </span>
                  )}
                </div>
              )}

              {/* Official Source Links */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-amber-200/60">
                <span className="text-xs font-bold text-amber-950">Official Weather Portals:</span>
                <a
                  href="https://agromet.imd.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 shadow-2xs transition-colors"
                >
                  <span>IMD Agromet Advisory Service</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                </a>
                <a
                  href="https://mausam.imd.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 shadow-2xs transition-colors"
                >
                  <span>IMD Mausam Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Initial State */
        <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-stone-800">Ready to Generate Evidence-Aware Advisory</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Select your district, crop, and current growth stage above, then click <strong>"{t.advisory.buttonGenerate}"</strong> to receive strictly evidence-aware guidance with 4 structured sections.
          </p>
        </div>
      )}
    </div>
  );
};
