/**
 * Universal Asset Viewer Component
 * Handles all asset types: image, video, model3d, message, webcontent
 */

"use client";

import { Asset } from "@/types";
import { useEffect, useState } from "react";

import {
  getFallbackAssetUrl,
  resolveAssetUrl as resolveAssetUrlAsync,
} from "@/lib/enhancedAssetResolver";

interface UniversalAssetViewerProps {
  asset: Asset;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  arMode?: boolean;
}

export function UniversalAssetViewer({
  asset,
  className = "",
  onLoad,
  onError,
  arMode = false,
}: UniversalAssetViewerProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve asset URL
  useEffect(() => {
    const resolveAssetUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`🔍 Resolving ${asset.assetType} URL for:`, asset.name);

        if (asset.assetType === "message") {
          // Messages don't need URL resolution
          setResolvedUrl("");
          onLoad?.();
          return;
        }

        const baseApiUrl =
          typeof window !== "undefined"
            ? `${window.location.protocol}//${window.location.hostname}:5001`
            : "http://localhost:5001";

        const result = await resolveAssetUrlAsync(
          asset.assetUrl,
          asset.name,
          asset.id,
          asset.assetType,
          baseApiUrl
        );

        if (result.isValid) {
          setResolvedUrl(result.url);
          console.log(`✅ Resolved ${asset.assetType} URL:`, result.url);
          onLoad?.();
        } else {
          // Try fallback URL
          const fallbackUrl = getFallbackAssetUrl(asset.assetType);
          if (fallbackUrl) {
            console.log(`🔄 Using fallback URL:`, fallbackUrl);
            setResolvedUrl(fallbackUrl);
            onLoad?.();
          } else {
            throw new Error(
              result.error || "No se pudo resolver la URL del asset"
            );
          }
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error resolving asset";
        console.error(`❌ Failed to resolve ${asset.assetType} URL:`, errorMsg);
        setError(errorMsg);
        onError?.(errorMsg);

        // Set fallback URL even on error
        const fallbackUrl = getFallbackAssetUrl(asset.assetType);
        if (fallbackUrl) {
          setResolvedUrl(fallbackUrl);
        }
      } finally {
        setIsLoading(false);
      }
    };

    resolveAssetUrl();
  }, [asset.assetUrl, asset.name, asset.id, asset.assetType, onLoad, onError]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <div>Cargando {getAssetTypeDisplayName(asset.assetType)}...</div>
          <div className="text-sm opacity-75 mt-1">{asset.name}</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-red-900 text-white ${className}`}
      >
        <div className="text-center max-w-md mx-4">
          <div className="text-2xl mb-2">❌</div>
          <div className="font-semibold">Error cargando asset</div>
          <div className="text-sm opacity-75 mt-2">{error}</div>
          <div className="text-xs opacity-50 mt-1">{asset.name}</div>
        </div>
      </div>
    );
  }

  // Render based on asset type
  switch (asset.assetType) {
    case "model3d":
      return (
        <Model3DViewer
          src={resolvedUrl}
          alt={asset.name}
          className={className}
          arMode={arMode}
          asset={asset}
        />
      );

    case "image":
      return (
        <ImageViewer
          src={resolvedUrl}
          alt={asset.name}
          className={className}
          asset={asset}
        />
      );

    case "video":
      return (
        <VideoViewer src={resolvedUrl} className={className} asset={asset} />
      );

    case "message":
      return (
        <MessageViewer
          content={asset.assetContent || ""}
          className={className}
          asset={asset}
        />
      );

    case "webcontent":
      return (
        <WebContentViewer
          url={resolvedUrl}
          className={className}
          asset={asset}
        />
      );

    default:
      return (
        <div
          className={`w-full h-full flex items-center justify-center bg-gray-800 text-white ${className}`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">❓</div>
            <div>Tipo de asset no soportado</div>
            <div className="text-sm opacity-75 mt-2">{asset.assetType}</div>
          </div>
        </div>
      );
  }
}

// Model 3D Viewer Component with Enhanced AR Support
function Model3DViewer({
  src,
  alt,
  className,
  arMode,
  asset,
}: {
  src: string | null;
  alt: string;
  className: string;
  arMode: boolean;
  asset: Asset;
}) {
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
  const [arReady, setArReady] = useState(false);
  const [arError, setArError] = useState<string | null>(null);
  // Add attributes after mount for better AR detection
  useEffect(() => {
    if (modelViewerLoaded) {
      const modelViewer = document.querySelector(".universal-model-viewer");
      if (modelViewer) {
        (modelViewer as any).dataset.assetId = asset.id;
        (modelViewer as any).dataset.assetName = asset.name;
        (modelViewer as any).id = "universal-model-viewer";
        console.log("🏷️ Model-viewer tagged for AR detection:", {
          element: modelViewer,
          id: asset.id,
          name: asset.name,
          className: modelViewer.className,
        });

        // Debug: Add to window for manual inspection
        (window as any).debugModelViewer = modelViewer;
      } else {
        console.warn("❌ Could not find model-viewer element for tagging");
      }
    }
  }, [modelViewerLoaded, asset.id, asset.name]);

  useEffect(() => {
    // Load model-viewer if not already loaded
    if (typeof window !== "undefined") {
      if (!customElements.get("model-viewer")) {
        console.log("🔄 Loading model-viewer...");
        import("@google/model-viewer")
          .then(() => {
            // Wait a bit for the custom element to be fully registered
            setTimeout(() => {
              setModelViewerLoaded(true);
              console.log("✅ Model-viewer loaded and registered");
            }, 100);
          })
          .catch((error) => {
            console.error("❌ Failed to load model-viewer:", error);
            setArError("Error cargando visor 3D");
          });
      } else {
        console.log("✅ Model-viewer already available");
        setModelViewerLoaded(true);
      }
    }
  }, []);

  // Check AR readiness
  useEffect(() => {
    if (!modelViewerLoaded) return;

    const checkARCapabilities = async () => {
      try {
        // Check WebXR support
        if (navigator.xr) {
          const arSupported = await navigator.xr.isSessionSupported(
            "immersive-ar"
          );
          console.log("🔍 WebXR AR Support:", arSupported);
          setArReady(arSupported);
        } else {
          // Fallback: model-viewer handles device-specific AR
          console.log("🔍 Using model-viewer AR fallback");
          setArReady(true);
        }
      } catch (error) {
        console.warn("AR capability check failed:", error);
        setArError("AR no disponible en este dispositivo");
        setArReady(false);
      }
    };

    checkARCapabilities();
  }, [modelViewerLoaded]);

  const handleModelError = (event: any) => {
    console.error("❌ Model loading failed:", event);
    setArError("Error cargando modelo 3D");
  };

  const handleARStatusChange = (event: any) => {
    console.log("🎯 AR Status:", event.detail);
    if (event.detail.status === "failed") {
      setArError("No se pudo iniciar AR");
    }
  };

  if (!modelViewerLoaded || !src) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div>Cargando visor 3D...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <model-viewer
        src={src}
        alt={alt}
        camera-controls
        auto-rotate={!arMode}
        auto-rotate-delay={3000}
        rotation-per-second="30deg"
        ar={arReady}
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        camera-orbit="0deg 75deg 1.5m"
        field-of-view="30deg"
        environment-image="neutral"
        shadow-intensity="1"
        className="w-full h-full universal-model-viewer"
        loading="eager"
        onError={() => handleModelError("Model loading error")}
      />

      {/* Enhanced 3D Model Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm max-w-48">
        <div className="flex items-center space-x-2">
          <span>📦</span>
          <span className="truncate">{asset.name}</span>
        </div>
        <div className="text-xs opacity-75 mt-1 flex items-center justify-between">
          <span>
            {src.split("/").pop()?.split("_").pop()?.toUpperCase() || "GLB"}
          </span>
          {arReady && <span className="text-green-300 ml-2">🎯 AR Ready</span>}
        </div>
      </div>

      {/* AR Instructions */}
      {arMode && arReady && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 bg-opacity-90 text-white p-3 rounded-lg max-w-xs text-center text-sm">
          <div className="font-semibold mb-1">🎯 Modo AR Activado</div>
          <div className="text-xs">
            Apunta la cámara hacia una superficie plana para colocar el objeto
          </div>
        </div>
      )}

      {/* AR Error Display */}
      {arError && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 bg-opacity-90 text-white p-3 rounded-lg max-w-xs text-center text-sm">
          <div className="font-semibold mb-1">❌ Error AR</div>
          <div className="text-xs">{arError}</div>
        </div>
      )}
    </div>
  );
}

// Image Viewer Component
function ImageViewer({
  src,
  alt,
  className,
  asset,
}: {
  src: string | null;
  alt: string;
  className: string;
  asset: Asset;
}) {
  if (!src) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <div>Imagen no disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        loading="lazy"
      />

      {/* Image Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
        <div>🖼️ {asset.name}</div>
        <div className="text-xs opacity-75">{asset.mimeType || "Imagen"}</div>
      </div>
    </div>
  );
}

// Video Viewer Component
function VideoViewer({
  src,
  className,
  asset,
}: {
  src: string | null;
  className: string;
  asset: Asset;
}) {
  if (!src) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🎥</div>
          <div>Video no disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <video src={src} controls className="w-full h-full" preload="metadata" />

      {/* Video Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
        <div>🎥 {asset.name}</div>
        <div className="text-xs opacity-75">{asset.mimeType || "Video"}</div>
      </div>
    </div>
  );
}

// Message Viewer Component
function MessageViewer({
  content,
  className,
  asset,
}: {
  content: string;
  className: string;
  asset: Asset;
}) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 text-white ${className}`}
    >
      <div className="text-center max-w-md mx-4 p-6">
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-xl font-semibold mb-4">{asset.name}</h3>
        {content ? (
          <p className="text-lg leading-relaxed">{content}</p>
        ) : (
          <div className="text-gray-300">Mensaje sin contenido</div>
        )}
      </div>
    </div>
  );
}

// Web Content Viewer Component
function WebContentViewer({
  url,
  className,
  asset,
}: {
  url: string | null;
  className: string;
  asset: Asset;
}) {
  if (!url) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🌐</div>
          <div>URL no disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <iframe src={url} className="w-full h-full border-0" title={asset.name} />

      {/* Web Content Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
        <div>🌐 {asset.name}</div>
        <div className="text-xs opacity-75">Contenido web</div>
      </div>
    </div>
  );
}

// Helper function
function getAssetTypeDisplayName(assetType: string): string {
  const displayNames: Record<string, string> = {
    message: "mensaje",
    video: "video",
    image: "imagen",
    model3d: "modelo 3D",
    webcontent: "contenido web",
  };

  return displayNames[assetType] || assetType;
}
