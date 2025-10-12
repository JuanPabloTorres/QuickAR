/**
 * Quick AR - Sistema de Tipos TypeScript
 * 
 * Mapea exactamente con los DTOs del backend .NET sin modificaciones
 * Mantiene compatibilidad total con la API existente
 */

// =============================================================================
// BACKEND DTOS (Exactos - No modificar)
// =============================================================================

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

// =============================================================================
// FRONTEND MODELS (Optimizados para UI/UX)
// =============================================================================

// Tipo normalizado para assets en frontend
export type ARAssetType = "text" | "image" | "video" | "model3d";

export interface ARAsset {
  id: string;
  name: string;
  description?: string;
  type: ARAssetType; // Normalizado desde 'kind'
  url?: string; // Normalizado desde 'url'
  content?: string; // Normalizado desde 'text'
  mimeType?: string;
  fileSizeBytes?: number;

  // Metadatos específicos por tipo
  metadata?: {
    format?: string;
    size?: number;
    dimensions?: { width: number; height: number };
    duration?: number; // Para videos
  };

  // Propiedades AR específicas
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  
  // Estados de carga y renderizado
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

  // Metadatos calculados
  hasAR?: boolean; // True si tiene modelos 3D
  primaryAsset?: ARAsset;
  qrCodeUrl?: string;
}

// =============================================================================
// MAPPERS Y TRANSFORMADORES
// =============================================================================

// Mapeo entre tipos backend y frontend
export const ASSET_KIND_TO_AR_TYPE: Record<AssetKind, ARAssetType> = {
  message: "text",
  image: "image",
  video: "video",
  model3d: "model3d",
};

export const AR_TYPE_TO_ASSET_KIND: Record<ARAssetType, AssetKind> = {
  text: "message",
  image: "image",
  video: "video",
  model3d: "model3d",
};

// Labels para UI
export const ASSET_TYPE_LABELS: Record<ARAssetType, string> = {
  text: "Texto",
  image: "Imagen", 
  video: "Video",
  model3d: "Modelo 3D",
};

export const ASSET_TYPE_ICONS: Record<ARAssetType, string> = {
  text: "📝",
  image: "🖼️",
  video: "🎥", 
  model3d: "🧊",
};

// =============================================================================
// UTILIDADES DE TRANSFORMACIÓN
// =============================================================================

/**
 * Transforma AssetDto del backend a ARAsset del frontend
 */
export function transformAssetDtoToARAsset(dto: AssetDto): ARAsset {
  // Generar metadata basada en el asset
  const metadata: ARAsset['metadata'] = {};
  
  if (dto.mimeType) {
    metadata.format = dto.mimeType.split('/')[1];
  }
  
  if (dto.fileSizeBytes) {
    metadata.size = dto.fileSizeBytes;
  }

  return {
    id: dto.id,
    name: dto.name,
    description: `${dto.name} - Asset tipo ${ASSET_KIND_TO_AR_TYPE[dto.kind]}`,
    type: ASSET_KIND_TO_AR_TYPE[dto.kind],
    url: dto.url || undefined,
    content: dto.text || undefined,
    mimeType: dto.mimeType || undefined,
    fileSizeBytes: dto.fileSizeBytes || undefined,
    metadata,
    
    // Valores por defecto para AR
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    
    // Estados iniciales
    isLoaded: false,
    hasError: false,
    loadProgress: 0,
  };
}

/**
 * Transforma ExperienceDto del backend a ARExperience del frontend
 */
export function transformExperienceDtoToARExperience(dto: ExperienceDto): ARExperience {
  const assets = dto.assets.map(transformAssetDtoToARAsset);
  
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    description: dto.description || undefined,
    isActive: dto.isActive,
    assets,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    
    // Metadatos calculados
    hasAR: assets.some(asset => asset.type === "model3d"),
    primaryAsset: assets[0] || undefined,
    qrCodeUrl: `${window.location.origin}/ar/${dto.id}`, // URL del QR
  };
}

/**
 * Transforma ARAsset del frontend a AssetCreateDto para el backend
 */
export function transformARAssetToCreateDto(asset: ARAsset): AssetCreateDto {
  return {
    name: asset.name,
    kind: AR_TYPE_TO_ASSET_KIND[asset.type],
    url: asset.url || null,
    mimeType: asset.mimeType || null,
    fileSizeBytes: asset.fileSizeBytes || null,
    text: asset.content || null,
  };
}

// =============================================================================
// TIPOS PARA COMPONENTES Y ESTADO
// =============================================================================

// Estados de carga
export type LoadingState = "idle" | "loading" | "success" | "error";

// Filtros para experiencias
export interface ExperienceFilters {
  search?: string;
  isActive?: boolean;
  hasAR?: boolean;
  assetType?: ARAssetType;
}

// Configuración AR
export interface ARConfig {
  enableAutoRotate: boolean;
  enableControls: boolean;
  backgroundColor: string;
  environment?: string;
  exposure?: number;
  shadowIntensity?: number;
}

// Props comunes para componentes
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Estado de la aplicación AR
export interface ARState {
  isLoading: boolean;
  isInitialized: boolean;
  hasError: boolean;
  errorMessage?: string;
  currentExperience?: ARExperience;
  config: ARConfig;
}

// Eventos de analytics
export type AnalyticsEventType = 
  | "experience_viewed"
  | "asset_loaded" 
  | "asset_interacted"
  | "ar_session_started"
  | "ar_session_ended"
  | "error_occurred";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  experienceId: string;
  assetId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}