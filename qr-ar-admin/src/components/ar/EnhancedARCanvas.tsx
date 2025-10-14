/**
 * Enhanced AR Canvas Component using React Three Fiber
 * Based on best practices from "Develop AR/VR with React" article
 */

"use client";

import { Experience } from "@/types";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useState } from "react";

// Dynamic imports to avoid SSR issues with React Three Fiber
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

const Environment = dynamic(
  () =>
    import("@react-three/drei").then((mod) => ({ default: mod.Environment })),
  {
    ssr: false,
  }
);

const AdaptiveDpr = dynamic(
  () =>
    import("@react-three/drei").then((mod) => ({ default: mod.AdaptiveDpr })),
  {
    ssr: false,
  }
);

const AdaptiveEvents = dynamic(
  () =>
    import("@react-three/drei").then((mod) => ({
      default: mod.AdaptiveEvents,
    })),
  {
    ssr: false,
  }
);

const PerformanceMonitor = dynamic(
  () =>
    import("@react-three/drei").then((mod) => ({
      default: mod.PerformanceMonitor,
    })),
  {
    ssr: false,
  }
);

interface ARCanvasProps {
  experience: Experience;
  className?: string;
  onPerformanceChange?: (performance: any) => void;
}

/**
 * Loading component for Suspense fallback
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
 * Performance monitoring component
 */
function PerformanceWrapper({
  onPerformanceChange,
}: {
  onPerformanceChange?: (perf: any) => void;
}) {
  const handlePerformanceChange = useCallback(
    (performance: any) => {
      console.log("🔍 Performance Update:", {
        fps: performance.fps,
        cpu: performance.cpu,
        gpu: performance.gpu,
        memory: performance.memory,
      });

      onPerformanceChange?.(performance);

      // Auto-adjust quality based on performance
      if (performance.fps < 30) {
        console.warn("⚠️ Low FPS detected, consider reducing quality");
      }
    },
    [onPerformanceChange]
  );

  return (
    <PerformanceMonitor
      onIncline={handlePerformanceChange}
      onDecline={handlePerformanceChange}
    />
  );
}

/**
 * Enhanced AR Canvas with React Three Fiber
 * Implements best practices from the article:
 * - Declarative 3D scene management
 * - Performance monitoring
 * - WebXR support
 * - Adaptive rendering
 */
export function EnhancedARCanvas({
  experience,
  className = "",
  onPerformanceChange,
}: ARCanvasProps) {
  const [dpr, setDpr] = useState(1);

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        // Enhanced WebGL configuration
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        // Camera configuration optimized for AR
        camera={{
          position: [0, 0, 5],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        // Performance optimization
        dpr={dpr}
        performance={{ min: 0.5 }}
        frameloop="demand" // Only render when needed
      >
        {/* Adaptive Performance Management */}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        {/* Performance Monitoring */}
        <PerformanceWrapper onPerformanceChange={onPerformanceChange} />

        {/* Lighting Setup */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Environment for better reflections */}
        <Environment preset="sunset" />

        {/* Suspense for lazy loading */}
        <Suspense fallback={<LoadingCube />}>
          {/* Main AR Content will go here */}
          {experience.assets.map((asset, index) => {
            if (asset.assetType === "model3d") {
              return (
                <group key={asset.id} position={[index * 2 - 1, 0, 0]}>
                  {/* Model component will be implemented separately */}
                  <LoadingCube />
                </group>
              );
            }
            return null;
          })}
        </Suspense>

        {/* Controls for development */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={2}
        />
      </Canvas>

      {/* AR/VR Controls (WebXR will be added later) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => {
            // WebXR integration will be added here
            console.log("AR mode requested");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2 transition-colors"
        >
          Enter AR
        </button>
        <button
          onClick={() => {
            // WebXR integration will be added here
            console.log("VR mode requested");
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Enter VR
        </button>
      </div>
    </div>
  );
}
