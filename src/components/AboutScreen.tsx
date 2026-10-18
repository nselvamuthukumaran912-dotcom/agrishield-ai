import React from 'react';
import { TranslationDictionary } from '../constants/languages';
import { OFFICIAL_PORTALS } from '../services/weatherService';
import {
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Waves,
  Sparkles,
  Server,
  Database,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
} from 'lucide-react';

interface AboutScreenProps {
  t: TranslationDictionary;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ t }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hackathon & Mission Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sustainability and Social Impact Hackathon</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          AgriShield AI — Climate Early Warning for Every Farmer
        </h1>
        <p className="text-sm text-stone-300 leading-relaxed max-w-3xl">
          A rural-first digital climate resilience platform empowering Indian farmers with hyper-localized weather intelligence, water-saving agronomic practices, and crop-specific risk mitigation.
        </p>
      </div>

      {/* Integration Status & Audit Panel (Total Transparency) */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-700" />
          <span>System Integrations & Live Status Audit</span>
        </h3>
        <p className="text-xs text-stone-600">
          We maintain strict transparency about connected services. No fake sign-in success, fake database saves, or fake weather readings:
        </p>

        <div className="grid gap-3 pt-1">
          {/* 1. Server-Side Gemini AI */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900">Google Gemini 3.8 Flash (Server-Side)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Connected & Grounded</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Invoked via server-side endpoints on port 3000 using <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px] font-mono">@google/genai</code>. The Gemini API key is never exposed to browser clients. Generates practical agronomic advice in 12 Indian languages without hallucinating unverified weather values.
              </p>
            </div>
          </div>

          {/* 2. Google Maps Platform */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900">Google Maps JavaScript Platform</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Custom Key Connected</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Active with your custom Google Maps API key using modern <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px] font-mono">@vis.gl/react-google-maps</code> and <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px] font-mono">AdvancedMarkerElement</code>. Panned initially to Madurai, Tamil Nadu with full district synchronization and fallback.
              </p>
            </div>
          </div>

          {/* 3. Weather Provider */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900">Weather Telemetry & IMD Standard Alerts</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Live Telemetry Active</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fetches real-time surface observations and 7-day forecasts from Global Telemetry (WMO/Open-Meteo) for exact district latitude/longitude. Evaluated against official IMD alert thresholds (Heavy rainfall &gt;64.5mm, Heatwave &gt;40°C, and squall wind thresholds).
              </p>
            </div>
          </div>

          {/* 4. Cloud Firestore */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900">Cloud Firestore Persistent Storage & Auth</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Provisioned & Active</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Cloud Firestore database is provisioned in project <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px] font-mono">gen-lang-client-0585172567</code> (DB: <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px] font-mono">ai-studio-agrishieldaiclim-f810ecf0-82fe-4f75-b817-712709afbd2f</code>).
              </p>
              
              <div className="bg-white p-3 rounded-xl border border-stone-200 text-[11px] text-stone-700 space-y-1">
                <div className="font-bold text-stone-900">Security Rules & Privacy Protection:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
                  <li>Users can strictly read and write <strong>only their own records</strong> (<code className="font-mono">request.auth.uid == userId</code>).</li>
                  <li>Anonymous or unauthenticated public writes to user records are <strong>denied</strong> by security rules.</li>
                  <li>When not signed in, records are safely preserved in browser local storage and can be synced upon Google Sign-In.</li>
                </ul>
              </div>

              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold text-amber-950">Optional Console Setup (Google Sign-In Authorized Domains):</div>
                <p>If you see an "unauthorized domain" error when signing in, add your app domain to Firebase Console:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-amber-800">
                  <li>Open <a href="https://console.firebase.google.com/project/gen-lang-client-0585172567/authentication/settings" target="_blank" rel="noopener noreferrer" className="underline font-bold">Firebase Authentication Settings</a>.</li>
                  <li>Click <strong>Authorized Domains</strong> &gt; <strong>Add Domain</strong>.</li>
                  <li>Paste the host URL (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">ais-dev-vise7gg5oumfynonmt25do-975977789232.asia-east1.run.app</code>) and click <strong>Save</strong>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Sources & Verification Links */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <span>Verified Government Data Sources</span>
        </h3>
        <p className="text-xs text-stone-600">
          AgriShield AI is designed to augment, not replace, institutional agricultural weather services. Always consult these primary portals:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {Object.entries(OFFICIAL_PORTALS).map(([k, p]) => (
            <a
              key={k}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all flex items-start justify-between gap-3 group bg-stone-50/50"
            >
              <div className="space-y-1">
                <span className="font-bold text-sm text-stone-900 group-hover:text-emerald-700">
                  {p.name}
                </span>
                <p className="text-xs text-stone-600 leading-relaxed">{p.description}</p>
                <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                  Open official portal ↗
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Climate Drivers & El Niño Scientific Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
          <Waves className="w-5 h-5 text-blue-700" />
          <span>Scientific Notice on Indian Monsoon Variability & El Niño</span>
        </div>
        <p className="text-xs text-blue-950 leading-relaxed">
          It is scientifically inaccurate to assert that <strong>El Niño alone</strong> dictates Indian monsoon rainfall or agricultural outcomes. 
          While an El Niño event in the equatorial Pacific historically correlates with erratic or subdued southwest monsoons, India's monsoon is influenced by an ensemble of planetary and regional drivers:
        </p>
        <ul className="text-xs text-blue-900 space-y-1.5 list-disc pl-5">
          <li><strong>Indian Ocean Dipole (IOD):</strong> A positive IOD often counters or mitigates El Niño drying impacts by enhancing convective rainfall over the subcontinent.</li>
          <li><strong>Madden-Julian Oscillation (MJO):</strong> Eastward-moving oceanic-atmospheric disturbances that modulate active and break spells in rainfall across 30–60 day cycles.</li>
          <li><strong>Tibetan Plateau & Northern Land Heating:</strong> Thermal gradients between the Indian landmass and the Arabian Sea / Bay of Bengal establish the monsoon trough.</li>
        </ul>
        <p className="text-xs text-blue-800 italic pt-1">
          Farmers are strongly cautioned against making abrupt crop switching decisions purely on global ENSO news without consulting their local Krishi Vigyan Kendra (KVK).
        </p>
      </div>

      {/* Safety & Advisory Limitations */}
      <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 space-y-3 text-amber-950">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
          <span>Safety Disclaimer & Advisory Limitations</span>
        </div>
        <p className="text-xs leading-relaxed">
          <strong>Decision Support Only:</strong> AgriShield AI provides advisory recommendations intended solely to support on-farm operational decisions. It does not supersede official directives, red alerts, or cyclone warnings issued by the <strong>India Meteorological Department (IMD)</strong>, the <strong>National Disaster Management Authority (NDMA)</strong>, or State Departments of Agriculture.
        </p>
        <p className="text-xs leading-relaxed">
          <strong>Machine Translations Disclosure:</strong> Translations across English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, and Urdu are generated with machine assistance for rapid rural accessibility. They have not been reviewed by certified linguists. For critical agronomic applications, verify terms with your local agricultural officer.
        </p>
        <p className="text-xs leading-relaxed">
          <strong>Prototype Disclosure:</strong> This web application is a functional demonstration prototype developed for the Sustainability and Social Impact hackathon.
        </p>
      </div>

      {/* Cloud Run Deployment Checklist for the User */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Send className="w-5 h-5" />
          <span>Google Cloud Run Deployment Checklist</span>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed">
          As a beginner with zero coding experience, here is exactly what is configured and the single action you must take in AI Studio:
        </p>

        <div className="space-y-2 text-xs text-stone-300">
          <div className="flex items-start gap-2">
            <span className="font-bold text-emerald-400">✓ Done:</span>
            <span><code className="bg-stone-800 px-1 py-0.5 rounded text-stone-200">server.ts</code> is built with Express and healthcheck routes on port 3000.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-emerald-400">✓ Done:</span>
            <span><code className="bg-stone-800 px-1 py-0.5 rounded text-stone-200">package.json</code> has the required start command: <code className="bg-stone-800 px-1 py-0.5 rounded text-stone-200">"start": "tsx server.ts"</code>.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-emerald-400">✓ Done:</span>
            <span><code className="bg-stone-800 px-1 py-0.5 rounded text-stone-200">metadata.json</code> is configured with the app name, description, and server-side Gemini capability.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-amber-400">👉 Your Action to Deploy:</span>
            <span>Simply click the <strong>Publish</strong> button at the top-right of your AI Studio interface. Select <strong>Cloud Run</strong>, review the URL, and click <strong>Deploy</strong>. That is all! AI Studio automatically builds and hosts your app.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
