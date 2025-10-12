"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createExperience } from "@/lib/api/experiences";
import { Asset } from "@/types";
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
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));

      // Create preview for images and videos
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        setFilePreview(url);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare data based on asset type
      let experienceData = {
        title: formData.title,
        description: formData.description,
        assetType: formData.assetType,
        assetUrl: formData.assetUrl || "",
        assetContent: formData.assetContent || "",
      };

      // Handle file uploads
      if (formData.file) {
        // In a real implementation, you would upload the file to a storage service
        // For now, we'll use a placeholder URL
        const fileName = `${Date.now()}-${formData.file.name}`;
        experienceData.assetUrl = `/uploads/${formData.assetType}s/${fileName}`;
      }

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

  const getAcceptedFileTypes = () => {
    switch (formData.assetType) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "model3d":
        return ".glb,.gltf";
      default:
        return "";
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
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
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
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Subir Archivo *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={getAcceptedFileTypes()}
                    required
                    aria-label={`Subir archivo ${formData.assetType}`}
                    title={`Subir archivo ${formData.assetType}`}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
                  />
                  
                  {/* File Preview */}
                  {filePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-blue-200 mb-2">Vista previa:</p>
                      {formData.assetType === "image" && (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-full max-h-48 object-cover rounded-lg border border-gray-600/50"
                        />
                      )}
                      {formData.assetType === "video" && (
                        <video
                          src={filePreview}
                          controls
                          className="w-full max-h-48 rounded-lg border border-gray-600/50"
                        />
                      )}
                    </div>
                  )}
                </div>
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