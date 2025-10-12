import {
  AnalyticsEventCreateDto,
  AnalyticsEventDto,
  ApiResponse,
  ExperienceCreateDto,
  ExperienceDto,
  ExperienceUpdateDto,
  FileUploadResult,
} from "../../types";

/**
 * Unified API Client for Quick AR
 * Handles all backend communication with proper error handling and type safety
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    // Use proxy routes for API calls (configured in next.config.ts)
    this.baseUrl = "/api";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      const defaultHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Don't set Content-Type for FormData
      const headers =
        options.body instanceof FormData
          ? options.headers || {}
          : { ...defaultHeaders, ...options.headers };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-JSON responses (like file uploads)
      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP error! status: ${response.status}`,
          errors: [data.message || `HTTP ${response.status}`],
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Network error occurred",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  // Experience endpoints
  async getExperiences(): Promise<ApiResponse<ExperienceDto[]>> {
    return this.request<ExperienceDto[]>("/experiences");
  }

  async getExperience(id: string): Promise<ApiResponse<ExperienceDto>> {
    return this.request<ExperienceDto>(`/experiences/${id}`);
  }

  async getExperienceBySlug(slug: string): Promise<ApiResponse<ExperienceDto>> {
    return this.request<ExperienceDto>(`/experiences/slug/${slug}`);
  }

  async createExperience(
    data: ExperienceCreateDto
  ): Promise<ApiResponse<ExperienceDto>> {
    return this.request<ExperienceDto>("/experiences", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateExperience(
    id: string,
    data: ExperienceUpdateDto
  ): Promise<ApiResponse<ExperienceDto>> {
    return this.request<ExperienceDto>(`/experiences/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteExperience(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/experiences/${id}`, {
      method: "DELETE",
    });
  }

  async toggleExperienceActive(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/experiences/${id}/toggle-active`, {
      method: "PATCH",
    });
  }

  // File upload endpoints
  async uploadFile(
    file: File,
    category: "models" | "images" | "videos"
  ): Promise<ApiResponse<FileUploadResult>> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<FileUploadResult>(`/upload/${category}`, {
      method: "POST",
      body: formData,
    });
  }

  // Analytics endpoints
  async createAnalyticsEvent(
    data: AnalyticsEventCreateDto
  ): Promise<ApiResponse<AnalyticsEventDto>> {
    return this.request<AnalyticsEventDto>("/analytics/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAnalyticsEvents(): Promise<ApiResponse<AnalyticsEventDto[]>> {
    return this.request<AnalyticsEventDto[]>("/analytics/events");
  }

  async getExperienceAnalytics(
    experienceId: string
  ): Promise<ApiResponse<AnalyticsEventDto[]>> {
    return this.request<AnalyticsEventDto[]>(
      `/analytics/experiences/${experienceId}`
    );
  }

  // Health check endpoint
  async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    return this.request<{ status: string; timestamp: string }>("/health");
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
