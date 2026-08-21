import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  ShieldCheck,
  Thermometer,
  Clock,
  User,
  PlusCircle,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Eye,
  CheckCircle2,
  Printer,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { FishBatch, TraceabilityEvent, TraceabilityEventType, UserRole } from '../types/aqua-seal';

interface Props {
  batches: FishBatch[];
  onOpenTagModal: (batch: FishBatch) => void;
  onRefreshData: () => void;
}

export const TraceabilityLedgerView: React.FC<Props> = ({
  batches,
  onOpenTagModal,
  onRefreshData,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.batchId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompensateModal, setShowCompensateModal] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionWeight, setCorrectionWeight] = useState('');
  const [isAppending, setIsAppending] = useState(false);

  const filteredBatches = batches.filter(
    (b) =>
      b.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.boatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.landingSiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.species.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBatch =
    batches.find((b) => b.batchId === selectedBatchId) ||
    filteredBatches[0] ||
    batches[0];

  const handleAppendCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    if (!correctionReason.trim()) {
      alert('Please provide a documented reason for this compensating ledger entry.');
      return;
    }

    setIsAppending(true);
    try {
      const res = await fetch(`/api/batches/${selectedBatch.batchId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'COMPENSATING_CORRECTION',
          actorName: 'Otieno Maurice (BMU Officer)',
          actorRole: 'BMU_CLERK',
          siteName: selectedBatch.landingSiteName,
          correctionReason,
          originalEventId: selectedBatch.events[selectedBatch.events.length - 1]?.id,
          notes: correctionReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCompensateModal(false);
        setCorrectionReason('');
        onRefreshData();
      } else {
        alert(data.error || 'Failed to append correction');
      }
    } catch (err) {
      console.error(err);
      alert('Network error appending correction');
    } finally {
      setIsAppending(false);
    }
  };

  const getEventBadgeColor = (type: TraceabilityEventType) => {
    switch (type) {
      case 'HARVESTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LANDED':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'WEIGHED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ICED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'INSPECTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'TRANSPORTED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LISTED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SOLD':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPENSATING_CORRECTION':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#004D40] text-white rounded-xl p-6 border border-teal-900/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-teal-200 uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" />
            <span>Append-Only Ledger &amp; Provenance Chain</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">Immutable Traceability Events</h1>
          <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
            Every catch, ice application, sensory audit, and transfer produces a cryptographically hashed block.
            Historical events cannot be modified or deleted.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batch, boat, site..."
              className="bg-black/20 border border-white/20 rounded-lg px-3.5 py-2 text-xs text-white placeholder-teal-100/60 pl-9 w-60 focus:outline-hidden focus:ring-1 focus:ring-teal-300"
            />
            <Search className="w-4 h-4 text-teal-200 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

            {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Batch Selector List */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
            <h2 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Tracked Fish Batches ({filteredBatches.length})
            </h2>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredBatches.map((batch) => {
              const isSelected = selectedBatch?.batchId === batch.batchId;
              return (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.batchId)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-[#004D40] bg-[#E0F2F1] shadow-xs ring-1 ring-[#004D40]'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-xs text-slate-900">{batch.batchId}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        batch.qualifiesLakeFreshSeal
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {batch.qualifiesLakeFreshSeal ? '★ Lake Fresh' : batch.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-800 mt-1">
                    {batch.species} • {batch.currentWeightKg} kg
                  </div>

                  <div className="text-[11px] text-slate-500 mt-0.5 flex justify-between">
                    <span>{batch.landingSiteName}</span>
                    <span className="font-mono text-[#006064] font-semibold">{batch.events.length} blocks</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
                {/* Right: Selected Batch Timeline & Hash Explorer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedBatch ? (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Batch Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-slate-900 font-mono">
                      {selectedBatch.batchId}
                    </h2>
                    {selectedBatch.qualifiesLakeFreshSeal && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Lake Fresh Certified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Vessel: <span className="font-semibold text-slate-800">{selectedBatch.boatName}</span> ({selectedBatch.boatRegistration}) • Landing: {selectedBatch.landingSiteName}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenTagModal(selectedBatch)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-300"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Tag &amp; QR</span>
                  </button>

                  <button
                    onClick={() => setShowCompensateModal(true)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors border border-rose-200"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Compensating Correction</span>
                  </button>
                </div>
              </div>

              {/* Status & Freshness Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Current Temp</div>
                  <div className="text-base font-bold text-slate-900 font-mono flex items-center space-x-1">
                    <Thermometer className="w-4 h-4 text-teal-700" />
                    <span>{selectedBatch.currentTemperatureCelsius}°C</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Freshness Score</div>
                  <div className="text-base font-bold text-[#004D40] font-mono">
                    {selectedBatch.freshnessScorePercent}%
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Net Weight</div>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    {selectedBatch.currentWeightKg} kg
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Ledger Blocks</div>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    {selectedBatch.events.length} Verified
                  </div>
                </div>
              </div>
              {/* Event Timeline */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-[#004D40]" />
                  <span>Cryptographic Event Sequence</span>
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedBatch.events.map((event, idx) => (
                    <div key={event.id} className="relative group"></div>
                     {/* Timeline Dot */}
                      <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-[#004D40] border-2 border-white ring-2 ring-teal-200" />

                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 hover:border-teal-400 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEventBadgeColor(
                                event.eventType
                              )}`}
                            >
                              {event.eventType.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-semibold text-slate-800">
                              {event.location.siteName}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(event.timestamp).toLocaleDateString('en-KE', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

