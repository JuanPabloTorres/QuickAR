/**
 * Quick AR Viewer Component
 * Main AR viewer that integrates FunctionalARViewer with enhanced UI and controls
 * Provides the complete Quick AR experience with camera, object manipulation, and asset switching
 */

"use client";

import { Experience } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import FunctionalARViewer from "./FunctionalARViewer";

interface ARCapabilities {
  webxr: boolean;
  hitTest: boolean;
  lightEstimation: boolean;
  planeDetection: boolean;
  anchoredObjects: boolean;
  camera: boolean;
  deviceMotion: boolean;
  geolocation: boolean;
}

interface QuickARViewerProps {
  experience: Experience;
  currentAssetIndex: number;
  onAssetChange: (index: number) => void;
  onExitAR: () => void;
  onError: (error: string) => void;
  arCapabilities: ARCapabilities;
}

const QuickARViewer: React.FC<QuickARViewerProps> = ({
  experience,
  currentAssetIndex,
  onAssetChange,
  onExitAR,
  onError,
  arCapabilities,
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isPlacementMode, setIsPlacementMode] = useState(true);
  const [objectsPlaced, setObjectsPlaced] = useState(0);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current asset
  const currentAsset = experience.assets[currentAssetIndex];

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Show controls when user interacts
  const handleUserInteraction = () => {
    setShowControls(true);
  };

  // Handle AR initialization complete
  const handleARReady = () => {
    setIsInitializing(false);
  };

  // Handle AR errors
  const handleARError = (error: string) => {
    console.error("AR Error:", error);
    onError(error);
  };

  // Handle asset switching
  const handleAssetSwitch = (direction: "prev" | "next") => {
    const totalAssets = experience.assets.length;
    if (totalAssets <= 1) return;

    let newIndex;
    if (direction === "prev") {
      newIndex =
        currentAssetIndex > 0 ? currentAssetIndex - 1 : totalAssets - 1;
    } else {
      newIndex =
        currentAssetIndex < totalAssets - 1 ? currentAssetIndex + 1 : 0;
    }

    onAssetChange(newIndex);
  };

  // Asset type icon mapping
  const getAssetIcon = (assetType: string, className: string = "w-5 h-5") => {
    switch (assetType) {
      case "model3d":
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      case "image":
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "video":
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      case "message":
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      case "webcontent":
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden"
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      {/* Functional AR Viewer */}
      <FunctionalARViewer
        key={`ar-viewer-${currentAsset.id}-${currentAssetIndex}`}
        asset={currentAsset}
        onARStart={handleARReady}
        onAREnd={onExitAR}
        onError={handleARError}
      />

      {/* Initialization overlay */}
      {isInitializing && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="text-center text-white">
            <div className="text-6xl mb-4 animate-bounce">📱</div>
            <div className="text-xl font-semibold mb-2">Iniciando AR...</div>
            <div className="text-sm text-blue-200">
              Preparando cámara y sensores
            </div>
          </div>
        </div>
      )}

      {/* AR Controls Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto z-30">
          {/* Exit button */}
          <button
            onClick={onExitAR}
            className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            ← Salir
          </button>

          {/* Experience title */}
          <div className="glass px-4 py-2 rounded-lg backdrop-blur-sm">
            <div className="text-white text-sm font-medium truncate max-w-40">
              {experience.title}
            </div>
          </div>

          {/* Asset selector toggle */}
          {experience.assets.length > 1 && (
            <button
              onClick={() => setShowAssetSelector(!showAssetSelector)}
              className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <div className="text-lg">
                {getAssetIcon(currentAsset.assetType)}
              </div>
            </button>
          )}
        </div>

        {/* Current Asset Info */}
        <div className="absolute top-20 left-4 right-4 pointer-events-auto z-30">
          <div className="glass p-3 rounded-lg backdrop-blur-sm max-w-xs">
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">
                  {getAssetIcon(currentAsset.assetType)}
                </span>
                <span className="text-sm font-medium">{currentAsset.name}</span>
              </div>
              {currentAsset.assetContent && (
                <div className="text-xs text-blue-200/80">
                  {currentAsset.assetContent.length > 50
                    ? `${currentAsset.assetContent.substring(0, 50)}...`
                    : currentAsset.assetContent}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Placement Guide */}
        {isPlacementMode && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-2 border-white/60 border-dashed rounded-full animate-pulse mb-2 mx-auto"></div>
              <div className="glass px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="text-sm font-medium">Toca para colocar</div>
                <div className="text-xs text-blue-200">{currentAsset.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto z-30">
          {/* Asset Navigation */}
          {experience.assets.length > 1 && (
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-4 glass px-4 py-2 rounded-lg backdrop-blur-sm">
                <button
                  onClick={() => handleAssetSwitch("prev")}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                >
                  <span className="text-white text-lg">←</span>
                </button>

                <div className="text-white text-sm">
                  {currentAssetIndex + 1} / {experience.assets.length}
                </div>

                <button
                  onClick={() => handleAssetSwitch("next")}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                >
                  <span className="text-white text-lg">→</span>
                </button>
              </div>
            </div>
          )}

          {/* AR Status and Stats */}
          <div className="flex justify-between items-center">
            <div className="glass p-2 rounded-lg backdrop-blur-sm">
              <div className="text-white text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-green-400">●</span>
                  <span>AR Activo</span>
                </div>
                {objectsPlaced > 0 && (
                  <div className="text-blue-200/70">
                    {objectsPlaced} objeto{objectsPlaced !== 1 ? "s" : ""}{" "}
                    colocado{objectsPlaced !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>

            {/* AR Capabilities indicator */}
            <div className="glass p-2 rounded-lg backdrop-blur-sm">
              <div className="flex items-center space-x-1 text-xs text-white">
                {arCapabilities.webxr && (
                  <span className="text-green-400">🥽</span>
                )}
                {arCapabilities.hitTest && (
                  <span className="text-blue-400">🎯</span>
                )}
                {arCapabilities.camera && (
                  <span className="text-yellow-400">📷</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Selector Overlay */}
      {showAssetSelector && experience.assets.length > 1 && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass p-6 rounded-lg max-w-sm mx-4 backdrop-blur-sm">
            <div className="text-white text-center">
              <div className="text-lg font-semibold mb-4">
                Seleccionar Contenido
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {experience.assets.map((asset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onAssetChange(index);
                      setShowAssetSelector(false);
                    }}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      index === currentAssetIndex
                        ? "bg-blue-500/30 ring-2 ring-blue-400"
                        : "glass hover:bg-white/10"
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {getAssetIcon(asset.assetType)}
                    </div>
                    <div className="text-xs truncate">{asset.name}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAssetSelector(false)}
                className="w-full glass p-2 rounded text-white hover:bg-white/20 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick AR watermark */}
      <div className="absolute bottom-2 right-4 text-xs text-white/30 pointer-events-none z-10">
        Quick AR
      </div>
    </div>
  );
};

export default QuickARViewer;
