"use client";

import { logAssetInfo, normalizeAssetUrl } from "@/lib/assets";
import { AssetDto } from "@/types";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface Enhanced3DViewerProps {
  asset: AssetDto;
  onTrackEvent: (event: string, data?: string) => void;
  className?: string;
}

interface ViewerState {
  isLoading: boolean;
  error: string | null;
  modelViewerLoaded: boolean;
  isModelLoaded: boolean;
  supportsAR: boolean;
}

const Enhanced3DViewer: React.FC<Enhanced3DViewerProps> = ({
  asset,
  onTrackEvent,
  className = "",
}) => {
  // AR Grid CSS
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ar-grid-bg {
        background-image: 
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
        animation: ar-grid-pulse 3s ease-in-out infinite;
      }
      
      @keyframes ar-grid-pulse {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 0.4; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);
  const modelViewerRef = useRef<any>(null);

  const [state, setState] = useState<ViewerState>({
    isLoading: true,
    error: null,
    modelViewerLoaded: false,
    isModelLoaded: false,
    supportsAR: false,
  });

  const assetUrl = React.useMemo(() => {
    logAssetInfo(asset, "Enhanced3DViewer");
    const normalizedUrl = normalizeAssetUrl(asset);

    if (!normalizedUrl) {
      console.warn("No se pudo normalizar URL para asset 3D:", asset.name);
      return "";
    }

    console.log("URL final para modelo 3D:", normalizedUrl);
    return normalizedUrl;
  }, [asset]);

  // Check AR support - usando la misma lógica simple que el ARViewer original
  const checkARSupport = useCallback(() => {
    const isSecure =
      window.isSecureContext ||
      location.protocol === "https:" ||
      location.hostname === "localhost";
    
    const hasCamera = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );

    const supportsAR = hasCamera && isSecure;
    
    console.log("AR Support Check:", {
      isSecure,
      hasCamera,
      supportsAR
    });

    setState((prev) => ({ ...prev, supportsAR }));
    return supportsAR;
  }, []);

  // Load model-viewer library
  useEffect(() => {
    let mounted = true;

    const loadModelViewer = async () => {
      try {
        // Check if already loaded
        if (window.customElements?.get("model-viewer")) {
          if (mounted) {
            setState((prev) => ({ ...prev, modelViewerLoaded: true }));
          }
          return;
        }

        console.log("Loading @google/model-viewer...");
        await import("@google/model-viewer");

        if (mounted) {
          setState((prev) => ({ ...prev, modelViewerLoaded: true }));
          onTrackEvent("model_viewer_library_loaded", asset.id);
        }
      } catch (error) {
        console.error("Error loading model-viewer:", error);
        if (mounted) {
          setState((prev) => ({
            ...prev,
            error: "Error al cargar el visor 3D",
            isLoading: false,
          }));
        }
      }
    };

    loadModelViewer();
    checkARSupport();

    return () => {
      mounted = false;
    };
  }, [asset.id, onTrackEvent, checkARSupport]);

  // Initialize model viewer element
  useEffect(() => {
    if (!state.modelViewerLoaded || !containerRef.current || !assetUrl) {
      return;
    }

    const initializeModelViewer = () => {
      const container = containerRef.current;
      if (!container) return;

      // Clear previous content
      container.innerHTML = "";

      // Create model-viewer element
      const modelViewer = document.createElement("model-viewer");

      // Essential attributes for proper 3D interaction
      modelViewer.setAttribute("src", assetUrl);
      modelViewer.setAttribute("alt", asset.name);

      // Enable native controls - this is key for proper drag/rotation!
      modelViewer.setAttribute("camera-controls", "true");
      modelViewer.setAttribute("touch-action", "pan-y");
      modelViewer.setAttribute("interaction-policy", "always-allow");

      // Visual enhancements
      modelViewer.setAttribute("environment-image", "neutral");
      modelViewer.setAttribute("shadow-intensity", "0.3");
      modelViewer.setAttribute("auto-rotate", "true");
      modelViewer.setAttribute("auto-rotate-delay", "3000");

      // AR capabilities
      if (state.supportsAR) {
        modelViewer.setAttribute("ar", "true");
        modelViewer.setAttribute("ar-modes", "webxr scene-viewer quick-look");
        modelViewer.setAttribute("ar-scale", "auto");
      }

      // Performance settings
      modelViewer.setAttribute("loading", "eager");
      modelViewer.setAttribute("reveal", "auto");

      // Camera settings for better 3D experience
      modelViewer.setAttribute("camera-orbit", "0deg 75deg 105%");
      modelViewer.setAttribute("min-camera-orbit", "auto auto 50%");
      modelViewer.setAttribute("max-camera-orbit", "auto auto 200%");
      modelViewer.setAttribute("field-of-view", "30deg");

      // Styling
      modelViewer.style.width = "100%";
      modelViewer.style.height = "100%";
      modelViewer.style.borderRadius = "12px";
      modelViewer.style.backgroundColor = "transparent";

      // Event listeners
      modelViewer.addEventListener("load", () => {
        console.log("3D Model cargado exitosamente:", asset.name);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isModelLoaded: true,
          error: null,
        }));
        onTrackEvent("model_3d_loaded", asset.id);
      });

      modelViewer.addEventListener("error", (e: any) => {
        console.error("Error al cargar modelo 3D:", asset.name, e);
        setState((prev) => ({
          ...prev,
          error: `Error al cargar el modelo: ${asset.name}`,
          isLoading: false,
        }));
        onTrackEvent("model_3d_error", `${asset.id}_${e.type}`);
      });

      modelViewer.addEventListener("camera-change", () => {
        onTrackEvent("model_camera_changed", asset.id);
      });



      // Add to container
      container.appendChild(modelViewer);
      modelViewerRef.current = modelViewer;

      console.log("Enhanced 3D Viewer inicializado para:", asset.name);
    };

    const timer = setTimeout(initializeModelViewer, 100);
    return () => clearTimeout(timer);
  }, [
    state.modelViewerLoaded,
    assetUrl,
    asset.name,
    asset.id,
    state.supportsAR,
    onTrackEvent,
  ]);

  const [showAR, setShowAR] = useState(false);

  const handleStartAR = useCallback(() => {
    onTrackEvent("ar_start_attempt", asset.id);
    setShowAR(true);
  }, [asset.id, onTrackEvent]);

  const handleStopAR = useCallback(() => {
    onTrackEvent("ar_stop", asset.id);
    setShowAR(false);
  }, [asset.id, onTrackEvent]);

  const handleARClick = useCallback(() => {
    if (!state.supportsAR) {
      console.warn("AR no soportado");
      alert("Realidad Aumentada no está disponible en este dispositivo o navegador.");
      return;
    }

    // Activar experiencia AR dedicada (como el ARViewer original)
    handleStartAR();
  }, [state.supportsAR, handleStartAR]);

  if (state.error) {
    return (
      <div
        className={`relative bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-8 ${className}`}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error al cargar modelo 3D
          </h3>
          <p className="text-sm text-red-600 mb-4">{state.error}</p>
          <div className="text-xs text-red-500 opacity-75">
            Archivo: {asset.name} • Formato: {asset.mimeType}
          </div>
        </div>
      </div>
    );
  }

  // AR Experience View
  if (showAR) {
    return (
      <div className={`relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-xl overflow-hidden ${className}`}>
        {/* AR Background */}
        <div className="absolute inset-0">
          <div className="ar-grid-bg opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* AR Header */}
        <div className="relative z-10 p-6 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 mb-6">
            <span className="text-2xl">🥽</span>
            <div className="text-left">
              <h2 className="text-xl font-bold text-white">{asset.name}</h2>
              <p className="text-blue-200 text-sm">Experiencia AR Activada</p>
            </div>
          </div>
        </div>

        {/* AR Model Container */}
        <div className="relative z-10 px-6 pb-24">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div 
              ref={containerRef}
              className="w-full h-80 relative touch-pan-y select-none rounded-xl overflow-hidden"
            />
          </div>
        </div>

        {/* AR Instructions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-center mb-4">
            <p className="text-white text-sm mb-2">
              🎯 Mueve tu dispositivo para explorar en realidad aumentada
            </p>
            <p className="text-blue-200 text-xs">
              Usa los controles para rotar, hacer zoom y explorar el modelo 3D
            </p>
          </div>
          
          {/* AR Controls */}
          <div className="flex justify-center">
            <button
              onClick={handleStopAR}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-medium text-sm shadow-lg flex items-center gap-2 transition-all duration-200"
            >
              <span className="text-lg">❌</span>
              Salir de AR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden ${className}`}
    >
      {/* Loading State */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm font-medium text-slate-600">
              {!state.modelViewerLoaded
                ? "Inicializando visor 3D..."
                : "Cargando modelo..."}
            </p>
          </div>
        </div>
      )}

      {/* 3D Model Container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[400px] relative touch-pan-y select-none"
      />

      {/* Controls Overlay */}
      {state.isModelLoaded && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          {/* AR Button - siempre mostrar para testing */}
          <button
            onClick={handleARClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
            aria-label="Ver en Realidad Aumentada"
          >
            <span className="text-lg">🥽</span>
            Ver en AR
          </button>

          {/* Info Button */}
          <button
            onClick={() => onTrackEvent("model_info_viewed", asset.id)}
            className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            aria-label="Información del modelo"
            title={`${asset.name} • ${asset.mimeType}`}
          >
            <span className="text-lg">ℹ️</span>
          </button>
        </div>
      )}

      {/* Model Info */}
      {state.isModelLoaded && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <h3 className="font-semibold text-slate-800 text-sm">{asset.name}</h3>
          <p className="text-xs text-slate-600">
            🎲 Modelo 3D • Arrastra para rotar
          </p>
        </div>
      )}



      {/* Instructions for first-time users */}
      {state.isModelLoaded && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span>🖱️</span>
            <span>Arrastra: Rotar • Scroll: Zoom</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enhanced3DViewer;
