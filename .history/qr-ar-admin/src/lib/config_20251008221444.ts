/**
 * App Configuration - Configuración global de la aplicación
 * Constantes, configuraciones de entorno y valores por defecto
 */

// ========================================
// CONFIGURACIÓN DE LA API
// ========================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5002',
  TIMEOUT: 10000,
  RETRIES: 3,
  ENDPOINTS: {
    EXPERIENCES: '/api/experiences',
    FILE_UPLOAD: '/api/fileupload',
    ANALYTICS: '/api/analytics',
    HEALTH: '/api/health'
  }
} as const

// ========================================
// CONFIGURACIÓN DE ARCHIVOS
// ========================================

export const FILE_CONFIG = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FORMATS: {
    IMAGE: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    VIDEO: ['mp4', 'webm', 'mov', 'avi'],
    MODEL_3D: ['glb', 'gltf'],
    AUDIO: ['mp3', 'wav', 'ogg']
  },
  MIME_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    VIDEO: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    MODEL_3D: ['model/gltf+json', 'model/gltf-binary'],
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg']
  }
} as const

// ========================================
// CONFIGURACIÓN DE AR
// ========================================

export const AR_CONFIG = {
  DEFAULT_SETTINGS: {
    enableInteraction: true,
    enableZoom: true,
    enablePan: true,
    enableRotate: true,
    autoRotate: false,
    scale: 1,
    backgroundColor: '#ffffff00'
  },
  MODEL_VIEWER: {
    DEFAULT_ENVIRONMENT: 'neutral',
    SHADOW_INTENSITY: '0.3',
    TONE_MAPPING: 'neutral',
    AUTO_ROTATE_DELAY: 3000,
    ROTATION_SPEED: '30deg'
  },
  AR_MODES: 'webxr scene-viewer quick-look',
  SESSION_TIMEOUT: 30000 // 30 segundos
} as const

// ========================================
// CONFIGURACIÓN DE UI
// ========================================

export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
  },
  GRID: {
    BREAKPOINTS: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4
    }
  },
  ANIMATIONS: {
    DURATION: 200,
    EASING: 'ease-in-out'
  },
  DEBOUNCE: {
    SEARCH: 300,
    RESIZE: 150,
    INPUT: 500
  },
  LOADING: {
    MIN_DISPLAY_TIME: 500,
    SKELETON_COUNT: 6
  }
} as const

// ========================================
// CONFIGURACIÓN DE QR
// ========================================

export const QR_CONFIG = {
  SIZE: 200,
  ERROR_CORRECTION: 'M' as const,
  MARGIN: 4,
  COLOR: {
    DARK: '#000000',
    LIGHT: '#FFFFFF'
  },
  FORMAT: 'PNG' as const
} as const

// ========================================
// CONFIGURACIÓN DE ANALYTICS
// ========================================

export const ANALYTICS_CONFIG = {
  EVENTS: {
    EXPERIENCE_VIEW: 'experience_view',
    EXPERIENCE_AR_START: 'experience_ar_start',
    EXPERIENCE_AR_END: 'experience_ar_end',
    ASSET_LOAD: 'asset_load',
    ASSET_ERROR: 'asset_error',
    USER_INTERACTION: 'user_interaction'
  },
  BATCH_SIZE: 10,
  FLUSH_INTERVAL: 30000 // 30 segundos
} as const

// ========================================
// CONFIGURACIÓN DE VALIDACIÓN
// ========================================

export const VALIDATION_CONFIG = {
  EXPERIENCE: {
    TITLE: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 100
    },
    DESCRIPTION: {
      MAX_LENGTH: 500
    },
    SLUG: {
      MAX_LENGTH: 50,
      PATTERN: /^[a-z0-9-]+$/
    }
  },
  ASSET: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 255
    }
  }
} as const

// ========================================
// CONFIGURACIÓN DE PERFORMANCE
// ========================================

export const PERFORMANCE_CONFIG = {
  ASSET_LOADING: {
    CONCURRENT_LIMIT: 3,
    RETRY_ATTEMPTS: 2,
    TIMEOUT: 15000
  },
  IMAGE_OPTIMIZATION: {
    QUALITY: 85,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080
  },
  MODEL_3D: {
    WARNING_SIZE_MB: 10,
    MAX_SIZE_MB: 50,
    PREFERRED_FORMAT: 'glb'
  }
} as const

// ========================================
// CONFIGURACIÓN DE RUTAS
// ========================================

export const ROUTES = {
  HOME: '/',
  EXPERIENCES: '/experiences',
  EXPERIENCE_DETAIL: '/experiences/[id]',
  EXPERIENCE_EDIT: '/experiences/[id]/edit',
  EXPERIENCE_CREATE: '/experiences/create',
  AR_VIEW: '/ar/[id]',
  SETTINGS: '/configuraciones',
  DOCUMENTATION: '/documentacion'
} as const

// ========================================
// MENSAJES Y TEXTOS
// ========================================

export const MESSAGES = {
  ERRORS: {
    GENERIC: 'Ha ocurrido un error inesperado',
    NETWORK: 'Error de conexión. Verifica tu conexión a internet',
    NOT_FOUND: 'El recurso solicitado no fue encontrado',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
    FILE_TOO_LARGE: 'El archivo es demasiado grande',
    INVALID_FILE_TYPE: 'Tipo de archivo no soportado',
    UPLOAD_FAILED: 'Error al subir el archivo',
    VALIDATION_FAILED: 'Los datos proporcionados no son válidos',
    AR_NOT_SUPPORTED: 'AR no está soportado en este dispositivo/navegador'
  },
  SUCCESS: {
    EXPERIENCE_CREATED: 'Experiencia creada exitosamente',
    EXPERIENCE_UPDATED: 'Experiencia actualizada exitosamente',
    EXPERIENCE_DELETED: 'Experiencia eliminada exitosamente',
    FILE_UPLOADED: 'Archivo subido exitosamente',
    SETTINGS_SAVED: 'Configuración guardada exitosamente'
  },
  LOADING: {
    EXPERIENCES: 'Cargando experiencias...',
    ASSETS: 'Cargando recursos...',
    UPLOADING: 'Subiendo archivo...',
    SAVING: 'Guardando...',
    AR_INITIALIZING: 'Iniciando AR...',
    MODEL_LOADING: 'Cargando modelo 3D...'
  },
  EMPTY_STATES: {
    NO_EXPERIENCES: 'No hay experiencias disponibles',
    NO_ASSETS: 'No hay recursos en esta experiencia',
    NO_RESULTS: 'No se encontraron resultados',
    NO_AR_MODELS: 'No hay modelos 3D para AR'
  }
} as const

// ========================================
// CONFIGURACIÓN DE TEMA
// ========================================

export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#3b82f6',
    SECONDARY: '#64748b',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#06b6d4'
  },
  SHADOWS: {
    SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  },
  BORDER_RADIUS: {
    SM: '0.125rem',
    DEFAULT: '0.375rem',
    MD: '0.5rem',
    LG: '0.75rem',
    XL: '1rem'
  }
} as const

// ========================================
// CONFIGURACIÓN DE DESARROLLO
// ========================================

export const DEV_CONFIG = {
  ENABLE_LOGS: process.env.NODE_ENV === 'development',
  MOCK_API: process.env.NEXT_PUBLIC_MOCK_API === 'true',
  SHOW_DEBUG_INFO: process.env.NEXT_PUBLIC_DEBUG === 'true',
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'development'
} as const

// ========================================
// CONFIGURACIÓN DE FEATURES
// ========================================

export const FEATURES = {
  AR_SUPPORT: true,
  ANALYTICS: true,
  FILE_UPLOAD: true,
  BULK_OPERATIONS: true,
  ADVANCED_FILTERS: true,
  EXPORT_IMPORT: false, // Feature flag para futuras funcionalidades
  COLLABORATION: false, // Feature flag para futuras funcionalidades
  REAL_TIME_UPDATES: false // Feature flag para futuras funcionalidades
} as const

// ========================================
// CONFIGURACIÓN DE META TAGS
// ========================================

export const SEO_CONFIG = {
  DEFAULT_TITLE: 'Quick AR - Plataforma de Experiencias AR',
  DEFAULT_DESCRIPTION: 'Crea y gestiona experiencias de Realidad Aumentada de forma fácil y profesional',
  DEFAULT_KEYWORDS: 'AR, Realidad Aumentada, 3D, Experiencias, WebXR, model-viewer',
  SITE_NAME: 'Quick AR',
  TWITTER_HANDLE: '@quickar',
  OG_IMAGE: '/images/og-image.jpg'
} as const

// ========================================
// UTILIDADES DE CONFIGURACIÓN
// ========================================

/**
 * Obtiene la configuración del entorno actual
 */
export function getEnvironmentConfig() {
  return {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    apiUrl: API_CONFIG.BASE_URL,
    enableMocking: DEV_CONFIG.MOCK_API,
    enableDebug: DEV_CONFIG.SHOW_DEBUG_INFO
  }
}

/**
 * Verifica si una feature está habilitada
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature]
}

/**
 * Obtiene la configuración de un asset según su tipo
 */
export function getAssetConfig(type: 'image' | 'video' | 'model3d' | 'audio') {
  return {
    maxSize: FILE_CONFIG.MAX_SIZE,
    supportedFormats: FILE_CONFIG.SUPPORTED_FORMATS[type.toUpperCase() as keyof typeof FILE_CONFIG.SUPPORTED_FORMATS],
    supportedMimeTypes: FILE_CONFIG.MIME_TYPES[type.toUpperCase() as keyof typeof FILE_CONFIG.MIME_TYPES]
  }
}

// Exportar configuración completa para debugging
export const APP_CONFIG = {
  API: API_CONFIG,
  FILE: FILE_CONFIG,
  AR: AR_CONFIG,
  UI: UI_CONFIG,
  QR: QR_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  ROUTES,
  MESSAGES,
  THEME: THEME_CONFIG,
  DEV: DEV_CONFIG,
  FEATURES,
  SEO: SEO_CONFIG
} as const