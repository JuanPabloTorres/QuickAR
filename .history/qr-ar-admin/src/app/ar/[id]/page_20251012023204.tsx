"use client";

import { ArClient } from "@/components/ar/ArClient";
import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ARExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const experienceId = params.id as string;

  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) {
        setError("ID de experiencia no válido");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Check if experienceId looks like a UUID (GUID)
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            experienceId
          );

        let response;
        if (isUuid) {
          // Try direct ID lookup first for UUIDs
          response = await getExperienceById(experienceId);
        } else {
          // Try slug lookup for non-UUID values
          response = await getExperienceBySlug(experienceId);

          if (!response.success) {
            // If slug lookup fails, try as ID anyway
            response = await getExperienceById(experienceId);
          }
        }

        if (response.success && response.data) {
          const normalizedExperience = normalizeExperience(response.data);

          // Check if experience is active
          if (!normalizedExperience.isActive) {
            setError("Esta experiencia no está disponible");
            setIsLoading(false);
            return;
          }

          // Check if experience has assets
          if (
            !normalizedExperience.assets ||
            normalizedExperience.assets.length === 0
          ) {
            setError("Esta experiencia no tiene contenido disponible");
            setIsLoading(false);
            return;
          }

          setExperience(normalizedExperience);
        } else {
          setError(response.message || "Experiencia no encontrada");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        setIsLoading(false);
      }
    };

    loadExperience();
  }, [experienceId]);

  const handleBack = () => {
    // Try to go back in history first, otherwise redirect to experiences
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/experiences");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <div className="text-xl font-semibold">Cargando experiencia...</div>
          <div className="text-sm text-blue-200 mt-2">ID: {experienceId}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-2xl font-semibold mb-4">
            Experiencia no disponible
          </div>
          <div className="text-blue-200 mb-8">{error}</div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                window.location.reload();
              }}
              className="w-full glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              🔄 Intentar de nuevo
            </button>

            <button
              onClick={handleBack}
              className="w-full glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">🤔</div>
          <div className="text-xl font-semibold">
            No se pudo cargar la experiencia
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ArClient
        experience={experience}
        onBack={handleBack}
        className="h-screen"
      />
    </div>
  );
}
