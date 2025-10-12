"use client";

import { ExperienceCube, ExperienceCubeFromAsset } from "@/components/ExperienceCube";
import { ExperienceQR } from "@/components/QRCode";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/utils";
import { ASSET_KIND_LABELS, ExperienceDto } from "@/types";
import {
  BarChart3,
  Box,
  Calendar,
  Check,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  Link as LinkIcon,
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#3DD8B6] border-t-transparent rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#3DD8B6] animate-pulse" />
        </div>
        <p className="text-gray-400 animate-pulse font-medium">
          Cargando experiencia AR...
        </p>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Alert
          variant="destructive"
          className="border-2 border-red-500/20 bg-red-950/20"
        >
          <AlertDescription className="text-lg text-red-400">
            {error || "Experiencia no encontrada"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header moderno con patrón de fondo */}
      <div className="relative mb-8 p-8 rounded-2xl bg-gradient-to-br from-[#0F1C2E] via-[#1a2942] to-[#0F1C2E] overflow-hidden border border-[#3DD8B6]/20">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #3DD8B6 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3DD8B6]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4FF]/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                  {experience.title}
                </h1>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105 ${
                    experience.isActive
                      ? "bg-[#3DD8B6] text-[#0F1C2E] shadow-lg shadow-[#3DD8B6]/50"
                      : "bg-gray-600 text-gray-200"
                  }`}
                >
                  <Power className="w-4 h-4" />
                  {experience.isActive ? "Activa" : "Inactiva"}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#1a2942]/50 rounded-xl p-3 border border-[#3DD8B6]/20 backdrop-blur-sm">
                <LinkIcon className="w-5 h-5 text-[#3DD8B6]" />
                <span className="text-lg font-mono text-gray-300">
                  /{experience.slug}
                </span>
                <button
                  onClick={copyUrl}
                  className="ml-auto p-2 hover:bg-[#3DD8B6]/20 rounded-lg transition-all hover:scale-110"
                  title="Copiar URL"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-[#3DD8B6]" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400 hover:text-[#3DD8B6]" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleToggleActive}
                className="bg-[#1a2942] hover:bg-[#243a5e] border-2 border-[#3DD8B6]/30 text-white transition-all hover:scale-105 hover:border-[#3DD8B6]"
              >
                <Power className="w-4 h-4 mr-2" />
                {experience.isActive ? "Desactivar" : "Activar"}
              </Button>
              <Link href={`/experiences/${experience.id}/edit`}>
                <Button className="bg-[#00D4FF] hover:bg-[#00b8e6] text-[#0F1C2E] transition-all hover:scale-105 font-semibold">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 transition-all hover:scale-105"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 animate-in slide-in-from-top border-2 border-red-500/30 bg-red-950/20">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de información */}
          <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/50 backdrop-blur-sm hover:border-[#3DD8B6]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#3DD8B6]/10">
            <CardHeader className="border-b border-[#1a2942]">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-[#3DD8B6]/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-[#3DD8B6]" />
                </div>
                Información de la Experiencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {experience.description && (
                <div className="p-5 bg-[#1a2942]/50 rounded-xl border border-[#3DD8B6]/20 hover:border-[#3DD8B6]/40 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-[#3DD8B6] rounded-full"></div>
                    <span className="text-sm font-semibold text-[#3DD8B6] uppercase tracking-wider">
                      Descripción
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {experience.description}
                  </p>
                </div>
              )}

              <div className="p-5 bg-gradient-to-br from-[#00D4FF]/10 to-[#3DD8B6]/10 rounded-xl border border-[#00D4FF]/30 hover:border-[#00D4FF]/50 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-[#00D4FF] rounded-full"></div>
                  <span className="text-sm font-semibold text-[#00D4FF] uppercase tracking-wider">
                    URL Pública
                  </span>
                </div>
                <Link
                  href={`/x/${experience.slug}`}
                  className="flex items-center gap-2 text-white hover:text-[#00D4FF] font-mono text-lg group transition-colors"
                  target="_blank"
                >
                  /x/{experience.slug}
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-[#1a2942]/50 rounded-xl border border-[#3DD8B6]/20 hover:border-[#3DD8B6]/40 transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-[#3DD8B6] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-[#3DD8B6] uppercase tracking-wider">
                      Creado
                    </span>
                  </div>
                  <p className="text-white font-medium text-lg">
                    {formatDate(experience.createdAt)}
                  </p>
                </div>
                <div className="p-5 bg-[#1a2942]/50 rounded-xl border border-[#00D4FF]/20 hover:border-[#00D4FF]/40 transition-all group">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-[#00D4FF] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-[#00D4FF] uppercase tracking-wider">
                      Actualizado
                    </span>
                  </div>
                  <p className="text-white font-medium text-lg">
                    {formatDate(experience.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Assets */}
          <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/50 backdrop-blur-sm hover:border-[#3DD8B6]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#3DD8B6]/10">
            <CardHeader className="border-b border-[#1a2942]">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-[#00D4FF]/20 rounded-lg">
                  <Box className="w-5 h-5 text-[#00D4FF]" />
                </div>
                Assets
                <span className="ml-auto text-sm font-semibold px-4 py-1.5 bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] text-[#0F1C2E] rounded-full shadow-lg">
                  {experience.assets.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {experience.assets.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-7xl mb-4 animate-bounce">📦</div>
                  <p className="text-gray-400 text-xl font-medium mb-2">
                    No hay assets en esta experiencia
                  </p>
                  <p className="text-gray-500 text-sm">
                    Agrega contenido AR para comenzar
                  </p>
                </div>
              ) : (
                <>
                  {/* Neutral 3D Experience Cubes Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {experience.assets.map((asset, index) => {
                      return (
                        <div
                          key={asset.id}
                          className="flex flex-col items-center space-y-4"
                        >
                          <ExperienceCubeFromAsset
                            asset={asset}
                            size={280}
                            enableAR={true}
                            neutralBorder={true}
                            borderColor="light"
                            enable3D={true}
                            disableAutoAnimations={true}
                            className="mx-auto"
                          />

                          {/* Asset Information Card */}
                          <div className="w-full max-w-xs bg-[#1a2942]/50 rounded-xl p-4 border border-[#3DD8B6]/20 backdrop-blur-sm">
                            <div className="text-center">
                              <h4 className="font-semibold text-white text-sm mb-2">
                                {asset.name}
                              </h4>
                              <span className="inline-block text-xs px-3 py-1 bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] text-[#0F1C2E] rounded-full font-bold shadow-lg uppercase tracking-wide">
                                {
                                  ASSET_KIND_LABELS[
                                    asset.kind as keyof typeof ASSET_KIND_LABELS
                                  ]
                                }
                              </span>

                              {/* Additional Info */}
                              <div className="mt-3 space-y-1 text-xs text-gray-400">
                                {asset.mimeType && (
                                  <div>
                                    <span className="font-semibold text-[#3DD8B6]">
                                      Tipo:
                                    </span>{" "}
                                    {asset.mimeType}
                                  </div>
                                )}
                                {asset.fileSizeBytes && (
                                  <div>
                                    <span className="font-semibold text-[#3DD8B6]">
                                      Tamaño:
                                    </span>{" "}
                                    {formatFileSize(asset.fileSizeBytes)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Traditional List View (Optional) */}
                  <details className="mt-8">
                    <summary className="text-gray-400 cursor-pointer hover:text-[#3DD8B6] transition-colors mb-4">
                      Ver vista detallada tradicional
                    </summary>
                    <div className="space-y-4">
                      {experience.assets.map((asset, index) => (
                        <div
                          key={`detail-${asset.id}`}
                          className="group relative bg-[#1a2942]/30 rounded-xl p-4 border border-gray-600/30 hover:border-[#3DD8B6]/50 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white text-lg mb-2">
                                {asset.name}
                              </h4>
                              <span className="inline-block text-xs px-3 py-1 bg-gray-600 text-gray-200 rounded-full font-medium">
                                {
                                  ASSET_KIND_LABELS[
                                    asset.kind as keyof typeof ASSET_KIND_LABELS
                                  ]
                                }
                              </span>
                            </div>
                          </div>

                          {asset.kind === "message" && asset.text && (
                            <div className="mt-3 p-3 bg-[#0F1C2E]/60 rounded-lg border border-[#3DD8B6]/20">
                              <span className="text-xs font-bold text-[#3DD8B6] uppercase tracking-wider mb-1 block">
                                💬 Mensaje
                              </span>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {asset.text}
                              </p>
                            </div>
                          )}

                          {asset.url && (
                            <div className="mt-3 p-3 bg-[#0F1C2E]/60 rounded-lg border border-[#00D4FF]/20">
                              <div className="flex items-start gap-2">
                                <LinkIcon className="w-4 h-4 text-[#00D4FF] mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-bold text-[#00D4FF] uppercase tracking-wider block mb-1">
                                    URL
                                  </span>
                                  <a
                                    href={asset.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-[#00D4FF] text-sm break-all underline decoration-dotted underline-offset-2 transition-colors"
                                  >
                                    {asset.url}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/50 backdrop-blur-sm hover:border-[#3DD8B6]/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-[#3DD8B6]/20">
            <div className="bg-gradient-to-br from-[#3DD8B6] via-[#00D4FF] to-[#3DD8B6] p-1">
              <div className="bg-[#0F1C2E]">
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
          <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/50 backdrop-blur-sm hover:border-[#3DD8B6]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#3DD8B6]/10">
            <CardHeader className="border-b border-[#1a2942]">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <span className="text-2xl">⚡</span>
                <span>Acciones Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 pb-6">
              <Link
                href={`/x/${experience.slug}`}
                target="_blank"
                className="block"
              >
                <Button className="w-full h-auto py-5 px-5 group bg-[#1a2942] hover:bg-gradient-to-r hover:from-[#3DD8B6]/20 hover:to-[#00D4FF]/20 transition-all hover:scale-105 hover:shadow-lg border-2 border-[#1a2942] hover:border-[#3DD8B6]">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#3DD8B6]/20 rounded-xl group-hover:bg-[#3DD8B6]/30 group-hover:scale-110 transition-all">
                        <Eye className="w-5 h-5 text-[#3DD8B6]" />
                      </div>
                      <span className="font-semibold text-white">
                        Vista Previa AR
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#3DD8B6] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </Button>
              </Link>

              <Link
                href={`/analytics?experienceId=${experience.id}`}
                className="block"
              >
                <Button className="w-full h-auto py-5 px-5 group bg-[#1a2942] hover:bg-gradient-to-r hover:from-[#00D4FF]/20 hover:to-[#3DD8B6]/20 transition-all hover:scale-105 hover:shadow-lg border-2 border-[#1a2942] hover:border-[#00D4FF]">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2.5 bg-[#00D4FF]/20 rounded-xl group-hover:bg-[#00D4FF]/30 group-hover:scale-110 transition-all">
                      <BarChart3 className="w-5 h-5 text-[#00D4FF]" />
                    </div>
                    <span className="font-semibold text-white">
                      Ver Analytics
                    </span>
                  </div>
                </Button>
              </Link>

              <Link
                href={`/experiences/${experience.id}/edit`}
                className="block"
              >
                <Button className="w-full h-auto py-5 px-5 group bg-[#1a2942] hover:bg-gradient-to-r hover:from-[#3DD8B6]/20 hover:to-[#00D4FF]/20 transition-all hover:scale-105 hover:shadow-lg border-2 border-[#1a2942] hover:border-[#3DD8B6]">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2.5 bg-[#3DD8B6]/20 rounded-xl group-hover:bg-[#3DD8B6]/30 group-hover:scale-110 transition-all">
                      <Edit className="w-5 h-5 text-[#3DD8B6]" />
                    </div>
                    <span className="font-semibold text-white">
                      Editar Experiencia
                    </span>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
