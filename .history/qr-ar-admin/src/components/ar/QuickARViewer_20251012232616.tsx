/**
 * Quick AR Viewer Component
 * Main AR viewer that integrates FunctionalARViewer with enhanced UI and controls
 * Provides the complete Quick AR experience with camera, object manipulation, and asset switching
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Experience, Asset } from '@/types';
import FunctionalARViewer from './FunctionalARViewer';

interface ARCapabilities {
  webxr: boolean;
  hitTest: boolean;
  lightEstimation: boolean;
  planeDetection: boolean;
  anchoredObjects: boolean;
  camera: boolean;
  deviceMotion: boolean;
  geolocation: boolean;
}

interface QuickARViewerProps {
  experience: Experience;
  currentAssetIndex: number;
  onAssetChange: (index: number) => void;
  onExitAR: () => void;
  onError: (error: string) => void;
  arCapabilities: ARCapabilities;
}

const QuickARViewer: React.FC<QuickARViewerProps> = ({
  experience,
  currentAssetIndex,
  onAssetChange,
  onExitAR,
  onError,
  arCapabilities
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isPlacementMode, setIsPlacementMode] = useState(true);
  const [objectsPlaced, setObjectsPlaced] = useState(0);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current asset
  const currentAsset = experience.assets[currentAssetIndex];

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Show controls when user interacts
  const handleUserInteraction = () => {
    setShowControls(true);
  };

  // Handle AR initialization complete
  const handleARReady = () => {
    setIsInitializing(false);
  };

  // Handle AR errors
  const handleARError = (error: string) => {
    console.error('AR Error:', error);
    onError(error);
  };

  // Handle asset switching
  const handleAssetSwitch = (direction: 'prev' | 'next') => {
    const totalAssets = experience.assets.length;
    if (totalAssets <= 1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentAssetIndex > 0 ? currentAssetIndex - 1 : totalAssets - 1;
    } else {
      newIndex = currentAssetIndex < totalAssets - 1 ? currentAssetIndex + 1 : 0;
    }
    
    onAssetChange(newIndex);
  };

  // Asset type icon mapping
  const getAssetIcon = (assetType: string) => {
    switch (assetType) {
      case 'model3d': return '🎯';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'message': return '📝';
      case 'webcontent': return '🌐';
      default: return '✨';
    }
  };

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden"
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      {/* Functional AR Viewer */}
      <FunctionalARViewer
        experience={experience}
        onBack={onExitAR}
        onReady={handleARReady}
        onError={handleARError}
        className="w-full h-full"
        currentAssetIndex={currentAssetIndex}
      />

      {/* Initialization overlay */}
      {isInitializing && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="text-center text-white">
            <div className="text-6xl mb-4 animate-bounce">📱</div>
            <div className="text-xl font-semibold mb-2">Iniciando AR...</div>
            <div className="text-sm text-blue-200">Preparando cámara y sensores</div>
          </div>
        </div>
      )}

      {/* AR Controls Overlay */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto z-30">
          {/* Exit button */}
          <button
            onClick={onExitAR}
            className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            ← Salir
          </button>

          {/* Experience title */}
          <div className="glass px-4 py-2 rounded-lg backdrop-blur-sm">
            <div className="text-white text-sm font-medium truncate max-w-40">
              {experience.title}
            </div>
          </div>

          {/* Asset selector toggle */}
          {experience.assets.length > 1 && (
            <button
              onClick={() => setShowAssetSelector(!showAssetSelector)}
              className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <div className="text-lg">{getAssetIcon(currentAsset.assetType)}</div>
            </button>
          )}
        </div>

        {/* Current Asset Info */}
        <div className="absolute top-20 left-4 right-4 pointer-events-auto z-30">
          <div className="glass p-3 rounded-lg backdrop-blur-sm max-w-xs">
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{getAssetIcon(currentAsset.assetType)}</span>
                <span className="text-sm font-medium">{currentAsset.name}</span>
              </div>
              {currentAsset.assetContent && (
                <div className="text-xs text-blue-200/80">
                  {currentAsset.assetContent.length > 50 
                    ? `${currentAsset.assetContent.substring(0, 50)}...`
                    : currentAsset.assetContent
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Placement Guide */}
        {isPlacementMode && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-2 border-white/60 border-dashed rounded-full animate-pulse mb-2 mx-auto"></div>
              <div className="glass px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="text-sm font-medium">Toca para colocar</div>
                <div className="text-xs text-blue-200">{currentAsset.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto z-30">
          
          {/* Asset Navigation */}
          {experience.assets.length > 1 && (
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-4 glass px-4 py-2 rounded-lg backdrop-blur-sm">
                <button
                  onClick={() => handleAssetSwitch('prev')}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                >
                  <span className="text-white text-lg">←</span>
                </button>
                
                <div className="text-white text-sm">
                  {currentAssetIndex + 1} / {experience.assets.length}
                </div>
                
                <button
                  onClick={() => handleAssetSwitch('next')}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                >
                  <span className="text-white text-lg">→</span>
                </button>
              </div>
            </div>
          )}

          {/* AR Status and Stats */}
          <div className="flex justify-between items-center">
            <div className="glass p-2 rounded-lg backdrop-blur-sm">
              <div className="text-white text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-green-400">●</span>
                  <span>AR Activo</span>
                </div>
                {objectsPlaced > 0 && (
                  <div className="text-blue-200/70">
                    {objectsPlaced} objeto{objectsPlaced !== 1 ? 's' : ''} colocado{objectsPlaced !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* AR Capabilities indicator */}
            <div className="glass p-2 rounded-lg backdrop-blur-sm">
              <div className="flex items-center space-x-1 text-xs text-white">
                {arCapabilities.webxr && <span className="text-green-400">🥽</span>}
                {arCapabilities.hitTest && <span className="text-blue-400">🎯</span>}
                {arCapabilities.camera && <span className="text-yellow-400">📷</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Selector Overlay */}
      {showAssetSelector && experience.assets.length > 1 && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass p-6 rounded-lg max-w-sm mx-4 backdrop-blur-sm">
            <div className="text-white text-center">
              <div className="text-lg font-semibold mb-4">Seleccionar Contenido</div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {experience.assets.map((asset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onAssetChange(index);
                      setShowAssetSelector(false);
                    }}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      index === currentAssetIndex
                        ? 'bg-blue-500/30 ring-2 ring-blue-400'
                        : 'glass hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {getAssetIcon(asset.assetType)}
                    </div>
                    <div className="text-xs truncate">
                      {asset.name}
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowAssetSelector(false)}
                className="w-full glass p-2 rounded text-white hover:bg-white/20 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick AR watermark */}
      <div className="absolute bottom-2 right-4 text-xs text-white/30 pointer-events-none z-10">
        Quick AR
      </div>
    </div>
  );
};

export default QuickARViewer;