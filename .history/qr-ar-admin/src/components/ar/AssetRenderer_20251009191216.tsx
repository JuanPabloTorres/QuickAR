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
  }, [asset.id]);

  const handleLoad = () => {
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
            camera-controls
            touch-action="pan-y"
            auto-rotate={false}
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
            onError={() => handleError("No se pudo cargar el modelo 3D")}
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

// Type declaration for model-viewer
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
        onLoad?: () => void;
        onError?: () => void;
        children?: React.ReactNode;
      };
    }
  }
}
