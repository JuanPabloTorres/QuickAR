// Backend DTO types (matches C# DTOs exactly)
export interface AssetDto {
  id: string;
  name: string;
  kind: "message" | "video" | "image" | "model3d" | "webcontent";
  url?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  text?: string;
}

export interface ExperienceDto {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  assets: AssetDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceCreateDto {
  title: string;
  slug?: string;
  description?: string;
  assets?: AssetCreateDto[];
}

export interface ExperienceUpdateDto {
  title: string;
  slug?: string;
  description?: string;
  isActive: boolean;
  assets?: AssetCreateDto[];
}

export interface AssetCreateDto {
  name: string;
  kind: "message" | "video" | "image" | "model3d" | "webcontent";
  url?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  text?: string;
}

// Frontend-specific types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Normalized asset type for frontend use
export interface Asset {
  id: string;
  name: string;
  assetType: "message" | "video" | "image" | "model3d" | "webcontent";
  assetUrl?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  assetContent?: string; // For message assets
}

// Normalized experience type for frontend use
export interface Experience {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  assets: Asset[];
  createdAt: Date;
  updatedAt: Date;
}

// AR-specific types
export interface ArScene {
  id: string;
  experience: Experience;
  currentAssetIndex: number;
  isLoading: boolean;
  error?: string;
}

export interface ArObject {
  id: string;
  asset: Asset;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface ArCamera {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  fov: number;
}

// Analytics types
export interface AnalyticsEvent {
  id: string;
  eventType: string;
  experienceId: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  additionalData?: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  totalViews: number;
  uniqueUsers: number;
  totalExperiences: number;
  averageTimeSpent: number;
  conversionRate: number;
  lastEventDate?: string;
  eventTypeBreakdown: Record<string, number>;
}

export interface DeviceStats {
  deviceName: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  period: string;
  views: number;
  interactions: number;
}

export interface ExperienceStats {
  experienceId: string;
  experienceName: string;
  viewCount: number;
  interactionCount: number;
  lastViewed?: string;
}

// UI state types
export interface ViewMode {
  type: "grid" | "list";
}

export interface FilterState {
  searchTerm: string;
  assetTypes: string[];
  isActive?: boolean;
  sortBy: "title" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
}

// Form types
export interface ExperienceFormData {
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  assets: AssetFormData[];
}

export interface AssetFormData {
  name: string;
  assetType: "message" | "video" | "image" | "model3d";
  file?: File;
  assetContent?: string; // For message assets
}

// Environment types
export interface EnvironmentInfo {
  isMobile: boolean;
  isLocalNetwork: boolean;
  baseUrl: string;
  apiBaseUrl: string;
}
