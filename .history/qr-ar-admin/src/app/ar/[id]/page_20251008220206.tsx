"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ARExperience } from '../../../types';
import { experiencesService } from '../../../lib/api/experiences';
import ArClient from '../../../components/ar/ArClient';

/**
 * AR Experience Page
 * Main route for AR experience viewing: /ar/[id]
 * Loads experience data and renders AR interface
 */
export default function ARExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<ARExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const experienceId = params.id as string;

  useEffect(() => {
    if (!experienceId) {
      setError('ID de experiencia no válido');
      setLoading(false);
      return;
    }

    loadExperience();
  }, [experienceId]);

  const loadExperience = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const exp = await experiencesService.getExperience(experienceId);
      
      if (!exp.isActive) {
        setError('Esta experiencia no está disponible');
        return;
      }

      setExperience(exp);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar la experiencia';
      setError(errorMessage);
      console.error('Error loading experience:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleError = (error: string) => {
    console.error('AR Experience Error:', error);
    setError(error);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-white text-xl font-semibold mb-2">Cargando experiencia AR</h1>
          <p className="text-gray-400 text-sm">Preparando contenido...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24">
              <path 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-white text-xl font-semibold mb-2">
            Error al cargar experiencia
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            {error || 'La experiencia solicitada no pudo ser encontrada'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => loadExperience()}
              className="
                px-6 py-3 bg-blue-500 hover:bg-blue-600 
                text-white font-medium rounded-lg
                transition-colors
              "
            >
              Intentar nuevamente
            </button>
            <button
              onClick={handleBack}
              className="
                px-6 py-3 bg-gray-600 hover:bg-gray-700 
                text-white font-medium rounded-lg
                transition-colors
              "
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main AR Experience
  return (
    <ArClient
      experience={experience}
      onBack={handleBack}
      onError={handleError}
    />
  );
}