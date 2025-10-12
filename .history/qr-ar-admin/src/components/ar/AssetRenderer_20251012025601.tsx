"use client";

import { Asset } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { ModelViewer } from "./ModelViewer";

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
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setIframeBlocked(false);
  }, [asset.id]);

  // Función para detectar si el iframe está siendo bloqueado
  useEffect(() => {
    if (asset.assetType === "webcontent" && iframeRef.current) {
      const iframe = iframeRef.current;
      
      // Timeout para detectar si el iframe no carga
      const timeout = setTimeout(() => {
        try {
          // Intentar acceder al contenido del iframe
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDoc) {
            setIframeBlocked(true);
            setIsLoading(false);
          }
        } catch (e) {
          // Error de acceso = probablemente bloqueado por CSP
          setIframeBlocked(true);
          setIsLoading(false);
        }
      }, 3000);

      const handleIframeLoad = () => {
        clearTimeout(timeout);
        try {
          // Verificar si realmente cargó el contenido
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDoc || iframeDoc.body.children.length === 0) {
            setIframeBlocked(true);
          }
          setIsLoading(false);
        } catch (e) {
          setIframeBlocked(true);
          setIsLoading(false);
        }
      };

      const handleIframeError = () => {
        clearTimeout(timeout);
        setIframeBlocked(true);
        setIsLoading(false);
      };

      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);

      return () => {
        clearTimeout(timeout);
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
      };
    }
  }, [asset.assetType, asset.assetUrl]);
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
          <ModelViewer
            src={asset.assetUrl}
            alt={asset.name}
            className={`asset-model w-full h-full ${
              isLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
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
      if (iframeBlocked) {
        return (
          <div className={`relative ${className}`}>
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {asset.name}
              </h3>
              <p className="text-blue-200 mb-4 text-sm">
                Este sitio web no permite ser mostrado en ventanas embebidas por razones de seguridad.
              </p>
              <a
                href={asset.assetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir en nueva ventana
              </a>
              <div className="mt-3 text-xs text-blue-300/70">
                URL: {asset.assetUrl}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className={`relative ${className}`}>
          {isLoading && renderLoadingState()}
          <iframe
            ref={iframeRef}
            src={asset.assetUrl}
            title={asset.name}
            className={`asset-webcontent w-full h-full border-0 rounded-lg ${
              isLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-300`}
            onLoad={handleLoad}
            onError={() => {
              setIframeBlocked(true);
              handleError("No se pudo cargar el contenido web");
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
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
