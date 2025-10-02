"use client";

import { ExperienceQR } from "@/components/QRCode";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/utils";
import { ASSET_KIND_LABELS, ExperienceDto } from "@/types";
import {
  BarChart3,
  Box,
  Check,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  Power,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<ExperienceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
        setError(response.message || "Experiencia no encontrada");
      }
    } catch (err) {
      setError("Error al cargar la experiencia");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      const QRCode = (await import("qrcode")).default;
      const url = `${window.location.origin}/x/${
        experience?.slug || experienceId
      }`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  const handleToggleActive = async () => {
    if (!experience) return;

    try {
      const response = await apiClient.toggleExperienceActive(experience.id);
      if (response.success) {
        setExperience({
          ...experience,
          isActive: !experience.isActive,
        });
      } else {
        setError(response.message || "Error al cambiar el estado");
      }
    } catch (err) {
      setError("Error al cambiar el estado de la experiencia");
    }
  };

  const handleDelete = async () => {
    if (!experience) return;

    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar la experiencia "${experience.title}"?`
      )
    ) {
      return;
    }

    try {
      const response = await apiClient.deleteExperience(experience.id);
      if (response.success) {
        router.push("/experiences");
      } else {
        setError(response.message || "Error al eliminar la experiencia");
      }
    } catch (err) {
      setError("Error al eliminar la experiencia");
    }
  };

  const copyUrl = () => {
    const url = `${window.location.origin}/x/${experience?.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <Loader size="lg" />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
        <p className="text-blue-300 animate-pulse">Cargando experiencia...</p>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Alert variant="destructive" className="border-2">
          <AlertDescription className="text-lg">
            {error || "Experiencia no encontrada"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header con gradiente */}
      <div className="relative mb-8 p-8 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-white">
                  {experience.title}
                </h1>
                <div
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105 ${
                    experience.isActive
                      ? "bg-green-400 text-green-900 shadow-lg shadow-green-400/50"
                      : "bg-gray-400 text-gray-900"
                  }`}
                >
                  <Power className="w-4 h-4" />
                  {experience.isActive ? "Activa" : "Inactiva"}
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-lg font-mono">/{experience.slug}</span>
                <button
                  onClick={copyUrl}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Copiar URL"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleToggleActive}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                <Power className="w-4 h-4 mr-2" />
                {experience.isActive ? "Desactivar" : "Activar"}
              </Button>
              <Link href={`/experiences/${experience.id}/edit`}>
                <Button
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 shadow-lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-6 animate-in slide-in-from-top"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de información */}
          <Card className="border-2 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Información de la Experiencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {experience.description && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                    Descripción
                  </span>
                  <p className="text-gray-700 dark:text-white mt-2 leading-relaxed">
                    {experience.description}
                  </p>
                </div>
              )}

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                  URL Pública
                </span>
                <Link
                  href={`/x/${experience.slug}`}
                  className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mt-2 font-mono text-lg group"
                  target="_blank"
                >
                  /x/{experience.slug}
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                    Creado
                  </span>
                  <p className="text-gray-900 dark:text-white mt-1 font-medium">
                    {formatDate(experience.createdAt)}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800">
                  <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                    Actualizado
                  </span>
                  <p className="text-gray-900 dark:text-white mt-1 font-medium">
                    {formatDate(experience.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Assets */}
          <Card className="border-2 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50">
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5 text-indigo-600" />
                Assets
                <span className="ml-auto text-sm font-normal px-3 py-1 bg-indigo-600 text-white rounded-full">
                  {experience.assets.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {experience.assets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 animate-bounce">📦</div>
                  <p className="text-gray-500 dark:text-blue-200 text-lg">
                    No hay assets en esta experiencia
                  </p>
                  <p className="text-gray-400 dark:text-blue-300 text-sm mt-2">
                    Agrega contenido para comenzar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {experience.assets.map((asset, index) => (
                    <div
                      key={asset.id}
                      className="group relative glass-dark rounded-xl p-5 border-2 border-transparent hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: "slideIn 0.5s ease-out forwards",
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white text-lg mb-2">
                            {asset.name}
                          </h4>
                          <span className="inline-block text-xs px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium shadow-lg">
                            {
                              ASSET_KIND_LABELS[
                                asset.kind as keyof typeof ASSET_KIND_LABELS
                              ]
                            }
                          </span>
                        </div>
                      </div>

                      {asset.kind === "message" && asset.text && (
                        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
                          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
                            Mensaje
                          </span>
                          <p className="text-white text-sm mt-2 leading-relaxed">
                            {asset.text}
                          </p>
                        </div>
                      )}

                      {asset.url && (
                        <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-700/50 space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="text-purple-300 font-semibold mr-2">
                              URL:
                            </span>
                            <a
                              href={asset.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 truncate underline decoration-dotted underline-offset-2"
                            >
                              {asset.url}
                            </a>
                          </div>
                          {asset.mimeType && (
                            <div className="text-xs text-purple-200">
                              <span className="font-semibold">Tipo:</span>{" "}
                              {asset.mimeType}
                            </div>
                          )}
                          {asset.fileSizeBytes && (
                            <div className="text-xs text-purple-200">
                              <span className="font-semibold">Tamaño:</span>{" "}
                              {formatFileSize(asset.fileSizeBytes)}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card className="border-2 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 p-1">
              <div className="bg-white dark:bg-gray-900">
                <ExperienceQR
                  slug={experience.slug}
                  title="Código QR"
                  size={256}
                  showDownload={true}
                />
              </div>
            </div>
          </Card>

          {/* Acciones rápidas */}
          <Card className="border-2 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/50 dark:to-purple-950/50">
              <CardTitle className="text-lg">⚡ Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <Link href={`/x/${experience.slug}`} target="_blank">
                <Button
                  variant="outline"
                  className="w-full group hover:bg-blue-50 dark:hover:bg-blue-950 transition-all hover:scale-105"
                >
                  <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Vista Previa AR
                  <ExternalLink className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={`/analytics?experienceId=${experience.id}`}>
                <Button
                  variant="outline"
                  className="w-full group hover:bg-purple-50 dark:hover:bg-purple-950 transition-all hover:scale-105"
                >
                  <BarChart3 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Ver Analytics
                </Button>
              </Link>
              <Link href={`/experiences/${experience.id}/edit`}>
                <Button
                  variant="outline"
                  className="w-full group hover:bg-green-50 dark:hover:bg-green-950 transition-all hover:scale-105"
                >
                  <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Editar Experiencia
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
