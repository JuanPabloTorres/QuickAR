"use client";

import { apiClient } from "@/lib/api";
import { ExperienceDto, AssetDto } from "@/types";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Dynamic import of Enhanced3DViewer for 3D models
const Enhanced3DViewer = dynamic(() => import("@/src/components/ui/Enhanced3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-slate-200 rounded-xl h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-600 font-medium">Inicializando visor 3D...</p>
      </div>
    </div>
  ),
});

// Dynamic import of ARViewer as fallback
const ARViewer = dynamic(() => import("@/src/components/ui/ARViewer"), {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">📭</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Sin Contenido</h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Esta experiencia no tiene contenido disponible para mostrar.
          </p>
          <div className="mt-8 p-4 bg-white/60 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">
              Experiencia: <strong>{experience.title}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Modern Header */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {experience.title}
            </h1>
            {experience.description && (
              <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                {experience.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              📱 <span>Experiencia AR</span>
            </span>
            <span className="flex items-center gap-1">
              🎯 <span>{experience.assets.length} contenido{experience.assets.length > 1 ? 's' : ''}</span>
            </span>
            <span className="flex items-center gap-1">
              ✨ <span>Interactiva</span>
            </span>
          </div>
        </div>

        {/* Enhanced AR Experience */}
        <div className="mb-10">
          {experience.assets.map((asset, index) => (
            <div key={asset.id} className="mb-8">
              {asset.kind === "model3d" ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      🎯 <span>{asset.name}</span>
                    </h3>
                    <p className="text-sm text-slate-600">Modelo 3D interactivo con controles de arrastre mejorados</p>
                  </div>
                  <div className="h-96 w-full">
                    <Enhanced3DViewer
                      asset={asset}
                      onTrackEvent={trackEvent}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      📄 <span>{asset.name}</span>
                    </h3>
                    <p className="text-sm text-slate-600">Contenido AR interactivo</p>
                  </div>
                  <div className="h-96 w-full">
                    <ARViewer
                      asset={asset}
                      onTrackEvent={trackEvent}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced Instructions */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              🥽 <span>Realidad Aumentada</span>
            </h3>
            <div className="space-y-3 text-slate-600">
              <p className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Presiona <strong>"Ver en AR"</strong> para activar la experiencia</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Permite el acceso a la cámara cuando se solicite</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Mueve tu dispositivo para explorar el contenido en 3D</span>
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              🎮 <span>Controles</span>
            </h3>
            <div className="space-y-3 text-slate-600">
              <p className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">•</span>
                <span><strong>Arrastra</strong> para rotar modelos 3D</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">•</span>
                <span><strong>Pellizca</strong> para hacer zoom</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-purple-500 font-bold">•</span>
                <span><strong>Navega</strong> entre múltiples contenidos</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modern Footer */}
        <div className="text-center">
          <div className="inline-block p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
            <p className="text-slate-600 text-sm font-medium">
              ⚡ Powered by <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">QR AR Platform</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
