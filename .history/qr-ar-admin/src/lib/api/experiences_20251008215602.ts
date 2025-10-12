import { apiClient } from './client';
import {
  ARExperience,
  ExperienceCreateDto,
  ExperienceDto,
  ExperienceUpdateDto,
} from '@/types';
import {
  mapExperienceDtoToARExperience,
  mapARAssetToAssetDto,
} from '@/lib/helpers/experienceHelpers';

/**
 * Experience API Service
 * Handles all experience-related API calls with proper DTO mapping
 */
export class ExperiencesService {
  /**
   * Get all experiences and map to AR format
   */
  async getExperiences(): Promise<ARExperience[]> {
    const response = await apiClient.getExperiences();
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch experiences');
    }

    return response.data.map(mapExperienceDtoToARExperience);
  }

  /**
   * Get single experience by ID and map to AR format
   */
  async getExperience(id: string): Promise<ARExperience> {
    const response = await apiClient.getExperience(id);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Experience not found');
    }

    return mapExperienceDtoToARExperience(response.data);
  }

  /**
   * Get single experience by slug and map to AR format
   */
  async getExperienceBySlug(slug: string): Promise<ARExperience> {
    const response = await apiClient.getExperienceBySlug(slug);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Experience not found');
    }

    return mapExperienceDtoToARExperience(response.data);
  }

  /**
   * Create new experience
   */
  async createExperience(experience: Partial<ARExperience>): Promise<ARExperience> {
    // Map AR experience to DTO format
    const createDto: ExperienceCreateDto = {
      title: experience.title || '',
      slug: experience.slug,
      description: experience.description,
      assets: experience.assets?.map(mapARAssetToAssetDto) || [],
    };

    const response = await apiClient.createExperience(createDto);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create experience');
    }

    return mapExperienceDtoToARExperience(response.data);
  }

  /**
   * Update existing experience
   */
  async updateExperience(id: string, experience: Partial<ARExperience>): Promise<ARExperience> {
    // Map AR experience to DTO format
    const updateDto: ExperienceUpdateDto = {
      title: experience.title || '',
      slug: experience.slug,
      description: experience.description,
      isActive: experience.isActive ?? true,
      assets: experience.assets?.map(mapARAssetToAssetDto) || [],
    };

    const response = await apiClient.updateExperience(id, updateDto);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update experience');
    }

    return mapExperienceDtoToARExperience(response.data);
  }

  /**
   * Delete experience
   */
  async deleteExperience(id: string): Promise<boolean> {
    const response = await apiClient.deleteExperience(id);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete experience');
    }

    return true;
  }

  /**
   * Toggle experience active status
   */
  async toggleExperienceActive(id: string): Promise<boolean> {
    const response = await apiClient.toggleExperienceActive(id);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to toggle experience status');
    }

    return true;
  }
}

// Export singleton instance
export const experiencesService = new ExperiencesService();
export default experiencesService;