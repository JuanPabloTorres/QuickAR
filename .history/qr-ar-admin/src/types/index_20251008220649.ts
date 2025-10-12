/**
 * Quick AR - Tipos TypeScript Unificados
 * 
 * Este archivo define todos los tipos que mapean exactamente con los DTOs del backend .NET
 * Mantiene compatibilidad total sin modificar el backend existente
 */

// ========================================
// TIPOS BASE DEL BACKEND (Exactos)
// ========================================

export type AssetKind = "message" | "video" | "image" | "model3d";

export interface AssetDto {
  id: string;
  name: string;
  kind: AssetKind;
  url?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
  text?: string | null; // Para assets de tipo "message"
}

export interface ExperienceDto {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  assets: AssetDto[];
  createdAt: string; // ISO string del backend
  updatedAt: string; // ISO string del backend
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

// Analytics DTOs
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

// File upload
export interface FileUploadResult {
  fileName: string;
  originalFileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

// ========================================
// TIPOS FRONTEND OPTIMIZADOS
// ========================================

// Tipo unificado para assets en el frontend (propiedades normalizadas)
export type ARAssetType = 'text' | 'image' | 'video' | 'model3d';

export interface ARAsset {
  id: string;
  name: string;
  type: ARAssetType; // Normalizado desde 'kind'
  url?: string; // Normalizado desde 'url'
  content?: string; // Normalizado desde 'text'
  mimeType?: string;
  fileSizeBytes?: number;
  
  // Metadatos adicionales para AR
  isLoaded?: boolean;
  hasError?: boolean;
  loadProgress?: number;
}

export interface ARExperience {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  assets: ARAsset[];
  createdAt: Date; // Convertido desde string
  updatedAt: Date; // Convertido desde string
  
  // Metadatos adicionales para AR
  hasAR?: boolean; // True si tiene modelos 3D
  primaryAsset?: ARAsset;
  qrCodeUrl?: string;
}

// ========================================
// MAPEO DE TIPOS
// ========================================

// Mapeo entre tipos backend y frontend
export const ASSET_KIND_TO_AR_TYPE: Record<AssetKind, ARAssetType> = {
  message: 'text',
  image: 'image',
  video: 'video',
  model3d: 'model3d'
};

export const AR_TYPE_TO_ASSET_KIND: Record<ARAssetType, AssetKind> = {
  text: 'message',
  image: 'image',
  video: 'video',
  model3d: 'model3d'
};

// Labels para UI
export const ASSET_TYPE_LABELS: Record<ARAssetType, string> = {
  text: 'Texto',
  image: 'Imagen',
  video: 'Video',
  model3d: 'Modelo 3D'
};

export const ASSET_KIND_LABELS: Record<AssetKind, string> = {
  message: 'Texto',
  image: 'Imagen',
  video: 'Video',
  model3d: 'Modelo 3D'
};

// ========================================
// TIPOS DE UI Y COMPONENTES
// ========================================

export type ViewMode = 'grid' | 'list' | 'ar';
export type SortOrder = 'asc' | 'desc';
export type SortField = 'title' | 'createdAt' | 'updatedAt';

export interface ExperienceFilters {
  searchTerm?: string;
  isActive?: boolean;
  hasAR?: boolean;
  assetTypes?: ARAssetType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ========================================
// TIPOS DE AR Y 3D
// ========================================

export interface ARState {
  isSupported: boolean;
  isActive: boolean;
  isLoading: boolean;
  error?: string;
  sessionId?: string;
}

export interface ARCapabilities {
  webxr: boolean;
  modelViewer: boolean;
  camera: boolean;
  worldTracking: boolean;
  planeDetection: boolean;
}

export interface AR3DSettings {
  enableInteraction: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  enableRotate: boolean;
  autoRotate: boolean;
  scale: number;
  backgroundColor: string;
}

// ========================================
// TIPOS DE VALIDACIÓN
// ========================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

// ========================================
// TIPOS DE EVENTOS
// ========================================

export type AREvent = 
  | { type: 'ASSET_LOADED'; payload: { assetId: string } }
  | { type: 'ASSET_ERROR'; payload: { assetId: string; error: string } }
  | { type: 'AR_SESSION_START'; payload: { sessionId: string } }
  | { type: 'AR_SESSION_END'; payload: { sessionId: string; duration: number } }
  | { type: 'USER_INTERACTION'; payload: { type: string; assetId?: string } };

export interface EventHandler<T extends AREvent = AREvent> {
  (event: T): void;
}

// ========================================
// UTILIDADES DE TIPO
// ========================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Para formularios
export type FormData<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

// ========================================
// CONSTANTES GLOBALES
// ========================================

export const AR_CONFIG = {
  DEFAULT_ASSET_SIZE: 300,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'webm'],
  SUPPORTED_MODEL_FORMATS: ['glb', 'gltf'],
  QR_CODE_SIZE: 200,
  AR_SESSION_TIMEOUT: 30000, // 30 seconds
} as const;

export const UI_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  GRID_BREAKPOINTS: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
} as const;