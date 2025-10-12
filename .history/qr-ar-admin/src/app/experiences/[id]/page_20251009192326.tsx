"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getExperienceById } from "@/lib/api/experiences";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { generateQRCodeForExperience, downloadQRCode } from "@/lib/qr";
import { Experience } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function QRCodeSection({ experienceId }: { experienceId: string }) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      setIsGenerating(true);
      try {
        const qrDataUrl = await generateQRCodeForExperience(experienceId);
        setQrCode(qrDataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateQR();
  }, [experienceId]);

  const handleDownload = () => {
    if (qrCode) {
      downloadQRCode(qrCode, `qr-experience-${experienceId}.png`);
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <QuickArLogo size={24} />
          Código QR
        </CardTitle>
        <CardDescription>
          Escanea para abrir en dispositivo móvil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-8 bg-white rounded-lg">
          {isGenerating ? (
            <div className="w-32 h-32 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
          ) : qrCode ? (
            <img 
              src={qrCode} 
              alt="QR Code" 
              className="w-32 h-32 rounded"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-sm">Error QR</span>
            </div>
          )}
        </div>
        <p className="text-center text-sm text-gray-400 mt-3">
          URL: {typeof window !== "undefined" ? window.location.origin : ""}/ar/{experienceId}
        </p>
        {qrCode && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={handleDownload} size="sm">
              📥 Descargar QR
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ExperienceViewPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExperience = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await getExperienceById(id);

        if (response.success && response.data) {
          const normalizedExperience = normalizeExperience(response.data);
          setExperience(normalizedExperience);
        } else {
          setError(response.message || "Experiencia no encontrada");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        setIsLoading(false);
      }
    };

    loadExperience();
  }, [id]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getAssetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      image: "Imagen",
      video: "Video", 
      model3d: "Modelo 3D",
      message: "Mensaje"
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-blue-200">Cargando experiencia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <Link href="/experiences">
            <Button>Volver a Experiencias</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Experiencia no encontrada
          </h2>
          <p className="text-gray-400 mb-6">
            La experiencia que buscas no existe o ha sido eliminada.
          </p>
          <Link href="/experiences">
            <Button>Volver a Experiencias</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/experiences">
            <Button variant="ghost" size="sm">
              ← Volver
            </Button>
          </Link>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {experience.title}
            </h1>
            {experience.description && (
              <p className="text-blue-200 text-lg">
                {experience.description}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link href={`/ar/${experience.id}`}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                🎯 Ver en AR
              </Button>
            </Link>
            <Link href={`/experiences/${experience.id}/edit`}>
              <Button variant="outline" size="lg">
                ✏️ Editar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Experience Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assets List */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <span>📦</span>
                Assets ({experience.assets.length})
              </CardTitle>
              <CardDescription>
                Contenido de la experiencia AR
              </CardDescription>
            </CardHeader>
            <CardContent>
              {experience.assets.length > 0 ? (
                <div className="space-y-4">
                  {experience.assets.map((asset, index) => (
                    <div
                      key={asset.id}
                      className="p-4 bg-gray-800/30 border border-gray-600/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-mono text-blue-400">
                              #{index + 1}
                            </span>
                            <h3 className="font-semibold text-white">
                              {asset.name}
                            </h3>
                            <span className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-xs text-blue-300">
                              {getAssetTypeLabel(asset.assetType)}
                            </span>
                          </div>
                          
                          {/* Asset Content Preview */}
                          {asset.assetType === "message" && asset.assetContent && (
                            <div className="mt-3 p-3 bg-gray-700/30 rounded border-l-4 border-blue-500">
                              <p className="text-gray-300 whitespace-pre-wrap">
                                {asset.assetContent}
                              </p>
                            </div>
                          )}
                          
                          {asset.assetType === "image" && asset.assetUrl && (
                            <div className="mt-3">
                              <img
                                src={asset.assetUrl}
                                alt={asset.name}
                                className="max-h-32 rounded border border-gray-600/50"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          
                          {asset.assetType === "video" && asset.assetUrl && (
                            <div className="mt-3">
                              <video
                                src={asset.assetUrl}
                                className="max-h-32 rounded border border-gray-600/50"
                                controls
                                onError={(e) => {
                                  (e.target as HTMLVideoElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          
                          {asset.assetUrl && asset.assetType !== "message" && (
                            <p className="text-xs text-gray-400 mt-2 break-all">
                              URL: {asset.assetUrl}
                            </p>
                          )}
                          
                          {asset.fileSizeBytes && (
                            <p className="text-xs text-gray-400 mt-1">
                              Tamaño: {(asset.fileSizeBytes / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4">📭</div>
                  <p>No hay assets en esta experiencia</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code Section */}
          <QRCodeSection experienceId={experience.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg text-white">Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Estado:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  experience.isActive 
                    ? "bg-green-600/20 border border-green-500/30 text-green-300"
                    : "bg-red-600/20 border border-red-500/30 text-red-300"
                }`}>
                  {experience.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Assets:</span>
                <span className="text-white font-medium">
                  {experience.assets.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">ID:</span>
                <span className="text-xs text-gray-400 font-mono break-all">
                  {experience.id}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg text-white">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-gray-400 block">Creado:</span>
                <span className="text-white text-sm">
                  {formatDate(experience.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-400 block">Actualizado:</span>
                <span className="text-white text-sm">
                  {formatDate(experience.updatedAt)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-400 block">Slug:</span>
                <span className="text-white text-sm font-mono">
                  {experience.slug}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg text-white">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/ar/${experience.id}`} className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  🎯 Abrir en AR
                </Button>
              </Link>
              <Link href={`/experiences/${experience.id}/edit`} className="block">
                <Button variant="outline" className="w-full">
                  ✏️ Editar Experiencia
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full text-gray-400 hover:text-white"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const url = `${window.location.origin}/ar/${experience.id}`;
                    navigator.clipboard.writeText(url);
                  }
                }}
              >
                📋 Copiar URL AR
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}