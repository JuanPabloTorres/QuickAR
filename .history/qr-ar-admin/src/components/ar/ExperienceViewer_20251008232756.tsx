/**
 * ExperienceViewer - Contenedor principal para experiencias AR
 * 
 * Maneja la vista general de una experiencia, incluyendo múltiples assets,
 * controles de navegación y estados de carga
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ARExperience, ARAsset, LoadingState } from '@/lib/types';
import { AssetRenderer } from './AssetRenderer';
import { AROverlay } from './AROverlay';
import { cn } from '@/lib/utils';

export interface ExperienceViewerProps {
  experience: ARExperience;
  onAssetInteraction?: (asset: ARAsset) => void;
  onExperienceLoad?: () => void;
  onExperienceError?: (error: string) => void;
  className?: string;
  showOverlay?: boolean;
  autoStart?: boolean;
}

export function ExperienceViewer({
  experience,
  onAssetInteraction,
  onExperienceLoad,
  onExperienceError,
  className,
  showOverlay = true,
  autoStart = true,
}: ExperienceViewerProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [loadedAssets, setLoadedAssets] = useState<Set<string>>(new Set());
  const [errorAssets, setErrorAssets] = useState<Set<string>>(new Set());
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar experiencia
  useEffect(() => {
    if (!autoStart) return;

    const initializeExperience = () => {
      setLoadingState('loading');
      setIsInitialized(true);
      
      // Si no hay assets, marcar como completado
      if (experience.assets.length === 0) {
        setLoadingState('success');
        onExperienceLoad?.();
      }
    };

    const timer = setTimeout(initializeExperience, 100);
    return () => clearTimeout(timer);
  }, [experience, autoStart, onExperienceLoad]);

  // Manejar carga de assets
  const handleAssetLoad = useCallback((asset: ARAsset) => {
    setLoadedAssets(prev => {
      const newSet = new Set(prev);
      newSet.add(asset.id);
      
      // Verificar si todos los assets están cargados
      const totalAssets = experience.assets.length;
      const loadedCount = newSet.size;
      
      if (loadedCount === totalAssets) {
        setLoadingState('success');
        onExperienceLoad?.();
      }
      
      return newSet;
    });
  }, [experience.assets.length, onExperienceLoad]);

  // Manejar errores de assets
  const handleAssetError = useCallback((asset: ARAsset, error: string) => {
    setErrorAssets(prev => {
      const newSet = new Set(prev);
      newSet.add(asset.id);
      return newSet;
    });

    console.warn(`Error loading asset ${asset.name}:`, error);
    
    // Si hay demasiados errores, marcar toda la experiencia como error
    const errorCount = errorAssets.size + 1;
    if (errorCount > experience.assets.length / 2) {
      setLoadingState('error');
      onExperienceError?.('Demasiados assets fallaron al cargar');
    }
  }, [errorAssets.size, experience.assets.length, onExperienceError]);

  // Manejar interacción con asset
  const handleAssetInteraction = useCallback((asset: ARAsset) => {
    onAssetInteraction?.(asset);
  }, [onAssetInteraction]);

  // Navegación entre assets
  const goToNextAsset = useCallback(() => {
    setCurrentAssetIndex(prev => 
      prev < experience.assets.length - 1 ? prev + 1 : 0
    );
  }, [experience.assets.length]);

  const goToPreviousAsset = useCallback(() => {
    setCurrentAssetIndex(prev => 
      prev > 0 ? prev - 1 : experience.assets.length - 1
    );
  }, [experience.assets.length]);

  const goToAsset = useCallback((index: number) => {
    if (index >= 0 && index < experience.assets.length) {
      setCurrentAssetIndex(index);
    }
  }, [experience.assets.length]);

  // Calcular estadísticas de carga
  const loadingProgress = experience.assets.length > 0 
    ? (loadedAssets.size / experience.assets.length) * 100 
    : 100;

  const currentAsset = experience.assets[currentAssetIndex];
  const hasMultipleAssets = experience.assets.length > 1;

  return (
    <div className={cn('relative w-full h-full bg-gray-50 rounded-lg overflow-hidden', className)}>
      {/* Fondo AR */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200" />
      
      {/* Grid de referencia (opcional) */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-grid-pattern" />
      </div>

      {/* Estado de carga */}
      {loadingState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cargando experiencia AR
            </h3>
            <p className="text-sm text-gray-600 mb-4">{experience.title}</p>
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round(loadingProgress)}% completado
            </p>
          </div>
        </div>
      )}

      {/* Estado de error */}
      {loadingState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 text-red-600 mx-auto mb-4">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error al cargar la experiencia
            </h3>
            <p className="text-sm text-red-600">
              No se pudieron cargar los elementos AR necesarios.
            </p>
          </div>
        </div>
      )}

      {/* Contenido AR */}
      {isInitialized && loadingState === 'success' && (
        <div className="relative w-full h-full">
          {/* Assets */}
          <div className="absolute inset-0 p-8">
            {hasMultipleAssets ? (
              // Vista de asset único (navegable)
              currentAsset && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="max-w-lg w-full">
                    <AssetRenderer
                      asset={currentAsset}
                      isActive={true}
                      onLoad={() => handleAssetLoad(currentAsset)}
                      onError={(error) => handleAssetError(currentAsset, error)}
                      onInteraction={() => handleAssetInteraction(currentAsset)}
                      className="w-full h-96"
                    />
                  </div>
                </div>
              )
            ) : (
              // Vista de múltiples assets (grid)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
                {experience.assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-center">
                    <AssetRenderer
                      asset={asset}
                      isActive={true}
                      onLoad={() => handleAssetLoad(asset)}
                      onError={(error) => handleAssetError(asset, error)}
                      onInteraction={() => handleAssetInteraction(asset)}
                      className="w-full h-64"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controles de navegación para múltiples assets */}
          {hasMultipleAssets && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <button
                  onClick={goToPreviousAsset}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
                  title="Asset anterior"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Indicadores de assets */}
                <div className="flex space-x-1">
                  {experience.assets.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToAsset(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        index === currentAssetIndex
                          ? 'bg-blue-600'
                          : 'bg-gray-300 hover:bg-gray-400'
                      )}
                      title={`Asset ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNextAsset}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
                  title="Asset siguiente"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay con información y controles */}
      {showOverlay && (
        <AROverlay
          experience={experience}
          currentAsset={currentAsset}
          loadingState={loadingState}
          onClose={() => {/* manejar cierre */}}
          className="absolute inset-0"
        />
      )}
    </div>
  );
}