"use client";

import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { trackAnalyticsEvent } from "@/lib/api/experiences";
import { useWebXR } from "@/lib/webxr";
import { Experience } from "@/types";
import { useEffect, useState } from "react";
import { ArOverlay } from "./ArOverlay";
import { CameraAR } from "./CameraAR";
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
  const [arMode, setArMode] = useState<"cube" | "camera" | "webxr">("cube");

  const webXRCapabilities = useWebXR();

  // Initialize AR session and determine mode
  useEffect(() => {
    const initializeAR = async () => {
      try {
        setIsLoading(true);

        console.log("🚀 Initializing AR Experience:", {
          experienceId: experience.id,
          assetCount: experience.assets.length,
          assets: experience.assets.map((a) => ({
            type: a.assetType,
            url: a.assetUrl,
            name: a.name,
          })),
        });

        // Track experience view
        await trackAnalyticsEvent("experience_view", experience.id, {
          assetCount: experience.assets.length,
        });

        // Log WebXR capabilities
        console.log("🔍 WebXR Capabilities:", webXRCapabilities);

        // Determine the best AR mode based on capabilities
        let selectedMode: "cube" | "camera" | "webxr" = "cube";

        if (webXRCapabilities.hasImmersiveAR) {
          selectedMode = "webxr";
          console.log("✅ Using WebXR AR mode");
        } else if (
          webXRCapabilities.isMobile &&
          webXRCapabilities.canShowCameraFeed
        ) {
          console.log("📱 Using Camera AR mode for mobile");
          selectedMode = "camera";
        } else {
          console.log("🖥️ Using Cube AR mode (fallback)");
        }

        setArMode(selectedMode);
        console.log("🎯 AR Mode selected:", selectedMode);

        // Simulate AR initialization
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsLoading(false);
        console.log("🎉 AR initialization complete");
      } catch (err) {
        console.error("❌ AR initialization failed:", err);
        setError(err instanceof Error ? err.message : "Error inicializando AR");
        setIsLoading(false);
      }
    };

    initializeAR();
  }, [experience.id, experience.assets.length, webXRCapabilities]);

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
          <div className="flex justify-center mb-6">
            <QuickArLogo className="w-16 h-16 animate-ar-pulse" size={64} />
          </div>
          <div className="text-xl font-semibold mb-2">
            Iniciando experiencia AR
          </div>
          <div className="text-sm text-blue-200">
            Preparando {experience.title}...
          </div>

          {/* Loading progress */}
          <div className="mt-6 w-64 mx-auto">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent h-full rounded-full animate-ar-float w-full" />
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
          <div className="flex justify-center mb-6">
            <QuickArLogo className="w-16 h-16 opacity-50" size={64} />
          </div>
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

  // Render camera AR mode for mobile devices
  if (arMode === "camera") {
    return (
      <CameraAR
        experience={experience}
        currentAssetIndex={currentAssetIndex}
        onAssetChange={handleAssetChange}
        onBack={onBack}
        className={className}
      />
    );
  }

  // TODO: Implement WebXR mode for arMode === 'webxr'

  // Fallback to cube mode (desktop and unsupported devices)
  return (
    <div
      className={`ar-container bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 relative overflow-hidden ${className}`}
    >
      {/* AR Scene - Main content layer */}
      <div className="ar-scene flex items-center justify-center min-h-screen p-4 relative z-10">
        <ExperienceCube
          experience={experience}
          currentAssetIndex={currentAssetIndex}
          onAssetChange={handleAssetChange}
          className="w-full max-w-4xl mx-auto"
        />
      </div>

      {/* AR Overlay UI - Top overlay layer */}
      <ArOverlay
        experience={experience}
        currentAssetIndex={currentAssetIndex}
        onAssetChange={handleAssetChange}
        onBack={onBack}
        className="z-20"
      />

      {/* Control buttons layer - Above overlay but below modals */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {/* AR Mode Toggle */}
        {webXRCapabilities.isMobile && webXRCapabilities.canShowCameraFeed && (
          <button
            onClick={() => setArMode(arMode === "cube" ? "camera" : "cube")}
            className="absolute top-4 right-4 ar-navigation-button pointer-events-auto text-sm"
            title={arMode === "cube" ? "Activar cámara AR" : "Modo cubo 3D"}
          >
            {arMode === "cube" ? "📱" : "🎲"}
          </button>
        )}

        {/* Fullscreen toggle (desktop only) */}
        {!webXRCapabilities.isMobile && (
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-4 right-4 ar-navigation-button pointer-events-auto"
            title={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
          >
            {isFullscreen ? "🗗" : "⛶"}
          </button>
        )}

        {/* Keyboard shortcuts help */}
        <div className="absolute bottom-4 left-4 glass p-2 text-xs text-white/60 max-w-xs pointer-events-auto">
          <div className="space-y-1">
            <div>← → Navegación</div>
            <div>ESC Salir</div>
            {webXRCapabilities.isMobile && (
              <div>📱 Toca para cambiar modo AR</div>
            )}
            {!webXRCapabilities.isMobile && <div>Ctrl+F Pantalla completa</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
