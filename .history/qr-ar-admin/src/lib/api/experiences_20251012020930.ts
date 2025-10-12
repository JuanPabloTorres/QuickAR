import {
  ApiResponse,
  ExperienceCreateDto,
  ExperienceDto,
  ExperienceUpdateDto,
} from "@/types";

// Base API configuration
const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "https://localhost:5002/api"; // Server-side fallback - use HTTPS
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // If accessing from network (not localhost), use the same hostname and protocol for API
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    // Use HTTPS port 5002 if frontend is HTTPS, otherwise HTTP port 5001
    const port = protocol === "https:" ? "5002" : "5001";
    return `${protocol}//${hostname}:${port}/api`;
  }

  // Default to localhost with HTTPS
  return "https://localhost:5002/api";
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Create fetch configuration for API calls
 */
function createFetchConfig(options: RequestInit = {}): RequestInit {
  return {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  };
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    if (contentType && contentType.includes("application/json")) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use the default error message
      }
    }

    return {
      success: false,
      data: null as any,
      message: errorMessage,
      errors: [errorMessage],
    };
  }

  if (contentType && contentType.includes("application/json")) {
    const responseData = await response.json();

    // If the API response has its own structure with success/data, extract it
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return {
        success: responseData.success || true,
        data: responseData.data,
        message: responseData.message || "Success",
        errors: responseData.errors || [],
      };
    }

    // Otherwise, return the data as is
    return {
      success: true,
      data: responseData,
      message: "Success",
    };
  }

  return {
    success: true,
    data: null as any,
    message: "Success",
  };
}

/**
 * Get all experiences
 */
export async function getAllExperiences(): Promise<
  ApiResponse<ExperienceDto[]>
> {
  try {
    console.log("Making API call to:", `${API_BASE_URL}/experiences`);
    const response = await fetch(
      `${API_BASE_URL}/experiences`,
      createFetchConfig()
    );
    console.log("Response status:", response.status);
    return await handleResponse<ExperienceDto[]>(response);
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Error desconocido",
      errors: [error instanceof Error ? error.message : "Error desconocido"],
    };
  }
}

/**
 * Get experience by ID
 */
export async function getExperienceById(
  id: string
): Promise<ApiResponse<ExperienceDto>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/experiences/${id}`,
      createFetchConfig()
    );
    return await handleResponse<ExperienceDto>(response);
  } catch (error) {
    return {
      success: false,
      data: null as any,
      message: error instanceof Error ? error.message : "Error desconocido",
      errors: [error instanceof Error ? error.message : "Error desconocido"],
    };
  }
}

/**
 * Get experience by slug
 */
export async function getExperienceBySlug(
  slug: string
): Promise<ApiResponse<ExperienceDto>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/experiences/slug/${slug}`,
      createFetchConfig()
    );
    return await handleResponse<ExperienceDto>(response);
  } catch (error) {
    return {
      success: false,
      data: null as any,
      message: error instanceof Error ? error.message : "Error desconocido",
      errors: [error instanceof Error ? error.message : "Error desconocido"],
    };
  }
}

/**
 * Upload file to server
 */
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error uploading file");
  }

  const result = await response.json();
  return result.url;
}

/**
 * Create new experience with multiple assets
 */
export async function createExperience(
  data: {
    title: string;
    description: string;
    assets: {
      assetType: "message" | "video" | "image" | "model3d" | "webcontent";
      name: string;
      file?: File;
      url?: string;
      content?: string;
    }[];
  }
): Promise<ApiResponse<ExperienceDto>> {
  try {
    // First, upload all files and prepare assets
    const processedAssets: AssetCreateDto[] = [];

    for (const asset of data.assets) {
      let processedAsset: AssetCreateDto = {
        name: asset.name,
        kind: asset.assetType,
      };

      if (asset.assetType === "message") {
        processedAsset.text = asset.content;
      } else if (asset.assetType === "webcontent") {
        processedAsset.url = asset.url;
      } else if (asset.file) {
        // Upload file and get URL
        const uploadedUrl = await uploadFile(asset.file);
        processedAsset.url = uploadedUrl;
        processedAsset.mimeType = asset.file.type;
        processedAsset.fileSizeBytes = asset.file.size;
      }

      processedAssets.push(processedAsset);
    }

    // Create experience with all processed assets
    const experienceData: ExperienceCreateDto = {
      title: data.title,
      description: data.description,
      assets: processedAssets,
    };

    const response = await fetch(
      `${API_BASE_URL}/experiences`,
      createFetchConfig({
        method: "POST",
        body: JSON.stringify(experienceData),
      })
    );

    return await handleResponse<ExperienceDto>(response);
  } catch (error) {
    return {
      success: false,
      data: null as any,
      message: error instanceof Error ? error.message : "Error desconocido",
      errors: [error instanceof Error ? error.message : "Error desconocido"],
    };
  }
}

/**
 * Update existing experience
 */
export async function updateExperience(
  id: string,
  experience: ExperienceUpdateDto
): Promise<ApiResponse<ExperienceDto>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/experiences/${id}`,
      createFetchConfig({
        method: "PUT",
        body: JSON.stringify(experience),
      })
    );
    return await handleResponse<ExperienceDto>(response);
  } catch (error) {
    return {
      success: false,
      data: null as any,
      message: error instanceof Error ? error.message : "Error desconocido",
      errors: [error instanceof Error ? error.message : "Error desconocido"],
    };
  }
}

/**
 * Delete experience
 */
export async function deleteExperience(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/experiences/${id}`,
      createFetchConfig({
        method: "DELETE",
      })
    );
    return await handleResponse<void>(response);
  } catch (error) {
    return {
      success: false,
      data: undefined,
      message: error instanceof Error ? error.message : "Error desconocido",
      errors: [error instanceof Error ? error.message : "Error desconocido"],
    };
  }
}

/**
 * Upload file for asset
 */
export async function uploadAssetFile(
  file: File,
  assetType: string
): Promise<
  ApiResponse<{ url: string; mimeType: string; fileSizeBytes: number }>
> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetType", assetType);

    const response = await fetch(`${API_BASE_URL}/v1/upload`, {
      method: "POST",
      body: formData,
    });

    return await handleResponse<{
      url: string;
      mimeType: string;
      fileSizeBytes: number;
    }>(response);
  } catch (error) {
    return {
      success: false,
      data: null as any,
      message: error instanceof Error ? error.message : "Error desconocido",
      errors: [error instanceof Error ? error.message : "Error desconocido"],
    };
  }
}

/**
 * Track analytics event
 */
export async function trackAnalyticsEvent(
  eventType: string,
  experienceId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await fetch(
      `${API_BASE_URL}/v1/analytics/track`,
      createFetchConfig({
        method: "POST",
        body: JSON.stringify({
          eventType,
          experienceId,
          metadata,
          timestamp: new Date().toISOString(),
        }),
      })
    );
  } catch (error) {
    // Analytics failures should not break the user experience
    console.warn("Failed to track analytics event:", error);
  }
}
