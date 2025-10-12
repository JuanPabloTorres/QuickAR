"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { FloatingDecoration, EasterEggProvider, MotivationalQuote, FunFact, AchievementNotification } from "@/components/ui/easter-eggs";
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

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setIsLoading(true);
        const response = await getAllExperiences();

        if (response.success && response.data) {
          const normalizedExperiences = response.data.map(normalizeExperience);
          setExperiences(normalizedExperiences);
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
        <div className="text-center py-16">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <div className="text-xl font-semibold text-white">
            Cargando experiencias...
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Experiencias AR</h1>
          <p className="text-blue-200 mt-1">
            Gestiona tus experiencias de realidad aumentada
          </p>
        </div>

        <Link href="/experiences/create">
          <Button size="lg">➕ Nueva Experiencia</Button>
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar experiencias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass px-4 py-2 rounded-lg text-white placeholder-white/60 border border-white/20 focus:border-primary/50 focus:outline-none"
          />

          <div className="text-sm text-white/60">
            {filteredExperiences.length} experiencia(s)
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            ▦
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            ≡
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
              <QuickArLogo size={64} className="mb-4 opacity-75" />
              <div className="text-xl text-white mb-2">
                Aún no tienes experiencias
              </div>
              <div className="text-blue-200 mb-6">
                Crea tu primera experiencia de realidad aumentada
              </div>
              <Link href="/experiences/create">
                <Button>
                  <QuickArLogo size={16} className="mr-2" />
                  Crear Primera Experiencia
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
      className={`glass hover:bg-white/5 transition-all duration-200 ${
        viewMode === "list" ? "flex flex-row items-center" : ""
      }`}
    >
      <CardHeader className={viewMode === "list" ? "flex-1" : ""}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white">{experience.title}</CardTitle>
            <CardDescription className="mt-1">
              {experience.description || "Sin descripción"}
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
            <span>{experience.assets.length} assets</span>
            <span>•</span>
            <span>{assetTypes.join(", ")}</span>
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
