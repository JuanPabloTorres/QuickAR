/**
 * Simple AR Canvas Component using React Three Fiber
 * Simplified version to avoid compatibility issues
 */

"use client";

import { Experience } from "@/types";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic Canvas import to avoid SSR issues
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => ({ default: mod.Canvas })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 to-blue-950 animate-pulse flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">🔄</div>
          <div>Cargando Canvas 3D...</div>
        </div>
      </div>
    ),
  }
);

const OrbitControls = dynamic(
  () =>
    import("@react-three/drei").then((mod) => ({ default: mod.OrbitControls })),
  {
    ssr: false,
  }
);

interface SimpleARCanvasProps {
  experience: Experience;
  className?: string;
  onPerformanceChange?: (performance: any) => void;
}

/**
 * Loading cube component
 */
function LoadingCube() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="skyblue" wireframe />
    </mesh>
  );
}

/**
 * Simple AR Scene
 */
function SimpleARScene({ experience }: { experience: Experience }) {
  return (
    <>
      {/* Basic lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* Simple content */}
      {experience.assets.map((asset, index) => {
        if (asset.assetType === "model3d") {
          return (
            <group key={asset.id} position={[index * 2 - 1, 0, 0]}>
              <LoadingCube />
            </group>
          );
        }
        return null;
      })}

      {/* Basic controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxDistance={20}
        minDistance={2}
      />
    </>
  );
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
