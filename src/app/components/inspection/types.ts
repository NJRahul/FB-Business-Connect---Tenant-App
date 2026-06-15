export type PhotoRequirement = 'none' | 'optional' | 'required';
export type ItemStatus = 'good' | 'attention' | 'critical' | 'na' | 'pending';
export type RecommendationDecision = 'approved' | 'declined' | 'deferred';
export type InspectionStatus = 'not_started' | 'in_progress' | 'completed';

export interface TemplateItemConfig {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  instructions: string;
  photoRequirement: PhotoRequirement;
  minPhotos: number;
  allowVoiceNote: boolean;
  statusOptions: ItemStatus[];
  recommendedActions: Partial<Record<ItemStatus, string>>;
  priceCents: number;
}

export interface InspectionTemplate {
  id: string;
  shopId: string;
  locationId?: string;
  name: string;
  serviceType: string;
  categories: string[];
  items: TemplateItemConfig[];
  isDefault: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  itemName: string;
  description: string;
  priceCents: number;
  decision?: RecommendationDecision;
  customerReason?: string;
  deferredTo?: string;
}

export interface ItemRecord {
  id: string;
  templateItemId: string;
  itemName: string;
  category: string;
  status: ItemStatus;
  photoCount: number;
  hasVoiceNote: boolean;
  transcript?: string;
  observations: string;
  isAdHoc: boolean;
  recommendation?: Recommendation;
}

export interface InspectionRecord {
  id: string;
  shopId: string;
  visitId: string;
  templateId: string;
  templateName: string;
  technicianId: string;
  technicianName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  licensePlate: string;
  status: InspectionStatus;
  startedAt: string;
  completedAt?: string;
  items: ItemRecord[];
  token: string;
  approvedAt?: string;
}

export interface TechnicianStats {
  technicianId: string;
  technicianName: string;
  inspectionsCount: number;
  avgTimeMinutes: number;
  avgRecommendationCount: number;
  attachRate: number;
  revenueCents: number;
}

export interface TemplatePerformance {
  templateId: string;
  templateName: string;
  usageCount: number;
  avgAttachRate: number;
  topCriticalItem: string;
  avgRevenueCents: number;
}
