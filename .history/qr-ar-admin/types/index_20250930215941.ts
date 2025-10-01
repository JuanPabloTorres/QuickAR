// Types that match backend DTOs exactly

export type AssetKind = "message" | "video" | "image" | "model3d";

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
  createdAt: string;
  updatedAt: string;
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

export interface AnalyticsEventDto {
  id: string;
  eventType: string;
  experienceId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  referrer?: string | null;
  additionalData?: string | null;
  createdAt: string;
}

export interface AnalyticsEventCreateDto {
  eventType: string;
  experienceId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  referrer?: string | null;
  additionalData?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  message?: string | null;
  errors?: string[] | null;
}

export interface FileUploadResult {
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

// Frontend-specific types
export interface Experience extends ExperienceDto {
  qrCodeUrl?: string;
}

export interface FormAsset {
  id?: string;
  name: string;
  kind: AssetKind;
  url?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  text?: string;
  file?: File; // For file uploads
}

export interface ExperienceFormData {
  title: string;
  slug?: string;
  description?: string;
  isActive: boolean;
  assets: FormAsset[];
}

// Validation schemas
export const ASSET_MIME_TYPES: Record<AssetKind, string[]> = {
  model3d: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  message: [] // No files for message assets
};

export const ASSET_MAX_SIZES: Record<AssetKind, number> = {
  model3d: 50 * 1024 * 1024, // 50MB
  image: 10 * 1024 * 1024,   // 10MB
  video: 100 * 1024 * 1024,  // 100MB
  message: 0 // No files for message assets
};

export const ASSET_KIND_LABELS: Record<AssetKind, string> = {
  message: 'Mensaje de Texto',
  image: 'Imagen',
  video: 'Video',
  model3d: 'Modelo 3D'
};

export const ASSET_KIND_DESCRIPTIONS: Record<AssetKind, string> = {
  message: 'Texto que se mostrará en la experiencia AR',
  image: 'Imagen que se mostrará como overlay o textura',
  video: 'Video que se reproducirá en la experiencia',
  model3d: 'Modelo 3D en formato GLB/GLTF que aparecerá en AR'
};