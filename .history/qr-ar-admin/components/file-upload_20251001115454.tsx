import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  cn,
  formatFileSize,
  validateFileType,
  validateFileSize,
} from "@/lib/utils";
import { ASSET_MIME_TYPES, ASSET_MAX_SIZES, AssetKind } from "@/types";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  assetKind: AssetKind;
  currentFile?: File;
  currentFileUrl?: string;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  assetKind,
  currentFile,
  currentFileUrl,
  disabled = false,
  className,
}) => {
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = ASSET_MIME_TYPES[assetKind] || [];
  const maxSize = ASSET_MAX_SIZES[assetKind] || 10 * 1024 * 1024; // 10MB default

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(
            `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(
              maxSize
            )}`
          );
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Tipo de archivo no válido");
        } else {
          setError("Error al cargar el archivo");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        if (!validateFileType(file, allowedTypes)) {
          setError("Tipo de archivo no válido");
          return;
        }

        if (!validateFileSize(file, maxSize)) {
          setError(
            `El archivo es demasiado grande. Tamaño máximo: ${formatFileSize(
              maxSize
            )}`
          );
          return;
        }

        onFileSelect(file);
      }
    },
    [onFileSelect, allowedTypes, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.length > 0 
      ? allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
      : undefined,
    maxSize,
    multiple: false,
    disabled,
  });

  const hasFile = currentFile || currentFileUrl;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : hasFile
            ? "border-green-400 bg-green-50"
            : "border-gray-300 hover:border-gray-400",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />

        {hasFile ? (
          <div className="space-y-2">
            <div className="text-green-600 text-4xl">✓</div>
            <div className="text-sm text-gray-600">
              {currentFile ? (
                <>
                  <div className="font-medium">{currentFile.name}</div>
                  <div className="text-xs">
                    {formatFileSize(currentFile.size)}
                  </div>
                </>
              ) : (
                <div className="font-medium">Archivo actual</div>
              )}
            </div>
            {onFileRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove();
                }}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                Eliminar archivo
              </button>
            )}
          </div>
        ) : isDragActive ? (
          <>
            <div className="text-blue-600 text-4xl mb-2">📁</div>
            <p className="text-blue-600">Suelta el archivo aquí...</p>
          </>
        ) : (
          <>
            <div className="text-gray-400 text-4xl mb-2">📁</div>
            <p className="text-gray-600">
              Arrastra un archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tamaño máximo: {formatFileSize(maxSize)}
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}
    </div>
  );
};
