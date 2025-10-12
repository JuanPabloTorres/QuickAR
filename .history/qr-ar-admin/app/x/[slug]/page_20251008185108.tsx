"use client";

import { ExperienceCube } from "@/components/ExperienceCube";
import { apiClient } from "@/lib/api";
import { ExperienceDto } from "@/types";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ARExperiencePage() {
  const params = useParams();
  const [experience, setExperience] = useState<ExperienceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

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

            {/* Asset Info */}

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
          </div>
        </div>

        {/* AR Viewer */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* AR Viewer Container */}
            <div className="glass rounded-3xl p-6 bg-gradient-to-br from-surface/20 to-surface-elevated/20">
              <div className="flex justify-center items-center min-h-[400px] relative perspective-container preserve-3d-container">
                <ExperienceCube
                  assetType={currentAsset.kind === "message" ? "text" : currentAsset.kind as any}
                  assetUrl={currentAsset.url || undefined}
                  assetContent={currentAsset.text || undefined}
                  alt={currentAsset.name}
                  enableAR={true}
                  size={350}
                  className="mx-auto no-overflow-hidden"
                />
              </div>
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
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="glass rounded-3xl p-8 bg-gradient-to-br from-success/10 to-primary/10 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

            {/* Header */}
            <div className="relative text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4 p-3 glass-strong rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20">
                <div className="relative">
                  <span className="text-3xl animate-bounce">📱</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-lg animate-ping opacity-50"></div>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-primary/90 to-accent/90 bg-clip-text text-transparent">
                Cómo usar la experiencia AR
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto opacity-60"></div>
            </div>

            {/* Instructions Grid */}
            <div className="relative grid gap-4 text-base">
              <div className="group flex items-start space-x-4 glass-strong rounded-2xl p-4 bg-gradient-to-r from-success/15 to-success/5 hover:from-success/20 hover:to-success/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-success/10">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-success to-success/80 text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-200 leading-relaxed">
                    Presiona{" "}
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-primary/20 text-primary font-semibold text-sm border border-primary/30">
                      "Ver en AR"
                    </span>{" "}
                    para activar la cámara
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-4 glass-strong rounded-2xl p-4 bg-gradient-to-r from-primary/15 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-200 leading-relaxed">
                    Permite el acceso a la{" "}
                    <span className="text-primary font-semibold">cámara</span>{" "}
                    cuando se solicite
                  </p>
                </div>
              </div>

              <div className="group flex items-start space-x-4 glass-strong rounded-2xl p-4 bg-gradient-to-r from-accent/15 to-accent/5 hover:from-accent/20 hover:to-accent/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent/80 text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-200 leading-relaxed">
                    Mueve el{" "}
                    <span className="text-accent font-semibold">
                      dispositivo
                    </span>{" "}
                    para explorar el contenido en AR
                  </p>
                </div>
              </div>

              {experience.assets.length > 1 && (
                <div className="group flex items-start space-x-4 glass-strong rounded-2xl p-4 bg-gradient-to-r from-warning/15 to-warning/5 hover:from-warning/20 hover:to-warning/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-warning/10">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-warning to-warning/80 text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                    4
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-200 leading-relaxed">
                      Usa las{" "}
                      <span className="inline-flex items-center space-x-1">
                        <span className="text-warning font-semibold">
                          flechas
                        </span>
                        <span className="text-xs">◀ ▶</span>
                      </span>{" "}
                      para navegar entre contenidos
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Tip */}
            <div className="relative mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center space-x-2 text-center">
                <span className="text-lg">✨</span>
                <p className="text-sm text-gray-300 font-medium">
                  Consejo: Mantén el dispositivo estable para una mejor
                  experiencia
                </p>
                <span className="text-lg">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
