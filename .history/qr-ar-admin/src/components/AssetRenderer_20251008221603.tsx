/**
 * AssetRenderer - Componente para renderizar diferentes tipos de assets AR
 * Maneja modelos 3D, imágenes, videos y texto con soporte AR completo
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ARAsset, AR3DSettings } from '@/types'
import { 
  generateModelViewerAttributes, 
  setupAREventListeners, 
  validateARAsset,
  type AREventListeners 
} from '@/lib/ar-utils'
import { cn } from '@/lib/utils'

interface AssetRendererProps {
  asset: ARAsset
  settings?: Partial<AR3DSettings>
  className?: string
  enableAR?: boolean
  autoLoad?: boolean
  showControls?: boolean
  onLoad?: () => void
  onError?: (error: string) => void
  onARStart?: () => void
  onAREnd?: () => void
  onProgress?: (progress: number) => void
}

/**
 * Renderiza diferentes tipos de assets con soporte AR
 */
export function AssetRenderer({
  asset,
  settings,
  className,
  enableAR = true,
  autoLoad = true,
  showControls = true,
  onLoad,
  onError,
  onARStart,
  onAREnd,
  onProgress
}: AssetRendererProps) {
  const [isLoading, setIsLoading] = useState(autoLoad)
  const [hasError, setHasError] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isARActive, setIsARActive] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const modelViewerRef = useRef<HTMLElement>(null)

  // Validación del asset
  const validation = validateARAsset(asset)

  // Configurar event listeners para model-viewer
  const setupEventListeners = useCallback(() => {
    if (!modelViewerRef.current || asset.type !== 'model3d') return

    const listeners: AREventListeners = {
      onLoad: () => {
        setIsLoading(false)
        setHasError(false)
        onLoad?.()
      },
      onError: (error) => {
        setIsLoading(false)
        setHasError(true)
        onError?.(error)
      },
      onARStart: () => {
        setIsARActive(true)
        onARStart?.()
      },
      onAREnd: () => {
        setIsARActive(false)
        onAREnd?.()
      },
      onProgress: (progress) => {
        setLoadProgress(progress)
        onProgress?.(progress)
      }
    }

    setupAREventListeners(modelViewerRef.current, listeners)
  }, [asset.type, onLoad, onError, onARStart, onAREnd, onProgress])

  // Efectos
  useEffect(() => {
    setupEventListeners()
  }, [setupEventListeners])

  useEffect(() => {
    if (autoLoad) {
      setIsLoading(true)
      setHasError(false)
      setLoadProgress(0)
    }
  }, [asset.id, autoLoad])

  // Renderizado condicional por tipo de asset
  const renderAsset = () => {
    switch (asset.type) {
      case 'model3d':
        return renderModel3D()
      case 'image':
        return renderImage()
      case 'video':
        return renderVideo()
      case 'text':
        return renderText()
      default:
        return renderUnsupported()
    }
  }

  // Renderizar modelo 3D con model-viewer
  const renderModel3D = () => {
    if (!validation.isValid) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-red-500 mb-2">⚠️ Modelo no válido</div>
          <div className="text-sm text-gray-600 text-center">
            {validation.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        </div>
      )
    }

    if (!asset.url) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-gray-500">No hay modelo para mostrar</div>
        </div>
      )
    }

    const modelViewerAttributes = generateModelViewerAttributes(asset, settings)

    return (
      <div className="relative w-full h-64 md:h-96">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-lg z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <div className="text-sm text-gray-600">Cargando modelo...</div>
            {loadProgress > 0 && (
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${loadProgress}%` } as React.CSSProperties}
                ></div>
              </div>
            )}
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 rounded-lg z-10">
            <div className="text-red-500 mb-2">❌ Error al cargar</div>
            <div className="text-sm text-gray-600 text-center">
              No se pudo cargar el modelo 3D
            </div>
          </div>
        )}

        <model-viewer
          ref={modelViewerRef}
          {...(Object.fromEntries(
            Object.entries(generateModelViewerAttributes(asset, {
              ...settings,
              enableInteraction: showControls && (settings?.enableInteraction ?? true)
            }))
              .filter(([_, value]) => value !== false)
              .map(([key, value]) => [key, typeof value === 'boolean' ? '' : value])
          ))}
          className={cn(
            "w-full h-full rounded-lg",
            !enableAR && "[&::part(default-ar-button)]:hidden",
            className
          )}
        >
          {/* Slot para botón AR personalizado */}
          {enableAR && showControls && (
            <button 
              slot="ar-button" 
              className={cn(
                "absolute bottom-4 right-4",
                "bg-blue-600 hover:bg-blue-700 text-white",
                "px-4 py-2 rounded-lg font-medium",
                "transition-colors duration-200",
                "shadow-lg",
                isARActive && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isARActive ? '📱 En AR' : '📱 Ver en AR'}
            </button>
          )}
          
          {/* Slot para progreso de carga */}
          <div slot="progress-bar" className="progress-bar">
            <div className="update-bar"></div>
          </div>
        </model-viewer>

        {/* Advertencias de validación */}
        {validation.warnings.length > 0 && showControls && (
          <div className="absolute top-2 left-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-2 py-1 rounded text-xs max-w-xs">
            {validation.warnings[0]}
          </div>
        )}
      </div>
    )
  }

  // Renderizar imagen
  const renderImage = () => {
    if (!asset.url) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-gray-500">No hay imagen para mostrar</div>
        </div>
      )
    }

    return (
      <div className="relative w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
            <div className="animate-pulse bg-gray-300 w-full h-64 rounded-lg"></div>
          </div>
        )}
        
        <img
          src={asset.url}
          alt={asset.name}
          className={cn(
            "w-full h-auto max-h-96 object-contain rounded-lg",
            "transition-opacity duration-300",
            isLoading && "opacity-0",
            className
          )}
          onLoad={() => {
            setIsLoading(false)
            onLoad?.()
          }}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
            onError?.('Error al cargar la imagen')
          }}
        />
        
        {hasError && (
          <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg">
            <div className="text-red-500 mb-2">🖼️ Error al cargar imagen</div>
            <div className="text-sm text-gray-600">Verifica la URL de la imagen</div>
          </div>
        )}
      </div>
    )
  }

  // Renderizar video
  const renderVideo = () => {
    if (!asset.url) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-gray-500">No hay video para mostrar</div>
        </div>
      )
    }

    return (
      <div className="relative w-full">
        <video
          src={asset.url}
          controls={showControls}
          preload={autoLoad ? "metadata" : "none"}
          className={cn(
            "w-full h-auto max-h-96 rounded-lg",
            className
          )}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => {
            setIsLoading(false)
            onLoad?.()
          }}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
            onError?.('Error al cargar el video')
          }}
        >
          Tu navegador no soporta el elemento video.
        </video>
        
        {hasError && (
          <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg">
            <div className="text-red-500 mb-2">📹 Error al cargar video</div>
            <div className="text-sm text-gray-600">Verifica la URL del video</div>
          </div>
        )}
      </div>
    )
  }

  // Renderizar texto
  const renderText = () => {
    if (!asset.content) {
      return (
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
          <div className="text-gray-500">No hay contenido de texto</div>
        </div>
      )
    }

    return (
      <div className={cn(
        "p-6 bg-white rounded-lg shadow-sm border",
        "prose prose-gray max-w-none",
        className
      )}>
        <div className="whitespace-pre-wrap text-gray-800">
          {asset.content}
        </div>
      </div>
    )
  }

  // Renderizar tipo no soportado
  const renderUnsupported = () => (
    <div className="flex flex-col items-center justify-center h-32 bg-gray-100 rounded-lg">
      <div className="text-gray-500 mb-2">❓ Tipo no soportado</div>
      <div className="text-sm text-gray-400">Tipo: {asset.type}</div>
    </div>
  )

  return (
    <div ref={containerRef} className="relative">
      {renderAsset()}
    </div>
  )
}

// Componente especializado para vista previa rápida
export function AssetPreview({ 
  asset, 
  size = 'md',
  className 
}: { 
  asset: ARAsset
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24', 
    lg: 'h-32 w-32'
  }

  return (
    <div className={cn(
      "flex items-center justify-center bg-gray-100 rounded-lg border overflow-hidden",
      sizeClasses[size],
      className
    )}>
      {asset.type === 'image' && asset.url ? (
        <img 
          src={asset.url} 
          alt={asset.name}
          className="w-full h-full object-cover"
        />
      ) : asset.type === 'model3d' ? (
        <div className="text-2xl">🎯</div>
      ) : asset.type === 'video' ? (
        <div className="text-2xl">📹</div>
      ) : asset.type === 'text' ? (
        <div className="text-2xl">📝</div>
      ) : (
        <div className="text-lg text-gray-400">?</div>
      )}
    </div>
  )
}