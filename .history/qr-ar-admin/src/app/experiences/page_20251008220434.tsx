"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ExperienceCube from "../../components/ar/ExperienceCube";
import { experiencesService } from "../../lib/api/experiences";
import {
  filterExperiences,
  getPrimaryAsset,
  sortExperiences,
} from "../../lib/helpers/experienceHelpers";
import { ARExperience } from "../../types";

type ViewMode = "grid" | "list";
type SortOption = "title" | "createdAt" | "updatedAt";

/**
 * Experiences Listing Page
 * Main page for browsing all available AR experiences
 */
export default function ExperiencesPage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<ARExperience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<
    ARExperience[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  useEffect(() => {
    loadExperiences();
  }, []);

  // Apply filters and sorting when data or filters change
  useEffect(() => {
    let filtered = filterExperiences(experiences, {
      searchTerm: searchTerm || undefined,
      isActive: filterActive ?? undefined,
    });

    filtered = sortExperiences(filtered, sortBy, sortOrder);
    setFilteredExperiences(filtered);
  }, [experiences, searchTerm, filterActive, sortBy, sortOrder]);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await experiencesService.getExperiences();
      setExperiences(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar experiencias";
      setError(errorMessage);
      console.error("Error loading experiences:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceClick = (experience: ARExperience) => {
    router.push(`/ar/${experience.id}`);
  };

  const handleViewExperience = (experience: ARExperience) => {
    router.push(`/experiences/${experience.id}`);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadExperiences}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Experiencias AR
              </h1>
              <p className="text-gray-600 mt-2">
                Explora {experiences.length} experiencias de realidad aumentada
              </p>
            </div>
            <Link
              href="/experiences/new"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Nueva Experiencia</span>
            </Link>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar experiencias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              {/* Active Filter */}
              <select
                value={
                  filterActive === null
                    ? "all"
                    : filterActive
                    ? "active"
                    : "inactive"
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterActive(value === "all" ? null : value === "active");
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Fecha creación</option>
                <option value="updatedAt">Última actualización</option>
                <option value="title">Título</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={`Ordenar ${
                  sortOrder === "asc" ? "descendente" : "ascendente"
                }`}
              >
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    sortOrder === "desc" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 9L12 5L16 9M8 15L12 19L16 15"
                  />
                </svg>
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Vista de grilla"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Vista de lista"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredExperiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21L16.506 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterActive !== null
                ? "No hay resultados"
                : "No hay experiencias"}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterActive !== null
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza creando tu primera experiencia AR"}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredExperiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    onViewAR={() => handleExperienceClick(experience)}
                    onViewDetails={() => handleViewExperience(experience)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExperiences.map((experience) => (
                  <ExperienceListItem
                    key={experience.id}
                    experience={experience}
                    onViewAR={() => handleExperienceClick(experience)}
                    onViewDetails={() => handleViewExperience(experience)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Experience Card Component for Grid View
function ExperienceCard({
  experience,
  onViewAR,
  onViewDetails,
}: {
  experience: ARExperience;
  onViewAR: () => void;
  onViewDetails: () => void;
}) {
  const primaryAsset = getPrimaryAsset(experience);

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {/* Preview */}
      <div className="p-4">
        <div className="flex justify-center mb-4">
          <ExperienceCube
            experience={experience}
            size={200}
            displayMode="single"
            enableInteraction={false}
            className="cursor-pointer"
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
              {experience.title}
            </h3>
            <div
              className={`
              ml-2 px-2 py-1 text-xs font-medium rounded-full
              ${
                experience.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }
            `}
            >
              {experience.isActive ? "Activa" : "Inactiva"}
            </div>
          </div>

          {experience.description && (
            <p className="text-gray-600 text-xs mb-3 line-clamp-2">
              {experience.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span>{experience.assets.length} assets</span>
            <span>{experience.createdAt.toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={onViewAR}
              className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
            >
              Ver en AR
            </button>
            <button
              onClick={onViewDetails}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors"
              title="Ver detalles"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Experience List Item Component for List View
function ExperienceListItem({
  experience,
  onViewAR,
  onViewDetails,
}: {
  experience: ARExperience;
  onViewAR: () => void;
  onViewDetails: () => void;
}) {
  const primaryAsset = getPrimaryAsset(experience);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Preview */}
        <div className="flex-shrink-0">
          <ExperienceCube
            experience={experience}
            size={80}
            displayMode="single"
            enableInteraction={false}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {experience.title}
            </h3>
            <div
              className={`
              ml-2 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap
              ${
                experience.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }
            `}
            >
              {experience.isActive ? "Activa" : "Inactiva"}
            </div>
          </div>

          {experience.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-1">
              {experience.description}
            </p>
          )}

          <div className="flex items-center text-xs text-gray-500 space-x-4 mb-3">
            <span>{experience.assets.length} assets</span>
            {primaryAsset && (
              <span className="capitalize">{primaryAsset.assetType}</span>
            )}
            <span>Creada {experience.createdAt.toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={onViewAR}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
            >
              Ver en AR
            </button>
            <button
              onClick={onViewDetails}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors"
            >
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
