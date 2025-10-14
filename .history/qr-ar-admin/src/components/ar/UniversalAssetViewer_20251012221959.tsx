/**
 * Universal Asset Viewer Component
 * Handles all asset types: image, video, model3d, message, webcontent
 */

"use client";

import { smartResolveAssetUrl } from "@/lib/helpers/assetUrlResolver";
import { Asset } from "@/types";
import { useEffect, useState } from "react";

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
        
        let resolved: string;
        if (asset.assetType === "message") {
          // Messages don't need URL resolution
          resolved = "";
        } else {
          resolved = await smartResolveAssetUrl(
            asset.assetUrl,
            asset.name,
            asset.id,
            asset.assetType
          );
        }

        // Make URL absolute if needed
        const fullUrl = resolved && resolved.startsWith("/")
          ? `${typeof window !== "undefined" ? window.location.origin : "http://localhost:5001"}${resolved}`
          : resolved;

        setResolvedUrl(fullUrl);
        console.log(`✅ Resolved ${asset.assetType} URL:`, fullUrl);
        onLoad?.();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error resolving asset";
        console.error(`❌ Failed to resolve ${asset.assetType} URL:`, errorMsg);
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    resolveAssetUrl();
  }, [asset.assetUrl, asset.name, asset.id, asset.assetType, onLoad, onError]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}>
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
      <div className={`w-full h-full flex items-center justify-center bg-red-900 text-white ${className}`}>
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
        <VideoViewer
          src={resolvedUrl}
          className={className}
          asset={asset}
        />
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
        <div className={`w-full h-full flex items-center justify-center bg-gray-800 text-white ${className}`}>
          <div className="text-center">
            <div className="text-2xl mb-2">❓</div>
            <div>Tipo de asset no soportado</div>
            <div className="text-sm opacity-75 mt-2">{asset.assetType}</div>
          </div>
        </div>
      );
  }
}

// Model 3D Viewer Component
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

  useEffect(() => {
    // Load model-viewer if not already loaded
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      import("@google/model-viewer").then(() => {
        setModelViewerLoaded(true);
      });
    } else {
      setModelViewerLoaded(true);
    }
  }, []);

  if (!modelViewerLoaded || !src) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}>
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
        ar={arMode}
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        camera-orbit="0deg 75deg 1.5m"
        field-of-view="30deg"
        className="w-full h-full"
        loading="eager"
        reveal="auto"
      />

      {/* 3D Model Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
        <div>📦 {asset.name}</div>
        <div className="text-xs opacity-75">
          {src.split("/").pop()?.split("_").pop()?.toUpperCase() || "GLB"}
        </div>
      </div>
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
      <div className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}>
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
        <div className="text-xs opacity-75">
          {asset.mimeType || "Imagen"}
        </div>
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
      <div className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}>
        <div className="text-center">
          <div className="text-2xl mb-2">🎥</div>
          <div>Video no disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <video
        src={src}
        controls
        className="w-full h-full"
        preload="metadata"
      />
      
      {/* Video Info Overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
        <div>🎥 {asset.name}</div>
        <div className="text-xs opacity-75">
          {asset.mimeType || "Video"}
        </div>
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
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 text-white ${className}`}>
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
      <div className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}>
        <div className="text-center">
          <div className="text-2xl mb-2">🌐</div>
          <div>URL no disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      <iframe
        src={url}
        className="w-full h-full border-0"
        title={asset.name}
        loading="lazy"
      />
      
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