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
import { createExperience } from "@/lib/api/experiences";
import { Asset, AssetCreateDto, ExperienceCreateDto } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AssetType = Asset["assetType"];

interface FormData {
  title: string;
  description: string;
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
    assetType: "image",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate that we have an asset
      if (formData.assetType === "message" && !formData.assetContent?.trim()) {
        setError("Por favor, proporciona un mensaje de texto");
        return;
      }

      if (formData.assetType !== "message" && !formData.assetUrl?.trim()) {
        setError("Por favor, sube un archivo o proporciona una URL");
        return;
      }

      // Prepare asset based on asset type
      let asset: AssetCreateDto = {
        name: formData.title, // Use title as asset name
        kind: formData.assetType,
      };

      if (formData.assetType === "message") {
        asset.text = formData.assetContent;
      } else {
        asset.url = formData.assetUrl;
        // Set MIME type based on asset type and URL
        if (formData.assetUrl) {
          const extension = formData.assetUrl.split('.').pop()?.toLowerCase();
          if (formData.assetType === "image") {
            asset.mimeType = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : 
                            extension === "png" ? "image/png" : 
                            extension === "gif" ? "image/gif" : 
                            "image/*";
          } else if (formData.assetType === "video") {
            asset.mimeType = extension === "mp4" ? "video/mp4" : 
                            extension === "webm" ? "video/webm" : 
                            extension === "mov" ? "video/quicktime" :
                            "video/*";
          } else if (formData.assetType === "model3d") {
            asset.mimeType = extension === "glb" ? "model/gltf-binary" : 
                            extension === "gltf" ? "model/gltf+json" :
                            "model/*";
          }
        }
      }

      // Create experience data in the correct format for the backend
      const experienceData: ExperienceCreateDto = {
        title: formData.title,
        description: formData.description || undefined,
        assets: [asset] // Backend expects an array of assets
      };

      console.log('Sending experience data:', experienceData);

      const response = await createExperience(experienceData);

      if (response.success) {
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
          Crear Nueva Experiencia
        </h1>
        <p className="text-blue-200">
          Configura tu experiencia de realidad aumentada
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

              {/* Asset Type */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Tipo de Contenido *
                </label>
                <select
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"
                >
                  <option value="image">Imagen</option>
                  <option value="video">Video</option>
                  <option value="model3d">Modelo 3D</option>
                  <option value="message">Mensaje de Texto</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Asset Content */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Contenido del Asset
              </CardTitle>
              <CardDescription>
                Configura el contenido de tu experiencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dynamic content based on asset type */}
              {formData.assetType === "message" ? (
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Mensaje de Texto *
                  </label>
                  <textarea
                    name="assetContent"
                    value={formData.assetContent || ""}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>
              ) : (
                <FileUpload
                  assetType={formData.assetType}
                  onUploadComplete={(result) => {
                    console.log('File upload result:', result);
                    if (result.success && result.url) {
                      console.log('Setting asset URL:', result.url);
                      setFormData((prev) => ({
                        ...prev,
                        assetUrl: result.url,
                        file: undefined, // Clear file since it's uploaded
                      }));
                    } else {
                      console.error('Upload failed:', result.error);
                      setError(result.error || "Error subiendo archivo");
                    }
                  }}
                  onFileSelect={(file) => {
                    console.log('File selected:', file.name);
                    setFormData((prev) => ({ ...prev, file }));
                    setError(null); // Clear any previous errors
                  }}
                />
              )}

              {/* URL Option for non-file assets */}
              {formData.assetType !== "message" && (
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    O proporciona una URL
                  </label>
                  <input
                    type="url"
                    name="assetUrl"
                    value={formData.assetUrl || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="https://ejemplo.com/archivo..."
                  />
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
            disabled={isLoading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Creando..." : "Crear Experiencia"}
          </Button>
        </div>
      </form>
    </div>
  );
}
