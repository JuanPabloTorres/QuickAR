/**
 * Página de creación de nuevas experiencias AR
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import { ExperienceCreateForm } from '../ExperienceCreateForm'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Crear Nueva Experiencia - Quick AR',
  description: 'Crea una nueva experiencia de Realidad Aumentada',
  robots: 'noindex, nofollow'
}

/**
 * Componente de loading para la página
 */
function CreatePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          </div>

          {/* Form skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="space-y-6">
              {/* Form fields skeleton */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-100 rounded w-full"></div>
                </div>
              ))}
              
              {/* Buttons skeleton */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <div className="h-10 bg-gray-200 rounded w-20"></div>
                <div className="h-10 bg-blue-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Página principal de creación de experiencias
 */
export default function CreateExperiencePage() {
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Crear Nueva Experiencia
              </h1>
              <p className="text-gray-600">
                Configura una nueva experiencia de Realidad Aumentada para tus usuarios
              </p>
            </header>

            {/* Formulario */}
            <Suspense fallback={<CreatePageSkeleton />}>
              <ExperienceCreateForm />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}