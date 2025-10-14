/**
 * Universal Asset URL Resolver
 * Handles all asset types: image, video, model3d, message, webcontent
 */

// Get API base URL with fallback
function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return "http://localhost:5001";
}

const API_BASE_URL = getApiBaseUrl();

export interface AvailableFile {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  extension: string;
}

/**
 * Get list of available files from the server by category
 */
export async function getAvailableFiles(category: "models" | "images"): Promise<AvailableFile[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/files/${category}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log(`File listing endpoint not available for ${category}, using fallback`);
  }

  // Fallback: return empty array
  return [];
}

/**
 * Try to resolve a blob URL to a real server URL
 */
export async function resolveBlobUrl(
  blobUrl: string,
  assetName: string,
  assetId: string,
  assetType: string
): Promise<string | null> {
  // Determine the upload category based on asset type
  const category = getUploadCategory(assetType);
  const extension = getDefaultExtension(assetType);

  // Try multiple strategies to find the correct file
  const strategies = [
    // Strategy 1: Try exact asset ID match
    () => `/uploads/${category}/${assetId}${extension}`,

    // Strategy 2: Try name-based filename
    () => {
      const sanitized = assetName
        .toLowerCase()
        .replace(/[^a-z0-9\-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      return `/uploads/${category}/${sanitized}${extension}`;
    },

    // Strategy 3: Try timestamp patterns (common for uploaded files)
    () => {
      const sanitized = assetName
        .toLowerCase()
        .replace(/[^a-z0-9\-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      
      // Try different timestamp patterns
      const now = Date.now();
      return `/uploads/${category}/${now}_${sanitized}${extension}`;
    },

    // Strategy 4: Try with asset ID as part of filename
    () => {
      const shortId = assetId.substring(0, 8);
      const sanitized = assetName
        .toLowerCase()
        .replace(/[^a-z0-9\-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      return `/uploads/${category}/${shortId}_${sanitized}${extension}`;
    },
  ];

  // Try each strategy
  for (const strategy of strategies) {
    const candidateUrl = strategy();
    const fullUrl = `${API_BASE_URL}${candidateUrl}`;

    try {
      const response = await fetch(fullUrl, { method: "HEAD" });
      if (response.ok) {
        console.log(`✅ Found ${assetType} file: ${candidateUrl}`);
        return candidateUrl;
      }
    } catch (error) {
      // Continue to next strategy
    }
  }

  console.warn(`❌ Could not resolve blob URL to server file: ${blobUrl}`);
  return null;
}

/**
 * Get the latest available file of a specific type
 */
export async function getLatestFileUrl(assetType: string): Promise<string | null> {
  const category = getUploadCategory(assetType);
  
  try {
    const files = await getAvailableFiles(category as "models" | "images");
    if (files.length > 0) {
      // Return the most recently modified file
      const latest = files.sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      )[0];
      
      console.log(`✅ Using latest ${assetType} file: ${latest.url}`);
      return latest.url;
    }
  } catch (error) {
    console.warn(`Could not get latest ${assetType} file:`, error);
  }

  // Fallback to known files based on type
  const knownFiles: Record<string, string[]> = {
    model3d: [
      "/uploads/models/1760250740_39d3d473.glb", // Latest based on previous listing
      "/uploads/models/1759374916_d30996f3.glb",
      "/uploads/models/1759450973_f27edb5c.glb",
    ],
    image: [
      "/uploads/images/sample-image.jpg",
      "/uploads/images/default-image.png",
    ],
    video: [
      "/uploads/videos/sample-video.mp4",
    ],
  };

  const candidates = knownFiles[assetType] || [];
  
  // Try known files
  for (const candidateUrl of candidates) {
    try {
      const response = await fetch(`${API_BASE_URL}${candidateUrl}`, {
        method: "HEAD",
      });
      if (response.ok) {
        console.log(`✅ Using known ${assetType} file: ${candidateUrl}`);
        return candidateUrl;
      }
    } catch (error) {
      // Continue to next file
    }
  }

  return null;
}

/**
 * Smart URL resolution for any asset type
 */
export async function smartResolveAssetUrl(
  assetUrl: string | undefined,
  assetName: string,
  assetId: string,
  assetType: string
): Promise<string> {
  // If it's already a valid server URL, use it
  if (
    assetUrl &&
    !assetUrl.startsWith("blob:") &&
    assetUrl.startsWith("/uploads/")
  ) {
    return assetUrl;
  }

  // If it's a blob URL, try to resolve it
  if (assetUrl && assetUrl.startsWith("blob:")) {
    const resolved = await resolveBlobUrl(assetUrl, assetName, assetId, assetType);
    if (resolved) {
      return resolved;
    }
  }

  // For web content, return the URL as-is if it's a valid HTTP(S) URL
  if (assetType === "webcontent" && assetUrl) {
    if (assetUrl.startsWith("http://") || assetUrl.startsWith("https://")) {
      return assetUrl;
    }
  }

  // Fallback to latest available file
  const fallback = await getLatestFileUrl(assetType);
  if (fallback) {
    return fallback;
  }

  // Ultimate fallback based on asset type
  const defaultUrls: Record<string, string> = {
    model3d: "/uploads/models/default-model.glb",
    image: "/uploads/images/default-image.png",
    video: "/uploads/videos/default-video.mp4",
    webcontent: "https://example.com",
  };

  return defaultUrls[assetType] || "/uploads/default-asset";
}

/**
 * Get the upload category for an asset type
 */
function getUploadCategory(assetType: string): string {
  const categoryMap: Record<string, string> = {
    model3d: "models",
    image: "images", 
    video: "videos",
    webcontent: "web",
    message: "text",
  };

  return categoryMap[assetType] || "misc";
}

/**
 * Get the default file extension for an asset type
 */
function getDefaultExtension(assetType: string): string {
  const extensionMap: Record<string, string> = {
    model3d: ".glb",
    image: ".jpg",
    video: ".mp4",
    webcontent: ".html",
    message: ".txt",
  };

  return extensionMap[assetType] || "";
}