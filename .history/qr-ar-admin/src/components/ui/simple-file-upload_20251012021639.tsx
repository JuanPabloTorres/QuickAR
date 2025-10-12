"use client";

import { Button } from "@/components/ui/button";
import { SimpleUploadService } from "@/lib/simple-upload";
import { Asset } from "@/types";
import React, { useRef, useState } from "react";

type AssetType = Asset["assetType"];

interface SimpleFileUploadProps {
  assetType: AssetType;
  onFileSelect?: (file: File) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function SimpleFileUpload({
  assetType,
  onFileSelect,
  onError,
  disabled = false,
  className = "",
}: SimpleFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limpiar preview anterior
    if (previewUrl) {
      SimpleUploadService.revokePreview(previewUrl);
      setPreviewUrl(null);
    }

    // Validar archivo
    const validation = SimpleUploadService.validateFile(file, assetType);
    if (!validation.isValid) {
      onError?.(validation.error || "Archivo inválido");
      return;
    }

    // Establecer archivo seleccionado
    setSelectedFile(file);
    onFileSelect?.(file);

    // Generar preview si es posible
    const preview = SimpleUploadService.generatePreview(file);
    if (preview) {
      setPreviewUrl(preview);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const result = await SimpleUploadService.uploadFile(
        selectedFile,
        assetType
      );

      if (result.success && result.url) {
        onUploadComplete?.(result.url);
        clearFile(); // Limpiar después de upload exitoso
      } else {
        onError?.(result.error || "Error en el upload");
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      SimpleUploadService.revokePreview(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getAcceptedTypes = () => {
    switch (assetType) {
      case "image":
        return ".jpg,.jpeg,.png,.gif,.webp";
      case "video":
        return ".mp4,.webm,.ogg";
      case "model3d":
        return ".glb,.gltf";
      default:
        return "";
    }
  };

  const getTypeLabel = () => {
    switch (assetType) {
      case "image":
        return "imagen";
      case "video":
        return "video";
      case "model3d":
        return "modelo 3D";
      default:
        return "archivo";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input de archivo */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedTypes()}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
          id={`file-input-${assetType}`}
        />

        <label
          htmlFor={`file-input-${assetType}`}
          className="block w-full p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-800/30 hover:bg-gray-800/50"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">
              {assetType === "image" && "🖼️"}
              {assetType === "video" && "🎥"}
              {assetType === "model3d" && "🎯"}
            </div>
            <p className="text-blue-200 font-medium">
              {selectedFile
                ? selectedFile.name
                : `Seleccionar ${getTypeLabel()}`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Arrastra y suelta o haz clic para seleccionar
            </p>
          </div>
        </label>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="mt-4">
          <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
            {assetType === "image" && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            {assetType === "video" && (
              <video
                src={previewUrl}
                className="w-full h-full object-cover"
                controls={false}
                muted
              />
            )}
            {assetType === "model3d" && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">📦</div>
                  <p className="text-sm text-gray-400">
                    Modelo 3D seleccionado
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Información del archivo */}
      {selectedFile && (
        <div className="text-sm text-gray-400 space-y-1">
          <p>
            <strong>Archivo:</strong> {selectedFile.name}
          </p>
          <p>
            <strong>Tamaño:</strong>{" "}
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <p>
            <strong>Tipo:</strong> {selectedFile.type || "Desconocido"}
          </p>
        </div>
      )}

      {/* Botones de acción */}
      {selectedFile && (
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={isUploading || disabled}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? "Subiendo..." : "Subir Archivo"}
          </Button>
          <Button
            onClick={clearFile}
            variant="outline"
            disabled={isUploading || disabled}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
