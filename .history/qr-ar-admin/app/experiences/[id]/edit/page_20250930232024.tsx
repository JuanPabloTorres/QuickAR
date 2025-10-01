"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { FormInput, FormTextarea, FormSelect } from "@/components/ui/form";
import { FileUpload } from "@/components/file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingOverlay, Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import { generateSlug, formatFileSize } from "@/lib/utils";
import { experienceFormSchema, ExperienceFormData } from "@/lib/validations";
import { AssetKind, ASSET_KIND_LABELS, ASSET_KIND_DESCRIPTIONS, ExperienceDto, AssetDto } from "@/types";
import Link from "next/link";

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

  // Load experience data
  useEffect(() => {
    if (experienceId) {
      loadExperience();
    }
  }, [experienceId]);

  // Auto-generate slug from title (only if slug is empty)
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
        
        // Populate form with existing data
        reset({
          title: exp.title,
          slug: exp.slug,
          description: exp.description || "",
          isActive: exp.isActive,
          assets: exp.assets.map(asset => ({
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
      // If asset has ID, it exists in the database - ask for confirmation
      if (!confirm(`¿Estás seguro de que quieres eliminar el asset "${asset.name}"?`)) {
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

      const response = await apiClient.updateExperience(experienceId, {
        title: data.title,
        slug: data.slug,
        description: data.description,
        isActive: data.isActive,
        assets: data.assets.map(asset => ({
          id: asset.id,
          name: asset.name,
          kind: asset.kind,
          url: asset.url,
          mimeType: asset.mimeType,
          fileSizeBytes: asset.fileSizeBytes,
          text: asset.text,
        })),
      });

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" variant="brand" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div>
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Experiencia no encontrada"}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/experiences">
            <Button variant="outline">
              <Icon name="home" size="sm" className="mr-2" />
              Volver a Experiencias
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LoadingOverlay isLoading={isSubmitting} loadingText="Actualizando experiencia...">
      <div className="space-y-8">
        <PageHeader
          title="Editar Experiencia"
          description={`Editando: ${experience.title}`}
          action={
            <div className="flex space-x-2">
              <Link href={`/experiences/${experienceId}`}>
                <Button variant="ghost">
                  <Icon name="close" size="sm" className="mr-2" />
                  Cancelar
                </Button>
              </Link>
              <Link href={`/x/${experience.slug}`} target="_blank">
                <Button variant="outline">
                  <Icon name="ar" size="sm" className="mr-2" />
                  Vista Previa AR
                </Button>
              </Link>
            </div>
          }
        />

        {error && (
          <Alert variant="destructive">
            <Icon name="warning" size="sm" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icon name="settings" size="lg" className="text-brand-400" />
                <span>Información Básica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormInput
                label="Título de la Experiencia"
                placeholder="Ej: Mi Primera Experiencia AR"
                register={register("title")}
                error={errors.title}
                required
              />

              <FormInput
                label="Slug (URL)"
                placeholder="mi-primera-experiencia-ar"
                register={register("slug")}
                error={errors.slug}
                hint="Se usará en la URL pública: /x/tu-slug"
                required
              />

              <FormTextarea
                label="Descripción"
                placeholder="Describe tu experiencia AR..."
                register={register("description")}
                error={errors.description}
                rows={3}
              />

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register("isActive")}
                  className="w-4 h-4 text-brand-600 bg-slate-700 border-slate-600 rounded focus:ring-brand-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                  Experiencia activa (visible públicamente)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Assets */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="upload" size="lg" className="text-brand-400" />
                  <span>Assets ({fields.length})</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAsset("model3d")}
                  >
                    <Icon name="ar" size="sm" className="mr-1" />
                    Modelo 3D
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAsset("image")}
                  >
                    <Icon name="view" size="sm" className="mr-1" />
                    Imagen
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAsset("video")}
                  >
                    <Icon name="upload" size="sm" className="mr-1" />
                    Video
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAsset("message")}
                  >
                    <Icon name="info" size="sm" className="mr-1" />
                    Mensaje
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="upload" size="2xl" className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No hay assets en esta experiencia. Agrega contenido usando los botones de arriba.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <Card key={field.id} variant="elevated" className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">
                            {ASSET_KIND_LABELS[field.kind as AssetKind]}
                          </Badge>
                          <FormInput
                            label=""
                            placeholder="Nombre del asset"
                            register={register(`assets.${index}.name`)}
                            className="flex-1"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAsset(index)}
                        >
                          <Icon name="delete" size="sm" />
                        </Button>
                      </div>

                      {field.kind === "message" ? (
                        <FormTextarea
                          label="Texto del mensaje"
                          placeholder="Escribe tu mensaje aquí..."
                          register={register(`assets.${index}.text`)}
                          rows={3}
                        />
                      ) : (
                        <div className="space-y-4">
                          {field.url ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    Archivo cargado
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {field.mimeType} • {formatFileSize(field.fileSizeBytes || 0)}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => update(index, { ...field, url: "", mimeType: "", fileSizeBytes: 0 })}
                                >
                                  <Icon name="delete" size="sm" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <FileUpload
                              category={
                                field.kind === "model3d"
                                  ? "models"
                                  : field.kind === "image"
                                  ? "images"
                                  : "videos"
                              }
                              onUploadSuccess={(result: any) => {
                                update(index, {
                                  ...field,
                                  url: result.url,
                                  mimeType: result.mimeType,
                                  fileSizeBytes: result.sizeBytes,
                                });
                              }}
                              onUploadError={(error: string) => setError(error)}
                              className="mt-2"
                            />
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex items-center justify-between">
            <Link href={`/experiences/${experienceId}`}>
              <Button type="button" variant="ghost">
                <Icon name="close" size="sm" className="mr-2" />
                Cancelar
              </Button>
            </Link>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="hover:shadow-neon-md transition-all duration-300"
              >
                <Icon name="check" size="sm" className="mr-2" />
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </LoadingOverlay>
  );
}