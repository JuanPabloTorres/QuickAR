/**
 * ExperienceCreateForm - Formulario simplificado para crear nuevas experiencias AR
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ExperienceCreateDto, ARAssetType, AR_TYPE_TO_ASSET_KIND } from '@/types'
import { ApiClient } from '@/lib/api/client'
import { cn } from '@/lib/utils'

interface AssetFormData {
  name: string
  type: ARAssetType
  url?: string
  text?: string
}

interface FormData {
  title: string
  description: string
  slug: string
  assets: AssetFormData[]
}

interface ValidationErrors {
  title?: string
  description?: string
  slug?: string
  assets?: string
  general?: string
}

/**
 * Componente principal del formulario
 */
export function ExperienceCreateForm() {
  const router = useRouter()
  const apiClient = new ApiClient()
  
  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    slug: '',
    assets: []
  })

  // Estado de validación y UI
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Actualiza los datos del formulario
   */
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    
    // Limpiar errores relacionados
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
  }, [errors.general])

  /**
   * Valida el formulario
   */
  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {}

    // Validar campos básicos
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido'
    } else if (formData.title.length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    } else if (formData.description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es requerido'
    }

    // Validar assets
    if (formData.assets.length === 0) {
      newErrors.assets = 'Debe agregar al menos un asset para la experiencia'
    } else {
      const invalidAssets = formData.assets.filter(asset => 
        !asset.name || !asset.type || (!asset.url && !asset.text)
      )
      
      if (invalidAssets.length > 0) {
        newErrors.assets = 'Todos los assets deben tener nombre, tipo y contenido'
      }
    }

    return newErrors
  }, [formData])

  /**
   * Agrega un nuevo asset
   */
  const addAsset = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      assets: [
        ...prev.assets,
        {
          name: '',
          type: 'text' as ARAssetType,
          text: ''
        }
      ]
    }))
  }, [])

  /**
   * Elimina un asset
   */
  const removeAsset = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== index)
    }))
  }, [])

  /**
   * Actualiza un asset específico
   */
  const updateAsset = useCallback((index: number, updates: Partial<AssetFormData>) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === index ? { ...asset, ...updates } : asset
      )
    }))
  }, [])

  /**
   * Genera slug desde el título
   */
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }, [])

  /**
   * Maneja el cambio de título
   */
  const handleTitleChange = useCallback((title: string) => {
    updateFormData({ 
      title,
      slug: generateSlug(title)
    })
  }, [updateFormData, generateSlug])

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulario
    const validationErrors = validateForm()
    setErrors(validationErrors)
    
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsLoading(true)

    try {
      // Preparar datos para la API (usando la interfaz correcta del ApiClient)
      const experienceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        slug: formData.slug.trim()
      }

      // Crear experiencia
      const newExperience = await apiClient.createExperience(experienceData)
      
      // Redirigir a la lista de experiencias
      router.push('/experiences')
    } catch (error) {
      console.error('Error creating experience:', error)
      setErrors(prev => ({
        ...prev,
        general: 'Error al crear la experiencia. Verifica los datos e inténtalo de nuevo.'
      }))
    } finally {
      setIsLoading(false)
    }
  }, [formData, validateForm, apiClient, router])

  /**
   * Resetea el formulario
   */
  const handleReset = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      slug: '',
      assets: []
    })
    setErrors({})
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <form onSubmit={handleSubmit} className="p-6">
        {/* Error general */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errors.general}
          </div>
        )}

        <div className="space-y-6">
          {/* Información básica */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información Básica
            </h2>
            
            <div className="space-y-4">
              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la experiencia *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={cn(
                    "block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    errors.title
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  )}
                  placeholder="Ej: Mi primera experiencia AR"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateFormData({ slug: e.target.value })}
                  className={cn(
                    "block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    errors.slug
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  )}
                  placeholder="mi-primera-experiencia-ar"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={4}
                  className={cn(
                    "block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    errors.description
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  )}
                  placeholder="Describe qué verán los usuarios en esta experiencia AR..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>
          </section>

          {/* Assets */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Assets *
              </h2>
              <button
                type="button"
                onClick={addAsset}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                + Agregar Asset
              </button>
            </div>
            
            {/* Lista de assets */}
            {formData.assets.length > 0 && (
              <div className="space-y-4">
                {formData.assets.map((asset, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      {/* Nombre */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={asset.name || ''}
                          onChange={(e) => updateAsset(index, { name: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Nombre del asset"
                        />
                      </div>

                      {/* Tipo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <select
                          value={asset.type || ''}
                          onChange={(e) => updateAsset(index, { type: e.target.value as ARAssetType })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="text">Texto</option>
                          <option value="image">Imagen</option>
                          <option value="video">Video</option>
                          <option value="model3d">Modelo 3D</option>
                        </select>
                      </div>

                      {/* Acciones */}
                      <div className="flex justify-end items-end h-full">
                        <button
                          type="button"
                          onClick={() => removeAsset(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Contenido específico del tipo */}
                    <div className="mt-4">
                      {asset.type === 'text' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Texto
                          </label>
                          <textarea
                            value={asset.text || ''}
                            onChange={(e) => updateAsset(index, { text: e.target.value })}
                            rows={3}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Contenido del mensaje..."
                          />
                        </div>
                      )}

                      {asset.type && asset.type !== 'text' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL del archivo
                          </label>
                          <input
                            type="url"
                            value={asset.url || ''}
                            onChange={(e) => updateAsset(index, { url: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="https://ejemplo.com/archivo.jpg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.assets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay assets agregados. 
                <button
                  type="button"
                  onClick={addAsset}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  Agrega el primero
                </button>
              </div>
            )}

            {errors.assets && (
              <p className="mt-2 text-sm text-red-600">{errors.assets}</p>
            )}
          </section>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
          <Link
            href="/experiences"
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancelar
          </Link>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Limpiar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creando...' : 'Crear Experiencia'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}