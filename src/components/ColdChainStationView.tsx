import React, { useState } from "react";
import {
  Thermometer,
  Snowflake,
  Truck,
  Eye,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { FishBatch, SensoryInspection } from "../types/aqua-seal";

interface Props {
  batches: FishBatch[];
  onRefreshData: () => void;
}

export const ColdChainStationView: React.FC<Props> = ({
  batches,
  onRefreshData,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches[0]?.batchId || "",
  );
  const [actionTab, setActionTab] = useState<"ICE" | "INSPECT" | "TRANSPORT">(
    "ICE",
  );

  // Form states
  const [iceRatio, setIceRatio] = useState<"1:1" | "1:2" | "1:3">("1:1");
  const [tempInput, setTempInput] = useState<string>("2.5");
  const [iceSource, setIceSource] = useState("Dunga Solar Flake Ice Plant");

  // Sensory states
  const [sensoryEyes, setSensoryEyes] = useState<
    "clear_bulging" | "flat_slightly_cloudy" | "sunken_opaque"
  >("clear_bulging");
  const [sensoryGills, setSensoryGills] = useState<
    "bright_red_mucus_free" | "pale_pink" | "brown_sour_mucus"
  >("bright_red_mucus_free");
  const [sensoryFlesh, setSensoryFlesh] = useState<
    "firm_elastic" | "slightly_soft" | "soft_dented"
  >("firm_elastic");
  const [sensoryOdor, setSensoryOdor] = useState<
    "fresh_seaweed_lake" | "neutral_mild" | "sour_stale"
  >("fresh_seaweed_lake");

  // Transport states
  const [vehicle, setVehicle] = useState("Insulated Cold Tuk-Tuk (KDC 441A)");
  const [destination, setDestination] = useState("Kisumu City Wholesale Depot");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const selectedBatch =
    batches.find((b) => b.batchId === selectedBatchId) || batches[0];

  const handleApplyColdChain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);
    try {
      let payload: any = {
        batchId: selectedBatch.batchId,
        actorName: "Mama Lucy Cold Store Operator",
        actorRole: "COLD_CHAIN_HANDLER",
        siteName: selectedBatch.landingSiteName,
      };

      if (actionTab === "ICE") {
        payload.eventType = "ICED";
        payload.temperatureCelsius = parseFloat(tempInput) || 3.0;
        payload.iceRatio = iceRatio;
        payload.iceSource = iceSource;
        payload.notes = `Solar flake ice refreshed at 1:${iceRatio === "1:1" ? "1" : "2"} ratio. Temperature measured at ${tempInput}°C.`;
      } else if (actionTab === "INSPECT") {
        payload.eventType = "INSPECTED";
        payload.actorRole = "COUNTY_OFFICER";
        payload.actorName = "Achieng Perez (County Inspector)";
        payload.sensoryInspection = {
          eyes: sensoryEyes,
          gills: sensoryGills,
          flesh: sensoryFlesh,
          odor: sensoryOdor,
          passedQualityAudit:
            sensoryEyes === "clear_bulging" &&
            sensoryGills === "bright_red_mucus_free",
        };
        payload.notes = "FAO Fish Quality Index inspection performed.";
      } else if (actionTab === "TRANSPORT") {
        payload.eventType = "TRANSPORTED";
        payload.transportVehicle = vehicle;
        payload.transportDestination = destination;
        payload.temperatureCelsius = 3.8;
        payload.notes = `Dispatched in ${vehicle} heading to ${destination}. Insulated box sealed.`;
      }

      const res = await fetch(`/api/batches/${selectedBatch.batchId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessNotice(
          `Successfully logged ${actionTab} event for batch ${selectedBatch.batchId}!`,
        );
        setTimeout(() => setSuccessNotice(null), 5000);
        onRefreshData();
      } else {
        alert(data.error || "Failed to update cold chain");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating cold-chain");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-[#004D40] rounded-xl p-6 border border-teal-900/60 shadow-xs text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-teal-200 uppercase tracking-widest">
              <Snowflake className="w-3.5 h-3.5" />
              <span>Cold-Chain Assurance &amp; FAO Quality Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
              Solar Ice &amp; Transport Hub
            </h1>
            <p className="text-xs text-teal-100/90 mt-1 max-w-xl">
              Fish spoilage in Lake Victoria occurs 4x faster without immediate
              0-3°C icing. Record regular temperature audits, solar flake ice
              refills, and insulated transport seals.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-xs p-3 rounded-lg border border-white/15 text-xs">
            <Thermometer className="w-5 h-5 text-teal-200 shrink-0" />
            <div>
              <div className="font-bold text-white">
                Lake Victoria Cold Chain Rule
              </div>
              <div className="text-teal-200 text-[11px]">
                Core temp &lt; 4.0°C guarantees Grade A fresh seal
              </div>
            </div>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-700/80 rounded-xl text-emerald-100 flex items-center space-x-2 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Batch Selection */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Select Active Catch for Update
          </h2>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {batches.map((batch) => {
              const isSelected = selectedBatch?.batchId === batch.batchId;
              return (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.batchId)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-[#004D40] bg-[#E0F2F1] shadow-xs ring-1 ring-[#004D40]"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold font-mono text-xs text-slate-900">
                      {batch.batchId}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#006064]">
                      {batch.currentTemperatureCelsius}°C
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold mt-1">
                    {batch.species} • {batch.currentWeightKg} kg
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between mt-1">
                    <span>{batch.landingSiteName}</span>
                    <span className="font-semibold text-[#004D40]">
                      {batch.freshnessGrade.replace(/_/g, " ")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Update Controls */}
        <div className="lg:col-span-2 space-y-6">
          {selectedBatch && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Batch Context Card */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Updating Batch
                  </div>
                  <h3 className="text-xl font-bold font-mono text-slate-900">
                    {selectedBatch.batchId}
                  </h3>
                  <div className="text-xs text-slate-600">
                    {selectedBatch.species} • {selectedBatch.currentWeightKg} kg
                    • {selectedBatch.boatName}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Current Grade
                    </div>
                    <div className="text-xs font-bold text-[#004D40]">
                      {selectedBatch.freshnessGrade.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[#E0F2F1] border border-teal-200 flex items-center justify-center font-mono font-bold text-[#004D40] text-sm">
                    {selectedBatch.freshnessScorePercent}%
                  </div>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="flex border-b border-slate-200 space-x-2">
                <button
                  onClick={() => setActionTab("ICE")}
                  className={`pb-3 px-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-colors uppercase tracking-wider ${
                    actionTab === "ICE"
                      ? "border-[#004D40] text-[#004D40]"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Snowflake className="w-3.5 h-3.5" />
                  <span>1. Apply Solar Ice / Temp</span>
                </button>

                <button
                  onClick={() => setActionTab("INSPECT")}
                  className={`pb-3 px-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-colors uppercase tracking-wider ${
                    actionTab === "INSPECT"
                      ? "border-[#004D40] text-[#004D40]"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>2. FAO Sensory Audit</span>
                </button>

                <button
                  onClick={() => setActionTab("TRANSPORT")}
                  className={`pb-3 px-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-colors uppercase tracking-wider ${
                    actionTab === "TRANSPORT"
                      ? "border-[#004D40] text-[#004D40]"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>3. Insulated Transport Dispatch</span>
                </button>
              </div>

              {/* Action Form */}
              <form onSubmit={handleApplyColdChain} className="space-y-4">
                {actionTab === "ICE" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Ice Ratio (Ice to Fish)
                        </label>
                        <select
                          value={iceRatio}
                          onChange={(e) => setIceRatio(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
                        >
                          <option value="1:1">
                            1:1 Heavy Solar Flake Ice (0°C - 3°C)
                          </option>
                          <option value="1:2">
                            1:2 Standard Chilling (3°C - 6°C)
                          </option>
                          <option value="1:3">
                            1:3 Light Transport Crushed Ice
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Measured Core Temp (°C)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={tempInput}
                          onChange={(e) => setTempInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Solar Ice Plant Source
                      </label>
                      <input
                        type="text"
                        value={iceSource}
                        onChange={(e) => setIceSource(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {actionTab === "INSPECT" && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-[#E0F2F1] rounded-lg border border-teal-200 text-xs text-[#004D40]">
                      <strong>FAO Organoleptic Guidelines:</strong> Grade A fish
                      requires clear convex eyes, bright red gills with no odor,
                      and elastic flesh.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Eyes Clarity
                        </label>
                        <select
                          value={sensoryEyes}
                          onChange={(e) =>
                            setSensoryEyes(e.target.value as any)
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
                        >
                          <option value="clear_bulging">
                            Clear &amp; Convex / Bulging (Grade A)
                          </option>
                          <option value="flat_slightly_cloudy">
                            Flat &amp; Slightly Cloudy (Grade B)
                          </option>
                          <option value="sunken_opaque">
                            Sunken &amp; Opaque Gray (Unfit)
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Gills Condition
                        </label>
                        <select
                          value={sensoryGills}
                          onChange={(e) =>
                            setSensoryGills(e.target.value as any)
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
                        >
                          <option value="bright_red_mucus_free">
                            Bright Red &amp; Mucus-Free (Grade A)
                          </option>
                          <option value="pale_pink">
                            Pale Pink / Light Mucus (Grade B)
                          </option>
                          <option value="brown_sour_mucus">
                            Brown / Sour Mucus (Unfit)
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Flesh Elasticity
                        </label>
                        <select
                          value={sensoryFlesh}
                          onChange={(e) =>
                            setSensoryFlesh(e.target.value as any)
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
                        >
                          <option value="firm_elastic">
                            Firm &amp; Springy Elastic (Grade A)
                          </option>
                          <option value="slightly_soft">
                            Slightly Soft (Grade B)
                          </option>
                          <option value="soft_dented">
                            Soft / Finger Impression Remains (Grade C)
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Odor / Smell
                        </label>
                        <select
                          value={sensoryOdor}
                          onChange={(e) =>
                            setSensoryOdor(e.target.value as any)
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
                        >
                          <option value="fresh_seaweed_lake">
                            Fresh Lake / Neutral Algae (Grade A)
                          </option>
                          <option value="neutral_mild">
                            Neutral Mild Fishy (Grade B)
                          </option>
                          <option value="sour_stale">
                            Sour / Ammoniacal (Unfit)
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {actionTab === "TRANSPORT" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Transport Vehicle &amp; Plate
                        </label>
                        <input
                          type="text"
                          value={vehicle}
                          onChange={(e) => setVehicle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Destination Market / Client
                        </label>
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#006064] hover:bg-[#004D40] text-white font-bold text-xs uppercase tracking-wide rounded-lg shadow-xs transition-colors flex items-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? "Logging..."
                        : "Append Cold-Chain Record to Ledger"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
