import React, { useState } from 'react';
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
} from 'lucide-react';
import { FishBatch, SensoryInspection } from '../types/aqua-seal';

interface Props {
  batches: FishBatch[];
  onRefreshData: () => void;
}

export const ColdChainStationView: React.FC<Props> = ({ batches, onRefreshData }) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.batchId || '');
  const [actionTab, setActionTab] = useState<'ICE' | 'INSPECT' | 'TRANSPORT'>('ICE');

  // Form states
  const [iceRatio, setIceRatio] = useState<'1:1' | '1:2' | '1:3'>('1:1');
  const [tempInput, setTempInput] = useState<string>('2.5');
  const [iceSource, setIceSource] = useState('Dunga Solar Flake Ice Plant');

  // Sensory states
  const [sensoryEyes, setSensoryEyes] = useState<'clear_bulging' | 'flat_slightly_cloudy' | 'sunken_opaque'>('clear_bulging');
  const [sensoryGills, setSensoryGills] = useState<'bright_red_mucus_free' | 'pale_pink' | 'brown_sour_mucus'>('bright_red_mucus_free');
  const [sensoryFlesh, setSensoryFlesh] = useState<'firm_elastic' | 'slightly_soft' | 'soft_dented'>('firm_elastic');
  const [sensoryOdor, setSensoryOdor] = useState<'fresh_seaweed_lake' | 'neutral_mild' | 'sour_stale'>('fresh_seaweed_lake');

  // Transport states
  const [vehicle, setVehicle] = useState('Insulated Cold Tuk-Tuk (KDC 441A)');
  const [destination, setDestination] = useState('Kisumu City Wholesale Depot');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId) || batches[0];
const handleApplyColdChain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);
    try {
      let payload: any = {
        batchId: selectedBatch.batchId,
        actorName: 'Mama Lucy Cold Store Operator',
        actorRole: 'COLD_CHAIN_HANDLER',
        siteName: selectedBatch.landingSiteName,
      };

      if (actionTab === 'ICE') {
        payload.eventType = 'ICED';
        payload.temperatureCelsius = parseFloat(tempInput) || 3.0;
        payload.iceRatio = iceRatio;
        payload.iceSource = iceSource;
        payload.notes = `Solar flake ice refreshed at 1:${iceRatio === '1:1' ? '1' : '2'} ratio. Temperature measured at ${tempInput}°C.`;
      } else if (actionTab === 'INSPECT') {
        payload.eventType = 'INSPECTED';
        payload.actorRole = 'COUNTY_OFFICER';
        payload.actorName = 'Achieng Perez (County Inspector)';
        payload.sensoryInspection = {
          eyes: sensoryEyes,
          gills: sensoryGills,
          flesh: sensoryFlesh,
          odor: sensoryOdor,
          passedQualityAudit: sensoryEyes === 'clear_bulging' && sensoryGills === 'bright_red_mucus_free',
        };
        payload.notes = 'FAO Fish Quality Index inspection performed.';
      } else if (actionTab === 'TRANSPORT') {
        payload.eventType = 'TRANSPORTED';
        payload.transportVehicle = vehicle;
        payload.transportDestination = destination;
        payload.temperatureCelsius = 3.8;
        payload.notes = `Dispatched in ${vehicle} heading to ${destination}. Insulated box sealed.`;
      }

      const res = await fetch(`/api/batches/${selectedBatch.batchId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessNotice(`Successfully logged ${actionTab} event for batch ${selectedBatch.batchId}!`);
        setTimeout(() => setSuccessNotice(null), 5000);
        onRefreshData();
      } else {
        alert(data.error || 'Failed to update cold chain');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating cold-chain');
    } finally {
      setIsSubmitting(false);
    }
  };