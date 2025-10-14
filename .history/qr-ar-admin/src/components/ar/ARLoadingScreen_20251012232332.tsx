/**
 * AR Loading Screen Component
 * Displays loading state while initializing AR experience
 * Provides visual feedback during AR setup and asset loading
 */

"use client";

import React, { useState, useEffect } from 'react';

interface ARLoadingScreenProps {
  experienceId: string;
  message?: string;
  progress?: number;
}

const ARLoadingScreen: React.FC<ARLoadingScreenProps> = ({
  experienceId,
  message = "Cargando experiencia AR...",
  progress
}) => {
  const [dots, setDots] = useState("");
  const [currentTip, setCurrentTip] = useState(0);

  // AR tips for users while loading
  const arTips = [
    "💡 Asegúrate de tener buena iluminación",
    "🎯 Apunta tu cámara a una superficie plana",
    "📱 Mueve el dispositivo lentamente",
    "✨ Los objetos se anclan automáticamente",
    "🔍 Toca para colocar objetos en AR"
  ];

  // Animated loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % arTips.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [arTips.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-cyan-500/10 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Main loading content */}
      <div className="text-center text-white z-10 max-w-md mx-4">
        {/* AR Icon with loading animation */}
        <div className="relative mb-8">
          <div className="text-7xl mb-4 animate-bounce">
            📱
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading message */}
        <div className="text-2xl font-semibold mb-2">
          {message}{dots}
        </div>

        {/* Experience ID */}
        <div className="text-sm text-blue-200/70 mb-6">
          Experiencia: {experienceId}
        </div>

        {/* Progress bar if provided */}
        {typeof progress === 'number' && (
          <div className="mb-6">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              ></div>
            </div>
            <div className="text-xs text-blue-200/70 mt-2">
              {Math.round(progress)}% completado
            </div>
          </div>
        )}

        {/* AR Tips */}
        <div className="glass p-4 rounded-lg backdrop-blur-sm">
          <div className="text-sm text-blue-200/90 transition-all duration-500">
            {arTips[currentTip]}
          </div>
        </div>

        {/* Loading states indicator */}
        <div className="mt-6 flex justify-center space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                dots.length >= i ? 'bg-blue-400' : 'bg-white/20'
              }`}
            ></div>
          ))}
        </div>

        {/* Quick AR branding */}
        <div className="mt-8 text-xs text-white/50">
          Quick AR Experience
        </div>
      </div>

      {/* Subtle animated grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="border border-white/10 animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ARLoadingScreen;