import {
  ARAsset,
  ARExperience,
  AssetDto,
  AssetKind,
  ASSET_TYPE_MAPPING,
  AR_TYPE_TO_ASSET_KIND,
  ExperienceDto
} from '@/types';

/**
 * Experience Helper Utilities
 * Handles mapping between backend DTOs and frontend AR types
 */

export interface ExperienceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AssetValidationOptions {
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: string[];
  requireARSettings?: boolean;
}

export interface ExperienceFilters {
  isActive?: boolean;
  assetKinds?: AssetKind[];
  hasAR?: boolean;
  searchTerm?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Maps backend AssetDto to frontend ARAsset with normalized property names
 */
export function mapAssetDtoToARAsset(asset: AssetDto): ARAsset {
  return {
    id: asset.id,
    name: asset.name,
    assetType: ASSET_TYPE_MAPPING[asset.kind],
    assetUrl: asset.url || undefined,
    assetContent: asset.text || undefined,
    mimeType: asset.mimeType || undefined,
    fileSizeBytes: asset.fileSizeBytes || undefined,
  };
}

/**
 * Maps backend ExperienceDto to frontend ARExperience with proper types
 */
export function mapExperienceDtoToARExperience(experience: ExperienceDto): ARExperience {
  return {
    id: experience.id,
    title: experience.title,
    slug: experience.slug,
    description: experience.description || undefined,
    isActive: experience.isActive,
    assets: experience.assets.map(mapAssetDtoToARAsset),
    createdAt: new Date(experience.createdAt),
    updatedAt: new Date(experience.updatedAt),
  };
}

/**
 * Maps ARAsset back to AssetDto for API calls
 */
export function mapARAssetToAssetDto(asset: ARAsset): Omit<AssetDto, 'id'> {
  // Find the backend kind from frontend assetType
  const kind = Object.entries(ASSET_TYPE_MAPPING).find(
    ([, value]) => value === asset.assetType
  )?.[0] as AssetKind;

  if (!kind) {
    throw new Error(`Invalid asset type: ${asset.assetType}`);
  }

  return {
    name: asset.name,
    kind,
    url: asset.assetUrl || null,
    text: asset.assetContent || null,
    mimeType: asset.mimeType || null,
    fileSizeBytes: asset.fileSizeBytes || null,
  };
}

/**
 * Validates an experience before creation/update
 */
export function validateExperience(
  experience: Partial<ARExperience>
): ExperienceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title validation
  if (!experience.title?.trim()) {
    errors.push('El título es requerido');
  } else if (experience.title.length < 3) {
    errors.push('El título debe tener al menos 3 caracteres');
  } else if (experience.title.length > 100) {
    errors.push('El título no puede exceder 100 caracteres');
  }

  // Description validation
  if (experience.description && experience.description.length > 500) {
    warnings.push('La descripción es muy larga, considera resumirla');
  }

  // Assets validation
  if (!experience.assets || experience.assets.length === 0) {
    errors.push('Se requiere al menos un asset');
  } else {
    // Validate each asset
    experience.assets.forEach((asset, index) => {
      if (!asset.name?.trim()) {
        errors.push(`Asset ${index + 1}: El nombre es requerido`);
      }

      // Type-specific validations
      switch (asset.assetType) {
        case 'text':
          if (!asset.assetContent?.trim()) {
            errors.push(`Asset ${index + 1}: El contenido de texto es requerido`);
          }
          break;
        case 'image':
        case 'video':
        case 'model3d':
          if (!asset.assetUrl?.trim()) {
            errors.push(`Asset ${index + 1}: La URL del archivo es requerida`);
          }
          break;
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an asset with specific options
 */
export function validateAsset(
  asset: ARAsset,
  options: AssetValidationOptions = {}
): ExperienceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const {
    maxFileSize = 50 * 1024 * 1024, // 50MB default
    allowedMimeTypes = [],
    requireARSettings = false,
  } = options;

  // File size validation
  if (asset.fileSizeBytes && asset.fileSizeBytes > maxFileSize) {
    errors.push(`El archivo excede el tamaño máximo permitido (${Math.round(maxFileSize / 1024 / 1024)}MB)`);
  }

  // MIME type validation
  if (allowedMimeTypes.length > 0 && asset.mimeType) {
    if (!allowedMimeTypes.includes(asset.mimeType)) {
      errors.push(`Tipo de archivo no permitido: ${asset.mimeType}`);
    }
  }

  // AR-specific validations
  if (requireARSettings && asset.assetType === 'model3d') {
    if (!asset.assetUrl?.endsWith('.glb') && !asset.assetUrl?.endsWith('.gltf')) {
      warnings.push('Se recomienda usar formatos .glb o .gltf para modelos 3D en AR');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Filters experiences based on criteria
 */
export function filterExperiences(
  experiences: ARExperience[],
  filters: ExperienceFilters
): ARExperience[] {
  return experiences.filter((experience) => {
    // Active filter
    if (filters.isActive !== undefined && experience.isActive !== filters.isActive) {
      return false;
    }

    // Asset kinds filter
    if (filters.assetKinds && filters.assetKinds.length > 0) {
      const hasMatchingAsset = experience.assets.some((asset) =>
        filters.assetKinds!.includes(ASSET_TYPE_MAPPING[asset.assetType] as AssetKind)
      );
      if (!hasMatchingAsset) return false;
    }

    // AR filter (has 3D models)
    if (filters.hasAR !== undefined) {
      const hasARAssets = experience.assets.some((asset) => asset.assetType === 'model3d');
      if (hasARAssets !== filters.hasAR) return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matchesTitle = experience.title.toLowerCase().includes(searchTerm);
      const matchesDescription = experience.description?.toLowerCase().includes(searchTerm);
      const matchesAssetName = experience.assets.some((asset) =>
        asset.name.toLowerCase().includes(searchTerm)
      );
      
      if (!matchesTitle && !matchesDescription && !matchesAssetName) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const createdDate = experience.createdAt;
      if (createdDate < filters.dateRange.start || createdDate > filters.dateRange.end) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sorts experiences by specified criteria
 */
export function sortExperiences(
  experiences: ARExperience[],
  sortBy: keyof ARExperience,
  order: 'asc' | 'desc' = 'desc'
): ARExperience[] {
  return [...experiences].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    let comparison = 0;

    if (aValue < bValue) {
      comparison = -1;
    } else if (aValue > bValue) {
      comparison = 1;
    }

    return order === 'desc' ? -comparison : comparison;
  });
}

/**
 * Gets the primary asset for display purposes
 */
export function getPrimaryAsset(experience: ARExperience): ARAsset | null {
  if (experience.assets.length === 0) return null;

  // Prioritize 3D models, then images, then videos, then text
  const priorityOrder: ARAsset['assetType'][] = ['model3d', 'image', 'video', 'text'];
  
  for (const type of priorityOrder) {
    const asset = experience.assets.find((a) => a.assetType === type);
    if (asset) return asset;
  }

  return experience.assets[0];
}

/**
 * Generates a QR code URL for an experience
 */
export function generateExperienceQRUrl(experience: ARExperience, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/ar/${experience.id}`;
}

/**
 * Gets asset type icon class (for UI components)
 */
export function getAssetTypeIcon(assetType: ARAsset['assetType']): string {
  const iconMap = {
    text: 'FileText',
    image: 'Image',
    video: 'Play',
    model3d: 'Package',
  };
  return iconMap[assetType];
}