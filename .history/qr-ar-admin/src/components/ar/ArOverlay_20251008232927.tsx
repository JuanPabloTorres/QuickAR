/**
 * AROverlay - Overlay de información y controles para experiencias AR
 * 
 * Proporciona información contextual y controles de interacción que se superponen
 * sobre la vista AR sin interferir con el contenido principal
 */

'use client';

import React from 'react';
import { ARExperience, ARAsset, LoadingState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AROverlayProps {
  experience: ARExperience;
  currentAsset?: ARAsset;
  loadingState: LoadingState;
  onClose: () => void;
  className?: string;
  showInfo?: boolean;
  showControls?: boolean;
}

export function AROverlay({
  experience,
  currentAsset,
  loadingState,
  onClose,
  className,
  showInfo = true,
  showControls = true,
}: AROverlayProps) {
  // No mostrar overlay durante la carga inicial
  if (loadingState === 'loading' || loadingState === 'error') {
    return null;
  }

  return (
    <div className={cn('pointer-events-none', className)}>
      {/* Header con información de la experiencia */}
      {showInfo && (
        <div className="absolute top-4 left-4 right-4 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {experience.title}
                </h2>
                {experience.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {experience.description}
                  </p>
                )}
                {currentAsset && (
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {currentAsset.type === 'text' && '📝 Texto'}
                      {currentAsset.type === 'image' && '🖼️ Imagen'}
                      {currentAsset.type === 'video' && '🎥 Video'}
                      {currentAsset.type === 'model3d' && '🎯 Modelo 3D'}
                    </span>
                    <span className="ml-2">{currentAsset.name}</span>
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-4 text-gray-500 hover:text-gray-700"
                title="Cerrar experiencia"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Controles laterales */}
      {showControls && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg space-y-3">
            {/* Control de información */}
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 text-gray-600 hover:text-gray-900"
              title="Información"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>

            {/* Control de pantalla completa */}
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 text-gray-600 hover:text-gray-900"
              title="Pantalla completa"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>

            {/* Control de reset/reiniciar */}
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 text-gray-600 hover:text-gray-900"
              title="Reiniciar vista"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Información del asset actual (esquina inferior izquierda) */}
      {currentAsset && (
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <div className="bg-black/80 text-white rounded-lg p-3 max-w-xs">
            <h4 className="font-medium text-sm mb-1">{currentAsset.name}</h4>
            {currentAsset.description && (
              <p className="text-xs opacity-90 line-clamp-2">
                {currentAsset.description}
              </p>
            )}
            
            {/* Metadatos del asset */}
            <div className="mt-2 flex items-center space-x-3 text-xs opacity-75">
              {currentAsset.type === 'model3d' && currentAsset.metadata && (
                <>
                  <span>📦 {currentAsset.metadata.format?.toUpperCase() || '3D'}</span>
                  {currentAsset.metadata.size && (
                    <span>💾 {Math.round(currentAsset.metadata.size / 1024)}KB</span>
                  )}
                </>
              )}
              
              {currentAsset.type === 'image' && currentAsset.metadata && (
                <>
                  <span>🖼️ {currentAsset.metadata.format?.toUpperCase() || 'IMG'}</span>
                  {currentAsset.metadata.dimensions && (
                    <span>📐 {currentAsset.metadata.dimensions.width}x{currentAsset.metadata.dimensions.height}</span>
                  )}
                </>
              )}
              
              {currentAsset.type === 'video' && currentAsset.metadata && (
                <>
                  <span>🎥 {currentAsset.metadata.format?.toUpperCase() || 'VID'}</span>
                  {currentAsset.metadata.duration && (
                    <span>⏱️ {Math.round(currentAsset.metadata.duration)}s</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones de interacción (centro inferior) */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <p className="text-sm text-gray-700 text-center">
            {currentAsset?.type === 'model3d' && '👆 Toca y arrastra para interactuar con el modelo'}
            {currentAsset?.type === 'video' && '▶️ Toca para reproducir/pausar el video'}
            {currentAsset?.type === 'image' && '🔍 Toca para ver detalles de la imagen'}
            {currentAsset?.type === 'text' && '📖 Contenido de texto interactivo'}
            {!currentAsset && '👀 Explora la experiencia AR'}
          </p>
        </div>
      </div>

      {/* Estadísticas de la experiencia (esquina superior derecha cuando hay múltiples assets) */}
      {experience.assets.length > 1 && (
        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {experience.assets.length}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wider">
              Elementos AR
            </div>
          </div>
        </div>
      )}
    </div>
  );
}