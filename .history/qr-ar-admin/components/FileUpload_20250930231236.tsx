"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
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
        return "ar";
      case "images":
        return "view";
      case "videos":
        return "upload";
      default:
        return "upload";
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

  const getProgressClass = (progress: number): string => {
    const rounded = Math.round(progress / 10) * 10;
    return `progress-${Math.min(100, Math.max(0, rounded))}`;
  };

  return (
    <Card variant="glass" className={className}>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="p-3 rounded-lg bg-brand-500/10">
              <Icon name={getCategoryIcon()} size="xl" className="text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Subir {getCategoryLabel()}
              </h3>
              <Badge variant="outline" className="mt-1">
                Máximo {maxSize}MB
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
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
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
            ${
              dragOver
                ? "border-brand-400 bg-brand-400/10 shadow-neon-sm"
                : "border-brand-500/50 hover:border-brand-400 hover:bg-brand-400/5"
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
              <div className="p-4 rounded-lg bg-brand-500/10">
                <Icon name="upload" size="2xl" className="text-brand-400 animate-pulse" />
              </div>
              <div>
                <p className="text-foreground font-medium">Subiendo archivo...</p>
                <div className="file-upload-progress">
                  <div
                    className={`file-upload-progress-bar ${getProgressClass(
                      uploadProgress
                    )}`}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-brand-500/10">
                <Icon name={getCategoryIcon()} size="2xl" className="text-brand-400" />
              </div>
              <div>
                <p className="text-foreground font-medium">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getAcceptTypes().replace(/\./g, "").toUpperCase()}
                </p>
              </div>
              <Button variant="outline" size="sm" className="hover:shadow-neon-sm transition-all duration-300">
                <Icon name="upload" size="sm" className="mr-2" />
                Seleccionar Archivo
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
