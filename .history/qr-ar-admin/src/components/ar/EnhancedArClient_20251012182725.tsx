/**
 * Enhanced AR Client Component
 * Integrates React Three Fiber improvements with existing functionality
 */

"use client";

import { trackAnalyticsEvent } from "@/lib/api/experiences";
import { useARStore } from "@/stores/arStore";
import { Experience } from "@/types";
import { useEffect, useState } from "react";
import { ArOverlay } from "./ArOverlay";
import { SimpleARCanvas } from "./SimpleARCanvas";

interface EnhancedArClientProps {
  experience: Experience;
  onBack: () => void;
  className?: string;
}

export function EnhancedArClient({
  experience,
  onBack,
  className = "",
}: EnhancedArClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AR Store hooks
  const {
    setExperience,
    initializeSession,
    session,
    currentAssetIndex,
    setAssetIndex,
    performance,
    showDebugInfo,
    showPerformanceMonitor,
    toggleDebugInfo,
    togglePerformanceMonitor,
  } = useARStore();

  // Initialize AR session and set experience
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        console.log("🚀 Enhanced AR Client Initializing:", {
          experienceId: experience.id,
          assetCount: experience.assets.length,
        });

        // Set experience in store
        setExperience(experience);

        // Initialize WebXR session detection
        await initializeSession();

        // Track analytics
        await trackAnalyticsEvent("experience_view", experience.id, {
          assetCount: experience.assets.length,
          hasModel3D: experience.assets.some((a) => a.assetType === "model3d"),
          enhanced: true, // Flag for enhanced client
        });

        setIsLoading(false);
      } catch (err) {
        console.error("❌ Enhanced AR initialization failed:", err);
        setError(err instanceof Error ? err.message : "Error inicializando AR");
        setIsLoading(false);
      }
    };

    initialize();
  }, [experience, setExperience, initializeSession]);

  // Handle asset navigation
  const handleAssetChange = async (newIndex: number) => {
    if (newIndex >= 0 && newIndex < experience.assets.length) {
      setAssetIndex(newIndex);

      // Track asset navigation
      await trackAnalyticsEvent("asset_navigation", experience.id, {
        from: currentAssetIndex,
        to: newIndex,
        assetId: experience.assets[newIndex].id,
        assetType: experience.assets[newIndex].assetType,
      });
    }
  };

  // Performance monitoring callback
  const handlePerformanceChange = (perfData: any) => {
    // This could update the AR store or trigger UI changes
    console.log("📊 Performance update:", perfData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <div className="text-xl font-semibold">
            Iniciando experiencia AR mejorada...
          </div>
          <div className="text-sm text-blue-200 mt-2">
            WebXR: {session.supported.immersiveAR ? "✅" : "❌"} | Performance:{" "}
            {showPerformanceMonitor ? "✅" : "❌"}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-2xl font-semibold mb-4">
            Error en experiencia AR
          </div>
          <div className="text-blue-200 mb-8">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              window.location.reload();
            }}
            className="w-full glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Simple AR Canvas */}
      <SimpleARCanvas 
        experience={experience}
        onPerformanceChange={handlePerformanceChange}
        className="absolute inset-0"
      />      {/* AR Overlay with enhanced info */}
      <ArOverlay
        experience={experience}
        currentAssetIndex={currentAssetIndex}
        onAssetChange={handleAssetChange}
        onBack={onBack}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Debug Information Panel */}
      {showDebugInfo && (
        <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs pointer-events-auto">
          <h3 className="font-bold mb-2">🔍 Debug Info</h3>
          <div className="space-y-1">
            <div>Experience: {experience.id.slice(0, 8)}...</div>
            <div>Assets: {experience.assets.length}</div>
            <div>
              Current: {currentAssetIndex + 1}/{experience.assets.length}
            </div>
            <div>WebXR AR: {session.supported.immersiveAR ? "✅" : "❌"}</div>
            <div>WebXR VR: {session.supported.immersiveVR ? "✅" : "❌"}</div>
            <div>
              Session:{" "}
              {session.isActive ? `Active (${session.mode})` : "Inactive"}
            </div>
            {performance && (
              <>
                <div>FPS: {performance.fps.toFixed(1)}</div>
                <div>Draw Calls: {performance.drawCalls}</div>
                <div>Triangles: {performance.triangles}</div>
              </>
            )}
          </div>

          <div className="mt-3 space-y-1">
            <button
              onClick={togglePerformanceMonitor}
              className="block w-full text-left text-blue-300 hover:text-blue-200"
            >
              📊 Performance: {showPerformanceMonitor ? "ON" : "OFF"}
            </button>
            <button
              onClick={toggleDebugInfo}
              className="block w-full text-left text-red-300 hover:text-red-200"
            >
              🚫 Hide Debug
            </button>
          </div>
        </div>
      )}

      {/* Performance Monitor Toggle (if debug is off) */}
      {!showDebugInfo && (
        <div className="absolute top-4 right-4 pointer-events-auto">
          <button
            onClick={toggleDebugInfo}
            className="bg-black/50 text-white p-2 rounded-lg text-xs hover:bg-black/70"
            title="Show debug info"
          >
            🔍
          </button>
        </div>
      )}

      {/* Session Error Display */}
      {session.error && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white p-3 rounded-lg max-w-sm text-center pointer-events-auto">
          <div className="font-semibold mb-1">AR/VR Error</div>
          <div className="text-sm">{session.error}</div>
        </div>
      )}
    </div>
  );
}
