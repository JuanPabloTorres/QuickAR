"use client";

import { trackAnalyticsEvent } from "@/lib/api/experiences";
import { Experience } from "@/types";
import { useEffect, useState } from "react";
import { ArOverlay } from "./ArOverlay";
import { ExperienceCube } from "./ExperienceCube";

interface ArClientProps {
  experience: Experience;
  onBack: () => void;
  className?: string;
}

export function ArClient({
  experience,
  onBack,
  className = "",
}: ArClientProps) {
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize AR session
  useEffect(() => {
    const initializeAR = async () => {
      try {
        setIsLoading(true);

        // Track experience view
        await trackAnalyticsEvent("experience_view", experience.id, {
          assetCount: experience.assets.length,
        });

        // Simulate AR initialization
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inicializando AR");
        setIsLoading(false);
      }
    };

    initializeAR();
  }, [experience.id, experience.assets.length]);

  // Handle asset change
  const handleAssetChange = async (newIndex: number) => {
    if (newIndex >= 0 && newIndex < experience.assets.length) {
      const previousIndex = currentAssetIndex;
      setCurrentAssetIndex(newIndex);

      // Track asset navigation
      await trackAnalyticsEvent("asset_navigation", experience.id, {
        from: previousIndex,
        to: newIndex,
        assetId: experience.assets[newIndex].id,
        assetType: experience.assets[newIndex].assetType,
      });
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen not supported or failed:", err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handleAssetChange(
            currentAssetIndex > 0
              ? currentAssetIndex - 1
              : experience.assets.length - 1
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          handleAssetChange(
            currentAssetIndex < experience.assets.length - 1
              ? currentAssetIndex + 1
              : 0
          );
          break;
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else {
            onBack();
          }
          break;
        case "f":
        case "F":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentAssetIndex, experience.assets.length, isFullscreen, onBack]);

  if (isLoading) {
    return (
      <div
        className={`ar-container bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center ${className}`}
      >
        <div className="text-center text-white">
          <div className="animate-ar-pulse text-6xl mb-6">🔄</div>
          <div className="text-xl font-semibold mb-2">
            Iniciando experiencia AR
          </div>
          <div className="text-sm text-blue-200">
            Preparando {experience.title}...
          </div>

          {/* Loading progress */}
          <div className="mt-6 w-64 mx-auto">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-accent h-full rounded-full animate-ar-float"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`ar-container bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center ${className}`}
      >
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-xl font-semibold mb-4">
            Error en la experiencia AR
          </div>
          <div className="text-sm text-red-200 mb-6">{error}</div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 1000);
              }}
              className="ar-navigation-button w-full py-3"
            >
              🔄 Intentar de nuevo
            </button>

            <button
              onClick={onBack}
              className="ar-navigation-button w-full py-3"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ar-container bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 ${className}`}
    >
      {/* AR Scene */}
      <div className="ar-scene flex items-center justify-center min-h-screen p-4">
        <ExperienceCube
          experience={experience}
          currentAssetIndex={currentAssetIndex}
          onAssetChange={handleAssetChange}
          className="max-w-4xl mx-auto"
        />
      </div>

      {/* AR Overlay UI */}
      <ArOverlay
        experience={experience}
        currentAssetIndex={currentAssetIndex}
        onAssetChange={handleAssetChange}
        onBack={onBack}
      />

      {/* Fullscreen toggle (desktop only) */}
      {!("ontouchstart" in window) && (
        <button
          onClick={toggleFullscreen}
          className="fixed bottom-4 right-4 ar-navigation-button z-40"
          title={
            isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
          }
        >
          {isFullscreen ? "🗗" : "⛶"}
        </button>
      )}

      {/* Keyboard shortcuts help */}
      <div className="fixed bottom-4 left-4 glass p-2 text-xs text-white/60 max-w-xs z-40">
        <div className="space-y-1">
          <div>← → Navegación</div>
          <div>ESC Salir</div>
          {!("ontouchstart" in window) && <div>Ctrl+F Pantalla completa</div>}
        </div>
      </div>
    </div>
  );
}
