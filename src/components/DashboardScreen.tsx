import React from 'react';
import { CropType, GrowthStage, LocationInfo, WeatherData } from '../types';
import { TranslationDictionary } from '../constants/languages';
import { CROPS_DATA } from '../constants/crops';
import { OFFICIAL_PORTALS } from '../services/weatherService';
import {
  ShieldAlert,
  Droplets,
  Thermometer,
  Wind,
  CloudRain,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  Compass,
} from 'lucide-react';

interface DashboardProps {
  location: LocationInfo;
  crop: CropType;
  customCropName?: string;
  stage: GrowthStage;
  weather: WeatherData | null;
  t: TranslationDictionary;
  onNavigateTab: (tab: string) => void;
  onQuickAdvisory: () => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({
  location,
  crop,
  customCropName,
  stage,
  weather,
  t,
  onNavigateTab,
  onQuickAdvisory,
}) => {
  const cropMeta = CROPS_DATA[crop] || CROPS_DATA.other;
  const cropDisplayName = customCropName || t.crops[crop] || crop;
  const stageDisplayName = t.stages[stage] || stage;

  // Primary active alerts if any
  const activeAlerts = weather?.alerts || [];

  return (
    <div className="space-y-6">
      {/* Farmer Active Profile Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 md:p-7 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center text-9xl">
          🌾
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Farm Climate Monitor
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {location.district}, {location.state}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm text-emerald-100 font-medium">
              <span className="bg-white/15 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <span className="text-base">{cropMeta.icon}</span>
                <strong>{t.labels.crop}:</strong> {cropDisplayName}
              </span>
              <span className="bg-white/15 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-300" />
                <strong>{t.labels.stage}:</strong> {stageDisplayName}
              </span>
              <span className="bg-white/15 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-300" />
                {location.agroZone}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onQuickAdvisory}
              className="px-5 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-stone-900 fill-stone-900" />
              <span>{t.advisory.buttonGenerate}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('map')}
              className="px-4 py-3.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>{t.nav.map}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Climate Alerts Section */}
      {activeAlerts.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-800">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span>Active Agro-Meteorological Warnings ({activeAlerts.length})</span>
          </div>
          <div className="grid gap-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs ${
                  alert.severity === 'severe'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : alert.severity === 'high'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-orange-50 border-orange-200 text-orange-950'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    alert.severity === 'severe' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base">{alert.title}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                      {alert.severity} Risk
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-900">
          <div className="p-2 bg-emerald-600 text-white rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm font-medium">
            <strong>{t.weather.noActiveAlerts}</strong> Conditions are currently stable for {cropDisplayName} in {location.district}. Continue normal field monitoring.
          </div>
        </div>
      )}

      {/* Real-time Weather Grid */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-bold text-stone-800 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-emerald-600" />
            <span>{t.weather.currentConditions}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.labels.dataTimestamp}: {weather?.retrievalTimestamp || 'Just now'}</span>
          </div>
        </div>

        {weather ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Temperature */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">{t.weather.temp}</span>
                <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Thermometer className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">{weather.temperature}°C</div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Min {weather.tempMin}°C • Max {weather.tempMax}°C
                </div>
              </div>
            </div>

            {/* Rainfall */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">{t.weather.rainfall}</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <CloudRain className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">{weather.rainfall24h} mm</div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {weather.rainfall24h > 5 ? 'Active Rainfall' : 'No significant rain'}
                </div>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">{t.weather.humidity}</span>
                <span className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                  <Droplets className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">{weather.humidity}%</div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {weather.humidity > 80 ? 'High Pathogen Risk' : 'Optimal transpiration'}
                </div>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">{t.weather.wind}</span>
                <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Wind className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">{weather.windSpeed} km/h</div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {weather.weatherDescription}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="font-bold text-stone-800">{t.labels.statusUnavailable}</div>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              Telemetry feed is temporarily disconnected. Check the official portal links below for district bulletins.
            </p>
          </div>
        )}
      </div>

      {/* Water Conservation Practice Card */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>Water Conservation Tip of the Day</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            {crop === 'paddy'
              ? 'Alternate Wetting and Drying (AWD) for Paddy'
              : crop === 'sugarcane'
              ? 'Trash Mulching & Drip Fertigation for Sugarcane'
              : 'Evening Root-Zone Irrigation & In-Situ Mulching'}
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            {crop === 'paddy'
              ? 'In Madurai and southern basins, inserting a perforated field water pipe allows monitoring water table recedence down to 15 cm before reflooding, cutting water consumption by 25-30% without affecting tillering.'
              : `At the ${stageDisplayName} stage, avoid daytime overhead sprinkling. Irrigate between 6:00 PM and 6:00 AM to eliminate 40% evaporative loss under current ambient temperatures.`}
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('adviser')}
          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs sm:text-sm shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Explore Water Guidance</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Official Portals Gateway */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-stone-800">Official Government Agromet & Weather Gateways</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(OFFICIAL_PORTALS).map(([key, portal]) => (
            <a
              key={key}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 bg-white hover:bg-emerald-50/50 rounded-2xl border border-stone-200 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900 group-hover:text-emerald-700 transition-colors">
                    {portal.name}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">{portal.description}</p>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold pt-2 mt-2 border-t border-stone-100">
                Open Official Portal →
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
