import { Experience } from '@/types';

export interface ARClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface ARExperienceResponse {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  assets: ARAsset[];
  qrCodeUrl?: string;
  analyticsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ARAsset {
  id: string;
  assetType: 'image' | 'video' | 'text' | 'model3d';
  url?: string;
  content?: string;
  metadata?: {
    size?: number;
    mimeType?: string;
    duration?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  arSettings?: {
    scale?: string;
    placement?: 'floor' | 'wall';
    anchorMode?: 'auto' | 'manual';
    interactionEnabled?: boolean;
  };
}

export interface CreateExperienceRequest {
  title: string;
  description?: string;
  isActive?: boolean;
  assets: Omit<ARAsset, 'id'>[];
  analyticsEnabled?: boolean;
}

export interface UpdateExperienceRequest extends Partial<CreateExperienceRequest> {
  id: string;
}

export interface ARAnalyticsEvent {
  experienceId: string;
  eventType: 'view' | 'ar_start' | 'ar_end' | 'interaction' | 'error';
  data?: Record<string, any>;
  timestamp?: string;
  userAgent?: string;
  deviceInfo?: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
    arSupported: boolean;
  };
}

export class ARClientRefactored {
  private config: ARClientConfig;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: ARClientConfig) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      ...config,
    };
  }

  /**
   * Get all experiences with optional filtering
   */
  async getExperiences(options?: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<ARExperienceResponse[]> {
    const cacheKey = `experiences_${JSON.stringify(options || {})}`;
    const cached = this.getFromCache<ARExperienceResponse[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const queryParams = new URLSearchParams();
    if (options?.isActive !== undefined) {
      queryParams.set('isActive', options.isActive.toString());
    }
    if (options?.limit) {
      queryParams.set('limit', options.limit.toString());
    }
    if (options?.offset) {
      queryParams.set('offset', options.offset.toString());
    }
    if (options?.search) {
      queryParams.set('search', options.search);
    }

    const url = `${this.config.baseUrl}/api/experiences?${queryParams}`;
    const response = await this.fetchWithRetry<ARExperienceResponse[]>(url);
    
    this.setCache(cacheKey, response);
    return response;
  }

  /**
   * Get a single experience by ID
   */
  async getExperience(id: string): Promise<ARExperienceResponse> {
    const cacheKey = `experience_${id}`;
    const cached = this.getFromCache<ARExperienceResponse>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const url = `${this.config.baseUrl}/api/experiences/${id}`;
    const response = await this.fetchWithRetry<ARExperienceResponse>(url);
    
    this.setCache(cacheKey, response);
    return response;
  }

  /**
   * Create a new AR experience
   */
  async createExperience(data: CreateExperienceRequest): Promise<ARExperienceResponse> {
    const url = `${this.config.baseUrl}/api/experiences`;
    
    const response = await this.fetchWithRetry<ARExperienceResponse>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Invalidate experiences list cache
    this.invalidateCache('experiences_');
    
    return response;
  }

  /**
   * Update an existing experience
   */
  async updateExperience(data: UpdateExperienceRequest): Promise<ARExperienceResponse> {
    const url = `${this.config.baseUrl}/api/experiences/${data.id}`;
    
    const response = await this.fetchWithRetry<ARExperienceResponse>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Invalidate related caches
    this.invalidateCache(`experience_${data.id}`);
    this.invalidateCache('experiences_');
    
    return response;
  }

  /**
   * Delete an experience
   */
  async deleteExperience(id: string): Promise<void> {
    const url = `${this.config.baseUrl}/api/experiences/${id}`;
    
    await this.fetchWithRetry<void>(url, {
      method: 'DELETE',
    });

    // Invalidate related caches
    this.invalidateCache(`experience_${id}`);
    this.invalidateCache('experiences_');
  }

  /**
   * Upload a file asset for an experience
   */
  async uploadAsset(file: File, onProgress?: (progress: number) => void): Promise<{ url: string; metadata: ARAsset['metadata'] }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.config.baseUrl}/api/files/upload`;
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });
      
      xhr.open('POST', url);
      
      if (this.config.apiKey) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.config.apiKey}`);
      }
      
      xhr.send(formData);
    });
  }

  /**
   * Track an analytics event
   */
  async trackEvent(event: ARAnalyticsEvent): Promise<void> {
    const url = `${this.config.baseUrl}/api/analytics/events`;
    
    // Don't throw errors for analytics - just log
    try {
      await this.fetchWithRetry<void>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          timestamp: event.timestamp || new Date().toISOString(),
          userAgent: event.userAgent || navigator.userAgent,
          deviceInfo: event.deviceInfo || this.detectDeviceInfo(),
        }),
      });
    } catch (error) {
      console.warn('Failed to track analytics event:', error);
    }
  }

  /**
   * Get analytics data for an experience
   */
  async getAnalytics(experienceId: string, options?: {
    startDate?: string;
    endDate?: string;
    eventTypes?: string[];
  }): Promise<{
    totalViews: number;
    arSessions: number;
    interactions: number;
    events: ARAnalyticsEvent[];
    deviceBreakdown: Record<string, number>;
    timelineData: Array<{ date: string; count: number }>;
  }> {
    const queryParams = new URLSearchParams();
    if (options?.startDate) {
      queryParams.set('startDate', options.startDate);
    }
    if (options?.endDate) {
      queryParams.set('endDate', options.endDate);
    }
    if (options?.eventTypes?.length) {
      queryParams.set('eventTypes', options.eventTypes.join(','));
    }

    const url = `${this.config.baseUrl}/api/analytics/experiences/${experienceId}?${queryParams}`;
    return this.fetchWithRetry(url);
  }

  /**
   * Generate QR code for an experience
   */
  async generateQRCode(experienceId: string, options?: {
    size?: number;
    format?: 'png' | 'svg';
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }): Promise<{ qrCodeUrl: string; downloadUrl: string }> {
    const url = `${this.config.baseUrl}/api/experiences/${experienceId}/qr`;
    
    return this.fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options || {}),
    });
  }

  /**
   * Check API health and AR support
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: {
      database: boolean;
      storage: boolean;
      analytics: boolean;
    };
    clientSupport: {
      webxr: boolean;
      modelViewer: boolean;
      threejs: boolean;
    };
  }> {
    const url = `${this.config.baseUrl}/api/health`;
    
    try {
      const response = await this.fetchWithRetry(url);
      
      // Add client-side AR support detection
      const clientSupport = await this.detectARSupport();
      
      return {
        status: response.status,
        timestamp: response.timestamp,
        services: response.services,
        clientSupport,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: false,
          storage: false,
          analytics: false,
        },
        clientSupport: await this.detectARSupport(),
      };
    }
  }

  // Private helper methods

  private async fetchWithRetry<T>(url: string, options?: RequestInit): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options?.headers,
            ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
          },
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return null as T;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.config.retryAttempts!) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_DURATION,
    });
  }

  private invalidateCache(keyPrefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  private async detectARSupport(): Promise<{
    webxr: boolean;
    modelViewer: boolean;
    threejs: boolean;
  }> {
    const support = {
      webxr: false,
      modelViewer: false,
      threejs: false,
    };

    try {
      // Check WebXR support
      if (navigator.xr) {
        support.webxr = await navigator.xr.isSessionSupported('immersive-ar');
      }
    } catch (error) {
      console.warn('WebXR support check failed:', error);
    }

    try {
      // Check model-viewer support
      support.modelViewer = 'customElements' in window && typeof window.customElements.define === 'function';
    } catch (error) {
      console.warn('Model-viewer support check failed:', error);
    }

    try {
      // Check Three.js support
      support.threejs = typeof THREE !== 'undefined' || 
                        (typeof window !== 'undefined' && 'WebGLRenderingContext' in window);
    } catch (error) {
      console.warn('Three.js support check failed:', error);
    }

    return support;
  }

  private detectDeviceInfo(): ARAnalyticsEvent['deviceInfo'] {
    const userAgent = navigator.userAgent;
    
    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (/Mobi|Android/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    let os = 'Unknown';
    if (/Windows/i.test(userAgent)) os = 'Windows';
    else if (/Mac/i.test(userAgent)) os = 'macOS';
    else if (/Linux/i.test(userAgent)) os = 'Linux';
    else if (/Android/i.test(userAgent)) os = 'Android';
    else if (/iPhone|iPad/i.test(userAgent)) os = 'iOS';

    let browser = 'Unknown';
    if (/Chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Safari/i.test(userAgent)) browser = 'Safari';
    else if (/Edge/i.test(userAgent)) browser = 'Edge';

    return {
      type: deviceType,
      os,
      browser,
      arSupported: false, // Will be updated by detectARSupport
    };
  }
}

// Default instance for easy use
export const defaultARClient = new ARClientRefactored({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001',
});

export default ARClientRefactored;