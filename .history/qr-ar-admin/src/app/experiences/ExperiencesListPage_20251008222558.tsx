/**
 * ExperiencesListPage - Componente cliente para el listado de experiencias
 * Incluye filtros, búsqueda, ordenamiento y diferentes vistas
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ARExperience, ExperienceFilters, ViewMode, SortField, SortOrder } from '@/types'
import { ExperienceCube, ExperienceGrid } from '@/components/ExperienceCube'
import { 
  filterExperiences, 
  sortExperiences, 
  paginateExperiences 
} from '@/lib/experience-helpers'
import { cn, debounce } from '@/lib/utils'
import { UI_CONFIG } from '@/lib/config'

interface ExperiencesListPageProps {
  experiences: ARExperience[]
  searchParams: {
    search?: string
    filter?: string
    sort?: string
    view?: ViewMode
    page?: string
  }
}

/**
 * Componente de búsqueda
 */
function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Buscar experiencias..." 
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [localValue, setLocalValue] = useState(value)
  
  // Debounce para optimizar la búsqueda
  const debouncedOnChange = useMemo(
    () => debounce((searchValue: string) => {
      onChange(searchValue)
    }, UI_CONFIG.DEBOUNCE.SEARCH),
    [onChange]
  )

  useEffect(() => {
    debouncedOnChange(localValue)
  }, [localValue, debouncedOnChange])

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-400">🔍</span>
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('')
            onChange('')
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <span className="text-gray-400 hover:text-gray-600">✕</span>
        </button>
      )}
    </div>
  )
}

/**
 * Componente de filtros
 */
function FilterBar({
  activeFilter,
  onFilterChange,
  experiencesCount
}: {
  activeFilter: string
  onFilterChange: (filter: string) => void
  experiencesCount: { total: number; active: number; withAR: number }
}) {
  const filters = [
    { key: 'all', label: 'Todas', count: experiencesCount.total },
    { key: 'active', label: 'Activas', count: experiencesCount.active },
    { key: 'ar', label: 'Con AR', count: experiencesCount.withAR },
    { key: 'inactive', label: 'Inactivas', count: experiencesCount.total - experiencesCount.active }
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            activeFilter === filter.key
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {filter.label} ({filter.count})
        </button>
      ))}
    </div>
  )
}

/**
 * Componente de controles de vista
 */
function ViewControls({
  viewMode,
  sortField,
  sortOrder,
  onViewChange,
  onSortChange
}: {
  viewMode: ViewMode
  sortField: SortField
  sortOrder: SortOrder
  onViewChange: (view: ViewMode) => void
  onSortChange: (field: SortField, order: SortOrder) => void
}) {
  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      onSortChange(field, 'desc')
    }
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Selector de vista */}
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          onClick={() => onViewChange('grid')}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors",
            viewMode === 'grid'
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          )}
          title="Vista de rejilla"
        >
          ⊞
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors",
            viewMode === 'list'
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          )}
          title="Vista de lista"
        >
          ☰
        </button>
      </div>

      {/* Controles de ordenamiento */}
      <div className="flex space-x-2">
        <select
          value={`${sortField}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-') as [SortField, SortOrder]
            onSortChange(field, order)
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="createdAt-desc">Más recientes</option>
          <option value="createdAt-asc">Más antiguos</option>
          <option value="title-asc">A-Z</option>
          <option value="title-desc">Z-A</option>
          <option value="updatedAt-desc">Actualizados recientemente</option>
        </select>
      </div>
    </div>
  )
}

/**
 * Componente principal de la página
 */
export function ExperiencesListPage({
  experiences: initialExperiences,
  searchParams
}: ExperiencesListPageProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  
  // Estado local
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '')
  const [activeFilter, setActiveFilter] = useState(searchParams.filter || 'all')
  const [viewMode, setViewMode] = useState<ViewMode>(searchParams.view || 'grid')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.page || '1'))

  // Parsear ordenamiento desde searchParams
  useEffect(() => {
    if (searchParams.sort) {
      const [field, order] = searchParams.sort.split('-') as [SortField, SortOrder]
      setSortField(field)
      setSortOrder(order)
    }
  }, [searchParams.sort])

  // Actualizar URL cuando cambian los filtros
  const updateURL = useCallback((updates: Partial<typeof searchParams>) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(`/experiences${newUrl}`, { scroll: false })
  }, [router, urlSearchParams])

  // Aplicar filtros y búsqueda
  const filteredExperiences = useMemo(() => {
    const filters: ExperienceFilters = {
      searchTerm: searchTerm.trim() || undefined
    }

    // Aplicar filtros específicos
    switch (activeFilter) {
      case 'active':
        filters.isActive = true
        break
      case 'inactive':
        filters.isActive = false
        break
      case 'ar':
        filters.hasAR = true
        break
    }

    return filterExperiences(initialExperiences, filters)
  }, [initialExperiences, searchTerm, activeFilter])

  // Ordenar experiencias
  const sortedExperiences = useMemo(() => {
    return sortExperiences(filteredExperiences, sortField, sortOrder)
  }, [filteredExperiences, sortField, sortOrder])

  // Paginar resultados
  const paginatedResults = useMemo(() => {
    return paginateExperiences(sortedExperiences, currentPage, UI_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE)
  }, [sortedExperiences, currentPage])

  // Calcular estadísticas
  const stats = useMemo(() => ({
    total: initialExperiences.length,
    active: initialExperiences.filter(exp => exp.isActive).length,
    withAR: initialExperiences.filter(exp => exp.hasAR).length
  }), [initialExperiences])

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    updateURL({ search: value, page: undefined })
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    setCurrentPage(1)
    updateURL({ filter: filter === 'all' ? undefined : filter, page: undefined })
  }

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
    updateURL({ view: view === 'grid' ? undefined : view })
  }

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field)
    setSortOrder(order)
    setCurrentPage(1)
    updateURL({ sort: `${field}-${order}`, page: undefined })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL({ page: page === 1 ? undefined : page.toString() })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Experiencias AR
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona y explora tus experiencias de Realidad Aumentada
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href="/experiences/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <span className="mr-2">+</span>
                Nueva experiencia
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros y controles */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre, descripción..."
              />
            </div>

            {/* Controles de vista */}
            <div className="flex-shrink-0">
              <ViewControls
                viewMode={viewMode}
                sortField={sortField}
                sortOrder={sortOrder}
                onViewChange={handleViewChange}
                onSortChange={handleSortChange}
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="mt-4">
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              experiencesCount={stats}
            />
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="mb-6">
          <div className="text-sm text-gray-600">
            Mostrando {paginatedResults.items.length} de {paginatedResults.pagination.total} experiencias
          </div>
        </div>

        {/* Lista/Grid de experiencias */}
        {paginatedResults.items.length > 0 ? (
          <ExperienceGrid
            experiences={paginatedResults.items}
            variant={viewMode === 'list' ? 'list' : 'card'}
            columns={{ sm: 1, md: viewMode === 'list' ? 1 : 2, lg: viewMode === 'list' ? 1 : 3 }}
            showActions={true}
            showStats={true}
            showDescription={true}
            enableARPreview={true}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">
              {searchTerm ? '🔍' : '📦'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'No hay experiencias'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? `No hay experiencias que coincidan con "${searchTerm}"`
                : 'Comienza creando tu primera experiencia AR'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/experiences/create"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <span className="mr-2">+</span>
                Crear experiencia
              </Link>
            )}
          </div>
        )}

        {/* Paginación */}
        {paginatedResults.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              {/* Botón anterior */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!paginatedResults.pagination.hasPrevious}
                className={cn(
                  "px-3 py-2 rounded-lg font-medium transition-colors",
                  paginatedResults.pagination.hasPrevious
                    ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                ← Anterior
              </button>

              {/* Números de página */}
              {Array.from({ length: paginatedResults.pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === paginatedResults.pagination.totalPages ||
                  Math.abs(page - currentPage) <= 2
                )
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "px-3 py-2 rounded-lg font-medium transition-colors",
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {page}
                    </button>
                  </div>
                ))
              }

              {/* Botón siguiente */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!paginatedResults.pagination.hasNext}
                className={cn(
                  "px-3 py-2 rounded-lg font-medium transition-colors",
                  paginatedResults.pagination.hasNext
                    ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                Siguiente →
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  )
}