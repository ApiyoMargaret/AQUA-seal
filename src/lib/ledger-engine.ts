import {
  FishBatch,
  FreshnessGrade,
  SensoryInspection,
  SpeciesType,
  SPECIES_CATALOG,
  TraceabilityEvent,
  TraceabilityEventType,
  UserRole,
  VerificationStatus,
} from '../types/aqua-seal';

/**
 * Fast deterministic string hash for demo/production ledger integrity
 */
export function calculateEventHash(
  previousHash: string,
  batchId: string,
  eventType: TraceabilityEventType,
  timestamp: string,
  actorRole: UserRole,
  metadataStr: string
): string {
  const payload = `${previousHash}|${batchId}|${eventType}|${timestamp}|${actorRole}|${metadataStr}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const secondary = Math.abs((hash * 31) ^ 0x5f3759df).toString(16).padStart(8, '0');
  return `0x${hex}${secondary}`.toUpperCase();
}

/**
 * Generate human-readable Lake Victoria batch identifier
 * Format: LV-[SITE_CODE]-[YYYYMMDD]-[SEQ]
 * Example: LV-DG-20260821-042
 */
export function generateBatchId(siteCode: string, sequenceNumber: number, date?: Date): string {
  const d = date || new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const seq = String(sequenceNumber).padStart(3, '0');
  const safeSite = (siteCode || 'LV').toUpperCase().slice(0, 3);
  return `LV-${safeSite}-${yyyy}${mm}${dd}-${seq}`;
}

/**
 * Freshness and FAO Sensory Quality Assessment Model
 */
export function evaluateBatchFreshness(
  species: SpeciesType,
  harvestTimeIso: string,
  landingTimeIso: string,
  events: TraceabilityEvent[]
): {
  grade: FreshnessGrade;
  scorePercent: number;
  qualifiesLakeFresh: boolean;
  verificationStatus: VerificationStatus;
  hoursSinceHarvest: number;
  coldChainMaintained: boolean;
  explanation: string;
} {
  const harvestTime = new Date(harvestTimeIso).getTime();
  const now = Date.now();
  const hoursSinceHarvest = Math.max(0, Math.round((now - harvestTime) / (1000 * 60 * 60)));
  const speciesMeta = SPECIES_CATALOG[species] || SPECIES_CATALOG.NILE_PERCH;
  const maxShelfLife = speciesMeta.maxFreshHoursOnIce;

  // Inspect ledger events for icing and temperature records
  const iceEvents = events.filter((e) => e.eventType === 'ICED' || e.metadata.iceRatio);
  const inspectionEvents = events.filter((e) => e.eventType === 'INSPECTED' && e.metadata.sensoryInspection);
  const disputeEvents = events.filter((e) => e.eventType === 'COMPENSATING_CORRECTION' && e.metadata.notes?.toLowerCase().includes('dispute'));

  // If there's an active dispute
  if (disputeEvents.length > 0) {
    return {
      grade: 'GRADE_B_GOOD_MARKET',
      scorePercent: 62,
      qualifiesLakeFresh: false,
      verificationStatus: 'DISPUTED',
      hoursSinceHarvest,
      coldChainMaintained: iceEvents.length > 0,
      explanation: 'Dispute recorded regarding catch details. Awaiting BMU county officer arbitration.',
    };
  }

  // Check recent temperature
  const recentTempEvent = [...events].reverse().find((e) => e.metadata.temperatureCelsius !== undefined);
  const currentTemp = recentTempEvent?.metadata.temperatureCelsius ?? 6;

  // Temperature penalty
  let tempPenalty = 0;
  if (currentTemp > 12) {
    tempPenalty = 45; // high temp penalty
  } else if (currentTemp > 7) {
    tempPenalty = 20;
  } else if (currentTemp > 4) {
    tempPenalty = 5;
  }

  // Time decay penalty based on species shelf life
  const timeDecayRatio = hoursSinceHarvest / maxShelfLife;
  const timePenalty = Math.min(60, Math.round(timeDecayRatio * 60));

  // Sensory evaluation score
  let sensoryScore = 30; // base max
  const latestInspection = inspectionEvents[inspectionEvents.length - 1]?.metadata.sensoryInspection;
  if (latestInspection) {
    if (latestInspection.eyes === 'clear_bulging') sensoryScore += 5;
    else if (latestInspection.eyes === 'sunken_opaque') sensoryScore -= 15;

    if (latestInspection.gills === 'bright_red_mucus_free') sensoryScore += 5;
    else if (latestInspection.gills === 'brown_sour_mucus') sensoryScore -= 20;

    if (latestInspection.flesh === 'firm_elastic') sensoryScore += 5;
    else if (latestInspection.flesh === 'soft_dented') sensoryScore -= 15;

    if (latestInspection.odor === 'fresh_seaweed_lake') sensoryScore += 5;
    else if (latestInspection.odor === 'sour_stale') sensoryScore -= 25;
  }

  // Cold chain maintenance check
  const coldChainMaintained = iceEvents.length > 0 && currentTemp <= 8;

  // Calculate composite score (0-100)
  let rawScore = 100 - timePenalty - tempPenalty + (sensoryScore - 30);
  if (!coldChainMaintained) {
    rawScore -= 25;
  }
  const scorePercent = Math.max(5, Math.min(99, rawScore));

  // Determine grade and status
  let grade: FreshnessGrade = 'GRADE_B_GOOD_MARKET';
  let verificationStatus: VerificationStatus = 'VERIFIED_STANDARD';
  let qualifiesLakeFresh = false;
  let explanation = '';

  if (hoursSinceHarvest > maxShelfLife * 1.5 || currentTemp > 18 || (latestInspection && latestInspection.odor === 'sour_stale')) {
    grade = 'SPOILED_UNFIT';
    verificationStatus = 'SPOILED';
    qualifiesLakeFresh = false;
    explanation = 'Catch temperature or storage time has exceeded safe consumption limits. Not fit for fresh consumption.';
  } else if (scorePercent >= 85 && hoursSinceHarvest <= 24 && coldChainMaintained) {
    grade = 'GRADE_A_LAKE_FRESH';
    verificationStatus = 'VERIFIED_LAKE_FRESH';
    qualifiesLakeFresh = true;
    explanation = 'Pristine Lake Victoria catch. Iced immediately at BMU solar ice plant with verified cold-chain continuity.';
  } else if (scorePercent >= 65) {
    grade = 'GRADE_B_GOOD_MARKET';
    verificationStatus = 'VERIFIED_STANDARD';
    qualifiesLakeFresh = false;
    explanation = 'Good market grade fish. Suitable for retail, restaurant service, and immediate cold storage.';
  } else {
    grade = 'GRADE_C_PROCESS_IMMEDIATELY';
    verificationStatus = 'PARTIALLY_VERIFIED';
    qualifiesLakeFresh = false;
    explanation = 'Fair grade. Recommended for immediate local cooking, deep frying (choma), or traditional smoking/drying.';
  }

  return {
    grade,
    scorePercent,
    qualifiesLakeFresh,
    verificationStatus,
    hoursSinceHarvest,
    coldChainMaintained,
    explanation,
  };
}

/**
 * Direct Micro-Marketplace Fee (1.5% transparency rule)
 */
export function calculateMarketplaceFees(pricePerKgKes: number, weightKg: number) {
  const grossTotalKes = Math.round(pricePerKgKes * weightKg);
  const platformFeeRate = 0.015; // 1.5%
  const directSaleFeeKes = Math.round(grossTotalKes * platformFeeRate);
  const fisherNetEarningsKes = grossTotalKes - directSaleFeeKes;

  return {
    pricePerKgKes,
    weightKg,
    grossTotalKes,
    platformFeeRate: 1.5,
    directSaleFeeKes,
    fisherNetEarningsKes,
  };
}