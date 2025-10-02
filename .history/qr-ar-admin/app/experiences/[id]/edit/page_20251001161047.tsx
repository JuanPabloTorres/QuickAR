"use client";

import { FileUpload } from "@/components/file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, FormTextarea } from "@/components/ui/form";
import { LoadingOverlay } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import { formatFileSize, generateSlug } from "@/lib/utils";
import { ExperienceFormData, experienceFormSchema } from "@/lib/validations";
import {
  ASSET_KIND_LABELS,
  AssetDto,
  AssetKind,
  ExperienceDto,
  ExperienceUpdateDto,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Box,
  Check,
  Edit,
  Eye,
  Image,
  MessageSquare,
  Save,
  Sparkles,
  Trash2,
  Video,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

const ASSET_ICONS = {
  model3d: Box,
  image: Image,
  video: Video,
  message: MessageSquare,
};

const ASSET_CONFIG = {
  model3d: {
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/20 to-pink-500/20",
    emoji: "🎲",
    label: "Modelo 3D",
  },
  image: {
    gradient: "from-[#3DD8B6] to-[#00D4FF]",
    bgGradient: "from-[#3DD8B6]/20 to-[#00D4FF]/20",
    emoji: "🖼️",
    label: "Imagen",
  },
  video: {
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/20 to-red-500/20",
    emoji: "🎬",
    label: "Video",
  },
  message: {
    gradient: "from-blue-500 to-purple-500",
    bgGradient: "from-blue-500/20 to-purple-500/20",
    emoji: "💬",
    label: "Mensaje",
  },
};

export default function EditExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<ExperienceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const experienceId = params.id as string;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      isActive: true,
      assets: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "assets",
  });

  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");

  useEffect(() => {
    if (experienceId) {
      loadExperience();
    }
  }, [experienceId]);

  useEffect(() => {
    if (watchedTitle && !watchedSlug) {
      setValue("slug", generateSlug(watchedTitle));
    }
  }, [watchedTitle, watchedSlug, setValue]);

  const loadExperience = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getExperience(experienceId);

      if (response.success && response.data) {
        const exp = response.data;
        setExperience(exp);

        reset({
          title: exp.title,
          slug: exp.slug,
          description: exp.description || "",
          isActive: exp.isActive,
          assets: exp.assets.map((asset) => ({
            id: asset.id,
            name: asset.name,
            kind: asset.kind as AssetKind,
            url: asset.url || "",
            mimeType: asset.mimeType || "",
            fileSizeBytes: asset.fileSizeBytes || 0,
            text: asset.text || undefined,
          })),
        });
      } else {
        setError(response.message || "Experiencia no encontrada");
      }
    } catch (err) {
      setError("Error al cargar la experiencia");
    } finally {
      setLoading(false);
    }
  };

  const addAsset = (kind: AssetKind) => {
    append({
      name: `Nuevo ${ASSET_KIND_LABELS[kind]}`,
      kind,
      url: "",
      mimeType: "",
      fileSizeBytes: 0,
      text: kind === "message" ? "" : undefined,
    });
  };

  const handleFileSelect = async (file: File, assetIndex: number) => {
    try {
      const asset = fields[assetIndex];
      const category =
        asset.kind === "model3d"
          ? "models"
          : asset.kind === "image"
          ? "images"
          : "videos";

      const response = await apiClient.uploadFile(file, category);

      if (response.success && response.data) {
        update(assetIndex, {
          ...asset,
          name: asset.name || file.name,
          url: response.data.url,
          mimeType: response.data.mimeType,
          fileSizeBytes: response.data.sizeBytes,
        });
      } else {
        setError(response.message || "Error al subir el archivo");
      }
    } catch (err) {
      setError("Error al subir el archivo");
    }
  };

  const removeAsset = async (assetIndex: number) => {
    const asset = fields[assetIndex];

    if (asset.id) {
      if (
        !confirm(
          `¿Estás seguro de que quieres eliminar el asset "${asset.name}"?`
        )
      ) {
        return;
      }

      try {
        // TODO: Implement delete asset API call
        // await apiClient.deleteAsset(asset.id);
      } catch (err) {
        setError("Error al eliminar el asset");
        return;
      }
    }

    remove(assetIndex);
  };

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Suponiendo que data tiene el tipo ExperienceUpdateDto (o similar)
      let dataDto: ExperienceUpdateDto = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        isActive: data.isActive,
        assets: data.assets.map((asset: AssetDto) => ({
          name: asset.name,
          kind: asset.kind,
          url: asset.url,
          mimeType: asset.mimeType,
          fileSizeBytes: asset.fileSizeBytes,
          text: asset.text,
        })),
      };

      const response = await apiClient.updateExperience(experienceId, dataDto);

      if (response.success) {
        router.push(`/experiences/${experienceId}`);
      } else {
        setError(response.message || "Error al actualizar la experiencia");
      }
    } catch (err) {
      setError("Error al actualizar la experiencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#3DD8B6] border-t-transparent rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#3DD8B6] animate-pulse" />
        </div>
        <p className="text-gray-400 text-lg font-medium">
          Cargando experiencia...
        </p>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="space-y-6">
        <Alert className="border-2 border-red-500/50 bg-gradient-to-r from-red-950/40 to-red-900/40 backdrop-blur-sm animate-in slide-in-from-top shadow-lg shadow-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <AlertDescription className="text-red-300 font-medium">
            {error || "Experiencia no encontrada"}
          </AlertDescription>
        </Alert>
        <div>
          <Link href="/experiences">
            <Button className="bg-[#1a2942] hover:bg-[#243a5e] border-2 border-[#3DD8B6]/30 hover:border-[#3DD8B6] text-white font-semibold transition-all hover:scale-105">
              <X className="w-4 h-4 mr-2" />
              Volver a Experiencias
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LoadingOverlay
      isLoading={isSubmitting}
      loadingText="Actualizando experiencia..."
    >
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Hero Header */}
        <div className="relative p-12 rounded-3xl bg-gradient-to-br from-[#0F1C2E] via-purple-900/20 to-[#0F1C2E] overflow-hidden border-2 border-[#00D4FF]/30 shadow-2xl shadow-[#00D4FF]/20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3DD8B6]/5 via-transparent to-[#00D4FF]/5 animate-pulse"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3DD8B6]/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00D4FF]/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Edit className="w-10 h-10 text-[#00D4FF] animate-pulse" />
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500">
                    Editar Experiencia
                  </h1>
                  <p className="text-xl text-gray-300 mt-2">
                    {experience.title}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href={`/experiences/${experienceId}`}>
                  <Button className="bg-[#1a2942] hover:bg-[#243a5e] border-2 border-[#1a2942] hover:border-white/20 text-white font-semibold transition-all hover:scale-105">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </Link>
                <Link href={`/x/${experience.slug}`} target="_blank">
                  <Button className="bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] hover:from-[#3DD8B6]/90 hover:to-[#00D4FF]/90 text-[#0F1C2E] font-bold transition-all hover:scale-105">
                    <Eye className="w-4 h-4 mr-2" />
                    Vista Previa AR
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="border-2 border-red-500/50 bg-gradient-to-r from-red-950/40 to-red-900/40 backdrop-blur-sm animate-in slide-in-from-top shadow-lg shadow-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <AlertDescription className="text-red-300 font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Card de Información Básica */}
          <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl hover:border-[#3DD8B6]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#3DD8B6]/20 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3DD8B6]/0 via-[#3DD8B6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-[#1a2942] pb-6">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <div className="p-3 bg-gradient-to-br from-[#3DD8B6] to-[#00D4FF] rounded-2xl shadow-lg shadow-[#3DD8B6]/50 group-hover:scale-110 transition-transform">
                  <Wand2 className="w-6 h-6 text-[#0F1C2E]" />
                </div>
                <span className="text-white font-bold">Información Básica</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-8 relative z-10">
              <FormInput
                label="Título de la Experiencia"
                name="title"
                placeholder="Ej: Mi Primera Experiencia AR"
                register={register}
                error={errors.title}
                required
              />

              <FormInput
                label="Slug (URL)"
                name="slug"
                placeholder="mi-primera-experiencia-ar"
                register={register}
                error={errors.slug}
                required
              />

              <FormTextarea
                label="Descripción"
                name="description"
                placeholder="Describe tu experiencia AR..."
                register={register}
                error={errors.description}
                rows={3}
              />

              <div className="flex items-center gap-3 p-4 bg-[#1a2942]/50 rounded-xl border-2 border-[#3DD8B6]/20 hover:border-[#3DD8B6]/40 transition-all">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register("isActive")}
                  className="w-5 h-5 text-[#3DD8B6] bg-[#0F1C2E] border-2 border-[#3DD8B6]/50 rounded focus:ring-[#3DD8B6] cursor-pointer"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-semibold text-white cursor-pointer"
                >
                  Experiencia activa (visible públicamente)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Card de Assets */}
          <Card className="border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/95 to-[#1a2942]/50 backdrop-blur-xl hover:border-[#00D4FF]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#00D4FF]/20 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D4FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="border-b border-[#1a2942] pb-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
                      <Box className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white font-bold">Contenido AR</span>
                    {fields.length > 0 && (
                      <span className="px-4 py-2 bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] text-[#0F1C2E] rounded-full text-sm font-bold shadow-lg animate-pulse">
                        {fields.length} asset{fields.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </CardTitle>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.keys(ASSET_KIND_LABELS) as AssetKind[]).map(
                    (kind) => {
                      const Icon = ASSET_ICONS[kind];
                      const config = ASSET_CONFIG[kind];

                      return (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => addAsset(kind)}
                          className={`group/btn relative p-6 rounded-2xl bg-gradient-to-br ${config.bgGradient} border-2 border-transparent hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover/btn:opacity-20 transition-opacity blur-xl`}
                          ></div>

                          <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="text-4xl group-hover/btn:scale-125 transition-transform">
                              {config.emoji}
                            </div>
                            <span className="text-white font-bold text-sm">
                              {config.label}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-8 relative z-10">
              {fields.length === 0 ? (
                <div className="text-center py-20">
                  <div className="relative inline-block mb-8">
                    <div className="text-9xl animate-bounce">✨</div>
                    <div className="absolute inset-0 bg-[#3DD8B6]/30 blur-3xl"></div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    No hay assets todavía
                  </h3>
                  <p className="text-xl text-gray-400">
                    Agrega contenido usando los botones de arriba
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {fields.map((field, index) => {
                    const Icon = ASSET_ICONS[field.kind];
                    const config = ASSET_CONFIG[field.kind];

                    return (
                      <div
                        key={field.id}
                        className="group/asset relative animate-in slide-in-from-bottom duration-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <Card
                          className={`border-2 border-[#1a2942] bg-gradient-to-br from-[#0F1C2E]/80 to-[#1a2942]/30 hover:border-[#3DD8B6]/50 transition-all duration-300 overflow-hidden`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover/asset:opacity-100 transition-opacity duration-300`}
                          ></div>

                          <CardHeader className="pb-4 relative z-10">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div
                                  className={`p-4 bg-gradient-to-br ${config.gradient} rounded-2xl shadow-lg group-hover/asset:scale-110 transition-transform`}
                                >
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="text-3xl">
                                      {config.emoji}
                                    </span>
                                    <span className="px-3 py-1 bg-gradient-to-r from-white/10 to-white/5 rounded-full text-sm font-bold text-white border border-white/20">
                                      {config.label}
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Nombre del asset"
                                    {...register(`assets.${index}.name`)}
                                    className="w-full px-4 py-2 rounded-xl bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white placeholder-gray-500 focus:ring-0 transition-all"
                                  />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAsset(index)}
                                aria-label={`Eliminar asset ${field.name}`}
                                className="p-3 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-600/50 hover:border-red-500 rounded-xl text-red-400 hover:text-red-300 transition-all hover:scale-110 hover:rotate-12"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-5 relative z-10">
                            {field.kind === "message" ? (
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-white">
                                  Texto del mensaje
                                </label>
                                <textarea
                                  placeholder="Escribe tu mensaje aquí..."
                                  {...register(`assets.${index}.text`)}
                                  rows={3}
                                  className="w-full px-4 py-3 rounded-xl bg-[#0F1C2E]/80 border-2 border-[#1a2942] focus:border-[#3DD8B6] text-white placeholder-gray-500 focus:ring-0 transition-all"
                                />
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {field.url ? (
                                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#3DD8B6]/10 border-2 border-[#3DD8B6]/30">
                                    <div className="flex items-center gap-3">
                                      <Check className="w-5 h-5 text-[#3DD8B6]" />
                                      <div>
                                        <p className="text-sm font-bold text-white">
                                          Archivo cargado
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {field.mimeType} •{" "}
                                          {formatFileSize(
                                            field.fileSizeBytes || 0
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        update(index, {
                                          ...field,
                                          url: "",
                                          mimeType: "",
                                          fileSizeBytes: 0,
                                        })
                                      }
                                      aria-label="Eliminar archivo cargado"
                                      className="p-2 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-600/50 rounded-lg text-red-400 transition-all hover:scale-110"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <FileUpload
                                    assetKind={field.kind}
                                    currentFileUrl={field.url}
                                    onFileSelect={(file: File) => {
                                      const tempUrl = URL.createObjectURL(file);
                                      update(index, {
                                        ...field,
                                        url: tempUrl,
                                        mimeType: file.type,
                                        fileSizeBytes: file.size,
                                      });
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-6">
            <Link
              href={`/experiences/${experienceId}`}
              className="flex-1 sm:flex-none"
            >
              <Button
                type="button"
                className="w-full py-6 px-8 bg-[#1a2942] hover:bg-[#243a5e] border-2 border-[#1a2942] hover:border-white/20 text-white font-bold text-lg rounded-2xl transition-all hover:scale-105"
              >
                <X className="w-5 h-5 mr-2" />
                Cancelar
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="flex-1 py-6 px-8 bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500 hover:from-[#3DD8B6]/90 hover:via-[#00D4FF]/90 hover:to-purple-500/90 text-[#0F1C2E] font-black text-lg rounded-2xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#3DD8B6]/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

              <span className="relative z-10 flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-[#0F1C2E] border-t-transparent rounded-full animate-spin"></div>
                    Guardando cambios...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Guardar Cambios
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </>
                )}
              </span>
            </Button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }
        .animate-blob {
          animation: blob 8s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </LoadingOverlay>
  );
}
