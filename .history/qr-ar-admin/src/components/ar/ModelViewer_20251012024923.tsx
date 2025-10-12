"use client";

import { useEffect, useRef, useState } from "react";

interface ModelViewerProps {
  src?: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Import model-viewer only once at module level
let modelViewerImported = false;

export function ModelViewer({ src, alt, className = "", onLoad, onError }: ModelViewerProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadModelViewer = async () => {
      if (!modelViewerImported) {
        try {
          await import("@google/model-viewer");
          modelViewerImported = true;
          setIsReady(true);
        } catch (error) {
          console.error("Failed to load model-viewer:", error);
          onError?.();
        }
      } else {
        setIsReady(true);
      }
    };

    loadModelViewer();
  }, [onError]);

  if (!isReady) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full mx-auto mb-2"></div>
          <div className="text-sm text-slate-400">Cargando visor 3D...</div>
        </div>
      </div>
    );
  }

  return (
    <model-viewer
      src={src}
      alt={alt}
      className={className}
      camera-controls={true}
      touch-action="pan-y"
      auto-rotate={false}
      loading="eager"
      ar
      ar-modes="webxr scene-viewer quick-look"
      ar-scale="auto"
      camera-orbit="0deg 75deg 105%"
      min-camera-orbit="auto auto 50%"
      max-camera-orbit="auto auto 200%"
      shadow-intensity="1"
      environment-image="neutral"
      exposure="1"
      onLoad={onLoad}
      onError={onError}
    />
  );
}