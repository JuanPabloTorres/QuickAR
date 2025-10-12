"use client";

import { QuickArLogo } from "@/components/ui/quick-ar-logo";
import { Experience } from "@/types";
import { useEffect, useRef, useState } from "react";
import { AssetRenderer } from "./AssetRenderer";

interface ExperienceCubeProps {
  experience: Experience;
  currentAssetIndex?: number;
  onAssetChange?: (index: number) => void;
  className?: string;
}

export function ExperienceCube({
  experience,
  currentAssetIndex = 0,
  onAssetChange,
  className = "",
}: ExperienceCubeProps) {
  const cubeRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [rotation, setRotation] = useState({ x: 15, y: 25 });
  const [isHovered, setIsHovered] = useState(false);
  const [arScanActive, setArScanActive] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);

  const currentAsset =
    experience.assets[currentAssetIndex] || experience.assets[0];

  // AR scanning animation
  useEffect(() => {
    if (isHovered) {
      setArScanActive(true);
      const interval = setInterval(() => {
        setGlitchEffect((prev) => !prev);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setArScanActive(false);
      setGlitchEffect(false);
    }
  }, [isHovered]);

  // Auto-rotation when not interacting
  useEffect(() => {
    if (isInteracting) return;

    const interval = setInterval(() => {
      setRotation((prev) => ({
        x: prev.x,
        y: prev.y + 0.5,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [isInteracting]);

  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;

    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsInteracting(true);
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      cube.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;

      setRotation((prev) => ({
        x: prev.x - deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
      }));

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
      setIsInteracting(false);
      cube.style.cursor = "grab";
    };

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        isDragging = true;
        setIsInteracting(true);
        lastMouseX = touch.clientX;
        lastMouseY = touch.clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;

      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastMouseX;
      const deltaY = touch.clientY - lastMouseY;

      setRotation((prev) => ({
        x: prev.x - deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
      }));

      lastMouseX = touch.clientX;
      lastMouseY = touch.clientY;
    };

    const handleTouchEnd = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    // Mouse events
    cube.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Touch events
    cube.addEventListener("touchstart", handleTouchStart);
    cube.addEventListener("touchmove", handleTouchMove);
    cube.addEventListener("touchend", handleTouchEnd);

    return () => {
      cube.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      cube.removeEventListener("touchstart", handleTouchStart);
      cube.removeEventListener("touchmove", handleTouchMove);
      cube.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  if (!currentAsset) {
    return (
      <div
        className={`ar-container flex items-center justify-center ${className}`}
      >
        <div className="text-muted-foreground text-center">
          <div className="text-4xl mb-4">📦</div>
          <div className="text-lg font-medium">Sin contenido</div>
          <div className="text-sm">Esta experiencia no tiene assets</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ar-container relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Minimal AR Scanning indicator - only for non-3D assets */}
      {arScanActive && currentAsset.assetType !== 'model3d' && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="w-full h-full relative">
            {/* Simple corner markers */}
            <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-sky-400/60 opacity-80" />
            <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-sky-400/60 opacity-80" />
            <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-sky-400/60 opacity-80" />
            <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-sky-400/60 opacity-80" />
          </div>
        </div>
      )}

      {/* Holographic Cube Container */}
      <div className="relative">
        <div
          ref={cubeRef}
          className={`experience-cube w-64 h-64 sm:w-80 sm:h-80 mx-auto cursor-grab select-none relative transition-all duration-500 ${
            isHovered ? "scale-105 drop-shadow-2xl" : "scale-100"
          } ${glitchEffect ? "animate-pulse" : ""}`}
          style={{
            transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: "preserve-3d",
            transition: isInteracting
              ? "none"
              : "transform 0.3s ease-out, scale 0.5s ease-out",
            filter: glitchEffect ? "hue-rotate(180deg) saturate(150%)" : "none",
          }}
        >
          {/* Main face - Current Asset with minimal overlay */}
          <div
            className={`cube-face absolute w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center border border-white/20 ${
              isHovered
                ? "bg-gradient-to-br from-sky-500/10 via-purple-500/5 to-green-500/10"
                : "bg-black/20"
            } transition-all duration-500`}
            style={{
              transform: "translateZ(112px)",
              backdropFilter: "blur(2px)",
            }}
          >
            <div className="w-60 h-60 sm:w-76 sm:h-76 relative">
              <AssetRenderer
                asset={currentAsset}
                className="w-full h-full rounded-lg"
              />
              {/* Minimal frame - only visible on hover for 3D models */}
              {currentAsset.assetType === 'model3d' && isHovered && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-sky-400/60" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-sky-400/60" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-sky-400/60" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-sky-400/60" />
                </div>
              )}
            </div>
          </div>

          {/* Back face with enhanced branding */}
          <div
            className="cube-face absolute w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-slate-900/90 via-purple-900/30 to-slate-900/90 backdrop-blur-md flex items-center justify-center border border-white/10"
            style={{
              transform: "translateZ(-112px) rotateY(180deg)",
              boxShadow: "inset 0 0 60px rgba(139, 92, 246, 0.2)",
            }}
          >
            <div className="text-center text-white/90 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/10 via-purple-400/10 to-green-400/10 rounded-lg blur-sm" />
              <div className="relative">
                <QuickArLogo size={72} className="mb-4 mx-auto" animated />
                <div className="text-xl font-bold bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent font-orbitron">
                  {experience.title}
                </div>
                {experience.description && (
                  <div className="text-sm mt-3 px-6 text-slate-300 font-manrope leading-relaxed">
                    {experience.description}
                  </div>
                )}
                <div className="mt-4 text-xs text-sky-400 font-mono">
                  {experience.assets.length} assets • AR Ready
                </div>
              </div>
            </div>
          </div>

          {/* Side faces for additional assets - simplified */}
          {experience.assets.slice(1, 5).map((asset, index) => (
            <div
              key={asset.id}
              className={`cube-face absolute w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center cursor-pointer border border-white/20 transition-all duration-300 ${
                currentAssetIndex === index + 1
                  ? "bg-green-500/20"
                  : "bg-black/30 hover:bg-sky-500/10"
              }`}
              style={{
                transform: `rotateY(${90 * (index + 1)}deg) translateZ(112px)`,
                backdropFilter: "blur(2px)",
              }}
              onClick={() => onAssetChange?.(index + 1)}
            >
              <div className="w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center relative">
                <AssetRenderer
                  asset={asset}
                  className="w-full h-full rounded-lg"
                />
                {/* Simple selection indicator */}
                {currentAssetIndex === index + 1 && (
                  <div className="absolute inset-0 border-2 border-green-400/60 rounded-lg" />
                )}
                {/* Minimal asset number badge */}
                <div className="absolute top-2 right-2 w-5 h-5 bg-sky-600/80 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {index + 2}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Holographic base */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-80 sm:w-96 h-3 sm:h-4 bg-gradient-to-r from-transparent via-sky-400/20 to-transparent rounded-full blur-sm" />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-5 sm:translate-y-6 w-64 sm:w-80 h-2 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent rounded-full blur-md" />
      </div>

      {/* Enhanced Asset Navigation */}
      {experience.assets.length > 1 && (
        <div className="flex flex-col items-center mt-12 space-y-4">
          {/* Navigation dots */}
          <div className="flex justify-center space-x-3">
            {experience.assets.map((asset, index) => (
              <button
                key={index}
                onClick={() => onAssetChange?.(index)}
                className={`group relative w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentAssetIndex
                    ? "bg-gradient-to-r from-sky-400 to-purple-400 shadow-lg scale-125"
                    : "bg-slate-600/50 hover:bg-slate-500/70 hover:scale-110"
                }`}
                aria-label={`Ver asset ${index + 1}`}
              >
                {/* Active indicator */}
                {index === currentAssetIndex && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400 to-purple-400 animate-ping opacity-75" />
                )}

                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {asset.name}
                </div>
              </button>
            ))}
          </div>

          {/* Asset info */}
          <div className="text-center space-y-2">
            <div className="text-sm font-medium text-white font-orbitron">
              {currentAsset.name}
            </div>
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-400 font-manrope">
              <span className="flex items-center space-x-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentAsset.assetType === "image"
                      ? "bg-green-400"
                      : currentAsset.assetType === "video"
                      ? "bg-red-400"
                      : currentAsset.assetType === "model3d"
                      ? "bg-blue-400"
                      : "bg-purple-400"
                  }`}
                />
                <span>{currentAsset.assetType.toUpperCase()}</span>
              </span>
              <span>
                {currentAssetIndex + 1} / {experience.assets.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AR Status Indicator */}
      <div className="flex justify-center mt-6">
        <div
          className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            arScanActive
              ? "bg-green-500/20 border border-green-400/30"
              : "bg-slate-900/40 border border-slate-600/30"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              arScanActive ? "bg-green-400 animate-pulse" : "bg-slate-500"
            }`}
          />
          <span className="text-xs font-mono text-white/80">
            {arScanActive ? "AR SCANNING..." : "AR READY"}
          </span>
        </div>
      </div>

      {/* Interaction hint */}
      <div className="text-center mt-4 text-sm text-slate-400">
        <div className="flex items-center justify-center space-x-2">
          <QuickArLogo size={16} />
          <span className="font-manrope">
            Arrastra para rotar • Hover para escanear AR
          </span>
          {experience.assets.length > 1 && (
            <>
              <span>•</span>
              <span>Navega entre assets</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
