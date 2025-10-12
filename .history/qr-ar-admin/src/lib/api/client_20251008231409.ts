/**
 * Quick AR - API Client Unificado
 * 
 * Cliente HTTP que consume la API .NET existente sin modificaciones
 * Maneja transformaciones automáticas entre DTOs y modelos frontend
 */

import {
  ExperienceDto,
  ExperienceCreateDto,
  ExperienceUpdateDto,
  AssetDto,
  AssetCreateDto,
  AnalyticsEventDto,
  AnalyticsEventCreateDto,
  ApiResponse,
  FileUploadResult,
  ARExperience,
  ARAsset,
  AnalyticsEvent,
  transformExperienceDtoToARExperience,
  transformAssetDtoToARAsset,
  transformARAssetToCreateDto,
} from '@/lib/types';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5002';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// =============================================================================
// TIPOS INTERNOS
// =============================================================================

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// =============================================================================
// API CLIENT
// =============================================================================

export class QuickARApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = { ...DEFAULT_HEADERS };
  }

  // -----------------------------------------------
  // MÉTODOS PRIVADOS
  // -----------------------------------------------

  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000,
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    
    // Configurar timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchConfig: RequestInit = {
        method,
        signal: controller.signal,
      };

      if (body && method !== 'GET') {
        if (body instanceof FormData) {
          // Para uploads, no establecer Content-Type (el browser lo hace automáticamente)
          fetchConfig.headers = { ...headers };
          fetchConfig.body = body;
        } else {
          fetchConfig.headers = {
            ...this.defaultHeaders,
            ...headers,
          };
          fetchConfig.body = JSON.stringify(body);
        }
      } else {
        fetchConfig.headers = {
          ...this.defaultHeaders,
          ...headers,
        };
      }

      const response = await fetch(url, fetchConfig);
      
      clearTimeout(timeoutId);

      // Manejar errores HTTP
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // Si no es JSON válido, usar el texto como mensaje
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new APIError(errorMessage, response.status, errorText);
      }

      // Parsear respuesta
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as T;
      }

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408);
        }
        throw new APIError(`Network error: ${error.message}`, 0);
      }
      
      throw new APIError('Unknown error occurred', 0);
    }
  }

  // -----------------------------------------------
  // EXPERIENCIAS
  // -----------------------------------------------

  /**
   * Obtiene todas las experiencias
   */
  async getExperiences(): Promise<ARExperience[]> {
    const response = await this.makeRequest<ApiResponse<ExperienceDto[]>>('/api/experiences');
    
    if (!response.success || !response.data) {
      throw new APIError(response.message || 'Failed to fetch experiences', 500);
    }

    return response.data.map(transformExperienceDtoToARExperience);
  }

  /**
   * Obtiene una experiencia específica por ID
   */
  async getExperience(id: string): Promise<ARExperience> {
    const response = await this.makeRequest<ApiResponse<ExperienceDto>>(`/api/experiences/${id}`);
    
    if (!response.success || !response.data) {
      throw new APIError(response.message || 'Experience not found', 404);
    }

    return transformExperienceDtoToARExperience(response.data);
  }

  /**
   * Obtiene una experiencia por slug
   */
  async getExperienceBySlug(slug: string): Promise<ARExperience> {
    const response = await this.makeRequest<ApiResponse<ExperienceDto>>(`/api/experiences/slug/${slug}`);
    
    if (!response.success || !response.data) {
      throw new APIError(response.message || 'Experience not found', 404);
    }

    return transformExperienceDtoToARExperience(response.data);
  }

  /**
   * Crea una nueva experiencia
   */
  async createExperience(experience: {
    title: string;
    slug?: string;
    description?: string;
    assets?: ARAsset[];
  }): Promise<ARExperience> {
    const createDto: ExperienceCreateDto = {
      title: experience.title,
      slug: experience.slug || null,
      description: experience.description || null,
      assets: experience.assets?.map(transformARAssetToCreateDto) || null,
    };

    const response = await this.makeRequest<ApiResponse<ExperienceDto>>('/api/experiences', {
      method: 'POST',
      body: createDto,
    });

    if (!response.success || !response.data) {
      throw new APIError(response.message || 'Failed to create experience', 500);
    }

    return transformExperienceDtoToARExperience(response.data);
  }

  /**
   * Actualiza una experiencia existente
   */
  async updateExperience(id: string, experience: {
    title: string;
    slug?: string;
    description?: string;
    isActive: boolean;
    assets?: ARAsset[];
  }): Promise<ARExperience> {
    const updateDto: ExperienceUpdateDto = {
      title: experience.title,
      slug: experience.slug || null,
      description: experience.description || null,
      isActive: experience.isActive,
      assets: experience.assets?.map(transformARAssetToCreateDto) || null,
    };

    const response = await this.makeRequest<ApiResponse<ExperienceDto>>(`/api/experiences/${id}`, {
      method: 'PUT',
      body: updateDto,
    });

    if (!response.success || !response.data) {
      throw new APIError(response.message || 'Failed to update experience', 500);
    }

    return transformExperienceDtoToARExperience(response.data);
  }

  /**
   * Elimina una experiencia
   */
  async deleteExperience(id: string): Promise<void> {
    const response = await this.makeRequest<ApiResponse<void>>(`/api/experiences/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new APIError(response.message || 'Failed to delete experience', 500);
    }
  }

  // -----------------------------------------------
  // ASSETS
  // -----------------------------------------------

  /**
   * Sube un archivo y retorna la información del asset
   */
  async uploadAsset(file: File): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.makeRequest<ApiResponse<FileUploadResult>>('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.success || !response.data) {
      throw new APIError(response.message || 'Failed to upload file', 500);
    }

    return response.data;
  }

  // -----------------------------------------------
  // ANALYTICS
  // -----------------------------------------------

  /**
   * Registra un evento de analytics
   */
  async trackEvent(event: {
    experienceId: string;
    eventType: string;
    properties?: Record<string, any>;
  }): Promise<void> {
    const createDto: AnalyticsEventCreateDto = {
      experienceId: event.experienceId,
      eventType: event.eventType,
      properties: event.properties || null,
    };

    const response = await this.makeRequest<ApiResponse<AnalyticsEventDto>>('/api/analytics/events', {
      method: 'POST',
      body: createDto,
    });

    if (!response.success) {
      // No lanzar error para analytics, solo log
      console.warn('Failed to track event:', response.message);
    }
  }

  /**
   * Obtiene eventos de analytics para una experiencia
   */
  async getAnalytics(experienceId: string): Promise<AnalyticsEvent[]> {
    const response = await this.makeRequest<ApiResponse<AnalyticsEventDto[]>>(`/api/analytics/experiences/${experienceId}`);
    
    if (!response.success || !response.data) {
      throw new APIError(response.message || 'Failed to fetch analytics', 500);
    }

    return response.data.map(dto => ({
      type: dto.eventType as any,
      experienceId: dto.experienceId,
      assetId: dto.properties?.assetId,
      properties: dto.properties || {},
      timestamp: new Date(dto.timestamp),
    }));
  }

  // -----------------------------------------------
  // HEALTH CHECK
  // -----------------------------------------------

  /**
   * Verifica que la API esté funcionando
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest<any>('/api/health', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

// =============================================================================
// INSTANCIA SINGLETON
// =============================================================================

export const apiClient = new QuickARApiClient();

// =============================================================================
// HOOKS Y UTILIDADES
// =============================================================================

/**
 * Hook para manejar estados de carga de API
 */
export function useApiState<T>() {
  return {
    data: null as T | null,
    isLoading: false,
    error: null as string | null,
    
    execute: async (apiCall: () => Promise<T>) => {
      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }
        throw new APIError('Unexpected error', 0);
      }
    }
  };
}

/**
 * Utilidad para manejar errores de API de forma consistente
 */
export function handleApiError(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}