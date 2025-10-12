"use client";

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
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const currentAsset =
    experience.assets[currentAssetIndex] || experience.assets[0];

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
    <div className={`ar-container ${className}`}>
      <div
        ref={cubeRef}
        className="experience-cube w-80 h-80 mx-auto cursor-grab select-none"
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: "preserve-3d",
          transition: isInteracting ? "none" : "transform 0.3s ease-out",
        }}
      >
        {/* Main face - shows current asset */}
        <div
          className="cube-face w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm flex items-center justify-center"
          style={{
            transform: "translateZ(140px)",
          }}
        >
          <div className="w-72 h-72">
            <AssetRenderer asset={currentAsset} className="w-full h-full" />
          </div>
        </div>

        {/* Back face */}
        <div
          className="cube-face w-80 h-80 bg-gradient-to-br from-secondary/20 to-muted/20 backdrop-blur-sm flex items-center justify-center"
          style={{
            transform: "translateZ(-140px) rotateY(180deg)",
          }}
        >
          <div className="text-center text-white/80">
            <div className="text-6xl mb-4">🎯</div>
            <div className="text-lg font-medium">{experience.title}</div>
            {experience.description && (
              <div className="text-sm mt-2 px-4">{experience.description}</div>
            )}
          </div>
        </div>

        {/* Side faces for additional assets */}
        {experience.assets.slice(1, 5).map((asset, index) => (
          <div
            key={asset.id}
            className="cube-face w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:from-accent/20 hover:to-primary/20 transition-colors"
            style={{
              transform: `rotateY(${90 * (index + 1)}deg) translateZ(140px)`,
            }}
            onClick={() => onAssetChange?.(index + 1)}
          >
            <div className="w-60 h-60 flex items-center justify-center">
              <AssetRenderer asset={asset} className="w-full h-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Asset navigation */}
      {experience.assets.length > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {experience.assets.map((_, index) => (
            <button
              key={index}
              onClick={() => onAssetChange?.(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentAssetIndex
                  ? "bg-primary shadow-lg shadow-primary/50"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Ver asset ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Interaction hint */}
      <div className="text-center mt-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-center space-x-2">
          <span>🖱️</span>
          <span>Arrastra para rotar</span>
          {experience.assets.length > 1 && (
            <>
              <span>•</span>
              <span>Toca los puntos para cambiar contenido</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
