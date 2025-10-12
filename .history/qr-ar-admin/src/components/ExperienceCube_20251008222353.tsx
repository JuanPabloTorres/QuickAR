/**
 * ExperienceCube - Componente principal para visualizar experiencias AR
 * Versión refactorizada con mejor arquitectura y funcionalidad completa
 */

"use client";

import {
  calculateExperienceStats,
  formatRelativeTime,
  getExperienceARUrl,
  getExperienceEditUrl,
  getExperienceViewUrl,
  getPrimaryAsset,
  hasARCapabilities,
} from "@/lib/experience-helpers";
import { cn } from "@/lib/utils";
import { ARExperience } from "@/types";
import Link from "next/link";
import { useCallback, useState } from "react";
import { AssetPreview, AssetRenderer } from "./AssetRenderer";

interface ExperienceCubeProps {
  experience: ARExperience;
  variant?: "card" | "list" | "minimal";
  showActions?: boolean;
  showStats?: boolean;
  showDescription?: boolean;
  enableARPreview?: boolean;
  onEdit?: (experience: ARExperience) => void;
  onDelete?: (experience: ARExperience) => void;
  onShare?: (experience: ARExperience) => void;
  className?: string;
}

/**
 * Componente principal para mostrar experiencias AR en diferentes formatos
 */
export function ExperienceCube({
  experience,
  variant = "card",
  showActions = true,
  showStats = true,
  showDescription = true,
  enableARPreview = true,
  onEdit,
  onDelete,
  onShare,
  className,
}: ExperienceCubeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const primaryAsset = getPrimaryAsset(experience);
  const hasAR = hasARCapabilities(experience);
  const stats = calculateExperienceStats(experience);

  const handleARPreview = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (hasAR) {
        // Abrir en nueva ventana o modal para AR
        window.open(getExperienceARUrl(experience), "_blank");
      }
    },
    [experience, hasAR]
  );

  const handleAction = useCallback(
    (action: "edit" | "delete" | "share", e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      switch (action) {
        case "edit":
          onEdit?.(experience);
          break;
        case "delete":
          onDelete?.(experience);
          break;
        case "share":
          onShare?.(experience);
          break;
      }
    },
    [experience, onEdit, onDelete, onShare]
  );

  // Renderizado según la variante
  if (variant === "list") {
    return (
      <div
        className={cn(
          "flex items-center space-x-4 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow",
          !experience.isActive && "opacity-60",
          className
        )}
      >
        {/* Preview del asset principal */}
        <div className="flex-shrink-0">
          {primaryAsset ? (
            <AssetPreview asset={primaryAsset} size="sm" />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xl">📦</span>
            </div>
          )}
        </div>

        {/* Información principal */}
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-grow">
              <Link href={getExperienceViewUrl(experience)}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                  {experience.title}
                </h3>
              </Link>

              {showDescription && experience.description && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {experience.description}
                </p>
              )}

              {showStats && (
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{stats.totalAssets} assets</span>
                  {hasAR && <span className="text-green-600">AR ✓</span>}
                  <span>{formatRelativeTime(experience.createdAt)}</span>
                  {!experience.isActive && (
                    <span className="text-red-500">Inactivo</span>
                  )}
                </div>
              )}
            </div>

            {/* Acciones */}
            {showActions && (
              <div className="flex items-center space-x-2 ml-4">
                {hasAR && enableARPreview && (
                  <button
                    onClick={handleARPreview}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Vista previa AR"
                  >
                    📱
                  </button>
                )}

                <button
                  onClick={(e) => handleAction("edit", e)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  ✏️
                </button>

                <button
                  onClick={(e) => handleAction("share", e)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Compartir"
                >
                  🔗
                </button>

                <button
                  onClick={(e) => handleAction("delete", e)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <Link href={getExperienceViewUrl(experience)}>
        <div
          className={cn(
            "p-3 bg-white rounded-lg border hover:shadow-md transition-all cursor-pointer",
            !experience.isActive && "opacity-60",
            className
          )}
        >
          <div className="flex items-center space-x-3">
            {primaryAsset && <AssetPreview asset={primaryAsset} size="sm" />}
            <div className="min-w-0 flex-grow">
              <h3 className="font-medium text-gray-900 truncate">
                {experience.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                <span>{stats.totalAssets} assets</span>
                {hasAR && <span className="text-green-600">AR</span>}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Variante 'card' (por defecto)
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group",
        !experience.isActive && "opacity-75",
        className
      )}
    >
      {/* Header de la tarjeta */}
      <div className="relative">
        {/* Asset principal como hero */}
        <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
          {primaryAsset ? (
            <div className="absolute inset-0">
              <AssetRenderer
                asset={primaryAsset}
                enableAR={false}
                autoLoad={false}
                showControls={false}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-6xl text-gray-300">📦</div>
            </div>
          )}

          {/* Overlay con estado */}
          <div className="absolute top-3 left-3 flex space-x-2">
            {!experience.isActive && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                Inactivo
              </span>
            )}
            {hasAR && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center">
                📱 AR
              </span>
            )}
          </div>

          {/* Acciones rápidas */}
          {showActions && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex space-x-1">
                {hasAR && enableARPreview && (
                  <button
                    onClick={handleARPreview}
                    className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
                    title="Vista previa AR"
                  >
                    📱
                  </button>
                )}

                <button
                  onClick={(e) => handleAction("share", e)}
                  className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
                  title="Compartir"
                >
                  🔗
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6">
        {/* Título y descripción */}
        <div className="mb-4">
          <Link href={getExperienceViewUrl(experience)}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
              {experience.title}
            </h3>
          </Link>

          {showDescription && experience.description && (
            <div>
              <p
                className={cn(
                  "text-gray-600 text-sm leading-relaxed",
                  !showFullDescription && "line-clamp-3"
                )}
              >
                {experience.description}
              </p>

              {experience.description.length > 150 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blue-600 text-sm mt-1 hover:underline"
                >
                  {showFullDescription ? "Ver menos" : "Ver más"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Assets preview */}
        {experience.assets.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Assets ({stats.totalAssets})
              </span>
              <Link
                href={getExperienceEditUrl(experience)}
                className="text-xs text-blue-600 hover:underline"
              >
                Gestionar
              </Link>
            </div>

            <div className="flex space-x-2 overflow-x-auto">
              {experience.assets.slice(0, 5).map((asset) => (
                <AssetPreview
                  key={asset.id}
                  asset={asset}
                  size="sm"
                  className="flex-shrink-0"
                />
              ))}

              {experience.assets.length > 5 && (
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                  +{experience.assets.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estadísticas y metadatos */}
        {showStats && (
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <span>Creado {formatRelativeTime(experience.createdAt)}</span>
              {stats.lastUpdatedDaysAgo > 0 && (
                <span>Actualizado hace {stats.lastUpdatedDaysAgo}d</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {stats.assetCounts.model3d > 0 && (
                <span title="Modelos 3D">🎯</span>
              )}
              {stats.assetCounts.image > 0 && <span title="Imágenes">🖼️</span>}
              {stats.assetCounts.video > 0 && <span title="Videos">📹</span>}
              {stats.assetCounts.text > 0 && <span title="Textos">📝</span>}
            </div>
          </div>
        )}

        {/* Acciones principales */}
        {showActions && (
          <div className="flex space-x-2">
            <Link
              href={getExperienceViewUrl(experience)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Ver detalles
            </Link>

            {hasAR && (
              <Link
                href={getExperienceARUrl(experience)}
                target="_blank"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Abrir AR
              </Link>
            )}

            <button
              onClick={(e) => handleAction("edit", e)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              ✏️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para mostrar una grilla de experiencias
export function ExperienceGrid({
  experiences,
  variant = "card",
  columns = { sm: 1, md: 2, lg: 3 },
  className,
  ...props
}: {
  experiences: ARExperience[];
  variant?: "card" | "list" | "minimal";
  columns?: { sm?: number; md?: number; lg?: number; xl?: number };
  className?: string;
} & Omit<ExperienceCubeProps, "experience">) {
  if (experiences.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay experiencias
        </h3>
        <p className="text-gray-500">
          Comienza creando tu primera experiencia AR
        </p>
      </div>
    );
  }

  const gridCols = {
    "grid-cols-1": columns.sm === 1,
    "md:grid-cols-2": columns.md === 2,
    "lg:grid-cols-3": columns.lg === 3,
    "xl:grid-cols-4": columns.xl === 4,
  };

  return (
    <div
      className={cn(
        "grid gap-6",
        variant === "list"
          ? "grid-cols-1"
          : Object.entries(gridCols)
              .filter(([_, condition]) => condition)
              .map(([className]) => className)
              .join(" "),
        className
      )}
    >
      {experiences.map((experience) => (
        <ExperienceCube
          key={experience.id}
          experience={experience}
          variant={variant}
          {...props}
        />
      ))}
    </div>
  );
}
