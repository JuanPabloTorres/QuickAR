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

  // Check AR support
  const checkARSupport = useCallback(async () => {
    const isSecure =
      window.isSecureContext ||
      location.protocol === "https:" ||
      location.hostname === "localhost";
    
    if (!isSecure) {
      console.log("AR requiere contexto seguro (HTTPS o localhost)");
      setState((prev) => ({ ...prev, supportsAR: false }));
      return false;
    }

    // Verificar soporte WebXR
    let hasWebXR = false;
    if ("xr" in navigator) {
      try {
        const xr = (navigator as any).xr;
        if (xr && typeof xr.isSessionSupported === "function") {
          hasWebXR = await xr.isSessionSupported("immersive-ar");
        }
      } catch (error) {
        console.log("WebXR no soportado:", error);
      }
    }

    // Verificar otros métodos AR (Scene Viewer en Android, Quick Look en iOS)
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    const hasSceneViewer = isAndroid && 'DeviceOrientationEvent' in window;
    const hasQuickLook = isIOS;
    
    const supportsAR = hasWebXR || hasSceneViewer || hasQuickLook;
    
    console.log("AR Support Check:", {
      isSecure,
      hasWebXR,
      hasSceneViewer,
      hasQuickLook,
      isMobile,
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

      // Add native AR button as slot if AR is supported
      if (state.supportsAR) {
        const arButton = document.createElement("button");
        arButton.setAttribute("slot", "ar-button");
        arButton.style.cssText = `
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        `;
        arButton.innerHTML = `<span style="font-size: 18px;">🥽</span> Ver en AR`;
        
        arButton.addEventListener("mouseenter", () => {
          arButton.style.background = "#2563eb";
          arButton.style.transform = "scale(1.05)";
        });
        
        arButton.addEventListener("mouseleave", () => {
          arButton.style.background = "#3b82f6";
          arButton.style.transform = "scale(1)";
        });

        modelViewer.appendChild(arButton);
      }

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

  const handleARClick = useCallback(async () => {
    if (!modelViewerRef.current || !state.supportsAR) {
      console.warn("AR no soportado o modelo no cargado");
      return;
    }

    onTrackEvent("ar_activation_attempt", asset.id);

    try {
      const modelViewer = modelViewerRef.current;
      
      console.log("Intentando activar AR...");
      console.log("Model viewer elemento:", modelViewer);
      console.log("canActivateAR:", modelViewer.canActivateAR);
      
      // Verificar si AR está disponible
      if (modelViewer.canActivateAR) {
        console.log("Activando AR...");
        await modelViewer.activateAR();
        onTrackEvent("ar_activated", asset.id);
      } else {
        // Fallback: Intentar hacer click en el botón AR nativo del model-viewer
        const arButton = modelViewer.shadowRoot?.querySelector('button[slot="ar-button"]') ||
                        modelViewer.querySelector('button[slot="ar-button"]');
        
        if (arButton) {
          console.log("Usando botón AR nativo...");
          (arButton as HTMLButtonElement).click();
          onTrackEvent("ar_fallback_activated", asset.id);
        } else {
          console.warn("AR no disponible para este modelo");
          onTrackEvent("ar_not_available", asset.id);
          
          // Mostrar mensaje al usuario
          alert("Realidad Aumentada no está disponible en este dispositivo o navegador.");
        }
      }
    } catch (error) {
      console.error("Error al activar AR:", error);
      onTrackEvent("ar_error", `${asset.id}_${error}`);
      alert("Error al activar Realidad Aumentada. Intenta desde un dispositivo móvil compatible.");
    }
  }, [state.supportsAR, asset.id, onTrackEvent]);

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
          {/* AR Button */}
          {state.supportsAR && (
            <button
              onClick={handleARClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
              aria-label="Ver en Realidad Aumentada"
            >
              <span className="text-lg">🥽</span>
              Ver en AR
            </button>
          )}

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
