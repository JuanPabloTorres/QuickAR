"use client";

import React, { useEffect, useRef, useState } from "react";
import { AssetDto } from "@/types";

interface ModelViewerProps {
  assetUrl: string;
  asset: AssetDto;
  onClose: () => void;
  onTrackEvent: (event: string, data?: string) => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  assetUrl,
  asset,
  onClose,
  onTrackEvent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadModelViewer = async () => {
      try {
        // Check if model-viewer is already defined
        if (customElements.get("model-viewer")) {
          setModelViewerLoaded(true);
          return;
        }

        // Dynamically import model-viewer only after user interaction
        await import("@google/model-viewer");

        if (mounted) {
          setModelViewerLoaded(true);
          onTrackEvent("model_viewer_loaded", asset.id);
        }
      } catch (err) {
        console.error("Error loading model-viewer:", err);
        if (mounted) {
          setError("Error cargando visor 3D");
        }
      }
    };

    loadModelViewer();

    return () => {
      mounted = false;
    };
  }, [asset.id, onTrackEvent]);

  const handleClose = () => {
    onTrackEvent("model_viewer_close", asset.id);
    onClose();
  };

  const handleModelLoad = () => {
    setIsLoading(false);
    onTrackEvent("model_load_success", asset.id);
  };

  const handleModelError = () => {
    setIsLoading(false);
    setError("Error cargando modelo 3D");
    onTrackEvent("model_load_error", asset.id);
  };

  if (error) {
    return (
      <div className="ar-fullscreen">
        <div className="ar-error-screen">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Error en modelo 3D</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button onClick={handleClose} className="ar-btn ar-btn-secondary">
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-fullscreen" role="application" aria-label="Visor 3D AR">
      {/* Controles superiores */}
      <div className="ar-header ar-header-no-events">
        <div className="ar-header-content ar-header-content-auto">
          <h3 className="ar-title">3D: {asset.name}</h3>
          <button
            onClick={handleClose}
            className="ar-close-btn"
            aria-label="Cerrar visor 3D"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Contenedor del modelo */}
      <div ref={containerRef} className="ar-model-container">
        {modelViewerLoaded ? (
          React.createElement("model-viewer", {
            key: assetUrl,
            src: assetUrl,
            alt: asset.name,
            ar: true,
            "ar-modes": "webxr scene-viewer quick-look",
            "camera-controls": true,
            "environment-image": "neutral",
            "shadow-intensity": "1",
            "auto-rotate": true,
            "interaction-prompt": "auto",
            style: {
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
            },
            onLoad: handleModelLoad,
            onError: handleModelError,
            "aria-label": `Modelo 3D: ${asset.name}`,
          })
        ) : (
          <div className="ar-loading-content">
            <div className="ar-loading-spinner"></div>
            <p className="text-white">Cargando visor 3D...</p>
          </div>
        )}
      </div>

      {/* Controles inferiores */}
      <div className="ar-footer ar-footer-no-events">
        <div className="ar-footer-content ar-footer-content-auto">
          <div className="ar-instructions">
            🎲 Arrastra para rotar • 🔍 Pellizca para zoom • 📱 Toca AR para
            realidad aumentada
          </div>
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && modelViewerLoaded && (
        <div className="ar-loading-overlay">
          <div className="ar-loading-content">
            <div className="ar-loading-spinner"></div>
            <p>Cargando modelo 3D...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelViewer;
