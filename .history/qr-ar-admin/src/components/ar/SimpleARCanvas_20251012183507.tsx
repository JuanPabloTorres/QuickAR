/**
 * Simple AR Canvas Component using React Three Fiber
 * Client-side only version to avoid compatibility issues
 */

"use client";

import { Experience } from "@/types";
import { useEffect, useState, Suspense } from "react";

// Custom hook to load React Three Fiber components
function useThreeFiberComponents() {
  const [components, setComponents] = useState<{
    Canvas: any;
    OrbitControls: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load on client side
    if (typeof window === "undefined") return;

    const loadComponents = async () => {
      try {
        setIsLoading(true);
        
        // Import components dynamically
        const [fiberModule, dreiModule] = await Promise.all([
          import("@react-three/fiber"),
          import("@react-three/drei")
        ]);

        setComponents({
          Canvas: fiberModule.Canvas,
          OrbitControls: dreiModule.OrbitControls,
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load React Three Fiber components:", err);
        setError(err instanceof Error ? err.message : "Failed to load 3D components");
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure React is fully initialized
    const timer = setTimeout(loadComponents, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return { components, isLoading, error };
}

interface SimpleARCanvasProps {
  experience: Experience;
  className?: string;
  onPerformanceChange?: (performance: any) => void;
}

// Simple AR Scene Component
function SimpleARScene({ 
  experience, 
  OrbitControls 
}: { 
  experience: Experience; 
  OrbitControls: any;
}) {
  return (
    <>
      {/* Basic lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Interactive controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning={false}
        minDistance={1}
        maxDistance={50}
      />
      
      {/* Simple content based on experience */}
      {experience.assets.map((asset, index) => {
        if (asset.assetType === "model3d") {
          return (
            <group key={asset.id} position={[index * 2 - 1, 0, 0]}>
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#00ff00" />
              </mesh>
            </group>
          );
        }
        return null;
      })}
      
      {/* Default placeholder if no assets */}
      {experience.assets.length === 0 && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>
      )}
    </>
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
  onPerformanceChange 
}: SimpleARCanvasProps) {
  const { components, isLoading, error } = useThreeFiberComponents();

  // Loading state
  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-900 ${className}`}>
        <div className="text-white">Cargando experiencia AR...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-red-900 ${className}`}>
        <div className="text-white">Error: {error}</div>
      </div>
    );
  }

  // Components not available
  if (!components?.Canvas || !components?.OrbitControls) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-900 ${className}`}>
        <div className="text-white">Componentes 3D no disponibles</div>
      </div>
    );
  }

  const { Canvas, OrbitControls } = components;

  return (
    <div className={`w-full h-full ${className}`}>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-white">Inicializando 3D...</div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f172a 100%)' }}
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
