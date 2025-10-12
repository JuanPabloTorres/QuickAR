import { ARExperienceResponse, ARAsset, CreateExperienceRequest } from '@/lib/ar-client';

/**
 * Experience helper utilities with unified contracts (camelCase)
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
  assetTypes?: ARAsset['assetType'][];
  hasAR?: boolean;
  searchTerm?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Validate an experience before creation/update
 */
export function validateExperience(
  experience: Partial<CreateExperienceRequest>
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
    warnings.push('La descripción es muy larga (máximo recomendado: 500 caracteres)');
  }

  // Assets validation
  if (!experience.assets || experience.assets.length === 0) {
    errors.push('Se requiere al menos un asset');
  } else {
    experience.assets.forEach((asset, index) => {
      const assetErrors = validateAsset(asset, { requireARSettings: true });
      if (!assetErrors.isValid) {
        errors.push(`Asset ${index + 1}: ${assetErrors.errors.join(', ')}`);
      }
      if (assetErrors.warnings.length > 0) {
        warnings.push(`Asset ${index + 1}: ${assetErrors.warnings.join(', ')}`);
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
 * Validate an individual asset
 */
export function validateAsset(
  asset: Partial<ARAsset>,
  options: AssetValidationOptions = {}
): ExperienceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const {
    maxFileSize = 50 * 1024 * 1024, // 50MB
    allowedMimeTypes,
    requireARSettings = false,
  } = options;

  // Asset type validation
  if (!asset.assetType) {
    errors.push('Tipo de asset requerido');
  } else if (!['image', 'video', 'text', 'model3d'].includes(asset.assetType)) {
    errors.push('Tipo de asset no válido');
  }

  // Content validation based on type
  if (asset.assetType === 'text') {
    if (!asset.content?.trim()) {
      errors.push('Contenido de texto requerido');
    } else if (asset.content.length > 2000) {
      warnings.push('Contenido de texto muy largo (máximo recomendado: 2000 caracteres)');
    }
  } else {
    if (!asset.url) {
      errors.push('URL del asset requerida');
    } else if (!isValidUrl(asset.url)) {
      errors.push('URL del asset no válida');
    }
  }

  // File size validation (if metadata available)
  if (asset.metadata?.size && asset.metadata.size > maxFileSize) {
    errors.push(`Tamaño de archivo excede el límite (${formatFileSize(maxFileSize)})`);
  }

  // MIME type validation
  if (allowedMimeTypes && asset.metadata?.mimeType) {
    if (!allowedMimeTypes.includes(asset.metadata.mimeType)) {
      errors.push(`Tipo de archivo no permitido: ${asset.metadata.mimeType}`);
    }
  }

  // AR settings validation
  if (requireARSettings && asset.assetType === 'model3d') {
    if (!asset.arSettings) {
      warnings.push('Configuración AR recomendada para modelos 3D');
    } else {
      if (asset.arSettings.scale && !['auto', 'fixed'].includes(asset.arSettings.scale)) {
        const scaleValue = parseFloat(asset.arSettings.scale);
        if (isNaN(scaleValue) || scaleValue <= 0 || scaleValue > 10) {
          warnings.push('Escala AR debe ser "auto", "fixed" o un número entre 0.1 y 10');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Filter and sort experiences
 */
export function filterExperiences(
  experiences: ARExperienceResponse[],
  filters: ExperienceFilters = {}
): ARExperienceResponse[] {
  let filtered = [...experiences];

  // Filter by active status
  if (filters.isActive !== undefined) {
    filtered = filtered.filter(exp => exp.isActive === filters.isActive);
  }

  // Filter by asset types
  if (filters.assetTypes && filters.assetTypes.length > 0) {
    filtered = filtered.filter(exp => 
      exp.assets.some(asset => filters.assetTypes!.includes(asset.assetType))
    );
  }

  // Filter by AR availability
  if (filters.hasAR !== undefined) {
    filtered = filtered.filter(exp => {
      const hasARAssets = exp.assets.some(asset => 
        asset.assetType === 'model3d' || 
        (asset.arSettings && Object.keys(asset.arSettings).length > 0)
      );
      return hasARAssets === filters.hasAR;
    });
  }

  // Filter by search term
  if (filters.searchTerm?.trim()) {
    const searchTerm = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(exp => 
      exp.title.toLowerCase().includes(searchTerm) ||
      exp.description?.toLowerCase().includes(searchTerm) ||
      exp.assets.some(asset => 
        asset.content?.toLowerCase().includes(searchTerm) ||
        asset.metadata?.mimeType?.toLowerCase().includes(searchTerm)
      )
    );
  }

  // Filter by date range
  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    filtered = filtered.filter(exp => {
      const createdAt = new Date(exp.createdAt);
      return createdAt >= start && createdAt <= end;
    });
  }

  return filtered;
}

/**
 * Sort experiences by various criteria
 */
export function sortExperiences(
  experiences: ARExperienceResponse[],
  sortBy: 'title' | 'createdAt' | 'updatedAt' | 'assetsCount',
  direction: 'asc' | 'desc' = 'desc'
): ARExperienceResponse[] {
  return [...experiences].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'assetsCount':
        comparison = a.assets.length - b.assets.length;
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Group experiences by criteria
 */
export function groupExperiences(
  experiences: ARExperienceResponse[],
  groupBy: 'status' | 'assetType' | 'month'
): Record<string, ARExperienceResponse[]> {
  const groups: Record<string, ARExperienceResponse[]> = {};

  experiences.forEach(experience => {
    let groupKey: string;

    switch (groupBy) {
      case 'status':
        groupKey = experience.isActive ? 'Activas' : 'Inactivas';
        break;
      case 'assetType':
        // Group by primary asset type (first asset)
        groupKey = experience.assets.length > 0 
          ? getAssetTypeLabel(experience.assets[0].assetType)
          : 'Sin assets';
        break;
      case 'month':
        const date = new Date(experience.createdAt);
        groupKey = date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long' 
        });
        break;
      default:
        groupKey = 'Otros';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(experience);
  });

  return groups;
}

/**
 * Calculate experience statistics
 */
export function calculateExperienceStats(experiences: ARExperienceResponse[]): {
  total: number;
  active: number;
  inactive: number;
  withAR: number;
  assetTypes: Record<string, number>;
  averageAssetsPerExperience: number;
  totalAssets: number;
} {
  const stats = {
    total: experiences.length,
    active: 0,
    inactive: 0,
    withAR: 0,
    assetTypes: {} as Record<string, number>,
    averageAssetsPerExperience: 0,
    totalAssets: 0,
  };

  experiences.forEach(experience => {
    // Status counts
    if (experience.isActive) {
      stats.active++;
    } else {
      stats.inactive++;
    }

    // AR availability
    const hasAR = experience.assets.some(asset => 
      asset.assetType === 'model3d' || 
      (asset.arSettings && Object.keys(asset.arSettings).length > 0)
    );
    if (hasAR) {
      stats.withAR++;
    }

    // Asset counts
    stats.totalAssets += experience.assets.length;

    // Asset type distribution
    experience.assets.forEach(asset => {
      const typeLabel = getAssetTypeLabel(asset.assetType);
      stats.assetTypes[typeLabel] = (stats.assetTypes[typeLabel] || 0) + 1;
    });
  });

  stats.averageAssetsPerExperience = stats.total > 0 
    ? Math.round((stats.totalAssets / stats.total) * 100) / 100 
    : 0;

  return stats;
}

/**
 * Generate a unique experience slug
 */
export function generateExperienceSlug(title: string, existingTitles: string[] = []): string {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[áäàâ]/g, 'a')
    .replace(/[éëèê]/g, 'e')
    .replace(/[íïìî]/g, 'i')
    .replace(/[óöòô]/g, 'o')
    .replace(/[úüùû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

  // Ensure uniqueness
  let counter = 1;
  let finalSlug = slug;
  
  while (existingTitles.includes(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
}

/**
 * Clone an experience with modifications
 */
export function cloneExperience(
  experience: ARExperienceResponse,
  modifications: Partial<CreateExperienceRequest> = {}
): CreateExperienceRequest {
  return {
    title: modifications.title || `${experience.title} (Copia)`,
    description: modifications.description || experience.description,
    isActive: modifications.isActive ?? false, // New clones start inactive
    assets: modifications.assets || experience.assets.map(asset => ({
      assetType: asset.assetType,
      url: asset.url,
      content: asset.content,
      metadata: asset.metadata,
      arSettings: asset.arSettings,
    })),
    analyticsEnabled: modifications.analyticsEnabled ?? experience.analyticsEnabled,
  };
}

/**
 * Export experience data for backup or migration
 */
export function exportExperience(experience: ARExperienceResponse): string {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    experience: {
      title: experience.title,
      description: experience.description,
      isActive: experience.isActive,
      assets: experience.assets,
      analyticsEnabled: experience.analyticsEnabled,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import experience data from backup
 */
export function importExperience(jsonData: string): CreateExperienceRequest {
  try {
    const importData = JSON.parse(jsonData);
    
    if (!importData.experience) {
      throw new Error('Formato de archivo no válido');
    }

    const experience = importData.experience;
    
    return {
      title: experience.title || 'Experiencia Importada',
      description: experience.description,
      isActive: false, // Start inactive for safety
      assets: experience.assets || [],
      analyticsEnabled: experience.analyticsEnabled ?? true,
    };
  } catch (error) {
    throw new Error(`Error al importar experiencia: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Utility functions

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function getAssetTypeLabel(assetType: ARAsset['assetType']): string {
  const labels = {
    image: 'Imágenes',
    video: 'Videos',
    text: 'Texto',
    model3d: 'Modelos 3D',
  };
  return labels[assetType] || 'Desconocido';
}

export const experienceHelpers = {
  validate: validateExperience,
  validateAsset,
  filter: filterExperiences,
  sort: sortExperiences,
  group: groupExperiences,
  stats: calculateExperienceStats,
  generateSlug: generateExperienceSlug,
  clone: cloneExperience,
  export: exportExperience,
  import: importExperience,
};