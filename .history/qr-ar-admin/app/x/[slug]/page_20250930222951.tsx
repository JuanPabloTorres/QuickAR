"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { ExperienceDto, AssetDto } from "@/types";
import "../ar-viewer.css";

// Import model-viewer types
/// <reference path="../../../types/model-viewer.d.ts" />
import "@/types/model-viewer";

// AR Viewer Component
const ARViewer: React.FC<{ experience: ExperienceDto }> = ({ experience }) => {
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [isARSupported, setIsARSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if AR is supported
    if ("xr" in navigator) {
      (navigator as any).xr
        ?.isSessionSupported("immersive-ar")
        .then((supported: boolean) => setIsARSupported(supported))
        .catch(() => setIsARSupported(false));
    }

    // Track view event
    trackEvent("view");
  }, []);

  const trackEvent = async (eventType: string, additionalData?: string) => {
    try {
      await apiClient.trackEvent({
        eventType,
        experienceId: experience.id,
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
        additionalData,
      });
    } catch (err) {
      console.error("Error tracking event:", err);
    }
  };

  const currentAsset = experience.assets[currentAssetIndex];

  const renderAsset = (asset: AssetDto) => {
    switch (asset.kind) {
      case "model3d":
        return (
          <div className="ar-viewer">
            <model-viewer
              src={asset.url || ""}
              alt={asset.name}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              environment-image="neutral"
              shadow-intensity="1"
              auto-rotate
            />
          </div>
        );

      case "image":
        return (
          <div className="ar-viewer">
            <img
              src={asset.url || ""}
              alt={asset.name}
              className="w-full h-full object-cover rounded-lg"
              onClick={() => trackEvent("image_click", asset.id)}
            />
          </div>
        );

      case "video":
        return (
          <div className="ar-viewer">
            <video
              src={asset.url || ""}
              controls
              autoPlay
              muted
              loop
              className="w-full h-full object-cover rounded-lg"
              onClick={() => trackEvent("video_play", asset.id)}
            />
          </div>
        );

      case "message":
        return (
          <div className="ar-viewer ar-viewer-message">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {asset.name}
              </h2>
              {asset.text && (
                <p className="text-lg text-blue-100">{asset.text}</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="ar-viewer ar-viewer-unsupported">
            <p className="text-gray-500">Tipo de contenido no soportado</p>
          </div>
        );
    }
  };

  if (!currentAsset) {
    return (
      <div className="ar-viewer flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No hay contenido disponible</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {renderAsset(currentAsset)}

      {/* Asset Navigation */}
      {experience.assets.length > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => {
              const newIndex =
                currentAssetIndex > 0
                  ? currentAssetIndex - 1
                  : experience.assets.length - 1;
              setCurrentAssetIndex(newIndex);
              trackEvent("asset_navigation", `previous_to_${newIndex}`);
            }}
            className="ar-navigation-button"
          >
            ◀
          </button>

          <div className="text-white text-sm">
            {currentAssetIndex + 1} de {experience.assets.length}
          </div>

          <button
            onClick={() => {
              const newIndex =
                currentAssetIndex < experience.assets.length - 1
                  ? currentAssetIndex + 1
                  : 0;
              setCurrentAssetIndex(newIndex);
              trackEvent("asset_navigation", `next_to_${newIndex}`);
            }}
            className="ar-navigation-button"
          >
            ▶
          </button>
        </div>
      )}

      {/* Asset Info */}
      <div className="glass rounded-lg p-4 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          {currentAsset.name}
        </h3>
        <p className="text-blue-200 text-sm">
          {experience.title} •{" "}
          {currentAsset.kind === "model3d"
            ? "Modelo 3D"
            : currentAsset.kind === "image"
            ? "Imagen"
            : currentAsset.kind === "video"
            ? "Video"
            : "Mensaje"}
        </p>

        {isARSupported && currentAsset.kind === "model3d" && (
          <div className="mt-4">
            <button
              onClick={() => trackEvent("ar_button_click")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
            >
              Ver en AR 📱
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ARExperiencePage() {
  const params = useParams();
  const [experience, setExperience] = useState<ExperienceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  useEffect(() => {
    loadExperience();
  }, [slug]);

  const loadExperience = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getExperienceBySlug(slug);

      if (response.success && response.data) {
        setExperience(response.data);
      } else {
        setError("Experiencia no encontrada");
      }
    } catch (err) {
      setError("Error al cargar la experiencia");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="ar-loading-spinner"></div>
          <p className="text-white">Cargando experiencia AR...</p>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Experiencia no encontrada
          </h1>
          <p className="text-blue-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Include model-viewer script */}
      <script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {experience.title}
            </h1>
            {experience.description && (
              <p className="text-blue-200 text-lg">{experience.description}</p>
            )}
          </div>

          {/* AR Viewer */}
          <div className="max-w-2xl mx-auto">
            <ARViewer experience={experience} />
          </div>

          {/* Instructions */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="glass rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                Instrucciones
              </h3>
              <div className="space-y-2 text-sm text-blue-200">
                <p>• Toca y arrastra para rotar los modelos 3D</p>
                <p>• Usa pellizcar para acercar/alejar</p>
                <p>• Toca "Ver en AR" para experiencia inmersiva</p>
                <p>• Navega entre contenidos con las flechas</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-blue-300 text-sm">Powered by QR AR Platform</p>
          </div>
        </div>
      </div>
    </>
  );
}
