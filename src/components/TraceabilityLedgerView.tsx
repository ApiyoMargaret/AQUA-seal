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