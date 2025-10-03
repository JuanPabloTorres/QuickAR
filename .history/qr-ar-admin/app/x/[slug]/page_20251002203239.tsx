"use client";

import { apiClient } from "@/lib/api";
import { ExperienceDto } from "@/types";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import "../ar-viewer.css";

// Dynamic import of modern carousel component with SSR disabled
const ModernAssetCarousel = dynamic(() => import("@/src/components/ui/ModernAssetCarousel"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-slate-200 rounded-xl h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-600 font-medium">Inicializando experiencia AR...</p>
      </div>
    </div>
  ),
});

export default function ModernARExperiencePage() {
  const params = useParams();
  const [experience, setExperience] = useState<ExperienceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  const loadExperience = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading experience with slug:", slug);

      const response = await apiClient.getExperienceBySlug(slug);
      console.log("Experience response:", response);

      if (response.success && response.data) {
        console.log("Experience loaded:", response.data);
        console.log("Assets:", response.data.assets);
        setExperience(response.data);
      } else {
        console.error("Failed to load experience:", response.message);
        setError("Experiencia no encontrada");
      }
    } catch (err) {
      console.error("Error loading experience:", err);
      setError("Error al cargar la experiencia");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadExperience();
  }, [loadExperience]);

  const trackEvent = async (eventType: string, additionalData?: string) => {
    if (!experience) return;

    try {
      await apiClient.trackEvent({
        eventType,
        experienceId: experience.id,
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
        additionalData,
      });
    } catch (err) {
      console.error("Error tracking event:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="ar-loading-spinner"></div>
          <p className="text-white">Cargando experiencia AR...</p>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Experiencia no encontrada
          </h1>
          <p className="text-blue-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!experience.assets || experience.assets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-2xl font-bold text-white mb-2">Sin contenido</h1>
          <p className="text-blue-200">
            Esta experiencia no tiene contenido disponible
          </p>
        </div>
      </div>
    );
  }

  const currentAsset = experience.assets[currentAssetIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {experience.title}
          </h1>
          {experience.description && (
            <p className="text-blue-200 text-lg">{experience.description}</p>
          )}
        </div>

        {/* AR Viewer */}
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4">
            <ARViewer asset={currentAsset} onTrackEvent={trackEvent} />

            {/* Asset Navigation */}
            {experience.assets.length > 1 && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => {
                    const newIndex =
                      currentAssetIndex > 0
                        ? currentAssetIndex - 1
                        : experience.assets.length - 1;
                    setCurrentAssetIndex(newIndex);
                    trackEvent("asset_navigation", `previous_to_${newIndex}`);
                  }}
                  className="ar-navigation-button"
                  aria-label="Contenido anterior"
                >
                  ◀
                </button>

                <div className="text-white text-sm">
                  {currentAssetIndex + 1} de {experience.assets.length}
                </div>

                <button
                  onClick={() => {
                    const newIndex =
                      currentAssetIndex < experience.assets.length - 1
                        ? currentAssetIndex + 1
                        : 0;
                    setCurrentAssetIndex(newIndex);
                    trackEvent("asset_navigation", `next_to_${newIndex}`);
                  }}
                  className="ar-navigation-button"
                  aria-label="Contenido siguiente"
                >
                  ▶
                </button>
              </div>
            )}

            {/* Asset Info */}
            <div className="glass rounded-lg p-4 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                {currentAsset.name}
              </h3>
              <p className="text-blue-200 text-sm">
                {experience.title} •{" "}
                {currentAsset.kind === "model3d"
                  ? "Modelo 3D"
                  : currentAsset.kind === "image"
                  ? "Imagen"
                  : currentAsset.kind === "video"
                  ? "Video"
                  : "Mensaje"}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 max-w-xl mx-auto">
          <div className="glass rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              Instrucciones
            </h3>
            <div className="space-y-2 text-sm text-blue-200">
              <p>• Presiona "Ver en AR" para activar la cámara</p>
              <p>• Permite el acceso a la cámara cuando se solicite</p>
              <p>• Mueve el dispositivo para ver el contenido en AR</p>
              <p>• Navega entre contenidos con las flechas</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-300 text-sm">Powered by QR AR Platform</p>
        </div>
      </div>
    </div>
  );
}
