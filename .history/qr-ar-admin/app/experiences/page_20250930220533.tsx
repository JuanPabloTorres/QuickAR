'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, LoadingOverlay } from '@/components/ui/loader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { formatDate, truncateText } from '@/lib/utils';
import { ExperienceDto } from '@/types';

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getExperiences();
      
      if (response.success && response.data) {
        setExperiences(response.data);
      } else {
        setError(response.message || 'Error al cargar las experiencias');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await apiClient.toggleExperienceActive(id);
      if (response.success) {
        await loadExperiences(); // Reload to get updated data
      } else {
        setError(response.message || 'Error al cambiar el estado');
      }
    } catch (err) {
      setError('Error al cambiar el estado de la experiencia');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la experiencia "${title}"?`)) {
      return;
    }

    try {
      const response = await apiClient.deleteExperience(id);
      if (response.success) {
        await loadExperiences(); // Reload to get updated data
      } else {
        setError(response.message || 'Error al eliminar la experiencia');
      }
    } catch (err) {
      setError('Error al eliminar la experiencia');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Experiencias AR"
        description="Gestiona tus experiencias de realidad aumentada"
        action={
          <Link href="/experiences/new">
            <Button>Nueva Experiencia</Button>
          </Link>
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {experiences.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay experiencias aún
            </h3>
            <p className="text-blue-200 mb-6">
              Crea tu primera experiencia AR para comenzar
            </p>
            <Link href="/experiences/new">
              <Button>Crear Primera Experiencia</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <Card key={experience.id} className="group hover:scale-105 transition-transform">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{experience.title}</CardTitle>
                    <CardDescription className="text-sm">
                      /{experience.slug}
                    </CardDescription>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    experience.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {experience.isActive ? 'Activa' : 'Inactiva'}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {experience.description && (
                  <p className="text-blue-200 text-sm mb-4">
                    {truncateText(experience.description, 100)}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-blue-200">
                    <span className="mr-2">📦</span>
                    {experience.assets.length} asset{experience.assets.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center text-sm text-blue-200">
                    <span className="mr-2">📅</span>
                    {formatDate(experience.createdAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link href={`/experiences/${experience.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver
                    </Button>
                  </Link>
                  
                  <Link href={`/experiences/${experience.id}/edit`}>
                    <Button variant="outline" size="sm">
                      ✏️
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(experience.id)}
                  >
                    {experience.isActive ? '⏸️' : '▶️'}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(experience.id, experience.title)}
                  >
                    🗑️
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}