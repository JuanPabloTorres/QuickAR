"use client";

import UnifiedARViewer from "@/components/ar/UnifiedARViewer";
import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ARExperience() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;

  // Estados principales
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

  // Cargar experiencia
  const loadExperience = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Cargando experiencia:", experienceId);

      const data = experienceId.match(/^[0-9]+$/)
        ? await getExperienceById(experienceId)
        : await getExperienceBySlug(experienceId);

      console.log("📦 Datos recibidos:", data);

      if (!data?.data) {
        console.error("❌ No se encontraron datos para la experiencia");
        throw new Error("Experiencia no encontrada");
      }

      const exp = normalizeExperience(data.data);
      console.log("✅ Experiencia normalizada:", exp);
      setExperience(exp);
      setIsLoading(false);
      console.log("✅ Experiencia cargada completamente");
    } catch (err) {
      console.error("❌ ERROR cargando experiencia:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(`No se pudo cargar la experiencia: ${errorMessage}`);
      setIsLoading(false);
    }
  }, [experienceId]);

  const handleBack = useCallback(() => {
    router.push("/experiences");
  }, [router]);

  const handleAssetChange = useCallback((index: number) => {
    setCurrentAssetIndex(index);
  }, []);

  // Efectos
  useEffect(() => {
    loadExperience();
  }, [loadExperience]);

  // Renderizado condicional
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Cargando experiencia AR...</h2>
          <p className="text-sm text-blue-200 mt-2">
            Preparando vista 3D realista
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <h2 className="text-2xl font-bold mb-4">❌ Error</h2>
          <p className="text-red-200 mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold"
            >
              🔄 Reintentar
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-bold"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            ❌ Experiencia no encontrada
          </h2>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold"
          >
            ← Volver a experiencias
          </button>
        </div>
      </div>
    );
  }

  // Render the realistic AR viewer
  return (
    <RealisticARViewer
      experience={experience}
      currentAssetIndex={currentAssetIndex}
      onAssetChange={handleAssetChange}
      onBack={handleBack}
    />
  );
}
