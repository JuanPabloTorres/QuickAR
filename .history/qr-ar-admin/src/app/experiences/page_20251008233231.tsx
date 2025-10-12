/**
 * Página principal de experiencias AR
 * 
 * Lista todas las experiencias disponibles con opciones de filtrado,
 * búsqueda y acceso directo a cada experiencia
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ARExperience, LoadingState } from '@/lib/types';
import { apiClient } from '@/lib/api/client';
import { 
  filterExperiences, 
  sortExperiences, 
  formatRelativeDate as formatDate 
} from '@/lib/helpers/experienceHelpers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<ARExperience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<ARExperience[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'withAR'>('all');
  const [error, setError] = useState<string | null>(null);

  // Cargar experiencias
  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setLoadingState('loading');
        setError(null);

        const response = await QuickARApiClient.experiences.getAll();
        if (response.success && response.data) {
          setExperiences(response.data);
          setLoadingState('success');
        } else {
          throw new Error(response.message || 'Error al cargar experiencias');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        setLoadingState('error');
      }
    };

    loadExperiences();
  }, []);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let filtered = [...experiences];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = experienceHelpers.filterExperiences(filtered, searchTerm);
    }

    // Filtrar por estado/tipo
    switch (filterBy) {
      case 'active':
        filtered = filtered.filter(exp => exp.isActive);
        break;
      case 'withAR':
        filtered = filtered.filter(exp => exp.hasAR);
        break;
    }

    // Ordenar
    filtered = experienceHelpers.sortExperiences(filtered, sortBy);

    setFilteredExperiences(filtered);
  }, [experiences, searchTerm, sortBy, filterBy]);

  if (loadingState === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cargando experiencias AR
            </h3>
            <p className="text-sm text-gray-600">
              Obteniendo la lista de experiencias disponibles...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
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
              Error al cargar experiencias
            </h3>
            <p className="text-sm text-red-600 mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Experiencias AR
        </h1>
        <p className="text-lg text-gray-600">
          Explora las experiencias de Realidad Aumentada disponibles
        </p>
      </div>

      {/* Controles de filtrado y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <Input
              type="text"
              placeholder="Buscar experiencias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filtro por tipo */}
          <div>
            <Select
              value={filterBy}
              onValueChange={(value) => setFilterBy(value as typeof filterBy)}
            >
              <option value="all">Todas las experiencias</option>
              <option value="active">Solo activas</option>
              <option value="withAR">Con AR habilitado</option>
            </Select>
          </div>

          {/* Ordenar por */}
          <div>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as typeof sortBy)}
            >
              <option value="updatedAt">Última actualización</option>
              <option value="createdAt">Fecha de creación</option>
              <option value="title">Título (A-Z)</option>
            </Select>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
          <span>
            Mostrando {filteredExperiences.length} de {experiences.length} experiencias
          </span>
          <div className="flex space-x-4">
            <span>
              Activas: {experiences.filter(exp => exp.isActive).length}
            </span>
            <span>
              Con AR: {experiences.filter(exp => exp.hasAR).length}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de experiencias */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron experiencias
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? `No hay experiencias que coincidan con "${searchTerm}"`
              : 'No hay experiencias disponibles en este momento'}
          </p>
          <Link href="/experiences/create">
            <Button>
              Crear nueva experiencia
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para cada tarjeta de experiencia
function ExperienceCard({ experience }: { experience: ARExperience }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
      <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden rounded-t-lg">
        {/* Preview de la experiencia */}
        <div className="absolute inset-0 flex items-center justify-center">
          {experience.primaryAsset ? (
            <div className="text-6xl opacity-60">
              {experience.primaryAsset.type === 'text' && '📝'}
              {experience.primaryAsset.type === 'image' && '🖼️'}
              {experience.primaryAsset.type === 'video' && '🎥'}
              {experience.primaryAsset.type === 'model3d' && '🧊'}
            </div>
          ) : (
            <div className="text-4xl opacity-40">🎯</div>
          )}
        </div>

        {/* Badges de estado */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {experience.isActive && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              Activa
            </span>
          )}
          {experience.hasAR && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              AR
            </span>
          )}
        </div>

        {/* Número de assets */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
            {experience.assets.length} elementos
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {experience.title}
        </h3>
        
        {experience.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {experience.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>
            {experienceHelpers.formatDate(experience.updatedAt)}
          </span>
          <span>
            ID: {experience.id.slice(-6)}
          </span>
        </div>

        <div className="flex space-x-2">
          <Link href={`/ar/${experience.id}`} className="flex-1">
            <Button className="w-full" size="sm">
              Ver en AR
            </Button>
          </Link>
          <Link href={`/experiences/${experience.id}`}>
            <Button variant="outline" size="sm">
              Detalles
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}