"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  getExperienceById, 
  updateExperience,
  deleteExperience 
} from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Experience, Asset } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AssetType = Asset["assetType"];

interface FormData {
  title: string;
  description: string;
  isActive: boolean;
  assets: {
    id?: string;
    name: string;
    assetType: AssetType;
    assetUrl?: string;
    assetContent?: string;
    file?: File;
  }[];
}

export default function EditExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [originalExperience, setOriginalExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    isActive: true,
    assets: []
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
            assets: normalizedExperience.assets.map(asset => ({
              id: asset.id,
              name: asset.name,
              assetType: asset.assetType,
              assetUrl: asset.assetUrl,
              assetContent: asset.assetContent
            }))
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAssetChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === index ? { ...asset, [field]: value } : asset
      )
    }));
  };

  const addAsset = () => {
    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, {
        name: `Asset ${prev.assets.length + 1}`,
        assetType: "image",
        assetUrl: "",
        assetContent: ""
      }]
    }));
  };

  const removeAsset = (index: number) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== index)
    }));
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/experiences/${id}`}>
            <Button variant="ghost" size="sm">
              ← Volver
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Editar Experiencia
        </h1>
        <p className="text-blue-200">
          Modifica los detalles de tu experiencia AR
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
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
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
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
              <label htmlFor="isActive" className="text-blue-200 text-sm font-medium">
                Experiencia activa
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Assets Section (Read-only for now) */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <span>📦</span>
              Assets Actuales ({formData.assets.length})
            </CardTitle>
            <CardDescription>
              Los assets se pueden gestionar desde la vista principal por ahora
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formData.assets.length > 0 ? (
              <div className="space-y-4">
                {formData.assets.map((asset, index) => (
                  <div
                    key={asset.id || index}
                    className="p-4 bg-gray-800/30 border border-gray-600/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-blue-400">
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-white">
                        {asset.name}
                      </span>
                      <span className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-xs text-blue-300">
                        {asset.assetType}
                      </span>
                    </div>
                    
                    {asset.assetType === "message" && asset.assetContent && (
                      <div className="mt-2 p-2 bg-gray-700/30 rounded text-sm text-gray-300">
                        {asset.assetContent.substring(0, 100)}
                        {asset.assetContent.length > 100 && "..."}
                      </div>
                    )}
                    
                    {asset.assetUrl && asset.assetType !== "message" && (
                      <div className="mt-2 text-xs text-gray-400 break-all">
                        {asset.assetUrl}
                      </div>
                    )}
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-600/30">
          {/* Left side - Delete */}
          <div>
            <Button
              type="button"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              🗑️ Eliminar Experiencia
            </Button>
          </div>

          {/* Right side - Save/Cancel */}
          <div className="flex gap-4">
            <Link href={`/experiences/${id}`}>
              <Button variant="ghost" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres eliminar esta experiencia? Esta acción no se puede deshacer.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Experiencia: <span className="font-medium text-white">{formData.title}</span>
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}