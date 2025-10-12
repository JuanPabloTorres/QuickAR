import { Asset, AssetDto, Experience, ExperienceDto } from "@/types";

/**
 * Convert backend AssetDto to frontend Asset
 */
export function normalizeAsset(dto: AssetDto): Asset {
  // Convert relative URLs to absolute URLs for static assets
  let assetUrl = dto.url;
  if (assetUrl && assetUrl.startsWith("/")) {
    // Get the API base URL without the /api suffix for static files
    // Force HTTP for static assets to avoid certificate issues with model-viewer
    const apiBaseUrl = "http://localhost:5001";
    assetUrl = `${apiBaseUrl}${dto.url}`;
  }

  return {
    id: dto.id,
    name: dto.name,
    assetType: dto.kind, // Direct mapping, both use same values
    assetUrl: assetUrl,
    mimeType: dto.mimeType,
    fileSizeBytes: dto.fileSizeBytes,
    assetContent: dto.text, // Map 'text' field to 'assetContent'
  };
}

/**
 * Convert frontend Asset to backend AssetDto for API calls
 */
export function denormalizeAsset(asset: Asset): AssetDto {
  return {
    id: asset.id,
    name: asset.name,
    kind: asset.assetType, // Direct mapping
    url: asset.assetUrl,
    mimeType: asset.mimeType,
    fileSizeBytes: asset.fileSizeBytes,
    text: asset.assetContent, // Map 'assetContent' back to 'text'
  };
}

/**
 * Convert backend ExperienceDto to frontend Experience
 */
export function normalizeExperience(dto: ExperienceDto): Experience {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    description: dto.description,
    isActive: dto.isActive,
    assets: dto.assets.map(normalizeAsset),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

/**
 * Convert frontend Experience to backend ExperienceDto for API calls
 */
export function denormalizeExperience(experience: Experience): ExperienceDto {
  return {
    id: experience.id,
    title: experience.title,
    slug: experience.slug,
    description: experience.description,
    isActive: experience.isActive,
    assets: experience.assets.map(denormalizeAsset),
    createdAt: experience.createdAt.toISOString(),
    updatedAt: experience.updatedAt.toISOString(),
  };
}

/**
 * Validate asset type
 */
export function isValidAssetType(
  type: string
): type is "message" | "video" | "image" | "model3d" {
  return ["message", "video", "image", "model3d"].includes(type);
}

/**
 * Get supported file extensions for an asset type
 */
export function getSupportedExtensions(assetType: string): string[] {
  const extensions: Record<string, string[]> = {
    image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    video: [".mp4", ".webm", ".ogg"],
    model3d: [".glb", ".gltf", ".obj", ".fbx"],
    message: [], // Text doesn't have file extensions
  };

  return extensions[assetType] || [];
}

/**
 * Get MIME types for an asset type
 */
export function getSupportedMimeTypes(assetType: string): string[] {
  const mimeTypes: Record<string, string[]> = {
    image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    video: ["video/mp4", "video/webm", "video/ogg"],
    model3d: [
      "model/gltf+json",
      "model/gltf-binary",
      "application/octet-stream",
    ],
    message: ["text/plain"],
  };

  return mimeTypes[assetType] || [];
}

/**
 * Validate file for asset type
 */
export function validateAssetFile(
  file: File,
  assetType: string
): { valid: boolean; error?: string } {
  if (assetType === "message") {
    return {
      valid: false,
      error: "Los assets de mensaje no requieren archivo",
    };
  }

  const supportedMimes = getSupportedMimeTypes(assetType);

  if (!supportedMimes.includes(file.type)) {
    const supportedExts = getSupportedExtensions(assetType).join(", ");
    return {
      valid: false,
      error: `Tipo de archivo no soportado. Use: ${supportedExts}`,
    };
  }

  // Size limits (in bytes)
  const sizeLimits: Record<string, number> = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    model3d: 50 * 1024 * 1024, // 50MB
  };

  const maxSize = sizeLimits[assetType];
  if (maxSize && file.size > maxSize) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${Math.round(
        maxSize / (1024 * 1024)
      )}MB`,
    };
  }

  return { valid: true };
}
