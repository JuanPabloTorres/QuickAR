"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api";
import { FileUploadResult } from "@/types";
import "./file-upload.css";

interface FileUploadProps {
  category: "models" | "images" | "videos";
  onUploadSuccess?: (result: FileUploadResult) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  category,
  onUploadSuccess,
  onUploadError,
  accept,
  maxSize = 50,
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptTypes = () => {
    if (accept) return accept;

    switch (category) {
      case "models":
        return ".glb,.gltf,.obj,.fbx,.dae,.3ds";
      case "images":
        return ".jpg,.jpeg,.png,.gif,.webp,.svg";
      case "videos":
        return ".mp4,.mov,.avi,.webm,.mkv";
      default:
        return "";
    }
  };

  const validateFile = (file: File): string | null => {
    // Size validation
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`;
    }

    // Type validation
    const acceptTypes = getAcceptTypes()
      .split(",")
      .map((t) => t.trim().toLowerCase());
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    if (acceptTypes.length > 0 && !acceptTypes.includes(fileExtension)) {
      return `Tipo de archivo no válido. Tipos permitidos: ${acceptTypes.join(
        ", "
      )}`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        if (onUploadError) onUploadError(validationError);
        return;
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await apiClient.uploadFile(file, category);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        if (onUploadSuccess) onUploadSuccess(response.data);
      } else {
        const errorMsg = response.message || "Error al subir el archivo";
        setError(errorMsg);
        if (onUploadError) onUploadError(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Error al subir el archivo";
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getCategoryIcon = () => {
    switch (category) {
      case "models":
        return "🧊";
      case "images":
        return "🖼️";
      case "videos":
        return "🎥";
      default:
        return "📎";
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case "models":
        return "Modelos 3D";
      case "images":
        return "Imágenes";
      case "videos":
        return "Videos";
      default:
        return "Archivos";
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          {getCategoryIcon()} Subir {getCategoryLabel()}
        </h3>
        <p className="text-sm text-blue-200">
          Arrastra y suelta archivos aquí o haz clic para seleccionar
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            dragOver
              ? "border-blue-400 bg-blue-400/10"
              : "border-blue-300 hover:border-blue-400 hover:bg-blue-400/5"
          }
          ${uploading ? "pointer-events-none opacity-50" : ""}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptTypes()}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          aria-label={`Seleccionar archivo de ${getCategoryLabel()}`}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="text-4xl">⬆️</div>
            <div>
              <p className="text-white font-medium">Subiendo archivo...</p>
              <div className="file-upload-progress">
                <div
                  className="file-upload-progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-200 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl">{getCategoryIcon()}</div>
            <div>
              <p className="text-white font-medium">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-blue-200 mt-1">
                Máximo {maxSize}MB •{" "}
                {getAcceptTypes().replace(/\./g, "").toUpperCase()}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Seleccionar Archivo
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
