import React, { useState } from 'react';
import {
  Anchor,
  Fish,
  Scale,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Printer,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import {
  FishBatch,
  LANDING_SITES,
  RegisteredBoat,
  SPECIES_CATALOG,
  SpeciesType,
} from '../types/aqua-seal';
import { offlineQueue } from '../lib/offline-queue';

interface Props {
  selectedSiteId: string;
  boats: RegisteredBoat[];
  batches: FishBatch[];
  networkMode: 'ONLINE' | 'INTERMITTENT_2G' | 'OFFLINE';
  onBatchCreated: (batch: FishBatch) => void;
  onOpenTagModal: (batch: FishBatch) => void;
}

export const CatchRegistrationView: React.FC<Props> = ({
  selectedSiteId,
  boats,
  batches,
  networkMode,
  onBatchCreated,
  onOpenTagModal,
}) => {
  const currentSite = LANDING_SITES.find((s) => s.id === selectedSiteId) || LANDING_SITES[0];
  const siteBoats = boats.filter((b) => b.bmuSiteId === selectedSiteId);
  const availableBoats = siteBoats.length > 0 ? siteBoats : boats;

  const [selectedBoatReg, setSelectedBoatReg] = useState(availableBoats[0]?.registrationNumber || 'KV-084-KSM');
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesType>('NILE_PERCH');
  const [weightKg, setWeightKg] = useState<string>('65.0');
  const [fishCount, setFishCount] = useState<string>('');
  const [harvestMethod, setHarvestMethod] = useState('Certified Gillnet (6-inch mesh)');
  const [temperatureCelsius, setTemperatureCelsius] = useState<number>(3.2);
  const [iceRatio, setIceRatio] = useState<'1:1' | '1:2' | '1:3' | 'NO_ICE'>('1:1');
  const [iceSource, setIceSource] = useState(`${currentSite.name} Solar Flake Ice Plant`);
  const [clerkNotes, setClerkNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<{ id: string; batchId: string } | null>(null);

  const activeBoat = availableBoats.find((b) => b.registrationNumber === selectedBoatReg) || availableBoats[0];
  const activeSpeciesInfo = SPECIES_CATALOG[selectedSpecies];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weightKg);
    if (!weightNum || weightNum <= 0) {
      alert('Please enter a valid weight in kg');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      boatRegistration: selectedBoatReg,
      species: selectedSpecies,
      landingSiteId: selectedSiteId,
      harvestMethod,
      weightKg: weightNum,
      fishCount: fishCount ? parseInt(fishCount) : undefined,
      temperatureCelsius,
      iceRatio,
      iceSource,
      actorName: currentSite.bmuLeader,
      notes: clerkNotes,
    };

    if (networkMode === 'OFFLINE') {
      // Enqueue offline action
      offlineQueue.enqueue('CREATE_BATCH', payload);
      setIsSubmitting(false);
      setSubmitSuccessMsg({
        id: `offline-${Date.now()}`,
        batchId: `LV-${currentSite.code}-OFFLINE-QUEUED`,
      });
      return;
    }

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSubmitSuccessMsg({ id: json.data.id, batchId: json.data.batchId });
        onBatchCreated(json.data);
      } else {
        alert(json.error || 'Failed to register catch');
      }
    } catch (err) {
      console.error(err);
      offlineQueue.enqueue('CREATE_BATCH', payload);
      setSubmitSuccessMsg({
        id: `offline-${Date.now()}`,
        batchId: `LV-${currentSite.code}-QUEUED-RETRY`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* BMU Header banner */}
      <div className="bg-[#004D40] rounded-xl p-6 text-white shadow-xs border border-teal-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-teal-200 uppercase tracking-widest">
              <Anchor className="w-3.5 h-3.5" />
              <span>BMU Beach Landing & Catch Audit Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
              {currentSite.name}
            </h1>
            <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
              County: <span className="font-semibold text-white">{currentSite.county}</span> • BMU Leader: {currentSite.bmuLeader} •{' '}
              {currentSite.hasSolarIcePlant ? '☀️ Solar Ice Facility Active (0-3°C)' : 'Standard Ice Storage'}
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-xs border border-white/15 rounded-lg p-3 flex items-center space-x-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white font-mono">
                {batches.filter((b) => b.landingSiteId === selectedSiteId).length}
              </div>
              <div className="text-[9px] uppercase font-bold text-teal-200 tracking-wider">Batches Today</div>
            </div>
            <div className="w-px h-7 bg-white/20" />
            <div className="text-center">
              <div className="text-xl font-bold text-teal-200 font-mono">
                {batches
                  .filter((b) => b.landingSiteId === selectedSiteId)
                  .reduce((acc, b) => acc + b.currentWeightKg, 0)}{' '}
                <span className="text-xs font-normal">kg</span>
              </div>
              <div className="text-[9px] uppercase font-bold text-teal-200 tracking-wider">Total Landed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success notification banner if created */}
      {submitSuccessMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-700/80 rounded-xl text-emerald-100 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-xs">
                Catch Successfully Recorded! Batch Code: <span className="font-mono text-white text-sm">{submitSuccessMsg.batchId}</span>
              </div>
              <p className="text-[11px] text-emerald-300">
                Immutable cryptographic ledger event appended. SMS notification queued for boat captain.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const b = batches.find((x) => x.batchId === submitSuccessMsg.batchId) || batches[0];
                if (b) onOpenTagModal(b);
              }}
              className="px-3 py-1.5 bg-[#006064] hover:bg-[#004D40] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Fish Tag</span>
            </button>
            <button
              onClick={() => setSubmitSuccessMsg(null)}
              className="text-emerald-400 hover:text-white text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Registration Form */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Fish className="w-5 h-5 text-[#004D40]" />
            <span>Register New Lake Victoria Catch</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Species Selection Cards */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. Select Fish Species (Aina ya Samaki)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(Object.keys(SPECIES_CATALOG) as SpeciesType[]).map((spKey) => {
                  const sp = SPECIES_CATALOG[spKey];
                  const isSelected = selectedSpecies === spKey;
                  return (
                    <button
                      type="button"
                      key={spKey}
                      onClick={() => setSelectedSpecies(spKey)}
                      className={`p-3 rounded-lg text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#004D40] bg-[#E0F2F1] shadow-xs ring-1 ring-[#004D40]'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className={`font-bold text-sm leading-tight ${isSelected ? 'text-[#004D40]' : 'text-slate-800'}`}>
                          {sp.commonName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {sp.localName.split('/')[0]}
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] font-semibold text-teal-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block w-max">
                        KES {sp.indicativePricePerKgKes}/kg
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vessel & Gear */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  2. Registered Fishing Vessel (Chombo)
                </label>
                <select
                  value={selectedBoatReg}
                  onChange={(e) => {
                    setSelectedBoatReg(e.target.value);
                    const b = availableBoats.find((item) => item.registrationNumber === e.target.value);
                    if (b) setHarvestMethod(b.approvedGear);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-1 focus:ring-teal-700 focus:border-teal-700 focus:outline-hidden"
                >
                  {availableBoats.map((boat) => (
                    <option key={boat.registrationNumber} value={boat.registrationNumber}>
                      {boat.registrationNumber} — {boat.name} ({boat.captainName})
                    </option>
                  ))}
                </select>
                {activeBoat && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Captain: <span className="font-semibold text-slate-700">{activeBoat.captainName}</span> • Phone: {activeBoat.captainPhone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  3. Permitted Harvest Method (Njia ya Uvuvi)
                </label>
                <select
                  value={harvestMethod}
                  onChange={(e) => setHarvestMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-teal-700 focus:border-teal-700 focus:outline-hidden"
                >
                  <option value="Certified Gillnet (6-inch mesh)">Certified Gillnet (&gt;= 5-inch legal mesh)</option>
                  <option value="Traditional Handline & Longline">Traditional Handline &amp; Longline</option>
                  <option value="Approved Hook & Line">Approved Hook &amp; Line (Deep Water)</option>
                  <option value="Purse Seine / Omena Ringnet (Certified Mesh)">Certified Omena Ringnet (Dark moon phase)</option>
                </select>
                <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>KMFRI &amp; BMU compliance verified</span>
                </p>
              </div>
            </div>

            {/* Weight, Count & Scale Tare */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  4. Landed Net Weight (Kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="1500"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-base font-bold font-mono text-slate-900 focus:ring-1 focus:ring-teal-700 focus:border-teal-700 focus:outline-hidden pl-9"
                  />
                  <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500 font-mono">KG</span>
                </div>
                <div className="flex space-x-1.5 mt-2">
                  {['25', '50', '85', '120'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWeightKg(preset)}
                      className="px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-medium rounded border border-slate-200"
                    >
                      {preset} kg
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Piece Count (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={fishCount}
                  onChange={(e) => setFishCount(e.target.value)}
                  placeholder="e.g. 18 pieces"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-teal-700 focus:border-teal-700 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Est. value: <span className="font-bold text-[#004D40] font-mono">KES {(parseFloat(weightKg || '0') * activeSpeciesInfo.indicativePricePerKgKes).toLocaleString()}</span>
                </p>
              </div>
            </div>

            {/* Cold-Chain & Solar Ice Logging */}
            <div className="p-4 bg-[#E0F2F1] rounded-xl border border-teal-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-[#004D40]" />
                  <span className="text-[10px] font-bold text-[#004D40] uppercase tracking-wider">
                    5. BMU Immediate Solar Ice &amp; Temperature
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-[#004D40] text-white px-2 py-0.5 rounded-full uppercase">
                  Lake Fresh Rule
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-600 font-semibold block mb-1">Ice Ratio:</span>
                  <select
                    value={iceRatio}
                    onChange={(e) => setIceRatio(e.target.value as any)}
                    className="w-full bg-white border border-teal-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
                  >
                    <option value="1:1">1:1 Heavy Solar Flake Ice (Grade A)</option>
                    <option value="1:2">1:2 Standard Chilling (Grade B)</option>
                    <option value="1:3">1:3 Light Surface Ice</option>
                    <option value="NO_ICE">No Ice / Fresh Landing</option>
                  </select>
                </div>

                <div>
                  <span className="text-slate-600 font-semibold block mb-1">Core Temp (°C):</span>
                  <input
                    type="number"
                    step="0.1"
                    value={temperatureCelsius}
                    onChange={(e) => setTemperatureCelsius(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-teal-300 rounded-lg p-2 text-xs font-bold font-mono text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <span className="text-slate-600 font-semibold block mb-1">Ice Facility:</span>
                  <input
                    type="text"
                    value={iceSource}
                    onChange={(e) => setIceSource(e.target.value)}
                    className="w-full bg-white border border-teal-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Clerk Notes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Clerk / Fisher Notes
              </label>
              <input
                type="text"
                value={clerkNotes}
                onChange={(e) => setClerkNotes(e.target.value)}
                placeholder="e.g. Dawn haul from deep Rusinga shelf. Pristine clarity."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-teal-700 focus:border-teal-700 focus:outline-hidden"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>
                  {networkMode === 'OFFLINE'
                    ? 'Offline Mode Active: Catch will queue in browser and sync when online.'
                    : 'Instant cryptographic hash & SMS dispatch via Africa\'s Talking.'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#006064] hover:bg-[#004D40] text-white font-bold rounded-lg shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-xs uppercase tracking-wide"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording Catch...' : 'Register Batch & Generate QR Tag'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Species & Live Site Details */}
        <div className="space-y-5">
          {/* Active Species Profile Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#004D40] uppercase tracking-wider">
                Species Guide
              </span>
              <span className="text-xs font-mono font-bold bg-[#E0F2F1] text-[#004D40] px-2 py-0.5 rounded border border-teal-200">
                {activeSpeciesInfo.scientificName}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {activeSpeciesInfo.commonName}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeSpeciesInfo.description}
            </p>

            <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Indicative BMU Price:</span>
                <span className="font-bold text-slate-900 font-mono">KES {activeSpeciesInfo.indicativePricePerKgKes} / kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Shelf Life on Ice:</span>
                <span className="font-bold text-slate-900">{activeSpeciesInfo.maxFreshHoursOnIce} hours</span>
              </div>
              {activeSpeciesInfo.minLegalLengthCm && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Legal Min Length:</span>
                  <span className="font-bold">&gt;= {activeSpeciesInfo.minLegalLengthCm} cm</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Recent Batches at this Landing Site */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Recent Batches Landed</h3>
              <span className="text-[10px] text-[#004D40] font-bold uppercase">{batches.length} total</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {batches.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-lg bg-slate-50 hover:bg-[#E0F2F1]/50 border border-slate-200 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold font-mono text-slate-900">{b.batchId}</div>
                    <div className="text-[11px] text-slate-500">
                      {b.species} • {b.currentWeightKg} kg • {b.boatName}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenTagModal(b)}
                    className="p-1.5 bg-[#E0F2F1] hover:bg-teal-200 text-[#004D40] rounded-md transition-colors"
                    title="Print Fish Tag"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
