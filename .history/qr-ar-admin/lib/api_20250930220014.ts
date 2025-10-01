import { 
  ApiResponse, 
  ExperienceDto, 
  ExperienceCreateDto, 
  ExperienceUpdateDto,
  AnalyticsEventDto,
  AnalyticsEventCreateDto,
  FileUploadResult 
} from '@/types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || '/api'
  : '/api';

class ApiClient {
  private async fetch<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Experience endpoints
  async getExperiences(): Promise<ApiResponse<ExperienceDto[]>> {
    return this.fetch<ExperienceDto[]>('/experiences');
  }

  async getExperience(id: string): Promise<ApiResponse<ExperienceDto>> {
    return this.fetch<ExperienceDto>(`/experiences/${id}`);
  }

  async getExperienceBySlug(slug: string): Promise<ApiResponse<ExperienceDto>> {
    return this.fetch<ExperienceDto>(`/experiences/slug/${slug}`);
  }

  async createExperience(data: ExperienceCreateDto): Promise<ApiResponse<ExperienceDto>> {
    return this.fetch<ExperienceDto>('/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExperience(id: string, data: ExperienceUpdateDto): Promise<ApiResponse<ExperienceDto>> {
    return this.fetch<ExperienceDto>(`/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExperience(id: string): Promise<ApiResponse<boolean>> {
    return this.fetch<boolean>(`/experiences/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleExperienceActive(id: string): Promise<ApiResponse<boolean>> {
    return this.fetch<boolean>(`/experiences/${id}/toggle-active`, {
      method: 'PATCH',
    });
  }

  // File upload endpoints
  async uploadFile(file: File, category: 'models' | 'images' | 'videos'): Promise<ApiResponse<FileUploadResult>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const url = `${API_BASE_URL}/upload/${category}`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'File upload failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async deleteFile(fileName: string, category: 'models' | 'images' | 'videos'): Promise<ApiResponse<boolean>> {
    return this.fetch<boolean>(`/upload/${category}/${fileName}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async trackEvent(data: AnalyticsEventCreateDto): Promise<ApiResponse<AnalyticsEventDto>> {
    return this.fetch<AnalyticsEventDto>('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEvents(experienceId?: string, page = 1, pageSize = 50): Promise<ApiResponse<AnalyticsEventDto[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (experienceId) {
      params.append('experienceId', experienceId);
    }

    return this.fetch<AnalyticsEventDto[]>(`/analytics/events?${params}`);
  }

  async getEventStats(experienceId: string): Promise<ApiResponse<Record<string, number>>> {
    return this.fetch<Record<string, number>>(`/analytics/stats/${experienceId}`);
  }

  // Health check
  async health(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.fetch<{ status: string; timestamp: string }>('/health');
  }
}

export const apiClient = new ApiClient();