/**
 * Asset URL Resolution Utilities
 * Robust URL resolution for all asset types
 */

import { Asset } from "@/types";

export interface ResolvedAsset {
  url: string;
  isValid: boolean;
  needsFallback: boolean;
  error?: string;
}

/**
 * Get the base API URL
 */
export function getBaseApiUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";
  }
  return "http://localhost:5001";
}

/**
 * Resolve asset URL with proper handling for all scenarios
 */
export function resolveAssetUrl(asset: Asset): ResolvedAsset {
  const baseApiUrl = getBaseApiUrl();

  // No URL provided
  if (!asset.assetUrl) {
    return {
      url: "",
      isValid: false,
      needsFallback: true,
      error: "No URL provided",
    };
  }

  const assetUrl = asset.assetUrl;

  // Already a complete URL (http/https)
  if (assetUrl.startsWith("http://") || assetUrl.startsWith("https://")) {
    return {
      url: assetUrl,
      isValid: true,
      needsFallback: false,
    };
  }

  // Blob URL (temporary)
  if (assetUrl.startsWith("blob:")) {
    return {
      url: assetUrl,
      isValid: true,
      needsFallback: false,
    };
  }

  // Data URL
  if (assetUrl.startsWith("data:")) {
    return {
      url: assetUrl,
      isValid: true,
      needsFallback: false,
    };
  }

  // Relative URL - make it absolute
  if (assetUrl.startsWith("/")) {
    return {
      url: `${baseApiUrl}${assetUrl}`,
      isValid: true,
      needsFallback: false,
    };
  }

  // URL without leading slash
  return {
    url: `${baseApiUrl}/${assetUrl}`,
    isValid: true,
    needsFallback: false,
  };
}

/**
 * Check if asset type supports AR viewing
 */
export function supportsAR(assetType: string): boolean {
  return assetType === "model3d";
}

/**
 * Get display name for asset type
 */
export function getAssetTypeDisplayName(assetType: string): string {
  const names: Record<string, string> = {
    model3d: "Modelo 3D",
    image: "Imagen",
    video: "Video",
    message: "Mensaje",
    webcontent: "Contenido Web",
  };
  return names[assetType] || assetType;
}

/**
 * Validate if URL is accessible (client-side check)
 */
export async function validateAssetUrl(url: string): Promise<boolean> {
  try {
    // For blob and data URLs, assume valid
    if (url.startsWith("blob:") || url.startsWith("data:")) {
      return true;
    }

    // For HTTP URLs, try a HEAD request
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.warn("Asset URL validation failed:", url, error);
    return false;
  }
}

/**
 * Get CORS-safe URL for assets
 */
export function getCORSSafeUrl(url: string): string {
  // If it's already a complete URL, return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Make sure local URLs use the correct base
  const baseApiUrl = getBaseApiUrl();
  if (url.startsWith("/")) {
    return `${baseApiUrl}${url}`;
  }

  return `${baseApiUrl}/${url}`;
}

/**
 * Preload asset for better performance
 */
export function preloadAsset(asset: Asset): Promise<void> {
  return new Promise((resolve, reject) => {
    const resolved = resolveAssetUrl(asset);

    if (!resolved.isValid) {
      reject(new Error(resolved.error || "Invalid URL"));
      return;
    }

    switch (asset.assetType) {
      case "image":
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = resolved.url;
        break;

      case "video":
        const video = document.createElement("video");
        video.onloadedmetadata = () => resolve();
        video.onerror = reject;
        video.src = resolved.url;
        break;

      case "model3d":
        // For 3D models, just check if URL is accessible
        fetch(resolved.url, { method: "HEAD" })
          .then(() => resolve())
          .catch(reject);
        break;

      default:
        resolve(); // For message and webcontent, no preload needed
    }
  });
}

/**
 * Get asset icon based on type
 */
export function getAssetIcon(assetType: string): string {
  const icons: Record<string, string> = {
    model3d: "🎨",
    image: "🖼️",
    video: "🎥",
    message: "💬",
    webcontent: "🌐",
  };
  return icons[assetType] || "📄";
}

/**
 * Format file size
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
