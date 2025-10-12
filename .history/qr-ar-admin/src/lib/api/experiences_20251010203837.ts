import {
  ApiResponse,
  ExperienceCreateDto,
  ExperienceDto,
  ExperienceUpdateDto,
} from "@/types";

// Base API configuration
const API_BASE_URL = "/api"; // Uses Next.js rewrites for proper routing

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
    const response = await fetch(
      `${API_BASE_URL}/experiences`,
      createFetchConfig()
    );
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
 * Create new experience
 */
export async function createExperience(
  experience: ExperienceCreateDto
): Promise<ApiResponse<ExperienceDto>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/experiences`,
      createFetchConfig({
        method: "POST",
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
