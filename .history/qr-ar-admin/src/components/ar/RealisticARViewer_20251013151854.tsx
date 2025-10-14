"use client";

/**
 * Realistic AR Viewer Component
 * Provides realistic 3D rendering of assets in AR using Three.js and React Three Fiber
 */

import { Asset, Experience } from "@/types";
import {
  Environment,
  Grid,
  Html,
  OrbitControls,
  PerspectiveCamera,
  useProgress,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useState } from "react";
import { UniversalAssetRenderer } from "./EnhancedAssetRenderers";

interface RealisticARViewerProps {
  experience: Experience;
  currentAssetIndex?: number;
  onAssetChange?: (index: number) => void;
  onBack?: () => void;
}

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg font-bold">Cargando {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

// Asset Renderer Component
interface AssetObjectProps {
  asset: Asset;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
  baseApiUrl: string;
}

function AssetObject({
  asset,
  position,
  isSelected,
  onClick,
  baseApiUrl,
}: AssetObjectProps) {
  return (
    <UniversalAssetRenderer
      asset={asset}
      position={position}
      isSelected={isSelected}
      onClick={onClick}
      baseApiUrl={baseApiUrl}
    />
  );
}

// Main AR Scene
interface ARSceneProps {
  experience: Experience;
  selectedAssetIndex: number;
  onAssetClick: (index: number) => void;
}

function ARScene({
  experience,
  selectedAssetIndex,
  onAssetClick,
}: ARSceneProps) {
  const baseApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

  // Arrange assets in a circle
  const getAssetPosition = (
    index: number,
    total: number
  ): [number, number, number] => {
    const radius = Math.max(3, total * 0.5);
    const angle = (index / total) * Math.PI * 2;
    return [Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius];
  };

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 2, 5]} />

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
        target={[0, 0, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      <hemisphereLight intensity={0.3} />

      {/* Environment */}
      <Environment preset="city" />

      {/* Ground Grid */}
      <Grid
        args={[20, 20]}
        position={[0, -0.01, 0]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#3b82f6"
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Ground Plane for shadows */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
      >
        <planeGeometry args={[50, 50]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>

      {/* Assets */}
      {experience.assets.map((asset, index) => (
        <AssetObject
          key={asset.id || index}
          asset={asset}
          position={getAssetPosition(index, experience.assets.length)}
          isSelected={selectedAssetIndex === index}
          onClick={() => onAssetClick(index)}
          baseApiUrl={baseApiUrl}
        />
      ))}

      {/* Center Marker */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
      </mesh>
    </>
  );
}

// Main Component
export default function RealisticARViewer({
  experience,
  currentAssetIndex = 0,
  onAssetChange,
  onBack,
}: RealisticARViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(currentAssetIndex);
  const [showInfo, setShowInfo] = useState(true);

  const handleAssetClick = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      onAssetChange?.(index);
    },
    [onAssetChange]
  );

  const handleNext = useCallback(() => {
    const nextIndex = (selectedIndex + 1) % experience.assets.length;
    handleAssetClick(nextIndex);
  }, [selectedIndex, experience.assets.length, handleAssetClick]);

  const handlePrevious = useCallback(() => {
    const prevIndex =
      selectedIndex === 0 ? experience.assets.length - 1 : selectedIndex - 1;
    handleAssetClick(prevIndex);
  }, [selectedIndex, experience.assets.length, handleAssetClick]);

  const selectedAsset = experience.assets[selectedIndex];

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 60 }}
        className="absolute inset-0"
      >
        <Suspense fallback={<Loader />}>
          <ARScene
            experience={experience}
            selectedAssetIndex={selectedIndex}
            onAssetClick={handleAssetClick}
          />
        </Suspense>
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between pointer-events-auto">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-bold">Volver</span>
            </button>

            <div className="text-right text-white">
              <h2 className="text-xl font-bold">{experience.title}</h2>
              <p className="text-sm text-blue-200">
                {selectedIndex + 1} / {experience.assets.length} objetos
              </p>
            </div>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-white hover:text-blue-300 transition-colors"
              aria-label="Toggle information"
              title="Toggle information"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="pointer-events-auto">
            {/* Asset Info */}
            {showInfo && selectedAsset && (
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {selectedAsset.name}
                    </h3>
                    <p className="text-blue-200 text-sm capitalize mb-2">
                      {selectedAsset.assetType.replace("3d", " 3D")}
                    </p>
                    {selectedAsset.assetContent && (
                      <p className="text-white/80 text-sm">
                        {selectedAsset.assetContent}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrevious}
                className="bg-white/20 hover:bg-white/30 backdrop-blur text-white p-4 rounded-full transition-colors"
                disabled={experience.assets.length <= 1}
                aria-label="Previous asset"
                title="Previous asset"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex gap-2">
                {experience.assets.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleAssetClick(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === selectedIndex
                        ? "bg-white scale-125"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to asset ${index + 1}`}
                    title={`Go to asset ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="bg-white/20 hover:bg-white/30 backdrop-blur text-white p-4 rounded-full transition-colors"
                disabled={experience.assets.length <= 1}
                aria-label="Next asset"
                title="Next asset"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur text-white text-xs px-3 py-2 rounded-lg max-w-xs">
            <p className="font-bold mb-1">💡 Controles:</p>
            <ul className="space-y-1">
              <li>🖱️ Click: Seleccionar objeto</li>
              <li>🖱️ Arrastrar: Rotar vista</li>
              <li>🖱️ Scroll: Zoom</li>
              <li>👆 Toca objetos para interactuar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
