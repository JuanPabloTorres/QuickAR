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
export function SimpleARCanvas({
  experience,
  className = "",
  onPerformanceChange,
}: SimpleARCanvasProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<LoadingCube />}>
          <SimpleARScene experience={experience} />
        </Suspense>
      </Canvas>

      {/* Simple AR/VR Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => {
            console.log("AR mode requested");
            onPerformanceChange?.({ fps: 60, status: "AR requested" });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2 transition-colors"
        >
          Enter AR
        </button>
        <button
          onClick={() => {
            console.log("VR mode requested");
            onPerformanceChange?.({ fps: 60, status: "VR requested" });
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Enter VR
        </button>
      </div>
    </div>
  );
}
