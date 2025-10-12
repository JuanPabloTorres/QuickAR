/**
 * ARScene - Escena principal de Realidad Aumentada
 * 
 * Componente que orquesta toda la experiencia AR, manejando la cámara,
 * el tracking, la renderización de assets y las interacciones del usuario
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ARExperience, LoadingState } from '@/lib/types';
import { ExperienceViewer } from './ExperienceViewer';
import { cn } from '@/lib/utils';

export interface ARSceneProps {
  experience: ARExperience;
  onExperienceComplete?: () => void;
  onExperienceError?: (error: string) => void;
  className?: string;
  enableCamera?: boolean;
  enableFullscreen?: boolean;
}

export function ARScene({
  experience,
  onExperienceComplete,
  onExperienceError,
  className,
  enableCamera = false, // Por ahora simulamos AR sin cámara real
  enableFullscreen = true,
}: ARSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar escena AR
  useEffect(() => {
    const initializeARScene = async () => {
      try {
        setLoadingState('loading');
        setError(null);

        // Simular inicialización de AR
        await new Promise(resolve => setTimeout(resolve, 1000));

        // En una implementación real, aquí inicializaríamos:
        // - Permisos de cámara
        // - Detección de características AR
        // - Configuración de tracking
        // - Calibración de la cámara

        setLoadingState('success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido en AR';
        setError(errorMessage);
        setLoadingState('error');
        onExperienceError?.(errorMessage);
      }
    };

    initializeARScene();
  }, [experience.id, onExperienceError]);

  // Manejar pantalla completa
  const toggleFullscreen = useCallback(async () => {
    if (!enableFullscreen || !containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Error al cambiar modo pantalla completa:', err);
    }
  }, [isFullscreen, enableFullscreen]);

  // Detectar cambios en pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Manejar carga completa de experiencia
  const handleExperienceLoad = useCallback(() => {
    console.log('Experiencia AR cargada completamente:', experience.title);
    onExperienceComplete?.();
  }, [experience.title, onExperienceComplete]);

  // Manejar errores de experiencia
  const handleExperienceError = useCallback((error: string) => {
    setError(error);
    setLoadingState('error');
    onExperienceError?.(error);
  }, [onExperienceError]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full bg-gray-900 rounded-lg overflow-hidden',
        isFullscreen && 'rounded-none',
        className
      )}
    >
      {/* Fondo AR simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
      </div>

      {/* Overlay de cámara simulada (cuando enableCamera es true) */}
      {enableCamera && loadingState === 'success' && (
        <div className="absolute inset-0 bg-black/20">
          <div className="absolute top-4 left-4 text-white/70 text-xs font-mono">
            📷 CÁMARA AR SIMULADA
          </div>
        </div>
      )}

      {/* Estado de inicialización AR */}
      {loadingState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">Iniciando AR</h3>
            <p className="text-sm opacity-75 mb-4">Preparando experiencia de realidad aumentada...</p>
            
            {/* Simulación de pasos de inicialización */}
            <div className="space-y-2 text-xs opacity-60">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Detectando superficie...</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Calibrando tracking...</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span>Cargando assets AR...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado de error AR */}
      {loadingState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 backdrop-blur-sm">
          <div className="text-center text-white p-8">
            <div className="w-16 h-16 text-red-400 mx-auto mb-4">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Error AR</h3>
            <p className="text-sm opacity-75 mb-4">
              {error || 'No se pudo inicializar la experiencia de realidad aumentada'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Experiencia AR principal */}
      {loadingState === 'success' && (
        <ExperienceViewer
          experience={experience}
          onExperienceLoad={handleExperienceLoad}
          onExperienceError={handleExperienceError}
          className="w-full h-full"
          showOverlay={true}
          autoStart={true}
        />
      )}

      {/* Controles AR (esquina superior izquierda) */}
      {loadingState === 'success' && (
        <div className="absolute top-4 left-4 flex space-x-2">
          {/* Indicador de estado AR */}
          <div className="bg-black/70 text-white px-3 py-2 rounded-full text-xs font-medium">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>AR ACTIVO</span>
            </div>
          </div>
          
          {/* Control de pantalla completa */}
          {enableFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="bg-black/70 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
              title={isFullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                {isFullscreen ? (
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V9.414L3.707 12.707a1 1 0 01-1.414-1.414L5.586 8H4a1 1 0 010-2h4a1 1 0 011 1zm2 5a1 1 0 011-1h4a1 1 0 110 2h-1.586l3.293 3.293a1 1 0 01-1.414 1.414L11 16.414V18a1 1 0 11-2 0v-4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Información técnica AR (esquina superior derecha) */}
      {loadingState === 'success' && (
        <div className="absolute top-4 right-4">
          <div className="bg-black/70 text-white p-3 rounded-lg text-xs font-mono space-y-1">
            <div className="flex justify-between space-x-4">
              <span className="opacity-75">FPS:</span>
              <span className="text-green-400">60</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="opacity-75">Assets:</span>
              <span className="text-blue-400">{experience.assets.length}</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="opacity-75">Tracking:</span>
              <span className="text-green-400">STABLE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}