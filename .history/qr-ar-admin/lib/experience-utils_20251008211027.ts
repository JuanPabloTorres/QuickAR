import { ExperienceDto, AssetDto, AssetKind } from '@/types';

/**
 * Experience utilities with unified contracts
 */

export interface ExperienceWithAR extends ExperienceDto {
  qrCodeUrl?: string;
  analyticsEnabled?: boolean;
}

export interface AssetWithAR extends AssetDto {
  arSettings?: {
    scale?: string;
    placement?: 'floor' | 'wall';
    anchorMode?: 'auto' | 'manual';
    interactionEnabled?: boolean;
  };
}

/**
 * Map backend DTO to frontend experience
 */
export function mapExperienceFromDTO(dto: ExperienceDto): ExperienceWithAR {
  return {
    ...dto,
    assets: dto.assets.map(mapAssetFromDTO),
    qrCodeUrl: generateQRCodeUrl(dto.id),
    analyticsEnabled: true, // Default value
  };
}

/**
 * Map backend asset DTO to frontend asset
 */
export function mapAssetFromDTO(dto: AssetDto): AssetWithAR {
  return {
    ...dto,
    // Map 'text' field to 'content' for message assets
    text: dto.kind === 'message' ? dto.text : undefined,
    arSettings: dto.kind === 'model3d' ? {
      scale: 'auto',
      placement: 'floor',
      anchorMode: 'auto',
      interactionEnabled: true,
    } : undefined,
  };
}

/**
 * Map frontend experience to backend DTO
 */
export function mapExperienceToDTO(experience: ExperienceWithAR): ExperienceDto {
  return {
    id: experience.id,
    title: experience.title,
    slug: experience.slug,
    description: experience.description,
    isActive: experience.isActive,
    assets: experience.assets.map(mapAssetToDTO),
    createdAt: experience.createdAt,
    updatedAt: experience.updatedAt,
  };
}

/**
 * Map frontend asset to backend DTO
 */
export function mapAssetToDTO(asset: AssetWithAR): AssetDto {
  return {
    id: asset.id,
    name: asset.name,
    kind: asset.kind,
    url: asset.url,
    mimeType: asset.mimeType,
    fileSizeBytes: asset.fileSizeBytes,
    // Map 'content' to 'text' for message assets
    text: asset.kind === 'message' ? asset.text : null,
  };
}

/**
 * Generate QR code URL for an experience
 */
export function generateQRCodeUrl(experienceId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/x/${experienceId}`;
}

/**
 * Get asset type display name in Spanish
 */
export function getAssetKindLabel(kind: AssetKind): string {
  const labels: Record<AssetKind, string> = {
    message: 'Mensaje',
    image: 'Imagen',
    video: 'Video',
    model3d: 'Modelo 3D',
  };
  return labels[kind] || 'Desconocido';
}

/**
 * Get asset type icon name for UI
 */
export function getAssetKindIcon(kind: AssetKind): string {
  const icons: Record<AssetKind, string> = {
    message: 'FileText',
    image: 'Image',
    video: 'Play',
    model3d: 'Package',
  };
  return icons[kind] || 'File';
}

/**
 * Validate experience data
 */
export function validateExperience(experience: Partial<ExperienceWithAR>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!experience.title?.trim()) {
    errors.push('El título es requerido');
  }

  if (!experience.assets || experience.assets.length === 0) {
    errors.push('Se requiere al menos un asset');
  } else {
    experience.assets.forEach((asset, index) => {
      if (!asset.name?.trim()) {
        errors.push(`Asset ${index + 1}: Nombre requerido`);
      }
      if (!asset.kind) {
        errors.push(`Asset ${index + 1}: Tipo de asset requerido`);
      }
      if (asset.kind !== 'message' && !asset.url) {
        errors.push(`Asset ${index + 1}: URL requerida para este tipo de asset`);
      }
      if (asset.kind === 'message' && !asset.text?.trim()) {
        errors.push(`Asset ${index + 1}: Texto requerido para mensajes`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if experience supports AR
 */
export function hasARSupport(experience: ExperienceWithAR): boolean {
  return experience.assets.some(asset => 
    asset.kind === 'model3d' || 
    (asset as AssetWithAR).arSettings !== undefined
  );
}

/**
 * Get experience statistics
 */
export function getExperienceStats(experiences: ExperienceWithAR[]): {
  total: number;
  active: number;
  withAR: number;
  assetTypes: Record<AssetKind, number>;
} {
  const stats = {
    total: experiences.length,
    active: 0,
    withAR: 0,
    assetTypes: {
      message: 0,
      image: 0,
      video: 0,
      model3d: 0,
    } as Record<AssetKind, number>,
  };

  experiences.forEach(experience => {
    if (experience.isActive) {
      stats.active++;
    }

    if (hasARSupport(experience)) {
      stats.withAR++;
    }

    experience.assets.forEach(asset => {
      stats.assetTypes[asset.kind]++;
    });
  });

  return stats;
}

/**
 * Filter experiences by criteria
 */
export function filterExperiences(
  experiences: ExperienceWithAR[],
  filters: {
    isActive?: boolean;
    hasAR?: boolean;
    assetKinds?: AssetKind[];
    search?: string;
  }
): ExperienceWithAR[] {
  return experiences.filter(experience => {
    if (filters.isActive !== undefined && experience.isActive !== filters.isActive) {
      return false;
    }

    if (filters.hasAR !== undefined && hasARSupport(experience) !== filters.hasAR) {
      return false;
    }

    if (filters.assetKinds && filters.assetKinds.length > 0) {
      const hasMatchingAsset = experience.assets.some(asset =>
        filters.assetKinds!.includes(asset.kind)
      );
      if (!hasMatchingAsset) {
        return false;
      }
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = experience.title.toLowerCase().includes(searchLower);
      const matchesDescription = experience.description?.toLowerCase().includes(searchLower);
      const matchesAssets = experience.assets.some(asset =>
        asset.name.toLowerCase().includes(searchLower) ||
        asset.text?.toLowerCase().includes(searchLower)
      );
      
      if (!matchesTitle && !matchesDescription && !matchesAssets) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort experiences by different criteria
 */
export function sortExperiences(
  experiences: ExperienceWithAR[],
  sortBy: 'title' | 'createdAt' | 'updatedAt' | 'assetCount',
  direction: 'asc' | 'desc' = 'desc'
): ExperienceWithAR[] {
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
      case 'assetCount':
        comparison = a.assets.length - b.assets.length;
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Create a new experience with default values
 */
export function createEmptyExperience(): Partial<ExperienceWithAR> {
  return {
    title: '',
    slug: '',
    description: '',
    isActive: false,
    assets: [],
    analyticsEnabled: true,
  };
}

/**
 * Create a new asset with default values
 */
export function createEmptyAsset(kind: AssetKind): Partial<AssetWithAR> {
  const baseAsset = {
    name: '',
    kind,
    url: kind !== 'message' ? '' : undefined,
    mimeType: null,
    fileSizeBytes: null,
    text: kind === 'message' ? '' : null,
  };

  if (kind === 'model3d') {
    return {
      ...baseAsset,
      arSettings: {
        scale: 'auto',
        placement: 'floor',
        anchorMode: 'auto',
        interactionEnabled: true,
      },
    };
  }

  return baseAsset;
}

export const experienceUtils = {
  mapFromDTO: mapExperienceFromDTO,
  mapToDTO: mapExperienceToDTO,
  mapAssetFromDTO,
  mapAssetToDTO,
  validate: validateExperience,
  hasAR: hasARSupport,
  getStats: getExperienceStats,
  filter: filterExperiences,
  sort: sortExperiences,
  createEmpty: createEmptyExperience,
  createEmptyAsset,
  getKindLabel: getAssetKindLabel,
  getKindIcon: getAssetKindIcon,
};