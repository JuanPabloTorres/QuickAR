/**
 * AR Error Screen Component
 * Handles AR initialization failures, device compatibility issues
 * Provides retry options and helpful troubleshooting guidance
 */

"use client";

import React from 'react';

interface ARErrorScreenProps {
  error: string;
  onRetry: () => void;
  onBack: () => void;
  isNotFound?: boolean;
}

const ARErrorScreen: React.FC<ARErrorScreenProps> = ({
  error,
  onRetry,
  onBack,
  isNotFound = false
}) => {
  const getErrorIcon = () => {
    if (isNotFound) return "🔍";
    if (error.includes("camera")) return "📷";
    if (error.includes("WebXR") || error.includes("AR")) return "🥽";
    if (error.includes("network") || error.includes("fetch")) return "🌐";
    return "❌";
  };

  const getErrorTitle = () => {
    if (isNotFound) return "Experiencia no encontrada";
    if (error.includes("camera")) return "Problema con la cámara";
    if (error.includes("WebXR") || error.includes("AR")) return "AR no disponible";
    if (error.includes("network") || error.includes("fetch")) return "Error de conexión";
    return "Error en la experiencia AR";
  };

  const getErrorSuggestions = () => {
    if (isNotFound) {
      return [
        "Verifica que el código QR sea válido",
        "Asegúrate de que la experiencia esté publicada",
        "Contacta al creador si persiste el problema"
      ];
    }
    
    if (error.includes("camera")) {
      return [
        "Permite el acceso a la cámara en tu navegador",
        "Verifica que no haya otras apps usando la cámara",
        "Reinicia el navegador si es necesario"
      ];
    }
    
    if (error.includes("WebXR") || error.includes("AR")) {
      return [
        "Tu dispositivo o navegador no soporta AR",
        "Usa Chrome o Safari en un dispositivo móvil",
        "Actualiza tu navegador a la versión más reciente"
      ];
    }
    
    if (error.includes("network") || error.includes("fetch")) {
      return [
        "Verifica tu conexión a internet",
        "Intenta recargar la página",
        "El servidor podría estar temporalmente no disponible"
      ];
    }

    return [
      "Intenta recargar la experiencia",
      "Verifica tu conexión a internet",
      "Contacta soporte si persiste el problema"
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-orange-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-yellow-500/10 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Main error content */}
      <div className="text-center text-white max-w-md mx-4 z-10">
        {/* Error icon */}
        <div className="text-7xl mb-6 animate-pulse">
          {getErrorIcon()}
        </div>

        {/* Error title */}
        <div className="text-2xl font-semibold mb-4">
          {getErrorTitle()}
        </div>

        {/* Error message */}
        <div className="text-blue-200/80 mb-6 p-4 glass rounded-lg backdrop-blur-sm">
          {error}
        </div>

        {/* Suggestions */}
        <div className="mb-8">
          <div className="text-sm font-medium mb-3 text-blue-200">
            💡 Posibles soluciones:
          </div>
          <div className="space-y-2">
            {getErrorSuggestions().map((suggestion, index) => (
              <div key={index} className="text-xs text-blue-200/70 glass p-2 rounded backdrop-blur-sm">
                • {suggestion}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full glass p-4 rounded-lg text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
          >
            🔄 Intentar de nuevo
          </button>

          <button
            onClick={onBack}
            className="w-full glass p-4 rounded-lg text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
          >
            ← Volver a experiencias
          </button>
        </div>

        {/* Device compatibility info */}
        <div className="mt-8 p-4 glass rounded-lg backdrop-blur-sm">
          <div className="text-xs text-blue-200/60 mb-2">
            📱 Compatibilidad AR
          </div>
          <div className="text-xs text-blue-200/40 space-y-1">
            <div>• iOS Safari 13+ / Chrome 81+</div>
            <div>• Android Chrome 81+ / Samsung Internet</div>
            <div>• Cámara y sensores requeridos</div>
          </div>
        </div>

        {/* Quick AR branding */}
        <div className="mt-6 text-xs text-white/30">
          Quick AR Experience
        </div>
      </div>

      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-400 rounded-full animate-ping opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '3s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ARErrorScreen;