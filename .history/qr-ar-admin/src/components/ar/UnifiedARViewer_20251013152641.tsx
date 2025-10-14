"use client";

/**
 * Unified AR Experience Viewer
 * Automatically detects device capabilities and shows the appropriate viewer:
 * - Mobile: MobileARViewer (with real AR support)
 * - Desktop: Desktop3DViewer (interactive 3D visualization)
 */

import { Experience } from "@/types";
import { useARCapabilities, getRecommendedARMode } from "@/hooks/useARCapabilities";
import Desktop3DViewer from "./Desktop3DViewer";
import MobileARViewer from "./MobileARViewer";

interface UnifiedARViewerProps {
  experience: Experience;
  currentAssetIndex?: number;
  onAssetChange?: (index: number) => void;
  onBack?: () => void;
}

export default function UnifiedARViewer({
  experience,
  currentAssetIndex = 0,
  onAssetChange,
  onBack,
}: UnifiedARViewerProps) {
  const capabilities = useARCapabilities();

  // Show loading while detecting capabilities
  if (capabilities.isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Detectando capacidades...</h2>
          <p className="text-sm text-blue-200">
            Preparando la mejor experiencia para tu dispositivo
          </p>
        </div>
      </div>
    );
  }

  // Show error if detection failed
  if (capabilities.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <h2 className="text-2xl font-bold mb-4">⚠️ Error de detección</h2>
          <p className="text-red-200 mb-8">{capabilities.error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold"
            >
              🔄 Reintentar
            </button>
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-bold"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recommendedMode = getRecommendedARMode(capabilities);

  console.log("🎯 Unified AR Viewer - Mode:", recommendedMode, "Capabilities:", capabilities);

  // Route to appropriate viewer based on capabilities
  if (capabilities.isMobile || capabilities.canViewAR) {
    // Mobile devices or devices with AR support
    return (
      <MobileARViewer
        experience={experience}
        currentAssetIndex={currentAssetIndex}
        onAssetChange={onAssetChange}
        onBack={onBack}
      />
    );
  } else {
    // Desktop or devices without AR support
    return (
      <Desktop3DViewer
        experience={experience}
        currentAssetIndex={currentAssetIndex}
        onAssetChange={onAssetChange}
        onBack={onBack}
      />
    );
  }
}
