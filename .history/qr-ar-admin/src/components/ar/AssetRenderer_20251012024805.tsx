"use client";

import { Asset } from "@/types";
import React, { useEffect, useRef, useState } from "react";

interface AssetRendererProps {
  asset: Asset;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export function AssetRenderer({
  asset,
  className = "",
  onLoad,
  onError,
}: AssetRendererProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Import model-viewer for 3D models only once
    if (asset.assetType === "model3d") {
      const loadModelViewer = async () => {
        try {
          await import("@google/model-viewer");
          console.log("Model viewer loaded for:", asset.assetUrl);
        } catch (error) {
          console.error("Failed to load model-viewer:", error);
          handleError("No se pudo cargar el visor de modelos 3D");
        }
      };
      loadModelViewer();
    }
  }, [asset.id, asset.assetType]);  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const renderLoadingState = () => (
    <div
      className={`animate-pulse bg-muted rounded-lg flex items-center justify-center ${className}`}
    >
      <div className="text-muted-foreground">Cargando...</div>
    </div>
  );

  const renderErrorState = () => (
    <div
      className={`bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-center p-4 ${className}`}
    >
      <div className="text-destructive text-sm text-center">
        <div className="font-medium">Error al cargar</div>
        <div className="text-xs mt-1">{error}</div>
      </div>
    </div>
  );

  if (error) return renderErrorState();

  switch (asset.assetType) {
    case "image":
      return (
        <div className={`relative ${className}`}>
          {isLoading && renderLoadingState()}
          <img
            src={asset.assetUrl}
            alt={asset.name}
            className={`asset-image w-full h-full object-contain ${
              isLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
            onLoad={handleLoad}
            onError={() => handleError("No se pudo cargar la imagen")}
          />
        </div>
      );

    case "video":
      return (
        <div className={`relative ${className}`}>
          {isLoading && renderLoadingState()}
          <video
            ref={videoRef}
            src={asset.assetUrl}
            className={`asset-video w-full h-full object-contain ${
              isLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
            controls
            muted
            playsInline
            onLoadedData={handleLoad}
            onError={() => handleError("No se pudo cargar el video")}
          />
        </div>
      );

    case "model3d":
      return (
        <div className={`relative ${className}`}>
          {isLoading && renderLoadingState()}
          <model-viewer
            src={asset.assetUrl}
            alt={asset.name}
            className={`asset-model w-full h-full ${
              isLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
            camera-controls="true"
            touch-action="pan-y"
            auto-rotate="false"
            loading="eager"
            reveal="auto"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="auto"
            camera-orbit="0deg 75deg 105%"
            min-camera-orbit="auto auto 50%"
            max-camera-orbit="auto auto 200%"
            shadow-intensity="1"
            environment-image="neutral"
            exposure="1"
            onLoad={handleLoad}
            onError={() => {
              console.error("Model loading error, URL:", asset.assetUrl);
              handleError(`No se pudo cargar el modelo 3D: ${asset.assetUrl}`);
            }}
          />
        </div>
      );

    case "message":
      return (
        <div className={`asset-text ${className}`}>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-3">
              {asset.name}
            </h3>
            <p className="text-blue-200 leading-relaxed">
              {asset.assetContent}
            </p>
          </div>
        </div>
      );

    case "webcontent":
      return (
        <div className={`relative ${className}`}>
          {isLoading && renderLoadingState()}
          <iframe
            src={asset.assetUrl}
            title={asset.name}
            className={`asset-webcontent w-full h-full border-0 rounded-lg ${
              isLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
            onLoad={handleLoad}
            onError={() => handleError("No se pudo cargar el contenido web")}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      );

    default:
      return (
        <div
          className={`bg-muted border border-muted-foreground/20 rounded-lg flex items-center justify-center p-4 ${className}`}
        >
          <div className="text-muted-foreground text-center">
            <div className="text-2xl mb-2">❓</div>
            <div className="font-medium">Tipo de asset no soportado</div>
            <div className="text-xs mt-1">Tipo: {asset.assetType}</div>
          </div>
        </div>
      );
  }
}

// Type declaration for model-viewer with full AR capabilities
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": {
        src?: string;
        alt?: string;
        className?: string;
        "camera-controls"?: boolean;
        "touch-action"?: string;
        "auto-rotate"?: boolean;
        ar?: boolean;
        "ar-modes"?: string;
        "ar-scale"?: string;
        "camera-orbit"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        "shadow-intensity"?: string;
        "environment-image"?: string;
        exposure?: string;
        "field-of-view"?: string;
        "interaction-prompt"?: string;
        loading?: string;
        poster?: string;
        onLoad?: () => void;
        onError?: () => void;
        children?: React.ReactNode;
      };
    }
  }
}
