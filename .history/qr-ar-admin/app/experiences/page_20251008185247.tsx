"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ExternalLink,
  Grid,
  List,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ExperienceCard,
  ExperienceListItem,
} from "@/components/experience-components";
import { ExperienceCube } from "@/components/ExperienceCube";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FloatingActionButton } from "@/components/ui/animated-button";
import { AnimatedCardGrid } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchFilterBar } from "@/components/ui/search-filter-bar";
import { apiClient } from "@/lib/api";
import { mapExperienceToExperienceCube } from "@/lib/experience-cube-mapper";
import { ExperienceDto } from "@/types";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "ar">("grid");
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

    if (searchValue) {
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
          exp.slug.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (filterActive !== null) {
      filtered = filtered.filter((exp) => exp.isActive === filterActive);
    }

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

  // Stats calculations
  const stats = {
    total: experiences.length,
    active: experiences.filter((e) => e.isActive).length,
    inactive: experiences.filter((e) => !e.isActive).length,
  };

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-[500px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-6">
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-20 h-20 border-4 border-[#3DD8B6] border-t-transparent rounded-full"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#3DD8B6] animate-pulse" />
          </motion.div>
          <p className="text-gray-400 text-lg font-medium">
            Cargando experiencias AR...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with gradient background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative p-8 rounded-2xl bg-gradient-to-br from-[#0F1C2E] via-[#1a2942] to-[#0F1C2E] overflow-hidden border border-[#3DD8B6]/20"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #3DD8B6 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3DD8B6]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4FF]/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                Experiencias AR
                <span className="text-2xl">✨</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Gestiona tus experiencias de realidad aumentada
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center border-2 border-[#1a2942] rounded-xl p-1 bg-[#0F1C2E]/50 backdrop-blur-sm w-full sm:w-auto justify-center">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`px-4 transition-all ${
                    viewMode === "grid"
                      ? "bg-[#3DD8B6] text-[#0F1C2E] hover:bg-[#3DD8B6]"
                      : "text-gray-400 hover:text-white hover:bg-[#1a2942]"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`px-4 transition-all ${
                    viewMode === "list"
                      ? "bg-[#3DD8B6] text-[#0F1C2E] hover:bg-[#3DD8B6]"
                      : "text-gray-400 hover:text-white hover:bg-[#1a2942]"
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "ar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("ar")}
                  className={`px-4 transition-all ${
                    viewMode === "ar"
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                      : "text-gray-400 hover:text-white hover:bg-[#1a2942]"
                  }`}
                  title="Vista AR"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>

              <Link href="/experiences/new" className="w-full sm:w-auto">
                <Button className="w-full bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] hover:from-[#3DD8B6]/90 hover:to-[#00D4FF]/90 text-[#0F1C2E] font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#3DD8B6]/30">
                  <Plus className="w-5 h-5 mr-2" />
                  Nueva Experiencia
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/50 backdrop-blur-sm hover:border-[#3DD8B6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3DD8B6]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Total Experiencias
                </p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-[#3DD8B6]/20 rounded-xl">
                <Activity className="w-6 h-6 text-[#3DD8B6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/50 backdrop-blur-sm hover:border-[#3DD8B6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#3DD8B6]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Activas
                </p>
                <p className="text-3xl font-bold text-[#3DD8B6]">
                  {stats.active}
                </p>
              </div>
              <div className="p-3 bg-[#3DD8B6]/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-[#3DD8B6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#1a2942] bg-[#0F1C2E]/50 backdrop-blur-sm hover:border-[#00D4FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00D4FF]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">
                  Inactivas
                </p>
                <p className="text-3xl font-bold text-gray-400">
                  {stats.inactive}
                </p>
              </div>
              <div className="p-3 bg-gray-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={setSortBy}
          filters={filters}
          onFilterToggle={handleFilterToggle}
          placeholder="Buscar por título, descripción o slug..."
        />
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert className="border-2 border-red-500/30 bg-red-950/20">
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Results Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex items-center justify-between px-1"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-[#3DD8B6]" />
          <span className="text-sm text-gray-400">
            <span className="text-white font-semibold">
              {filteredAndSortedExperiences.length}
            </span>{" "}
            de{" "}
            <span className="text-white font-semibold">
              {experiences.length}
            </span>{" "}
            experiencias
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {sortBy === "createdAt" ? "Fecha" : sortBy}{" "}
          {sortOrder === "desc" ? "↓" : "↑"}
        </span>
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
            <Card className="border-2 border-dashed border-[#1a2942] bg-[#0F1C2E]/30 backdrop-blur-sm">
              <CardContent className="text-center py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="relative inline-block">
                    <div className="text-8xl">✨</div>
                    <div className="absolute inset-0 bg-[#3DD8B6]/20 blur-3xl"></div>
                  </div>
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-3"
                >
                  {searchValue || filterActive !== null
                    ? "No se encontraron experiencias"
                    : "No hay experiencias aún"}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 mb-8 max-w-md mx-auto text-lg"
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
                      <Button className="bg-gradient-to-r from-[#3DD8B6] to-[#00D4FF] hover:from-[#3DD8B6]/90 hover:to-[#00D4FF]/90 text-[#0F1C2E] font-bold text-lg px-8 py-6 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#3DD8B6]/30">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Crear Primera Experiencia
                      </Button>
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
                className="grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
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
            ) : viewMode === "list" ? (
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
            ) : viewMode === "ar" ? (
              <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-gray-900/20 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                    Vista AR de Experiencias
                  </h2>
                  <p className="text-gray-300">
                    Explora las experiencias con cubos AR interactivos. Cada
                    cubo muestra el primer asset de la experiencia.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 perspective-container">
                  {filteredAndSortedExperiences.map((experience, index) => (
                    <div
                      key={experience.id}
                      className="flex flex-col items-center space-y-4 preserve-3d-container"
                    >
                      <ExperienceCube
                        {...mapExperienceToExperienceCube(experience, {
                          size: 250,
                          enableAR: true,
                          className: "mx-auto"
                        })}
                      />

                        {/* Experience Info Card */}
                        <div className="w-full max-w-xs bg-[#1a2942]/50 rounded-xl p-4 border border-purple-500/20 backdrop-blur-sm">
                          <div className="text-center">
                            <Link
                              href={`/experiences/${experience.id}`}
                              className="block hover:text-purple-300 transition-colors"
                            >
                              <h3 className="font-semibold text-white text-sm mb-2 truncate">
                                {experience.title}
                              </h3>
                            </Link>

                            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                              <span className="flex items-center gap-1">
                                📦 {experience.assets.length} assets
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  experience.isActive
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {experience.isActive ? "Activa" : "Inactiva"}
                              </span>
                            </div>

                            <Link
                              href={`/x/${experience.slug}`}
                              target="_blank"
                              className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center gap-1"
                            >
                              Ver experiencia
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {filteredAndSortedExperiences.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🥽</div>
                    <p className="text-gray-400 text-xl font-medium mb-2">
                      No hay experiencias AR para mostrar
                    </p>
                    <p className="text-gray-500 text-sm">
                      Crea tu primera experiencia para verla en AR
                    </p>
                  </div>
                )}
              </div>
            ) : null}
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
