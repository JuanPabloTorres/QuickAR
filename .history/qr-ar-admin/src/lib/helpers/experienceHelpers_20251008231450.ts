/**
 * Quick AR - Helpers para Experiencias
 * 
 * Funciones utilitarias para manejar experiencias AR, validaciones,
 * filtros y transformaciones de datos
 */

import {
  ARExperience,
  ARAsset,
  ARAssetType,
  ExperienceFilters,
  LoadingState,
} from '@/lib/types';

// =============================================================================
// VALIDACIONES
// =============================================================================

/**
 * Valida que un título de experiencia sea válido
 */
export function validateExperienceTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return 'El título es requerido';
  }
  
  if (title.trim().length < 3) {
    return 'El título debe tener al menos 3 caracteres';
  }
  
  if (title.trim().length > 100) {
    return 'El título no puede superar los 100 caracteres';
  }
  
  return null;
}

/**
 * Valida que un slug sea válido
 */
export function validateExperienceSlug(slug: string): string | null {
  if (!slug || slug.trim().length === 0) {
    return 'El slug es requerido';
  }
  
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(slug)) {
    return 'El slug solo puede contener letras minúsculas, números y guiones';
  }
  
  if (slug.length < 3) {
    return 'El slug debe tener al menos 3 caracteres';
  }
  
  if (slug.length > 50) {
    return 'El slug no puede superar los 50 caracteres';
  }
  
  return null;
}

/**
 * Valida una descripción de experiencia
 */
export function validateExperienceDescription(description?: string): string | null {
  if (description && description.trim().length > 500) {
    return 'La descripción no puede superar los 500 caracteres';
  }
  
  return null;
}

/**
 * Valida un asset AR
 */
export function validateARAsset(asset: Partial<ARAsset>): string[] {
  const errors: string[] = [];
  
  if (!asset.name || asset.name.trim().length === 0) {
    errors.push('El nombre del asset es requerido');
  }
  
  if (!asset.type) {
    errors.push('El tipo de asset es requerido');
  }
  
  if (asset.type === 'text' && (!asset.content || asset.content.trim().length === 0)) {
    errors.push('El contenido de texto es requerido para assets de texto');
  }
  
  if (asset.type !== 'text' && (!asset.url || asset.url.trim().length === 0)) {
    errors.push('La URL es requerida para este tipo de asset');
  }
  
  if (asset.url && !isValidUrl(asset.url)) {
    errors.push('La URL proporcionada no es válida');
  }
  
  return errors;
}

/**
 * Valida una URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// FILTROS Y BÚSQUEDAS
// =============================================================================

/**
 * Filtra experiencias basado en criterios
 */
export function filterExperiences(
  experiences: ARExperience[],
  filters: ExperienceFilters
): ARExperience[] {
  return experiences.filter(experience => {
    // Filtro por búsqueda de texto
    if (filters.search && filters.search.trim().length > 0) {
      const searchTerm = filters.search.toLowerCase().trim();
      const matchesTitle = experience.title.toLowerCase().includes(searchTerm);
      const matchesDescription = experience.description?.toLowerCase().includes(searchTerm) ?? false;
      const matchesSlug = experience.slug.toLowerCase().includes(searchTerm);
      
      if (!matchesTitle && !matchesDescription && !matchesSlug) {
        return false;
      }
    }
    
    // Filtro por estado activo
    if (filters.isActive !== undefined && experience.isActive !== filters.isActive) {
      return false;
    }
    
    // Filtro por experiencias con AR
    if (filters.hasAR !== undefined && experience.hasAR !== filters.hasAR) {
      return false;
    }
    
    // Filtro por tipo de asset
    if (filters.assetType) {
      const hasAssetType = experience.assets.some(asset => asset.type === filters.assetType);
      if (!hasAssetType) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Ordena experiencias por diferentes criterios
 */
export function sortExperiences(
  experiences: ARExperience[],
  sortBy: 'title' | 'createdAt' | 'updatedAt' | 'assetsCount',
  order: 'asc' | 'desc' = 'desc'
): ARExperience[] {
  const multiplier = order === 'asc' ? 1 : -1;
  
  return [...experiences].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title) * multiplier;
        
      case 'createdAt':
        return (a.createdAt.getTime() - b.createdAt.getTime()) * multiplier;
        
      case 'updatedAt':
        return (a.updatedAt.getTime() - b.updatedAt.getTime()) * multiplier;
        
      case 'assetsCount':
        return (a.assets.length - b.assets.length) * multiplier;
        
      default:
        return 0;
    }
  });
}

/**
 * Pagina un array de experiencias
 */
export function paginateExperiences(
  experiences: ARExperience[],
  page: number,
  pageSize: number = 12
): {
  items: ARExperience[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
    pageSize: number;
  };
} {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = experiences.slice(startIndex, endIndex);
  const totalPages = Math.ceil(experiences.length / pageSize);
  
  return {
    items,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: experiences.length,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      pageSize,
    },
  };
}

// =============================================================================
// UTILIDADES AR
// =============================================================================

/**
 * Determina si una experiencia es válida para AR
 */
export function isValidARExperience(experience: ARExperience): boolean {
  return experience.assets.length > 0 && experience.isActive;
}

/**
 * Obtiene el asset principal de una experiencia
 */
export function getPrimaryAsset(experience: ARExperience): ARAsset | null {
  // Priorizar modelos 3D
  const model3D = experience.assets.find(asset => asset.type === 'model3d');
  if (model3D) return model3D;
  
  // Luego imágenes
  const image = experience.assets.find(asset => asset.type === 'image');
  if (image) return image;
  
  // Luego videos
  const video = experience.assets.find(asset => asset.type === 'video');
  if (video) return video;
  
  // Finalmente texto
  const text = experience.assets.find(asset => asset.type === 'text');
  if (text) return text;
  
  return null;
}

/**
 * Calcula estadísticas de una experiencia
 */
export function calculateExperienceStats(experience: ARExperience) {
  const assetsByType = experience.assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {} as Record<ARAssetType, number>);
  
  return {
    totalAssets: experience.assets.length,
    assetsByType,
    hasAR: experience.hasAR,
    isActive: experience.isActive,
    createdDaysAgo: Math.floor((Date.now() - experience.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    lastUpdatedDaysAgo: Math.floor((Date.now() - experience.updatedAt.getTime()) / (1000 * 60 * 60 * 24)),
  };
}

// =============================================================================
// FORMATEO Y PRESENTACIÓN
// =============================================================================

/**
 * Formatea un tamaño de archivo en bytes a formato legible
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Formatea una fecha relativa (ej: "hace 2 días")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      return diffInMinutes <= 1 ? 'Ahora' : `Hace ${diffInMinutes} minutos`;
    }
    return diffInHours === 1 ? 'Hace 1 hora' : `Hace ${diffInHours} horas`;
  }
  
  if (diffInDays === 1) return 'Ayer';
  if (diffInDays <= 7) return `Hace ${diffInDays} días`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) return 'Hace 1 semana';
  if (diffInWeeks <= 4) return `Hace ${diffInWeeks} semanas`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) return 'Hace 1 mes';
  if (diffInMonths <= 12) return `Hace ${diffInMonths} meses`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? 'Hace 1 año' : `Hace ${diffInYears} años`;
}

/**
 * Genera un slug a partir de un título
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Combinar múltiples guiones
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
}

/**
 * Genera una URL de QR code para una experiencia
 */
export function generateQRCodeUrl(experienceId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/ar/${experienceId}`;
}

// =============================================================================
// UTILIDADES DE ESTADO
// =============================================================================

/**
 * Combina múltiples estados de carga
 */
export function combineLoadingStates(...states: LoadingState[]): LoadingState {
  if (states.some(state => state === 'error')) return 'error';
  if (states.some(state => state === 'loading')) return 'loading';
  if (states.every(state => state === 'success')) return 'success';
  return 'idle';
}

/**
 * Debounce para optimizar búsquedas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}