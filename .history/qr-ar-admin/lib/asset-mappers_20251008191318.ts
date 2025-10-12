// Asset mapping utilities for ExperienceCube integration
// Maps between backend DTOs and ExperienceCube props

import { AssetDto, AssetKind } from '@/types';

/**
 * Maps backend AssetDto to ExperienceCube props format
 */
export function mapAssetToExperienceCube(asset: AssetDto) {
  return {
    assetType: mapAssetKindToType(asset.kind),
    assetUrl: asset.url || undefined,
    assetContent: asset.text || undefined,
    alt: asset.name,
  };
}

/**
 * Maps AssetKind enum to ExperienceCube AssetType
 */
function mapAssetKindToType(kind: AssetKind): 'image' | 'video' | 'text' | 'model3d' {
  switch (kind) {
    case 'message':
      return 'text';
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'model3d':
      return 'model3d';
    default:
      return 'text'; // fallback
  }
}

/**
 * Maps multiple assets to ExperienceCube props format
 */
export function mapAssetsToExperienceCubes(assets: AssetDto[]) {
  return assets.map(mapAssetToExperienceCube);
}

/**
 * Gets the primary asset for ExperienceCube display
 * Priority: model3d > image > video > text
 */
export function getPrimaryAsset(assets: AssetDto[]): AssetDto | null {
  if (!assets.length) return null;

  // Priority order for AR display
  const priorities: AssetKind[] = ['model3d', 'image', 'video', 'message'];
  
  for (const priority of priorities) {
    const asset = assets.find(a => a.kind === priority);
    if (asset) return asset;
  }

  return assets[0]; // fallback to first asset
}

/**
 * Maps ExperienceCube props back to AssetCreateDto format for API calls
 */
export function mapExperienceCubeToAssetDto(
  cubeProps: {
    assetType: 'image' | 'video' | 'text' | 'model3d';
    assetUrl?: string;
    assetContent?: string;
    alt?: string;
  },
  name?: string
) {
  return {
    name: name || cubeProps.alt || 'Asset',
    kind: mapAssetTypeToKind(cubeProps.assetType),
    url: cubeProps.assetUrl || null,
    text: cubeProps.assetContent || null,
    mimeType: getMimeTypeFromUrl(cubeProps.assetUrl, cubeProps.assetType),
    fileSizeBytes: null, // Will be set on upload
  };
}

/**
 * Maps ExperienceCube AssetType back to backend AssetKind
 */
function mapAssetTypeToKind(assetType: 'image' | 'video' | 'text' | 'model3d'): AssetKind {
  switch (assetType) {
    case 'text':
      return 'message';
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'model3d':
      return 'model3d';
  }
}

/**
 * Infers MIME type from URL and asset type
 */
function getMimeTypeFromUrl(url?: string, assetType?: string): string | null {
  if (!url) return null;

  const extension = url.split('.').pop()?.toLowerCase();
  
  switch (assetType) {
    case 'image':
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'gif':
          return 'image/gif';
        case 'webp':
          return 'image/webp';
        default:
          return 'image/jpeg';
      }
    case 'video':
      switch (extension) {
        case 'mp4':
          return 'video/mp4';
        case 'webm':
          return 'video/webm';
        case 'ogg':
          return 'video/ogg';
        default:
          return 'video/mp4';
      }
    case 'model3d':
      switch (extension) {
        case 'glb':
          return 'model/gltf-binary';
        case 'gltf':
          return 'model/gltf+json';
        case 'usdz':
          return 'model/vnd.usdz+zip';
        default:
          return 'model/gltf-binary';
      }
    default:
      return null;
  }
}

/**
 * Validates if an asset can be rendered in ExperienceCube
 */
export function isValidAssetForCube(asset: AssetDto): boolean {
  const validKinds: AssetKind[] = ['image', 'video', 'message', 'model3d'];
  
  if (!validKinds.includes(asset.kind)) {
    return false;
  }

  // Text assets need content
  if (asset.kind === 'message' && !asset.text) {
    return false;
  }

  // Other assets need URLs
  if (asset.kind !== 'message' && !asset.url) {
    return false;
  }

  return true;
}

/**
 * Gets displayable assets for ExperienceCube rendering
 */
export function getDisplayableAssets(assets: AssetDto[]): AssetDto[] {
  return assets.filter(isValidAssetForCube);
}