"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FileUpload from "@/components/ui/file-upload";
import {
  deleteExperience,
  getExperienceById,
  updateExperience,
} from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Asset, Experience } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AssetType = Asset["assetType"];

interface FormData {
  title: string;
  description: string;
  assetType: AssetType;
  assetUrl?: string;
  assetContent?: string;
  file?: File;
  isActive: boolean;
}

export default function EditExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [originalExperience, setOriginalExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    assetType: "message",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadExperience = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await getExperienceById(id);

        if (response.success && response.data) {
          const normalizedExperience = normalizeExperience(response.data);
          setOriginalExperience(normalizedExperience);

          // Populate form with existing data
          setFormData({
            title: normalizedExperience.title,
            description: normalizedExperience.description || "",
            isActive: normalizedExperience.isActive,
            assetType: normalizedExperience.assets[0]?.assetType || "message",
            assetUrl: normalizedExperience.assets[0]?.assetUrl,
            assetContent: normalizedExperience.assets[0]?.assetContent,
          });
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, file: file || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        isActive: formData.isActive,
        // For now, we'll only update the basic fields
        // Asset management would require a more complex implementation
      };

      const response = await updateExperience(id, updateData);

      if (response.success) {
        router.push(`/experiences/${id}`);
      } else {
        setError(response.message || "Error actualizando la experiencia");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await deleteExperience(id);

      if (response.success) {
        router.push("/experiences");
      } else {
        setError(response.message || "Error eliminando la experiencia");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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

  if (error && !originalExperience) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-16">
          <div className="mb-6">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
            <p className="text-red-400 mb-4">{error}</p>
            <Link href="/experiences">
              <Button>Volver a Experiencias</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/experiences">
            <Button variant="ghost" size="sm">
              ← Volver
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Editar Experiencia
        </h1>
        <p className="text-blue-200">
          Modifica tu experiencia de realidad aumentada
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Información Básica
              </CardTitle>
              <CardDescription>
                Detalles generales de la experiencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"
                  placeholder="Ej: Mi primera experiencia AR"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70 resize-none"
                  placeholder="Describe tu experiencia AR..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor="isActive"
                  className="text-blue-200 text-sm font-medium"
                >
                  Experiencia activa
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Assets */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Contenido AR
              </CardTitle>
              <CardDescription>
                Configura el asset de realidad aumentada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Asset Type */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Tipo de Asset *
                </label>
                <select
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"
                >
                  <option value="message">Mensaje</option>
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                  <option value="model3d">Modelo 3D</option>
                </select>
              </div>

              {/* Asset Content - URL or Text */}
              {(formData.assetType === "image" || 
                formData.assetType === "video" || 
                formData.assetType === "audio") && (
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    URL del Asset
                  </label>
                  <input
                    type="url"
                    name="assetUrl"
                    value={formData.assetUrl || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"
                    placeholder="https://ejemplo.com/mi-asset.jpg"
                  />
                </div>
              )}

              {formData.assetType === "model" && (
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Contenido del Modelo
                  </label>
                  <textarea
                    name="assetContent"
                    value={formData.assetContent || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70 resize-none"
                    placeholder="Configuración del modelo 3D o descripción..."
                  />
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Subir Archivo (Opcional)
                </label>
                <FileUpload
                  onFileSelect={handleFileChange}
                  acceptedTypes={{
                    'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
                    'video/*': ['.mp4', '.webm', '.ogg'],
                    'audio/*': ['.mp3', '.wav', '.ogg'],
                    'model/*': ['.glb', '.gltf', '.obj']
                  }}
                />
              </div>

              {originalExperience && originalExperience.assets.length > 0 && (
                <div className="border-t border-gray-600/50 pt-4">
                  <h4 className="text-sm font-medium text-blue-200 mb-2">
                    Asset Actual
                  </h4>
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <strong>Tipo:</strong> {originalExperience.assets[0].assetType}
                    </p>
                    {originalExperience.assets[0].assetUrl && (
                      <p className="text-sm text-gray-300 truncate">
                        <strong>URL:</strong> {originalExperience.assets[0].assetUrl}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between pt-8 border-t border-gray-600/50">
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                "Actualizar Experiencia"
              )}
            </Button>

            <Link href={`/experiences/${id}`}>
              <Button
                type="button"
                variant="outline"
                className="px-8 py-3"
              >
                Cancelar
              </Button>
            </Link>
          </div>

          {/* Delete Button */}
          <div>
            {showDeleteConfirm ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 text-sm"
                >
                  {isDeleting ? "Eliminando..." : "Confirmar"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="px-4 py-2 text-sm"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 px-6 py-2 text-sm"
              >
                Eliminar Experiencia
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}