/**
 * Cliente API unificado para Quick AR Platform
 * Consume los endpoints del backend .NET sin modificaciones
 * Mapeo automático entre DTOs del backend y tipos del frontend
 */

import { 
  AssetDto, 
  ExperienceDto, 
  AnalyticsEventDto,
  AnalyticsEventCreateDto,
  ExperienceCreateDto,
  ExperienceUpdateDto,
  ApiResponse,
  AssetKind,
  ARAssetType,
  ARAsset,
  ARExperience,
  ASSET_KIND_TO_AR_TYPE,
  AR_TYPE_TO_ASSET_KIND
} from '@/types'

// Configuración del cliente API
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5002',
  timeout: 10000,
  retries: 3
}

/**
 * Clase de error personalizada para la API
 */
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Opciones de configuración para requests
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
}

/**
 * Cliente API principal
 */
class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  /**
   * Método base para realizar requests HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_CONFIG.timeout,
      retries = API_CONFIG.retries
    } = options

    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers
      } as Record<string, string>,
      signal: AbortSignal.timeout(timeout)
    }

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Para uploads de archivos, no establecer Content-Type
        const configHeaders = config.headers as Record<string, string>
        delete configHeaders['Content-Type']
        config.body = body
      } else {
        config.body = JSON.stringify(body)
      }
    }

    let lastError: Error | undefined
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config)
        
        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`
          
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch {
            // Si no es JSON válido, usar el texto como está
            if (errorText) errorMessage = errorText
          }

          throw new ApiError(
            errorMessage,
            response.status,
            response.status.toString(),
            errorText
          )
        }

        // Manejar respuestas vacías (204 No Content)
        if (response.status === 204) {
          return {} as T
        }

        const data = await response.json()
        return data
      } catch (error) {
        lastError = error as Error
        
        // No reintentar en errores de cliente (4xx) o AbortError
        if (error instanceof ApiError && error.status && error.status < 500) {
          throw error
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408, 'TIMEOUT')
        }

        // Esperar antes del siguiente intento
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw new ApiError(
      `Request failed after ${retries + 1} attempts: ${lastError?.message || 'Unknown error'}`,
      500,
      'NETWORK_ERROR'
    )
  }

  /**
   * EXPERIENCIAS - Mappers y métodos
   */

  // Mapper: ExperienceDto -> ARExperience
  private mapExperienceFromDto(dto: ExperienceDto): ARExperience {
    return {
      id: dto.id,
      title: dto.title,
      slug: dto.slug,
      description: dto.description || '',
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      isActive: dto.isActive,
      assets: dto.assets?.map(asset => this.mapAssetFromDto(asset)) || [],
      
      // Propiedades calculadas para AR
      hasAR: dto.assets?.some(a => a.kind === 'model3d') || false,
      qrCodeUrl: `/api/qr/${dto.id}`, // URL generada
      primaryAsset: dto.assets?.[0] ? this.mapAssetFromDto(dto.assets[0]) : undefined
    }
  }

  // Mapper: ExperienceCreateDto
  private mapExperienceToCreateDto(data: { title: string; slug?: string; description?: string }): ExperienceCreateDto {
    return {
      title: data.title,
      slug: data.slug || undefined,
      description: data.description || undefined,
      assets: undefined
    }
  }

  // Mapper: ExperienceUpdateDto
  private mapExperienceToUpdateDto(data: { title: string; slug?: string; description?: string; isActive?: boolean }): ExperienceUpdateDto {
    return {
      title: data.title,
      slug: data.slug || undefined,
      description: data.description || undefined,
      isActive: data.isActive ?? true,
      assets: undefined
    }
  }

  /**
   * ASSETS - Mappers y métodos
   */

  // Mapper: AssetDto -> ARAsset
  private mapAssetFromDto(dto: AssetDto): ARAsset {
    const arType = ASSET_KIND_TO_AR_TYPE[dto.kind]
    
    return {
      id: dto.id,
      name: dto.name,
      type: arType,
      url: dto.url || undefined,
      content: dto.text || undefined,
      mimeType: dto.mimeType || undefined,
      fileSizeBytes: dto.fileSizeBytes || undefined,
      
      // Metadatos para AR
      isLoaded: false,
      hasError: false,
      loadProgress: 0
    }
  }

  /**
   * MÉTODOS DE LA API - EXPERIENCIAS
   */

  // GET /api/experiences
  async getExperiences(): Promise<ARExperience[]> {
    const response = await this.request<ApiResponse<ExperienceDto[]>>('/api/experiences')
    
    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch experiences', 500, 'FETCH_ERROR')
    }
    
    return response.data.map((dto: ExperienceDto) => this.mapExperienceFromDto(dto))
  }

  // GET /api/experiences/{id}
  async getExperience(id: string): Promise<ARExperience> {
    const response = await this.request<ApiResponse<ExperienceDto>>(`/api/experiences/${id}`)
    
    if (!response.success || !response.data) {
      throw new ApiError(`Experience with id ${id} not found`, 404, 'NOT_FOUND')
    }
    
    return this.mapExperienceFromDto(response.data)
  }

  // POST /api/experiences
  async createExperience(data: { title: string; slug?: string; description?: string }): Promise<ARExperience> {
    const dto = this.mapExperienceToCreateDto(data)
    const response = await this.request<ApiResponse<ExperienceDto>>('/api/experiences', {
      method: 'POST',
      body: dto
    })
    
    if (!response.success || !response.data) {
      throw new ApiError('Failed to create experience', 500, 'CREATE_ERROR')
    }
    
    return this.mapExperienceFromDto(response.data)
  }

  // PUT /api/experiences/{id}
  async updateExperience(
    id: string, 
    data: { title: string; slug?: string; description?: string; isActive?: boolean }
  ): Promise<ARExperience> {
    const dto = this.mapExperienceToUpdateDto(data)
    const response = await this.request<ApiResponse<ExperienceDto>>(`/api/experiences/${id}`, {
      method: 'PUT',
      body: dto
    })
    
    if (!response.success || !response.data) {
      throw new ApiError(`Failed to update experience ${id}`, 500, 'UPDATE_ERROR')
    }
    
    return this.mapExperienceFromDto(response.data)
  }

  // DELETE /api/experiences/{id}
  async deleteExperience(id: string): Promise<void> {
    await this.request(`/api/experiences/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * MÉTODOS DE LA API - ANALYTICS
   */

  // POST /api/analytics
  async trackEvent(data: AnalyticsEventCreateDto): Promise<void> {
    await this.request('/api/analytics', {
      method: 'POST',
      body: data
    })
  }

  // GET /api/analytics/{experienceId}
  async getAnalytics(experienceId: string): Promise<AnalyticsEventDto[]> {
    const response = await this.request<ApiResponse<AnalyticsEventDto[]>>(`/api/analytics/${experienceId}`)
    
    if (!response.success || !response.data) {
      return []
    }
    
    return response.data
  }

  /**
   * MÉTODOS UTILITARIOS
   */

  // Health check del API
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/api/health')
      return true
    } catch {
      return false
    }
  }

  // Obtener información del servidor
  async getServerInfo(): Promise<any> {
    return this.request('/api/health')
  }
}

// Instancia singleton del cliente
export const apiClient = new ApiClient()

// Re-exportar para facilitar imports
export { ApiClient, ApiError }

// Tipos auxiliares para el cliente
export type { RequestOptions }