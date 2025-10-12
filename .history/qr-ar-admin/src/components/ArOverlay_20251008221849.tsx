/**
 * ArOverlay - Componente de overlay para experiencias AR
 * Proporciona información contextual y controles durante la sesión AR
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { ARExperience, ARAsset } from '@/types'
import { useAR, useARSession } from './ArClient'
import { formatFileSize, cn } from '@/lib/utils'
import { calculateARPerformanceScore } from '@/lib/ar-utils'

interface ArOverlayProps {
  experience: ARExperience
  asset?: ARAsset
  position?: 'top' | 'bottom' | 'floating'
  showPerformanceInfo?: boolean
  showInstructions?: boolean
  showStats?: boolean
  onClose?: () => void
  className?: string
}

/**
 * Overlay que se muestra durante las experiencias AR
 */
export function ArOverlay({
  experience,
  asset,
  position = 'bottom',
  showPerformanceInfo = false,
  showInstructions = true,
  showStats = false,
  onClose,
  className
}: ArOverlayProps) {
  const { state, activeAsset, capabilities } = useAR()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [sessionStartTime] = useState(Date.now())
  const [sessionDuration, setSessionDuration] = useState(0)
  
  const timerRef = useRef<NodeJS.Timeout>()

  // Actualizar duración de la sesión
  useEffect(() => {
    if (state.isActive) {
      timerRef.current = setInterval(() => {
        setSessionDuration(Date.now() - sessionStartTime)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [state.isActive, sessionStartTime])

  // Formatear duración
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return minutes > 0 ? `${minutes}:${(seconds % 60).toString().padStart(2, '0')}` : `${seconds}s`
  }

  // Performance score si hay un asset
  const performanceScore = asset ? calculateARPerformanceScore(asset) : null

  if (!state.isActive && position !== 'floating') {
    return null
  }

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    floating: 'top-4 right-4 max-w-sm'
  }

  return (
    <>
      {/* Overlay principal */}
      <div className={cn(
        'fixed z-50 bg-white/95 backdrop-blur-sm border shadow-lg',
        position === 'floating' ? 'rounded-lg' : 'rounded-t-lg',
        positionClasses[position],
        className
      )}>
        {/* Header */}
        <div className="px-4 py-3 border-b bg-gray-50/80">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {experience.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {state.isActive && (
                  <>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>AR Activo</span>
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>{formatDuration(sessionDuration)}</span>
                {activeAsset && (
                  <>
                    <span>•</span>
                    <span className="truncate">{activeAsset.name}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {position !== 'floating' && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                  title={isExpanded ? "Contraer" : "Expandir"}
                >
                  {isExpanded ? '🔽' : '🔼'}
                </button>
              )}
              
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                title="Ayuda"
              >
                ❓
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Cerrar"
                >
                  ❌
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido expandible */}
        {(isExpanded || position === 'floating') && (
          <div className="px-4 py-3 space-y-3">
            {/* Instrucciones AR */}
            {showInstructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  📱 Cómo usar AR
                </div>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Mueve lentamente tu dispositivo para encontrar una superficie</li>
                  <li>• Toca para colocar el objeto en el mundo real</li>
                  <li>• Pellizca para cambiar el tamaño del modelo</li>
                  <li>• Arrastra para rotar y reposicionar</li>
                </ul>
              </div>
            )}

            {/* Información de assets */}
            {activeAsset && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  🎯 Modelo actual
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Nombre:</span>
                    <span className="font-medium">{activeAsset.name}</span>
                  </div>
                  {activeAsset.fileSizeBytes && (
                    <div className="flex justify-between">
                      <span>Tamaño:</span>
                      <span>{formatFileSize(activeAsset.fileSizeBytes)}</span>
                    </div>
                  )}
                  {activeAsset.mimeType && (
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="uppercase">{activeAsset.mimeType.split('/')[1]}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance info */}
            {showPerformanceInfo && performanceScore && activeAsset && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm font-medium text-green-900 mb-2">
                  ⚡ Rendimiento
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-green-800">Score:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all" 
                        style={{ width: `${performanceScore.score}%` } as React.CSSProperties}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-green-900">
                      {performanceScore.score}/100
                    </span>
                  </div>
                </div>
                
                {performanceScore.recommendations.length > 0 && (
                  <div className="text-xs text-green-800">
                    <div className="font-medium mb-1">Recomendaciones:</div>
                    <ul className="space-y-1">
                      {performanceScore.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Estadísticas de sesión */}
            {showStats && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-sm font-medium text-purple-900 mb-2">
                  📊 Estadísticas
                </div>
                <div className="text-xs text-purple-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Duración:</span>
                    <span>{formatDuration(sessionDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assets en experiencia:</span>
                    <span>{experience.assets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soporte WebXR:</span>
                    <span>{capabilities?.webxr ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ID de sesión:</span>
                    <span className="font-mono">{state.sessionId?.slice(-6) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Controles adicionales */}
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                🔄 Resetear posición
              </button>
              <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                📸 Capturar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de ayuda */}
      {showHelp && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                📱 Guía de AR
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ❌
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">🎯 Colocación inicial</h4>
                <p>Mueve tu dispositivo lentamente hasta que aparezca un indicador en tu pantalla. Toca donde quieras colocar el objeto.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">✋ Controles gestuales</h4>
                <ul className="space-y-1">
                  <li>• <strong>Toque simple:</strong> Seleccionar/colocar objeto</li>
                  <li>• <strong>Arrastrar:</strong> Mover objeto por la superficie</li>
                  <li>• <strong>Pellizcar:</strong> Cambiar tamaño</li>
                  <li>• <strong>Rotar con dos dedos:</strong> Girar objeto</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">💡 Consejos</h4>
                <ul className="space-y-1">
                  <li>• Usa buena iluminación</li>
                  <li>• Busca superficies planas</li>
                  <li>• Evita movimientos bruscos</li>
                  <li>• Mantén distancia apropiada (1-3 metros)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">⚠️ Problemas comunes</h4>
                <ul className="space-y-1">
                  <li>• <strong>No detecta superficie:</strong> Mejora la iluminación</li>
                  <li>• <strong>Objeto desaparece:</strong> Regresa a la superficie original</li>
                  <li>• <strong>Lag o lentitud:</strong> Cierra otras apps</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowHelp(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Entendido
              </button>
              <button
                onClick={() => {
                  setShowHelp(false)
                  window.open('https://developers.google.com/ar', '_blank')
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Más info
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Componente simplificado para notificaciones AR
 */
export function ArNotification({ 
  type = 'info',
  message,
  onClose,
  autoClose = 5000
}: {
  type?: 'info' | 'success' | 'warning' | 'error'
  message: string
  onClose?: () => void
  autoClose?: number | false
}) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  }

  const typeIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }

  return (
    <div className={cn(
      'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
      'px-4 py-3 border rounded-lg shadow-lg max-w-sm',
      typeStyles[type]
    )}>
      <div className="flex items-center space-x-2">
        <span>{typeIcons[type]}</span>
        <span className="text-sm font-medium flex-1">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-current hover:opacity-70 transition-opacity"
          >
            ❌
          </button>
        )}
      </div>
    </div>
  )
}