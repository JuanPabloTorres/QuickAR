// API Service for QuickAR Backend Integration
// Dynamic base URL detection for network and localhost access

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

// Get dynamic API base URL
const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.API_INTERNAL_BASE_URL || "http://localhost:5001";
  }

  const hostname = window.location.hostname;
  const isNetworkIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (isNetworkIP) {
    return `http://${hostname}:5001`;
  }

  return "http://localhost:5001";
};

class ApiService {
  private baseUrl = `${getApiBaseUrl()}/api`;

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // Create headers with auth token
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add authorization header if token exists
    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
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
