"use client";

/**
 * Mobile AR Viewer
 * Uses model-viewer for native AR on mobile devices
 * Supports: WebXR (Android Chrome), Scene Viewer (Android), Quick Look (iOS)
 */

import { Asset, Experience } from "@/types";
import "@/types/model-viewer";
import { useEffect, useState } from "react";

interface MobileARViewerProps {
  experience: Experience;
  currentAssetIndex?: number;
  onAssetChange?: (index: number) => void;
  onBack?: () => void;
}

export default function MobileARViewer({
  experience,
  currentAssetIndex = 0,
  onAssetChange,
  onBack,
}: MobileARViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(currentAssetIndex);
  const [isModelViewerLoaded, setIsModelViewerLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

  // Load model-viewer library
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.onload = () => setIsModelViewerLoaded(true);
    script.onerror = () => setError("Failed to load AR library");
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const selectedAsset = experience.assets[selectedIndex];

  const handleNext = () => {
    const nextIndex = (selectedIndex + 1) % experience.assets.length;
    setSelectedIndex(nextIndex);
    onAssetChange?.(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex =
      selectedIndex === 0 ? experience.assets.length - 1 : selectedIndex - 1;
    setSelectedIndex(prevIndex);
    onAssetChange?.(prevIndex);
  };

  const getAssetUrl = (asset: Asset): string => {
    if (!asset.assetUrl) return "";

    if (
      asset.assetUrl.startsWith("http://") ||
      asset.assetUrl.startsWith("https://")
    ) {
      return asset.assetUrl;
    }

    if (asset.assetUrl.startsWith("/")) {
      return `${baseApiUrl}${asset.assetUrl}`;
    }

    return `${baseApiUrl}/${asset.assetUrl}`;
  };

  const renderAsset = (asset: Asset) => {
    const assetUrl = getAssetUrl(asset);

    switch (asset.assetType) {
      case "model3d":
        if (!isModelViewerLoaded) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Cargando visor AR...</p>
              </div>
            </div>
          );
        }

        return (
          <model-viewer
            src={assetUrl}
            alt={asset.name}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            touch-action="pan-y"
            environment-image="neutral"
            shadow-intensity="1"
            auto-rotate
            auto-rotate-delay="0"
            rotation-per-second="30deg"
            className="w-full h-full"
          >
            <div slot="ar-button" className="hidden"></div>
          </model-viewer>
        );

      case "image":
        return (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={assetUrl}
              alt={asset.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        );

      case "video":
        return (
          <div className="flex items-center justify-center h-full p-4">
            <video
              src={assetUrl}
              controls
              autoPlay
              loop
              playsInline
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
          </div>
        );

      case "message":
        return (
          <div className="flex items-center justify-center h-full p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl">
              <div className="text-4xl mb-4 text-center">💬</div>
              <h3 className="text-white text-2xl font-bold mb-4 text-center">
                {asset.name}
              </h3>
              <p className="text-white/90 text-lg leading-relaxed text-center">
                {asset.assetContent}
              </p>
            </div>
          </div>
        );

      case "webcontent":
        return (
          <div className="flex items-center justify-center h-full p-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl">
              <div className="text-4xl mb-4 text-center">🌐</div>
              <h3 className="text-white text-2xl font-bold mb-4 text-center">
                {asset.name}
              </h3>
              {asset.assetUrl && (
                <a
                  href={asset.assetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 underline text-lg block text-center"
                >
                  Abrir enlace →
                </a>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-white">Tipo de asset no soportado</p>
          </div>
        );
    }
  };

  const canShowARButton =
    selectedAsset?.assetType === "model3d" && isModelViewerLoaded;

  const activateAR = () => {
    // Find the model-viewer element and activate AR
    const modelViewer = document.querySelector("model-viewer");
    if (modelViewer && (modelViewer as any).activateAR) {
      (modelViewer as any).activateAR();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <h2 className="text-2xl font-bold mb-4">❌ Error</h2>
          <p className="text-red-200 mb-8">{error}</p>
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-bold"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Asset Display */}
      <div className="absolute inset-0">{renderAsset(selectedAsset)}</div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-bold">Volver</span>
          </button>

          <div className="text-right text-white">
            <h2 className="text-xl font-bold">{experience.title}</h2>
            <p className="text-sm text-blue-200">
              {selectedIndex + 1} / {experience.assets.length}
            </p>
          </div>
        </div>
      </div>

      {/* AR Button (for 3D models) */}
      {canShowARButton && (
        <button
          onClick={activateAR}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl flex items-center gap-3 z-20 animate-pulse hover:animate-none transition-all"
        >
          <span className="text-2xl">📱</span>
          <span>Ver en AR</span>
        </button>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10">
        {/* Asset Info */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
          <h3 className="text-white font-bold text-lg mb-1">
            {selectedAsset.name}
          </h3>
          <p className="text-blue-200 text-sm capitalize">
            {selectedAsset.assetType.replace("3d", " 3D")}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={experience.assets.length <= 1}
            className="bg-white/20 hover:bg-white/30 backdrop-blur text-white p-4 rounded-full transition-colors disabled:opacity-50"
            aria-label="Asset anterior"
            title="Asset anterior"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex gap-2">
            {experience.assets.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedIndex(index);
                  onAssetChange?.(index);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === selectedIndex
                    ? "bg-white scale-125"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Ir al asset ${index + 1}`}
                title={`Ir al asset ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={experience.assets.length <= 1}
            className="bg-white/20 hover:bg-white/30 backdrop-blur text-white p-4 rounded-full transition-colors disabled:opacity-50"
            aria-label="Siguiente asset"
            title="Siguiente asset"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Instructions for AR */}
      {canShowARButton && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 max-w-xs">
          <div className="bg-black/60 backdrop-blur text-white text-xs px-3 py-2 rounded-lg">
            <p className="font-bold mb-1">📱 AR Disponible</p>
            <p>
              Toca el botón "Ver en AR" para ver este modelo en tu espacio real
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
