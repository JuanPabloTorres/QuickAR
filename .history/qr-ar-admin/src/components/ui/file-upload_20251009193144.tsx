"use client";

import { Button } from "@/components/ui/button";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import FileUploadService, { UploadProgress, UploadResult } from "@/lib/upload";
import { Asset } from "@/types";
import React, { useRef, useState } from "react";

type AssetType = Asset["assetType"];

interface FileUploadProps {
  assetType: AssetType;
  onUploadComplete?: (result: UploadResult) => void;
  onFileSelect?: (file: File) => void;
  className?: string;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
}

export function FileUpload({
  assetType,
  onUploadComplete,
  onFileSelect,
  className = "",
  multiple = false,
  disabled = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous state
    setError(null);
    if (previewUrl) {
      FileUploadService.revokePreviewUrl(previewUrl);
    }

    // Validate file
    const validation = FileUploadService.validateFile(file, assetType);
    if (!validation.isValid) {
      setError(validation.error || "Archivo inválido");
      return;
    }

    setSelectedFile(file);

    // Generate preview for supported file types
    if (
      FileUploadService.isImageFile(file) ||
      FileUploadService.isVideoFile(file)
    ) {
      const preview = FileUploadService.generatePreviewUrl(file);
      setPreviewUrl(preview);
    }

    onFileSelect?.(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(null);
    setError(null);

    try {
      const result = await FileUploadService.uploadFile(
        selectedFile,
        assetType,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        onUploadComplete?.(result);
      } else {
        setError(result.error || "Error subiendo archivo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      FileUploadService.revokePreviewUrl(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getAcceptedTypes = () => {
    switch (assetType) {
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

  const getAssetTypeLabel = () => {
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
      {/* File Input */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedTypes()}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          multiple={multiple}
          className="hidden"
          aria-label={`Seleccionar ${getAssetTypeLabel()}`}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
            ${
              disabled || isUploading
                ? "border-gray-600 bg-gray-800/20 cursor-not-allowed"
                : "border-gray-600/50 bg-gray-900/30 hover:border-blue-500/50 hover:bg-gray-900/50"
            }
          `}
        >
          <div className="space-y-3">
            <div className="flex justify-center">
              <QuickArLogo size={48} />
            </div>

            <div>
              <p className="text-white font-medium">
                Haz clic para seleccionar {getAssetTypeLabel()}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                o arrastra y suelta aquí
              </p>
            </div>

            {/* File type info */}
            <div className="text-xs text-gray-500">
              {assetType === "image" && "JPG, PNG, GIF, WEBP - Máx. 10MB"}
              {assetType === "video" && "MP4, WEBM, OGG - Máx. 100MB"}
              {assetType === "model3d" && "GLB, GLTF - Máx. 50MB"}
            </div>
          </div>
        </div>
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="p-4 bg-gray-800/30 border border-gray-600/30 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-400">
                {FileUploadService.formatFileSize(selectedFile.size)}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={isUploading}
              className="ml-2 text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>

          {/* Progress Bar */}
          {uploadProgress && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Subiendo...</span>
                <span>{uploadProgress.percentage}%</span>
              </div>
              <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  data-progress={uploadProgress.percentage}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          {!isUploading && !uploadProgress && (
            <div className="mt-3">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                📤 Subir {getAssetTypeLabel()}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="p-4 bg-gray-800/30 border border-gray-600/30 rounded-lg">
          <p className="text-sm text-gray-400 mb-3">Vista previa:</p>

          {FileUploadService.isImageFile(selectedFile!) && (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-48 mx-auto rounded border border-gray-600/50"
            />
          )}

          {FileUploadService.isVideoFile(selectedFile!) && (
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-48 mx-auto rounded border border-gray-600/50"
            />
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
