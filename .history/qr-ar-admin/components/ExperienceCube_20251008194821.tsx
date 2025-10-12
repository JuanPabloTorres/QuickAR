"use client";

import { motion } from "framer-motion";
import {
  Camera,
  FileText,
  Image,
  Maximize,
  Package,
  Play,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useARSupport from "./hooks/useARSupport";
import "./styles/ExperienceCube.css";

// Import asset mappers for consistent type handling
import { AssetType, mapAssetToExperienceCube, validateAsset, normalizeAssetUrl } from "@/lib/asset-mappers";
import type { AssetDto } from "@/types";

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
  
  // Enhanced props for 3D neutral appearance
  neutralBorder?: boolean;
  borderColor?: "dark" | "light";
  enable3D?: boolean;
  disableAutoAnimations?: boolean;
}

// Alternative constructor from AssetDto
interface ExperienceCubeFromAssetProps {
  asset: AssetDto;
  size?: number;
  enableAR?: boolean;
  className?: string;
  neutralBorder?: boolean;
  borderColor?: "dark" | "light";
  enable3D?: boolean;
  disableAutoAnimations?: boolean;
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
  // New neutral 3D props with realistic defaults
  neutralBorder = true,
  borderColor = "light",
  enable3D = true,
  disableAutoAnimations = true,
}: ExperienceCubeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInAR, setIsInAR] = useState(false);
  const modelViewerRef = useRef<HTMLDivElement>(null);

  // Use AR support hook
  const { capabilities, isSupported: arAvailable, activateAR } = useARSupport();

  const config = contentTypeConfig[assetType];
  const IconComponent = config.icon;

  // Load model-viewer dynamically for 3D models
  useEffect(() => {
    if (assetType === "model3d" && typeof window !== "undefined") {
      import("@google/model-viewer");
    }
  }, [assetType]);

  // Set up AR event listeners after model loads
  useEffect(() => {
    if (assetType === "model3d" && modelViewerRef.current) {
      const container = modelViewerRef.current;
      const viewer = container.querySelector("model-viewer") as any;

      if (viewer) {
        const handleLoad = () => setIsLoading(false);
        const handleError = () => {
          setIsLoading(false);
          setHasError(true);
        };
        const handleARStatus = (event: any) => {
          if (event.detail.status === "session-started") {
            setIsInAR(true);
          } else if (event.detail.status === "session-ended") {
            setIsInAR(false);
          }
        };

        viewer.addEventListener("load", handleLoad);
        viewer.addEventListener("error", handleError);
        viewer.addEventListener("ar-status", handleARStatus);

        return () => {
          viewer.removeEventListener("load", handleLoad);
          viewer.removeEventListener("error", handleError);
          viewer.removeEventListener("ar-status", handleARStatus);
        };
      }
    }
  }, [assetType, assetUrl]);

  // Handle AR session events
  const handleARStart = () => setIsInAR(true);
  const handleAREnd = () => setIsInAR(false);

  // Touch gesture handling for AR interactions
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDoubleTouch, setIsDoubleTouch] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      setIsDoubleTouch(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isDoubleTouch) return;

    const currentTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const deltaX = currentTouch.x - touchStart.x;
    const deltaY = currentTouch.y - touchStart.y;

    // Rotate model based on touch movement (for 3D models)
    if (assetType === "model3d" && Math.abs(deltaX) > 10) {
      const container = modelViewerRef.current;
      const viewer = container?.querySelector("model-viewer") as any;
      if (viewer && !disableModelPan) {
        const currentOrbit = viewer.cameraOrbit || "45deg 55deg 4m";
        const [azimuth, polar, radius] = currentOrbit.split(" ");
        const newAzimuth = parseFloat(azimuth) + deltaX * 0.5;
        viewer.cameraOrbit = `${newAzimuth}deg ${polar} ${radius}`;
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setIsDoubleTouch(false);
  };

  const renderContent = () => {
    switch (assetType) {
      case "image":
        if (!assetUrl) return null;
        return (
          <div className="relative w-full h-full">
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

            {/* AR Overlay for images */}
            {enableAR && (
              <div className="absolute top-2 right-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-black/50 text-white rounded-lg backdrop-blur-sm"
                  title="Ver en AR"
                  onClick={() => {
                    // Future: Implement AR.js or similar for image tracking
                    alert("Funcionalidad AR para imágenes próximamente");
                  }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        );

      case "video":
        if (!assetUrl) return null;
        return (
          <div className="relative w-full h-full">
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

            {/* AR Overlay for videos */}
            {enableAR && (
              <div className="absolute top-2 right-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-black/50 text-white rounded-lg backdrop-blur-sm"
                  title="Ver en AR"
                  onClick={() => {
                    // Future: Implement AR video projection
                    alert("Funcionalidad AR para videos próximamente");
                  }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        );

      case "text":
        return (
          <div className="relative flex flex-col items-center justify-center h-full p-4 text-center">
            <FileText className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 leading-relaxed max-h-full overflow-y-auto">
              {assetContent || "Contenido de texto"}
            </p>

            {/* AR Overlay for text */}
            {enableAR && (
              <div className="absolute top-2 right-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-black/50 text-white rounded-lg backdrop-blur-sm"
                  title="Ver en AR"
                  onClick={() => {
                    // Future: Implement AR text overlay
                    alert("Funcionalidad AR para texto próximamente");
                  }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        );

      case "model3d":
        if (!assetUrl) return null;
        return (
          <div className="relative w-full h-full">
            {/* Model Viewer with AR support */}
            <div
              ref={modelViewerRef}
              className="w-full h-full bg-transparent rounded-xl overflow-hidden model-viewer-ar"
              dangerouslySetInnerHTML={{
                __html: `
                  <model-viewer
                    src="${assetUrl}"
                    alt="${alt || "Modelo 3D AR"}"
                    ${!disableModelPan ? "camera-controls" : ""}
                    ${
                      enableAR && arAvailable
                        ? 'ar ar-modes="webxr scene-viewer quick-look"'
                        : ""
                    }
                    ar-scale="${arScale}"
                    ar-placement="${arPlacement}"
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
                    style="width: 100%; height: 100%; border-radius: 12px;"
                  ></model-viewer>
                `,
              }}
            />

            {/* AR Controls Overlay */}
            {enableAR && arAvailable && (
              <div className="absolute top-2 right-2 flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-black/50 text-white rounded-lg backdrop-blur-sm"
                  title="Ver en AR"
                  onClick={() => activateAR(modelViewerRef.current)}
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
                      const container = modelViewerRef.current;
                      const viewer = container?.querySelector(
                        "model-viewer"
                      ) as any;
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
                    const container = modelViewerRef.current;
                    const viewer = container?.querySelector(
                      "model-viewer"
                    ) as any;
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
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="mb-4 p-3 rounded-full bg-gray-100/50 border border-gray-200/30">
        <IconComponent className="w-10 h-10 text-gray-500" />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">
        {hasError ? "Error al cargar contenido" : config.label}
      </p>
      {enableAR && arAvailable && (
        <p className="text-xs text-blue-600">✨ AR disponible</p>
      )}
    </div>
  );

  // Neutral 3D cube styles based on requirements
  const neutralStyles = neutralBorder
    ? {
        border: `2px solid ${
          borderColor === "dark" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.4)"
        }`,
        background: "transparent",
        backdropFilter: "blur(2px)",
      }
    : {};

  const animation3D = enable3D && !disableAutoAnimations
    ? {
        initial: { opacity: 0, rotateX: 0, rotateY: 0 },
        animate: { opacity: 1, rotateX: 0, rotateY: 0 },
        transition: { duration: 0.3, ease: "easeOut" },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 },
      };

  const hoverEffect = !disableAutoAnimations
    ? {
        scale: 1.02,
        rotateX: enable3D ? 1 : 0,
        rotateY: enable3D ? 1 : 0,
        transition: { type: "spring" as const, stiffness: 300 },
      }
    : undefined;

  return (
    <motion.div
      className={`experience-cube relative overflow-visible ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: 300,
        minHeight: 300,
        transformStyle: enable3D ? "preserve-3d" : "flat",
        perspective: enable3D ? "1000px" : "none",
        ...neutralStyles,
      }}
      {...animation3D}
      whileHover={hoverEffect}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* AR Cube Wireframe Structure */}
      <div className="ar-cube-wireframe">
        {/* Corner Brackets - More Visible */}
        <div className="ar-corner ar-corner-tl" />
        <div className="ar-corner ar-corner-tr" />
        <div className="ar-corner ar-corner-bl" />
        <div className="ar-corner ar-corner-br" />

        {/* Inner AR Grid */}
        <div className="ar-inner-grid" />

        {/* AR Scanning Line */}
        {enableAR && arAvailable && <div className="ar-scan-line" />}
      </div>

      {/* 3D Cube Faces Effect */}
      <div className="ar-cube-face ar-cube-face-front" />
      <div className="ar-cube-face ar-cube-face-back" />

      {/* Holographic Overlay */}
      <div className="ar-hologram" />

      {/* AR Capability Badge */}
      {enableAR && arAvailable && (
        <div className="absolute top-3 left-3 z-30">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm border border-white/30 shadow-lg"
          >
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            AR Ready
          </motion.div>
        </div>
      )}

      {/* AR Type Indicator */}
      {enableAR && arAvailable && (
        <div className="absolute top-3 right-3 z-30">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-2 py-1 bg-black/60 text-white text-xs rounded backdrop-blur-sm border border-white/20"
          >
            {capabilities.webXR
              ? "WebXR"
              : capabilities.sceneViewer
              ? "Scene"
              : capabilities.quickLook
              ? "QuickLook"
              : "AR"}
          </motion.div>
        </div>
      )}

      {/* Content area with AR integration */}
      <div className="relative z-20 w-full h-full p-6">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 via-gray-50/5 to-transparent rounded-xl border border-gray-300/20 backdrop-blur-md shadow-inner">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-gray-400/30 border-t-blue-500 rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">
                Cargando experiencia AR...
              </p>
            </div>
          ) : hasError ? (
            renderFallback()
          ) : (
            renderContent() || renderFallback()
          )}
        </div>
      </div>

      {/* Global AR Controls */}
      {enableAR && (
        <div className="absolute bottom-2 right-2 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-1"
          >
            {assetType === "model3d" && arAvailable && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-gradient-to-r from-gray-800/80 to-gray-700/80 text-white rounded-lg backdrop-blur-sm border border-white/10"
                title="Activar AR"
                onClick={() => activateAR(modelViewerRef.current)}
              >
                <Camera className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        </div>
      )}

      {/* Subtle AR overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-2xl" />
    </motion.div>
  );
}

export default ExperienceCube;
