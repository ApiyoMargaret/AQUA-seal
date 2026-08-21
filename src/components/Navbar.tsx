import React, { useEffect, useState } from 'react';
import {
  Anchor,
  Phone,
  MessageSquare,
  PlusCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Layers,
  ShoppingBag,
  ShieldCheck,
  Award,
  Thermometer,
  CreditCard,
} from 'lucide-react';
import { LANDING_SITES } from '../types/aqua-seal';
import { offlineQueue } from '../lib/offline-queue';

export type ActiveTab =
  | 'REGISTRATION'
  | 'LEDGER'
  | 'COLD_CHAIN'
  | 'VERIFICATION'
  | 'MARKETPLACE'
  | 'SACCO_CREDIT';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedSiteId: string;
  setSelectedSiteId: (siteId: string) => void;
  onOpenUSSD: () => void;
  onOpenSMS: () => void;
  onOpenNewCatch: () => void;
  networkMode: 'ONLINE' | 'INTERMITTENT_2G' | 'OFFLINE';
  setNetworkMode: (mode: 'ONLINE' | 'INTERMITTENT_2G' | 'OFFLINE') => void;
  onRefreshData: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  selectedSiteId,
  setSelectedSiteId,
  onOpenUSSD,
  onOpenSMS,
  onOpenNewCatch,
  networkMode,
  setNetworkMode,
  onRefreshData,
}) => {
  const [queuedCount, setQueuedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      setQueuedCount(offlineQueue.getItems().length);
    };
    updateCount();
    return offlineQueue.subscribe(updateCount);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await offlineQueue.syncAll();
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const currentSite =
    LANDING_SITES.find((s) => s.id === selectedSiteId) || LANDING_SITES[0];

  return (
    <header className="bg-[#004D40] text-white shadow-md sticky top-0 z-40">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="bg-white/20 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight uppercase leading-tight">
                Aqua-Seal
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 text-teal-100 tracking-wider font-mono">
                LAKE VICTORIA
              </span>
            </div>
            <p className="text-[10px] opacity-75 tracking-widest leading-none mt-0.5 uppercase">
              {currentSite.name} • {currentSite.county}
            </p>
          </div>
        </div>

    </header>
  );
};