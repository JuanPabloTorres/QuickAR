/**
 * Experience Cube Mapper Utility
 * 
 * Converts backend AssetDto to ExperienceCube props format
 * Ensures consistent data mapping across all views
 */

import { AssetDto, AssetKind } from "@/types";

export type ExperienceCubeAssetType = "image" | "video" | "text" | "model3d";

export interface ExperienceCubeProps {
  assetType: ExperienceCubeAssetType;
  assetUrl?: string;
  assetContent?: string;
  alt?: string;
  size?: number;
  enableAR?: boolean;
  className?: string;
}

/**
 * Maps backend AssetDto to ExperienceCube props
 * 
 * @param asset - Asset from backend API
 * @param size - Optional cube size (default: 300)
 * @param enableAR - Enable AR features (default: true)
 * @param className - Additional CSS classes
 * @returns Props for ExperienceCube component
 */
export function mapAssetToExperienceCube(
  asset: AssetDto,
  options: {
    size?: number;
    enableAR?: boolean;
    className?: string;
  } = {}
): ExperienceCubeProps {
  const { size = 300, enableAR = true, className = "" } = options;
  
  // Normalize asset kind to ExperienceCube type
  const assetType: ExperienceCubeAssetType = 
    asset.kind === "message" ? "text" : asset.kind as ExperienceCubeAssetType;
  
  return {
    assetType,
    assetUrl: asset.url || undefined,
    assetContent: asset.text || undefined,
    alt: asset.name || "Asset sin nombre",
    size,
    enableAR,
    className,
  };
}

/**
 * Maps first asset of experience to ExperienceCube props
 * Falls back to experience title as text content if no assets
 * 
 * @param experience - Experience with assets array
 * @param options - Configuration options
 * @returns Props for ExperienceCube component
 */
export function mapExperienceToExperienceCube(
  experience: { title: string; assets: AssetDto[] },
  options: {
    size?: number;
    enableAR?: boolean;
    className?: string;
  } = {}
): ExperienceCubeProps {
  const { size = 300, enableAR = true, className = "" } = options;
  
  // Use first asset or fallback to experience title
  const firstAsset = experience.assets[0];
  
  if (firstAsset) {
    return mapAssetToExperienceCube(firstAsset, { size, enableAR, className });
  }
  
  // Fallback: create text cube with experience title
  return {
    assetType: "text",
    assetContent: experience.title,
    alt: experience.title,
    size,
    enableAR,
    className,
  };
}

/**
 * Validates asset data for ExperienceCube compatibility
 * 
 * @param asset - Asset to validate
 * @returns Validation result with potential issues
 */
export function validateAssetForExperienceCube(asset: AssetDto): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check required fields
  if (!asset.name || asset.name.trim() === "") {
    issues.push("Asset name is missing or empty");
  }
  
  if (!asset.kind) {
    issues.push("Asset kind is required");
  }
  
  // Validate based on asset type
  switch (asset.kind) {
    case "image":
    case "video":
    case "model3d":
      if (!asset.url) {
        issues.push(`${asset.kind} assets require a URL`);
      }
      break;
      
    case "message":
      if (!asset.text && !asset.url) {
        issues.push("Message assets require either text content or URL");
      }
      break;
      
    default:
      issues.push(`Unsupported asset kind: ${asset.kind}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Gets appropriate fallback content when asset is invalid
 * 
 * @param asset - Potentially invalid asset
 * @returns Safe props for ExperienceCube
 */
export function getAssetFallback(asset: AssetDto): ExperienceCubeProps {
  return {
    assetType: "text",
    assetContent: asset.name || "Asset no disponible",
    alt: "Asset no disponible",
    size: 300,
    enableAR: false, // Disable AR for fallback content
    className: "opacity-75",
  };
}