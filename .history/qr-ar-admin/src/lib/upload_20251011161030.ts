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
      // Map assetType to backend category
      const categoryMap: Record<string, string> = {
        'image': 'images',
        'video': 'videos', 
        'model3d': 'models'
      };

      const category = categoryMap[assetType] || 'images';
      
      // Get API base URL
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5002";
      
      const formData = new FormData();
      formData.append("file", file);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise<UploadResult>((resolve) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: percentage,
            });
          }
        });

        xhr.addEventListener('load', () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              if (response.success && response.data) {
                resolve({
                  success: true,
                  url: response.data.url,
                  message: response.data.message || "Archivo subido exitosamente",
                });
              } else {
                resolve({
                  success: false,
                  error: response.message || "Error al subir el archivo",
                });
              }
            } else {
              const errorResponse = xhr.responseText ? JSON.parse(xhr.responseText) : {};
              resolve({
                success: false,
                error: errorResponse.message || `Error HTTP ${xhr.status}`,
              });
            }
          } catch (parseError) {
            resolve({
              success: false,
              error: "Error procesando la respuesta del servidor",
            });
          }
        });

        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: "Error de conexión al subir el archivo",
          });
        });

        xhr.open('POST', `${API_BASE_URL}/api/v1/upload/${category}`);
        xhr.send(formData);
      });
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

  // Delete file from backend
  static async deleteFile(url: string, assetType: string): Promise<UploadResult> {
    try {
      // Extract filename from URL
      const filename = url.split('/').pop();
      if (!filename) {
        return {
          success: false,
          error: "No se pudo extraer el nombre del archivo",
        };
      }

      // Map assetType to backend category
      const categoryMap: Record<string, string> = {
        'image': 'images',
        'video': 'videos', 
        'model3d': 'models'
      };

      const category = categoryMap[assetType] || 'images';
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5002";
      
      const response = await fetch(`${API_BASE_URL}/api/v1/upload/${category}/${filename}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          message: "Archivo eliminado exitosamente",
        };
      } else {
        return {
          success: false,
          error: result.message || "Error al eliminar el archivo",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error eliminando el archivo",
      };
    }
  }

  // Get valid categories from backend
  static async getValidCategories(): Promise<string[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:5002";
      const response = await fetch(`${API_BASE_URL}/api/v1/upload/categories`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        return result.data || [];
      } else {
        console.error('Error getting categories:', result.message);
        return ['images', 'videos', 'models']; // fallback
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['images', 'videos', 'models']; // fallback
    }
  }
}

export default FileUploadService;

export default FileUploadService;
