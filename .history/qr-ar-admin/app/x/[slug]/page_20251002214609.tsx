"use client";

import { apiClient } from "@/lib/api";
import { ExperienceDto } from "@/types";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Dynamic import of AR components with SSR disabled
const ARViewer = dynamic(() => import("@/src/components/ui/ARViewerSimple"), {
  ssr: false,
  loading: () => <div className="ar-loading">Inicializando AR...</div>,
});

export default function ARExperiencePage() {
  const params = useParams();
  const [experience, setExperience] = useState<ExperienceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [showARViewer, setShowARViewer] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 text-center max-w-md w-full animate-pulse">
          <div className="relative">
            <div className="ar-loading-spinner mb-6"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl animate-ping opacity-30"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            🚀 Preparando tu experiencia AR
          </h2>
          <p className="text-muted-foreground">
            Un momento mientras cargamos la magia...
          </p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 text-center max-w-md w-full">
          <div className="relative mb-6">
            <div className="text-6xl mb-4 animate-bounce">�</div>
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-warning/20 rounded-full blur-xl opacity-50"></div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            ¡Ups! Experiencia no encontrada
          </h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="glass-strong rounded-xl p-3 bg-gradient-to-r from-destructive/10 to-warning/10">
            <p className="text-sm text-muted-foreground">
              Verifica que el código QR sea válido o intenta nuevamente
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!experience.assets || experience.assets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 text-center max-w-md w-full">
          <div className="relative mb-6">
            <div className="text-6xl mb-4 animate-pulse">�</div>
            <div className="absolute inset-0 bg-gradient-to-r from-warning/20 to-accent/20 rounded-full blur-xl opacity-50"></div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Contenido en preparación
          </h1>
          <p className="text-muted-foreground mb-4">
            Esta experiencia aún no tiene contenido disponible
          </p>
          <div className="glass-strong rounded-xl p-3 bg-gradient-to-r from-warning/10 to-accent/10">
            <p className="text-sm text-muted-foreground">
              ¡Pronto estará listo para disfrutar! 🚀
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentAsset = experience.assets[currentAssetIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="glass rounded-2xl p-6 mb-6 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center justify-center mb-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse mr-2"></div>
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Experiencia AR
              </span>
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse ml-2"></div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {experience.title}
            </h1>
            {experience.description && (
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {experience.description}
              </p>
            )}
          </div>
        </div>

        {/* AR Viewer */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* AR Viewer Container */}
            <div className="glass rounded-3xl p-6 bg-gradient-to-br from-surface/20 to-surface-elevated/20">
              <ARViewer asset={currentAsset} onTrackEvent={trackEvent} />
            </div>

            {/* Asset Navigation */}
            {experience.assets.length > 1 && (
              <div className="glass rounded-2xl p-4 bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center justify-center space-x-6">
                  <button
                    onClick={() => {
                      const newIndex =
                        currentAssetIndex > 0
                          ? currentAssetIndex - 1
                          : experience.assets.length - 1;
                      setCurrentAssetIndex(newIndex);
                      trackEvent("asset_navigation", `previous_to_${newIndex}`);
                    }}
                    className="ar-navigation-button group relative"
                    aria-label="Contenido anterior"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      ◀
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  <div className="glass-strong rounded-xl px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10">
                    <div className="text-white text-sm font-medium text-center">
                      <span className="text-primary">
                        {currentAssetIndex + 1}
                      </span>
                      <span className="text-muted-foreground mx-2">de</span>
                      <span className="text-primary">
                        {experience.assets.length}
                      </span>
                    </div>
                    <div className="flex justify-center mt-1 space-x-1">
                      {experience.assets.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            index === currentAssetIndex
                              ? "bg-primary shadow-lg shadow-primary/50"
                              : "bg-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
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
                    className="ar-navigation-button group relative"
                    aria-label="Contenido siguiente"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      ▶
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            )}

            {/* Asset Info */}
            <div className="glass rounded-2xl p-6 text-center bg-gradient-to-r from-surface/10 to-surface-elevated/10">
              <div className="flex items-center justify-center mb-3">
                <span className="text-2xl mr-2">
                  {currentAsset.kind === "model3d"
                    ? "🎯"
                    : currentAsset.kind === "image"
                    ? "🖼️"
                    : currentAsset.kind === "video"
                    ? "🎬"
                    : "💬"}
                </span>
                <div className="glass-strong rounded-full px-3 py-1 text-xs font-medium text-primary bg-primary/10">
                  {currentAsset.kind === "model3d"
                    ? "Modelo 3D"
                    : currentAsset.kind === "image"
                    ? "Imagen"
                    : currentAsset.kind === "video"
                    ? "Video"
                    : "Mensaje"}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {currentAsset.name}
              </h3>
              <p className="text-muted-foreground text-sm">
                {experience.title}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="glass rounded-2xl p-6 bg-gradient-to-br from-success/5 to-primary/5">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl mr-2">📱</span>
              <h3 className="text-lg font-semibold text-white">
                Cómo usar la experiencia AR
              </h3>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="flex items-start space-x-3 glass-strong rounded-xl p-3 bg-success/10">
                <span className="text-success font-bold">1.</span>
                <p className="text-muted-foreground">
                  Presiona{" "}
                  <span className="text-primary font-medium">"Ver en AR"</span>{" "}
                  para activar la cámara
                </p>
              </div>
              <div className="flex items-start space-x-3 glass-strong rounded-xl p-3 bg-primary/10">
                <span className="text-primary font-bold">2.</span>
                <p className="text-muted-foreground">
                  Permite el acceso a la cámara cuando se solicite
                </p>
              </div>
              <div className="flex items-start space-x-3 glass-strong rounded-xl p-3 bg-accent/10">
                <span className="text-accent font-bold">3.</span>
                <p className="text-muted-foreground">
                  Mueve el dispositivo para explorar el contenido en AR
                </p>
              </div>
              {experience.assets.length > 1 && (
                <div className="flex items-start space-x-3 glass-strong rounded-xl p-3 bg-warning/10">
                  <span className="text-warning font-bold">4.</span>
                  <p className="text-muted-foreground">
                    Usa las flechas para navegar entre contenidos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="glass rounded-xl p-4 bg-gradient-to-r from-brand/5 to-qr/5 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">⚡</span>
              <p className="text-muted-foreground text-sm font-medium">
                Powered by <span className="text-primary">QR AR Platform</span>
              </p>
              <span className="text-lg">🚀</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
