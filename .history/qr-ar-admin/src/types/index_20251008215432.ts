/**
 * TypeScript types that match backend DTOs exactly
 * These types maintain the same structure as the .NET backend DTOs
 */

// Asset types that match backend exactly
export type AssetKind = "message" | "video" | "image" | "model3d";

// Backend DTO types (exact match)
export interface AssetDto {
  id: string;
  name: string;
  kind: AssetKind;
  url?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
  text?: string | null; // For message assets
}

export interface ExperienceDto {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  assets: AssetDto[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ExperienceCreateDto {
  title: string;
  slug?: string | null;
  description?: string | null;
  assets?: AssetCreateDto[] | null;
}

export interface ExperienceUpdateDto {
  title: string;
  slug?: string | null;
  description?: string | null;
  isActive: boolean;
  assets?: AssetCreateDto[] | null;
}

export interface AssetCreateDto {
  name: string;
  kind: AssetKind;
  url?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
  text?: string | null;
}

// Analytics types
export interface AnalyticsEventDto {
  id: string;
  experienceId: string;
  eventType: string;
  properties?: Record<string, any> | null;
  timestamp: string; // ISO string
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface AnalyticsEventCreateDto {
  experienceId: string;
  eventType: string;
  properties?: Record<string, any> | null;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// File upload types
export interface FileUploadResult {
  fileName: string;
  originalFileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

// Frontend-specific types for AR rendering
export interface ARAsset {
  id: string;
  name: string;
  assetType: 'image' | 'video' | 'text' | 'model3d'; // Normalized from 'kind'
  assetUrl?: string; // Normalized from 'url'
  assetContent?: string; // Normalized from 'text'
  mimeType?: string;
  fileSizeBytes?: number;
}

export interface ARExperience {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  assets: ARAsset[];
  createdAt: Date;
  updatedAt: Date;
}

// UI Component types
export type ViewMode = 'grid' | 'list' | 'ar';
export type SortOrder = 'asc' | 'desc';

// Asset kind labels for UI
export const ASSET_KIND_LABELS: Record<AssetKind, string> = {
  message: 'Texto',
  image: 'Imagen',
  video: 'Video',
  model3d: 'Modelo 3D'
};

// Asset type mapping for AR components
export const ASSET_TYPE_MAPPING: Record<AssetKind, ARAsset['assetType']> = {
  message: 'text',
  image: 'image',
  video: 'video',
  model3d: 'model3d'
};

// Reverse mapping for converting back to backend types
export const AR_TYPE_TO_ASSET_KIND: Record<ARAsset['assetType'], AssetKind> = {
  text: 'message',
  image: 'image',
  video: 'video',
  model3d: 'model3d'
};