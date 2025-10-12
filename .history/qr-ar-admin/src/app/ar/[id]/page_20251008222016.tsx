/**
 * Página AR - /ar/[id]
 * Página principal para visualizar experiencias AR
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ARExperiencePage } from './ARExperiencePage'
import { apiClient } from '@/lib/api/client'

interface Props {
  params: {
    id: string
  }
  searchParams: {
    asset?: string
    mode?: 'ar' | 'preview'
  }
}

/**
 * Genera metadatos dinámicos para la página AR
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const experience = await apiClient.getExperience(params.id)
    
    return {
      title: `${experience.title} - AR Experience`,
      description: experience.description || 'Experiencia de Realidad Aumentada interactiva',
      keywords: ['AR', 'Realidad Aumentada', '3D', experience.title],
      openGraph: {
        title: `${experience.title} - AR`,
        description: experience.description || 'Experiencia de Realidad Aumentada',
        type: 'website',
        images: [
          {
            url: experience.qrCodeUrl || '/images/ar-preview.jpg',
            width: 1200,
            height: 630,
            alt: experience.title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${experience.title} - AR`,
        description: experience.description || 'Experiencia AR',
        images: [experience.qrCodeUrl || '/images/ar-preview.jpg']
      },
      other: {
        'ar-supported': 'true',
        'mobile-web-app-capable': 'yes'
      }
    }
  } catch {
    return {
      title: 'Experiencia AR',
      description: 'Experiencia de Realidad Aumentada'
    }
  }
}

/**
 * Página principal AR
 */
export default async function ARPage({ params, searchParams }: Props) {
  try {
    // Obtener la experiencia
    const experience = await apiClient.getExperience(params.id)
    
    if (!experience) {
      notFound()
    }

    // Validar que la experiencia esté activa
    if (!experience.isActive) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="text-6xl text-gray-300 mb-4">⏸️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Experiencia no disponible
            </h1>
            <p className="text-gray-600 mb-6">
              Esta experiencia AR está temporalmente desactivada
            </p>
            <a
              href="/experiences"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Ver otras experiencias
            </a>
          </div>
        </div>
      )
    }

    // Validar que tenga assets AR
    const arAssets = experience.assets.filter(asset => asset.type === 'model3d')
    if (arAssets.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="text-6xl text-gray-300 mb-4">📦</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sin contenido AR
            </h1>
            <p className="text-gray-600 mb-6">
              Esta experiencia no tiene modelos 3D para mostrar en AR
            </p>
            <a
              href={`/experiences/${experience.id}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Ver detalles de la experiencia
            </a>
          </div>
        </div>
      )
    }

    return (
      <ARExperiencePage
        experience={experience}
        selectedAssetId={searchParams.asset}
        mode={searchParams.mode || 'ar'}
      />
    )
    
  } catch (error) {
    console.error('Error loading AR experience:', error)
    notFound()
  }
}