import type {
  FleetAccount, PricingTier, PricingMenu, FleetInvoice,
  FleetSession, ReorderList, ApprovalRequest,
} from './types';

export const MOCK_PRICING_TIERS: PricingTier[] = [
  { id: 'tier_1', shopId: 'shop_001', name: 'Tier 1 — Preferred', discountType: 'percentage', discountValue: 5, description: '5% off retail across all products and services' },
  { id: 'tier_2', shopId: 'shop_001', name: 'Tier 2 — Premium', discountType: 'percentage', discountValue: 10, description: '10% off retail — high-volume fleet accounts' },
  { id: 'tier_3', shopId: 'shop_001', name: 'Tier 3 — Enterprise', discountType: 'percentage', discountValue: 15, description: '15% off retail — strategic enterprise partners' },
];

export const MOCK_PRICING_MENUS: PricingMenu[] = [
  {
    id: 'menu_001',
    fleetAccountId: 'fleet_001',
    name: 'Acme 2026 Annual Pricing Agreement',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    lines: [
      { id: 'l1', type: 'product', sku: 'ATD-235-65-17', description: 'Michelin Defender T+H 235/65R17', retailPrice: 149.99, agreedPrice: 129.99, unit: 'each' },
      { id: 'l2', type: 'product', sku: 'ATD-225-65-17', description: 'Goodyear Assurance 225/65R17', retailPrice: 129.99, agreedPrice: 109.99, unit: 'each' },
      { id: 'l3', type: 'service', description: 'Mount & Balance (per tire)', retailPrice: 25.00, agreedPrice: 18.00, unit: 'each' },
      { id: 'l4', type: 'service', description: 'Oil Change — Synthetic 5W-30', retailPrice: 89.99, agreedPrice: 72.00, unit: 'each' },
      { id: 'l5', type: 'labor', description: 'Shop Labor Rate', retailPrice: 125.00, agreedPrice: 105.00, unit: 'per hour' },
      { id: 'l6', type: 'product', sku: 'BAL-WGT-OZ', description: 'Wheel Balance Weights', retailPrice: 3.50, agreedPrice: 2.50, unit: 'oz' },
    ],
    volumeTiers: [
      { minQty: 1, maxQty: 9, discountPct: 0, label: 'Standard (1–9 units)' },
      { minQty: 10, maxQty: 49, discountPct: 5, label: 'Volume (10–49 units): 5% off agreed' },
      { minQty: 50, maxQty: null, discountPct: 12, label: 'Fleet (50+ units): 12% off agreed' },
    ],
  },
];

export const MOCK_FLEET_ACCOUNTS: FleetAccount[] = [
  {
    id: 'fleet_001',
    shopId: 'shop_001',
    businessName: 'Acme Delivery Co.',
    ein: '12-3456789',
    status: 'active',
    billingContact: { name: 'James Turner', email: 'james.turner@acme.com', phone: '(555) 201-0001', title: 'Fleet Director' },
    apContact: { name: 'Linda Park', email: 'ap@acme.com', phone: '(555) 201-0002', title: 'AP Manager' },
    billingAddress: { line1: '1200 Commerce Blvd', city: 'Charlotte', state: 'NC', zip: '28202' },
    shippingAddress: { line1: '1200 Commerce Blvd', city: 'Charlotte', state: 'NC', zip: '28202' },
    paymentTerms: 'net_30',
    creditLimitCents: 2500000,
    outstandingBalanceCents: 847500,
    pricingTierId: 'tier_2',
    pricingMenuId: 'menu_001',
    approvalThresholdCents: 100000,
    approvalRouting: 'any_one',
    approverEmails: ['james.turner@acme.com'],
    createdAt: '2024-06-15T09:00:00Z',
    lastActivityAt: '2026-06-14T14:30:00Z',
    aging: { current: 312500, '1_30': 285000, '31_60': 165000, '61_90': 85000, '90_plus': 0 },
    authorizedBuyers: [
      { id: 'buyer_001', fleetAccountId: 'fleet_001', name: 'James Turner', email: 'james.turner@acme.com', phone: '(555) 201-0001', role: 'fleet_manager', spendLimitPerTransaction: null, spendLimitPerPeriod: null, vehicleScope: 'all', active: true },
      { id: 'buyer_002', fleetAccountId: 'fleet_001', name: 'Carlos Mendez', email: 'c.mendez@acme.com', phone: '(555) 201-0033', role: 'authorized_buyer', spendLimitPerTransaction: 75000, spendLimitPerPeriod: 300000, vehicleScope: 'all', active: true },
      { id: 'buyer_003', fleetAccountId: 'fleet_001', name: 'Rita Osei', email: 'r.osei@acme.com', phone: '(555) 201-0044', role: 'authorized_buyer', spendLimitPerTransaction: 25000, spendLimitPerPeriod: 100000, vehicleScope: ['veh_001', 'veh_002', 'veh_003'], active: true },
    ],
    vehicles: [
      { id: 'veh_001', fleetAccountId: 'fleet_001', year: 2022, make: 'Ford', model: 'Transit', trim: 'Cargo 350', vin: '1FTBW2CM4NKA00001', plate: 'ACM-001', plateState: 'NC', lastServiceDate: '2026-04-10', mileage: 48200 },
      { id: 'veh_002', fleetAccountId: 'fleet_001', year: 2022, make: 'Ford', model: 'Transit', trim: 'Cargo 350', vin: '1FTBW2CM4NKA00002', plate: 'ACM-002', plateState: 'NC', lastServiceDate: '2026-03-22', mileage: 52100 },
      { id: 'veh_003', fleetAccountId: 'fleet_001', year: 2021, make: 'Ram', model: 'ProMaster', trim: '2500 High Roof', vin: '3C6TRVDG7ME500001', plate: 'ACM-003', plateState: 'NC', lastServiceDate: '2026-05-01', mileage: 61400 },
      { id: 'veh_004', fleetAccountId: 'fleet_001', year: 2023, make: 'Ford', model: 'Transit', trim: 'Cargo 250', vin: '1FTBW2CM5NKA00004', plate: 'ACM-004', plateState: 'NC', lastServiceDate: '2026-06-01', mileage: 22800 },
      { id: 'veh_005', fleetAccountId: 'fleet_001', year: 2021, make: 'Chevrolet', model: 'Express', trim: '2500 Cargo', vin: '1GCWGBFPXM1100001', plate: 'ACM-005', plateState: 'NC', mileage: 78900 },
    ],
  },
  {
    id: 'fleet_002',
    shopId: 'shop_001',
    businessName: 'Metro Taxi & Rideshare LLC',
    ein: '98-7654321',
    status: 'active',
    billingContact: { name: 'Sarah Okonkwo', email: 'sarah@metrotaxi.com', phone: '(555) 302-1100', title: 'Operations Manager' },
    apContact: { name: 'Sarah Okonkwo', email: 'ap@metrotaxi.com', phone: '(555) 302-1100' },
    billingAddress: { line1: '400 Transit Ave', city: 'Charlotte', state: 'NC', zip: '28205' },
    shippingAddress: { line1: '400 Transit Ave', city: 'Charlotte', state: 'NC', zip: '28205' },
    paymentTerms: 'net_15',
    creditLimitCents: 1000000,
    outstandingBalanceCents: 224800,
    pricingTierId: 'tier_1',
    approvalThresholdCents: 50000,
    approvalRouting: 'sequential',
    approverEmails: ['sarah@metrotaxi.com', 'owner@metrotaxi.com'],
    createdAt: '2025-02-10T11:00:00Z',
    lastActivityAt: '2026-06-15T09:00:00Z',
    aging: { current: 224800, '1_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 },
    authorizedBuyers: [
      { id: 'buyer_010', fleetAccountId: 'fleet_002', name: 'Sarah Okonkwo', email: 'sarah@metrotaxi.com', phone: '(555) 302-1100', role: 'fleet_manager', spendLimitPerTransaction: null, spendLimitPerPeriod: null, vehicleScope: 'all', active: true },
    ],
    vehicles: [
      { id: 'veh_010', fleetAccountId: 'fleet_002', year: 2023, make: 'Toyota', model: 'Camry', trim: 'LE', vin: '4T1C11AK5PU000001', plate: 'MTX-001', plateState: 'NC', lastServiceDate: '2026-05-20', mileage: 89200 },
      { id: 'veh_011', fleetAccountId: 'fleet_002', year: 2023, make: 'Toyota', model: 'Camry', trim: 'LE', vin: '4T1C11AK5PU000002', plate: 'MTX-002', plateState: 'NC', lastServiceDate: '2026-05-12', mileage: 94100 },
      { id: 'veh_012', fleetAccountId: 'fleet_002', year: 2022, make: 'Honda', model: 'Accord', trim: 'Sport', vin: '1HGCV1F30NA000001', plate: 'MTX-003', plateState: 'NC', lastServiceDate: '2026-04-28', mileage: 102400 },
    ],
  },
  {
    id: 'fleet_003',
    shopId: 'shop_001',
    businessName: 'Pinnacle Construction Group',
    ein: '55-9988776',
    status: 'suspended',
    billingContact: { name: 'Dave Howell', email: 'dave@pinnaclecg.com', phone: '(555) 403-9900', title: 'Procurement Lead' },
    apContact: { name: 'Finance Dept', email: 'finance@pinnaclecg.com', phone: '(555) 403-9901' },
    billingAddress: { line1: '8800 Industrial Pkwy', city: 'Concord', state: 'NC', zip: '28025' },
    shippingAddress: { line1: '8800 Industrial Pkwy', city: 'Concord', state: 'NC', zip: '28025' },
    paymentTerms: 'net_60',
    creditLimitCents: 500000,
    outstandingBalanceCents: 498200,
    pricingTierId: 'tier_1',
    approvalThresholdCents: null,
    approvalRouting: 'any_one',
    approverEmails: ['dave@pinnaclecg.com'],
    createdAt: '2024-09-01T10:00:00Z',
    lastActivityAt: '2025-12-10T15:00:00Z',
    aging: { current: 0, '1_30': 0, '31_60': 0, '61_90': 148200, '90_plus': 350000 },
    authorizedBuyers: [
      { id: 'buyer_020', fleetAccountId: 'fleet_003', name: 'Dave Howell', email: 'dave@pinnaclecg.com', phone: '(555) 403-9900', role: 'fleet_manager', spendLimitPerTransaction: null, spendLimitPerPeriod: null, vehicleScope: 'all', active: true },
    ],
    vehicles: [
      { id: 'veh_020', fleetAccountId: 'fleet_003', year: 2020, make: 'Ram', model: '2500', trim: 'Tradesman', vin: '3C6UR5CL3LG100001', plate: 'PCG-001', plateState: 'NC', mileage: 143000 },
      { id: 'veh_021', fleetAccountId: 'fleet_003', year: 2019, make: 'Ford', model: 'F-250', trim: 'XL', vin: '1FT7W2B62KEE00001', plate: 'PCG-002', plateState: 'NC', mileage: 167000 },
    ],
  },
];

export const MOCK_FLEET_INVOICES: FleetInvoice[] = [
  {
    id: 'inv_001', fleetAccountId: 'fleet_001', shopId: 'shop_001',
    invoiceNumber: 'INV-2026-0541', poNumber: 'PO-ACM-2026-0082',
    status: 'open', issuedDate: '2026-06-01', dueDate: '2026-07-01',
    lines: [
      { vehicleId: 'veh_001', vehicleLabel: '2022 Ford Transit ACM-001', description: 'Michelin Defender T+H 235/65R17 ×4', qty: 4, unitPrice: 12999, total: 51996, sku: 'ATD-235-65-17' },
      { vehicleId: 'veh_001', vehicleLabel: '2022 Ford Transit ACM-001', description: 'Mount & Balance', qty: 4, unitPrice: 1800, total: 7200 },
      { vehicleId: 'veh_002', vehicleLabel: '2022 Ford Transit ACM-002', description: 'Oil Change — Synthetic 5W-30', qty: 1, unitPrice: 7200, total: 7200 },
      { vehicleId: 'veh_003', vehicleLabel: '2021 Ram ProMaster ACM-003', description: 'Goodyear Assurance 225/65R17 ×4', qty: 4, unitPrice: 10999, total: 43996, sku: 'ATD-225-65-17' },
      { vehicleId: 'veh_003', vehicleLabel: '2021 Ram ProMaster ACM-003', description: 'Mount & Balance', qty: 4, unitPrice: 1800, total: 7200 },
    ],
    subtotalCents: 117592, taxCents: 9407, totalCents: 126999, paidCents: 0,
    sessionId: 'ses_001',
  },
  {
    id: 'inv_002', fleetAccountId: 'fleet_001', shopId: 'shop_001',
    invoiceNumber: 'INV-2026-0489', poNumber: 'PO-ACM-2026-0071',
    status: 'paid', issuedDate: '2026-05-01', dueDate: '2026-05-31',
    lines: [
      { vehicleId: 'veh_004', vehicleLabel: '2023 Ford Transit ACM-004', description: 'Oil Change — Synthetic 5W-30', qty: 1, unitPrice: 7200, total: 7200 },
      { vehicleId: 'veh_005', vehicleLabel: '2021 Chevy Express ACM-005', description: 'Shop Labor — Brake Inspection', qty: 2, unitPrice: 10500, total: 21000 },
    ],
    subtotalCents: 28200, taxCents: 2256, totalCents: 30456, paidCents: 30456,
  },
  {
    id: 'inv_003', fleetAccountId: 'fleet_001', shopId: 'shop_001',
    invoiceNumber: 'INV-2026-0422', poNumber: 'PO-ACM-2026-0058',
    status: 'overdue', issuedDate: '2026-04-01', dueDate: '2026-05-01',
    lines: [
      { vehicleId: 'veh_002', vehicleLabel: '2022 Ford Transit ACM-002', description: 'Goodyear Assurance 225/65R17 ×4', qty: 4, unitPrice: 10999, total: 43996 },
      { vehicleId: 'veh_002', vehicleLabel: '2022 Ford Transit ACM-002', description: 'Mount & Balance', qty: 4, unitPrice: 1800, total: 7200 },
    ],
    subtotalCents: 51196, taxCents: 4096, totalCents: 55292, paidCents: 0,
  },
];

export const MOCK_FLEET_SESSIONS: FleetSession[] = [
  {
    id: 'ses_001', shopId: 'shop_001', fleetAccountId: 'fleet_001',
    fleetAccountName: 'Acme Delivery Co.',
    technicianName: 'Marcus Webb', locationName: 'Main Bay',
    scheduledStart: '2026-06-15T08:00:00Z', scheduledEnd: '2026-06-15T12:00:00Z',
    status: 'in_progress',
    vehicleWork: [
      {
        vehicleId: 'veh_001', vehicleLabel: '2022 Ford Transit · ACM-001',
        services: [
          { description: 'Mount & Balance', qty: 4, unitPrice: 1800 },
        ],
        parts: [
          { sku: 'ATD-235-65-17', description: 'Michelin Defender T+H 235/65R17', qty: 4, unitPrice: 12999 },
        ],
        findings: 'Left rear tire showing sidewall cracking. Recommend replacement.',
        photoCount: 3,
        subtotalCents: 51600 + 7200,
      },
      {
        vehicleId: 'veh_002', vehicleLabel: '2022 Ford Transit · ACM-002',
        services: [{ description: 'Oil Change — Synthetic 5W-30', qty: 1, unitPrice: 7200 }],
        parts: [],
        findings: '',
        photoCount: 0,
        subtotalCents: 7200,
      },
    ],
    isRecurring: true,
    recurringPattern: 'Every 2nd Monday 8am–12pm',
    commissionType: 'per_line_item',
    notes: 'Key pickup at front desk. Park in Bay 3.',
  },
  {
    id: 'ses_002', shopId: 'shop_001', fleetAccountId: 'fleet_002',
    fleetAccountName: 'Metro Taxi & Rideshare LLC',
    technicianName: 'Jordan Davis', locationName: 'Main Bay',
    scheduledStart: '2026-06-17T09:00:00Z', scheduledEnd: '2026-06-17T14:00:00Z',
    status: 'scheduled',
    vehicleWork: [],
    isRecurring: false,
    commissionType: 'per_session_rate',
  },
  {
    id: 'ses_003', shopId: 'shop_001', fleetAccountId: 'fleet_001',
    fleetAccountName: 'Acme Delivery Co.',
    technicianName: 'Marcus Webb', locationName: 'Bay 2',
    scheduledStart: '2026-06-01T08:00:00Z', scheduledEnd: '2026-06-01T12:00:00Z',
    status: 'invoiced',
    vehicleWork: [],
    consolidatedInvoiceId: 'inv_001',
    isRecurring: true,
    recurringPattern: 'Every 2nd Monday 8am–12pm',
    commissionType: 'per_line_item',
  },
];

export const MOCK_REORDER_LISTS: ReorderList[] = [
  {
    id: 'ro_001', fleetAccountId: 'fleet_001', name: 'Monthly Transit Rotation Kit',
    lastOrderedAt: '2026-05-01',
    lines: [
      { sku: 'ATD-235-65-17', description: 'Michelin Defender T+H 235/65R17', agreedPrice: 12999, defaultQty: 16 },
      { sku: 'BAL-WGT-OZ', description: 'Wheel Balance Weights', agreedPrice: 250, defaultQty: 32 },
    ],
  },
  {
    id: 'ro_002', fleetAccountId: 'fleet_001', name: 'Oil Change Bundle — 5 Vans',
    lastOrderedAt: '2026-06-01',
    lines: [
      { sku: 'OIL-5W30-SYN', description: 'Synthetic 5W-30 (5 qt)', agreedPrice: 7200, defaultQty: 5 },
      { sku: 'FILTER-FORD-T', description: 'Oil Filter — Ford Transit', agreedPrice: 1200, defaultQty: 5 },
    ],
  },
];

export const MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: 'apr_001', fleetAccountId: 'fleet_001', fleetAccountName: 'Acme Delivery Co.',
    buyerName: 'Carlos Mendez', totalCents: 84500, poNumber: 'PO-ACM-2026-0091',
    items: ['Michelin Defender T+H 235/65R17 ×4 ($519.96)', 'Mount & Balance ×4 ($72.00)', 'Synthetic Oil Change ($72.00)'],
    status: 'pending', createdAt: '2026-06-15T11:00:00Z',
  },
  {
    id: 'apr_002', fleetAccountId: 'fleet_002', fleetAccountName: 'Metro Taxi & Rideshare LLC',
    buyerName: 'Sarah Okonkwo', totalCents: 62000,
    items: ['Goodyear Assurance 225/65R17 ×8 ($879.92)', 'Mount & Balance ×8 ($144.00)'],
    status: 'approved', approver: 'james.turner@acme.com', createdAt: '2026-06-14T09:00:00Z',
  },
  {
    id: 'apr_003', fleetAccountId: 'fleet_001', fleetAccountName: 'Acme Delivery Co.',
    buyerName: 'Rita Osei', totalCents: 43996, poNumber: 'PO-ACM-2026-0088',
    items: ['Goodyear Assurance 225/65R17 ×4 ($439.96)'],
    status: 'rejected', approver: 'james.turner@acme.com', reason: 'Wrong tire size — should be 235/65R17 for ProMaster fleet.',
    createdAt: '2026-06-13T14:00:00Z',
  },
];
