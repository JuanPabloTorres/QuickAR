"use client";

import { normalizeAssetUrl } from "@/lib/assets";
import { AssetDto } from "@/types";
import dynamic from "next/dynamic";
import React, { useCallback, useState } from "react";
import Enhanced3DViewer from "./Enhanced3DViewer";

// Dynamic imports for specialized renderers
const ARViewer = dynamic(() => import("./ARViewer"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-slate-200 rounded-xl h-96 flex items-center justify-center">
      Cargando visor AR...
    </div>
  ),
});

interface ModernAssetCarouselProps {
  assets: AssetDto[];
  initialIndex?: number;
  onTrackEvent: (event: string, data?: string) => void;
  className?: string;
}

type AssetKind = "image" | "video" | "model3d" | "message" | "unknown";

const ModernAssetCarousel: React.FC<ModernAssetCarouselProps> = ({
  assets,
  initialIndex = 0,
  onTrackEvent,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showAR, setShowAR] = useState(false);

  const currentAsset = assets[currentIndex];

  const getAssetKind = useCallback((asset: AssetDto): AssetKind => {
    const mime = asset.mimeType?.toLowerCase() || "";
    const url = asset.url || "";
    const ext = url.split(".").pop()?.toLowerCase() || "";

    if (
      mime.startsWith("image/") ||
      ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(ext)
    ) {
      return "image";
    }
    if (
      mime.startsWith("video/") ||
      ["mp4", "webm", "ogg", "mov"].includes(ext)
    ) {
      return "video";
    }
    if (
      mime.includes("model/") ||
      mime === "application/octet-stream" ||
      ["glb", "gltf", "obj", "fbx", "dae", "3ds", "ply", "stl"].includes(ext)
    ) {
      return "model3d";
    }
    if (asset.text && asset.text.trim()) {
      return "message";
    }
    return "unknown";
  }, []);

  const navigateToAsset = useCallback(
    (index: number) => {
      if (index >= 0 && index < assets.length && index !== currentIndex) {
        setCurrentIndex(index);
        onTrackEvent("asset_navigation", `${currentIndex}_to_${index}`);
      }
    },
    [assets.length, currentIndex, onTrackEvent]
  );

  const nextAsset = useCallback(() => {
    const nextIndex = currentIndex < assets.length - 1 ? currentIndex + 1 : 0;
    navigateToAsset(nextIndex);
  }, [currentIndex, assets.length, navigateToAsset]);

  const prevAsset = useCallback(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : assets.length - 1;
    navigateToAsset(prevIndex);
  }, [currentIndex, assets.length, navigateToAsset]);

  const handleARToggle = useCallback(() => {
    setShowAR((prev) => {
      const newState = !prev;
      onTrackEvent("ar_toggle", newState ? "open" : "close");
      return newState;
    });
  }, [onTrackEvent]);

  const renderAssetContent = useCallback(
    (asset: AssetDto) => {
      const assetKind = getAssetKind(asset);
      const assetUrl = normalizeAssetUrl(asset);

      switch (assetKind) {
        case "model3d":
          return (
            <Enhanced3DViewer
              asset={asset}
              onTrackEvent={onTrackEvent}
              className="h-full"
            />
          );

        case "image":
          return (
            <div className="relative h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden">
              <img
                src={assetUrl}
                alt={asset.name}
                className="w-full h-full object-cover"
                onLoad={() => onTrackEvent("image_loaded", asset.id)}
                onError={() => onTrackEvent("image_error", asset.id)}
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <h3 className="font-semibold text-slate-800 text-sm">
                  {asset.name}
                </h3>
                <p className="text-xs text-slate-600">🖼️ Imagen</p>
              </div>
            </div>
          );

        case "video":
          return (
            <div className="relative h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden">
              <video
                src={assetUrl}
                controls
                muted
                loop
                className="w-full h-full object-cover"
                onLoadedData={() => onTrackEvent("video_loaded", asset.id)}
                onError={() => onTrackEvent("video_error", asset.id)}
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <h3 className="font-semibold text-slate-800 text-sm">
                  {asset.name}
                </h3>
                <p className="text-xs text-slate-600">🎥 Video</p>
              </div>
            </div>
          );

        case "message":
          return (
            <div className="relative h-full bg-gradient-to-br from-blue-100 to-purple-200 rounded-xl flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-6">💬</div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  {asset.name}
                </h3>
                {asset.text && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-slate-700">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {asset.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );

        default:
          return (
            <div className="h-full bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
              <div className="text-center text-slate-600">
                <div className="text-4xl mb-4">❓</div>
                <p className="text-sm">Tipo de contenido no soportado</p>
                <p className="text-xs opacity-75 mt-1">{asset.mimeType}</p>
              </div>
            </div>
          );
      }
    },
    [getAssetKind, onTrackEvent]
  );

  const getAssetIcon = (asset: AssetDto): string => {
    const kind = getAssetKind(asset);
    switch (kind) {
      case "model3d":
        return "🎲";
      case "image":
        return "🖼️";
      case "video":
        return "🎥";
      case "message":
        return "💬";
      default:
        return "📄";
    }
  };

  const canUseAR = (asset: AssetDto): boolean => {
    const kind = getAssetKind(asset);
    return ["model3d", "image", "video", "message"].includes(kind);
  };

  if (showAR && canUseAR(currentAsset)) {
    return (
      <ARViewer
        asset={currentAsset}
        onTrackEvent={(event, data) => {
          if (event === "ar_stop") {
            setShowAR(false);
          }
          onTrackEvent(event, data);
        }}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Content Area */}
      <div className="h-96 mb-6">{renderAssetContent(currentAsset)}</div>

      {/* Navigation Controls */}
      {assets.length > 1 && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={prevAsset}
            className="bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 border border-slate-200"
            aria-label="Asset anterior"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border border-slate-200">
            <span className="text-sm font-medium text-slate-700">
              {currentIndex + 1} de {assets.length}
            </span>
          </div>

          <button
            onClick={nextAsset}
            className="bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 border border-slate-200"
            aria-label="Asset siguiente"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Asset Thumbnails */}
      {assets.length > 1 && (
        <div className="flex gap-2 justify-center mb-6 overflow-x-auto pb-2">
          {assets.map((asset, index) => (
            <button
              key={asset.id}
              onClick={() => navigateToAsset(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-2xl ${
                index === currentIndex
                  ? "border-blue-500 bg-blue-50 scale-110"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:scale-105"
              }`}
              title={asset.name}
            >
              {getAssetIcon(asset)}
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {canUseAR(currentAsset) && (
          <button
            onClick={handleARToggle}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <span className="text-xl">🥽</span>
            Ver en AR
          </button>
        )}

        <button
          onClick={() => onTrackEvent("asset_shared", currentAsset.id)}
          className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 border border-slate-200"
        >
          <span className="text-xl">📤</span>
          Compartir
        </button>
      </div>

      {/* Asset Info */}
      <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {currentAsset.name}
        </h3>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            {getAssetIcon(currentAsset)}
            {getAssetKind(currentAsset).charAt(0).toUpperCase() +
              getAssetKind(currentAsset).slice(1)}
          </span>
          {currentAsset.fileSizeBytes && (
            <span>
              📊 {(currentAsset.fileSizeBytes / 1024 / 1024).toFixed(1)} MB
            </span>
          )}
          <span>🆔 #{currentIndex + 1}</span>
        </div>
      </div>
    </div>
  );
};

export default ModernAssetCarousel;
