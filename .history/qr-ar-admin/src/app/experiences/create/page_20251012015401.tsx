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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Clear opposite fields when asset type changes
    if (name === "assetType") {
      setFormData((prev) => ({
        ...prev,
        assetType: value as AssetType,
        assetUrl: "", // Clear URL when switching types
        assetContent: "", // Clear content when switching types
        file: undefined, // Clear file when switching types
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate based on asset type
      if (formData.assetType === "message") {
        if (!formData.assetContent || formData.assetContent.trim() === "") {
          setError("Debe proporcionar un mensaje de texto.");
          return;
        }
      } else if (formData.assetType === "webcontent") {
        if (!formData.assetUrl || formData.assetUrl.trim() === "") {
          setError("Debe proporcionar una URL válida para el contenido web.");
          return;
        }
        // Validate URL format
        try {
          new URL(formData.assetUrl);
        } catch {
          setError(
            "La URL proporcionada no es válida. Debe comenzar con http:// o https://"
          );
          return;
        }
      } else {
        // For file-based assets (image, video, model3d)
        if (!formData.file) {
          setError(`Debe subir un archivo de tipo ${formData.assetType}.`);
          return;
        }
      }

      // Prepare data based on asset type
      let experienceData = {
        title: formData.title,
        description: formData.description,
        assetType: formData.assetType,
        assetUrl: formData.assetUrl || "",
        assetContent: formData.assetContent || "",
      };

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
                  <option value="webcontent">Contenido Web</option>
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
              ) : formData.assetType === "webcontent" ? (
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    URL del Contenido Web *
                  </label>
                  <input
                    type="url"
                    name="assetUrl"
                    value={formData.assetUrl || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="https://ejemplo.com/contenido-web"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    💡 Proporciona la URL de una página web, aplicación web o
                    experiencia externa en línea.
                  </p>
                </div>
              ) : (
                <div>
                  <FileUpload
                    assetType={formData.assetType}
                    onUploadComplete={(result) => {
                      if (result.success && result.url) {
                        setFormData((prev) => ({
                          ...prev,
                          assetUrl: result.url,
                          file: undefined, // Clear file since it's uploaded
                        }));
                      } else {
                        setError(result.error || "Error subiendo archivo");
                      }
                    }}
                    onFileSelect={(file) => {
                      setFormData((prev) => ({
                        ...prev,
                        file,
                      }));
                      setError(null); // Clear any previous errors
                    }}
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    📁 Sube un archivo de tipo {formData.assetType} desde tu
                    dispositivo.
                  </p>
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
