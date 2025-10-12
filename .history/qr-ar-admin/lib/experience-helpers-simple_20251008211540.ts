import { AssetKind, ExperienceDto } from "@/types";

/**
 * Simple experience helpers using unified DTOs
 */

export interface ExperienceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate an experience
 */
export function validateExperience(
  experience: Partial<ExperienceDto>
): ExperienceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title validation
  if (!experience.title?.trim()) {
    errors.push("El título es requerido");
  } else if (experience.title.length < 3) {
    errors.push("El título debe tener al menos 3 caracteres");
  } else if (experience.title.length > 100) {
    errors.push("El título no puede exceder 100 caracteres");
  }

  // Description validation
  if (experience.description && experience.description.length > 500) {
    warnings.push(
      "La descripción es muy larga (máximo recomendado: 500 caracteres)"
    );
  }

  // Assets validation
  if (!experience.assets || experience.assets.length === 0) {
    errors.push("Se requiere al menos un asset");
  } else {
    experience.assets.forEach((asset, index) => {
      if (!asset.name?.trim()) {
        errors.push(`Asset ${index + 1}: Nombre requerido`);
      }
      if (!asset.kind) {
        errors.push(`Asset ${index + 1}: Tipo de asset requerido`);
      }
      if (asset.kind !== "message" && !asset.url) {
        errors.push(`Asset ${index + 1}: URL requerida`);
      }
      if (asset.kind === "message" && !asset.text?.trim()) {
        errors.push(`Asset ${index + 1}: Texto requerido para mensajes`);
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
 * Filter experiences by criteria
 */
export function filterExperiences(
  experiences: ExperienceDto[],
  filters: {
    isActive?: boolean;
    assetKinds?: AssetKind[];
    searchTerm?: string;
  } = {}
): ExperienceDto[] {
  return experiences.filter((experience) => {
    // Filter by active status
    if (
      filters.isActive !== undefined &&
      experience.isActive !== filters.isActive
    ) {
      return false;
    }

    // Filter by asset kinds
    if (filters.assetKinds && filters.assetKinds.length > 0) {
      const hasMatchingAsset = experience.assets.some((asset) =>
        filters.assetKinds!.includes(asset.kind)
      );
      if (!hasMatchingAsset) {
        return false;
      }
    }

    // Filter by search term
    if (filters.searchTerm?.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matchesTitle = experience.title.toLowerCase().includes(searchTerm);
      const matchesDescription = experience.description
        ?.toLowerCase()
        .includes(searchTerm);
      const matchesAssets = experience.assets.some(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm) ||
          asset.text?.toLowerCase().includes(searchTerm)
      );

      if (!matchesTitle && !matchesDescription && !matchesAssets) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort experiences
 */
export function sortExperiences(
  experiences: ExperienceDto[],
  sortBy: "title" | "createdAt" | "updatedAt" | "assetCount",
  direction: "asc" | "desc" = "desc"
): ExperienceDto[] {
  return [...experiences].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case "assetCount":
        comparison = a.assets.length - b.assets.length;
        break;
    }

    return direction === "asc" ? comparison : -comparison;
  });
}

/**
 * Get asset kind label in Spanish
 */
export function getAssetKindLabel(kind: AssetKind): string {
  const labels: Record<AssetKind, string> = {
    message: "Mensaje",
    image: "Imagen",
    video: "Video",
    model3d: "Modelo 3D",
  };
  return labels[kind] || "Desconocido";
}

/**
 * Check if experience has 3D models (AR support)
 */
export function hasARSupport(experience: ExperienceDto): boolean {
  return experience.assets.some((asset) => asset.kind === "model3d");
}

/**
 * Get experience statistics
 */
export function getExperienceStats(experiences: ExperienceDto[]): {
  total: number;
  active: number;
  withAR: number;
  assetKinds: Record<AssetKind, number>;
} {
  const stats = {
    total: experiences.length,
    active: 0,
    withAR: 0,
    assetKinds: {
      message: 0,
      image: 0,
      video: 0,
      model3d: 0,
    } as Record<AssetKind, number>,
  };

  experiences.forEach((experience) => {
    if (experience.isActive) {
      stats.active++;
    }

    if (hasARSupport(experience)) {
      stats.withAR++;
    }

    experience.assets.forEach((asset) => {
      stats.assetKinds[asset.kind]++;
    });
  });

  return stats;
}

/**
 * Generate a slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[áäàâ]/g, "a")
    .replace(/[éëèê]/g, "e")
    .replace(/[íïìî]/g, "i")
    .replace(/[óöòô]/g, "o")
    .replace(/[úüùû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

export const experienceHelpers = {
  validate: validateExperience,
  filter: filterExperiences,
  sort: sortExperiences,
  getKindLabel: getAssetKindLabel,
  hasAR: hasARSupport,
  getStats: getExperienceStats,
  generateSlug,
};
