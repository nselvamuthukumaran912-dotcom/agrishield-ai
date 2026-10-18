import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { LocationInfo, WeatherData } from '../types';
import { INDIAN_LOCATIONS } from '../constants/locations';
import {
  MapPin,
  AlertTriangle,
  CloudSun,
  Compass,
  ShieldCheck,
  Search,
  ExternalLink,
  Info,
  CheckCircle2,
  Layers,
  ShieldAlert,
} from 'lucide-react';

interface ClimateMapProps {
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  weather: WeatherData | null;
  language: string;
}

export const ClimateMapComponent: React.FC<ClimateMapProps> = ({
  currentLocation,
  onSelectLocation,
  weather,
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [authError, setAuthError] = useState<boolean>(false);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [center, setCenter] = useState({ lat: currentLocation.lat, lng: currentLocation.lng });
  const [zoom, setZoom] = useState(11);
  const [selectedPinInfo, setSelectedPinInfo] = useState<LocationInfo | null>(currentLocation);
  const [searchQuery, setSearchQuery] = useState('');

  // Catch global Google Maps auth failure (invalid key or unauthorized referrer)
  useEffect(() => {
    const handleAuthFailure = () => {
      setAuthError(true);
    };
    window.addEventListener('gmp-auth-failed', handleAuthFailure);
    return () => window.removeEventListener('gmp-auth-failed', handleAuthFailure);
  }, []);

  // Synchronize center when currentLocation prop changes
  useEffect(() => {
    setCenter({ lat: currentLocation.lat, lng: currentLocation.lng });
    setSelectedPinInfo(currentLocation);
  }, [currentLocation.lat, currentLocation.lng, currentLocation.district]);

  // Handle map click to pick coordinate
  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const lat = Math.round(e.detail.latLng.lat * 10000) / 10000;
      const lng = Math.round(e.detail.latLng.lng * 10000) / 10000;
      const customLoc: LocationInfo = {
        state: currentLocation.state,
        district: `${currentLocation.district.replace(/ \(Custom GPS\)/, '')} (Custom GPS)`,
        lat,
        lng,
        agroZone: currentLocation.agroZone,
        majorSoil: currentLocation.majorSoil,
      };
      onSelectLocation(customLoc);
    }
  };

  const allDistricts = INDIAN_LOCATIONS.flatMap((s) => s.districts);

  const filteredDistricts = allDistricts.filter(
    (d) =>
      d.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active verified alerts from real meteorological data only
  const activeAlerts = weather?.alerts || [];

  // RENDER: Error state or Missing Key state with labelled interactive fallback
  if (!apiKey || authError) {
    return (
      <div className="space-y-6">
        {/* Understandable Error Card */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 text-stone-800 space-y-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-200 text-amber-900 rounded-2xl shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-lg text-amber-950">
                  {!apiKey ? 'Google Maps API Key Not Found' : 'Google Maps Authentication / Referrer Error'}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  Fallback Mode Active
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {!apiKey
                  ? 'No Google Maps API key was detected in the environment. The application has automatically engaged the labelled agricultural district selector below so you can continue using all weather and Gemini advisory features.'
                  : 'Google Maps rejected the provided key. This typically occurs when the key has strict HTTP referrer restrictions that do not allow this AI Studio preview domain, or when the "Maps JavaScript API" is not enabled on your Google Cloud project.'}
              </p>

              {/* Step-by-Step Configuration Guide */}
              <div className="bg-white/80 p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
                <div className="font-bold text-amber-950">How to configure your Maps key:</div>
                <ol className="list-decimal pl-4 space-y-1 text-stone-700">
                  <li>
                    Open the <strong>Secrets</strong> panel in AI Studio and add <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[11px]">VITE_GOOGLE_MAPS_API_KEY</code>.
                  </li>
                  <li>
                    Ensure <strong>Maps JavaScript API</strong> is enabled in your Google Cloud Console.
                  </li>
                  <li>
                    If using HTTP Referrer restrictions, allow: <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[11px]">https://*.run.app/*</code>.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Labelled Fallback: Interactive Agro-District & Coordinate Selector Grid */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  Labelled Fallback Grid
                </span>
                <h4 className="font-extrabold text-base text-stone-900">
                  Select Agricultural District & GPS Location
                </h4>
              </div>
              <p className="text-xs text-stone-500">
                Click any district card below to update your farm coordinates and sync with the farmer adviser.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state or district..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredDistricts.map((loc) => {
              const isSelected = loc.district === currentLocation.district && loc.state === currentLocation.state;
              return (
                <button
                  key={`${loc.state}-${loc.district}`}
                  onClick={() => onSelectLocation(loc)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-stone-50 hover:bg-emerald-50/60 text-stone-800 border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-100' : 'text-stone-500'}`}>
                        {loc.state}
                      </span>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 bg-white/20 text-white rounded text-[10px] font-bold">
                          Active Form Selection
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-sm sm:text-base mt-0.5">{loc.district}</div>
                  </div>

                  <div className={`text-[11px] space-y-0.5 border-t pt-2 ${isSelected ? 'border-emerald-600 text-emerald-100' : 'border-stone-200 text-stone-600'}`}>
                    <div className="truncate"><strong>Zone:</strong> {loc.agroZone}</div>
                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      <Compass className="w-3 h-3" />
                      {loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°E
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Real Interactive Google Map
  return (
    <div className="space-y-4">
      {/* Map Control & Location Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
            <MapPin className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Synchronized Location</div>
            <div className="font-extrabold text-stone-900 text-base sm:text-lg flex items-center gap-2">
              <span>{currentLocation.district}, {currentLocation.state}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Centered
              </span>
            </div>
          </div>
        </div>

        {/* Quick Search Dropdown / GPS Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-mono bg-stone-100 px-3 py-2 rounded-xl text-stone-700">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>{currentLocation.lat.toFixed(4)}°N, {currentLocation.lng.toFixed(4)}°E</span>
          </div>

          <div className="relative">
            <select
              value={`${currentLocation.state}|${currentLocation.district}`}
              onChange={(e) => {
                const [st, dt] = e.target.value.split('|');
                const matched = allDistricts.find((d) => d.state === st && d.district === dt);
                if (matched) onSelectLocation(matched);
              }}
              className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 pr-8 focus:outline-emerald-600 cursor-pointer"
            >
              {allDistricts.map((d) => (
                <option key={`${d.state}-${d.district}`} value={`${d.state}|${d.district}`}>
                  {d.district} ({d.state})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Google Map Container */}
      <div className="relative w-full h-[480px] md:h-[540px] rounded-3xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100">
        <APIProvider
          apiKey={apiKey}
          onLoad={() => setIsMapReady(true)}
        >
          <Map
            center={center}
            zoom={zoom}
            mapId="DEMO_MAP_ID"
            onClick={handleMapClick}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {/* Advanced Markers for Agricultural Districts */}
            {allDistricts.map((loc) => {
              const isCurrent =
                loc.district === currentLocation.district && loc.state === currentLocation.state;
              return (
                <AdvancedMarker
                  key={`marker-${loc.state}-${loc.district}`}
                  position={{ lat: loc.lat, lng: loc.lng }}
                  onClick={() => {
                    onSelectLocation(loc);
                    setSelectedPinInfo(loc);
                  }}
                  title={`${loc.district}, ${loc.state}`}
                >
                  <Pin
                    background={isCurrent ? '#047857' : '#0284c7'}
                    borderColor={isCurrent ? '#064e3b' : '#0369a1'}
                    glyphColor="#ffffff"
                    scale={isCurrent ? 1.3 : 0.9}
                  />
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>

        {/* Loading overlay while Map initializes */}
        {!isMapReady && (
          <div className="absolute inset-0 bg-stone-100/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-20 space-y-2 pointer-events-none">
            <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs font-bold text-stone-700">
              Loading Google Maps Platform for {currentLocation.district}...
            </div>
          </div>
        )}

        {/* Verified Telemetry Risk Overlay Callout (Only Shown when Supported by Actual Data) */}
        {activeAlerts.length > 0 && (
          <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-red-200 shadow-lg z-10 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-red-900 font-extrabold">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>Verified Climate Risk Detected ({currentLocation.district})</span>
            </div>
            <p className="text-stone-700 text-[11px] leading-relaxed">
              {activeAlerts[0]?.title}: {activeAlerts[0]?.description}
            </p>
            <div className="text-[10px] text-stone-500 italic pt-1 border-t border-stone-100 flex items-center justify-between">
              <span>Source: Global Telemetry (WMO/Open-Meteo) vs IMD Thresholds</span>
              <span className="font-semibold text-red-700">Valid: {activeAlerts[0]?.validUntil.slice(0, 10)}</span>
            </div>
          </div>
        )}

        {/* Floating Pin Inspector Card */}
        {selectedPinInfo && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-stone-200 z-10 text-xs text-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 font-semibold">{selectedPinInfo.state}</span>
                <div className="font-extrabold text-sm text-emerald-950">{selectedPinInfo.district}</div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px]">
                {selectedPinInfo.district === currentLocation.district ? 'Active in Form' : 'Available'}
              </span>
            </div>

            <div className="space-y-0.5 text-stone-600 text-[11px]">
              <p><strong className="text-stone-800">Agro-Zone:</strong> {selectedPinInfo.agroZone}</p>
              <p><strong className="text-stone-800">Major Soil:</strong> {selectedPinInfo.majorSoil}</p>
            </div>

            {weather && selectedPinInfo.district === currentLocation.district && (
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-stone-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-amber-500" />
                  {weather.weatherDescription}
                </span>
                <span className="text-emerald-700 text-sm">{weather.temperature}°C</span>
              </div>
            )}

            <div className="text-[10px] text-stone-400 italic pt-1 border-t border-stone-100">
              Click anywhere on the map to pin custom field GPS coordinates.
            </div>
          </div>
        )}
      </div>

      {/* Quick District Switcher Pills */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>Quick Switch Districts (Synchronizes Map & Farmer Form):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allDistricts.map((d) => {
            const active = d.district === currentLocation.district && d.state === currentLocation.state;
            return (
              <button
                key={`map-pill-${d.state}-${d.district}`}
                onClick={() => onSelectLocation(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-700 text-white shadow-xs font-bold ring-2 ring-emerald-500/20'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {d.district}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
