/**
 * Enhanced AR Canvas Component
 * Universal asset viewer with full AR support
 */

"use client";

import { Asset, Experience } from "@/types";
import { useEffect, useState } from "react";
import { UniversalAssetViewer } from "./UniversalAssetViewer";

interface SimpleARCanvasProps {
  experience: Experience;
  className?: string;
  onPerformanceChange?: (performance: any) => void;
  currentAssetIndex?: number;
  onAssetChange?: (index: number) => void;
}

// Enhanced AR Scene Component
function EnhancedARScene({
  experience,
  currentAssetIndex = 0,
  onPerformanceChange,
}: {
  experience: Experience;
  currentAssetIndex: number;
  onPerformanceChange?: (performance: any) => void;
}) {
  const [isARActive, setIsARActive] = useState(false);
  const [arSupported, setARSupported] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);

  // Get current asset
  useEffect(() => {
    if (experience.assets && experience.assets.length > 0) {
      const asset =
        experience.assets[
          Math.min(currentAssetIndex, experience.assets.length - 1)
        ];
      setCurrentAsset(asset);
      console.log("� Current asset changed:", asset.name, asset.assetType);
    }
  }, [experience.assets, currentAssetIndex]);

  // Check AR support
  useEffect(() => {
    const checkARSupport = async () => {
      if (typeof navigator !== "undefined" && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported(
            "immersive-ar"
          );
          setARSupported(supported);
          console.log("🔍 AR Support:", supported);
        } catch (error) {
          console.log("AR not supported:", error);
          setARSupported(false);
        }
      } else {
        // Fallback: check for model-viewer AR capabilities
        setARSupported(true); // model-viewer handles AR fallbacks
      }
    };

    checkARSupport();
  }, []);

  // Handle performance monitoring
  const handleAssetLoad = () => {
    onPerformanceChange?.({
      fps: 60,
      status: "Asset loaded",
      assetType: currentAsset?.assetType,
      assetName: currentAsset?.name,
    });
  };

  const handleAssetError = (error: string) => {
    onPerformanceChange?.({
      fps: 0,
      status: `Asset error: ${error}`,
      assetType: currentAsset?.assetType,
      assetName: currentAsset?.name,
    });
  };

  // No assets fallback
  if (!experience.assets || experience.assets.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <div className="text-xl font-semibold">Experiencia AR Lista</div>
          <div className="text-sm opacity-75 mt-2">
            Sin contenido disponible
          </div>
        </div>
      </div>
    );
  }

  // No current asset fallback
  if (!currentAsset) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <div>Cargando contenido...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Universal Asset Viewer */}
      <UniversalAssetViewer
        asset={currentAsset}
        className="w-full h-full"
        onLoad={handleAssetLoad}
        onError={handleAssetError}
        arMode={isARActive}
      />

      {/* AR Status Indicator */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        <span className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              arSupported ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span>
            {isARActive
              ? "AR Activo"
              : arSupported
              ? "AR Listo"
              : "AR No Disponible"}
          </span>
        </span>
      </div>

      {/* Asset Counter for Multiple Assets */}
      {experience.assets.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentAssetIndex + 1} de {experience.assets.length}
        </div>
      )}
    </div>
  );
}

export default function SimpleARCanvas({
  experience,
  className = "",
  onPerformanceChange,
  currentAssetIndex = 0,
  onAssetChange,
}: SimpleARCanvasProps) {
  const [isARMode, setIsARMode] = useState(false);

  const handleARActivation = async () => {
    console.log("🚀 AR mode requested for experience:", experience.id);

    try {
      setIsARMode(true);
      onPerformanceChange?.({ fps: 60, status: "Activating AR..." });

      // Wait a moment for model-viewer to be ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Find the model-viewer element
      const modelViewer = document.querySelector("model-viewer");
      if (modelViewer && "activateAR" in modelViewer) {
        console.log("🎯 Attempting to activate AR...");

        // Call activateAR method
        await (modelViewer as any).activateAR();
        console.log("✅ AR activated successfully");

        onPerformanceChange?.({ fps: 60, status: "AR Active" });
      } else {
        throw new Error("Model-viewer not found or AR not supported");
      }
    } catch (error) {
      console.error("❌ Failed to activate AR:", error);
      setIsARMode(false);
      onPerformanceChange?.({ fps: 0, status: `AR Error: ${error}` });

      // Show user-friendly error
      if (typeof window !== "undefined") {
        const errorMsg =
          error instanceof Error ? error.message : "AR no disponible";
        alert(
          `No se pudo activar AR: ${errorMsg}\n\nAsegúrate de estar en un dispositivo compatible y permitir el acceso a la cámara.`
        );
      }
    }
  };

  const handleVRActivation = () => {
    console.log("🥽 VR mode requested for experience:", experience.id);
    onPerformanceChange?.({ fps: 60, status: "VR requested" });

    // Check VR capabilities
    if (navigator.xr) {
      navigator.xr
        .isSessionSupported("immersive-vr")
        .then((supported) => {
          console.log("VR supported:", supported);
          if (supported) {
            // Could implement VR session here
            console.log("🥽 VR session could be started");
          }
        })
        .catch((error) => {
          console.error("VR check failed:", error);
        });
    }
  };

  // Handle asset navigation
  const handleAssetNavigation = (direction: "next" | "prev") => {
    if (!onAssetChange || experience.assets.length <= 1) return;

    let newIndex = currentAssetIndex;
    if (direction === "next") {
      newIndex = (currentAssetIndex + 1) % experience.assets.length;
    } else {
      newIndex =
        currentAssetIndex > 0
          ? currentAssetIndex - 1
          : experience.assets.length - 1;
    }

    onAssetChange(newIndex);
    console.log(`🔄 Asset navigation: ${direction} -> index ${newIndex}`);
  };

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Enhanced AR Scene with Universal Asset Support */}
      <EnhancedARScene
        experience={experience}
        currentAssetIndex={currentAssetIndex}
        onPerformanceChange={onPerformanceChange}
      />

      {/* Enhanced AR/VR Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-wrap gap-2 justify-center">
        {/* Asset Navigation (if multiple assets) */}
        {experience.assets.length > 1 && (
          <>
            <button
              onClick={() => handleAssetNavigation("prev")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              title="Contenido anterior"
            >
              ◀ Anterior
            </button>
            <button
              onClick={() => handleAssetNavigation("next")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              title="Siguiente contenido"
            >
              Siguiente ▶
            </button>
          </>
        )}

        {/* AR Activation */}
        <button
          onClick={handleARActivation}
          className={`${
            isARMode
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-4 py-2 rounded-lg transition-colors font-medium`}
          title="Activar realidad aumentada"
        >
          {isARMode ? "✓ AR Activo" : "🎯 Activar AR"}
        </button>

        {/* VR Activation */}
        <button
          onClick={handleVRActivation}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          title="Activar realidad virtual"
        >
          🥽 Activar VR
        </button>
      </div>
    </div>
  );
}

// Export both default and named export for compatibility
export { SimpleARCanvas };
