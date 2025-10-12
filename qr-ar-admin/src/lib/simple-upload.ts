/**
 * Servicio de upload simplificado, funcional y escalable
 */

export interface SimpleUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class SimpleUploadService {
  private static readonly MAX_SIZE_MB = 50; // 50MB máximo
  private static readonly UPLOAD_URL = "/api/upload"; // Endpoint del backend

  /**
   * Validaciones básicas por tipo de archivo
   */
  private static readonly FILE_CONFIGS = {
    image: {
      types: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      maxSizeMB: 10,
    },
    video: {
      types: ["video/mp4", "video/webm", "video/ogg"],
      extensions: [".mp4", ".webm", ".ogg"],
      maxSizeMB: 100,
    },
    model3d: {
      types: [
        "model/gltf-binary",
        "model/gltf+json",
        "application/octet-stream",
      ],
      extensions: [".glb", ".gltf"],
      maxSizeMB: 50,
    },
  };

  /**
   * Valida un archivo según su tipo
   */
  static validateFile(
    file: File,
    assetType: string
  ): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: "No se ha seleccionado ningún archivo" };
    }

    const config =
      this.FILE_CONFIGS[assetType as keyof typeof this.FILE_CONFIGS];
    if (!config) {
      return {
        isValid: false,
        error: `Tipo de archivo no soportado: ${assetType}`,
      };
    }

    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > config.maxSizeMB) {
      return {
        isValid: false,
        error: `El archivo es demasiado grande. Máximo: ${config.maxSizeMB}MB`,
      };
    }

    // Validar extensión
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!config.extensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Extensión no válida. Permitidas: ${config.extensions.join(
          ", "
        )}`,
      };
    }

    // Validar tipo MIME (si está disponible)
    if (file.type && !config.types.includes(file.type)) {
      return {
        isValid: false,
        error: `Tipo de archivo no válido: ${file.type}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Sube un archivo de forma simple y directa
   */
  static async uploadFile(
    file: File,
    assetType: string
  ): Promise<SimpleUploadResult> {
    try {
      // Validar archivo
      const validation = this.validateFile(file, assetType);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Crear FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetType", assetType);

      // Realizar upload
      const response = await fetch(this.UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error en el servidor: ${response.status} - ${errorData}`,
        };
      }

      const result = await response.json();

      if (result.success && result.url) {
        return { success: true, url: result.url };
      } else {
        return { success: false, error: result.message || "Error desconocido" };
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error de conexión",
      };
    }
  }

  /**
   * Genera una preview URL para archivos compatibles
   */
  static generatePreview(file: File): string | null {
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      return URL.createObjectURL(file);
    }
    return null;
  }

  /**
   * Libera una preview URL
   */
  static revokePreview(url: string): void {
    URL.revokeObjectURL(url);
  }
}
