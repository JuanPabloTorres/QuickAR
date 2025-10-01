"use client";

import React, { useEffect, useRef, useState } from "react";
import { AssetDto } from "@/types";

interface CameraViewerProps {
  stream: MediaStream;
  asset: AssetDto;
  assetUrl: string;
  onClose: () => void;
  onTrackEvent: (event: string, data?: string) => void;
}

const CameraViewer: React.FC<CameraViewerProps> = ({
  stream,
  asset,
  assetUrl,
  onClose,
  onTrackEvent,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;

    const handleLoadedMetadata = () => {
      setIsVideoReady(true);
      onTrackEvent("camera_ready", asset.id);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [stream, asset.id, onTrackEvent]);

  const handleClose = () => {
    onTrackEvent("camera_close", asset.id);
    onClose();
  };

  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
    onTrackEvent("overlay_toggle", overlayVisible ? "hide" : "show");
  };

  return (
    <div
      className="ar-fullscreen"
      role="application"
      aria-label="Modo cámara AR"
    >
      {/* Video de cámara de fondo */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="ar-camera-video"
        aria-label="Vista de cámara en tiempo real"
      />

      {/* Controles superiores */}
      <div className="ar-header" style={{ pointerEvents: "none" }}>
        <div className="ar-header-content" style={{ pointerEvents: "auto" }}>
          <h3 className="ar-title">AR: {asset.name}</h3>
          <button
            onClick={handleClose}
            className="ar-close-btn"
            aria-label="Cerrar modo AR"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Overlay de contenido */}
      {overlayVisible && isVideoReady && (
        <div className="ar-overlay" style={{ pointerEvents: "none" }}>
          <div className="ar-content-wrapper">
            {asset.kind === "image" && (
              <img
                src={assetUrl}
                alt={asset.name}
                className="ar-overlay-image"
                onLoad={() => onTrackEvent("overlay_image_load", asset.id)}
                onError={() => onTrackEvent("overlay_image_error", asset.id)}
              />
            )}

            {asset.kind === "video" && (
              <video
                src={assetUrl}
                autoPlay
                loop
                muted
                className="ar-overlay-video"
                onLoadedData={() =>
                  onTrackEvent("overlay_video_load", asset.id)
                }
                onError={() => onTrackEvent("overlay_video_error", asset.id)}
              />
            )}
          </div>
        </div>
      )}

      {/* Controles inferiores */}
      <div className="ar-footer" style={{ pointerEvents: "none" }}>
        <div className="ar-footer-content" style={{ pointerEvents: "auto" }}>
          <button
            onClick={toggleOverlay}
            className="ar-toggle-btn"
            aria-label={
              overlayVisible ? "Ocultar contenido" : "Mostrar contenido"
            }
          >
            {overlayVisible ? "👁️ Ocultar" : "👁️‍🗨️ Mostrar"}
          </button>

          <div className="ar-instructions">
            📱 Mueve el dispositivo para explorar
          </div>
        </div>
      </div>

      {/* Estado de carga */}
      {!isVideoReady && (
        <div className="ar-loading-overlay">
          <div className="ar-loading-content">
            <div className="ar-loading-spinner"></div>
            <p>Iniciando cámara...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraViewer;
