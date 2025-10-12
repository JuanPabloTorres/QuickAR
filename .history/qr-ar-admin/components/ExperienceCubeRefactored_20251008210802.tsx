"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
  Camera, 
  FileText, 
  Image, 
  Info,
  Package, 
  Play, 
  RotateCcw, 
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { AssetKind, AssetDto } from '@/types';
import '@/styles/ar-components.css';

// Types matching unified DTOs

interface ExperienceCubeProps {
  assetKind: AssetKind;
  assetUrl?: string;
  assetContent?: string;
  size?: number;
  alt?: string;
  enableAR?: boolean;
  arScale?: string;
  arPlacement?: "floor" | "wall";
  className?: string;
  onARStateChange?: (isInAR: boolean) => void;
  educationalMode?: boolean;
  educationalContent?: {
    title?: string;
    description?: string;
    audioUrl?: string;
  };
}

interface ARState {
  isSupported: boolean;
  isInAR: boolean;
  isLoading: boolean;
  error: string | null;
  planeDetected: boolean;
  markerDetected: boolean;
}

interface ManualControls {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
}

// Content type configuration with neutral colors (mapped to AssetKind)
const contentTypeConfig: Record<AssetKind, {
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  bgColor: string;
}> = {
  message: {
    icon: FileText,
    label: "Texto",
    color: "text-gray-700",
    bgColor: "bg-gray-100"
  },
  image: {
    icon: Image,
    label: "Imagen", 
    color: "text-gray-700",
    bgColor: "bg-gray-100"
  },
  video: {
    icon: Play,
    label: "Video",
    color: "text-gray-700", 
    bgColor: "bg-gray-100"
  },
  model3d: {
    icon: Package,
    label: "Modelo 3D",
    color: "text-gray-700",
    bgColor: "bg-gray-100"
  },
};

export function ExperienceCubeRefactored({
  assetKind,
  assetUrl,
  assetContent,
  size = 320,
  alt,
  enableAR = true,
  arScale = "auto", 
  arPlacement = "floor",
  className = "",
  onARStateChange,
  educationalMode = false,
  educationalContent,
}: ExperienceCubeProps) {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const modelViewerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [arState, setARState] = useState<ARState>({
    isSupported: false,
    isInAR: false,
    isLoading: false,
    error: null,
    planeDetected: false,
    markerDetected: false
  });
  
  const [manualControls, setManualControls] = useState<ManualControls>({
    position: { x: 0, y: 0, z: -2 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1
  });
  
  const [showEducationalPanel, setShowEducationalPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const config = contentTypeConfig[assetType];
  const IconComponent = config.icon;

  // Check AR support
  useEffect(() => {
    const checkARSupport = async () => {
      let supported = false;
      
      try {
        // Check WebXR support
        if (navigator.xr) {
          supported = await navigator.xr.isSessionSupported('immersive-ar');
        }
        
        // Check for Scene Viewer (Android)
        if (!supported) {
          const isAndroid = /Android/i.test(navigator.userAgent);
          const isChrome = /Chrome/i.test(navigator.userAgent);
          supported = isAndroid && isChrome;
        }
        
        // Check for Quick Look (iOS)
        if (!supported) {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
          supported = isIOS && isSafari;
        }
        
        setARState(prev => ({ ...prev, isSupported: supported }));
      } catch (error) {
        console.warn('AR support check failed:', error);
        setARState(prev => ({ ...prev, isSupported: false }));
      }
    };
    
    if (enableAR) {
      checkARSupport();
    }
  }, [enableAR]);

  // Initialize model-viewer for 3D models
  useEffect(() => {
    if (assetType === "model3d" && typeof window !== "undefined") {
      import("@google/model-viewer").then(() => {
        console.log("Model-viewer loaded");
      }).catch(error => {
        console.error("Failed to load model-viewer:", error);
        setHasError(true);
      });
    }
  }, [assetType]);

  // Set up AR event listeners
  useEffect(() => {
    if (assetType === "model3d" && modelViewerRef.current) {
      const viewer = modelViewerRef.current as any;
      
      const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
      };
      
      const handleError = () => {
        setIsLoading(false);
        setHasError(true);
      };
      
      const handleARStatus = (event: any) => {
        const isInAR = event.detail.status === 'session-started';
        setARState(prev => ({ ...prev, isInAR }));
        
        if (onARStateChange) {
          onARStateChange(isInAR);
        }
      };

      viewer.addEventListener('load', handleLoad);
      viewer.addEventListener('error', handleError);
      viewer.addEventListener('ar-status', handleARStatus);

      return () => {
        viewer.removeEventListener('load', handleLoad);
        viewer.removeEventListener('error', handleError);
        viewer.removeEventListener('ar-status', handleARStatus);
      };
    }
  }, [assetType, assetUrl, onARStateChange]);

  // Manual control handlers
  const handleMove = useCallback((axis: 'x' | 'y' | 'z', delta: number) => {
    setManualControls(prev => ({
      ...prev,
      position: {
        ...prev.position,
        [axis]: prev.position[axis] + delta
      }
    }));
  }, []);

  const handleRotate = useCallback((axis: 'x' | 'y' | 'z', delta: number) => {
    setManualControls(prev => ({
      ...prev,
      rotation: {
        ...prev.rotation,
        [axis]: prev.rotation[axis] + delta
      }
    }));
  }, []);

  const handleScale = useCallback((delta: number) => {
    setManualControls(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale + delta))
    }));
  }, []);

  const resetControls = useCallback(() => {
    setManualControls({
      position: { x: 0, y: 0, z: -2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1
    });
  }, []);

  const startAR = useCallback(() => {
    if (assetType === "model3d" && modelViewerRef.current) {
      const viewer = modelViewerRef.current as any;
      if (viewer.activateAR) {
        viewer.activateAR();
      }
    }
  }, [assetType]);

  // Render different asset types
  const renderContent = () => {
    switch (assetType) {
      case "image":
        if (!assetUrl) return null;
        return (
          <div className="relative w-full h-full">
            <img
              src={assetUrl}
              alt={alt || "AR Image"}
              className="w-full h-full object-cover rounded-lg"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </div>
        );

      case "video":
        if (!assetUrl) return null;
        return (
          <div className="relative w-full h-full">
            <video
              src={assetUrl}
              className="w-full h-full object-cover rounded-lg"
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
          </div>
        );

      case "text":
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-700 leading-relaxed max-h-full overflow-y-auto">
              {assetContent || "Contenido de texto"}
            </p>
          </div>
        );

      case "model3d":
        if (!assetUrl) return null;
        
        return (
          <div className="relative w-full h-full">
            <model-viewer
              ref={modelViewerRef}
              src={assetUrl}
              alt={alt || "Modelo 3D AR"}
              camera-controls={!arState.isInAR}
              ar={enableAR && arState.isSupported}
              ar-modes="webxr scene-viewer quick-look"
              ar-scale={arScale}
              ar-placement={arPlacement}
              loading="eager"
              reveal-when-loaded
              shadow-intensity="0.5"
              shadow-softness="0.8" 
              environment-image="neutral"
              exposure="0.8"
              tone-mapping="neutral"
              interaction-policy="always-allow"
              camera-orbit={`${manualControls.rotation.y}deg ${manualControls.rotation.x + 55}deg ${4 / manualControls.scale}m`}
              min-camera-orbit="auto auto 1m"
              max-camera-orbit="auto auto 10m"
              className="w-full h-full rounded-lg model-viewer-container"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderFallback = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className={`mb-4 p-4 rounded-full ${config.bgColor}`}>
        <IconComponent className={`w-12 h-12 ${config.color}`} />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-2">
        {hasError ? "Error al cargar contenido" : config.label}
      </p>
      {enableAR && arState.isSupported && (
        <p className="text-xs text-blue-600">AR Disponible</p>
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <motion.div
        ref={containerRef}
        className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        style={{
          width: size,
          height: size,
          minWidth: 300,
          minHeight: 300,
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        }}
      >
        {/* Educational Mode Badge */}
        {educationalMode && (
          <div className="absolute top-3 left-3 z-20">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowEducationalPanel(!showEducationalPanel)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Info className="w-3 h-3" />
              Educativo
            </motion.button>
          </div>
        )}

        {/* AR Status */}
        {enableAR && arState.isSupported && (
          <div className="absolute top-3 right-3 z-20">
            <div className={`px-2 py-1 text-xs rounded-full ${
              arState.isInAR 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {arState.isInAR ? 'AR Activo' : 'AR Listo'}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="w-full h-full p-4">
          <div className="w-full h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-600">Cargando...</p>
              </div>
            ) : hasError ? (
              renderFallback()
            ) : (
              renderContent() || renderFallback()
            )}
          </div>
        </div>

        {/* Manual Controls */}
        {assetType === "model3d" && !arState.isInAR && (
          <div className="absolute bottom-3 left-3 right-3 z-20">
            <div className="flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
              
              {/* Movement Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove('x', -0.1)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Mover izquierda"
                >
                  <Move className="w-3 h-3 rotate-180" />
                </button>
                <button
                  onClick={() => handleMove('x', 0.1)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Mover derecha"
                >
                  <Move className="w-3 h-3" />
                </button>
              </div>

              <div className="w-px h-4 bg-gray-300"></div>

              {/* Rotation Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRotate('y', -15)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Rotar izquierda"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleRotate('y', 15)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Rotar derecha"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>

              <div className="w-px h-4 bg-gray-300"></div>

              {/* Scale Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleScale(-0.1)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Reducir"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleScale(0.1)}
                  className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="Aumentar"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>

              <div className="w-px h-4 bg-gray-300"></div>

              {/* Reset and AR */}
              <button
                onClick={resetControls}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Resetear"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              {enableAR && arState.isSupported && (
                <button
                  onClick={startAR}
                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Iniciar AR"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Simple AR Button for Non-3D Content */}
        {assetType !== "model3d" && enableAR && arState.isSupported && (
          <div className="absolute bottom-3 right-3 z-20">
            <button
              onClick={() => {
                // Future: Implement AR for non-3D content
                alert(`AR para ${config.label} próximamente`);
              }}
              className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              title={`Ver ${config.label} en AR`}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Educational Panel */}
      <AnimatePresence>
        {educationalMode && showEducationalPanel && educationalContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-full left-0 right-0 mt-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-30"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                {educationalContent.title || `Información sobre ${config.label}`}
              </h3>
              <button
                onClick={() => setShowEducationalPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {educationalContent.description && (
              <p className="text-sm text-gray-600 mb-3">
                {educationalContent.description}
              </p>
            )}
            
            {educationalContent.audioUrl && (
              <audio 
                controls 
                className="w-full"
                src={educationalContent.audioUrl}
              >
                Tu navegador no soporta audio.
              </audio>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExperienceCubeRefactored;