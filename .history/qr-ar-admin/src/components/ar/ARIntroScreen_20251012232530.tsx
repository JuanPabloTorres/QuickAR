/**
 * AR Intro Screen Component
 * Presents AR experience information, capabilities check, and start AR button
 * Provides proper UX flow before entering AR mode
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Experience } from '@/types';

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

interface ARIntroScreenProps {
  experience: Experience;
  arCapabilities: ARCapabilities;
  onStartAR: () => void;
  onBack: () => void;
  currentAssetIndex: number;
  onAssetChange: (index: number) => void;
}

const ARIntroScreen: React.FC<ARIntroScreenProps> = ({
  experience,
  arCapabilities,
  onStartAR,
  onBack,
  currentAssetIndex,
  onAssetChange
}) => {
  const [isReady, setIsReady] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);

  useEffect(() => {
    // Brief delay to ensure smooth transition
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Check if device is AR-ready
  const isARReady = arCapabilities.webxr && arCapabilities.camera;
  const hasBasicAR = arCapabilities.camera && arCapabilities.deviceMotion;

  // Get current asset
  const currentAsset = experience.assets && experience.assets.length > 0 
    ? experience.assets[currentAssetIndex] 
    : null;

  // Asset type icon mapping
  const getAssetIcon = (assetType?: string) => {
    switch (assetType?.toLowerCase()) {
      case 'model3d':
        return '🎯';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'message':
        return '📝';
      case 'webcontent':
        return '🌐';
      default:
        return '✨';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-cyan-500/10 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10">
        <button
          onClick={onBack}
          className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          ← Volver
        </button>
        
        <button
          onClick={() => setShowCapabilities(!showCapabilities)}
          className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm text-sm"
        >
          {isARReady ? '✅' : '⚠️'} AR Info
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-center text-white max-w-md mx-4 z-10 transition-all duration-500 ${isReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          
          {/* Experience title and description */}
          <div className="mb-8">
            <div className="text-3xl font-bold mb-4">
              {experience.title}
            </div>
            {experience.description && (
              <div className="text-blue-200/80 leading-relaxed">
                {experience.description}
              </div>
            )}
          </div>

          {/* Current asset preview */}
          {currentAsset && (
            <div className="mb-8 glass p-4 rounded-lg backdrop-blur-sm">
              <div className="text-4xl mb-2">
                {getAssetIcon(currentAsset.assetType)}
              </div>
              <div className="text-lg font-medium mb-1">
                {currentAsset.name || `Asset ${currentAssetIndex + 1}`}
              </div>
              {currentAsset.assetContent && (
                <div className="text-sm text-blue-200/70">
                  {currentAsset.assetContent.length > 100 
                    ? `${currentAsset.assetContent.substring(0, 100)}...`
                    : currentAsset.assetContent}
                </div>
              )}
            </div>
          )}

          {/* Asset selector if multiple assets */}
          {experience.assets && experience.assets.length > 1 && (
            <div className="mb-8">
              <div className="text-sm text-blue-200 mb-3">
                Selecciona contenido ({currentAssetIndex + 1}/{experience.assets.length})
              </div>
              <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
                {experience.assets.map((asset, index) => (
                  <button
                    key={index}
                    onClick={() => onAssetChange(index)}
                    className={`flex-shrink-0 p-3 rounded-lg transition-all duration-200 ${
                      index === currentAssetIndex
                        ? 'bg-blue-500/30 ring-2 ring-blue-400'
                        : 'glass hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {getAssetIcon(asset.assetType)}
                    </div>
                    <div className="text-xs truncate max-w-16">
                      {asset.name || `Asset ${index + 1}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AR Status and Start Button */}
          <div className="space-y-4">
            {isARReady ? (
              <>
                <div className="flex items-center justify-center space-x-2 text-green-400 mb-4">
                  <span className="text-2xl">✅</span>
                  <span>Dispositivo AR compatible</span>
                </div>
                <button
                  onClick={onStartAR}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-lg text-white font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🚀 Iniciar experiencia AR
                </button>
              </>
            ) : hasBasicAR ? (
              <>
                <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <span>AR básico disponible</span>
                </div>
                <button
                  onClick={onStartAR}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 p-4 rounded-lg text-white font-semibold text-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  📱 Usar vista AR básica
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center space-x-2 text-red-400 mb-4">
                  <span className="text-2xl">❌</span>
                  <span>AR no disponible</span>
                </div>
                <button
                  disabled
                  className="w-full bg-gray-600 p-4 rounded-lg text-gray-300 font-semibold text-lg cursor-not-allowed"
                >
                  🚫 AR no soportado
                </button>
              </>
            )}
          </div>

          {/* Quick tips */}
          <div className="mt-6 glass p-3 rounded-lg backdrop-blur-sm">
            <div className="text-xs text-blue-200/70">
              💡 Mejor experiencia con buena iluminación y superficies planas
            </div>
          </div>
        </div>
      </div>

      {/* AR Capabilities overlay */}
      {showCapabilities && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass p-6 rounded-lg max-w-sm mx-4 backdrop-blur-sm">
            <div className="text-white text-center">
              <div className="text-xl font-semibold mb-4">Capacidades AR</div>
              <div className="space-y-2 text-left text-sm">
                {Object.entries(arCapabilities).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={value ? 'text-green-400' : 'text-red-400'}>
                      {value ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowCapabilities(false)}
                className="mt-4 w-full glass p-2 rounded text-white hover:bg-white/20 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick AR branding */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white/30 z-10">
        Quick AR Experience
      </div>
    </div>
  );
};

export default ARIntroScreen;