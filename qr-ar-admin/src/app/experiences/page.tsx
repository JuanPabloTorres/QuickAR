"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  EasterEggProvider,
  FunFact,
  MotivationalQuote,
} from "@/components/ui/easter-eggs";
import { FilterIcons, FilterSelect } from "@/components/ui/filter-select";
import {
  AchievementNotification,
  FloatingDecoration,
} from "@/components/ui/floating-particles";
import { LoadingModal } from "@/components/ui/loading-modal";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { deleteExperience, getAllExperiences } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Experience } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [deletingExperienceId, setDeletingExperienceId] = useState<
    string | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setIsLoading(true);
        const response = await getAllExperiences();

        if (response.success && response.data) {
          const normalizedExperiences = response.data.map(normalizeExperience);
          setExperiences(normalizedExperiences);

          // Entertainment: Achievement for having many experiences
          if (normalizedExperiences.length >= 5) {
            setNewAchievement({
              title: "🏆 Creador Prolífico",
              description: `¡Tienes ${normalizedExperiences.length} experiencias! Eres todo un artista AR`,
            });
            setShowAchievement(true);
          } else if (normalizedExperiences.length >= 3) {
            setNewAchievement({
              title: "🌟 En Camino",
              description:
                "¡3 experiencias ya! Vas por buen camino hacia la maestría AR",
            });
            setShowAchievement(true);
          }
        } else {
          setError(response.message || "Error cargando experiencias");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        setIsLoading(false);
      }
    };

    loadExperiences();
  }, []);

  const showDeleteModal = (experienceId: string, experienceTitle: string) => {
    setExperienceToDelete({ id: experienceId, title: experienceTitle });
    setShowDeleteConfirm(true);
  };

  const handleDeleteExperience = async () => {
    if (!experienceToDelete) return;

    setDeletingExperienceId(experienceToDelete.id);

    try {
      console.log("🗑️ Eliminando experiencia:", experienceToDelete.id);
      const response = await deleteExperience(experienceToDelete.id);

      if (response.success) {
        console.log("✅ Experiencia eliminada exitosamente");

        // Actualizar la lista eliminando la experiencia del estado local
        setExperiences((prevExperiences) =>
          prevExperiences.filter((exp) => exp.id !== experienceToDelete.id)
        );

        // Mostrar notificación de éxito
        setNewAchievement({
          title: "🗑️ Experiencia Eliminada",
          description: `"${experienceToDelete.title}" ha sido eliminada correctamente`,
        });
        setShowAchievement(true);

        // Cerrar modal
        setShowDeleteConfirm(false);
        setExperienceToDelete(null);
      } else {
        console.error("❌ Error eliminando experiencia:", response.message);
        alert(`Error eliminando la experiencia: ${response.message}`);
      }
    } catch (error) {
      console.error("❌ Error inesperado eliminando experiencia:", error);
      alert("Error inesperado eliminando la experiencia. Intenta de nuevo.");
    } finally {
      setDeletingExperienceId(null);
    }
  };

  const handleNavigateToAR = (experienceSlugOrId: string) => {
    setNavigatingTo(`ar-${experienceSlugOrId}`);
    // El router de Next.js navegará automáticamente
    setTimeout(() => setNavigatingTo(null), 3000); // Fallback timeout
  };

  const handleNavigateToEdit = (experienceId: string) => {
    setNavigatingTo(`edit-${experienceId}`);
    setTimeout(() => setNavigatingTo(null), 3000);
  };

  const handleNavigateToDetails = (experienceId: string) => {
    setNavigatingTo(`details-${experienceId}`);
    setTimeout(() => setNavigatingTo(null), 3000);
  };

  const getLoadingConfig = () => {
    if (!navigatingTo) return { message: "", submessage: "" };

    if (navigatingTo.startsWith("ar-")) {
      return {
        message: "Cargando Experiencia AR",
        submessage: "Preparando la realidad aumentada...",
      };
    }

    if (navigatingTo.startsWith("edit-")) {
      return {
        message: "Abriendo Editor",
        submessage: "Cargando datos de la experiencia...",
      };
    }

    if (navigatingTo.startsWith("details-")) {
      return {
        message: "Cargando Detalles",
        submessage: "Obteniendo información completa...",
      };
    }

    return { message: "Cargando", submessage: "Por favor espera..." };
  };

  const filteredExperiences = experiences
    .filter((exp) => {
      // Text search filter
      const matchesSearch =
        searchTerm === "" ||
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter (based on assetType or a category field if it exists)
      const matchesCategory =
        categoryFilter === "" ||
        (exp.assets &&
          exp.assets.length > 0 &&
          exp.assets[0].assetType === categoryFilter) ||
        exp.title.toLowerCase().includes(categoryFilter.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "" ||
        (statusFilter === "active" && exp.isActive) ||
        (statusFilter === "draft" && !exp.isActive) ||
        (statusFilter === "archived" && exp.isActive === false);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <FloatingDecoration />
          <div className="text-center py-24">
            <div className="relative inline-block mb-8">
              <QuickArLogo
                size={80}
                className="animate-pulse"
                animated={true}
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-bold font-orbitron text-white animate-pulse flex items-center justify-center gap-3">
                <svg
                  className="w-8 h-8 text-sky-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    clipRule="evenodd"
                  />
                </svg>
                Preparando tus experiencias AR
              </div>
              <div className="text-sky-200 text-lg font-manrope animate-pulse flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6 text-sky-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Cargando contenido increíble...
              </div>
              {/* Loading skeleton cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 animate-pulse"
                  >
                    <div className="h-6 bg-white/10 rounded mb-4"></div>
                    <div className="h-4 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <FloatingDecoration />
          <div className="text-center py-24">
            <div className="relative inline-block mb-8">
              <div className="text-8xl animate-bounce">❌</div>
              <div className="absolute -inset-8 bg-gradient-to-r from-red-400 via-orange-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>
            <div className="max-w-md mx-auto space-y-6">
              <h2 className="text-3xl font-bold font-orbitron text-white mb-4">
                Algo salió mal
              </h2>
              <p className="text-sky-200 text-lg font-manrope mb-8">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  size="lg"
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reintentar
                </Button>
                <Link href="/">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/20 hover:border-white/40"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Volver al Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <FloatingDecoration />
      <EasterEggProvider
        onActivate={() => {
          setNewAchievement({
            title: "🎮 Creative Hacker",
            description: "¡Código desbloqueado en el taller creativo!",
          });
          setShowAchievement(true);
        }}
      />
      <MotivationalQuote />
      <FunFact experiences={experiences} />
      <AchievementNotification
        achievement={newAchievement || undefined}
        show={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-orbitron text-white bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent">
              Experiencias AR
            </h1>
            <p className="text-white/70 text-lg font-manrope">
              Gestiona tus experiencias de realidad aumentada
            </p>
          </div>

          <Link href="/experiences/create">
            <Button
              size="lg"
              className="group relative bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600 hover:from-sky-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

              {/* Plus icon with rotation animation */}
              <svg
                className="w-6 h-6 mr-2 inline-block group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>

              {/* Text with relative positioning */}
              <span className="relative font-orbitron text-lg tracking-wide">
                Nueva Experiencia
              </span>

              {/* Sparkle effect */}
              <svg
                className="w-5 h-5 ml-2 inline-block text-yellow-300 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </Button>
          </Link>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar experiencias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-lg focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all duration-200"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/60 bg-white/10 px-3 py-2 rounded-lg">
              <span className="font-medium">{filteredExperiences.length}</span>
              <span>
                experiencia{filteredExperiences.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 ${
                viewMode === "grid"
                  ? "bg-sky-500 text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 ${
                viewMode === "list"
                  ? "bg-sky-500 text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {/* Category Filter */}
          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: "", label: "Todas las categorías" },
              { value: "image", label: "Imágenes" },
              { value: "video", label: "Videos" },
              { value: "model3d", label: "Modelos 3D" },
              { value: "message", label: "Mensajes" },
            ]}
            icon={FilterIcons.Category}
            iconColor="text-sky-400"
            placeholder="Todas las categorías"
          />

          {/* Status Filter */}
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "", label: "Todos los estados" },
              { value: "active", label: "Activos" },
              { value: "draft", label: "Borradores" },
            ]}
            icon={FilterIcons.Status}
            iconColor="text-purple-400"
            placeholder="Todos los estados"
          />

          {/* Sort Filter */}
          <FilterSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "", label: "Ordenar por" },
              { value: "newest", label: "Más recientes" },
              { value: "oldest", label: "Más antiguos" },
              { value: "name", label: "Nombre A-Z" },
              { value: "name-desc", label: "Nombre Z-A" },
            ]}
            icon={FilterIcons.Sort}
            iconColor="text-pink-400"
            placeholder="Ordenar por"
          />

          {/* Clear Filters Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white border-2 border-white/20 hover:border-red-400/50 hover:bg-red-400/10 h-[52px] justify-center transition-all duration-300 group bg-gradient-to-r from-white/5 to-white/0 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl font-medium"
            onClick={() => {
              setCategoryFilter("");
              setStatusFilter("");
              setSortBy("");
            }}
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="font-semibold">Limpiar filtros</span>
          </Button>
        </div>

        {/* Experiences List/Grid */}
        {filteredExperiences.length === 0 ? (
          <div className="text-center py-24">
            <div className="relative inline-block mb-8">
              {searchTerm || categoryFilter || statusFilter || sortBy ? (
                <>
                  <div className="text-8xl mb-6 animate-bounce">🔍</div>
                  <div className="absolute -inset-8 bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                </>
              ) : (
                <>
                  <div className="text-8xl mb-6 animate-bounce">🎨</div>
                  <QuickArLogo
                    size={80}
                    className="mb-6 opacity-75 animate-pulse"
                    animated={true}
                  />
                  <div className="absolute -inset-12 bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                </>
              )}
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {searchTerm || categoryFilter || statusFilter || sortBy ? (
                <>
                  <h2 className="text-3xl font-bold font-orbitron text-white">
                    No se encontraron experiencias
                  </h2>
                  <p className="text-sky-200 text-lg font-manrope">
                    Intenta ajustar los filtros o términos de búsqueda
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center pt-4">
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setCategoryFilter("");
                        setStatusFilter("");
                        setSortBy("");
                      }}
                      variant="outline"
                      size="lg"
                      className="border-white/20 hover:border-white/40"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Limpiar filtros
                    </Button>
                    <Link href="/experiences/create">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Crear nueva experiencia
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-bold font-orbitron bg-gradient-to-r from-white via-sky-200 to-purple-200 bg-clip-text text-transparent">
                    ¡Tu lienzo digital te espera!
                  </h2>
                  <p className="text-sky-200 text-xl font-manrope flex items-center gap-3">
                    <svg
                      className="w-8 h-8 text-sky-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Crea tu primera obra maestra de realidad aumentada y
                    transforma la forma en que las personas interactúan con el
                    mundo
                  </p>

                  {/* Features showcase */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-sky-400/50 transition-all duration-300">
                      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-sky-500/20 to-sky-600/20 rounded-2xl">
                        <svg
                          className="w-8 h-8 text-sky-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        Fácil de usar
                      </h3>
                      <p className="text-white/70 text-sm">
                        Crea experiencias AR sin necesidad de conocimientos
                        técnicos
                      </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300">
                      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl">
                        <svg
                          className="w-8 h-8 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        Contenido variado
                      </h3>
                      <p className="text-white/70 text-sm">
                        Soporta imágenes, videos, modelos 3D y más
                      </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-pink-400/50 transition-all duration-300">
                      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-2xl">
                        <svg
                          className="w-8 h-8 text-pink-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        Analytics en tiempo real
                      </h3>
                      <p className="text-white/70 text-sm">
                        Rastrea el engagement y el impacto de tus experiencias
                      </p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link href="/experiences/create">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 hover:from-sky-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                      >
                        <QuickArLogo size={24} className="mr-3" />
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Crear mi primera experiencia
                        <svg
                          className="w-5 h-5 ml-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "space-y-3 sm:space-y-4"
            }
          >
            {filteredExperiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                viewMode={viewMode}
                onDeleteClick={showDeleteModal}
                isDeleting={deletingExperienceId === experience.id}
                navigatingTo={navigatingTo}
                onNavigateToAR={handleNavigateToAR}
                onNavigateToEdit={handleNavigateToEdit}
                onNavigateToDetails={handleNavigateToDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && experienceToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-red-500/20 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">
                ¿Eliminar experiencia?
              </h3>
              <p className="text-white/70 mb-4 font-manrope">
                Esta acción no se puede deshacer. La experiencia será eliminada
                permanentemente.
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-white/70 mb-1">Vas a eliminar:</p>
                  <p className="font-bold text-white font-orbitron">
                    {experienceToDelete.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setExperienceToDelete(null);
                }}
                className="flex-1 border-white/20 hover:border-white/40 hover:bg-white/5"
                disabled={deletingExperienceId !== null}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteExperience}
                disabled={deletingExperienceId !== null}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200"
              >
                {deletingExperienceId === experienceToDelete.id ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Sí, eliminar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      <LoadingModal
        isOpen={navigatingTo !== null}
        message={getLoadingConfig().message}
        submessage={getLoadingConfig().submessage}
      />
    </ProtectedRoute>
  );
}

interface ExperienceCardProps {
  experience: Experience;
  viewMode: "grid" | "list";
  onDeleteClick: (experienceId: string, experienceTitle: string) => void;
  isDeleting: boolean;
  navigatingTo: string | null;
  onNavigateToAR: (slugOrId: string) => void;
  onNavigateToEdit: (id: string) => void;
  onNavigateToDetails: (id: string) => void;
}

function ExperienceCard({
  experience,
  viewMode,
  onDeleteClick,
  isDeleting,
  navigatingTo,
  onNavigateToAR,
  onNavigateToEdit,
  onNavigateToDetails,
}: ExperienceCardProps) {
  const assetTypes = [
    ...new Set(experience.assets.map((asset) => asset.assetType)),
  ];

  // Get asset type icon component
  const getAssetIcon = (type: string, className: string = "w-4 h-4") => {
    switch (type) {
      case "image":
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "video":
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      case "model3d":
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      case "message":
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="bg-gradient-to-r from-white/5 via-white/8 to-white/5 backdrop-blur-sm border border-white/10 hover:border-sky-400/50 hover:bg-gradient-to-r hover:from-sky-500/10 hover:via-purple-500/10 hover:to-pink-500/10 transition-all duration-300 group overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icon badge */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-sky-500/30 transition-all duration-300 group-hover:scale-110">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                {/* Status indicator */}
                <div
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                    experience.isActive
                      ? "bg-green-400 shadow-lg shadow-green-400/50"
                      : "bg-red-400 shadow-lg shadow-red-400/50"
                  } animate-pulse`}
                ></div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white font-orbitron truncate group-hover:text-sky-200 transition-colors">
                    {experience.title}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                      experience.isActive
                        ? "bg-green-400/20 text-green-300 border-green-400/40"
                        : "bg-red-400/20 text-red-300 border-red-400/40"
                    }`}
                  >
                    {experience.isActive ? (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Activa
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Inactiva
                      </>
                    )}
                  </span>
                </div>
                <p className="text-white/60 text-sm mb-2 line-clamp-1 group-hover:text-white/80 transition-colors">
                  {experience.description || (
                    <span className="flex items-center gap-1.5 italic">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Sin descripción
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    {experience.assets.length} assets
                  </span>
                  {assetTypes.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        {assetTypes.map((type, idx) => (
                          <span key={idx} className="flex items-center">
                            {getAssetIcon(type, "w-3.5 h-3.5")}
                          </span>
                        ))}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="font-mono">
                    {new Date(experience.updatedAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/ar/${experience.slug || experience.id}`}
                onClick={() => onNavigateToAR(experience.slug || experience.id)}
              >
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                  disabled={
                    navigatingTo === `ar-${experience.slug || experience.id}`
                  }
                >
                  {navigatingTo === `ar-${experience.slug || experience.id}` ? (
                    <>
                      <svg
                        className="w-4 h-4 sm:mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="hidden sm:inline">Cargando...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 sm:mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                      <span className="hidden sm:inline">Ver AR</span>
                    </>
                  )}
                </Button>
              </Link>

              <Link
                href={`/experiences/${experience.id}/edit`}
                onClick={() => onNavigateToEdit(experience.id)}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 hover:border-sky-400/50 hover:bg-sky-400/10"
                  disabled={navigatingTo === `edit-${experience.id}`}
                >
                  {navigatingTo === `edit-${experience.id}` ? (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/50"
                onClick={() => onDeleteClick(experience.id, experience.title)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid mode
  return (
    <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-white/10 hover:border-sky-400/60 hover:shadow-2xl hover:shadow-sky-500/20 transition-all duration-500 group hover:scale-[1.02] overflow-hidden">
      <CardContent className="p-0">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-sky-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-700 pointer-events-none"></div>

        {/* Header with status and icon */}
        <div className="relative p-5 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/5">
          <div className="flex items-start justify-between mb-3">
            {/* Icon and status */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:shadow-xl group-hover:shadow-sky-500/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              {/* Status dot */}
              <div
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                  experience.isActive
                    ? "bg-green-400 shadow-lg shadow-green-400/50"
                    : "bg-red-400 shadow-lg shadow-red-400/50"
                } animate-pulse`}
              >
                {experience.isActive ? (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Status badge */}
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-lg flex items-center gap-1.5 ${
                experience.isActive
                  ? "bg-green-400/20 text-green-300 border-green-400/50 shadow-green-400/20"
                  : "bg-red-400/20 text-red-300 border-red-400/50 shadow-red-400/20"
              }`}
            >
              {experience.isActive ? (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  ACTIVA
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  INACTIVA
                </>
              )}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-white font-orbitron leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-sky-200 group-hover:via-purple-200 group-hover:to-pink-200 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
            {experience.title}
          </h3>
        </div>

        {/* Content */}
        <div className="relative p-5 space-y-4">
          {/* Description */}
          <p className="text-white/70 text-sm leading-relaxed min-h-[60px] line-clamp-3 group-hover:text-white/90 transition-colors">
            {experience.description || (
              <span className="flex items-center gap-2 italic text-white/50">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Una experiencia mágica de realidad aumentada esperando ser
                descubierta
              </span>
            )}
          </p>

          {/* Metadata with icons */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-3 text-xs">
              {/* Assets count */}
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500/20 to-purple-500/20 px-2.5 py-1.5 rounded-lg border border-sky-400/30">
                <svg
                  className="w-4 h-4 text-sky-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="font-bold text-white">
                  {experience.assets.length}
                </span>
                <span className="text-white/60">assets</span>
              </div>

              {/* Asset types */}
              {assetTypes.length > 0 && (
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                  {assetTypes.map((type, index) => (
                    <span key={index} className="text-white/70">
                      {getAssetIcon(type, "w-4 h-4")}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-mono font-medium">
                {new Date(experience.updatedAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative p-5 pt-0 space-y-2.5">
          {/* Primary action */}
          <Link
            href={`/ar/${experience.slug || experience.id}`}
            className="block"
            onClick={() => onNavigateToAR(experience.slug || experience.id)}
          >
            <Button
              className="w-full bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 hover:from-sky-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-2xl hover:shadow-sky-500/30 transition-all duration-300 group/btn h-11"
              disabled={
                navigatingTo === `ar-${experience.slug || experience.id}`
              }
            >
              {navigatingTo === `ar-${experience.slug || experience.id}` ? (
                <>
                  <svg
                    className="w-5 h-5 mr-2 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Cargando AR...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  Ver en AR
                  <svg
                    className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </Button>
          </Link>

          {/* Secondary actions */}
          <div className="grid grid-cols-3 gap-2">
            <Link
              href={`/experiences/${experience.id}`}
              onClick={() => onNavigateToDetails(experience.id)}
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full border-green-400/30 hover:border-green-400/60 hover:bg-green-400/10 text-white hover:text-green-300 transition-all duration-200 group/detail"
                disabled={navigatingTo === `details-${experience.id}`}
              >
                {navigatingTo === `details-${experience.id}` ? (
                  <svg
                    className="w-4 h-4 mr-1.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1.5 group-hover/detail:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs font-semibold">Info</span>
                  </>
                )}
              </Button>
            </Link>

            <Link
              href={`/experiences/${experience.id}/edit`}
              onClick={() => onNavigateToEdit(experience.id)}
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full border-sky-400/30 hover:border-sky-400/60 hover:bg-sky-400/10 text-white hover:text-sky-300 transition-all duration-200 group/edit"
                disabled={navigatingTo === `edit-${experience.id}`}
              >
                {navigatingTo === `edit-${experience.id}` ? (
                  <svg
                    className="w-4 h-4 mr-1.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1.5 group-hover/edit:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span className="text-xs font-semibold">Editar</span>
                  </>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/30 hover:border-red-400/60 transition-all duration-200 group/delete"
              onClick={() => onDeleteClick(experience.id, experience.title)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-1.5 group-hover/delete:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span className="text-xs font-semibold">Borrar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
