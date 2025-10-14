/**
 * Enhanced AR Canvas Component
 * Universal asset viewer with full AR support
 */

"use client";

import { Experience, Asset } from "@/types";
import { useState, useEffect } from "react";
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
  onPerformanceChange 
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
      const asset = experience.assets[Math.min(currentAssetIndex, experience.assets.length - 1)];
      setCurrentAsset(asset);
      console.log("� Current asset changed:", asset.name, asset.assetType);
    }
  }, [experience.assets, currentAssetIndex]);

  // Check AR support
  useEffect(() => {
    const checkARSupport = async () => {
      if (typeof navigator !== "undefined" && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported("immersive-ar");
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
      assetName: currentAsset?.name
    });
  };

  const handleAssetError = (error: string) => {
    onPerformanceChange?.({ 
      fps: 0, 
      status: `Asset error: ${error}`, 
      assetType: currentAsset?.assetType,
      assetName: currentAsset?.name
    });
  };

  // No assets fallback
  if (!experience.assets || experience.assets.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <div className="text-xl font-semibold">Experiencia AR Lista</div>
          <div className="text-sm opacity-75 mt-2">Sin contenido disponible</div>
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
          <div className={`w-2 h-2 rounded-full ${arSupported ? 'bg-green-400' : 'bg-red-400'}`} />
          <span>{isARActive ? "AR Activo" : arSupported ? "AR Listo" : "AR No Disponible"}</span>
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
}: SimpleARCanvasProps) {
  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Use model-viewer instead of React Three Fiber to avoid compatibility issues */}
      <ModelViewerARScene experience={experience} />

      {/* Simple AR Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={() => {
            console.log("AR mode requested for experience:", experience.id);
            onPerformanceChange?.({ fps: 60, status: "AR requested" });

            // Try to activate AR if model-viewer supports it
            const modelViewer = document.querySelector("model-viewer");
            if (modelViewer && "activateAR" in modelViewer) {
              (modelViewer as any).activateAR();
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2 transition-colors"
        >
          Activar AR
        </button>
        <button
          onClick={() => {
            console.log("VR mode requested for experience:", experience.id);
            onPerformanceChange?.({ fps: 60, status: "VR requested" });

            // Basic info about VR capabilities
            if (navigator.xr) {
              navigator.xr
                .isSessionSupported("immersive-vr")
                .then((supported) => {
                  console.log("VR supported:", supported);
                });
            }
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Activar VR
        </button>
      </div>
    </div>
  );
}

// Export both default and named export for compatibility
export { SimpleARCanvas };
