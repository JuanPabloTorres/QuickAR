"use client";

import { useEffect, useState } from "react";

interface ModelViewerProps {
  src?: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Import model-viewer only once at module level
let modelViewerImported = false;

export function ModelViewer({
  src,
  alt,
  className = "",
  onLoad,
  onError,
}: ModelViewerProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadModelViewer = async () => {
      if (!modelViewerImported) {
        try {
          console.log("Loading model-viewer library...");
          await import("@google/model-viewer");
          modelViewerImported = true;
          console.log("Model-viewer library loaded successfully");
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

  useEffect(() => {
    if (isReady && src) {
      console.log("Model-viewer ready with source:", src);
      
      // Verificar soporte AR
      const checkARSupport = () => {
        if ('xr' in navigator) {
          navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
            console.log('WebXR AR supported:', supported);
          }).catch(console.error);
        } else {
          console.log('WebXR not available, checking for other AR support...');
        }
      };

      checkARSupport();
    }
  }, [isReady, src]);

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

  const handleModelLoad = () => {
    console.log("Model loaded successfully:", src);
    onLoad?.();
  };

  const handleModelError = () => {
    console.error("Model loading error for source:", src);
    onError?.();
  };

  return (
    <div className={`model-viewer-container ${className}`}>
      <model-viewer
        src={src}
        alt={alt}
        className="w-full h-full"
        camera-controls={true}
        touch-action="pan-y"
        auto-rotate={true}
        loading="eager"
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        ar-placement="floor"
        camera-orbit="0deg 75deg 105%"
        min-camera-orbit="auto auto 25%"
        max-camera-orbit="auto auto 500%"
        field-of-view="30deg"
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        interaction-prompt="auto"
        poster=""
        seamless-poster={true}
        skybox-image=""
        onLoad={handleModelLoad}
        onError={handleModelError}
      >
        {/* Slot para el botón AR personalizado */}
        <button
          slot="ar-button"
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Ver en AR
        </button>
        
        {/* Debugging info */}
        <div 
          slot="progress-bar" 
          className="bg-sky-500 h-1 transition-all duration-300"
          style={{width: '0%'}}
        />
      </model-viewer>
    </div>
  );
}
