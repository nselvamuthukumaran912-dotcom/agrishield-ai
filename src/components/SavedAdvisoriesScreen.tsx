import React, { useState, useEffect } from 'react';
import { SavedAdvisory } from '../types';
import { TranslationDictionary } from '../constants/languages';
import {
  deleteSavedAdvisory,
  exportAdvisoriesToJson,
  getSavedAdvisories,
  fetchCloudAdvisories,
  getStorageStatus,
} from '../services/storageService';
import { auth, signInWithGoogle, onAuthStateChanged } from '../services/firebase';
import {
  Bookmark,
  Calendar,
  Trash2,
  Download,
  Printer,
  Droplets,
  CheckCircle2,
  Database,
  Cloud,
  CloudOff,
  Filter,
  ArrowRight,
  ShieldAlert,
  LogIn,
  RefreshCw,
} from 'lucide-react';

interface SavedAdvisoriesProps {
  t: TranslationDictionary;
  onNavigateToAdviser: () => void;
}

export const SavedAdvisoriesScreen: React.FC<SavedAdvisoriesProps> = ({
  t,
  onNavigateToAdviser,
}) => {
  const [advisories, setAdvisories] = useState<SavedAdvisory[]>(() => getSavedAdvisories());
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const storageStatus = getStorageStatus();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        setIsSyncing(true);
        setSyncError(null);
        const res = await fetchCloudAdvisories();
        setAdvisories(res.list);
        if (res.error) setSyncError(res.error);
        setIsSyncing(false);
      }
    });
    return () => unsub();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    const res = await fetchCloudAdvisories();
    setAdvisories(res.list);
    if (res.error) setSyncError(res.error);
    setIsSyncing(false);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleConfirmDelete = async (id: string) => {
    await deleteSavedAdvisory(id);
    setDeleteConfirmId(null);
    setAdvisories(getSavedAdvisories());
  };

  const handleExport = () => {
    const jsonStr = exportAdvisoriesToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrishield-farm-records-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = advisories.filter((a) => {
    if (filterCrop === 'all') return true;
    return a.crop === filterCrop;
  });

  const uniqueCrops = Array.from(new Set(advisories.map((a) => a.crop)));

  return (
    <div className="space-y-6">
      {/* Storage Architecture & Status Banner */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0 mt-0.5">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                Farm Advisory History & Cloud Sync Status
              </h3>
              {currentUser ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  Cloud Firestore Active ({currentUser.email})
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1">
                  <CloudOff className="w-3 h-3 text-stone-500" />
                  Local Persistent Storage
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
              {currentUser
                ? `Cloud Firestore is active and securely synced. You have ${advisories.length} advisory records in your farm cloud database.`
                : `Local persistent storage is active with ${advisories.length} advisory records. Sign in with Google above to synchronize your farm advisories with Cloud Firestore across all your devices.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentUser && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>
          )}

          {!currentUser && (
            <button
              onClick={() => signInWithGoogle()}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Sync</span>
            </button>
          )}

          <button
            onClick={handleExport}
            disabled={advisories.length === 0}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Real Firestore Sync Error Alert if any */}
      {syncError && (
        <div className="bg-red-50 border border-red-300 p-4 rounded-2xl text-red-950 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-extrabold text-sm">Cloud Firestore Sync Notice:</span>
            <p className="leading-relaxed">{syncError}</p>
            <p className="text-[11px] text-red-800">
              Your records remain intact in local storage. Click "Sync Cloud" above once your connection is restored.
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      {advisories.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Filter by Crop:</span>
            <select
              value={filterCrop}
              onChange={(e) => setFilterCrop(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-medium text-stone-800"
            >
              <option value="all">All Crops ({advisories.length})</option>
              {uniqueCrops.map((c) => (
                <option key={c} value={c}>
                  {t.crops[c as keyof typeof t.crops] || c}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-stone-500">
            Showing {filtered.length} of {advisories.length} saved records
          </div>
        </div>
      )}

      {/* Advisory Cards List */}
      {filtered.length > 0 ? (
        <div className="grid gap-4">
          {filtered.map((item) => {
            const cropTitle = item.customCropName || t.crops[item.crop] || item.crop;
            const stageTitle = t.stages[item.stage] || item.stage;
            const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:border-emerald-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-stone-900">
                        {cropTitle} — {stageTitle}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.advisory.climateRiskLevel === 'severe'
                            ? 'bg-red-100 text-red-800'
                            : item.advisory.climateRiskLevel === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.advisory.climateRiskLevel} Risk
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{item.district}, {item.state}</span>
                      <span>•</span>
                      <span>{item.weatherSummary.temperature}°C ({item.weatherSummary.condition})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Print Advisory"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-200">
                        <span className="text-[11px] font-bold text-red-900 px-1">Delete?</span>
                        <button
                          onClick={() => handleConfirmDelete(item.id)}
                          className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                  {item.advisory.summary}
                </p>

                {/* Data Model Verification: Weather Status, Location, Sources & Cloud Status */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold border ${
                      item.weatherStatus === 'live'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    Telemetry: {item.weatherStatus === 'live' ? 'Live Telemetry' : 'Offline / Unavailable'}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    Source: {item.sourceReferences || 'Global Telemetry & IMD Agromet Framework'}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                    Language: {item.language.toUpperCase()}
                  </span>

                  {item.syncedToCloud ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold flex items-center gap-1">
                      <Cloud className="w-3 h-3 text-emerald-600" />
                      Cloud Firestore Synced
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium flex items-center gap-1">
                      <CloudOff className="w-3 h-3 text-stone-400" />
                      Local Device Only
                    </span>
                  )}
                </div>

                {/* 3 Recommendations snapshot */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Actionable Recommendations:</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {item.advisory.recommendations.map((rec, i) => (
                      <div key={i} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                        <div className="font-bold text-stone-900 truncate">{i + 1}. {rec.title}</div>
                        <p className="text-stone-600 text-[11px] line-clamp-3 leading-snug">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Water Saving */}
                {item.advisory.waterSavingPractices[0] && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-start gap-2.5 text-xs">
                    <Droplets className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-blue-950">{item.advisory.waterSavingPractices[0].title}:</strong>{' '}
                      <span className="text-blue-900/90">{item.advisory.waterSavingPractices[0].technique}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white p-10 rounded-3xl border border-stone-200 text-center space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-3xl flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-stone-900">No Saved Farm Advisories Yet</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Whenever you generate an advisory on the Farmer Adviser screen, click <strong>"{t.advisory.buttonSave}"</strong> to save your record here for offline field reference.
            </p>
          </div>
          <button
            onClick={onNavigateToAdviser}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Go to Farmer Adviser</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
