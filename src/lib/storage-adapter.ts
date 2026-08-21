import {
  CreateBatchSchema,
  FishBatch,
  LANDING_SITES,
  RegisteredBoat,
  SACCOCreditSignals,
  SPECIES_CATALOG,
  SpeciesType,
  TraceabilityEvent,
  TraceabilityEventType,
  UserRole,
} from '../types/aqua-seal';
import {
  calculateEventHash,
  evaluateBatchFreshness,
  generateBatchId,
  calculateMarketplaceFees,
} from './ledger-engine';

export interface StorageAdapter {
  getAllBatches(filter?: { siteId?: string; species?: SpeciesType; status?: string }): Promise<FishBatch[]>;
  getBatchById(batchIdOrId: string): Promise<FishBatch | null>;
  createBatch(data: {
    boatRegistration: string;
    species: SpeciesType;
    landingSiteId: string;
    harvestMethod: string;
    weightKg: number;
    fishCount?: number;
    temperatureCelsius?: number;
    iceRatio?: '1:1' | '1:2' | '1:3' | 'NO_ICE';
    iceSource?: string;
    actorName?: string;
    actorPhone?: string;
    channel?: 'USSD' | 'WEB_OFFLINE_SYNC' | 'WEB_DESK' | 'SMS' | 'WHATSAPP';
    notes?: string;
  }): Promise<FishBatch>;
  appendEvent(params: {
    batchId: string;
    eventType: TraceabilityEventType;
    actorName: string;
    actorRole: UserRole;
    actorPhone?: string;
    siteName: string;
    temperatureCelsius?: number;
    iceRatio?: '1:1' | '1:2' | '1:3' | 'NO_ICE';
    iceSource?: string;
    transportVehicle?: string;
    transportDestination?: string;
    sensoryInspection?: any;
    listingPricePerKgKes?: number;
    salePriceKes?: number;
    buyerName?: string;
    buyerType?: string;
    correctionReason?: string;
    originalEventId?: string;
    notes?: string;
    channel?: 'USSD' | 'WEB_OFFLINE_SYNC' | 'WEB_DESK' | 'SMS' | 'WHATSAPP';
  }): Promise<FishBatch>;
  getRegisteredBoats(): Promise<RegisteredBoat[]>;
  getSACCOCreditSignals(fisherPhoneOrName?: string): Promise<SACCOCreditSignals>;
  getBMUStats(): Promise<{
    totalTodayKg: number;
    activeBoatsCount: number;
    activeBatchesCount: number;
    solarIcedPercentage: number;
    topSpecies: { name: string; kg: number }[];
    recentEvents: TraceabilityEvent[];
  }>;
}

export const REGISTERED_BOATS: RegisteredBoat[] = [
  {
    registrationNumber: 'KV-084-KSM',
    name: 'Nyanza Star',
    bmuSiteId: 'site-dunga',
    ownerName: 'Otieno Maurice',
    captainName: 'James Onyango',
    captainPhone: '+254712345678',
    lengthMeters: 8.5,
    approvedGear: 'Certified Gillnet (6-inch mesh)',
    bmuLicenseValidUntil: '2026-12-31',
  },
  {
    registrationNumber: 'KV-112-SIA',
    name: 'Victoria Queen',
    bmuSiteId: 'site-uhanya',
    ownerName: 'Perez Achieng',
    captainName: 'George Ochieng',
    captainPhone: '+254723456789',
    lengthMeters: 9.0,
    approvedGear: 'Traditional Handline & Longline',
    bmuLicenseValidUntil: '2026-12-31',
  },
  {
    registrationNumber: 'KV-209-HBA',
    name: 'Suba Voyager',
    bmuSiteId: 'site-mbita',
    ownerName: 'Tobias Okoth',
    captainName: 'Samuel Odhiambo',
    captainPhone: '+254734567890',
    lengthMeters: 7.8,
    approvedGear: 'Approved Hook & Line',
    bmuLicenseValidUntil: '2026-12-31',
  },
  {
    registrationNumber: 'KV-305-MGR',
    name: 'Karungu Pioneer',
    bmuSiteId: 'site-karungu',
    ownerName: 'Grace Mboya',
    captainName: 'Peter Onyango',
    captainPhone: '+254745678901',
    lengthMeters: 8.2,
    approvedGear: 'Certified Gillnet',
    bmuLicenseValidUntil: '2026-12-31',
  },
  {
    registrationNumber: 'KV-410-SIA',
    name: 'Daktari Express',
    bmuSiteId: 'site-usenge',
    ownerName: 'Kevin Omondi',
    captainName: 'Francis Okumu',
    captainPhone: '+254756789012',
    lengthMeters: 8.0,
    approvedGear: 'Certified Longline',
    bmuLicenseValidUntil: '2026-12-31',
  },
];

class InMemoryStorageAdapter implements StorageAdapter {
  private batches: FishBatch[] = [];
  private sequenceCounter = 45;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
    const fourHoursAgo = new Date(now.getTime() - 4 * 3600 * 1000).toISOString();
    const sixHoursAgo = new Date(now.getTime() - 6 * 3600 * 1000).toISOString();
    const twentyHoursAgo = new Date(now.getTime() - 20 * 3600 * 1000).toISOString();
    const thirtyHoursAgo = new Date(now.getTime() - 30 * 3600 * 1000).toISOString();

    // Batch 1: Pristine Nile Perch at Dunga Beach (Lake Fresh)
    const batch1Id = 'LV-DG-20260821-042';
    const ev1_0: TraceabilityEvent = {
      id: 'ev-dng-001',
      batchId: batch1Id,
      eventType: 'HARVESTED',
      timestamp: sixHoursAgo,
      actor: { name: 'James Onyango', role: 'FISHER', phoneMasked: '+254 712 *** 678' },
      location: { siteName: 'Lake Victoria - Rusinga Channel', coordinates: { lat: -0.38, lng: 34.25 } },
      metadata: { weightKg: 85, notes: 'Harvested using certified 6-inch mesh gillnet at dawn.' },
      previousEventHash: '0x0000000000000000',
      eventHash: '0x8F91A2B03C4D5E6F',
      channel: 'WEB_DESK',
    };

    const ev1_1: TraceabilityEvent = {
      id: 'ev-dng-002',
      batchId: batch1Id,
      eventType: 'LANDED',
      timestamp: fourHoursAgo,
      actor: { name: 'Otieno Maurice', role: 'BMU_CLERK', phoneMasked: '+254 722 *** 890', organization: 'Dunga Beach BMU' },
      location: { siteName: 'Dunga Beach BMU', siteCode: 'DG', county: 'Kisumu', coordinates: { lat: -0.1465, lng: 34.7368 } },
      metadata: { weightKg: 85, temperatureCelsius: 14 },
      previousEventHash: ev1_0.eventHash,
      eventHash: '0x1A2B3C4D5E6F7A8B',
      channel: 'WEB_DESK',
    };

    const ev1_2: TraceabilityEvent = {
      id: 'ev-dng-003',
      batchId: batch1Id,
      eventType: 'ICED',
      timestamp: fourHoursAgo,
      actor: { name: 'Dunga Solar Ice Plant Operator', role: 'COLD_CHAIN_HANDLER', phoneMasked: '+254 700 *** 111' },
      location: { siteName: 'Dunga Beach Solar Cold Facility', county: 'Kisumu' },
      metadata: { temperatureCelsius: 2.8, iceRatio: '1:1', iceSource: 'Dunga BMU Solar Flake Ice Facility' },
      previousEventHash: ev1_1.eventHash,
      eventHash: '0x9E8D7C6B5A4F3E2D',
      channel: 'USSD',
    };

    const ev1_3: TraceabilityEvent = {
      id: 'ev-dng-004',
      batchId: batch1Id,
      eventType: 'INSPECTED',
      timestamp: twoHoursAgo,
      actor: { name: 'Achieng Perez', role: 'COUNTY_OFFICER', phoneMasked: '+254 733 *** 999', organization: 'Kisumu County Fisheries' },
      location: { siteName: 'Dunga Quality Control Station', county: 'Kisumu' },
      metadata: {
        sensoryInspection: {
          eyes: 'clear_bulging',
          gills: 'bright_red_mucus_free',
          flesh: 'firm_elastic',
          odor: 'fresh_seaweed_lake',
          passedQualityAudit: true,
        },
        notes: 'Premium export-grade Nile Perch. Clean handling verified.',
      },
      previousEventHash: ev1_2.eventHash,
      eventHash: '0x4F3E2D1C0B9A8F7E',
      channel: 'WEB_DESK',
    };

    const ev1_4: TraceabilityEvent = {
      id: 'ev-dng-005',
      batchId: batch1Id,
      eventType: 'LISTED',
      timestamp: twoHoursAgo,
      actor: { name: 'James Onyango', role: 'FISHER', phoneMasked: '+254 712 *** 678' },
      location: { siteName: 'Dunga Beach Market Desk' },
      metadata: { listingPricePerKgKes: 520, totalListingKes: 44200, notes: 'Offered for direct restaurant / wholesale purchase.' },
      previousEventHash: ev1_3.eventHash,
      eventHash: '0x5C6D7E8F9A0B1C2D',
      channel: 'WEB_DESK',
    };

    const batch1Events = [ev1_0, ev1_1, ev1_2, ev1_3, ev1_4];
    const fees1 = calculateMarketplaceFees(520, 85);
    const freshness1 = evaluateBatchFreshness('NILE_PERCH', sixHoursAgo, fourHoursAgo, batch1Events);

    const batch1: FishBatch = {
      id: 'batch-001',
      batchId: batch1Id,
      qrCodePayload: `https://aqua-seal.lakevictoria.org/verify?b=${batch1Id}`,
      boatRegistration: 'KV-084-KSM',
      boatName: 'Nyanza Star',
      fisherName: 'James Onyango',
      fisherPhoneMasked: '+254 712 *** 678',
      species: 'NILE_PERCH',
      harvestMethod: 'Certified Gillnet (6-inch mesh)',
      landingSiteId: 'site-dunga',
      landingSiteName: 'Dunga Beach BMU',
      county: 'Kisumu',
      harvestTimestamp: sixHoursAgo,
      landingTimestamp: fourHoursAgo,
      initialWeightKg: 85,
      currentWeightKg: 85,
      currentTemperatureCelsius: 2.8,
      lastIcedTimestamp: fourHoursAgo,
      freshnessGrade: freshness1.grade,
      freshnessScorePercent: freshness1.scorePercent,
      qualifiesLakeFreshSeal: freshness1.qualifiesLakeFresh,
      status: 'ACTIVE_LISTED',
      verificationStatus: freshness1.verificationStatus,
      events: batch1Events,
      listing: {
        isListed: true,
        pricePerKgKes: 520,
        estimatedTotalKes: fees1.grossTotalKes,
        directSaleFeeKes: fees1.directSaleFeeKes,
        fisherNetEarningsKes: fees1.fisherNetEarningsKes,
        sellerContactChannel: 'SMS_RELAY',
      },
      createdAt: fourHoursAgo,
      updatedAt: twoHoursAgo,
      syncStatus: 'SYNCED',
    };

    // Batch 2: Nile Tilapia at Uhanya Beach (Good Market)
    const batch2Id = 'LV-UH-20260821-019';
    const ev2_0: TraceabilityEvent = {
      id: 'ev-uh-001',
      batchId: batch2Id,
      eventType: 'HARVESTED',
      timestamp: twentyHoursAgo,
      actor: { name: 'George Ochieng', role: 'FISHER', phoneMasked: '+254 723 *** 789' },
      location: { siteName: 'Yimbo Bay Waters', coordinates: { lat: -0.05, lng: 34.18 } },
      metadata: { weightKg: 42, notes: 'Caught near papyrus sanctuary zone.' },
      previousEventHash: '0x0000000000000000',
      eventHash: '0x7A6B5C4D3E2F1A0B',
      channel: 'USSD',
    };

    const ev2_1: TraceabilityEvent = {
      id: 'ev-uh-002',
      batchId: batch2Id,
      eventType: 'LANDED',
      timestamp: twentyHoursAgo,
      actor: { name: 'Perez Achieng', role: 'BMU_CLERK', phoneMasked: '+254 713 *** 441', organization: 'Uhanya BMU' },
      location: { siteName: 'Uhanya Beach BMU', siteCode: 'UH', county: 'Siaya' },
      metadata: { weightKg: 42, temperatureCelsius: 18 },
      previousEventHash: ev2_0.eventHash,
      eventHash: '0x3D2C1B0A9F8E7D6C',
      channel: 'USSD',
    };

    const ev2_2: TraceabilityEvent = {
      id: 'ev-uh-003',
      batchId: batch2Id,
      eventType: 'ICED',
      timestamp: twentyHoursAgo,
      actor: { name: 'Mama Lucy Cold Hub', role: 'COLD_CHAIN_HANDLER', phoneMasked: '+254 722 *** 333' },
      location: { siteName: 'Uhanya Cold Store' },
      metadata: { temperatureCelsius: 4.5, iceRatio: '1:2', iceSource: 'Uhanya Central Ice Plant' },
      previousEventHash: ev2_1.eventHash,
      eventHash: '0x8C7B6A5D4E3F2A1B',
      channel: 'WEB_DESK',
    };

    const batch2Events = [ev2_0, ev2_1, ev2_2];
    const fees2 = calculateMarketplaceFees(430, 42);
    const freshness2 = evaluateBatchFreshness('TILAPIA', twentyHoursAgo, twentyHoursAgo, batch2Events);

    const batch2: FishBatch = {
      id: 'batch-002',
      batchId: batch2Id,
      qrCodePayload: `https://aqua-seal.lakevictoria.org/verify?b=${batch2Id}`,
      boatRegistration: 'KV-112-SIA',
      boatName: 'Victoria Queen',
      fisherName: 'George Ochieng',
      fisherPhoneMasked: '+254 723 *** 789',
      species: 'TILAPIA',
      harvestMethod: 'Traditional Handline & Longline',
      landingSiteId: 'site-uhanya',
      landingSiteName: 'Uhanya Beach BMU',
      county: 'Siaya',
      harvestTimestamp: twentyHoursAgo,
      landingTimestamp: twentyHoursAgo,
      initialWeightKg: 42,
      currentWeightKg: 42,
      currentTemperatureCelsius: 4.5,
      lastIcedTimestamp: twentyHoursAgo,
      freshnessGrade: freshness2.grade,
      freshnessScorePercent: freshness2.scorePercent,
      qualifiesLakeFreshSeal: freshness2.qualifiesLakeFresh,
      status: 'ACTIVE_LISTED',
      verificationStatus: freshness2.verificationStatus,
      events: batch2Events,
      listing: {
        isListed: true,
        pricePerKgKes: 430,
        estimatedTotalKes: fees2.grossTotalKes,
        directSaleFeeKes: fees2.directSaleFeeKes,
        fisherNetEarningsKes: fees2.fisherNetEarningsKes,
        sellerContactChannel: 'SMS_RELAY',
      },
      createdAt: twentyHoursAgo,
      updatedAt: twentyHoursAgo,
      syncStatus: 'SYNCED',
    };

    // Batch 3: Catfish at Mbita Point with a Compensating Correction event (Demonstrating immutable ledger audit)
    const batch3Id = 'LV-MB-20260820-088';
    const ev3_0: TraceabilityEvent = {
      id: 'ev-mb-001',
      batchId: batch3Id,
      eventType: 'HARVESTED',
      timestamp: thirtyHoursAgo,
      actor: { name: 'Samuel Odhiambo', role: 'FISHER', phoneMasked: '+254 734 *** 890' },
      location: { siteName: 'Rusinga Island Deep Channel' },
      metadata: { weightKg: 60 },
      previousEventHash: '0x0000000000000000',
      eventHash: '0x1122334455667788',
      channel: 'USSD',
    };

    const ev3_1: TraceabilityEvent = {
      id: 'ev-mb-002',
      batchId: batch3Id,
      eventType: 'LANDED',
      timestamp: thirtyHoursAgo,
      actor: { name: 'Tobias Okoth', role: 'BMU_CLERK', phoneMasked: '+254 720 *** 123', organization: 'Mbita Point BMU' },
      location: { siteName: 'Mbita Point BMU', siteCode: 'MB', county: 'Homa Bay' },
      metadata: { weightKg: 50 }, // Erroneous initial entry
      previousEventHash: ev3_0.eventHash,
      eventHash: '0x9988776655443322',
      channel: 'WEB_DESK',
    };

    const ev3_2: TraceabilityEvent = {
      id: 'ev-mb-003',
      batchId: batch3Id,
      eventType: 'COMPENSATING_CORRECTION',
      timestamp: twentyHoursAgo,
      actor: { name: 'Tobias Okoth', role: 'BMU_CLERK', phoneMasked: '+254 720 *** 123', organization: 'Mbita Point BMU' },
      location: { siteName: 'Mbita Point BMU', county: 'Homa Bay' },
      metadata: {
        weightKg: 58,
        originalEventId: 'ev-mb-002',
        correctionReason: 'Recalibrated BMU digital hanging scale tare weight. True verified weight is 58.0 kg.',
      },
      previousEventHash: ev3_1.eventHash,
      eventHash: '0xAABBCCDDEEFF0011',
      channel: 'WEB_DESK',
    };

    const ev3_3: TraceabilityEvent = {
      id: 'ev-mb-004',
      batchId: batch3Id,
      eventType: 'SOLD',
      timestamp: twoHoursAgo,
      actor: { name: 'Samuel Odhiambo', role: 'FISHER', phoneMasked: '+254 734 *** 890' },
      location: { siteName: 'Mbita Point BMU' },
      metadata: {
        salePriceKes: 20880,
        buyerName: 'Victoria Oasis Lodge & Fishmongers Ltd',
        buyerType: 'HOTEL',
        directFeeKes: 313,
      },
      previousEventHash: ev3_2.eventHash,
      eventHash: '0x2233445566778899',
      channel: 'WEB_DESK',
    };

    const batch3Events = [ev3_0, ev3_1, ev3_2, ev3_3];
    const freshness3 = evaluateBatchFreshness('CATFISH', thirtyHoursAgo, thirtyHoursAgo, batch3Events);

    const batch3: FishBatch = {
      id: 'batch-003',
      batchId: batch3Id,
      qrCodePayload: `https://aqua-seal.lakevictoria.org/verify?b=${batch3Id}`,
      boatRegistration: 'KV-209-HBA',
      boatName: 'Suba Voyager',
      fisherName: 'Samuel Odhiambo',
      fisherPhoneMasked: '+254 734 *** 890',
      species: 'CATFISH',
      harvestMethod: 'Approved Hook & Line',
      landingSiteId: 'site-mbita',
      landingSiteName: 'Mbita Point BMU',
      county: 'Homa Bay',
      harvestTimestamp: thirtyHoursAgo,
      landingTimestamp: thirtyHoursAgo,
      initialWeightKg: 58,
      currentWeightKg: 58,
      currentTemperatureCelsius: 5.2,
      lastIcedTimestamp: thirtyHoursAgo,
      freshnessGrade: freshness3.grade,
      freshnessScorePercent: freshness3.scorePercent,
      qualifiesLakeFreshSeal: false,
      status: 'SOLD',
      verificationStatus: 'VERIFIED_STANDARD',
      events: batch3Events,
      createdAt: thirtyHoursAgo,
      updatedAt: twoHoursAgo,
      syncStatus: 'SYNCED',
    };

    this.batches = [batch1, batch2, batch3];
  }

  async getAllBatches(filter?: { siteId?: string; species?: SpeciesType; status?: string }): Promise<FishBatch[]> {
    let result = [...this.batches];
    if (filter?.siteId) {
      result = result.filter((b) => b.landingSiteId === filter.siteId);
    }
    if (filter?.species) {
      result = result.filter((b) => b.species === filter.species);
    }
    if (filter?.status) {
      result = result.filter((b) => b.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBatchById(batchIdOrId: string): Promise<FishBatch | null> {
    const cleanId = batchIdOrId.trim().toUpperCase();
    const batch = this.batches.find((b) => b.batchId.toUpperCase() === cleanId || b.id.toUpperCase() === cleanId);
    return batch || null;
  }

  async createBatch(data: {
    boatRegistration: string;
    species: SpeciesType;
    landingSiteId: string;
    harvestMethod: string;
    weightKg: number;
    fishCount?: number;
    temperatureCelsius?: number;
    iceRatio?: '1:1' | '1:2' | '1:3' | 'NO_ICE';
    iceSource?: string;
    actorName?: string;
    actorPhone?: string;
    channel?: 'USSD' | 'WEB_OFFLINE_SYNC' | 'WEB_DESK' | 'SMS' | 'WHATSAPP';
    notes?: string;
  }): Promise<FishBatch> {
    this.sequenceCounter += 1;
    const site = LANDING_SITES.find((s) => s.id === data.landingSiteId) || LANDING_SITES[0];
    const boat = REGISTERED_BOATS.find((b) => b.registrationNumber === data.boatRegistration) || {
      registrationNumber: data.boatRegistration,
      name: 'Artisanal Vessel ' + data.boatRegistration,
      ownerName: data.actorName || 'Registered Lake Fisher',
      captainName: data.actorName || 'Fisher Captain',
      captainPhone: data.actorPhone || '+254712000000',
    };

    const batchId = generateBatchId(site.code, this.sequenceCounter);
    const nowIso = new Date().toISOString();

    // 1. Initial HARVESTED event
    const harvestHash = calculateEventHash(
      '0x0000000000000000',
      batchId,
      'HARVESTED',
      nowIso,
      'FISHER',
      JSON.stringify({ boat: boat.name, method: data.harvestMethod })
    );

    const harvestEvent: TraceabilityEvent = {
      id: `ev-${Date.now()}-harv`,
      batchId,
      eventType: 'HARVESTED',
      timestamp: nowIso,
      actor: {
        name: boat.captainName,
        role: 'FISHER',
        phoneMasked: boat.captainPhone ? boat.captainPhone.slice(0, 7) + ' *** ' + boat.captainPhone.slice(-3) : '+254 7XX *** XXX',
      },
      location: {
        siteName: `${site.name} Waters`,
        coordinates: site.coordinates,
      },
      metadata: {
        weightKg: data.weightKg,
        fishCount: data.fishCount,
        notes: data.notes || `Catch harvested aboard ${boat.name} via ${data.harvestMethod}`,
      },
      previousEventHash: '0x0000000000000000',
      eventHash: harvestHash,
      channel: data.channel || 'WEB_DESK',
    };

    // 2. LANDED & WEIGHED event at BMU
    const landedHash = calculateEventHash(
      harvestHash,
      batchId,
      'LANDED',
      nowIso,
      'BMU_CLERK',
      JSON.stringify({ weightKg: data.weightKg, site: site.name })
    );

    const landedEvent: TraceabilityEvent = {
      id: `ev-${Date.now()}-land`,
      batchId,
      eventType: 'LANDED',
      timestamp: nowIso,
      actor: {
        name: data.actorName || site.bmuLeader,
        role: 'BMU_CLERK',
        phoneMasked: site.phoneContact,
        organization: site.name,
      },
      location: {
        siteName: site.name,
        siteCode: site.code,
        county: site.county,
        coordinates: site.coordinates,
      },
      metadata: {
        weightKg: data.weightKg,
        temperatureCelsius: data.temperatureCelsius ?? 10,
        iceRatio: data.iceRatio || '1:1',
        iceSource: data.iceSource || (site.hasSolarIcePlant ? `${site.name} Solar Ice Facility` : 'Beach Ice Storage'),
      },
      previousEventHash: harvestHash,
      eventHash: landedHash,
      channel: data.channel || 'WEB_DESK',
    };

    const events = [harvestEvent, landedEvent];

    // If iced at landing
    if (data.iceRatio && data.iceRatio !== 'NO_ICE') {
      const icedHash = calculateEventHash(
        landedHash,
        batchId,
        'ICED',
        nowIso,
        'COLD_CHAIN_HANDLER',
        JSON.stringify({ iceRatio: data.iceRatio, temp: data.temperatureCelsius })
      );
      const icedEvent: TraceabilityEvent = {
        id: `ev-${Date.now()}-iced`,
        batchId,
        eventType: 'ICED',
        timestamp: nowIso,
        actor: {
          name: `${site.name} Cold Chain Desk`,
          role: 'COLD_CHAIN_HANDLER',
          phoneMasked: site.phoneContact,
        },
        location: {
          siteName: site.name,
          county: site.county,
        },
        metadata: {
          temperatureCelsius: data.temperatureCelsius ?? 3.5,
          iceRatio: data.iceRatio,
          iceSource: data.iceSource || `${site.name} Solar Ice Plant`,
        },
        previousEventHash: landedHash,
        eventHash: icedHash,
        channel: data.channel || 'WEB_DESK',
      };
      events.push(icedEvent);
    }

    const speciesMeta = SPECIES_CATALOG[data.species] || SPECIES_CATALOG.NILE_PERCH;
    const defaultPricePerKg = speciesMeta.indicativePricePerKgKes;
    const feeBreakdown = calculateMarketplaceFees(defaultPricePerKg, data.weightKg);
    const freshness = evaluateBatchFreshness(data.species, nowIso, nowIso, events);

    const newBatch: FishBatch = {
      id: `batch-${Date.now()}`,
      batchId,
      qrCodePayload: `https://aqua-seal.lakevictoria.org/verify?b=${batchId}`,
      boatRegistration: data.boatRegistration,
      boatName: boat.name,
      fisherName: boat.captainName || boat.ownerName,
      fisherPhoneMasked: boat.captainPhone ? boat.captainPhone.slice(0, 7) + ' *** ' + boat.captainPhone.slice(-3) : '+254 712 *** 000',
      species: data.species,
      harvestMethod: data.harvestMethod,
      landingSiteId: site.id,
      landingSiteName: site.name,
      county: site.county,
      harvestTimestamp: nowIso,
      landingTimestamp: nowIso,
      initialWeightKg: data.weightKg,
      currentWeightKg: data.weightKg,
      currentTemperatureCelsius: data.temperatureCelsius ?? 3.5,
      lastIcedTimestamp: nowIso,
      freshnessGrade: freshness.grade,
      freshnessScorePercent: freshness.scorePercent,
      qualifiesLakeFreshSeal: freshness.qualifiesLakeFresh,
      status: 'ACTIVE_LISTED',
      verificationStatus: freshness.verificationStatus,
      events,
      listing: {
        isListed: true,
        pricePerKgKes: defaultPricePerKg,
        estimatedTotalKes: feeBreakdown.grossTotalKes,
        directSaleFeeKes: feeBreakdown.directSaleFeeKes,
        fisherNetEarningsKes: feeBreakdown.fisherNetEarningsKes,
        sellerContactChannel: 'SMS_RELAY',
      },
      createdAt: nowIso,
      updatedAt: nowIso,
      syncStatus: 'SYNCED',
    };

    this.batches.unshift(newBatch);
    return newBatch;
  }

  async appendEvent(params: {
    batchId: string;
    eventType: TraceabilityEventType;
    actorName: string;
    actorRole: UserRole;
    actorPhone?: string;
    siteName: string;
    temperatureCelsius?: number;
    iceRatio?: '1:1' | '1:2' | '1:3' | 'NO_ICE';
    iceSource?: string;
    transportVehicle?: string;
    transportDestination?: string;
    sensoryInspection?: any;
    listingPricePerKgKes?: number;
    salePriceKes?: number;
    buyerName?: string;
    buyerType?: string;
    correctionReason?: string;
    originalEventId?: string;
    notes?: string;
    channel?: 'USSD' | 'WEB_OFFLINE_SYNC' | 'WEB_DESK' | 'SMS' | 'WHATSAPP';
  }): Promise<FishBatch> {
    const batch = await this.getBatchById(params.batchId);
    if (!batch) {
      throw new Error(`Batch with ID '${params.batchId}' not found.`);
    }

    const nowIso = new Date().toISOString();
    const lastEvent = batch.events[batch.events.length - 1];
    const previousHash = lastEvent ? lastEvent.eventHash : '0x0000000000000000';

    const eventHash = calculateEventHash(
      previousHash,
      batch.batchId,
      params.eventType,
      nowIso,
      params.actorRole,
      JSON.stringify({
        temp: params.temperatureCelsius,
        vehicle: params.transportVehicle,
        price: params.listingPricePerKgKes || params.salePriceKes,
        correction: params.correctionReason,
      })
    );

    const newEvent: TraceabilityEvent = {
      id: `ev-${Date.now()}-${params.eventType.toLowerCase()}`,
      batchId: batch.batchId,
      eventType: params.eventType,
      timestamp: nowIso,
      actor: {
        name: params.actorName,
        role: params.actorRole,
        phoneMasked: params.actorPhone ? params.actorPhone.slice(0, 7) + ' *** ' + params.actorPhone.slice(-3) : '+254 7XX *** XXX',
      },
      location: {
        siteName: params.siteName,
      },
      metadata: {
        temperatureCelsius: params.temperatureCelsius,
        iceRatio: params.iceRatio,
        iceSource: params.iceSource,
        transportVehicle: params.transportVehicle,
        transportDestination: params.transportDestination,
        sensoryInspection: params.sensoryInspection,
        listingPricePerKgKes: params.listingPricePerKgKes,
        salePriceKes: params.salePriceKes,
        buyerName: params.buyerName,
        buyerType: params.buyerType,
        correctionReason: params.correctionReason,
        originalEventId: params.originalEventId,
        notes: params.notes,
      },
      previousEventHash: previousHash,
      eventHash,
      channel: params.channel || 'WEB_DESK',
    };

    batch.events.push(newEvent);

    // Apply state mutations based on event
    if (params.temperatureCelsius !== undefined) {
      batch.currentTemperatureCelsius = params.temperatureCelsius;
    }
    if (params.eventType === 'ICED') {
      batch.lastIcedTimestamp = nowIso;
    }
    if (params.eventType === 'SOLD') {
      batch.status = 'SOLD';
    } else if (params.eventType === 'TRANSPORTED') {
      batch.status = 'IN_TRANSIT';
    } else if (params.eventType === 'LISTED' && params.listingPricePerKgKes) {
      const fees = calculateMarketplaceFees(params.listingPricePerKgKes, batch.currentWeightKg);
      batch.listing = {
        isListed: true,
        pricePerKgKes: params.listingPricePerKgKes,
        estimatedTotalKes: fees.grossTotalKes,
        directSaleFeeKes: fees.directSaleFeeKes,
        fisherNetEarningsKes: fees.fisherNetEarningsKes,
        sellerContactChannel: 'SMS_RELAY',
      };
    }

    // Re-evaluate freshness
    const freshness = evaluateBatchFreshness(batch.species, batch.harvestTimestamp, batch.landingTimestamp, batch.events);
    batch.freshnessGrade = freshness.grade;
    batch.freshnessScorePercent = freshness.scorePercent;
    batch.qualifiesLakeFreshSeal = freshness.qualifiesLakeFresh;
    batch.verificationStatus = freshness.verificationStatus;
    batch.updatedAt = nowIso;

    return batch;
  }

  async getRegisteredBoats(): Promise<RegisteredBoat[]> {
    return REGISTERED_BOATS;
  }

  async getSACCOCreditSignals(fisherPhoneOrName?: string): Promise<SACCOCreditSignals> {
    return {
      fisherName: 'James Onyango',
      fisherPhoneMasked: '+254 712 *** 678',
      primaryBMU: 'Dunga Beach BMU (Kisumu)',
      membershipMonths: 38,
      periodDays: 90,
      totalLandingsCount: 64,
      totalWeightHarvestedKg: 3840,
      totalEstimatedRevenueKes: 1843200,
      landingConsistencyScore: 92, // 92% landing regularity
      coldChainAdherenceRate: 98, // 98% immediate solar icing
      verifiedDirectSaleRate: 89, // 89% direct fair market sales
      disputeRate: 0, // 0 disputes
      recommendedCreditLimitKes: 120000,
      creditRiskBand: 'LOW_RISK_GOLD',
      explainableSignals: [
        {
          title: '3-Month Landing Velocity',
          status: 'POSITIVE',
          detail: '64 recorded catches in 90 days. Consistent harvest history with 0 unexplained gaps exceeding 4 days.',
        },
        {
          title: 'Cold-Chain Solar Ice Adherence',
          status: 'POSITIVE',
          detail: '98% of catches were logged into Dunga BMU solar cold store within 45 minutes of landing.',
        },
        {
          title: 'Zero Tampering or Batch Disputes',
          status: 'POSITIVE',
          detail: 'Clean cryptographic ledger history with no reported buyer rejections or mesh-size violations.',
        },
        {
          title: 'Direct Market Revenue Stability',
          status: 'POSITIVE',
          detail: 'Average weekly net revenue of KES 141,700 through transparent buyer agreements.',
        },
      ],
    };
  }

  async getBMUStats() {
    const totalTodayKg = this.batches.reduce((sum, b) => sum + b.currentWeightKg, 0);
    const activeBoatsCount = REGISTERED_BOATS.length;
    const activeBatchesCount = this.batches.filter((b) => b.status === 'ACTIVE_LISTED').length;
    const solarIcedCount = this.batches.filter((b) => b.lastIcedTimestamp).length;
    const solarIcedPercentage = this.batches.length ? Math.round((solarIcedCount / this.batches.length) * 100) : 100;

    const speciesCounts: Record<string, number> = {};
    this.batches.forEach((b) => {
      speciesCounts[b.species] = (speciesCounts[b.species] || 0) + b.currentWeightKg;
    });

    const topSpecies = Object.entries(speciesCounts).map(([key, kg]) => ({
      name: SPECIES_CATALOG[key as SpeciesType]?.commonName || key,
      kg,
    }));

    const recentEvents = this.batches.flatMap((b) => b.events).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    return {
      totalTodayKg,
      activeBoatsCount,
      activeBatchesCount,
      solarIcedPercentage,
      topSpecies,
      recentEvents,
    };
  }
}

// Global Singleton Storage Adapter
export const storageAdapter: StorageAdapter = new InMemoryStorageAdapter();