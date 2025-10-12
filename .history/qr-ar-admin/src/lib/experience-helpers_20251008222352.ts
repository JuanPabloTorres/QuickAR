/**
 * Experience Helpers - Utilidades para gestionar experiencias AR
 * Incluye validaciones, filtros, ordenamiento y funciones auxiliares
 */

import {
  ARAsset,
  ARAssetType,
  ARExperience,
  ASSET_TYPE_LABELS,
  ExperienceFilters,
  ValidationResult,
} from "@/types";

// ========================================
// VALIDACIÓN DE EXPERIENCIAS
// ========================================

/**
 * Valida los datos de una experiencia antes de crearla o actualizarla
 */
export function validateExperience(data: {
  title?: string;
  slug?: string;
  description?: string;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar título
  if (!data.title || data.title.trim().length === 0) {
    errors.push("El título es requerido");
  } else {
    if (data.title.length < 3) {
      errors.push("El título debe tener al menos 3 caracteres");
    }
    if (data.title.length > 100) {
      errors.push("El título no puede tener más de 100 caracteres");
    }
  }

  // Validar slug si se proporciona
  if (data.slug && data.slug.length > 0) {
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(data.slug)) {
      errors.push(
        "El slug solo puede contener letras minúsculas, números y guiones"
      );
    }
    if (data.slug.length > 50) {
      errors.push("El slug no puede tener más de 50 caracteres");
    }
  }

  // Validar descripción
  if (data.description && data.description.length > 500) {
    errors.push("La descripción no puede tener más de 500 caracteres");
  }

  // Generar slug automático si no se proporciona
  if (!data.slug && data.title) {
    warnings.push("Se generará un slug automático basado en el título");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida un asset antes de subirlo
 */
export function validateAsset(
  file: File,
  assetType: ARAssetType
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar tamaño de archivo (50MB máximo)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    errors.push(`El archivo es demasiado grande. Máximo permitido: 50MB`);
  }

  // Validar tipo de archivo según el tipo de asset
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  switch (assetType) {
    case "image":
      const imageFormats = ["jpg", "jpeg", "png", "webp", "gif"];
      const imageExtension = fileName.split(".").pop() || "";
      if (
        !imageFormats.includes(imageExtension) &&
        !mimeType.startsWith("image/")
      ) {
        errors.push(
          "Formato de imagen no soportado. Use: JPG, PNG, WEBP o GIF"
        );
      }
      break;

    case "video":
      const videoFormats = ["mp4", "webm", "mov", "avi"];
      const videoExtension = fileName.split(".").pop() || "";
      if (
        !videoFormats.includes(videoExtension) &&
        !mimeType.startsWith("video/")
      ) {
        errors.push("Formato de video no soportado. Use: MP4, WEBM, MOV o AVI");
      }
      break;

    case "model3d":
      const modelFormats = ["glb", "gltf"];
      const modelExtension = fileName.split(".").pop() || "";
      if (!modelFormats.includes(modelExtension)) {
        errors.push("Formato de modelo 3D no soportado. Use: GLB o GLTF");
      }
      // Advertencia para archivos GLTF (preferir GLB)
      if (modelExtension === "gltf") {
        warnings.push(
          "Se recomienda usar GLB en lugar de GLTF para mejor rendimiento"
        );
      }
      break;
  }

  // Validaciones adicionales
  if (file.size < 100) {
    // Menos de 100 bytes
    warnings.push(
      "El archivo parece muy pequeño, verifique que no esté corrupto"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ========================================
// FILTROS Y BÚSQUEDAS
// ========================================

/**
 * Filtra experiencias basado en criterios múltiples
 */
export function filterExperiences(
  experiences: ARExperience[],
  filters: ExperienceFilters
): ARExperience[] {
  return experiences.filter((experience) => {
    // Filtrar por término de búsqueda
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matchesTitle = experience.title.toLowerCase().includes(searchTerm);
      const matchesDescription = experience.description
        ?.toLowerCase()
        .includes(searchTerm);
      const matchesSlug = experience.slug.toLowerCase().includes(searchTerm);

      if (!matchesTitle && !matchesDescription && !matchesSlug) {
        return false;
      }
    }

    // Filtrar por estado activo
    if (filters.isActive !== undefined) {
      if (experience.isActive !== filters.isActive) {
        return false;
      }
    }

    // Filtrar por presencia de AR (modelos 3D)
    if (filters.hasAR !== undefined) {
      const hasAR = experience.hasAR || false;
      if (hasAR !== filters.hasAR) {
        return false;
      }
    }

    // Filtrar por tipos de assets
    if (filters.assetTypes && filters.assetTypes.length > 0) {
      const hasRequiredAssetTypes = filters.assetTypes.some((assetType) =>
        experience.assets.some((asset) => asset.type === assetType)
      );
      if (!hasRequiredAssetTypes) {
        return false;
      }
    }

    // Filtrar por rango de fechas
    if (filters.dateRange) {
      const experienceDate = experience.createdAt;
      if (
        experienceDate < filters.dateRange.start ||
        experienceDate > filters.dateRange.end
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Ordena experiencias según el campo y dirección especificados
 */
export function sortExperiences(
  experiences: ARExperience[],
  sortField: "title" | "createdAt" | "updatedAt",
  sortOrder: "asc" | "desc" = "desc"
): ARExperience[] {
  return [...experiences].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "createdAt":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case "updatedAt":
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
}

// ========================================
// UTILIDADES DE ASSETS
// ========================================

/**
 * Obtiene el asset principal de una experiencia (preferentemente modelo 3D)
 */
export function getPrimaryAsset(experience: ARExperience): ARAsset | undefined {
  // Priorizar modelos 3D
  const model3D = experience.assets.find((asset) => asset.type === "model3d");
  if (model3D) return model3D;

  // Luego imágenes
  const image = experience.assets.find((asset) => asset.type === "image");
  if (image) return image;

  // Luego videos
  const video = experience.assets.find((asset) => asset.type === "video");
  if (video) return video;

  // Finalmente texto
  const text = experience.assets.find((asset) => asset.type === "text");
  if (text) return text;

  return undefined;
}

/**
 * Obtiene assets por tipo específico
 */
export function getAssetsByType(
  experience: ARExperience,
  type: ARAssetType
): ARAsset[] {
  return experience.assets.filter((asset) => asset.type === type);
}

/**
 * Verifica si una experiencia tiene capacidades AR
 */
export function hasARCapabilities(experience: ARExperience): boolean {
  return experience.assets.some((asset) => asset.type === "model3d");
}

/**
 * Cuenta assets por tipo
 */
export function getAssetTypeCount(
  experience: ARExperience
): Record<ARAssetType, number> {
  const counts = {
    text: 0,
    image: 0,
    video: 0,
    model3d: 0,
  };

  experience.assets.forEach((asset) => {
    counts[asset.type]++;
  });

  return counts;
}

// ========================================
// GENERACIÓN DE DATOS
// ========================================

/**
 * Genera un slug automático basado en el título
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9\s-]/g, "") // Solo letras, números, espacios y guiones
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-") // Múltiples guiones a uno solo
    .replace(/^-|-$/g, ""); // Remover guiones al inicio y final
}

/**
 * Genera una URL de QR code para una experiencia
 */
export function generateQRCodeUrl(
  experienceId: string,
  baseUrl?: string
): string {
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/ar/${experienceId}`;
}

/**
 * Calcula estadísticas de una experiencia
 */
export function calculateExperienceStats(experience: ARExperience) {
  const assetCounts = getAssetTypeCount(experience);
  const totalAssets = experience.assets.length;

  return {
    totalAssets,
    assetCounts,
    hasAR: hasARCapabilities(experience),
    primaryAssetType: getPrimaryAsset(experience)?.type || null,
    createdDaysAgo: Math.floor(
      (Date.now() - experience.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    ),
    lastUpdatedDaysAgo: Math.floor(
      (Date.now() - experience.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    ),
  };
}

// ========================================
// FORMATEO Y VISUALIZACIÓN
// ========================================

/**
 * Formatea el tamaño de archivo para mostrar
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formatea una fecha de manera amigable
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Hace un momento";
  }

  if (diffInSeconds < 3600) {
    // < 1 hour
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  }

  if (diffInSeconds < 86400) {
    // < 1 day
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  }

  if (diffInSeconds < 2592000) {
    // < 30 days
    const days = Math.floor(diffInSeconds / 86400);
    return `Hace ${days} día${days !== 1 ? "s" : ""}`;
  }

  // Formato de fecha completa para fechas más antiguas
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Obtiene la etiqueta amigable para un tipo de asset
 */
export function getAssetTypeLabel(type: ARAssetType): string {
  return ASSET_TYPE_LABELS[type] || type;
}

// ========================================
// UTILIDADES DE URL Y NAVEGACIÓN
// ========================================

/**
 * Construye la URL para ver una experiencia
 */
export function getExperienceViewUrl(experience: ARExperience): string {
  return `/experiences/${experience.id}`;
}

/**
 * Construye la URL para AR de una experiencia
 */
export function getExperienceARUrl(experience: ARExperience): string {
  return `/ar/${experience.id}`;
}

/**
 * Construye la URL para editar una experiencia
 */
export function getExperienceEditUrl(experience: ARExperience): string {
  return `/experiences/${experience.id}/edit`;
}

// ========================================
// UTILIDADES DE PAGINACIÓN
// ========================================

/**
 * Pagina un array de experiencias
 */
export function paginateExperiences(
  experiences: ARExperience[],
  page: number,
  pageSize: number = 20
) {
  const totalItems = experiences.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const offset = (page - 1) * pageSize;
  const items = experiences.slice(offset, offset + pageSize);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total: totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}
