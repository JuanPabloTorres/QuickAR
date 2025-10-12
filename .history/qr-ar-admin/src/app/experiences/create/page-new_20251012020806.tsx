"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SimpleFileUpload from "@/components/ui/simple-file-upload";
import { createExperience } from "@/lib/api/experiences";
import { Asset } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AssetType = Asset["assetType"];

interface PendingAsset {
  id: string;
  assetType: AssetType;
  name: string;
  file?: File;
  url?: string;
  content?: string;
  preview?: string;
}

interface FormData {
  title: string;
  description: string;
}

interface AddAssetFormData {
  assetType: AssetType;
  assetUrl?: string;
  assetContent?: string;
  file?: File;
}

export default function CreateExperiencePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
  });
  const [addAssetForm, setAddAssetForm] = useState<AddAssetFormData>({
    assetType: "image",
  });
  const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssetFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "assetType") {
      setAddAssetForm({
        assetType: value as AssetType,
        assetUrl: "",
        assetContent: "",
        file: undefined,
      });
    } else {
      setAddAssetForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addAssetToList = () => {
    const { assetType, assetUrl, assetContent, file } = addAssetForm;

    // Validate asset data
    let isValid = false;
    let assetName = "";

    if (assetType === "message") {
      isValid = !!(assetContent && assetContent.trim() !== "");
      assetName = assetContent?.substring(0, 30) + "..." || "Mensaje";
    } else if (assetType === "webcontent") {
      isValid = !!(assetUrl && assetUrl.trim() !== "");
      try {
        if (assetUrl) new URL(assetUrl);
        assetName = new URL(assetUrl!).hostname;
      } catch {
        setError("URL no válida");
        return;
      }
    } else {
      isValid = !!file;
      assetName = file?.name || "Archivo";
    }

    if (!isValid) {
      setError(`Datos incompletos para el asset de tipo ${assetType}`);
      return;
    }

    // Create pending asset
    const newAsset: PendingAsset = {
      id: Date.now().toString(),
      assetType,
      name: assetName,
      file,
      url: assetUrl,
      content: assetContent,
      preview: file && file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    };

    setPendingAssets((prev) => [...prev, newAsset]);

    // Reset form
    setAddAssetForm({
      assetType: "image",
      assetUrl: "",
      assetContent: "",
      file: undefined,
    });

    setError(null);
  };

  const removeAssetFromList = (id: string) => {
    setPendingAssets((prev) => {
      const asset = prev.find(a => a.id === id);
      if (asset?.preview) {
        URL.revokeObjectURL(asset.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate basic form data
      if (!formData.title.trim()) {
        setError("El título es obligatorio");
        return;
      }

      if (pendingAssets.length === 0) {
        setError("Debe agregar al menos un asset a la experiencia");
        return;
      }

      // Prepare experience data with multiple assets
      const experienceData = {
        title: formData.title,
        description: formData.description,
        assets: pendingAssets.map(asset => ({
          assetType: asset.assetType,
          name: asset.name,
          file: asset.file,
          url: asset.url,
          content: asset.content,
        })),
      };

      const response = await createExperience(experienceData);

      if (response.success) {
        // Clean up preview URLs
        pendingAssets.forEach(asset => {
          if (asset.preview) {
            URL.revokeObjectURL(asset.preview);
          }
        });
        router.push("/experiences");
      } else {
        setError(response.message || "Error creando la experiencia");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'model3d': return '🎯';
      case 'message': return '💬';
      case 'webcontent': return '🌐';
      default: return '📄';
    }
  };

  const getAssetTypeLabel = (type: AssetType) => {
    switch (type) {
      case 'image': return 'Imagen';
      case 'video': return 'Video';
      case 'model3d': return 'Modelo 3D';
      case 'message': return 'Mensaje';
      case 'webcontent': return 'Contenido Web';
      default: return 'Archivo';
    }
  };

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
        <h1 className="text-3xl font-bold text-white mb-2">
          Crear Nueva Experiencia
        </h1>
        <p className="text-blue-200">
          Configura tu experiencia de realidad aumentada con múltiples contenidos
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Información Básica
              </CardTitle>
              <CardDescription>
                Datos principales de tu experiencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="Nombre de tu experiencia AR"
                />
              </div>

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
                  placeholder="Describe tu experiencia..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Middle Column - Add Asset */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Agregar Contenido
              </CardTitle>
              <CardDescription>
                Añade contenidos a tu experiencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Tipo de Contenido
                </label>
                <select
                  name="assetType"
                  value={addAssetForm.assetType}
                  onChange={handleAssetFormChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                >
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                  <option value="model3d">Modelo 3D</option>
                  <option value="message">Mensaje de Texto</option>
                  <option value="webcontent">Contenido Web</option>
                </select>
              </div>

              {/* Dynamic content based on asset type */}
              {addAssetForm.assetType === "message" ? (
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Mensaje de Texto *
                  </label>
                  <textarea
                    name="assetContent"
                    value={addAssetForm.assetContent || ""}
                    onChange={handleAssetFormChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>
              ) : addAssetForm.assetType === "webcontent" ? (
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    URL del Contenido Web *
                  </label>
                  <input
                    type="url"
                    name="assetUrl"
                    value={addAssetForm.assetUrl || ""}
                    onChange={handleAssetFormChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="https://ejemplo.com/contenido-web"
                  />
                </div>
              ) : (
                <div>
                  <SimpleFileUpload
                    assetType={addAssetForm.assetType}
                    onFileSelect={(file: File) => {
                      setAddAssetForm((prev) => ({ ...prev, file }));
                      setError(null);
                    }}
                    onError={(error: string) => {
                      setError(error);
                    }}
                  />
                </div>
              )}

              <Button
                type="button"
                onClick={addAssetToList}
                variant="outline"
                className="w-full bg-blue-600/20 border-blue-500/30 hover:bg-blue-600/30"
              >
                + Agregar a la Lista
              </Button>
            </CardContent>
          </Card>

          {/* Right Column - Assets List */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Contenidos Agregados ({pendingAssets.length})
              </CardTitle>
              <CardDescription>
                Lista de contenidos para esta experiencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAssets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay contenidos agregados</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Usa el formulario de la izquierda para agregar contenido
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-600/30"
                    >
                      <div className="text-2xl">
                        {getAssetIcon(asset.assetType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {asset.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {getAssetTypeLabel(asset.assetType)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAssetFromList(asset.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-600/30">
          <Link href="/experiences">
            <Button variant="ghost" className="w-full sm:w-auto">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading || pendingAssets.length === 0}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Creando..." : `Crear Experiencia (${pendingAssets.length} contenidos)`}
          </Button>
        </div>
      </form>
    </div>
  );
}