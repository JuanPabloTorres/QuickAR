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
  Info,
  MessageSquare,
  Sparkles,
  Trash2,
  Video,
  X,
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

const ASSET_COLORS = {
  model3d: {
    bg: "bg-[#3DD8B6]/20",
    border: "border-[#3DD8B6]/30",
    text: "text-[#3DD8B6]",
  },
  image: {
    bg: "bg-[#00D4FF]/20",
    border: "border-[#00D4FF]/30",
    text: "text-[#00D4FF]",
  },
  video: {
    bg: "bg-[#3DD8B6]/20",
    border: "border-[#3DD8B6]/30",
    text: "text-[#3DD8B6]",
  },
  message: {
    bg: "bg-[#00D4FF]/20",
    border: "border-[#00D4FF]/30",
    text: "text-[#00D4FF]",
  },
};

export default function NewExperiencePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="space-y-6">
        {/* Header mejorado */}
        <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[#0F1C2E] via-[#1a2942] to-[#0F1C2E] overflow-hidden border-2 border-[#3DD8B6]/20">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #3DD8B6 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            ></div>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3DD8B6]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4FF]/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-7 h-7 text-[#3DD8B6] animate-pulse" />
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Nueva Experiencia AR
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Crea una nueva experiencia de realidad aumentada
            </p>
          </div>
        </div>

        {error && (
          <Alert className="border-2 border-red-500/30 bg-red-950/20 animate-in slide-in-from-top">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Card de Información Básica */}
          <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/80 backdrop-blur-sm hover:border-[#3DD8B6]/50 transition-all duration-300">
            <CardHeader className="border-b border-[#1a2942]">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-[#3DD8B6]/20 rounded-xl border-2 border-[#3DD8B6]/30">
                  <Info className="w-5 h-5 text-[#3DD8B6]" />
                </div>
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div>
                <FormInput
                  label="Título"
                  name="title"
                  register={register}
                  error={errors.title}
                  required
                  placeholder="Ej: Mi primera experiencia AR"
                />
              </div>

              <div>
                <FormInput
                  label="Slug (URL)"
                  name="slug"
                  register={register}
                  error={errors.slug}
                  placeholder="Se genera automáticamente del título"
                />
                {watchedSlug && (
                  <div className="mt-2 p-3 bg-[#1a2942]/50 rounded-lg border border-[#00D4FF]/20">
                    <p className="text-sm text-gray-400">
                      URL de la experiencia:{" "}
                      <span className="text-[#00D4FF] font-mono">
                        /x/{watchedSlug}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <FormTextarea
                  label="Descripción"
                  name="description"
                  register={register}
                  error={errors.description}
                  placeholder="Describe tu experiencia AR..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card de Assets */}
          <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/80 backdrop-blur-sm hover:border-[#3DD8B6]/50 transition-all duration-300">
            <CardHeader className="border-b border-[#1a2942]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-[#00D4FF]/20 rounded-xl border-2 border-[#00D4FF]/30">
                    <Box className="w-5 h-5 text-[#00D4FF]" />
                  </div>
                  Assets de la Experiencia
                  {fields.length > 0 && (
                    <span className="text-sm font-normal px-3 py-1 bg-[#3DD8B6]/20 text-[#3DD8B6] rounded-full border border-[#3DD8B6]/30">
                      {fields.length}
                    </span>
                  )}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ASSET_KIND_LABELS) as AssetKind[]).map(
                    (kind) => {
                      const Icon = ASSET_ICONS[kind];
                      const colors = ASSET_COLORS[kind];

                      return (
                        <Button
                          key={kind}
                          type="button"
                          size="sm"
                          onClick={() => addAsset(kind)}
                          className={`${colors.bg} border-2 ${colors.border} ${colors.text} hover:scale-105 transition-all font-semibold`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {ASSET_KIND_LABELS[kind]}
                        </Button>
                      );
                    }
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {fields.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative inline-block mb-6">
                    <div className="text-7xl">📦</div>
                    <div className="absolute inset-0 bg-[#3DD8B6]/20 blur-3xl"></div>
                  </div>
                  <p className="text-gray-400 text-xl font-medium mb-3">
                    No hay assets aún
                  </p>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Agrega modelos 3D, imágenes, videos o mensajes de texto a tu
                    experiencia AR
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {(Object.keys(ASSET_KIND_LABELS) as AssetKind[]).map(
                      (kind) => {
                        const Icon = ASSET_ICONS[kind];
                        const colors = ASSET_COLORS[kind];

                        return (
                          <Button
                            key={kind}
                            type="button"
                            onClick={() => addAsset(kind)}
                            className={`${colors.bg} border-2 ${colors.border} ${colors.text} hover:scale-105 transition-all font-semibold`}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            Agregar {ASSET_KIND_LABELS[kind]}
                          </Button>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {fields.map((field, index) => {
                    const Icon = ASSET_ICONS[field.kind];
                    const colors = ASSET_COLORS[field.kind];

                    return (
                      <Card
                        key={field.id}
                        className="border-2 border-[#1a2942] bg-[#0F1C2E]/50 backdrop-blur-sm hover:border-[#3DD8B6]/30 transition-all"
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2.5 ${colors.bg} rounded-xl border-2 ${colors.border}`}
                              >
                                <Icon className={`w-5 h-5 ${colors.text}`} />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-white">
                                  {ASSET_KIND_LABELS[field.kind]}
                                </CardTitle>
                                <p className="text-sm text-gray-400 mt-1">
                                  {ASSET_KIND_DESCRIPTIONS[field.kind]}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => remove(index)}
                              className="bg-red-600/20 hover:bg-red-600/30 border-2 border-red-600/50 hover:border-red-500 text-red-400 hover:text-red-300 transition-all"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormInput
                            label="Nombre del Asset"
                            name={`assets.${index}.name`}
                            register={register}
                            error={errors.assets?.[index]?.name}
                            required
                            placeholder={`Nombre del ${ASSET_KIND_LABELS[
                              field.kind
                            ].toLowerCase()}`}
                          />

                          {field.kind === "message" ? (
                            <FormTextarea
                              label="Texto del Mensaje"
                              name={`assets.${index}.text`}
                              register={register}
                              error={errors.assets?.[index]?.text}
                              placeholder="Escribe el mensaje que aparecerá en AR..."
                              rows={4}
                            />
                          ) : (
                            <div>
                              <label className="text-sm font-medium text-white mb-2 block">
                                Archivo {ASSET_KIND_LABELS[field.kind]}
                              </label>
                              <FileUpload
                                assetKind={field.kind}
                                onFileSelect={(file) =>
                                  handleFileSelect(file, index)
                                }
                                currentFileUrl={field.url}
                              />
                              {field.url && (
                                <div className="mt-3 p-3 bg-[#3DD8B6]/10 rounded-lg border border-[#3DD8B6]/30 flex items-center gap-2">
                                  <Check className="w-4 h-4 text-[#3DD8B6]" />
                                  <span className="text-sm text-[#3DD8B6] font-medium">
                                    Archivo cargado correctamente
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              onClick={() => router.back()}
              className="bg-[#1a2942] hover:bg-[#243a5e] border-2 border-[#1a2942] hover:border-[#3DD8B6]/30 text-white font-semibold transition-all hover:scale-105 order-2 sm:order-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] hover:from-[#3DD8B6]/90 hover:to-[#00D4FF]/90 text-[#0F1C2E] font-bold transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#3DD8B6]/30 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0F1C2E] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Crear Experiencia
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </LoadingOverlay>
  );
}
