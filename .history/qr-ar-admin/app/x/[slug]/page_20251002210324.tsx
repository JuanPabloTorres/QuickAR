"use client";

import { apiClient } from "@/lib/api";
import { ExperienceDto } from "@/types";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Dynamic import of AR components with SSR disabled
const ARViewer = dynamic(() => import("@/src/components/ui/ARViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
      </div>
    </div>
  ),
});

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-pulse">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              ✨
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Preparando la magia...
            </h2>
            <p className="text-white/80 text-sm">
              Tu experiencia AR está por comenzar
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-7xl">🔍</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-400 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">
              ¡Oops! No encontramos eso
            </h1>
            <p className="text-white/90 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!experience.assets || experience.assets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center shadow-2xl mx-auto">
            <span className="text-7xl">📦</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">
              Contenido en camino
            </h1>
            <p className="text-white/90 text-lg">
              Esta experiencia aún no tiene contenido disponible
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentAsset = experience.assets[currentAssetIndex];

  const getAssetIcon = (kind: string) => {
    switch (kind) {
      case "model3d":
        return "🎨";
      case "image":
        return "🖼️";
      case "video":
        return "🎬";
      default:
        return "💬";
    }
  };

  const getAssetLabel = (kind: string) => {
    switch (kind) {
      case "model3d":
        return "Modelo 3D";
      case "image":
        return "Imagen";
      case "video":
        return "Video";
      default:
        return "Mensaje";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10 relative z-10">
        {/* Header with floating animation */}
        <div className="text-center mb-8 space-y-4 animate-fade-in">
          <div className="inline-block">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 mb-3">
              <span className="text-white/90 text-sm font-medium">
                Experiencia AR
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            {experience.title}
          </h1>
          {experience.description && (
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {experience.description}
            </p>
          )}
        </div>

        {/* Main AR Viewer Card */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* AR Viewer with modern card design */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl overflow-hidden">
                <ARViewer asset={currentAsset} onTrackEvent={trackEvent} />
              </div>
            </div>

            {/* Asset Info Card with floating effect */}
            <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 transform hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    {getAssetIcon(currentAsset.kind)}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {currentAsset.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-white/80">
                      <span>{getAssetLabel(currentAsset.kind)}</span>
                      <span>•</span>
                      <span>{experience.title}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation with modern design */}
            {experience.assets.length > 1 && (
              <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      const newIndex =
                        currentAssetIndex > 0
                          ? currentAssetIndex - 1
                          : experience.assets.length - 1;
                      setCurrentAssetIndex(newIndex);
                      trackEvent("asset_navigation", `previous_to_${newIndex}`);
                    }}
                    className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center text-white text-xl font-bold transition-all transform hover:scale-110 active:scale-95 shadow-lg"
                    aria-label="Contenido anterior"
                  >
                    ←
                  </button>

                  <div className="flex items-center space-x-3">
                    {experience.assets.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentAssetIndex(idx);
                          trackEvent("asset_navigation", `jump_to_${idx}`);
                        }}
                        className={`transition-all ${
                          idx === currentAssetIndex
                            ? "w-12 h-3 bg-white rounded-full"
                            : "w-3 h-3 bg-white/40 rounded-full hover:bg-white/60"
                        }`}
                        aria-label={`Ir al contenido ${idx + 1}`}
                      />
                    ))}
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
                    className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center text-white text-xl font-bold transition-all transform hover:scale-110 active:scale-95 shadow-lg"
                    aria-label="Contenido siguiente"
                  >
                    →
                  </button>
                </div>

                <div className="text-center mt-4">
                  <span className="text-white/80 text-sm font-medium">
                    {currentAssetIndex + 1} de {experience.assets.length}
                  </span>
                </div>
              </div>
            )}

            {/* Instructions with fun design */}
            <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <span className="text-3xl">👋</span>
                <h3 className="text-2xl font-bold text-white">
                  ¿Cómo funciona?
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: "📸",
                    text: 'Presiona "Ver en AR" para activar la cámara',
                  },
                  { icon: "✅", text: "Permite el acceso cuando se solicite" },
                  { icon: "📱", text: "Mueve tu dispositivo para explorar" },
                  {
                    icon: "🎯",
                    text: "Navega entre contenidos con las flechas",
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 bg-white/10 rounded-2xl p-4 hover:bg-white/15 transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">{step.icon}</span>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with modern styling */}
        <div className="mt-12 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3">
            <span className="text-xl">⚡</span>
            <p className="text-white/90 text-sm font-medium">
              Powered by QR AR Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
