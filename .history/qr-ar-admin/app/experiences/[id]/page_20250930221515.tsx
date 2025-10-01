'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { formatDate, formatFileSize } from '@/lib/utils';
import { ExperienceDto, ASSET_KIND_LABELS } from '@/types';
import { ExperienceQR } from '@/components/QRCode';

export default function ExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<ExperienceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const experienceId = params.id as string;

  useEffect(() => {
    if (experienceId) {
      loadExperience();
      generateQRCode();
    }
  }, [experienceId]);

  const loadExperience = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getExperience(experienceId);
      
      if (response.success && response.data) {
        setExperience(response.data);
      } else {
        setError(response.message || 'Experiencia no encontrada');
      }
    } catch (err) {
      setError('Error al cargar la experiencia');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      // This will be implemented when we add QR generation
      const QRCode = (await import('qrcode')).default;
      const url = `${window.location.origin}/x/${experience?.slug || experienceId}`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleToggleActive = async () => {
    if (!experience) return;

    try {
      const response = await apiClient.toggleExperienceActive(experience.id);
      if (response.success) {
        setExperience({
          ...experience,
          isActive: !experience.isActive
        });
      } else {
        setError(response.message || 'Error al cambiar el estado');
      }
    } catch (err) {
      setError('Error al cambiar el estado de la experiencia');
    }
  };

  const handleDelete = async () => {
    if (!experience) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar la experiencia "${experience.title}"?`)) {
      return;
    }

    try {
      const response = await apiClient.deleteExperience(experience.id);
      if (response.success) {
        router.push('/experiences');
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

  if (!experience) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Experiencia no encontrada'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={experience.title}
        description={`/${experience.slug}`}
        action={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleToggleActive}
            >
              {experience.isActive ? 'Desactivar' : 'Activar'}
            </Button>
            <Link href={`/experiences/${experience.id}/edit`}>
              <Button variant="outline">Editar</Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Experiencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-blue-200">Estado:</span>
                <div className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  experience.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {experience.isActive ? 'Activa' : 'Inactiva'}
                </div>
              </div>

              {experience.description && (
                <div>
                  <span className="text-sm font-medium text-blue-200">Descripción:</span>
                  <p className="text-white mt-1">{experience.description}</p>
                </div>
              )}

              <div>
                <span className="text-sm font-medium text-blue-200">URL Pública:</span>
                <Link 
                  href={`/x/${experience.slug}`} 
                  className="text-blue-400 hover:text-blue-300 ml-2"
                  target="_blank"
                >
                  /x/{experience.slug} ↗
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-200">Creado:</span>
                  <p className="text-white">{formatDate(experience.createdAt)}</p>
                </div>
                <div>
                  <span className="text-blue-200">Actualizado:</span>
                  <p className="text-white">{formatDate(experience.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assets ({experience.assets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {experience.assets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-blue-200">No hay assets en esta experiencia</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {experience.assets.map((asset) => (
                    <div key={asset.id} className="glass-dark rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-white">{asset.name}</h4>
                          <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                            {ASSET_KIND_LABELS[asset.kind as keyof typeof ASSET_KIND_LABELS]}
                          </span>
                        </div>
                      </div>

                      {asset.kind === 'message' && asset.text && (
                        <div className="mt-2">
                          <span className="text-sm text-blue-200">Texto:</span>
                          <p className="text-white text-sm mt-1">{asset.text}</p>
                        </div>
                      )}

                      {asset.url && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="text-blue-200 mr-2">URL:</span>
                            <a 
                              href={asset.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 truncate"
                            >
                              {asset.url}
                            </a>
                          </div>
                          {asset.mimeType && (
                            <div className="text-xs text-blue-300">
                              Tipo: {asset.mimeType}
                            </div>
                          )}
                          {asset.fileSizeBytes && (
                            <div className="text-xs text-blue-300">
                              Tamaño: {formatFileSize(asset.fileSizeBytes)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Código QR</CardTitle>
              <CardDescription>
                Escanea para ver la experiencia AR
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {qrCodeUrl ? (
                <div className="space-y-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="mx-auto rounded-lg"
                  />
                  <a
                    href={qrCodeUrl}
                    download={`qr-${experience.slug}.png`}
                    className="inline-block"
                  >
                    <Button size="sm" variant="outline">
                      Descargar QR
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="py-8">
                  <Loader />
                  <p className="text-sm text-blue-200 mt-2">Generando QR...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/x/${experience.slug}`} target="_blank">
                <Button variant="outline" className="w-full">
                  Vista Previa AR
                </Button>
              </Link>
              <Link href={`/analytics?experienceId=${experience.id}`}>
                <Button variant="outline" className="w-full">
                  Ver Analytics
                </Button>
              </Link>
              <Link href={`/experiences/${experience.id}/edit`}>
                <Button variant="outline" className="w-full">
                  Editar Experiencia
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}