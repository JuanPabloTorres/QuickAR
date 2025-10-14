import {
  AnalyticsEvent,
  AnalyticsSummary,
  DeviceStats,
  ExperienceStats,
  TimeSeriesData,
} from "@/types";
import { ApiResponse } from "@/types/auth";

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

class AnalyticsService {
  private baseUrl = `${getApiBaseUrl()}/api/v1/analytics`;

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  /**
   * Make authenticated request to API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error: any) {
      console.error("Analytics API Request failed:", error);
      return {
        success: false,
        data: null as any,
        message: error.message || "Request failed",
        errors: [error.message],
      };
    }
  }

  /**
   * Get analytics summary (dashboard overview)
   */
  async getSummary(): Promise<ApiResponse<AnalyticsSummary>> {
    return this.makeRequest<AnalyticsSummary>("/summary");
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(): Promise<ApiResponse<DeviceStats[]>> {
    return this.makeRequest<DeviceStats[]>("/devices");
  }

  /**
   * Get time series data
   */
  async getTimeSeriesData(
    days: number = 30
  ): Promise<ApiResponse<TimeSeriesData[]>> {
    return this.makeRequest<TimeSeriesData[]>(`/timeseries?days=${days}`);
  }

  /**
   * Get top experiences by views
   */
  async getTopExperiences(
    limit: number = 10
  ): Promise<ApiResponse<ExperienceStats[]>> {
    return this.makeRequest<ExperienceStats[]>(
      `/top-experiences?limit=${limit}`
    );
  }

  /**
   * Get analytics events with pagination
   */
  async getEvents(
    experienceId?: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<ApiResponse<AnalyticsEvent[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (experienceId) {
      params.append("experienceId", experienceId);
    }

    return this.makeRequest<AnalyticsEvent[]>(`/events?${params.toString()}`);
  }

  /**
   * Get stats by experience
   */
  async getStatsByExperience(
    experienceId: string
  ): Promise<ApiResponse<Record<string, number>>> {
    return this.makeRequest<Record<string, number>>(`/stats/${experienceId}`);
  }

  /**
   * Track an analytics event
   */
  async trackEvent(
    eventType: string,
    experienceId: string,
    userAgent?: string,
    ipAddress?: string,
    referrer?: string,
    additionalData?: string
  ): Promise<ApiResponse<AnalyticsEvent>> {
    return this.makeRequest<AnalyticsEvent>("/track", {
      method: "POST",
      body: JSON.stringify({
        eventType,
        experienceId,
        userAgent,
        ipAddress,
        referrer,
        additionalData,
      }),
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
