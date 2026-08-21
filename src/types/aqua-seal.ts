import { z } from 'zod';

export type SpeciesType = 'NILE_PERCH' | 'TILAPIA' | 'OMENA' | 'CATFISH';

export interface SpeciesInfo {
  id: SpeciesType;
  commonName: string;
  localName: string; // such as Swahili / Dholuo
  scientificName: string;
  description: string;
  indicativePricePerKgKes: number;
  maxFreshHoursOnIce: number;
  minLegalLengthCm?: number;
}

export const SPECIES_CATALOG: Record<SpeciesType, SpeciesInfo> = {
  NILE_PERCH: {
    id: 'NILE_PERCH',
    commonName: 'Nile Perch',
    localName: 'Mbuta (Luo) / Sangara (Swahili)',
    scientificName: 'Lates niloticus',
    description: 'Prized premium white meat fish from deep Lake Victoria waters. High export and restaurant demand.',
    indicativePricePerKgKes: 480,
    maxFreshHoursOnIce: 72,
    minLegalLengthCm: 50,
  },
  TILAPIA: {
    id: 'TILAPIA',
    commonName: 'Nile Tilapia',
    localName: 'Ngege (Luo) / Sato (Swahili)',
    scientificName: 'Oreochromis niloticus',
    description: 'Flavorful, high-demand freshwater fish caught in near-shore and bay waters around papyrus reeds.',
    indicativePricePerKgKes: 420,
    maxFreshHoursOnIce: 48,
    minLegalLengthCm: 25,
  },
  OMENA: {
    id: 'OMENA',
    commonName: 'Lake Victoria Sardine',
    localName: 'Omena (Luo) / Dagaa (Swahili)',
    scientificName: 'Rastrineobola argentea',
    description: 'Small silver cyprinid caught during dark moon phases with lantern light attraction.',
    indicativePricePerKgKes: 220,
    maxFreshHoursOnIce: 24,
  },
  CATFISH: {
    id: 'CATFISH',
    commonName: 'African Sharptooth Catfish',
    localName: 'Mumi (Luo) / Kambale (Swahili)',
    scientificName: 'Clarias gariepinus',
    description: 'Hardy freshwater species with rich succulent meat, popular in traditional Lake Victoria cuisine.',
    indicativePricePerKgKes: 360,
    maxFreshHoursOnIce: 60,
  },
};

export interface LandingSite {
  id: string;
  name: string;
  county: 'Kisumu' | 'Siaya' | 'Homa Bay' | 'Migori' | 'Busia';
  code: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  bmuLeader: string;
  phoneContact: string;
  hasSolarIcePlant: boolean;
  activeBoatsCount: number;
}

export const LANDING_SITES: LandingSite[] = [
  {
    id: 'site-dunga',
    name: 'Dunga Beach BMU',
    county: 'Kisumu',
    code: 'DG',
    coordinates: { lat: -0.1465, lng: 34.7368 },
    bmuLeader: 'Otieno Maurice (BMU Chairman)',
    phoneContact: '+254 722 314 890',
    hasSolarIcePlant: true,
    activeBoatsCount: 64,
  },
  {
    id: 'site-uhanya',
    name: 'Uhanya Beach BMU',
    county: 'Siaya',
    code: 'UH',
    coordinates: { lat: -0.0682, lng: 34.1956 },
    bmuLeader: 'Achieng Perez (BMU Secretary)',
    phoneContact: '+254 713 902 441',
    hasSolarIcePlant: true,
    activeBoatsCount: 52,
  },
  {
    id: 'site-mbita',
    name: 'Mbita Point BMU',
    county: 'Homa Bay',
    code: 'MB',
    coordinates: { lat: -0.4285, lng: 34.2045 },
    bmuLeader: 'Okoth Tobias (BMU Clerk)',
    phoneContact: '+254 720 887 123',
    hasSolarIcePlant: true,
    activeBoatsCount: 88,
  },
  {
    id: 'site-usenge',
    name: 'Usenge Beach BMU',
    county: 'Siaya',
    code: 'US',
    coordinates: { lat: -0.0984, lng: 34.0532 },
    bmuLeader: 'Omondi Kevin (BMU Officer)',
    phoneContact: '+254 734 561 290',
    hasSolarIcePlant: false,
    activeBoatsCount: 45,
  },
  {
    id: 'site-karungu',
    name: 'Karungu Bay BMU',
    county: 'Migori',
    code: 'KG',
    coordinates: { lat: -0.8456, lng: 34.1567 },
    bmuLeader: 'Mboya Grace (BMU Chairlady)',
    phoneContact: '+254 725 440 981',
    hasSolarIcePlant: true,
    activeBoatsCount: 71,
  },
  {
    id: 'site-wichlum',
    name: 'Wichlum Beach BMU',
    county: 'Siaya',
    code: 'WL',
    coordinates: { lat: -0.0354, lng: 34.2189 },
    bmuLeader: 'Onyango Charles',
    phoneContact: '+254 711 789 012',
    hasSolarIcePlant: false,
    activeBoatsCount: 38,
  },
  {
    id: 'site-luanda',
    name: 'Luanda Kotieno BMU',
    county: 'Siaya',
    code: 'LK',
    coordinates: { lat: -0.4354, lng: 34.3312 },
    bmuLeader: 'Adhiambo Beatrice',
    phoneContact: '+254 728 901 345',
    hasSolarIcePlant: true,
    activeBoatsCount: 60,
  },
];

export interface RegisteredBoat {
  registrationNumber: string; // e.g. KV-084-KSM
  name: string;
  bmuSiteId: string;
  ownerName: string;
  captainName: string;
  captainPhone: string;
  lengthMeters: number;
  approvedGear: string;
  bmuLicenseValidUntil: string;
}

export type TraceabilityEventType =
  | 'HARVESTED'
  | 'LANDED'
  | 'WEIGHED'
  | 'ICED'
  | 'TRANSPORTED'
  | 'INSPECTED'
  | 'LISTED'
  | 'SOLD'
  | 'COMPENSATING_CORRECTION';

export type UserRole =
  | 'FISHER'
  | 'BMU_CLERK'
  | 'COLD_CHAIN_HANDLER'
  | 'COUNTY_OFFICER'
  | 'BUYER'
  | 'CONSUMER';

export interface SensoryInspection {
  eyes: 'clear_bulging' | 'flat_slightly_cloudy' | 'sunken_opaque';
  gills: 'bright_red_mucus_free' | 'pale_pink' | 'brown_sour_mucus';
  flesh: 'firm_elastic' | 'slightly_soft' | 'soft_dented';
  odor: 'fresh_seaweed_lake' | 'neutral_mild' | 'sour_stale';
  passedQualityAudit: boolean;
}

export interface TraceabilityEvent {
  id: string;
  batchId: string;
  eventType: TraceabilityEventType;
  timestamp: string; // ISO 8601
  actor: {
    name: string;
    role: UserRole;
    phoneMasked: string;
    organization?: string;
  };
  location: {
    siteName: string;
    siteCode?: string;
    county?: string;
    coordinates?: { lat: number; lng: number };
  };
  metadata: {
    weightKg?: number;
    fishCount?: number;
    temperatureCelsius?: number;
    iceRatio?: '1:1' | '1:2' | '1:3' | 'NO_ICE';
    iceSource?: string;
    transportVehicle?: string;
    transportDestination?: string;
    sensoryInspection?: SensoryInspection;
    listingPricePerKgKes?: number;
    totalListingKes?: number;
    salePriceKes?: number;
    buyerName?: string;
    buyerType?: string;
    directFeeKes?: number;
    correctionReason?: string;
    originalEventId?: string;
    notes?: string;
  };
  previousEventHash: string;
  eventHash: string; // SHA-256 integrity checksum
  channel: 'USSD' | 'WEB_OFFLINE_SYNC' | 'WEB_DESK' | 'SMS' | 'WHATSAPP';
}

export type FreshnessGrade =
  | 'GRADE_A_LAKE_FRESH' // Pristine iced, < 18h since landing, passed sensory
  | 'GRADE_B_GOOD_MARKET' // Good condition, < 36h, properly chilled
  | 'GRADE_C_PROCESS_IMMEDIATELY' // Edible, needs smoking/frying/drying today
  | 'SPOILED_UNFIT'; // Broken cold chain, > 48h warm, failed sensory

export type VerificationStatus =
  | 'VERIFIED_LAKE_FRESH'
  | 'VERIFIED_STANDARD'
  | 'PARTIALLY_VERIFIED'
  | 'DISPUTED'
  | 'EXPIRED'
  | 'SPOILED'
  | 'NOT_FOUND';

export interface FishBatch {
  id: string;
  batchId: string; // e.g. LV-DG-20260821-042
  qrCodePayload: string;
  boatRegistration: string;
  boatName: string;
  fisherName: string;
  fisherPhoneMasked: string;
  species: SpeciesType;
  harvestMethod: string;
  landingSiteId: string;
  landingSiteName: string;
  county: string;
  harvestTimestamp: string;
  landingTimestamp: string;
  initialWeightKg: number;
  currentWeightKg: number;
  currentTemperatureCelsius: number;
  lastIcedTimestamp?: string;
  freshnessGrade: FreshnessGrade;
  freshnessScorePercent: number; // 0-100
  qualifiesLakeFreshSeal: boolean;
  status: 'ACTIVE_LISTED' | 'IN_TRANSIT' | 'SOLD' | 'DISPUTED' | 'EXPIRED';
  verificationStatus: VerificationStatus;
  events: TraceabilityEvent[];
  listing?: {
    isListed: boolean;
    pricePerKgKes: number;
    estimatedTotalKes: number;
    directSaleFeeKes: number; // 1.5%
    fisherNetEarningsKes: number;
    sellerContactChannel: 'SMS_RELAY' | 'BMU_DESK';
  };
  createdAt: string;
  updatedAt: string;
  syncStatus: 'SYNCED' | 'QUEUED_OFFLINE' | 'CONFLICT_RESOLVED';
}

export interface SACCOCreditSignals {
  fisherName: string;
  fisherPhoneMasked: string;
  primaryBMU: string;
  membershipMonths: number;
  periodDays: number;
  totalLandingsCount: number;
  totalWeightHarvestedKg: number;
  totalEstimatedRevenueKes: number;
  landingConsistencyScore: number; // 0 - 100
  coldChainAdherenceRate: number; // % batches iced within 1h of landing
  verifiedDirectSaleRate: number; // % sold through transparent channels
  disputeRate: number; // % disputes (0 is best)
  recommendedCreditLimitKes: number;
  creditRiskBand: 'LOW_RISK_GOLD' | 'MODERATE_RISK_SILVER' | 'EMERGING_BUILDER';
  explainableSignals: {
    title: string;
    status: 'POSITIVE' | 'NEUTRAL' | 'ATTENTION';
    detail: string;
  }[];
}

// Zod Schemas for API validation
export const CreateBatchSchema = z.object({
  boatRegistration: z.string().min(3, 'Boat registration is required'),
  species: z.enum(['NILE_PERCH', 'TILAPIA', 'OMENA', 'CATFISH']),
  landingSiteId: z.string().min(1, 'Landing site is required'),
  harvestMethod: z.string().min(2, 'Harvest method is required'),
  weightKg: z.number().min(0.5, 'Weight must be at least 0.5 kg').max(1500, 'Weight exceeds realistic artisanal boat capacity'),
  fishCount: z.number().optional(),
  temperatureCelsius: z.number().min(0).max(35).default(8),
  iceRatio: z.enum(['1:1', '1:2', '1:3', 'NO_ICE']).default('1:1'),
  iceSource: z.string().default('Dunga Solar Ice Facility'),
  channel: z.enum(['USSD', 'WEB_OFFLINE_SYNC', 'WEB_DESK', 'SMS', 'WHATSAPP']).default('WEB_DESK'),
  notes: z.string().optional(),
});

export const AppendEventSchema = z.object({
  batchId: z.string().min(4, 'Batch ID is required'),
  eventType: z.enum([
    'HARVESTED',
    'LANDED',
    'WEIGHED',
    'ICED',
    'TRANSPORTED',
    'INSPECTED',
    'LISTED',
    'SOLD',
    'COMPENSATING_CORRECTION',
  ]),
  actorName: z.string().min(2, 'Actor name is required'),
  actorRole: z.enum(['FISHER', 'BMU_CLERK', 'COLD_CHAIN_HANDLER', 'COUNTY_OFFICER', 'BUYER', 'CONSUMER']),
  actorPhone: z.string().optional(),
  siteName: z.string().min(2, 'Location is required'),
  temperatureCelsius: z.number().optional(),
  iceRatio: z.enum(['1:1', '1:2', '1:3', 'NO_ICE']).optional(),
  iceSource: z.string().optional(),
  transportVehicle: z.string().optional(),
  transportDestination: z.string().optional(),
  sensoryInspection: z.object({
    eyes: z.enum(['clear_bulging', 'flat_slightly_cloudy', 'sunken_opaque']),
    gills: z.enum(['bright_red_mucus_free', 'pale_pink', 'brown_sour_mucus']),
    flesh: z.enum(['firm_elastic', 'slightly_soft', 'soft_dented']),
    odor: z.enum(['fresh_seaweed_lake', 'neutral_mild', 'sour_stale']),
    passedQualityAudit: z.boolean(),
  }).optional(),
  listingPricePerKgKes: z.number().optional(),
  salePriceKes: z.number().optional(),
  buyerName: z.string().optional(),
  buyerType: z.string().optional(),
  correctionReason: z.string().optional(),
  originalEventId: z.string().optional(),
  notes: z.string().optional(),
  channel: z.enum(['USSD', 'WEB_OFFLINE_SYNC', 'WEB_DESK', 'SMS', 'WHATSAPP']).default('WEB_DESK'),
});

export const USSDRequestSchema = z.object({
  sessionId: z.string(),
  serviceCode: z.string().default('*384*2782#'),
  phoneNumber: z.string(),
  text: z.string().default(''),
});