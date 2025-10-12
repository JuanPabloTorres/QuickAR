"use client";

import { useEffect, useRef, useState } from "react";
import { Experience } from "@/types";
import { AssetRenderer } from "./AssetRenderer";
import { QuickArLogo } from "@/components/ui/quick-ar-logo";

interface CameraARProps {
  experience: Experience;
  currentAssetIndex: number;
  onAssetChange: (index: number) => void;
  onBack: () => void;
  className?: string;
}

export function CameraAR({
  experience,
  currentAssetIndex,
  onAssetChange,
  onBack,
  className = "",
}: CameraARProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  const currentAsset = experience.assets[currentAssetIndex];

  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
        
        setStream(mediaStream);
        setIsLoading(false);
      } catch (err) {
        console.error('Camera access failed:', err);
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
        setIsLoading(false);
      }
    };

    startCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Auto-hide overlay after inactivity
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const resetTimer = () => {
      setShowOverlay(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowOverlay(false), 4000);
    };

    const handleActivity = () => resetTimer();
    
    resetTimer();
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('mousedown', handleActivity);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-black flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <QuickArLogo className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <div className="text-lg font-semibold mb-2">Iniciando cámara AR</div>
          <div className="text-sm text-gray-300">Preparando experiencia...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-black flex items-center justify-center ${className}`}>
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-4xl mb-4">📸</div>
          <div className="text-lg font-semibold mb-4">Error de cámara</div>
          <div className="text-sm text-red-300 mb-6">{error}</div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                window.location.reload();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Intentar de nuevo
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-black ${className}`}>
      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* AR overlay with asset */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80">
          {/* Asset container with AR frame */}
          <div className="relative w-full h-full">
            <div className="w-full h-full bg-black/20 backdrop-blur-sm rounded-lg border-2 border-sky-400/60 shadow-lg shadow-sky-400/20">
              <AssetRenderer
                asset={currentAsset}
                className="w-full h-full rounded-lg"
              />
            </div>
            
            {/* AR Corner markers */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-sky-400" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-sky-400" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-sky-400" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-sky-400" />
            </div>

            {/* Scanning animation */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-pulse top-1/4" />
              <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse top-1/2 opacity-60 [animation-delay:0.5s]" />
              <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse top-3/4 opacity-40 [animation-delay:1s]" />
            </div>
          </div>

          {/* Asset name badge */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {currentAsset.name}
            </div>
          </div>
        </div>
      </div>

      {/* Controls overlay */}
      <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
        showOverlay ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center space-x-2"
            >
              <span>←</span>
              <span className="hidden sm:inline">Volver</span>
            </button>
            
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {currentAssetIndex + 1} / {experience.assets.length}
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        {experience.assets.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => {
                  const newIndex = currentAssetIndex > 0 
                    ? currentAssetIndex - 1 
                    : experience.assets.length - 1;
                  onAssetChange(newIndex);
                }}
                className="bg-black/50 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center"
              >
                ◀
              </button>

              <div className="flex items-center space-x-2">
                {experience.assets.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onAssetChange(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentAssetIndex
                        ? 'bg-sky-400 scale-125 shadow-lg shadow-sky-400/50'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  const newIndex = currentAssetIndex < experience.assets.length - 1
                    ? currentAssetIndex + 1
                    : 0;
                  onAssetChange(newIndex);
                }}
                className="bg-black/50 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center"
              >
                ▶
              </button>
            </div>
          </div>
        )}

        {/* AR Status indicator */}
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-auto">
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="bg-black/50 backdrop-blur-sm text-white w-12 h-12 rounded-full flex items-center justify-center"
          >
            <QuickArLogo size={20} className="text-sky-400" />
          </button>
        </div>

        {/* Instructions */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm text-white text-center p-4 rounded-lg max-w-xs">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-sm">Mueve el dispositivo para ver el contenido en AR</div>
            {experience.assets.length > 1 && (
              <div className="text-xs mt-2 opacity-80">Usa los controles para cambiar contenido</div>
            )}
          </div>
        </div>
      </div>

      {/* AR scanning grid overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full border border-sky-400/20">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full w-px bg-sky-400/10"
                style={{ left: `${20 * (i + 1)}%` }}
              />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full h-px bg-sky-400/10"
                style={{ top: `${20 * (i + 1)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}