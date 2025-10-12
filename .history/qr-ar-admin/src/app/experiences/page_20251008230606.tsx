/**
 * Página Experiences - /experiences
 * Listado principal de experiencias AR con filtros y búsqueda
 */

import { apiClient } from "@/lib/api/client";
import { Metadata } from "next";
import { Suspense } from "react";
import { ExperiencesListPage } from "./ExperiencesListPage";

export const metadata: Metadata = {
  title: "Experiencias AR - Quick AR Platform",
  description:
    "Explora y gestiona todas las experiencias de Realidad Aumentada disponibles",
  keywords: ["AR", "Realidad Aumentada", "Experiencias", "Gestión", "3D"],
  openGraph: {
    title: "Experiencias AR - Quick AR",
    description: "Gestiona y explora experiencias de Realidad Aumentada",
    type: "website",
    images: [
      {
        url: "/images/experiences-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Experiencias AR",
      },
    ],
  },
};

interface SearchParams {
  search?: string;
  filter?: string;
  sort?: string;
  view?: "grid" | "list";
  page?: string;
}

interface Props {
  searchParams: SearchParams;
}

/**
 * Loading component para la página
 */
function ExperiencesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Filters skeleton */}
        <div className="flex space-x-4 mb-6">
          <div className="h-10 bg-gray-200 rounded w-64"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border shadow-sm p-6">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Página principal de experiencias
 */
export default async function ExperiencesPage({ searchParams }: Props) {
  try {
    // Obtener experiencias del servidor
    const experiences = await apiClient.getExperiences();

    return (
      <Suspense fallback={<ExperiencesLoading />}>
        <ExperiencesListPage
          experiences={experiences}
          searchParams={searchParams}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error loading experiences:", error);

    // Página de error
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl text-red-300 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error al cargar experiencias
          </h1>
          <p className="text-gray-600 mb-6">
            No se pudieron cargar las experiencias AR. Por favor, intenta de
            nuevo.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }
}
