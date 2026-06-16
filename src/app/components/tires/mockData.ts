import type {
  TpmsServiceConfig, TpmsVisitRecord,
  TireRegistration, RegistrationBatch,
  RoadHazardConfig, RoadHazardWarranty, WarrantyClaim,
  TirePositionRecord, TakeOffRecord, SwapStoreEntry,
  ClaimStats, Rebate, RebateAttribution, RegistrationRateRow,
} from './types';

// ── T1: TPMS ─────────────────────────────────────────────────────────────────
export const TPMS_CONFIG: TpmsServiceConfig = {
  rebuildEnabled: true,
  rebuildPricePerWheel: 12,
  rebuildTimeMinutes: 8,
  replacementEnabled: true,
  replacementPricePerWheel: 89,
  replacementTimeMinutes: 20,
};

export const TPMS_VISITS: TpmsVisitRecord[] = [
  {
    id: 'tv-001', visitId: 'v-1001', customerName: 'Maria Santos', vehicleLabel: '2021 Honda CR-V', techName: 'Jake R.',
    createdAt: '2026-06-15T09:22:00Z',
    wheels: [
      { position: 'FL', action: 'rebuild_only', relearn: 'success', upsoldToReplacement: false },
      { position: 'FR', action: 'rebuild_only', relearn: 'success', upsoldToReplacement: false },
      { position: 'RL', action: 'sensor_replaced', sensorSkuId: 'sku-tpms-315', sensorSkuName: 'OE TPMS 315MHz', relearn: 'success', upsoldToReplacement: true },
      { position: 'RR', action: 'rebuild_only', relearn: 'retry_needed', upsoldToReplacement: false },
    ],
  },
  {
    id: 'tv-002', visitId: 'v-1002', customerName: 'Derek Owens', vehicleLabel: '2019 Ford F-150', techName: 'Sam T.',
    createdAt: '2026-06-14T14:05:00Z',
    wheels: [
      { position: 'FL', action: 'rebuild_only', relearn: 'success', upsoldToReplacement: false },
      { position: 'FR', action: 'skipped', skipReason: 'Customer declined', relearn: 'pending', upsoldToReplacement: false },
      { position: 'RL', action: 'rebuild_only', relearn: 'success', upsoldToReplacement: false },
      { position: 'RR', action: 'sensor_replaced', sensorSkuId: 'sku-tpms-433', sensorSkuName: 'Universal TPMS 433MHz', relearn: 'success', upsoldToReplacement: true },
    ],
  },
  {
    id: 'tv-003', visitId: 'v-1003', customerName: 'Alice Park', vehicleLabel: '2023 Toyota RAV4', techName: 'Jake R.',
    createdAt: '2026-06-13T11:00:00Z',
    wheels: [
      { position: 'FL', action: 'sensor_replaced', sensorSkuId: 'sku-tpms-315', sensorSkuName: 'OE TPMS 315MHz', relearn: 'success', upsoldToReplacement: false },
      { position: 'FR', action: 'sensor_replaced', sensorSkuId: 'sku-tpms-315', sensorSkuName: 'OE TPMS 315MHz', relearn: 'success', upsoldToReplacement: false },
      { position: 'RL', action: 'rebuild_only', relearn: 'success', upsoldToReplacement: false },
      { position: 'RR', action: 'rebuild_only', relearn: 'failed', upsoldToReplacement: false },
    ],
  },
];

// ── T2/T3: Tire Registration + DOT ───────────────────────────────────────────
export const TIRE_REGISTRATIONS: TireRegistration[] = [
  { id: 'tr-001', visitId: 'v-1001', customerId: 'c-101', customerName: 'Maria Santos', skuId: 'sku-tz-245', skuName: 'Michelin CrossClimate2 245/50R18', manufacturer: 'Michelin', dotCode: 'DOT M38V LJMR 1824', saleDate: '2026-06-15', consentGiven: true, status: 'confirmed', batchId: 'batch-001' },
  { id: 'tr-002', visitId: 'v-1001', customerId: 'c-101', customerName: 'Maria Santos', skuId: 'sku-tz-245', skuName: 'Michelin CrossClimate2 245/50R18', manufacturer: 'Michelin', dotCode: 'DOT M38V LJMR 1924', saleDate: '2026-06-15', consentGiven: true, status: 'confirmed', batchId: 'batch-001' },
  { id: 'tr-003', visitId: 'v-1002', customerId: 'c-102', customerName: 'Derek Owens', skuId: 'sku-bfg-265', skuName: 'BFGoodrich KO3 265/70R17', manufacturer: 'BFGoodrich', dotCode: 'DOT HB8N VKRP 0924', saleDate: '2026-06-14', consentGiven: true, status: 'in_batch', batchId: 'batch-002' },
  { id: 'tr-004', visitId: 'v-1002', customerId: 'c-102', customerName: 'Derek Owens', skuId: 'sku-bfg-265', skuName: 'BFGoodrich KO3 265/70R17', manufacturer: 'BFGoodrich', dotCode: 'DOT HB8N VKRP 1024', saleDate: '2026-06-14', consentGiven: false, status: 'pending', batchId: null },
  { id: 'tr-005', visitId: 'v-1003', customerId: 'c-103', customerName: 'Alice Park', skuId: 'sku-gyr-225', skuName: 'Goodyear Assurance WeatherReady 225/60R17', manufacturer: 'Goodyear', dotCode: 'DOT WW2T UJNR 2224', saleDate: '2026-06-13', consentGiven: true, status: 'submitted', batchId: 'batch-003' },
  { id: 'tr-006', visitId: 'v-1004', customerId: 'c-104', customerName: 'Tom Harris', skuId: 'sku-prl-205', skuName: 'Pirelli Cinturato P7 205/55R16', manufacturer: 'Pirelli', dotCode: 'DOT XX2B HJNR 1224', saleDate: '2026-06-10', consentGiven: true, status: 'failed', batchId: null, failureReason: 'Invalid DOT format — resubmit' },
];

export const REGISTRATION_BATCHES: RegistrationBatch[] = [
  { id: 'batch-001', manufacturer: 'Michelin', tiresCount: 12, status: 'confirmed', fileUrl: 'https://example.com/batch-001.csv', createdAt: '2026-06-01', submittedAt: '2026-06-08', confirmedAt: '2026-06-10' },
  { id: 'batch-002', manufacturer: 'BFGoodrich', tiresCount: 7, status: 'submitted_by_shop', fileUrl: 'https://example.com/batch-002.csv', createdAt: '2026-06-08', submittedAt: '2026-06-14', confirmedAt: null },
  { id: 'batch-003', manufacturer: 'Goodyear', tiresCount: 4, status: 'pending', fileUrl: null, createdAt: '2026-06-13', submittedAt: null, confirmedAt: null },
];

// ── T4: Road Hazard Warranty ──────────────────────────────────────────────────
export const ROAD_HAZARD_CONFIG: RoadHazardConfig = {
  durationMonths: 36,
  coverageType: 'free_replacement',
  price: 29.99,
  priceAsPercentOfTire: false,
  coveredScenarios: ['Nail/screw puncture', 'Road debris damage', 'Pothole damage', 'Sidewall cuts (non-negligence)'],
  exclusions: ['Vandalism', 'Racing/off-road misuse', 'Manufacturer defect (use OEM warranty)', 'Negligence or improper inflation'],
  recommendationLevel: 'recommended',
};

export const ROAD_HAZARD_WARRANTIES: RoadHazardWarranty[] = [
  { id: 'rhw-001', visitId: 'v-1001', customerId: 'c-101', customerName: 'Maria Santos', skuId: 'sku-tz-245', skuName: 'Michelin CrossClimate2', dotCode: 'DOT M38V LJMR 1824', purchaseDate: '2026-06-15', expirationDate: '2029-06-15', coverageType: 'free_replacement', status: 'active', pricePaid: 29.99 },
  { id: 'rhw-002', visitId: 'v-1002', customerId: 'c-102', customerName: 'Derek Owens', skuId: 'sku-bfg-265', skuName: 'BFGoodrich KO3', dotCode: 'DOT HB8N VKRP 0924', purchaseDate: '2026-06-14', expirationDate: '2029-06-14', coverageType: 'free_replacement', status: 'active', pricePaid: 29.99 },
  { id: 'rhw-003', visitId: 'v-0800', customerId: 'c-105', customerName: 'Sandra Lee', skuId: 'sku-ctr-215', skuName: 'Continental ExtremeContact', dotCode: 'DOT BC2X HJRP 4223', purchaseDate: '2025-01-10', expirationDate: '2028-01-10', coverageType: 'prorated', status: 'claimed', pricePaid: 24.99 },
  { id: 'rhw-004', visitId: 'v-0600', customerId: 'c-106', customerName: 'Bill Torres', skuId: 'sku-brg-195', skuName: 'Bridgestone Ecopia EP422', dotCode: 'DOT MX8P YMRP 3022', purchaseDate: '2023-03-20', expirationDate: '2026-03-20', coverageType: 'mileage_based', status: 'expired', pricePaid: 19.99 },
];

export const WARRANTY_CLAIMS: WarrantyClaim[] = [
  { id: 'wc-001', warrantyId: 'rhw-003', customerId: 'c-105', customerName: 'Sandra Lee', skuName: 'Continental ExtremeContact', milesAtClaim: 18400, treadDepthMm: 5.2, eventDescription: 'Large pothole on I-90 caused sidewall bulge', photoCount: 3, status: 'approved', submittedAt: '2026-05-22T10:15:00Z', resolvedAt: '2026-06-01T14:30:00Z' },
  { id: 'wc-002', warrantyId: 'rhw-001', customerId: 'c-101', customerName: 'Maria Santos', skuName: 'Michelin CrossClimate2', milesAtClaim: 4200, treadDepthMm: 9.1, eventDescription: 'Roofing nail puncture — flat tire on highway', photoCount: 2, status: 'open', submittedAt: '2026-06-16T08:00:00Z', resolvedAt: null },
  { id: 'wc-003', warrantyId: 'rhw-002', customerId: 'c-102', customerName: 'Derek Owens', skuName: 'BFGoodrich KO3', milesAtClaim: 9800, treadDepthMm: 8.4, eventDescription: 'Debris impact caused tread separation', photoCount: 4, status: 'under_review', submittedAt: '2026-06-10T13:40:00Z', resolvedAt: null },
];

export const CLAIM_STATS: ClaimStats = {
  openClaims: 2,
  avgResolutionDays: 9.5,
  topClaimedSku: 'Michelin CrossClimate2',
  claimRateByTech: [
    { techName: 'Jake R.', rate: 3.2 },
    { techName: 'Sam T.', rate: 1.8 },
    { techName: 'Luis M.', rate: 2.4 },
  ],
};

// ── T6: Tire Positions ────────────────────────────────────────────────────────
export const TIRE_POSITIONS: TirePositionRecord[] = [
  { id: 'tp-001', visitId: 'v-1001', position: 'FL', skuId: 'sku-tz-245', skuName: 'Michelin CrossClimate2', dotCode: 'DOT M38V LJMR 1824', treadDepthMm: 9.8 },
  { id: 'tp-002', visitId: 'v-1001', position: 'FR', skuId: 'sku-tz-245', skuName: 'Michelin CrossClimate2', dotCode: 'DOT M38V LJMR 1924', treadDepthMm: 9.6 },
  { id: 'tp-003', visitId: 'v-1001', position: 'RL', skuId: 'sku-tz-245', skuName: 'Michelin CrossClimate2', dotCode: 'DOT M38V LJMR 2024', treadDepthMm: 6.2 },
  { id: 'tp-004', visitId: 'v-1001', position: 'RR', skuId: 'sku-tz-245', skuName: 'Michelin CrossClimate2', dotCode: 'DOT M38V LJMR 2124', treadDepthMm: 6.0 },
];

// ── T7: Take-offs ─────────────────────────────────────────────────────────────
export const TAKEOFF_RECORDS: TakeOffRecord[] = [
  { id: 'to-001', visitId: 'v-1001', position: 'RL', disposition: 'disposal', treadDepthMm: 2.1, conditionRating: 1, dotYear: '1820', disposalFeeCharged: 4.50 },
  { id: 'to-002', visitId: 'v-1001', position: 'RR', disposition: 'disposal', treadDepthMm: 1.9, conditionRating: 1, dotYear: '1820', disposalFeeCharged: 4.50 },
  { id: 'to-003', visitId: 'v-1002', position: 'FL', disposition: 'shop_resale', treadDepthMm: 5.4, conditionRating: 3, dotYear: '2221', suggestedResalePrice: 45.00 },
  { id: 'to-004', visitId: 'v-1002', position: 'FR', disposition: 'customer_retained', treadDepthMm: 5.2, conditionRating: 3, dotYear: '2221' },
  { id: 'to-005', visitId: 'v-1003', position: 'FL', disposition: 'shop_resale', treadDepthMm: 7.1, conditionRating: 4, dotYear: '2422', suggestedResalePrice: 75.00 },
  { id: 'to-006', visitId: 'v-1003', position: 'FR', disposition: 'shop_resale', treadDepthMm: 7.3, conditionRating: 4, dotYear: '2422', suggestedResalePrice: 75.00 },
];

// ── T8: Swap & Store ──────────────────────────────────────────────────────────
export const SWAP_STORE_ENTRIES: SwapStoreEntry[] = [
  {
    id: 'ss-001', customerId: 'c-107', customerName: 'Nina Patel', vehicleId: 'veh-201', vehicleLabel: '2022 BMW 3 Series', storageBay: 'B-04', storedAt: '2025-11-15', retrieveBy: '2026-04-15',
    tires: [
      { position: 'FL', skuId: 'sku-mic-sum', skuName: 'Michelin Pilot Sport 4 245/40R18', dotCode: 'DOT MX4T VJRP 2422', treadDepthMm: 8.2 },
      { position: 'FR', skuId: 'sku-mic-sum', skuName: 'Michelin Pilot Sport 4 245/40R18', dotCode: 'DOT MX4T VJRP 2522', treadDepthMm: 8.0 },
      { position: 'RL', skuId: 'sku-mic-sum', skuName: 'Michelin Pilot Sport 4 275/35R18', dotCode: 'DOT MX4T VJRP 2622', treadDepthMm: 7.8 },
      { position: 'RR', skuId: 'sku-mic-sum', skuName: 'Michelin Pilot Sport 4 275/35R18', dotCode: 'DOT MX4T VJRP 2722', treadDepthMm: 7.6 },
    ],
  },
  {
    id: 'ss-002', customerId: 'c-108', customerName: 'Greg Walsh', vehicleId: 'veh-202', vehicleLabel: '2020 Subaru Outback', storageBay: 'A-11', storedAt: '2025-11-20', retrieveBy: '2026-04-20',
    tires: [
      { position: 'FL', skuId: 'sku-blz-wtr', skuName: 'Blizzak WS90 225/60R17', dotCode: 'DOT BZ8V WKRP 3523', treadDepthMm: 10.0 },
      { position: 'FR', skuId: 'sku-blz-wtr', skuName: 'Blizzak WS90 225/60R17', dotCode: 'DOT BZ8V WKRP 3623', treadDepthMm: 10.0 },
      { position: 'RL', skuId: 'sku-blz-wtr', skuName: 'Blizzak WS90 225/60R17', dotCode: 'DOT BZ8V WKRP 3723', treadDepthMm: 9.8 },
      { position: 'RR', skuId: 'sku-blz-wtr', skuName: 'Blizzak WS90 225/60R17', dotCode: 'DOT BZ8V WKRP 3823', treadDepthMm: 9.8 },
    ],
  },
  {
    id: 'ss-003', customerId: 'c-109', customerName: 'Carla Nguyen', vehicleId: 'veh-203', vehicleLabel: '2024 Tesla Model 3', storageBay: 'C-02', storedAt: '2026-04-10', retrieveBy: '2026-11-10',
    tires: [
      { position: 'FL', skuId: 'sku-mic-as', skuName: 'Michelin CrossClimate2 235/45R18', dotCode: 'DOT MC8V WLRP 1025', treadDepthMm: 9.5 },
      { position: 'FR', skuId: 'sku-mic-as', skuName: 'Michelin CrossClimate2 235/45R18', dotCode: 'DOT MC8V WLRP 1125', treadDepthMm: 9.5 },
      { position: 'RL', skuId: 'sku-mic-as', skuName: 'Michelin CrossClimate2 235/45R18', dotCode: 'DOT MC8V WLRP 1225', treadDepthMm: 9.4 },
      { position: 'RR', skuId: 'sku-mic-as', skuName: 'Michelin CrossClimate2 235/45R18', dotCode: 'DOT MC8V WLRP 1325', treadDepthMm: 9.4 },
    ],
  },
];

// ── T11: Rebates ──────────────────────────────────────────────────────────────
export const REBATES: Rebate[] = [
  {
    id: 'reb-001', manufacturer: 'Michelin', name: 'Michelin Summer Savings', startDate: '2026-06-01', endDate: '2026-08-31',
    eligibleSkus: ['sku-tz-245', 'sku-mic-as', 'sku-mic-sum'], eligibleCategories: ['passenger', 'suv'],
    amount: 80, amountType: 'fixed', rebateType: 'mail_in', termsUrl: 'https://michelin.com/rebates', platformPublished: true, active: true, logoColor: '#005594',
  },
  {
    id: 'reb-002', manufacturer: 'Goodyear', name: 'Goodyear Memorial Day Event', startDate: '2026-05-20', endDate: '2026-06-20',
    eligibleSkus: ['sku-gyr-225'], eligibleCategories: ['all-season'],
    amount: 60, amountType: 'fixed', rebateType: 'instant', termsUrl: 'https://goodyear.com/rebates', platformPublished: true, active: true, logoColor: '#FFD700',
  },
  {
    id: 'reb-003', manufacturer: 'BFGoodrich', name: 'Truck & SUV Rebate Q2', startDate: '2026-04-01', endDate: '2026-06-30',
    eligibleSkus: ['sku-bfg-265'], eligibleCategories: ['truck', 'suv'],
    amount: 100, amountType: 'fixed', rebateType: 'mail_in', termsUrl: 'https://bfgoodrich.com/rebates', platformPublished: false, active: true, logoColor: '#E31E26',
  },
  {
    id: 'reb-004', manufacturer: 'Pirelli', name: 'Pirelli Spring Promo', startDate: '2026-03-01', endDate: '2026-05-31',
    eligibleSkus: ['sku-prl-205'], eligibleCategories: ['performance'],
    amount: 10, amountType: 'percent', rebateType: 'promo_code', termsUrl: 'https://pirelli.com/rebates', platformPublished: false, active: false, logoColor: '#FFCC00',
  },
];

export const REBATE_ATTRIBUTIONS: RebateAttribution[] = [
  { id: 'ra-001', rebateId: 'reb-001', rebateName: 'Michelin Summer Savings', orderId: 'ord-4201', customerName: 'Maria Santos', amount: 80, claimedAt: '2026-06-16T10:30:00Z' },
  { id: 'ra-002', rebateId: 'reb-002', rebateName: 'Goodyear Memorial Day Event', orderId: 'ord-4199', customerName: 'Alice Park', amount: 60, claimedAt: null },
  { id: 'ra-003', rebateId: 'reb-003', rebateName: 'Truck & SUV Rebate Q2', orderId: 'ord-4195', customerName: 'Derek Owens', amount: 100, claimedAt: '2026-06-14T15:20:00Z' },
  { id: 'ra-004', rebateId: 'reb-001', rebateName: 'Michelin Summer Savings', orderId: 'ord-4190', customerName: 'Lisa Brown', amount: 80, claimedAt: null },
];

// ── T10: Registration Reporting ───────────────────────────────────────────────
export const REGISTRATION_RATE_ROWS: RegistrationRateRow[] = [
  { dimension: 'Overall', total: 148, registered: 121, rate: 81.8, failureReasons: [{ reason: 'Invalid DOT', count: 4 }, { reason: 'No consent', count: 11 }, { reason: 'Network error', count: 2 }] },
  { dimension: 'Michelin', total: 52, registered: 48, rate: 92.3, failureReasons: [{ reason: 'Invalid DOT', count: 2 }, { reason: 'No consent', count: 2 }] },
  { dimension: 'BFGoodrich', total: 31, registered: 22, rate: 71.0, failureReasons: [{ reason: 'No consent', count: 7 }, { reason: 'Invalid DOT', count: 2 }] },
  { dimension: 'Goodyear', total: 38, registered: 34, rate: 89.5, failureReasons: [{ reason: 'No consent', count: 2 }, { reason: 'Network error', count: 2 }] },
  { dimension: 'Pirelli', total: 27, registered: 17, rate: 63.0, failureReasons: [{ reason: 'No consent', count: 8 }, { reason: 'Invalid DOT', count: 2 }] },
];

export const TECH_REGISTRATION_RATES = [
  { techName: 'Jake R.', rate: 89.2 },
  { techName: 'Sam T.', rate: 76.4 },
  { techName: 'Luis M.', rate: 84.0 },
  { techName: 'Priya K.', rate: 91.5 },
];
