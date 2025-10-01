'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form';
import { FileUpload } from '@/components/file-upload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingOverlay } from '@/components/ui/loader';
import { apiClient } from '@/lib/api';
import { generateSlug } from '@/lib/utils';
import { experienceFormSchema, ExperienceFormData } from '@/lib/validations';
import { AssetKind, ASSET_KIND_LABELS, ASSET_KIND_DESCRIPTIONS } from '@/types';

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
    formState: { errors }
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      isActive: true,
      assets: []
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'assets'
  });

  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');

  // Auto-generate slug from title
  React.useEffect(() => {
    if (watchedTitle && !watchedSlug) {
      setValue('slug', generateSlug(watchedTitle));
    }
  }, [watchedTitle, watchedSlug, setValue]);

  const addAsset = (kind: AssetKind) => {
    append({
      name: '',
      kind,
      url: '',
      mimeType: '',
      fileSizeBytes: 0,
      text: kind === 'message' ? '' : undefined,
    });
  };

  const handleFileSelect = async (file: File, assetIndex: number) => {
    try {
      const asset = fields[assetIndex];
      const category = asset.kind === 'model3d' ? 'models' : 
                     asset.kind === 'image' ? 'images' : 'videos';
      
      const response = await apiClient.uploadFile(file, category);
      
      if (response.success && response.data) {
        update(assetIndex, {
          ...asset,
          url: response.data.url,
          mimeType: response.data.mimeType,
          fileSizeBytes: response.data.sizeBytes,
        });
      } else {
        setError(response.message || 'Error al subir el archivo');
      }
    } catch (err) {
      setError('Error al subir el archivo');
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
        assets: data.assets.map(asset => ({
          name: asset.name,
          kind: asset.kind,
          url: asset.url || undefined,
          mimeType: asset.mimeType || undefined,
          fileSizeBytes: asset.fileSizeBytes || undefined,
          text: asset.text || undefined,
        }))
      });

      if (response.success && response.data) {
        router.push(`/experiences/${response.data.id}`);
      } else {
        setError(response.message || 'Error al crear la experiencia');
      }
    } catch (err) {
      setError('Error al crear la experiencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoadingOverlay isLoading={isSubmitting}>
      <div>
        <PageHeader
          title="Nueva Experiencia AR"
          description="Crea una nueva experiencia de realidad aumentada"
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput
                label="Título"
                name="title"
                register={register}
                error={errors.title}
                required
                placeholder="Ej: Mi primera experiencia AR"
              />

              <FormInput
                label="Slug (URL)"
                name="slug"
                register={register}
                error={errors.slug}
                placeholder="Se genera automáticamente del título"
              />

              <FormTextarea
                label="Descripción"
                name="description"
                register={register}
                error={errors.description}
                placeholder="Describe tu experiencia AR..."
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assets de la Experiencia</CardTitle>
                <div className="flex space-x-2">
                  {(Object.keys(ASSET_KIND_LABELS) as AssetKind[]).map((kind) => (
                    <Button
                      key={kind}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAsset(kind)}
                    >
                      + {ASSET_KIND_LABELS[kind]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-blue-200 mb-4">
                    No hay assets aún. Agrega contenido a tu experiencia.
                  </p>
                  <p className="text-sm text-blue-300">
                    Puedes agregar modelos 3D, imágenes, videos o mensajes de texto.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="glass-dark">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {ASSET_KIND_LABELS[field.kind]}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            Eliminar
                          </Button>
                        </div>
                        <p className="text-sm text-blue-200">
                          {ASSET_KIND_DESCRIPTIONS[field.kind]}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormInput
                          label="Nombre del Asset"
                          name={`assets.${index}.name`}
                          register={register}
                          error={errors.assets?.[index]?.name}
                          required
                          placeholder={`Nombre del ${ASSET_KIND_LABELS[field.kind].toLowerCase()}`}
                        />

                        {field.kind === 'message' ? (
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
                              onFileSelect={(file) => handleFileSelect(file, index)}
                              currentFileUrl={field.url}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Experiencia'}
            </Button>
          </div>
        </form>
      </div>
    </LoadingOverlay>
  );
}