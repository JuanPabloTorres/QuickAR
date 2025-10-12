/**
 * ExperienceCreateForm - Formulario para crear nuevas experiencias AR
 * Incluye validación, preview, manejo de archivos y guardado
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ExperienceCreateDto, ARAssetType, AssetCreateDto, AssetKind, AR_TYPE_TO_ASSET_KIND } from '@/types'
import { ApiClient } from '@/lib/api/client'
import { cn } from '@/lib/utils'

interface AssetFormData {
  name: string
  type: ARAssetType
  url?: string
  mimeType?: string
  fileSizeBytes?: number
  text?: string
}

interface FormData {
  title: string
  description: string
  slug: string
  isActive: boolean
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
    isActive: true,
    assets: []
  })

  // Estado de validación y UI
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Referencias
  const formRef = useRef<HTMLFormElement>(null)

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
      newErrors.assets = 'Debe agregar al menos un asset para la experiencia AR'
    } else {
      const invalidAssets = formData.assets.filter(asset => 
        !asset.name || !asset.type || !asset.url
      )
      
      if (invalidAssets.length > 0) {
        newErrors.assets = 'Todos los assets deben tener nombre, tipo y archivo'
      }
    }

    return newErrors
  }, [formData])

  /**
   * Maneja la subida de archivos para assets
   */
  const handleAssetUpload = useCallback(async (
    files: File[],
    assetIndex?: number
  ) => {
    setIsLoading(true)
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await apiClient.uploadFile(formData)
        
        // Determinar tipo de asset basado en el archivo
        let assetType: AssetType = 'model'
        if (file.type.startsWith('image/')) {
          assetType = 'image'
        } else if (file.type.startsWith('video/')) {
          assetType = 'video'
        } else if (file.type.startsWith('audio/')) {
          assetType = 'audio'
        }

        return {
          name: file.name.replace(/\.[^/.]+$/, ""), // Remover extensión
          type: assetType,
          url: response.url,
          fileSize: file.size,
          mimeType: file.type
        } as Partial<ARAsset>
      })

      const newAssets = await Promise.all(uploadPromises)
      
      if (assetIndex !== undefined) {
        // Reemplazar asset específico
        setFormData(prev => ({
          ...prev,
          assets: prev.assets.map((asset, index) => 
            index === assetIndex ? { ...asset, ...newAssets[0] } : asset
          )
        }))
      } else {
        // Agregar nuevos assets
        setFormData(prev => ({
          ...prev,
          assets: [...prev.assets, ...newAssets]
        }))
      }

      // Limpiar error de assets
      if (errors.assets) {
        setErrors(prev => ({ ...prev, assets: undefined }))
      }
    } catch (error) {
      console.error('Error uploading assets:', error)
      setErrors(prev => ({
        ...prev,
        general: 'Error al subir los archivos. Inténtalo de nuevo.'
      }))
    } finally {
      setIsLoading(false)
    }
  }, [apiClient, errors.assets])

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
  const updateAsset = useCallback((index: number, updates: Partial<ARAsset>) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === index ? { ...asset, ...updates } : asset
      )
    }))
  }, [])

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulario
    const validationErrors = validateForm()
    setErrors(validationErrors)
    
    if (Object.keys(validationErrors).length > 0) {
      // Hacer scroll al primer error
      const firstErrorElement = formRef.current?.querySelector('[data-error="true"]')
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsLoading(true)

    try {
      // Preparar datos para la API
      const experienceData: CreateExperienceRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        qrCodeId: formData.qrCodeId.trim(),
        isActive: formData.isActive,
        assets: formData.assets.map(asset => ({
          name: asset.name!,
          type: asset.type!,
          url: asset.url!,
          position: asset.position || { x: 0, y: 0, z: 0 },
          rotation: asset.rotation || { x: 0, y: 0, z: 0 },
          scale: asset.scale || { x: 1, y: 1, z: 1 },
          isVisible: asset.isVisible ?? true,
          fileSize: asset.fileSize || 0,
          mimeType: asset.mimeType || 'application/octet-stream'
        }))
      }

      // Crear experiencia
      const newExperience = await apiClient.createExperience(experienceData)
      
      // Redirigir a la experiencia creada
      router.push(`/experiences/${newExperience.id}`)
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
      qrCodeId: '',
      isActive: true,
      assets: []
    })
    setErrors({})
    setIsPreviewMode(false)
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <form ref={formRef} onSubmit={handleSubmit} className="p-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la experiencia *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  className={cn(
                    "block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    errors.title
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  )}
                  placeholder="Ej: Mi primera experiencia AR"
                  data-error={!!errors.title}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* QR Code ID */}
              <div>
                <label htmlFor="qrCodeId" className="block text-sm font-medium text-gray-700 mb-2">
                  ID del código QR *
                </label>
                <input
                  type="text"
                  id="qrCodeId"
                  value={formData.qrCodeId}
                  onChange={(e) => updateFormData({ qrCodeId: e.target.value })}
                  className={cn(
                    "block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    errors.qrCodeId
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  )}
                  placeholder="qr-code-001"
                  data-error={!!errors.qrCodeId}
                />
                {errors.qrCodeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.qrCodeId}</p>
                )}
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => updateFormData({ isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Experiencia activa
                  </label>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-6">
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
                data-error={!!errors.description}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </section>

          {/* Assets */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assets AR *
            </h2>
            
            {/* Upload de assets */}
            <div className="mb-6">
              <FileUpload
                onFilesSelected={handleAssetUpload}
                accept=".glb,.gltf,.obj,.fbx,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mp3,.wav"
                multiple
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {/* Lista de assets */}
            {formData.assets.length > 0 && (
              <div className="space-y-4">
                {formData.assets.map((asset, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
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
                          onChange={(e) => updateAsset(index, { type: e.target.value as AssetType })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="model">Modelo 3D</option>
                          <option value="image">Imagen</option>
                          <option value="video">Video</option>
                          <option value="audio">Audio</option>
                        </select>
                      </div>

                      {/* URL/Archivo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Archivo
                        </label>
                        <div className="text-sm text-gray-600 truncate">
                          {asset.url ? (
                            <span>✓ Archivo subido</span>
                          ) : (
                            <span className="text-red-500">Sin archivo</span>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => removeAsset(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.assets && (
              <p className="mt-2 text-sm text-red-600" data-error="true">{errors.assets}</p>
            )}
          </section>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creando...' : 'Crear Experiencia'}
          </button>
        </div>
      </form>
    </div>
  )
}