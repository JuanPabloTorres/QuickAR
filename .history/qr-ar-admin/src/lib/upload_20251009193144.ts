export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  message?: string;
  error?: string;
}

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export class FileUploadService {
  private static readonly DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

  private static readonly TYPE_CONFIGS: Record<string, FileValidationOptions> =
    {
      image: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      },
      video: {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: ["video/mp4", "video/webm", "video/ogg"],
        allowedExtensions: [".mp4", ".webm", ".ogg"],
      },
      model3d: {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: [
          "model/gltf-binary",
          "model/gltf+json",
          "application/octet-stream",
        ],
        allowedExtensions: [".glb", ".gltf"],
      },
    };

  static validateFile(
    file: File,
    assetType: string
  ): { isValid: boolean; error?: string } {
    const config = this.TYPE_CONFIGS[assetType];

    if (!config) {
      return { isValid: false, error: "Tipo de archivo no soportado" };
    }

    // Check file size
    if (file.size > config.maxSize!) {
      const maxSizeMB = Math.round(config.maxSize! / (1024 * 1024));
      return {
        isValid: false,
        error: `El archivo es demasiado grande. Máximo permitido: ${maxSizeMB}MB`,
      };
    }

    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (
      config.allowedExtensions &&
      !config.allowedExtensions.includes(extension)
    ) {
      return {
        isValid: false,
        error: `Extensión no permitida. Permitidas: ${config.allowedExtensions.join(
          ", "
        )}`,
      };
    }

    // Check MIME type (if available)
    if (
      config.allowedTypes &&
      file.type &&
      !config.allowedTypes.includes(file.type)
    ) {
      return {
        isValid: false,
        error: "Tipo de archivo no soportado",
      };
    }

    return { isValid: true };
  }

  static async uploadFile(
    file: File,
    assetType: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Validate file first
    const validation = this.validateFile(file, assetType);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    try {
      // For demo purposes, we'll simulate an upload
      // In a real implementation, this would upload to your backend or cloud storage

      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetType", assetType);

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        onProgress?.({
          loaded: (file.size * i) / 100,
          total: file.size,
          percentage: i,
        });
      }

      // Generate a mock URL (in real app, this would come from your backend)
      const timestamp = Date.now();
      const extension = this.getFileExtension(file.name);
      const filename = `${timestamp}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const mockUrl = `/uploads/${assetType}s/${filename}`;

      return {
        success: true,
        url: mockUrl,
        message: "Archivo subido exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error subiendo archivo",
      };
    }
  }

  static generatePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  static getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf(".")).toLowerCase();
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static isImageFile(file: File): boolean {
    return file.type.startsWith("image/");
  }

  static isVideoFile(file: File): boolean {
    return file.type.startsWith("video/");
  }

  static is3DModelFile(file: File): boolean {
    const extension = this.getFileExtension(file.name);
    return [".glb", ".gltf"].includes(extension);
  }

  // Real backend integration methods (implement these when connecting to actual API)
  static async uploadToBackend(
    file: File,
    assetType: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetType", assetType);

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              url: response.url,
              message: "Archivo subido exitosamente",
            });
          } catch (error) {
            resolve({
              success: false,
              error: "Error procesando respuesta del servidor",
            });
          }
        } else {
          resolve({
            success: false,
            error: `Error del servidor: ${xhr.status}`,
          });
        }
      });

      xhr.addEventListener("error", () => {
        resolve({
          success: false,
          error: "Error de conexión",
        });
      });

      // This would be your actual upload endpoint
      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  }
}

export default FileUploadService;
