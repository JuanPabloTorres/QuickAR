"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Grid, List, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ExperienceCard,
  ExperienceListItem,
} from "@/components/experience-components";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AnimatedButton,
  FloatingActionButton,
} from "@/components/ui/animated-button";
import { AnimatedCardGrid } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { apiClient } from "@/lib/api";
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
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
          exp.slug.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Apply status filter
    if (filterActive !== null) {
      filtered = filtered.filter((exp) => exp.isActive === filterActive);
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
        setExperiences((prev) =>
          prev.map((exp) =>
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
    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar la experiencia "${title}"?`
      )
    ) {
      return;
    }

    try {
      const response = await apiClient.deleteExperience(id);
      if (response.success) {
        setExperiences((prev) => prev.filter((exp) => exp.id !== id));
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
      count: experiences.filter((e) => e.isActive).length,
    },
    {
      key: "inactive",
      label: "Inactivas",
      active: filterActive === false,
      count: experiences.filter((e) => !e.isActive).length,
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
                <Link href="/experiences/new">Nueva Experiencia</Link>
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
            {filteredAndSortedExperiences.length} de {experiences.length}{" "}
            experiencias
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
                  {searchValue || filterActive !== null
                    ? "No se encontraron experiencias"
                    : "No hay experiencias aún"}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-blue-200 mb-8 max-w-md mx-auto"
                >
                  {searchValue || filterActive !== null
                    ? "Intenta ajustar tus filtros de búsqueda"
                    : "Crea tu primera experiencia AR para comenzar a transformar la realidad"}
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
