"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/60 bg-white/10 px-3 py-2 rounded-lg">
              <span className="font-medium">{filteredExperiences.length}</span>
              <span>experiencia{filteredExperiences.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 ${viewMode === "grid" ? "bg-sky-500 text-white" : "text-white/70 hover:text-white"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 ${viewMode === "list" ? "bg-sky-500 text-white" : "text-white/70 hover:text-white"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </Button>
          </div>
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
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
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

  return (
    <Card
      className={`glass hover:bg-white/5 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group ${
        viewMode === "list" ? "flex flex-row items-center" : ""
      }`}
    >
      <CardHeader className={viewMode === "list" ? "flex-1" : ""}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white flex items-center gap-2">
              <span className="group-hover:animate-bounce">🎭</span>
              {experience.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {experience.description ||
                "✨ Una experiencia mágica sin descripción"}
            </CardDescription>
          </div>

          <div
            className={`flex items-center space-x-1 ${
              experience.isActive ? "text-green-400" : "text-red-400"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-current"></div>
            <span className="text-xs">
              {experience.isActive ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2 text-sm text-white/60">
            <span className="flex items-center gap-1">
              📦 {experience.assets.length} assets
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              🏷️ {assetTypes.join(", ")}
            </span>
          </div>

          <div className="text-xs text-white/40">
            {new Date(experience.updatedAt).toLocaleDateString("es-ES")}
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={`pt-0 ${
          viewMode === "list" ? "flex items-center space-x-2" : "space-y-2"
        }`}
      >
        <Link href={`/ar/${experience.slug || experience.id}`}>
          <Button className="w-full" size="sm">
            <QuickArLogo size={16} className="mr-2" />
            Ver AR
          </Button>
        </Link>

        {viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/experiences/edit/${experience.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                <QuickArLogo size={14} className="mr-1" />
                Editar
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (
                  confirm(
                    "¿Estás seguro de que quieres eliminar esta experiencia?"
                  )
                ) {
                  // TODO: Implement delete
                  console.log("Delete experience", experience.id);
                }
              }}
            >
              <QuickArLogo size={14} className="mr-1 opacity-75" />
              Eliminar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
