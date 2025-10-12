"use client";

import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { Experience } from "@/types";
import { useEffect, useRef, useState } from "react";

interface ArOverlayProps {
  experience: Experience;
  currentAssetIndex: number;
  onAssetChange: (index: number) => void;
  onBack: () => void;
  className?: string;
}

export function ArOverlay({
  experience,
  currentAssetIndex,
  onAssetChange,
  onBack,
  className = "",
}: ArOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide UI after inactivity
  useEffect(() => {
    const resetTimer = () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000); // Hide after 5 seconds

      autoHideTimerRef.current = timer;
    };

    // Reset timer on user interaction
    const handleUserActivity = () => {
      setIsVisible(true);
      resetTimer();
    };

    // Initial setup
    setIsVisible(true);
    resetTimer();

    window.addEventListener("mousedown", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);

    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
      window.removeEventListener("mousedown", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, []); // Empty dependency array - only run once on mount

  const currentAsset = experience.assets[currentAssetIndex];

  return (
    <div className={`ar-overlay ${className}`}>
      {/* Top overlay - Back button and title */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full"
        }`}
      >
        <div className="glass m-4 p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="ar-navigation-button flex items-center space-x-2"
            aria-label="Volver"
          >
            <span>←</span>
            <span className="hidden sm:inline">Volver</span>
          </button>

          <div className="text-center flex-1 mx-4">
            <h1 className="text-lg font-semibold text-white">
              {experience.title}
            </h1>
          </div>

          <div className="ar-navigation-button px-3 py-1 text-sm">
            {currentAssetIndex + 1} / {experience.assets.length}
          </div>
        </div>
      </div>

      {/* Bottom overlay - Asset info and controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
        }`}
      >
        <div className="glass m-4 p-4">
          {/* Asset navigation for multiple assets */}
          {experience.assets.length > 1 && (
            <div className="flex justify-center mb-4 space-x-4">
              <button
                onClick={() => {
                  const newIndex =
                    currentAssetIndex > 0
                      ? currentAssetIndex - 1
                      : experience.assets.length - 1;
                  onAssetChange(newIndex);
                }}
                className="ar-navigation-button"
                aria-label="Anterior"
              >
                ◀
              </button>

              <div className="flex items-center space-x-1">
                {experience.assets.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onAssetChange(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentAssetIndex
                        ? "bg-primary shadow-lg shadow-primary/50 scale-150"
                        : "bg-white/30 hover:bg-white/60"
                    }`}
                    aria-label={`Asset ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  const newIndex =
                    currentAssetIndex < experience.assets.length - 1
                      ? currentAssetIndex + 1
                      : 0;
                  onAssetChange(newIndex);
                }}
                className="ar-navigation-button"
                aria-label="Siguiente"
              >
                ▶
              </button>
            </div>
          )}

          {/* Asset information */}
          {currentAsset && (
            <div className="text-center text-white">
              <h3 className="text-lg font-medium mb-2">{currentAsset.name}</h3>

              {currentAsset.assetType === "message" &&
                currentAsset.assetContent && (
                  <p className="text-blue-200 text-sm leading-relaxed max-w-md mx-auto">
                    {currentAsset.assetContent}
                  </p>
                )}

              <div className="text-xs text-white/60 mt-2">
                Tipo: {getAssetTypeDisplayName(currentAsset.assetType)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side controls - Show/hide overlay toggle */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="ar-navigation-button w-12 h-12 flex items-center justify-center"
          aria-label={isVisible ? "Ocultar controles" : "Mostrar controles"}
        >
          <QuickArLogo
            size={16}
            className={isVisible ? "opacity-100" : "opacity-50"}
          />
        </button>
      </div>

      {/* Instructions overlay for first-time users */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <div
          className={`glass p-6 max-w-sm text-center transition-opacity duration-1000 ${
            isVisible ? "opacity-70" : "opacity-0"
          }`}
        >
          <div className="text-white/80 text-sm space-y-2">
            <div className="text-2xl mb-3">👋</div>
            <div>Arrastra para rotar el objeto</div>
            {experience.assets.length > 1 && (
              <div>Usa los controles para cambiar contenido</div>
            )}
            <div className="text-xs text-white/60 mt-3">
              Los controles se ocultan automáticamente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAssetTypeDisplayName(assetType: string): string {
  const displayNames: Record<string, string> = {
    message: "Mensaje",
    video: "Video",
    image: "Imagen",
    model3d: "Modelo 3D",
  };

  return displayNames[assetType] || assetType;
}
