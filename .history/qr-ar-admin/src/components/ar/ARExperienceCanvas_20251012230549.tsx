/**
 * AR Experience Canvas - Complete AR Solution
 * Combines native WebXR with fallback experiences
 */

"use client";

import { Asset, Experience } from "@/types";
import { useEffect, useState } from "react";
import NativeARViewer from "./NativeARViewer";
import UniversalAssetViewer from "./UniversalAssetViewer";

interface ARExperienceCanvasProps {
  experience: Experience;
  currentAssetIndex?: number;
  onAssetChange?: (index: number) => void;
  onPerformanceChange?: (performance: { fps: number; status: string }) => void;
}

export default function ARExperienceCanvas({
  experience,
  currentAssetIndex = 0,
  onAssetChange,
  onPerformanceChange,
}: ARExperienceCanvasProps) {
  const [currentMode, setCurrentMode] = useState<'preview' | 'ar' | 'fallback'>('preview');
  const [isARSupported, setIsARSupported] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const currentAsset = experience.assets[Math.min(currentAssetIndex, experience.assets.length - 1)];

  // Check AR capabilities on mount
  useEffect(() => {
    const checkARCapabilities = async () => {
      const capabilities = {
        webxr: false,
        webxrAR: false,
        webxrVR: false,
        https: window.location.protocol === 'https:',
        userAgent: navigator.userAgent,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        }
      };

      if (typeof navigator !== "undefined" && navigator.xr) {
        try {
          capabilities.webxr = true;
          capabilities.webxrAR = await navigator.xr.isSessionSupported("immersive-ar");
          capabilities.webxrVR = await navigator.xr.isSessionSupported("immersive-vr");
        } catch (error) {
          console.error("WebXR capability check failed:", error);
        }
      }

      setIsARSupported(capabilities.webxrAR);
      setDebugInfo(capabilities);
      
      onPerformanceChange?.({
        fps: 60,
        status: `WebXR AR: ${capabilities.webxrAR ? '✅' : '❌'} | WebXR VR: ${capabilities.webxrVR ? '✅' : '❌'} | Session: ${currentMode}`
      });

      console.log("🔍 AR Capabilities:", capabilities);
    };

    checkARCapabilities();
  }, [currentMode, onPerformanceChange]);

  const handleARStart = () => {
    setCurrentMode('ar');
    onPerformanceChange?.({
      fps: 60,
      status: "AR Mode Active"
    });
  };

  const handleAREnd = () => {
    setCurrentMode('preview');
    onPerformanceChange?.({
      fps: 60,
      status: "Preview Mode"
    });
  };

  const handleFallbackActivation = () => {
    setCurrentMode('fallback');
    onPerformanceChange?.({
      fps: 60,
      status: "Immersive Fallback Mode"
    });
  };

  const handleAssetNavigation = (direction: 'next' | 'prev') => {
    if (!onAssetChange || experience.assets.length <= 1) return;

    const newIndex = direction === 'next' 
      ? Math.min(currentAssetIndex + 1, experience.assets.length - 1)
      : Math.max(currentAssetIndex - 1, 0);
    
    onAssetChange(newIndex);
  };

  const handleARError = (error: string) => {
    console.error("AR Error:", error);
    setCurrentMode('preview');
    onPerformanceChange?.({
      fps: 0,
      status: `AR Error: ${error}`
    });
  };

  if (currentMode === 'ar' && isARSupported) {
    return (
      <div className="ar-experience-container h-full w-full">
        <NativeARViewer
          asset={currentAsset}
          onARStart={handleARStart}
          onAREnd={handleAREnd}
          onError={handleARError}
        />
      </div>
    );
  }

  if (currentMode === 'fallback') {
    return (
      <div className="fallback-experience-container h-full w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Immersive Fallback UI */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white z-10">
            <h1 className="text-4xl font-bold mb-4 animate-pulse">
              🌟 {experience.title}
            </h1>
            <p className="text-xl mb-8 opacity-80">
              Experiencia inmersiva en tu navegador
            </p>
          </div>
        </div>

        {/* Asset Viewer in Immersive Mode */}
        <div className="absolute inset-4 bg-black bg-opacity-40 rounded-xl backdrop-blur-sm">
          <UniversalAssetViewer
            asset={currentAsset}
            className="w-full h-full"
            arMode={false}
          />
        </div>

        {/* Immersive Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
          {experience.assets.length > 1 && (
            <>
              <button
                onClick={() => handleAssetNavigation("prev")}
                className="bg-white bg-opacity-20 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium hover:bg-opacity-30 transition-all"
              >
                ◀ Anterior
              </button>
              <span className="bg-black bg-opacity-40 text-white px-3 py-2 rounded-full text-sm">
                {currentAssetIndex + 1} / {experience.assets.length}
              </span>
              <button
                onClick={() => handleAssetNavigation("next")}
                className="bg-white bg-opacity-20 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium hover:bg-opacity-30 transition-all"
              >
                Siguiente ▶
              </button>
            </>
          )}
          <button
            onClick={() => setCurrentMode('preview')}
            className="bg-red-500 bg-opacity-80 text-white px-4 py-2 rounded-full font-medium hover:bg-opacity-100 transition-all"
          >
            🔙 Salir
          </button>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-pink-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-green-400 rounded-full animate-spin"></div>
          <div className="absolute bottom-40 right-10 w-18 h-18 bg-blue-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    );
  }

  // Default Preview Mode
  return (
    <div className="ar-preview-container h-full w-full relative">
      {/* Asset Viewer */}
      <div className="h-full w-full">
        <UniversalAssetViewer
          asset={currentAsset}
          className="w-full h-full"
          arMode={false}
        />
      </div>

      {/* AR Experience Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
        <div className="max-w-4xl mx-auto">
          {/* Experience Info */}
          <div className="text-white mb-4">
            <h2 className="text-xl font-bold mb-1">{experience.title}</h2>
            <p className="text-gray-300 text-sm">{experience.description}</p>
            <p className="text-gray-400 text-xs mt-1">
              Contenido: {currentAsset.name} ({currentAsset.assetType})
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Asset Navigation */}
            {experience.assets.length > 1 && (
              <>
                <button
                  onClick={() => handleAssetNavigation("prev")}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                  disabled={currentAssetIndex === 0}
                >
                  ◀ Anterior
                </button>
                <span className="text-white text-sm">
                  {currentAssetIndex + 1} / {experience.assets.length}
                </span>
                <button
                  onClick={() => handleAssetNavigation("next")}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                  disabled={currentAssetIndex === experience.assets.length - 1}
                >
                  Siguiente ▶
                </button>
              </>
            )}

            {/* AR Button */}
            {isARSupported ? (
              <button
                onClick={handleARStart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                🎯 Activar AR
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFallbackActivation}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  🌟 Modo Inmersivo
                </button>
                <div className="text-gray-400 text-xs">
                  AR no disponible
                </div>
              </div>
            )}

            {/* Debug Info Toggle */}
            {debugInfo && (
              <button
                onClick={() => {
                  console.log("🔧 Debug Info:", debugInfo);
                  console.log("🎯 Current Asset:", currentAsset);
                  console.log("🎪 Experience:", experience);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-xs"
                title="Ver información de debug en consola"
              >
                🔧 Debug
              </button>
            )}
          </div>

          {/* AR Compatibility Info */}
          {!isARSupported && debugInfo && (
            <div className="mt-4 p-3 bg-yellow-900 bg-opacity-50 rounded-lg text-yellow-200 text-xs">
              <p className="font-semibold mb-1">💡 Para activar AR real necesitas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Un dispositivo Android con ARCore</li>
                <li>Chrome para Android con WebXR habilitado</li>
                <li>Conexión HTTPS (actual: {debugInfo.https ? '✅' : '❌'})</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}