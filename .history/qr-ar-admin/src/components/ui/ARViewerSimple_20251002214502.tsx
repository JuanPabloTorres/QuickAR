"use client";

import { AssetDto } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Componente AR muy simple usando portal
const SimpleARModal: React.FC<{
  asset: AssetDto;
  assetUrl: string;
  assetName: string;
  onClose: () => void;
}> = ({ asset, assetUrl, assetName, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("No se pudo acceder a la cámara");
      }
    };

    startCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="ar-overlay">
          <div className="ar-content-wrapper">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button onClick={handleClose}>Cerrar</button>
          </div>
        </div>
      );
    }

    return (
      <div className="ar-overlay">
        <div className="ar-content-wrapper">
          {asset.mimeType?.includes("image") ? (
            <img 
              src={assetUrl} 
              alt={assetName}
              className="ar-overlay-image"
            />
          ) : asset.mimeType?.includes("model") ? (
            <div className="ar-model-overlay">
              <p>Modelo 3D: {assetName}</p>
            </div>
          ) : (
            <div className="ar-message-bubble">
              <h3>{assetName}</h3>
              <p>Contenido AR</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const modalContent = (
    <div className="ar-fullscreen">
      {/* Video de cámara */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="ar-camera-video"
      />

      {/* Header */}
      <div className="ar-header">
        <div className="ar-header-content">
          <h3 className="ar-title">AR: {assetName}</h3>
          <button onClick={handleClose} className="ar-close-btn">
            ❌ Cerrar
          </button>
        </div>
      </div>

      {/* Contenido central */}
      {renderContent()}

      {/* Footer */}
      <div className="ar-footer">
        <div className="ar-footer-content">
          <div className="ar-controls-grid">
            <button className="ar-toggle-btn">🔄 Reset</button>
            <button className="ar-toggle-btn">✨ Animar</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Usar portal para renderizar en el body
  return typeof window !== "undefined" 
    ? createPortal(modalContent, document.body)
    : null;
};

// Componente principal que se exporta
interface ARViewerProps {
  asset: AssetDto;
  assetUrl: string;
  assetName: string;
  onClose: () => void;
  onTrackEvent?: (event: string, data?: string) => void;
}

const ARViewer: React.FC<ARViewerProps> = (props) => {
  return <SimpleARModal {...props} />;
};

export default ARViewer;