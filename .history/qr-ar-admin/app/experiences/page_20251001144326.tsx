"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Calendar,
  Package,
  Sparkles,
  Grid,
  List,
  SortAsc,
  SortDesc
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { AnimatedCard, AnimatedCardGrid } from "@/components/ui/animated-card";
import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { StatusBadge, ToggleStatus } from "@/components/ui/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api";
import { formatDate, truncateText } from "@/lib/utils";
import { ExperienceDto } from "@/types";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getExperiences();

      if (response.success && response.data) {
        setExperiences(response.data);
      } else {
        setError(response.message || "Error al cargar las experiencias");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedExperiences = useMemo(() => {
    let filtered = experiences;

    // Apply search filter
    if (searchValue) {
      filtered = filtered.filter(exp => 
        exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
        exp.slug.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Apply status filter
    if (filterActive !== null) {
      filtered = filtered.filter(exp => exp.isActive === filterActive);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ExperienceDto];
      let bValue: any = b[sortBy as keyof ExperienceDto];

      if (sortBy === "assets") {
        aValue = a.assets.length;
        bValue = b.assets.length;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [experiences, searchValue, sortBy, sortOrder, filterActive]);

  const handleToggleActive = async (id: string) => {
    try {
      const response = await apiClient.toggleExperienceActive(id);
      if (response.success) {
        setExperiences(prev => 
          prev.map(exp => 
            exp.id === id ? { ...exp, isActive: !exp.isActive } : exp
          )
        );
      } else {
        setError(response.message || "Error al cambiar el estado");
      }
    } catch (err) {
      setError("Error al cambiar el estado de la experiencia");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la experiencia "${title}"?`)) {
      return;
    }

    try {
      const response = await apiClient.deleteExperience(id);
      if (response.success) {
        setExperiences(prev => prev.filter(exp => exp.id !== id));
      } else {
        setError(response.message || "Error al eliminar la experiencia");
      }
    } catch (err) {
      setError("Error al eliminar la experiencia");
    }
  };

  const filters = [
    {
      key: "active",
      label: "Activas",
      active: filterActive === true,
      count: experiences.filter(e => e.isActive).length,
    },
    {
      key: "inactive", 
      label: "Inactivas",
      active: filterActive === false,
      count: experiences.filter(e => !e.isActive).length,
    },
  ];

  const handleFilterToggle = (key: string) => {
    if (key === "active") {
      setFilterActive(filterActive === true ? null : true);
    } else if (key === "inactive") {
      setFilterActive(filterActive === false ? null : false);
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-[400px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader size="lg" />
          </motion.div>
          <p className="text-gray-400">Cargando experiencias...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <PageHeader
          title="Experiencias AR"
          description="Gestiona tus experiencias de realidad aumentada"
          action={
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-slate-700/50 rounded-lg p-1 bg-slate-800/30">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <AnimatedButton
                icon={<Plus className="w-4 h-4" />}
                pulse
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/experiences/new">
                  Nueva Experiencia
                </Link>
              </AnimatedButton>
            </div>
          }
        />
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={setSortBy}
          filters={filters}
          onFilterToggle={handleFilterToggle}
          placeholder="Buscar experiencias..."
        />
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Results Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            {filteredAndSortedExperiences.length} de {experiences.length} experiencias
          </span>
          <span>
            Ordenar por {sortBy === "createdAt" ? "fecha de creación" : sortBy} 
            {sortOrder === "desc" ? " (descendente)" : " (ascendente)"}
          </span>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {filteredAndSortedExperiences.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-dashed border-slate-600">
              <CardContent className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="text-8xl mb-6"
                >
                  ✨
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-semibold text-white mb-3"
                >
                  {searchValue || filterActive !== null ? "No se encontraron experiencias" : "No hay experiencias aún"}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-blue-200 mb-8 max-w-md mx-auto"
                >
                  {searchValue || filterActive !== null 
                    ? "Intenta ajustar tus filtros de búsqueda"
                    : "Crea tu primera experiencia AR para comenzar a transformar la realidad"
                  }
                </motion.p>
                {!searchValue && filterActive === null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link href="/experiences/new">
                      <AnimatedButton
                        icon={<Sparkles className="w-5 h-5" />}
                        pulse
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3"
                      >
                        Crear Primera Experiencia
                      </AnimatedButton>
                    </Link>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="experiences-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {viewMode === "grid" ? (
              <AnimatedCardGrid 
                className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                stagger
              >
                {filteredAndSortedExperiences.map((experience, index) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    index={index}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatedCardGrid>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedExperiences.map((experience, index) => (
                  <ExperienceListItem
                    key={experience.id}
                    experience={experience}
                    index={index}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <FloatingActionButton>
        <Link href="/experiences/new">
          <Plus className="w-6 h-6" />
        </Link>
      </FloatingActionButton>
    </motion.div>
  );
}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {experiences.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay experiencias aún
            </h3>
            <p className="text-blue-200 mb-6">
              Crea tu primera experiencia AR para comenzar
            </p>
            <Link href="/experiences/new">
              <Button>Crear Primera Experiencia</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <Card
              key={experience.id}
              className="group hover:scale-105 transition-transform"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {experience.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      /{experience.slug}
                    </CardDescription>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      experience.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {experience.isActive ? "Activa" : "Inactiva"}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {experience.description && (
                  <p className="text-blue-200 text-sm mb-4">
                    {truncateText(experience.description, 100)}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-blue-200">
                    <span className="mr-2">📦</span>
                    {experience.assets.length} asset
                    {experience.assets.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center text-sm text-blue-200">
                    <span className="mr-2">📅</span>
                    {formatDate(experience.createdAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/experiences/${experience.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Ver
                    </Button>
                  </Link>

                  <Link href={`/experiences/${experience.id}/edit`}>
                    <Button variant="outline" size="sm">
                      ✏️
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(experience.id)}
                  >
                    {experience.isActive ? "⏸️" : "▶️"}
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDelete(experience.id, experience.title)
                    }
                  >
                    🗑️
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
