import React, { useState } from 'react';
import {
  ShoppingBag,
  Filter,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  Send,
  Sparkles,
  Info,
  DollarSign,
} from 'lucide-react';
import { FishBatch, SPECIES_CATALOG, SpeciesType } from '../types/aqua-seal';
import { calculateMarketplaceFees } from '../lib/ledger-engine';

interface Props {
  batches: FishBatch[];
  onRefreshData: () => void;
}

export const MarketplaceView: React.FC<Props> = ({ batches, onRefreshData }) => {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('ALL');
  const [selectedBatchForInquiry, setSelectedBatchForInquiry] = useState<FishBatch | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('+254 7');
  const [inquirySent, setInquirySent] = useState(false);

  const activeListings = batches.filter((b) => b.listing?.isListed && b.status === 'ACTIVE_LISTED');

  const filteredListings = activeListings.filter((b) => {
    if (selectedSpecies !== 'ALL' && b.species !== selectedSpecies) return false;
    return true;
  });