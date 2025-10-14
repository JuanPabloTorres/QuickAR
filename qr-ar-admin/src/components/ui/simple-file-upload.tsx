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
          disabled={disabled}
          className="hidden"
          id={`file-input-${assetType}`}
        />

        <label
          htmlFor={`file-input-${assetType}`}
          className="block w-full p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-gray-800/30 hover:bg-gray-800/50"
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                {assetType === "image" && (
                  <svg
                    className="w-8 h-8 text-sky-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
                {assetType === "video" && (
                  <svg
                    className="w-8 h-8 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
                {assetType === "model3d" && (
                  <svg
                    className="w-8 h-8 text-pink-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                )}
              </div>
            </div>
            <p className="text-blue-200 font-medium">
              {selectedFile
                ? selectedFile.name
                : `Seleccionar ${getTypeLabel()}`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Selecciona para agregar a la lista
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

      {/* Botón para limpiar archivo */}
      {selectedFile && (
        <div className="flex gap-2">
          <Button
            onClick={clearFile}
            variant="outline"
            disabled={disabled}
            className="w-full"
          >
            ✕ Quitar Selección
          </Button>
        </div>
      )}
    </div>
  );
}
