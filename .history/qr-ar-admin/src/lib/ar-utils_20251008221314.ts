/**
 * AR Utilities - Utilidades específicas para Realidad Aumentada
 * Manejo de capacidades AR, configuración de model-viewer, y detección de soporte
 */

import { ARAsset, ARCapabilities, ARState, AR3DSettings } from '@/types'

// ========================================
// DETECCIÓN DE CAPACIDADES AR
// ========================================

/**
 * Detecta si el navegador soporta WebXR
 */
export async function checkWebXRSupport(): Promise<boolean> {
  if (!navigator.xr) return false
  
  try {
    const isSupported = await navigator.xr.isSessionSupported('immersive-ar')
    return isSupported
  } catch {
    return false
  }
}

/**
 * Detecta si model-viewer está disponible
 */
export function checkModelViewerSupport(): boolean {
  return typeof window !== 'undefined' && 
         'customElements' in window && 
         customElements.get('model-viewer') !== undefined
}

/**
 * Detecta capacidades de la cámara
 */
export async function checkCameraSupport(): Promise<boolean> {
  if (!navigator.mediaDevices?.getUserMedia) return false
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch {
    return false
  }
}

/**
 * Obtiene todas las capacidades AR del dispositivo/navegador
 */
export async function getARCapabilities(): Promise<ARCapabilities> {
  const [webxr, camera] = await Promise.all([
    checkWebXRSupport(),
    checkCameraSupport()
  ])
  
  return {
    webxr,
    modelViewer: checkModelViewerSupport(),
    camera,
    worldTracking: webxr, // WebXR generalmente incluye world tracking
    planeDetection: webxr  // WebXR generalmente incluye plane detection
  }
}

// ========================================
// CONFIGURACIÓN DE MODEL-VIEWER
// ========================================

/**
 * Genera la configuración base para model-viewer según el asset
 */
export function generateModelViewerConfig(
  asset: ARAsset,
  settings?: Partial<AR3DSettings>
): Record<string, string | boolean> {
  const defaultSettings: AR3DSettings = {
    enableInteraction: true,
    enableZoom: true,
    enablePan: true,
    enableRotate: true,
    autoRotate: false,
    scale: 1,
    backgroundColor: '#ffffff00' // Transparente
  }
  
  const finalSettings = { ...defaultSettings, ...settings }
  
  const config: Record<string, string | boolean> = {
    // URLs y recursos
    'src': asset.url || '',
    
    // Controles básicos
    'camera-controls': finalSettings.enableInteraction,
    'touch-action': 'pan-y',
    
    // AR específico
    'ar': true,
    'ar-modes': 'webxr scene-viewer quick-look',
    'ar-scale': 'auto',
    
    // Iluminación y ambiente
    'environment-image': 'neutral',
    'shadow-intensity': '0.3',
    'tone-mapping': 'neutral',
    
    // Comportamiento
    'auto-rotate': finalSettings.autoRotate,
    'auto-rotate-delay': '3000',
    'rotation-per-second': '30deg',
    
    // Carga
    'loading': 'eager',
    'reveal': 'auto'
  }
  
  // Configuraciones condicionales
  if (!finalSettings.enableZoom) {
    config['disable-zoom'] = true
  }
  
  if (!finalSettings.enablePan) {
    config['disable-pan'] = true
  }
  
  if (!finalSettings.enableRotate) {
    config['disable-tap'] = true
  }
  
  return config
}

/**
 * Genera atributos HTML para model-viewer
 */
export function generateModelViewerAttributes(
  asset: ARAsset,
  settings?: Partial<AR3DSettings>
): string {
  const config = generateModelViewerConfig(asset, settings)
  
  return Object.entries(config)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? key : ''
      }
      return `${key}="${value}"`
    })
    .filter(attr => attr.length > 0)
    .join(' ')
}

// ========================================
// GESTIÓN DE ESTADO AR
// ========================================

/**
 * Crea un estado AR inicial
 */
export function createInitialARState(): ARState {
  return {
    isSupported: false,
    isActive: false,
    isLoading: false,
    error: undefined,
    sessionId: undefined
  }
}

/**
 * Actualiza el estado AR
 */
export function updateARState(
  currentState: ARState,
  updates: Partial<ARState>
): ARState {
  return {
    ...currentState,
    ...updates
  }
}

// ========================================
// MANEJO DE EVENTOS AR
// ========================================

export interface AREventListeners {
  onLoad?: () => void
  onError?: (error: string) => void
  onARStart?: () => void
  onAREnd?: () => void
  onModelReady?: () => void
  onProgress?: (progress: number) => void
}

/**
 * Configura event listeners para model-viewer
 */
export function setupAREventListeners(
  element: HTMLElement & { 
    addEventListener: (type: string, listener: EventListener) => void 
  },
  listeners: AREventListeners
) {
  // Evento de carga del modelo
  if (listeners.onLoad) {
    element.addEventListener('load', listeners.onLoad)
  }
  
  // Evento de error
  if (listeners.onError) {
    element.addEventListener('error', (event: any) => {
      const errorMessage = event.detail?.error?.message || 'Error desconocido en AR'
      listeners.onError!(errorMessage)
    })
  }
  
  // Evento cuando el modelo está listo
  if (listeners.onModelReady) {
    element.addEventListener('model-visibility', (event: any) => {
      if (event.detail.visible) {
        listeners.onModelReady!()
      }
    })
  }
  
  // Eventos de sesión AR
  if (listeners.onARStart) {
    element.addEventListener('ar-status', (event: any) => {
      if (event.detail.status === 'session-started') {
        listeners.onARStart!()
      }
    })
  }
  
  if (listeners.onAREnd) {
    element.addEventListener('ar-status', (event: any) => {
      if (event.detail.status === 'not-presenting') {
        listeners.onAREnd!()
      }
    })
  }
  
  // Evento de progreso de carga
  if (listeners.onProgress) {
    element.addEventListener('progress', (event: any) => {
      const progress = event.detail?.totalProgress || 0
      listeners.onProgress!(progress * 100)
    })
  }
}

// ========================================
// UTILIDADES DE VALIDACIÓN AR
// ========================================

/**
 * Valida si un asset es compatible con AR
 */
export function validateARAsset(asset: ARAsset): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Solo modelos 3D pueden ser usados en AR
  if (asset.type !== 'model3d') {
    errors.push('Solo los modelos 3D pueden ser visualizados en AR')
    return { isValid: false, errors, warnings }
  }
  
  // Verificar URL del asset
  if (!asset.url) {
    errors.push('El modelo 3D no tiene una URL válida')
  }
  
  // Verificar formato de archivo
  if (asset.url) {
    const extension = asset.url.toLowerCase().split('.').pop()
    if (!['glb', 'gltf'].includes(extension || '')) {
      errors.push('El modelo debe estar en formato GLB o GLTF')
    }
    
    if (extension === 'gltf') {
      warnings.push('Se recomienda GLB para mejor rendimiento en AR')
    }
  }
  
  // Verificar tamaño de archivo
  if (asset.fileSizeBytes) {
    const sizeMB = asset.fileSizeBytes / (1024 * 1024)
    if (sizeMB > 10) {
      warnings.push(`El archivo es grande (${sizeMB.toFixed(1)}MB). Puede afectar el rendimiento`)
    }
    
    if (sizeMB > 50) {
      errors.push('El archivo es demasiado grande (>50MB) para AR móvil')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ========================================
// UTILIDADES DE RENDIMIENTO
// ========================================

/**
 * Optimiza la configuración AR según el dispositivo
 */
export function optimizeARSettings(
  baseSettings: AR3DSettings,
  capabilities: ARCapabilities
): AR3DSettings {
  const optimized = { ...baseSettings }
  
  // Si no hay soporte WebXR, deshabilitar algunas características
  if (!capabilities.webxr) {
    optimized.autoRotate = false
    optimized.enableInteraction = true // Mantener interacción básica
  }
  
  // En dispositivos con menor capacidad, simplificar
  const isLowEnd = !capabilities.worldTracking || !capabilities.planeDetection
  if (isLowEnd) {
    optimized.enableZoom = false
    optimized.enablePan = false
    optimized.scale = 0.8 // Modelo más pequeño para mejor rendimiento
  }
  
  return optimized
}

/**
 * Calcula estadísticas de rendimiento para un asset AR
 */
export function calculateARPerformanceScore(asset: ARAsset): {
  score: number // 0-100
  factors: string[]
  recommendations: string[]
} {
  let score = 100
  const factors: string[] = []
  const recommendations: string[] = []
  
  // Penalizar por tamaño de archivo
  if (asset.fileSizeBytes) {
    const sizeMB = asset.fileSizeBytes / (1024 * 1024)
    if (sizeMB > 5) {
      const penalty = Math.min(30, (sizeMB - 5) * 5)
      score -= penalty
      factors.push(`Archivo grande: ${sizeMB.toFixed(1)}MB`)
      recommendations.push('Considera comprimir el modelo o reducir la geometría')
    }
  }
  
  // Bonificar por formato GLB
  if (asset.url?.toLowerCase().endsWith('.glb')) {
    factors.push('Formato GLB optimizado')
  } else if (asset.url?.toLowerCase().endsWith('.gltf')) {
    score -= 10
    factors.push('Formato GLTF menos eficiente')
    recommendations.push('Convierte a GLB para mejor rendimiento')
  }
  
  // Penalizar si no hay información de tamaño
  if (!asset.fileSizeBytes) {
    score -= 5
    factors.push('Sin información de tamaño')
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    factors,
    recommendations
  }
}

// ========================================
// UTILIDADES DE DEBUG Y DESARROLLO
// ========================================

/**
 * Registra información de debug para AR
 */
export function logARDebugInfo(asset: ARAsset, capabilities: ARCapabilities) {
  if (process.env.NODE_ENV !== 'development') return
  
  console.group('🔍 AR Debug Info')
  console.log('Asset:', asset)
  console.log('Capabilities:', capabilities)
  console.log('Performance:', calculateARPerformanceScore(asset))
  console.log('Validation:', validateARAsset(asset))
  console.groupEnd()
}

/**
 * Obtiene información técnica del dispositivo para AR
 */
export function getDeviceARInfo() {
  if (typeof window === 'undefined') return null
  
  return {
    userAgent: navigator.userAgent,
    webxrSupported: !!navigator.xr,
    webglSupported: !!window.WebGLRenderingContext,
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    platform: navigator.platform,
    mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
}