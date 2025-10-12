// API Service for QuickAR Backend Integration
// Base URL: https://localhost:5002

export interface Experience {
  id: string;
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  assetType: string;
  assetUrl: string;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface AnalyticsData {
  totalExperiences: number;
  totalViews: number;
  totalAssets: number;
  activeQrCodes: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  topExperiences: Array<{
    id: string;
    title: string;
    views: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;
}

class ApiService {
  private baseUrl = "https://localhost:5002/api";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Experiences API
  async getAllExperiences(): Promise<ApiResponse<Experience[]>> {
    return this.request<Experience[]>("/experiences");
  }

  async getExperienceById(id: string): Promise<ApiResponse<Experience>> {
    return this.request<Experience>(`/experiences/${id}`);
  }

  async createExperience(
    experience: Partial<Experience>
  ): Promise<ApiResponse<Experience>> {
    return this.request<Experience>("/experiences", {
      method: "POST",
      body: JSON.stringify(experience),
    });
  }

  async updateExperience(
    id: string,
    experience: Partial<Experience>
  ): Promise<ApiResponse<Experience>> {
    return this.request<Experience>(`/experiences/${id}`, {
      method: "PUT",
      body: JSON.stringify(experience),
    });
  }

  async deleteExperience(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/experiences/${id}`, {
      method: "DELETE",
    });
  }

  // Analytics API
  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    return this.request<AnalyticsData>("/analytics");
  }

  async trackView(experienceId: string): Promise<ApiResponse<void>> {
    return this.request<void>("/analytics/track-view", {
      method: "POST",
      body: JSON.stringify({ experienceId }),
    });
  }

  // File Upload API
  async uploadFile(
    file: File,
    type: "model" | "image" | "video"
  ): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    return this.request<{ url: string }>("/files/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Health Check
  async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    return this.request<{ status: string; timestamp: string }>("/health");
  }
}

export const apiService = new ApiService();
export default apiService;
