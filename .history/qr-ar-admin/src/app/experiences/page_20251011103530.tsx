"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  EasterEggProvider,
  FunFact,
  MotivationalQuote,
} from "@/components/ui/easter-eggs";
import {
  AchievementNotification,
  FloatingDecoration,
} from "@/components/ui/floating-particles";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { getAllExperiences } from "@/lib/api/experiences";
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
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<{
    title: string;
    description: string;
  } | null>(null);

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

  const filteredExperiences = experiences.filter(
    (exp) =>
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <FloatingDecoration />
        <div className="text-center py-16">
          <div className="animate-bounce text-6xl mb-4">🎨</div>
          <div className="text-xl font-semibold text-white animate-pulse">
            ✨ Preparando tus obras maestras AR...
          </div>
          <div className="text-blue-200 mt-2 animate-pulse">
            🚀 Cargando experiencias increíbles
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-xl font-semibold text-white mb-4">
            Error cargando experiencias
          </div>
          <div className="text-blue-200 mb-8">{error}</div>
          <Button onClick={() => window.location.reload()}>
            🔄 Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
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
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              ➕ Nueva Experiencia
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <select className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20 text-sm">
            <option value="" className="bg-slate-800 text-white">
              Todas las categorías
            </option>
            <option value="product" className="bg-slate-800 text-white">
              Productos
            </option>
            <option value="art" className="bg-slate-800 text-white">
              Arte
            </option>
            <option value="education" className="bg-slate-800 text-white">
              Educación
            </option>
            <option value="entertainment" className="bg-slate-800 text-white">
              Entretenimiento
            </option>
          </select>

          <select className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20 text-sm">
            <option value="" className="bg-slate-800 text-white">
              Todos los estados
            </option>
            <option value="active" className="bg-slate-800 text-white">
              Activos
            </option>
            <option value="draft" className="bg-slate-800 text-white">
              Borradores
            </option>
            <option value="archived" className="bg-slate-800 text-white">
              Archivados
            </option>
          </select>

          <select className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20 text-sm">
            <option value="" className="bg-slate-800 text-white">
              Ordenar por
            </option>
            <option value="newest" className="bg-slate-800 text-white">
              Más recientes
            </option>
            <option value="oldest" className="bg-slate-800 text-white">
              Más antiguos
            </option>
            <option value="name" className="bg-slate-800 text-white">
              Nombre A-Z
            </option>
            <option value="name-desc" className="bg-slate-800 text-white">
              Nombre Z-A
            </option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white border border-white/20 hover:border-white/40 h-10 justify-center"
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
              />
            </svg>
            <span className="hidden sm:inline">Más filtros</span>
            <span className="sm:hidden">Filtros</span>
          </Button>
        </div>

        {/* Experiences List/Grid */}
        {filteredExperiences.length === 0 ? (
          <div className="text-center py-16">
            {searchTerm ? (
              <>
                <div className="text-4xl mb-4">🔍</div>
                <div className="text-xl text-white mb-2">
                  No se encontraron experiencias
                </div>
                <div className="text-blue-200">
                  Intenta con otros términos de búsqueda
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl animate-bounce mb-4">🎨</div>
                <QuickArLogo size={64} className="mb-4 opacity-75" />
                <div className="text-xl text-white mb-2">
                  🌟 ¡Tu lienzo digital te espera!
                </div>
                <div className="text-blue-200 mb-6">
                  🚀 Crea tu primera obra maestra de realidad aumentada
                </div>
                <Link href="/experiences/create">
                  <Button className="hover:scale-105 transition-transform">
                    <QuickArLogo size={16} className="mr-2" />✨ Crear Primera
                    Experiencia
                  </Button>
                </Link>
              </>
            )}
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
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

interface ExperienceCardProps {
  experience: Experience;
  viewMode: "grid" | "list";
}

function ExperienceCard({ experience, viewMode }: ExperienceCardProps) {
  const assetTypes = [
    ...new Set(experience.assets.map((asset) => asset.assetType)),
  ];

  if (viewMode === "list") {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-sky-400/30 hover:bg-white/10 transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    experience.isActive
                      ? "bg-green-400 shadow-lg shadow-green-400/50"
                      : "bg-red-400 shadow-lg shadow-red-400/50"
                  } animate-pulse`}
                ></div>
                <h3 className="text-lg font-semibold text-white font-orbitron truncate">
                  {experience.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    experience.isActive
                      ? "bg-green-400/20 text-green-400"
                      : "bg-red-400/20 text-red-400"
                  }`}
                >
                  {experience.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
              <p className="text-white/70 text-sm mb-2 line-clamp-1">
                {experience.description || "Sin descripción"}
              </p>
              <div className="flex items-center gap-4 text-xs text-white/50">
                <span className="flex items-center gap-1">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  {experience.assets.length} assets
                </span>
                <span>•</span>
                <span>
                  {new Date(experience.updatedAt).toLocaleDateString("es-ES")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/ar/${experience.slug || experience.id}`}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Ver AR
                </Button>
              </Link>

              <Link href={`/experiences/${experience.id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 hover:border-white/40"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={() => {
                  if (
                    confirm(
                      "¿Estás seguro de que quieres eliminar esta experiencia?"
                    )
                  ) {
                    console.log("Delete experience", experience.id);
                  }
                }}
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 hover:border-sky-400/50 hover:shadow-2xl hover:shadow-sky-500/20 transition-all duration-500 group hover:scale-[1.02]">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="relative p-6 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 rounded-t-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-purple-500/5 rounded-t-lg group-hover:from-sky-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-sky-500 to-purple-600 shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-orbitron group-hover:text-sky-200 transition-colors duration-300">
                    {experience.title}
                  </h3>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      experience.isActive
                        ? "bg-green-400/20 text-green-400 border border-green-400/30"
                        : "bg-red-400/20 text-red-400 border border-red-400/30"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        experience.isActive ? "bg-green-400" : "bg-red-400"
                      } animate-pulse`}
                    ></div>
                    {experience.isActive ? "Activa" : "Inactiva"}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-white/80 text-sm leading-relaxed mb-4">
              {experience.description ||
                "✨ Una experiencia mágica sin descripción"}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-1">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  {experience.assets.length} assets
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {assetTypes.join(", ")}
                </div>
              </div>

              <div className="text-xs text-white/40 font-mono">
                {new Date(experience.updatedAt).toLocaleDateString("es-ES")}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-6 pt-4 space-y-3">
          <Link href={`/ar/${experience.slug || experience.id}`}>
            <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 group">
              <svg
                className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Ver en AR
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link href={`/experiences/${experience.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/20 hover:border-sky-400/50 hover:bg-sky-400/10 text-white"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Editar
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/50"
              onClick={() => {
                if (
                  confirm(
                    "¿Estás seguro de que quieres eliminar esta experiencia?"
                  )
                ) {
                  console.log("Delete experience", experience.id);
                }
              }}
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
