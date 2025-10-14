/**
 * Simple AR Canvas Component using React Three Fiber
 * Client-side only version to avoid compatibility issues
 */

"use client";

import { Experience } from "@/types";
import { Suspense, useEffect, useState } from "react";



// Custom hook to safely load model-viewer
function useModelViewer() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load on client side
    if (typeof window === "undefined") return;

    const loadModelViewer = async () => {
      try {
        // Check if already loaded
        if (customElements.get('model-viewer')) {
          setIsLoaded(true);
          return;
        }

        // Import model-viewer dynamically
        await import('@google/model-viewer');
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load model-viewer:", err);
        setError(err instanceof Error ? err.message : "Failed to load 3D viewer");
      }
    };

    loadModelViewer();
  }, []);

  return { isLoaded, error };
}

interface SimpleARCanvasProps {
  experience: Experience;
  className?: string;
  onPerformanceChange?: (performance: any) => void;
}

// Model Viewer Component - Fallback for React Three Fiber compatibility issues
function ModelViewerARScene({ experience }: { experience: Experience }) {
  const { isLoaded, error } = useModelViewer();

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
        <div>Error loading 3D viewer: {error}</div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
        <div>Loading 3D viewer...</div>
      </div>
    );
  }

  // Get first 3D model from experience
  const firstModel = experience.assets.find(asset => asset.assetType === "model3d");
  
  // Fallback for no models
  if (!firstModel) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div>AR Experience Ready</div>
          <div className="text-sm opacity-75">No 3D models configured</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <model-viewer
        src={firstModel.assetUrl}
        alt={firstModel.assetName || "3D Model"}
        camera-controls
        auto-rotate
        auto-rotate-delay={3000}
        rotation-per-second="30deg"
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        camera-orbit="0deg 75deg 1.5m"
        field-of-view="30deg"
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f172a 100%)'
        }}
      />
      
      {/* AR Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
        <div className="text-sm">
          <div>Model: {firstModel.assetName}</div>
          <div>Format: {firstModel.assetUrl.split('.').pop()?.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}

interface SimpleARCanvasProps {
  experience: Experience;
  className?: string;
  onPerformanceChange?: (performance: any) => void;
}

/**
 * Simple AR Canvas - compatibility-focused version
 */
export default function SimpleARCanvas({
  experience,
  className = "",
  onPerformanceChange,
}: SimpleARCanvasProps) {
  const { components, isLoading, error } = useThreeFiberComponents();

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-900 ${className}`}
      >
        <div className="text-white">Cargando experiencia AR...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-red-900 ${className}`}
      >
        <div className="text-white">Error: {error}</div>
      </div>
    );
  }

  // Components not available
  if (!components?.Canvas || !components?.OrbitControls) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-900 ${className}`}
      >
        <div className="text-white">Componentes 3D no disponibles</div>
      </div>
    );
  }

  const { Canvas, OrbitControls } = components;

  return (
    <div className={`w-full h-full ${className}`}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-white">Inicializando 3D...</div>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{
            background:
              "radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f172a 100%)",
          }}
        >
          <SimpleARScene
            experience={experience}
            OrbitControls={OrbitControls}
          />
        </Canvas>
      </Suspense>

      {/* Simple AR Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => {
            console.log("AR mode requested for experience:", experience.id);
            onPerformanceChange?.({ fps: 60, status: "AR requested" });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2 transition-colors"
        >
          Activar AR
        </button>
        <button
          onClick={() => {
            console.log("VR mode requested for experience:", experience.id);
            onPerformanceChange?.({ fps: 60, status: "VR requested" });
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
