/**
 * Página de experiencia AR individual
 * 
 * Muestra una experiencia AR específica en pantalla completa
 * con todos los controles y funcionalidad AR
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ARExperience, LoadingState } from '@/lib/types';
import { apiClient } from '@/lib/api/client';
import { ARScene } from '@/components/ar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ARViewerPage() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;
  
  const [experience, setExperience] = useState<ARExperience | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cargar experiencia
  useEffect(() => {
    if (!experienceId) return;

    const loadExperience = async () => {
      try {
        setLoadingState('loading');
        setError(null);

        const loadedExperience = await apiClient.getExperience(experienceId);
        
        // Verificar que la experiencia esté activa
        if (!loadedExperience.isActive) {
          throw new Error('Esta experiencia no está disponible');
        }

        setExperience(loadedExperience);
        setLoadingState('success');

        // Registrar evento de visualización
        try {
          await apiClient.trackEvent({
            experienceId: loadedExperience.id,
            eventType: 'ar_view_started',
            properties: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (analyticsError) {
          console.warn('Error registrando analytics:', analyticsError);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar la experiencia';
        setError(errorMessage);
        setLoadingState('error');
      }
    };

    loadExperience();
  }, [experienceId]);

  // Manejar salida
  const handleExit = () => {
    // Registrar evento de salida
    if (experience) {
      try {
        apiClient.trackEvent({
          experienceId: experience.id,
          eventType: 'ar_view_ended',
          properties: {
            timestamp: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.warn('Error registrando salida:', err);
      }
    }

    router.push('/experiences');
  };

  // Manejar completado de experiencia
  const handleExperienceComplete = () => {
    if (experience) {
      try {
        apiClient.trackEvent({
          experienceId: experience.id,
          eventType: 'ar_experience_completed',
          properties: {
            timestamp: new Date().toISOString(),
            assetsCount: experience.assets.length,
          },
        });
      } catch (err) {
        console.warn('Error registrando completado:', err);
      }
    }
  };

  // Manejar errores de AR
  const handleARError = (error: string) => {
    setError(`Error AR: ${error}`);
    setLoadingState('error');

    if (experience) {
      try {
        apiClient.trackEvent({
          experienceId: experience.id,
          eventType: 'ar_error',
          properties: {
            error,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.warn('Error registrando error de AR:', err);
      }
    }
  };

  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-2">Cargando experiencia AR</h2>
          <p className="text-gray-400 mb-4">Preparando contenido...</p>
          <p className="text-sm text-gray-500">ID: {experienceId}</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="w-16 h-16 text-red-400 mx-auto mb-4">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No se pudo cargar la experiencia</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              Reintentar
            </Button>
            <Link href="/experiences">
              <Button variant="outline" className="w-full">
                Volver a experiencias
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-2">Experiencia no encontrada</h2>
          <p className="text-gray-400 mb-4">No se pudo encontrar la experiencia solicitada</p>
          <Link href="/experiences">
            <Button>Volver a experiencias</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header con información (oculto en pantalla completa) */}
      {!isFullscreen && (
        <div className="bg-black/80 text-white p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExit}
                className="text-white hover:text-gray-300"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Salir
              </Button>
              
              <div>
                <h1 className="text-lg font-semibold">{experience.title}</h1>
                <p className="text-sm text-gray-400">{experience.assets.length} elementos AR</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>AR Listo</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">ID: {experience.id.slice(-6)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Escena AR principal */}
      <div className={isFullscreen ? 'h-screen' : 'h-[calc(100vh-80px)]'}>
        <ARScene
          experience={experience}
          onExperienceComplete={handleExperienceComplete}
          onExperienceError={handleARError}
          enableCamera={false} // Por ahora simulamos sin cámara real
          enableFullscreen={true}
          className="w-full h-full"
        />
      </div>

      {/* Overlay de ayuda (solo se muestra inicialmente) */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/80 text-white px-6 py-3 rounded-full text-sm backdrop-blur-sm">
          🎯 Explora la experiencia AR • Desliza para navegar
        </div>
      </div>
    </div>
  );
}