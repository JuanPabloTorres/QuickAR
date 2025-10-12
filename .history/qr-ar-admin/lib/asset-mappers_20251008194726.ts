/**
 * Asset Mappers - Centralized mapping logic
 * Maps between backend DTOs and frontend ExperienceCube props
 */

import { AssetDto } from "@/types";

// Type mapping from backend to ExperienceCube
export type AssetType = "image" | "video" | "text" | "model3d";

/**
 * Maps backend asset kind to ExperienceCube assetType
 */
export function mapAssetKindToType(kind: string): AssetType {
  const normalizedKind = kind.toLowerCase().trim();
  
  switch (normalizedKind) {
    case "message":
      return "text";
    case "video":
      return "video";
    case "image":
      return "image";
    case "model3d":
      return "model3d";
    default:
      console.warn(`Unknown asset kind: ${kind}, defaulting to text`);
      return "text";
  }
}

/**
 * Maps AssetDto to ExperienceCube props
 */
export interface ExperienceCubeAssetProps {
  assetType: AssetType;
  assetUrl?: string;
  assetContent?: string;
  alt?: string;
}

export function mapAssetToExperienceCube(asset: AssetDto): ExperienceCubeAssetProps {
  return {
    assetType: mapAssetKindToType(asset.kind),
    assetUrl: asset.url || undefined,
    assetContent: asset.text || undefined,
    alt: asset.name || `Asset ${asset.kind}`,
  };
}

/**
 * Validates if an asset has the required properties for rendering
 */
export function validateAsset(asset: AssetDto): boolean {
  if (!asset || !asset.kind) {
    console.warn("Asset missing required kind property:", asset);
    return false;
  }

  const assetType = mapAssetKindToType(asset.kind);
  
  // Validate based on asset type requirements
  switch (assetType) {
    case "text":
      return Boolean(asset.text);
    case "image":
    case "video":
    case "model3d":
      return Boolean(asset.url);
    default:
      return false;
  }
}

/**
 * Gets display label for asset type
 */
export function getAssetTypeLabel(assetType: AssetType): string {
  switch (assetType) {
    case "text":
      return "Texto";
    case "image":
      return "Imagen";
    case "video":
      return "Video";
    case "model3d":
      return "Modelo 3D";
    default:
      return "Desconocido";
  }
}

/**
 * Gets emoji icon for asset type
 */
export function getAssetTypeIcon(assetType: AssetType): string {
  switch (assetType) {
    case "text":
      return "💬";
    case "image":
      return "🖼️";
    case "video":
      return "🎬";
    case "model3d":
      return "🎯";
    default:
      return "❓";
  }
}

/**
 * Validates URL format for assets
 */
export function isValidAssetUrl(url?: string | null): boolean {
  if (!url) return false;
  
  try {
    new URL(url, window.location.origin);
    return true;
  } catch {
    // Check for relative URLs
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

/**
 * Normalizes asset URL to absolute format
 */
export function normalizeAssetUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Relative URL - convert to absolute
  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }
  
  // Handle relative paths
  return `${window.location.origin}/${url}`;
}
