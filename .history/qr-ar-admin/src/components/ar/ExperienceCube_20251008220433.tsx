"use client";

import { useCallback, useState } from "react";
import { ARAsset, ARExperience } from "../../types";
import AssetRenderer from "./AssetRenderer";

interface ExperienceCubeProps {
  experience: ARExperience;
  size?: number;
  className?: string;
  enableInteraction?: boolean;
  displayMode?: "single" | "grid" | "carousel";
  onAssetSelect?: (asset: ARAsset) => void;
  onError?: (error: string) => void;
}

/**
 * ExperienceCube Component
 * Main 3D/AR container for displaying experience assets
 * Clean design without auto-animations, supports different display modes
 */
export function ExperienceCube({
  experience,
  size = 300,
  className = "",
  enableInteraction = true,
  displayMode = "single",
  onAssetSelect,
  onError,
}: ExperienceCubeProps) {
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {}
  );

  const handleAssetLoadStart = useCallback((index: number) => {
    setLoadingStates((prev) => ({ ...prev, [index]: true }));
  }, []);

  const handleAssetLoadEnd = useCallback((index: number) => {
    setLoadingStates((prev) => ({ ...prev, [index]: false }));
  }, []);

  const handleAssetError = useCallback(
    (error: string, asset: ARAsset) => {
      onError?.(`Error loading ${asset.name}: ${error}`);
    },
    [onError]
  );

  const handleAssetClick = useCallback(
    (asset: ARAsset, index: number) => {
      if (enableInteraction) {
        setSelectedAssetIndex(index);
        onAssetSelect?.(asset);
      }
    },
    [enableInteraction, onAssetSelect]
  );

  if (!experience.assets || experience.assets.length === 0) {
    return (
      <div
        className={`
          relative rounded-xl overflow-hidden 
          bg-slate-50 border border-slate-200 
          flex items-center justify-center
          ${className}
        `}
        style={{ width: size, height: size }}
      >
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              className="text-gray-400"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 13.25L12 8.75"
              />
              <circle
                cx="12"
                cy="16"
                r="0.25"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h3 className="font-medium text-gray-700 text-sm mb-2">
            {experience.title}
          </h3>
          <p className="text-xs text-gray-500">Sin assets disponibles</p>
        </div>
      </div>
    );
  }

  const primaryAsset =
    experience.assets[selectedAssetIndex] || experience.assets[0];

  const renderSingleMode = () => (
    <div className={`relative ${className}`}>
      <AssetRenderer
        asset={primaryAsset}
        size={size}
        enableInteraction={enableInteraction}
        onLoadStart={() => handleAssetLoadStart(selectedAssetIndex)}
        onLoadEnd={() => handleAssetLoadEnd(selectedAssetIndex)}
        onError={(error) => handleAssetError(error, primaryAsset)}
      />

      {/* Asset Navigation */}
      {experience.assets.length > 1 && enableInteraction && (
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between bg-black bg-opacity-50 rounded-lg px-3 py-2">
            <button
              onClick={() =>
                setSelectedAssetIndex(Math.max(0, selectedAssetIndex - 1))
              }
              disabled={selectedAssetIndex === 0}
              className="text-white hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 18L9 12L15 6"
                />
              </svg>
            </button>

            <div className="flex space-x-1">
              {experience.assets.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAssetIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedAssetIndex
                      ? "bg-white"
                      : "bg-white bg-opacity-40"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setSelectedAssetIndex(
                  Math.min(experience.assets.length - 1, selectedAssetIndex + 1)
                )
              }
              disabled={selectedAssetIndex === experience.assets.length - 1}
              className="text-white hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 18L15 12L9 6"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Experience Info Overlay */}
      <div className="absolute top-3 left-3 right-3">
        <div className="bg-black bg-opacity-50 rounded-lg px-3 py-2">
          <h3 className="text-white text-sm font-medium truncate">
            {experience.title}
          </h3>
          <p className="text-white text-xs opacity-75 truncate">
            {primaryAsset.name}
          </p>
        </div>
      </div>
    </div>
  );

  const renderGridMode = () => {
    const gridSize = Math.ceil(Math.sqrt(experience.assets.length));
    const assetSize = Math.floor((size - 20) / gridSize);

    return (
      <div
        className={`
          relative rounded-xl overflow-hidden 
          bg-slate-50 border border-slate-200 
          p-2 ${className}
        `}
        style={{ width: size, height: size }}
      >
        <div
          className="grid gap-2 h-full"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {experience.assets
            .slice(0, gridSize * gridSize)
            .map((asset, index) => (
              <div
                key={asset.id}
                onClick={() => handleAssetClick(asset, index)}
                className={`
                relative cursor-pointer transition-transform
                ${enableInteraction ? "hover:scale-105" : ""}
                ${
                  selectedAssetIndex === index
                    ? "ring-2 ring-blue-500 ring-offset-1"
                    : ""
                }
              `}
              >
                <AssetRenderer
                  asset={asset}
                  size={assetSize}
                  enableInteraction={false}
                  onLoadStart={() => handleAssetLoadStart(index)}
                  onLoadEnd={() => handleAssetLoadEnd(index)}
                  onError={(error) => handleAssetError(error, asset)}
                />
                {loadingStates[index] && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Experience Title */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-black bg-opacity-50 rounded px-2 py-1">
            <h3 className="text-white text-xs font-medium truncate">
              {experience.title}
            </h3>
          </div>
        </div>
      </div>
    );
  };

  switch (displayMode) {
    case "grid":
      return renderGridMode();
    case "single":
    default:
      return renderSingleMode();
  }
}

export default ExperienceCube;
