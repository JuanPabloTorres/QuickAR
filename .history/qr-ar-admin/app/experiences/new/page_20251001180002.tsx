"use client";

import { FileUpload } from "@/components/file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, FormTextarea } from "@/components/ui/form";
import { LoadingOverlay } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import { generateSlug } from "@/lib/utils";
import { ExperienceFormData, experienceFormSchema } from "@/lib/validations";
import { ASSET_KIND_DESCRIPTIONS, ASSET_KIND_LABELS, AssetKind } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Box,
  Check,
  Image,
  MessageSquare,
  Rocket,
  Sparkles,
  Stars,
  Trash2,
  Video,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
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

export default function NewExperiencePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
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

  React.useEffect(() => {
    if (watchedTitle && !watchedSlug) {
      setValue("slug", generateSlug(watchedTitle));
    }
  }, [watchedTitle, watchedSlug, setValue]);

  const addAsset = (kind: AssetKind) => {
    append({
      name: "",
      kind,
      url: "",
      mimeType: "",
      fileSizeBytes: 0,
      text: kind === "message" ? "" : undefined,
    });
    // Pequeño efecto visual
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);
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

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await apiClient.createExperience({
        title: data.title,
        slug: data.slug || undefined,
        description: data.description || undefined,
        assets: data.assets.map((asset) => ({
          name: asset.name,
          kind: asset.kind,
          url: asset.url || undefined,
          mimeType: asset.mimeType || undefined,
          fileSizeBytes: asset.fileSizeBytes || undefined,
          text: asset.text || undefined,
        })),
      });

      if (response.success && response.data) {
        router.push(`/experiences/${response.data.id}`);
      } else {
        setError(response.message || "Error al crear la experiencia");
      }
    } catch (err) {
      setError("Error al crear la experiencia");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoadingOverlay isLoading={isSubmitting}>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Hero Header Ultra Moderno */}
        <div className="relative p-12 rounded-3xl bg-gradient-to-br from-[#0F1C2E] via-purple-900/20 to-[#0F1C2E] overflow-hidden border-2 border-[#3DD8B6]/30 shadow-2xl shadow-[#3DD8B6]/20">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3DD8B6]/5 via-transparent to-[#00D4FF]/5 animate-pulse"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3DD8B6]/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00D4FF]/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <Rocket className="w-10 h-10 text-[#3DD8B6] animate-bounce" />
              <h1 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500">
                Crear Experiencia AR
              </h1>
              <Stars className="w-10 h-10 text-[#00D4FF] animate-spin-slow" />
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Da vida a tu imaginación con realidad aumentada
            </p>
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
          {/* Card de Información Básica - Rediseñada */}
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
              <div className="space-y-2">
                <FormInput
                  label="Título de tu experiencia"
                  name="title"
                  className="text-dark"
                  register={register}
                  error={errors.title}
                  required
                  placeholder="Ej: Dinosaurio en mi sala 🦖"
                />
              </div>

              <div className="space-y-2">
                <FormInput
                  label="Slug (URL personalizada)"
                  name="slug"
                  register={register}
                  error={errors.slug}
                  placeholder="se-genera-automaticamente"
                />
                {watchedSlug && (
                  <div className="p-4 bg-gradient-to-r from-[#3DD8B6]/10 to-[#00D4FF]/10 rounded-xl border-2 border-[#3DD8B6]/30 animate-in slide-in-from-top">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#3DD8B6] animate-pulse" />
                      <p className="text-sm text-gray-300">
                        Tu experiencia estará en:{" "}
                        <span className="text-[#3DD8B6] font-bold text-lg font-mono">
                          /x/{watchedSlug}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <FormTextarea
                  label="Descripción"
                  name="description"
                  register={register}
                  error={errors.description}
                  placeholder="Cuenta la historia de tu experiencia AR... ✨"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card de Assets - Ultra Mejorada */}
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

                {/* Botones de agregar assets - Rediseñados */}
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
                          {/* Glow effect */}
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
                    ¡Agrega contenido mágico!
                  </h3>
                  <p className="text-xl text-gray-400 mb-2">
                    Modelos 3D, imágenes, videos o mensajes
                  </p>
                  <p className="text-gray-500">
                    Selecciona un tipo arriba para comenzar
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
                          {/* Animated gradient on hover */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover/asset:opacity-100 transition-opacity duration-300`}
                          ></div>

                          <CardHeader className="pb-4 relative z-10">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`p-4 bg-gradient-to-br ${config.gradient} rounded-2xl shadow-lg group-hover/asset:scale-110 transition-transform`}
                                >
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">
                                      {config.emoji}
                                    </span>
                                    <CardTitle className="text-xl text-white font-bold">
                                      {config.label}
                                    </CardTitle>
                                  </div>
                                  <p className="text-sm text-gray-400">
                                    {ASSET_KIND_DESCRIPTIONS[field.kind]}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                aria-label={`Eliminar ${config.label.toLowerCase()}`}
                                className="p-3 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-600/50 hover:border-red-500 rounded-xl text-red-400 hover:text-red-300 transition-all hover:scale-110 hover:rotate-12"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-5 relative z-10">
                            <FormInput
                              label="Nombre del asset"
                              name={`assets.${index}.name`}
                              register={register}
                              error={errors.assets?.[index]?.name}
                              required
                              placeholder={`Mi ${config.label.toLowerCase()} increíble`}
                            />

                            {field.kind === "message" ? (
                              <FormTextarea
                                label="Tu mensaje AR"
                                name={`assets.${index}.text`}
                                register={register}
                                error={errors.assets?.[index]?.text}
                                placeholder="Escribe algo asombroso que aparecerá flotando en AR... 💬✨"
                                rows={4}
                              />
                            ) : (
                              <div>
                                <label className="text-sm font-bold text-white mb-3 block">
                                  Sube tu {config.label.toLowerCase()}
                                </label>
                                <FileUpload
                                  assetKind={field.kind}
                                  onFileSelect={(file) =>
                                    handleFileSelect(file, index)
                                  }
                                  currentFileUrl={field.url}
                                />
                                {field.url && (
                                  <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border-2 border-green-500/50 flex items-center gap-3 animate-in slide-in-from-top">
                                    <div className="p-2 bg-green-500/30 rounded-full">
                                      <Check className="w-5 h-5 text-green-400" />
                                    </div>
                                    <span className="text-green-400 font-bold">
                                      ¡Archivo cargado exitosamente!
                                    </span>
                                  </div>
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

          {/* Botones de acción - Rediseñados */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-6">
            <Button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none py-6 px-8 bg-[#1a2942] hover:bg-[#243a5e] border-2 border-[#1a2942] hover:border-white/20 text-white font-bold text-lg rounded-2xl transition-all hover:scale-105"
            >
              <X className="w-5 h-5 mr-2" />
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-6 px-8 bg-gradient-to-r from-[#3DD8B6] via-[#00D4FF] to-purple-500 hover:from-[#3DD8B6]/90 hover:via-[#00D4FF]/90 hover:to-purple-500/90 text-[#0F1C2E] font-black text-lg rounded-2xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#3DD8B6]/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

              <span className="relative z-10 flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-[#0F1C2E] border-t-transparent rounded-full animate-spin"></div>
                    Creando tu experiencia...
                  </>
                ) : (
                  <>
                    <Rocket className="w-6 h-6" />
                    ¡Crear Mi Experiencia AR!
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
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </LoadingOverlay>
  );
}
