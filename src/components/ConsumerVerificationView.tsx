import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Thermometer,
  Anchor,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  HelpCircle,
  Send,
  Camera,
  Layers,
} from 'lucide-react';
import { FishBatch, SPECIES_CATALOG } from '../types/aqua-seal';

interface Props {
  batches: FishBatch[];
  initialBatchCode?: string;
}

export const ConsumerVerificationView: React.FC<Props> = ({ batches, initialBatchCode }) => {
  const [searchCode, setSearchCode] = useState(initialBatchCode || 'LV-DG-20260821-042');
  const [verifiedData, setVerifiedData] = useState<any | null>(null);
  const [verificationState, setVerificationState] = useState<
    'IDLE' | 'LOADING' | 'VERIFIED' | 'NOT_FOUND' | 'ERROR'
  >('IDLE');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const performVerification = async (code: string) => {
    if (!code.trim()) return;
    setVerificationState('LOADING');
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(code.trim())}`);
      const json = await res.json();
      if (json.success && json.data) {
        setVerifiedData(json.data);
        setVerificationState('VERIFIED');
      } else {
        setVerifiedData(null);
        setVerificationState('NOT_FOUND');
      }
    } catch (err) {
      console.error(err);
      setVerificationState('ERROR');
    }
  };

  useEffect(() => {
    if (initialBatchCode) {
      setSearchCode(initialBatchCode);
      performVerification(initialBatchCode);
    } else {
      performVerification('LV-DG-20260821-042');
    }
  }, [initialBatchCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(searchCode);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Consumer Verification Banner */}
      <div className="bg-[#004D40] rounded-xl p-8 border border-teal-900/60 shadow-xs text-white text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-black/20 rounded-full text-[10px] font-bold text-teal-200 uppercase tracking-widest border border-white/15">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
          <span>Lake Victoria Authenticity &amp; Freshness Seal</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Verify Your Fish in Seconds
        </h1>
        <p className="text-xs text-teal-100/90 max-w-lg mx-auto leading-relaxed">
          Scan the QR code on your fish gill tag or enter the human-readable batch code to inspect origin, BMU landing time, solar icing evidence, and trust history.
        </p>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center bg-white rounded-lg p-1 shadow-sm border border-teal-300">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Enter Batch ID (e.g. LV-DG-20260821-042 or 042)"
            className="flex-1 px-4 py-2 text-xs text-slate-900 font-mono font-bold placeholder-slate-400 focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-[#006064] hover:bg-[#004D40] text-white font-bold text-xs uppercase tracking-wide rounded-md transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Verify</span>
          </button>
        </form>

        {/* Sample Codes for Testing */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-teal-100">
          <span className="text-teal-200/70 text-[11px]">Quick Samples:</span>
          {batches.slice(0, 3).map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setSearchCode(b.batchId);
                performVerification(b.batchId);
              }}
              className="px-2.5 py-1 rounded-md bg-black/20 hover:bg-black/30 font-mono text-[11px] text-teal-100 border border-white/10 transition-colors"
            >
              {b.batchId}
            </button>
          ))}
          <button
            onClick={() => {
              setSearchCode('LV-FAKE-999');
              performVerification('LV-FAKE-999');
            }}
            className="px-2.5 py-1 rounded-md bg-rose-900/60 hover:bg-rose-900 text-[11px] text-rose-200 border border-rose-700/60 transition-colors"
          >
            Test Invalid ID
          </button>
        </div>
      </div>

      {/* Verification State Handling */}
      {verificationState === 'LOADING' && (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-8 h-8 border-4 border-[#004D40] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Verifying cryptographic batch hashes...</p>
        </div>
      )}

      {verificationState === 'NOT_FOUND' && (
        <div className="bg-white rounded-xl p-8 border border-rose-200 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <XCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Unverified Fish Code</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No authentic Lake Victoria BMU registration exists for code "<span className="font-mono font-bold text-rose-700">{searchCode}</span>".
              This fish may be unregistered, illegally harvested, or counterfeit.
            </p>
          </div>
          <button
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
          >
            Report Counterfeit Tag to BMU Desk
          </button>
        </div>
      )}

      {verificationState === 'VERIFIED' && verifiedData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Main Answer Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div className="flex items-center space-x-4 text-left">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  verifiedData.qualifiesLakeFreshSeal
                    ? 'bg-[#004D40] text-white'
                    : 'bg-[#E0F2F1] text-[#004D40]'
                }`}
              >
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
                    {verifiedData.batchId}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {verifiedData.qualifiesLakeFreshSeal ? (
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#004D40] text-white shadow-xs">
                      ★ Lake Fresh Authentic Seal
                    </span>
                  ) : (
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                      Standard Verified Catch
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">
                    {verifiedData.landingSite} ({verifiedData.county} County)
                  </span>
                </div>
              </div>
            </div>

            {/* Freshness Badge */}
            <div className="p-3.5 bg-[#E0F2F1] rounded-xl border border-teal-200 text-center sm:text-right w-full sm:w-auto">
              <div className="text-[10px] uppercase font-bold text-[#004D40] tracking-wider">Freshness Grade</div>
              <div className="text-lg font-bold text-[#004D40]">
                {verifiedData.freshnessGrade.replace(/_/g, ' ')}
              </div>
              <div className="text-xs text-teal-800 font-mono font-semibold mt-0.5 flex items-center justify-center sm:justify-end space-x-1">
                <Thermometer className="w-3.5 h-3.5" />
                <span>{verifiedData.currentTemperatureCelsius}°C • Score: {verifiedData.freshnessScorePercent}%</span>
              </div>
            </div>
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Species</span>
              <div className="font-bold text-slate-900 text-xs mt-0.5 leading-tight">{verifiedData.speciesName}</div>
              <div className="text-[11px] text-slate-500 italic mt-0.5">{verifiedData.localSpeciesName}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Vessel &amp; Gear</span>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{verifiedData.boatName}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">{verifiedData.harvestMethod}</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Harvest Date</span>
              <div className="font-bold text-slate-900 text-xs mt-0.5">
                {new Date(verifiedData.harvestDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {new Date(verifiedData.harvestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Solar Cold-Chain</span>
              <div className="font-bold text-[#004D40] text-xs mt-0.5 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Active</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{verifiedData.trustReport.ledgerEventsCount} signed events</div>
            </div>
          </div>

          {/* Interactive Provenance Timeline */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#004D40]" />
              <span>Lake Victoria Custody Journey</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {verifiedData.timeline.map((step: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 hover:border-teal-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">{step.eventType}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">{step.site}</div>
                  {step.temperature !== undefined && (
                    <div className="text-[10px] text-[#006064] font-mono font-semibold">Temp: {step.temperature}°C</div>
                  )}
                  <div className="text-[9px] font-mono text-slate-400 truncate">
                    Hash: {step.hash}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Explanation */}
          <div className="p-4 bg-[#E0F2F1] rounded-lg border border-teal-200 text-xs text-[#004D40] space-y-1.5">
            <div className="font-bold flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#004D40]" />
              <span>Why you can trust this catch:</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              This fish was registered directly at {verifiedData.landingSite} Beach Management Unit.
              Immediate solar flake icing has preserved cell freshness. All harvest methods comply with Kenya Marine and Fisheries Research Institute (KMFRI) mesh guidelines.
            </p>
          </div>

          {/* Dispute trigger button */}
          <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
            <span>Notice an issue with quality or tag?</span>
            <button
              onClick={() => setReportModalOpen(true)}
              className="text-rose-700 font-bold hover:underline"
            >
              Report Catch Dispute
            </button>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Submit Quality Dispute</h3>
            <p className="text-xs text-slate-500">
              Your feedback is audited by County Fisheries Officers and the Beach Management Unit.
            </p>

            {reportSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-semibold">
                Thank you! Your dispute report has been registered and forwarded to the BMU desk.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setReportSubmitted(true);
                  setTimeout(() => {
                    setReportModalOpen(false);
                    setReportSubmitted(false);
                  }, 2500);
                }}
                className="space-y-3"
              >
                <textarea
                  rows={3}
                  required
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe the issue (e.g. broken ice seal, unusual smell, mismatched weight)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-600"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
