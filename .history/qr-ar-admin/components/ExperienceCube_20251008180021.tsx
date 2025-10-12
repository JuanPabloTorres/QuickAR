"use client";

import { motion } from "framer-motion";
import { FileText, Image, Package, Play, Camera, Maximize, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Import model-viewer types
import "@/types/model-viewer";

// Type definitions to match the requirements
type AssetType = "image" | "video" | "text" | "model3d";

interface ExperienceCubeProps {
  assetType: AssetType;
  assetUrl?: string;
  assetContent?: string;
  size?: number;
  alt?: string;
  disableModelZoom?: boolean;
  disableModelPan?: boolean;
  enableAR?: boolean;
  arScale?: string;
  arPlacement?: "floor" | "wall";
  className?: string;
}

// Content type configuration with minimal AR styling
const contentTypeConfig = {
  text: {
    icon: FileText,
    label: "Texto",
    color: "text-gray-500",
  },
  image: {
    icon: Image,
    label: "Imagen",
    color: "text-gray-500",
  },
  video: {
    icon: Play,
    label: "Video",
    color: "text-gray-500",
  },
  model3d: {
    icon: Package,
    label: "Modelo 3D",
    color: "text-gray-500",
  },
};

export function ExperienceCube({
  assetType,
  assetUrl,
  assetContent,
  size = 300,
  alt,
  disableModelZoom = false,
  disableModelPan = true,
  enableAR = true,
  arScale = "auto",
  arPlacement = "floor",
  className = "",
}: ExperienceCubeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [arAvailable, setArAvailable] = useState(false);
  const [isInAR, setIsInAR] = useState(false);
  const modelViewerRef = useRef<HTMLElement>(null);

  const config = contentTypeConfig[assetType];
  const IconComponent = config.icon;

  // Load model-viewer dynamically for 3D models
  useEffect(() => {
    if (assetType === "model3d" && typeof window !== "undefined") {
      import("@google/model-viewer").then(() => {
        // Check AR availability
        const checkARSupport = async () => {
          try {
            if (navigator.xr) {
              const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
              setArAvailable(arSupported);
            } else {
              // Fallback: check for WebXR polyfill or device capabilities
              setArAvailable('ontouchstart' in window || navigator.maxTouchPoints > 0);
            }
          } catch (error) {
            console.warn('AR check failed:', error);
            setArAvailable(false);
          }
        };
        checkARSupport();
      });
    }
  }, [assetType]);

  // AR cube wireframe corners style
  const cornerStyle = "absolute w-4 h-4 border-gray-300";
  const innerFrameStyle = "absolute inset-2 border border-gray-200 rounded-lg";

  // Handle AR session events
  const handleARStart = () => setIsInAR(true);
  const handleAREnd = () => setIsInAR(false);

  const renderContent = () => {
    switch (assetType) {
      case "image":
        if (!assetUrl) return null;
        return (
          <img
            src={assetUrl}
            alt={alt || "Experiencia AR"}
            className="w-full h-full object-cover rounded-xl"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        );

      case "video":
        if (!assetUrl) return null;
        return (
          <video
            src={assetUrl}
            className="w-full h-full object-cover rounded-xl"
            controls
            muted
            playsInline
            onLoadStart={() => setIsLoading(true)}
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          >
            Tu navegador no soporta el elemento video.
          </video>
        );

      case "text":
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <FileText className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 leading-relaxed max-h-full overflow-y-auto">
              {assetContent || "Contenido de texto"}
            </p>
          </div>
        );

      case "model3d":
        if (!assetUrl) return null;
        return (
          <div className="relative w-full h-full">
            {/* Model Viewer with AR support */}
            <model-viewer
              ref={modelViewerRef}
              src={assetUrl}
              alt={alt || "Modelo 3D AR"}
              camera-controls={!disableModelPan}
              auto-rotate={false}
              ar={enableAR && arAvailable}
              ar-modes="webxr scene-viewer quick-look"
              ar-scale={arScale}
              ar-placement={arPlacement}
              loading="eager"
              reveal-when-loaded
              shadow-intensity="1"
              shadow-softness="0.5"
              environment-image="neutral"
              exposure="1"
              tone-mapping="neutral"
              interaction-policy="always-allow"
              interaction-prompt="auto"
              camera-orbit="45deg 55deg 4m"
              min-camera-orbit="auto auto 2m"
              max-camera-orbit="auto auto 10m"
              className="w-full h-full bg-transparent rounded-xl overflow-hidden model-viewer-ar"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              onAr-status={() => handleARStart()}
              onAr-tracking={() => setIsInAR(true)}
              onAr-not-tracking={() => setIsInAR(false)}
            />
            
            {/* AR Controls Overlay */}
            {enableAR && arAvailable && (
              <div className="absolute top-2 right-2 flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-black/50 text-white rounded-lg backdrop-blur-sm"
                  title="Ver en AR"
                  onClick={() => {
                    const viewer = modelViewerRef.current as any;
                    if (viewer && viewer.activateAR) {
                      viewer.activateAR();
                    }
                  }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
                
                {!disableModelZoom && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-black/50 text-white rounded-lg backdrop-blur-sm"
                    title="Ajustar vista"
                    onClick={() => {
                      const viewer = modelViewerRef.current as any;
                      if (viewer) {
                        viewer.cameraOrbit = "45deg 55deg 4m";
                        viewer.fieldOfView = "auto";
                      }
                    }}
                  >
                    <Maximize className="w-4 h-4" />
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-black/50 text-white rounded-lg backdrop-blur-sm"
                  title="Resetear posición"
                  onClick={() => {
                    const viewer = modelViewerRef.current as any;
                    if (viewer) {
                      viewer.resetTurntableRotation();
                      viewer.cameraOrbit = "45deg 55deg 4m";
                    }
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* AR Status Indicator */}
            {isInAR && (
              <div className="absolute bottom-2 left-2 px-3 py-1 bg-green-500/90 text-white text-xs rounded-full backdrop-blur-sm">
                Modo AR Activo
              </div>
            )}

            {/* Loading state for 3D models */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-600">Cargando modelo 3D...</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderFallback = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <IconComponent className="w-8 h-8 text-gray-400 mb-2" />
      <p className="text-xs text-gray-500">
        {hasError ? "Error al cargar" : config.label}
      </p>
    </div>
  );

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-white/40 to-gray-50/30 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200/50 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: 300,
        minHeight: 300,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      }}
    >
      {/* AR wireframe corners */}
      <div
        className={`${cornerStyle} top-0 left-0 border-t-2 border-l-2 rounded-tl-lg`}
      />
      <div
        className={`${cornerStyle} top-0 right-0 border-t-2 border-r-2 rounded-tr-lg`}
      />
      <div
        className={`${cornerStyle} bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg`}
      />
      <div
        className={`${cornerStyle} bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg`}
      />

      {/* Inner AR frame */}
      <div className={innerFrameStyle} />

      {/* Content area */}
      <div className="relative z-10 w-full h-full p-4">
        <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-xl border border-white/30 backdrop-blur-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-2"></div>
              <p className="text-xs text-gray-500">Cargando...</p>
            </div>
          ) : hasError ? (
            renderFallback()
          ) : (
            renderContent() || renderFallback()
          )}
        </div>
      </div>

      {/* Subtle AR overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-2xl" />
    </motion.div>
  );
}

export default ExperienceCube;
