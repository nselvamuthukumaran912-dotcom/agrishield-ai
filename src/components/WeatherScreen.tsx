import React from 'react';
import { LocationInfo, WeatherData } from '../types';
import { TranslationDictionary } from '../constants/languages';
import { OFFICIAL_PORTALS } from '../services/weatherService';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Info,
  CheckCircle2,
  Calendar,
  Waves,
  ShieldAlert,
  Server,
  Lock,
  Clock,
  Key,
} from 'lucide-react';

interface WeatherScreenProps {
  location: LocationInfo;
  weather: WeatherData | null;
  isLoading: boolean;
  onRefresh: () => void;
  t: TranslationDictionary;
}

export const WeatherScreen: React.FC<WeatherScreenProps> = ({
  location,
  weather,
  isLoading,
  onRefresh,
  t,
}) => {
  const isImdLive = weather?.retrievalStatus === 'live' && weather?.sourceType === 'imd_official_live';
  const isNotConfigured = weather?.retrievalStatus === 'not_configured';
  const isAccessDenied = weather?.retrievalStatus === 'access_denied';
  const isTimeout = weather?.retrievalStatus === 'timeout';
  const isInvalidResponse = weather?.retrievalStatus === 'invalid_response';

  return (
    <div className="space-y-6">
      {/* Header and Source Metadata Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-extrabold text-stone-900">
              {location.district}, {location.state} — Agro-Weather Monitor
            </h2>
            {isImdLive ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Official IMD Live Telemetry
              </span>
            ) : isNotConfigured ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                IMD API Not Connected • Secondary Telemetry Active
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-100 text-red-900 border border-red-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Live IMD Feed Unavailable
              </span>
            )}
          </div>

          <div className="text-xs text-stone-500 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span><strong>Data Source:</strong> {weather?.source || 'Pending Server Query'}</span>
            <span><strong>Retrieved:</strong> {weather?.retrievalTimestamp || 'Awaiting update'}</span>
            {weather?.observationTimestamp && (
              <span><strong>Observed At Station:</strong> {weather.observationTimestamp}</span>
            )}
            <span><strong>Agro-Climatic Zone:</strong> {location.agroZone}</span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Querying Weather Server...' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {/* Official IMD API Connection Status Notice */}
      {!isImdLive && (
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-5 text-stone-800 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200 text-amber-900 rounded-xl shrink-0 mt-0.5">
              <Server className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-amber-950">
                  {isAccessDenied
                    ? 'Live Weather Data Unavailable: Access Denied (HTTP 401/403)'
                    : isTimeout
                    ? 'Live Weather Data Unavailable: IMD Request Timed Out'
                    : isInvalidResponse
                    ? 'Live Weather Data Unavailable: Response Validation Failed'
                    : 'Live IMD Weather Data Unavailable / Not Connected'}
                </h3>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {isNotConfigured
                  ? 'To connect an authorized official India Meteorological Department (IMD) API, set the required credentials in your environment secrets. In the interim, secondary open telemetry (Open-Meteo WMO model) is displayed below so you can test all farm advisory features.'
                  : weather?.statusMessage || 'Live IMD station telemetry is currently unreachable. Consult the official government portals below.'}
              </p>
            </div>
          </div>

          {/* Exact Configuration Values Required */}
          <div className="bg-white p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-700" />
              <span>Exact Credentials Required to Activate Live Official IMD Feed:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-stone-700">
              <li>
                <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-900">IMD_API_ENDPOINT</code>: The base URL of your authorized IMD endpoint (e.g. IMD National Data Centre or GKMS station endpoint).
              </li>
              <li>
                <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-900">IMD_API_KEY</code>: The API key or token issued to your registered account by IMD.
              </li>
              <li>
                <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-900">IMD_CLIENT_ID</code>: (Optional) Your client/subscriber identifier registered with IMD.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* 1. Observed Real-Time Telemetry Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            1. Observed Ground Station Conditions
          </h3>
          <span className="text-xs text-stone-500 italic">
            {isImdLive ? 'Verified IMD AWS Surface Readings' : 'Secondary Research Telemetry'}
          </span>
        </div>

        {weather ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                <span>{t.weather.temp}</span>
                <Thermometer className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-extrabold text-stone-900 mt-2">{weather.temperature}°C</div>
              <div className="text-xs text-stone-500 mt-1">
                Day Min {weather.tempMin}°C • Day Max {weather.tempMax}°C
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                <span>{t.weather.rainfall}</span>
                <CloudRain className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-extrabold text-stone-900 mt-2">{weather.rainfall24h} mm</div>
              <div className="text-xs text-stone-500 mt-1">
                Cumulative past 24 hours
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                <span>{t.weather.humidity}</span>
                <Droplets className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-3xl font-extrabold text-stone-900 mt-2">{weather.humidity}%</div>
              <div className="text-xs text-stone-500 mt-1">
                {weather.humidity >= 80 ? 'Elevated fungal spore risk' : 'Normal transpiration range'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                <span>{t.weather.wind}</span>
                <Wind className="w-4 h-4 text-teal-500" />
              </div>
              <div className="text-3xl font-extrabold text-stone-900 mt-2">{weather.windSpeed} km/h</div>
              <div className="text-xs text-stone-500 mt-1">
                {weather.weatherDescription}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>{t.labels.statusUnavailable}</span>
            </div>
            <p className="text-xs leading-relaxed">
              We could not reach any telemetry feed for {location.district}. Please refer directly to official IMD Mausam and IMD Agromet portals.
            </p>
          </div>
        )}
      </div>

      {/* 2. Official Warnings and Agro-Meteorological Alerts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            2. Official Agro-Meteorological Alerts & Warning Signals
          </h3>
          <span className="text-xs text-stone-500">Evaluated against IMD warning criteria</span>
        </div>

        {weather?.alerts && weather.alerts.length > 0 ? (
          <div className="space-y-2.5">
            {weather.alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white border-l-4 border-l-red-500 border-stone-200 border p-4 rounded-xl shadow-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-red-900">{alert.title}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded">
                    {alert.severity} Severity
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{alert.description}</p>
                <div className="text-[10px] text-stone-400 font-medium">Valid through: {alert.validUntil.slice(0, 10)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 p-4 rounded-xl flex items-center gap-3 text-stone-700 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t.weather.noActiveAlerts}</span>
          </div>
        )}
      </div>

      {/* 3. 7-Day Agronomic Short-Range Forecast */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            3. 7-Day Agronomic Short-Range Forecast
          </h3>
          <span className="text-xs text-stone-500">Daily forecast window</span>
        </div>

        {weather?.forecast7Day && weather.forecast7Day.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {weather.forecast7Day.map((day, idx) => (
              <div
                key={day.date}
                className={`p-3 rounded-2xl border text-center space-y-2 transition-all ${
                  idx === 0
                    ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-600/20'
                    : 'bg-white border-stone-200 hover:border-emerald-200'
                }`}
              >
                <div className="text-xs font-bold text-stone-800">
                  {idx === 0 ? 'Today' : day.dayName}
                </div>
                <div className="text-xs font-semibold text-stone-500">{day.condition}</div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-stone-900">
                  <span className="text-rose-600">{day.tempMax}°</span>
                  <span className="text-stone-300">/</span>
                  <span className="text-blue-600">{day.tempMin}°</span>
                </div>
                <div className="pt-1 border-t border-stone-100 space-y-0.5">
                  <div className="text-[11px] text-blue-700 font-semibold flex items-center justify-center gap-1">
                    <CloudRain className="w-3 h-3" />
                    {day.precipitationSum} mm
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {day.precipitationProbability}% prob.
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs text-stone-500">
            Forecast trajectory currently unavailable.
          </div>
        )}
      </div>

      {/* 4. Seasonal Outlook & Climate Drivers (Scientific Transparency) */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-5 space-y-3">
        <div className="flex items-start gap-2.5">
          <Waves className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-stone-900">
              4. Seasonal Outlook & Monsoon Driver Transparency
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed">
              Monsoon dynamics across India are governed by multiple interacting oceanic and atmospheric systems. 
              <strong> El Niño / Southern Oscillation (ENSO)</strong> is an important influencer, but it is <em>not the sole explanation</em> for local rainfall variability. 
              The <strong>Indian Ocean Dipole (IOD)</strong>, the <strong>Madden-Julian Oscillation (MJO)</strong>, western disturbances, and regional land-sea thermal contrasts frequently moderate or amplify seasonal precipitation.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <strong>ENSO Index:</strong> Neutral / Under observation
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <strong>Indian Ocean Dipole (IOD):</strong> Regional equilibrium
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                <strong>MJO Wave:</strong> Periodic 30–60 day convective cycle
              </div>
            </div>

            <p className="text-[11px] text-stone-500 italic pt-1">
              Never base season-long sowing decisions exclusively on global ENSO headlines; always cross-reference IMD's monthly and seasonal localized agromet outlooks.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Official Portals Directory */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-stone-800">5. Official Government Weather & Agromet Portals</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(OFFICIAL_PORTALS).map(([key, portal]) => (
            <a
              key={key}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all flex items-start justify-between gap-3 group shadow-2xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-sm text-stone-900 group-hover:text-emerald-700">
                  {portal.name}
                </span>
                <p className="text-xs text-stone-600">{portal.description}</p>
                <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                  Visit {portal.url} →
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span>{t.weather.imdNotice}</span>
      </div>
    </div>
  );
};
