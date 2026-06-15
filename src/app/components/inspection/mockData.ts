import type { InspectionTemplate, InspectionRecord, TechnicianStats, TemplatePerformance } from './types';

export const MOCK_TEMPLATES: InspectionTemplate[] = [
  {
    id: 'tmpl_001', shopId: 'shop_001', name: 'Full Vehicle Multi-Point Inspection',
    serviceType: 'Full Inspection', version: 3, isDefault: true,
    categories: ['Exterior', 'Tires & Wheels', 'Engine Bay', 'Brakes', 'Fluids'],
    items: [
      { id: 'i01', key: 'headlights', name: 'Headlights & Fog Lights', category: 'Exterior', description: 'Check all headlights, high beams, and fog lights.', instructions: 'Test DRL, low, high, and fog modes. Check lens clarity for oxidation.', photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Lens restoration or bulb replacement recommended', critical: 'Immediate bulb/assembly replacement required — safety hazard' }, priceCents: 3999 },
      { id: 'i02', key: 'wipers', name: 'Wiper Blades & Washer System', category: 'Exterior', description: 'Check wiper blade condition and washer fluid operation.', instructions: 'Run all wiper speeds. Check for streaking, chattering, or missing sections.', photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Wiper blade replacement recommended', critical: 'Wipers failing — visibility hazard' }, priceCents: 2499 },
      { id: 'i03', key: 'glass', name: 'Windshield & Glass', category: 'Exterior', description: 'Check windshield for chips, cracks, or damage.', instructions: 'Note any chips in driver line-of-sight. Measure crack length.', photoRequirement: 'required', minPhotos: 1, allowVoiceNote: true, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Minor chip — resin repair recommended', critical: 'Crack in driver sight line — immediate replacement required' }, priceCents: 8900 },
      { id: 'i04', key: 'tread_depth', name: 'Tread Depth — All Four Tires', category: 'Tires & Wheels', description: 'Measure tread depth at all four positions. Flag uneven wear.', instructions: 'Use depth gauge at inner, center, and outer channels. Photo all four. Flag below 4/32".', photoRequirement: 'required', minPhotos: 4, allowVoiceNote: true, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Tread below 4/32" — replacement within 6 months', critical: 'Tread below 2/32" — immediate replacement required' }, priceCents: 0 },
      { id: 'i05', key: 'sidewall', name: 'Sidewall & Tire Condition', category: 'Tires & Wheels', description: 'Inspect sidewalls for bulges, cuts, or embedded objects.', instructions: 'Check all four sidewalls. Look for sidewall bulging that indicates belt separation.', photoRequirement: 'required', minPhotos: 1, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Sidewall anomaly — monitor closely', critical: 'Sidewall damage — immediate replacement required' }, priceCents: 0 },
      { id: 'i06', key: 'wheel_condition', name: 'Wheel & Rim Condition', category: 'Tires & Wheels', description: 'Check wheels for bends, cracks, or corrosion.', instructions: 'Inspect each wheel for structural damage. Note cosmetic vs structural issues.', photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Minor rim damage — monitor for air loss', critical: 'Rim damage compromises seal — replacement required' }, priceCents: 0 },
      { id: 'i07', key: 'air_filter', name: 'Engine Air Filter', category: 'Engine Bay', description: 'Remove and inspect engine air filter for restriction.', instructions: 'Remove filter, hold to light. Replace if 50%+ blocked or oil-contaminated.', photoRequirement: 'required', minPhotos: 1, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Moderately restricted — replacement within 3 months', critical: 'Severely restricted — replace immediately' }, priceCents: 3499 },
      { id: 'i08', key: 'belts_hoses', name: 'Belts & Hoses', category: 'Engine Bay', description: 'Inspect serpentine belt and coolant hoses for wear.', instructions: 'Check belt for cracks, fraying, glazing. Squeeze hoses for hardness or sponginess.', photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: true, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Minor wear — plan replacement at next service', critical: 'Imminent failure risk — immediate replacement required' }, priceCents: 12999 },
      { id: 'i09', key: 'battery', name: 'Battery & Charging System', category: 'Engine Bay', description: 'Test battery CCA output and charging voltage.', instructions: 'Use battery tester. Record CCA vs rated spec. Check terminal condition and corrosion.', photoRequirement: 'optional', minPhotos: 1, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Battery below 80% CCA — replacement within 90 days', critical: 'Battery failing — immediate replacement to prevent no-start' }, priceCents: 18999 },
      { id: 'i10', key: 'brake_pads_front', name: 'Front Brake Pads', category: 'Brakes', description: 'Visually inspect front brake pad thickness.', instructions: 'Estimate pad thickness through wheel spokes. Flag at <4mm (attention) or <2mm (critical).', photoRequirement: 'required', minPhotos: 2, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Pads at 4mm — plan replacement within 2 months', critical: 'Pads at or below 2mm — immediate replacement required' }, priceCents: 18999 },
      { id: 'i11', key: 'brake_pads_rear', name: 'Rear Brake Pads', category: 'Brakes', description: 'Visually inspect rear brake pad thickness.', instructions: 'Estimate rear pad thickness. Same thresholds as front.', photoRequirement: 'required', minPhotos: 2, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Rear pads at 4mm — plan replacement within 2 months', critical: 'Rear pads at or below 2mm — immediate replacement' }, priceCents: 17499 },
      { id: 'i12', key: 'brake_fluid', name: 'Brake Fluid Level & Condition', category: 'Brakes', description: 'Check fluid level and moisture content.', instructions: 'Check reservoir level. Use test strip for moisture. Replace if >3% moisture or 2+ years old.', photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Fluid aged or approaching moisture threshold', critical: 'Fluid contaminated — replacement required' }, priceCents: 8999 },
      { id: 'i13', key: 'engine_oil', name: 'Engine Oil Level & Condition', category: 'Fluids', description: 'Check dipstick oil level and note color.', instructions: 'Read level on dipstick. Note color: clear gold=good, dark brown=due soon, black=overdue.', photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Oil low or discolored — top up or early change', critical: 'Oil critically low — immediate attention required' }, priceCents: 5999 },
      { id: 'i14', key: 'coolant', name: 'Coolant Level & Freeze Point', category: 'Fluids', description: 'Check coolant level and protection range.', instructions: 'Check reservoir against min/max marks. Use refractometer for freeze point.', photoRequirement: 'none', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Coolant diluted — top up or exchange recommended', critical: 'Coolant critically low or inadequate freeze protection' }, priceCents: 0 },
    ],
    createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-04-10T09:00:00Z',
  },
  {
    id: 'tmpl_002', shopId: 'shop_001', name: 'Tire Service Pre-Install Check',
    serviceType: 'Tire Service', version: 2, isDefault: true,
    categories: ['Tires', 'Wheels & Hardware', 'TPMS'],
    items: [
      { id: 't01', key: 'existing_tread', name: 'Existing Tire Tread Depth', category: 'Tires', description: 'Document existing tread before removal.', instructions: 'Measure and record all four tires before dismounting. Note uneven wear.', photoRequirement: 'required', minPhotos: 4, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Remaining tires below 4/32" — monitor', critical: 'Remaining tires below 2/32" — advise replacement of all four' }, priceCents: 0 },
      { id: 't02', key: 'rim_condition', name: 'Rim / Wheel Condition', category: 'Wheels & Hardware', description: 'Inspect each rim before mounting.', instructions: 'Check for bends, cracks, corrosion, or bead seat damage. Photo any concerns.', photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: true, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Minor cosmetic damage — no immediate action', critical: 'Rim damage preventing proper tire seating — replacement required before mounting' }, priceCents: 0 },
      { id: 't03', key: 'valve_stems', name: 'Valve Stems', category: 'Wheels & Hardware', description: 'Inspect valve stem condition.', instructions: 'Flex each stem. Replace rubber stems if aged, cracked, or during tire replacement.', photoRequirement: 'none', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Stems aged — replace at next service', critical: 'Stems cracked — replace immediately' }, priceCents: 1200 },
      { id: 't04', key: 'tpms', name: 'TPMS Sensors', category: 'TPMS', description: 'Verify TPMS sensor function.', instructions: 'Check TPMS warning light. Note battery life if readable. Replace if <2 years remain.', photoRequirement: 'none', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'TPMS sensor battery low — plan replacement', critical: 'Sensor not reading — replacement required' }, priceCents: 5999 },
    ],
    createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'tmpl_003', shopId: 'shop_001', name: 'Oil Change Courtesy Inspection',
    serviceType: 'Oil Change', version: 1, isDefault: true,
    categories: ['Engine & Fluids', 'Filters', 'Visual Safety'],
    items: [
      { id: 'o01', key: 'oil_condition', name: 'Engine Oil Condition', category: 'Engine & Fluids', description: 'Check oil color and consistency on dipstick.', instructions: 'Wipe clean, re-dip, and evaluate color and consistency.', photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Oil discolored — note for customer', critical: 'Sludge or metal particles — escalate immediately' }, priceCents: 0 },
      { id: 'o02', key: 'air_filter_oc', name: 'Engine Air Filter', category: 'Filters', description: 'Quick check of air filter condition.', instructions: 'Hold filter to light — note % restriction.', photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Filter approaching end of life', critical: 'Filter severely restricted — replace now' }, priceCents: 3499 },
      { id: 'o03', key: 'cabin_filter', name: 'Cabin Air Filter', category: 'Filters', description: 'Check cabin air filter if accessible.', instructions: 'Remove and inspect. Typically located behind glove box.', photoRequirement: 'optional', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Cabin filter dusty — replacement within 2 services', critical: 'Cabin filter blocked — replace now for HVAC performance' }, priceCents: 2999 },
      { id: 'o04', key: 'tires_visual', name: 'Tires — Visual Only', category: 'Visual Safety', description: 'Quick visual tread and sidewall check.', instructions: 'Walk-around visual only. Flag obvious low tread or sidewall damage.', photoRequirement: 'none', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'Tires appear worn — recommend full inspection at next visit', critical: 'Visible tread issue — recommend immediate full inspection' }, priceCents: 0 },
      { id: 'o05', key: 'fluid_levels', name: 'Fluid Levels Check', category: 'Visual Safety', description: 'Visually check accessible fluid levels.', instructions: 'Check coolant reservoir, brake fluid, washer fluid, and power steering (if applicable).', photoRequirement: 'none', minPhotos: 0, allowVoiceNote: false, statusOptions: ['good', 'attention', 'critical', 'na'], recommendedActions: { attention: 'One or more fluids low — top up recommended', critical: 'Critical fluid low — immediate attention required' }, priceCents: 0 },
    ],
    createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
  },
];

// Completed inspection for customer report demo
export const MOCK_COMPLETED_INSPECTION: InspectionRecord = {
  id: 'insp_001', shopId: 'shop_001', visitId: 'visit_001',
  templateId: 'tmpl_001', templateName: 'Full Vehicle Multi-Point Inspection',
  technicianId: 'tech_001', technicianName: 'Marcus Webb',
  customerName: 'James Turner', customerEmail: 'james@email.com', customerPhone: '(555) 201-4891',
  vehicle: '2021 Toyota Camry SE', licensePlate: '7TDX291',
  status: 'completed', startedAt: '2026-06-15T13:30:00Z', completedAt: '2026-06-15T14:12:00Z',
  token: 'tok_a1b2c3d4e5f6',
  items: [
    { id: 'ri01', templateItemId: 'i01', itemName: 'Headlights & Fog Lights', category: 'Exterior', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'All lights operating normally. Lens clarity good.', isAdHoc: false },
    { id: 'ri02', templateItemId: 'i02', itemName: 'Wiper Blades & Washer System', category: 'Exterior', status: 'attention', photoCount: 1, hasVoiceNote: false, observations: 'Driver wiper chattering at low speeds. Washer fluid and jets OK.', isAdHoc: false,
      recommendation: { id: 'rec_01', itemName: 'Wiper Blades', description: 'Replace both front wiper blades — driver blade chattering indicates end of useful life.', priceCents: 2499 } },
    { id: 'ri03', templateItemId: 'i03', itemName: 'Windshield & Glass', category: 'Exterior', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'Windshield clear, no chips or cracks observed.', isAdHoc: false },
    { id: 'ri04', templateItemId: 'i04', itemName: 'Tread Depth — All Four Tires', category: 'Tires & Wheels', status: 'attention', photoCount: 4, hasVoiceNote: true, transcript: 'Front left showing 4/32, front right 4/32, rear left 5/32, rear right 5/32. Slight irregular wear on fronts — rotation recommended.', observations: 'FL/FR at 4/32". Uneven wear pattern on fronts. Rear tires in better condition at 5/32".', isAdHoc: false,
      recommendation: { id: 'rec_02', itemName: 'Tire Rotation', description: 'Rotate all four tires to even out wear pattern and extend tire life. Front tires approaching replacement threshold.', priceCents: 3999 } },
    { id: 'ri05', templateItemId: 'i05', itemName: 'Sidewall & Tire Condition', category: 'Tires & Wheels', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'All four sidewalls in good condition. No bulges, cuts, or embedded objects.', isAdHoc: false },
    { id: 'ri06', templateItemId: 'i06', itemName: 'Wheel & Rim Condition', category: 'Tires & Wheels', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'Minor cosmetic scuffs on front left rim — no structural concern. All rims holding air correctly.', isAdHoc: false },
    { id: 'ri07', templateItemId: 'i07', itemName: 'Engine Air Filter', category: 'Engine Bay', status: 'critical', photoCount: 1, hasVoiceNote: false, observations: 'Filter severely restricted — 80%+ blocked. Heavy dust and debris accumulation. Vehicle performance and fuel economy will be impacted.', isAdHoc: false,
      recommendation: { id: 'rec_03', itemName: 'Engine Air Filter', description: 'Replace engine air filter immediately. Filter is severely restricted at 80%+, impacting engine performance and fuel economy. Filter shown in photo.', priceCents: 3499 } },
    { id: 'ri08', templateItemId: 'i08', itemName: 'Belts & Hoses', category: 'Engine Bay', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'Serpentine belt in good condition. No cracking or glazing. Coolant hoses firm, no soft spots.', isAdHoc: false },
    { id: 'ri09', templateItemId: 'i09', itemName: 'Battery & Charging System', category: 'Engine Bay', status: 'attention', photoCount: 1, hasVoiceNote: false, observations: 'Battery tested at 68% CCA of rated capacity. Terminals clean. Alternator output 14.2V — normal.', isAdHoc: false,
      recommendation: { id: 'rec_04', itemName: 'Battery Replacement', description: 'Battery tested at 68% of rated CCA capacity. Battery is weakening and may fail unexpectedly, especially in cold weather. Replacement recommended within 60 days.', priceCents: 18999 } },
    { id: 'ri10', templateItemId: 'i10', itemName: 'Front Brake Pads', category: 'Brakes', status: 'critical', photoCount: 2, hasVoiceNote: false, observations: 'Front pads measured at approximately 2mm — at minimum safe thickness. Rotor surface shows light grooving.', isAdHoc: false,
      recommendation: { id: 'rec_05', itemName: 'Front Brake Pads', description: 'Front brake pads measured at 2mm — at legal minimum. Replacement is required immediately. Rotors show minor grooving and will be resurfaced during replacement. Photos included.', priceCents: 24999 } },
    { id: 'ri11', templateItemId: 'i11', itemName: 'Rear Brake Pads', category: 'Brakes', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'Rear pads at 6mm — good life remaining.', isAdHoc: false },
    { id: 'ri12', templateItemId: 'i12', itemName: 'Brake Fluid Level & Condition', category: 'Brakes', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'Brake fluid level full. Moisture test: 1.2% — within acceptable range.', isAdHoc: false },
    { id: 'ri13', templateItemId: 'i13', itemName: 'Engine Oil Level & Condition', category: 'Fluids', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'Oil at full mark. Color is light golden brown — oil is fresh (just serviced 1,800 miles ago).', isAdHoc: false },
    { id: 'ri14', templateItemId: 'i14', itemName: 'Coolant Level & Freeze Point', category: 'Fluids', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'Coolant at max mark. Refractometer shows -34°F freeze protection — within spec.', isAdHoc: false },
  ],
};

// In-progress inspection for tech PWA demo
export const MOCK_INPROGRESS_INSPECTION: InspectionRecord = {
  id: 'insp_002', shopId: 'shop_001', visitId: 'visit_002',
  templateId: 'tmpl_001', templateName: 'Full Vehicle Multi-Point Inspection',
  technicianId: 'tech_002', technicianName: 'Jordan Davis',
  customerName: 'Sarah Chen', customerEmail: 'schen@gmail.com', customerPhone: '(555) 318-7722',
  vehicle: '2020 Honda Accord EX', licensePlate: '4KWP834',
  status: 'in_progress', startedAt: '2026-06-15T14:30:00Z',
  token: 'tok_b2c3d4e5f6a1',
  items: [
    { id: 'si01', templateItemId: 'i01', itemName: 'Headlights & Fog Lights', category: 'Exterior', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'All lights operational.', isAdHoc: false },
    { id: 'si02', templateItemId: 'i02', itemName: 'Wiper Blades & Washer System', category: 'Exterior', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'Wipers clean and streak-free.', isAdHoc: false },
    { id: 'si03', templateItemId: 'i03', itemName: 'Windshield & Glass', category: 'Exterior', status: 'attention', photoCount: 1, hasVoiceNote: true, transcript: 'Small chip on the passenger side of the windshield, about two inches from the top edge. Not in the driver sight line but recommend repair before it grows.', observations: 'Small chip on passenger side, not in line-of-sight.', isAdHoc: false,
      recommendation: { id: 'srec_01', itemName: 'Windshield Chip Repair', description: 'Small chip on passenger side. Resin fill recommended to prevent crack propagation.', priceCents: 8900 } },
    { id: 'si04', templateItemId: 'i04', itemName: 'Tread Depth — All Four Tires', category: 'Tires & Wheels', status: 'good', photoCount: 4, hasVoiceNote: false, observations: 'All tires 7/32" to 8/32" — excellent condition.', isAdHoc: false },
    { id: 'si05', templateItemId: 'i05', itemName: 'Sidewall & Tire Condition', category: 'Tires & Wheels', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'All sidewalls clean and undamaged.', isAdHoc: false },
    { id: 'si06', templateItemId: 'i06', itemName: 'Wheel & Rim Condition', category: 'Tires & Wheels', status: 'good', photoCount: 0, hasVoiceNote: false, observations: 'All rims in good condition.', isAdHoc: false },
    // Current item (index 6, 7th item) — pending
    { id: 'si07', templateItemId: 'i07', itemName: 'Engine Air Filter', category: 'Engine Bay', status: 'pending', photoCount: 0, hasVoiceNote: false, observations: '', isAdHoc: false },
    // Remaining items — pending
    { id: 'si08', templateItemId: 'i08', itemName: 'Belts & Hoses', category: 'Engine Bay', status: 'pending', photoCount: 0, hasVoiceNote: false, observations: '', isAdHoc: false },
    { id: 'si09', templateItemId: 'i09', itemName: 'Battery & Charging System', category: 'Engine Bay', status: 'pending', photoCount: 0, hasVoiceNote: false, observations: '', isAdHoc: false },
    { id: 'si10', templateItemId: 'i10', itemName: 'Front Brake Pads', category: 'Brakes', status: 'pending', photoCount: 0, hasVoiceNote: false, observations: '', isAdHoc: false },
    { id: 'si11', templateItemId: 'i11', itemName: 'Rear Brake Pads', category: 'Brakes', status: 'pending', photoCount: 0, hasVoiceNote: false, observations: '', isAdHoc: false },
    { id: 'si12', templateItemId: 'i12', itemName: 'Brake Fluid Level & Condition', category: 'Brakes', status: 'pending', photoCount: 0, hasVoiceNote: false, observations: '', isAdHoc: false },
    { id: 'si13', templateItemId: 'i13', itemName: 'Engine Oil Level & Condition', category: 'Fluids', status: 'pending', photoCount: 0, hasVoiceNote: false, observations: '', isAdHoc: false },
    { id: 'si14', templateItemId: 'i14', itemName: 'Coolant Level & Freeze Point', category: 'Fluids', status: 'pending', photoCount: 0, hasVoiceNote: false, observations: '', isAdHoc: false },
  ],
};

export const MOCK_TECHNICIAN_STATS: TechnicianStats[] = [
  { technicianId: 'tech_001', technicianName: 'Marcus Webb',   inspectionsCount: 47, avgTimeMinutes: 28, avgRecommendationCount: 3.2, attachRate: 68, revenueCents: 1245000 },
  { technicianId: 'tech_002', technicianName: 'Jordan Davis',  inspectionsCount: 38, avgTimeMinutes: 35, avgRecommendationCount: 2.8, attachRate: 54, revenueCents: 820000  },
  { technicianId: 'tech_003', technicianName: 'Carlos Mendez', inspectionsCount: 29, avgTimeMinutes: 31, avgRecommendationCount: 3.8, attachRate: 72, revenueCents: 1010000 },
];

export const MOCK_TEMPLATE_PERF: TemplatePerformance[] = [
  { templateId: 'tmpl_001', templateName: 'Full Vehicle Multi-Point', usageCount: 62, avgAttachRate: 68, topCriticalItem: 'Front Brake Pads', avgRevenueCents: 24700 },
  { templateId: 'tmpl_002', templateName: 'Tire Service Pre-Install',  usageCount: 41, avgAttachRate: 48, topCriticalItem: 'Tread Depth',       avgRevenueCents: 8400  },
  { templateId: 'tmpl_003', templateName: 'Oil Change Courtesy',       usageCount: 28, avgAttachRate: 38, topCriticalItem: 'Engine Air Filter',  avgRevenueCents: 5100  },
];
