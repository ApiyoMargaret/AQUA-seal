import React, { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Award,
  Download,
  Printer,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";
import { SACCOCreditSignals } from "../types/aqua-seal";

export const SACCOCreditView: React.FC = () => {
  const [signals, setSignals] = useState<SACCOCreditSignals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const res = await fetch("/api/sacco/credit-signals/james-onyango");
        const json = await res.json();
        if (json.success) {
          setSignals(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSignals();
  }, []);

  if (loading || !signals) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-semibold">
          Generating explainable SACCO credit signals...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#004D40] rounded-xl p-6 sm:p-8 border border-teal-900/60 shadow-xs text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-teal-200 uppercase tracking-widest">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Transparent Fisher Financial History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
              Explainable SACCO Credit Passport
            </h1>
            <p className="text-xs text-teal-100/90 mt-1 max-w-xl leading-relaxed">
              Transforming artisanal catch consistency into verifiable credit
              collateral for Lake Victoria SACCOs and gear financing.
              <strong className="text-teal-200">
                {" "}
                No opaque black-box algorithms — 100% evidence-grounded signals.
              </strong>
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-black/20 hover:bg-black/30 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors border border-white/15 self-start md:self-auto shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print SACCO Summary</span>
          </button>
        </div>
      </div>

      {/* Credit Summary Profile */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {/* Fisher Identity Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Fisher Profile
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {signals.fisherName}
            </h2>
            <div className="text-xs text-slate-600 mt-0.5">
              Primary BMU:{" "}
              <span className="font-semibold text-slate-800">
                {signals.primaryBMU}
              </span>{" "}
              • Phone: {signals.fisherPhoneMasked}
            </div>
          </div>

          <div className="p-4 bg-[#E0F2F1] rounded-xl border border-teal-200 text-center sm:text-right">
            <div className="text-[10px] uppercase font-bold text-[#004D40] tracking-wider">
              Assessed Credit Tier
            </div>
            <div className="text-xl font-bold text-[#004D40] font-mono">
              {signals.creditRiskBand.replace(/_/g, " ")}
            </div>
            <div className="text-xs font-bold text-teal-800 mt-0.5">
              Recommended Ceiling:{" "}
              <span className="font-mono text-slate-900">
                KES {signals.recommendedCreditLimitKes.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Core Signals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              90-Day Landings
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
              {signals.totalLandingsCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {signals.totalWeightHarvestedKg.toLocaleString()} kg total
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Consistency Score
            </div>
            <div className="text-2xl font-bold text-[#004D40] font-mono mt-1">
              {signals.landingConsistencyScore}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Zero unverified gaps &gt; 4d
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Solar Cold Chain
            </div>
            <div className="text-2xl font-bold text-[#006064] font-mono mt-1">
              {signals.coldChainAdherenceRate}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Iced within 45m of landing
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Recorded Revenue
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
              <span className="text-sm font-normal text-slate-500">KES </span>
              {(signals.totalEstimatedRevenueKes / 1000).toFixed(0)}k
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Transparent fair-trade
            </div>
          </div>
        </div>

        {/* Explainable Signals Checklist */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#004D40]" />
            <span>Explainable Underwriting Factors (Audit Trail)</span>
          </h3>

          <div className="space-y-2">
            {signals.explainableSignals.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <div className="text-slate-600 leading-relaxed">
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SACCO Partner Endorsement Note */}
        <div className="p-4 bg-[#E0F2F1] rounded-lg border border-teal-200 text-xs text-[#004D40] space-y-1">
          <div className="font-bold">
            Participating Lake Victoria SACCOs &amp; Cooperatives:
          </div>
          <p className="text-slate-600 text-[11px]">
            Dunga Beach Fishers Cooperative Society • Uhanya Fishermen SACCO •
            Mbita Point Development SACCO • KCB Foundation Maji &amp; Uchumi
            Initiative.
          </p>
        </div>
      </div>
    </div>
  );
};
