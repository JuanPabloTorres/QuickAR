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
      name: dto.name,
      description: dto.description || '',
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      isActive: dto.isActive,
      qrCodeUrl: dto.qrCodeUrl || '',
      assets: dto.assets?.map(asset => this.mapAssetFromDto(asset)) || [],
      
      // Propiedades calculadas
      assetCount: dto.assets?.length || 0,
      activeAssetCount: dto.assets?.filter(a => a.isActive).length || 0,
      hasActiveAssets: (dto.assets?.filter(a => a.isActive).length || 0) > 0,
      
      // Análisis de tipos de assets
      has3DModels: dto.assets?.some(a => a.type === AssetTypeEnum.MODEL_3D) || false,
      hasImages: dto.assets?.some(a => a.type === AssetTypeEnum.IMAGE) || false,
      hasVideos: dto.assets?.some(a => a.type === AssetTypeEnum.VIDEO) || false,
      hasAudios: dto.assets?.some(a => a.type === AssetTypeEnum.AUDIO) || false
    }
  }

  // Mapper: ARExperience -> CreateExperienceRequest
  private mapExperienceToCreateDto(experience: CreateExperienceRequest): Partial<ExperienceDto> {
    return {
      name: experience.name,
      description: experience.description,
      isActive: experience.isActive ?? true
    }
  }

  // Mapper: UpdateExperienceRequest -> ExperienceDto
  private mapExperienceToUpdateDto(experience: UpdateExperienceRequest): Partial<ExperienceDto> {
    return {
      name: experience.name,
      description: experience.description,
      isActive: experience.isActive
    }
  }

  /**
   * ASSETS - Mappers y métodos
   */

  // Mapper: AssetDto -> ARAsset
  private mapAssetFromDto(dto: AssetDto): ARAsset {
    return {
      id: dto.id,
      experienceId: dto.experienceId,
      name: dto.name,
      type: dto.type as AssetType,
      fileUrl: dto.fileUrl,
      fileName: dto.fileName || '',
      fileSize: dto.fileSize || 0,
      mimeType: dto.mimeType || '',
      isActive: dto.isActive,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      
      // Propiedades calculadas para AR
      isModel3D: dto.type === AssetTypeEnum.MODEL_3D,
      isImage: dto.type === AssetTypeEnum.IMAGE,
      isVideo: dto.type === AssetTypeEnum.VIDEO,
      isAudio: dto.type === AssetTypeEnum.AUDIO,
      
      // Metadatos de archivo
      fileSizeFormatted: this.formatFileSize(dto.fileSize || 0),
      fileExtension: this.getFileExtension(dto.fileName || ''),
      
      // URLs absolutas para recursos
      absoluteFileUrl: this.getAbsoluteUrl(dto.fileUrl),
      
      // Propiedades específicas de AR
      arViewerConfig: this.generateARViewerConfig(dto)
    }
  }

  // Generar configuración para el viewer AR
  private generateARViewerConfig(asset: AssetDto): Record<string, any> {
    const baseConfig = {
      'auto-rotate': false,
      'camera-controls': true,
      'shadow-intensity': '1'
    }

    switch (asset.type) {
      case AssetTypeEnum.MODEL_3D:
        return {
          ...baseConfig,
          'ar': true,
          'ar-modes': 'webxr scene-viewer quick-look',
          'environment-image': 'neutral',
          'tone-mapping': 'neutral'
        }
      
      case AssetTypeEnum.IMAGE:
        return {
          ...baseConfig,
          'poster': asset.fileUrl
        }
      
      default:
        return baseConfig
    }
  }

  // Utilities para archivos
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || ''
  }

  private getAbsoluteUrl(relativePath: string): string {
    if (relativePath.startsWith('http')) return relativePath
    return `${this.baseUrl}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`
  }

  /**
   * MÉTODOS DE LA API - EXPERIENCIAS
   */

  // GET /api/experiences
  async getExperiences(): Promise<ARExperience[]> {
    const response = await this.request<ApiResponseDto<ExperienceDto[]>>('/api/experiences')
    
    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch experiences', 500, 'FETCH_ERROR')
    }
    
    return response.data.map(dto => this.mapExperienceFromDto(dto))
  }

  // GET /api/experiences/{id}
  async getExperience(id: string): Promise<ARExperience> {
    const response = await this.request<ApiResponseDto<ExperienceDto>>(`/api/experiences/${id}`)
    
    if (!response.success || !response.data) {
      throw new ApiError(`Experience with id ${id} not found`, 404, 'NOT_FOUND')
    }
    
    return this.mapExperienceFromDto(response.data)
  }

  // POST /api/experiences
  async createExperience(experience: CreateExperienceRequest): Promise<ARExperience> {
    const dto = this.mapExperienceToCreateDto(experience)
    const response = await this.request<ApiResponseDto<ExperienceDto>>('/api/experiences', {
      method: 'POST',
      body: dto
    })
    
    if (!response.success || !response.data) {
      throw new ApiError('Failed to create experience', 500, 'CREATE_ERROR')
    }
    
    return this.mapExperienceFromDto(response.data)
  }

  // PUT /api/experiences/{id}
  async updateExperience(id: string, experience: UpdateExperienceRequest): Promise<ARExperience> {
    const dto = this.mapExperienceToUpdateDto(experience)
    const response = await this.request<ApiResponseDto<ExperienceDto>>(`/api/experiences/${id}`, {
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
   * MÉTODOS DE LA API - ASSETS
   */

  // GET /api/experiences/{experienceId}/assets
  async getAssets(experienceId: string): Promise<ARAsset[]> {
    const response = await this.request<ApiResponseDto<AssetDto[]>>(`/api/experiences/${experienceId}/assets`)
    
    if (!response.success || !response.data) {
      return []
    }
    
    return response.data.map(dto => this.mapAssetFromDto(dto))
  }

  // POST /api/fileupload
  async uploadAsset(
    experienceId: string, 
    file: File, 
    assetType: AssetType,
    onProgress?: (progress: number) => void
  ): Promise<ARAsset> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('experienceId', experienceId)
    formData.append('assetType', assetType)

    // TODO: Implementar progress tracking si es necesario
    const response = await this.request<ApiResponseDto<AssetDto>>('/api/fileupload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.success || !response.data) {
      throw new ApiError('Failed to upload asset', 500, 'UPLOAD_ERROR')
    }
    
    return this.mapAssetFromDto(response.data)
  }

  // DELETE /api/assets/{id}
  async deleteAsset(assetId: string): Promise<void> {
    await this.request(`/api/assets/${assetId}`, {
      method: 'DELETE'
    })
  }

  /**
   * MÉTODOS DE LA API - ANALYTICS
   */

  // POST /api/analytics
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const dto: Partial<AnalyticsDto> = {
      experienceId: event.experienceId,
      eventType: event.eventType,
      eventData: event.eventData,
      timestamp: event.timestamp || new Date(),
      userAgent: event.userAgent || navigator.userAgent,
      ipAddress: event.ipAddress // Se maneja en el backend
    }

    await this.request('/api/analytics', {
      method: 'POST',
      body: dto
    })
  }

  // GET /api/analytics/{experienceId}
  async getAnalytics(experienceId: string): Promise<AnalyticsEvent[]> {
    const response = await this.request<ApiResponseDto<AnalyticsDto[]>>(`/api/analytics/${experienceId}`)
    
    if (!response.success || !response.data) {
      return []
    }
    
    return response.data.map(dto => ({
      id: dto.id,
      experienceId: dto.experienceId,
      eventType: dto.eventType,
      eventData: dto.eventData,
      timestamp: new Date(dto.timestamp),
      userAgent: dto.userAgent,
      ipAddress: dto.ipAddress
    }))
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
export { ApiClient }

// Tipos auxiliares para el cliente
export type {
  RequestOptions,
  ApiError
}