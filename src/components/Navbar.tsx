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