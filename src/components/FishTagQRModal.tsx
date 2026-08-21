import React, { useEffect, useState } from "react";
import { FishBatch, SPECIES_CATALOG } from "../types/aqua-seal";
import QRCode from "qrcode";
import {
  X,
  Printer,
  ShieldCheck,
  Anchor,
  Thermometer,
  Calendar,
} from "lucide-react";

interface Props {
  batch: FishBatch;
  onClose: () => void;
}

export const FishTagQRModal: React.FC<Props> = ({ batch, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const speciesMeta =
    SPECIES_CATALOG[batch.species] || SPECIES_CATALOG.NILE_PERCH;

  useEffect(() => {
    const generateQR = async () => {
      try {
        const verifyUrl = `${window.location.origin}/?verify=${batch.batchId}`;
        const url = await QRCode.toDataURL(verifyUrl, {
          width: 240,
          margin: 1,
          color: {
            dark: "#034159",
            light: "#FFFFFF",
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error("Failed to generate QR code", err);
      }
    };
    generateQR();
  }, [batch]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#004D40] text-white p-5 flex items-center justify-between border-b border-teal-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-black/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Physical Fish Gill &amp; Crate Tag
              </h3>
              <p className="text-xs text-teal-200">
                Lake Victoria BMU Traceability Standard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-teal-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Tag Area */}
        <div className="p-6 bg-slate-50 print:p-0 print:bg-white">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs relative">
            {/* Tag Hole Simulation */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            </div>

            <div className="text-center pb-4 border-b border-slate-200">
              <span className="text-[10px] font-bold tracking-widest text-[#004D40] uppercase">
                AQUA-SEAL AUTHENTIC LAKE VICTORIA
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
                {batch.batchId}
              </h2>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-[#E0F2F1] text-[#004D40] border border-teal-200">
                <Anchor className="w-3.5 h-3.5" />
                <span>{batch.landingSiteName}</span>
              </div>
            </div>

            {/* Middle info + QR */}
            <div className="grid grid-cols-2 gap-4 my-4 items-center">
              <div className="space-y-2 text-left">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    Species
                  </div>
                  <div className="font-bold text-slate-900 text-sm leading-tight">
                    {speciesMeta.commonName}
                  </div>
                  <div className="text-[11px] text-slate-500 italic">
                    {speciesMeta.localName.split("/")[0]}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    Weight &amp; Vessel
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {batch.currentWeightKg} kg • {batch.boatName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Reg: {batch.boatRegistration}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    Freshness &amp; Ice
                  </div>
                  <div className="flex items-center space-x-1 text-xs font-semibold text-[#004D40]">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>
                      {batch.currentTemperatureCelsius}°C •{" "}
                      {batch.freshnessGrade.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${batch.batchId}`}
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-200 animate-pulse rounded" />
                )}
                <span className="text-[10px] text-slate-500 mt-1 font-mono font-medium">
                  Scan to verify
                </span>
              </div>
            </div>

            {/* Footer stamp */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Landed:{" "}
                  {new Date(batch.landingTimestamp).toLocaleDateString(
                    "en-KE",
                    {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              </div>
              <span className="font-semibold text-[#004D40]">
                {batch.qualifiesLakeFreshSeal
                  ? "★ Lake Fresh Certified"
                  : "Verified BMU Catch"}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wide text-white bg-[#006064] hover:bg-[#004D40] rounded-lg shadow-xs flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Physical Waterproof Tag</span>
          </button>
        </div>
      </div>
    </div>
  );
};
