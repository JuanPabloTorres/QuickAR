/**
 * Enhanced Asset URL Resolver
 * Fixes image loading and provides robust URL resolution
 */

export interface AssetUrlResult {
  url: string;
  isBlob: boolean;
  isValid: boolean;
  error?: string;
}

export async function resolveAssetUrl(
  assetUrl: string | undefined,
  assetName: string,
  assetId: string,
  assetType: string,
  baseApiUrl: string = "http://localhost:5001"
): Promise<AssetUrlResult> {
  console.log("🔍 Resolving asset URL:", {
    assetUrl,
    assetName,
    assetId,
    assetType,
  });

  // If no URL provided, try to construct one
  if (!assetUrl) {
    const constructedUrl = constructAssetUrl(
      assetType,
      assetName,
      assetId,
      baseApiUrl
    );
    return await validateAndReturnUrl(constructedUrl, false);
  }

  // If it's already a complete server URL, validate and return
  if (assetUrl.startsWith("http://") || assetUrl.startsWith("https://")) {
    return await validateAndReturnUrl(assetUrl, false);
  }

  // If it's a relative path, make it absolute
  if (assetUrl.startsWith("/uploads/") || assetUrl.startsWith("uploads/")) {
    const fullUrl = assetUrl.startsWith("/")
      ? `${baseApiUrl}${assetUrl}`
      : `${baseApiUrl}/${assetUrl}`;
    return await validateAndReturnUrl(fullUrl, false);
  }

  // If it's a blob URL, check if it's still valid
  if (assetUrl.startsWith("blob:")) {
    const isValid = await validateBlobUrl(assetUrl);
    if (isValid) {
      return { url: assetUrl, isBlob: true, isValid: true };
    } else {
      // Blob is invalid, try to get a new URL from server
      console.log("🔄 Blob URL invalid, fetching from server...");
      const serverUrl = constructAssetUrl(
        assetType,
        assetName,
        assetId,
        baseApiUrl
      );
      return await validateAndReturnUrl(serverUrl, false);
    }
  }

  // For web content, return as-is if it looks like a URL
  if (
    assetType === "webcontent" &&
    (assetUrl.includes("http") || assetUrl.includes("www."))
  ) {
    return { url: assetUrl, isBlob: false, isValid: true };
  }

  // Default: try to construct a server URL
  const fallbackUrl = constructAssetUrl(
    assetType,
    assetName,
    assetId,
    baseApiUrl
  );
  return await validateAndReturnUrl(fallbackUrl, false);
}

function constructAssetUrl(
  assetType: string,
  assetName: string,
  assetId: string,
  baseApiUrl: string
): string {
  const typePathMap: Record<string, string> = {
    model3d: "models",
    image: "images",
    video: "videos",
    message: "text",
    webcontent: "web",
  };

  const typePath = typePathMap[assetType] || "files";

  // Try multiple URL patterns that might work
  const possibleUrls = [
    `${baseApiUrl}/uploads/${typePath}/${assetName}`,
    `${baseApiUrl}/uploads/${typePath}/${assetId}`,
    `${baseApiUrl}/api/v1/files/${typePath}/${assetId}`,
    `${baseApiUrl}/api/v1/assets/${assetId}/download`,
  ];

  console.log("🏗️ Constructed possible URLs:", possibleUrls);
  return possibleUrls[0]; // Return the first one, we'll validate it
}

async function validateAndReturnUrl(
  url: string,
  isBlob: boolean
): Promise<AssetUrlResult> {
  try {
    console.log("🔍 Validating URL:", url);

    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        Accept: "*/*",
      },
    });

    if (response.ok) {
      console.log("✅ URL is valid:", url);
      return { url, isBlob, isValid: true };
    } else {
      console.log(
        "❌ URL returned error:",
        response.status,
        response.statusText
      );
      return {
        url,
        isBlob,
        isValid: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    console.log("❌ URL validation failed:", error);
    return {
      url,
      isBlob,
      isValid: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

async function validateBlobUrl(blobUrl: string): Promise<boolean> {
  try {
    const response = await fetch(blobUrl, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get fallback URL for when primary URL fails
 */
export function getFallbackAssetUrl(assetType: string): string {
  const fallbackUrls: Record<string, string> = {
    model3d: "/uploads/models/default-model.glb",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==",
    video:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKWtiBWaWRlbyBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==",
    message: "",
    webcontent: "https://example.com",
  };

  return fallbackUrls[assetType] || "";
}

/**
 * Create a blob URL from server response
 */
export async function createBlobUrlFromServer(
  serverUrl: string
): Promise<string | null> {
  try {
    console.log("📥 Downloading asset from server:", serverUrl);

    const response = await fetch(serverUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    console.log("✅ Created blob URL:", blobUrl);
    return blobUrl;
  } catch (error) {
    console.error("❌ Failed to create blob URL:", error);
    return null;
  }
}

/**
 * Preload and cache asset for better performance
 */
export async function preloadAsset(assetUrl: string): Promise<boolean> {
  try {
    const response = await fetch(assetUrl);
    return response.ok;
  } catch {
    return false;
  }
}
