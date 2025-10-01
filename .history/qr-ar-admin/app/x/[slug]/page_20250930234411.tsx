"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { apiClient } from "@/lib/api";
import { ExperienceDto } from "@/types";
import "../ar-viewer.css";

// Dynamic import of AR components with SSR disabled
const ARViewer = dynamic(
  () => import("@/src/components/ar/ARViewer").then(mod => ({ default: mod.ARViewer })),
  { 
    ssr: false,
    loading: () => <div className="ar-loading">Inicializando AR...</div>
  }
);

// Helper function to build absolute asset URLs
const getAssetUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;

  // Build absolute URL for local assets
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_API_URL || ""
      : "http://localhost:5000";

  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

export default function ARExperiencePage() {
  const params = useParams();
  const [experience, setExperience] = useState<ExperienceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

  const slug = params.slug as string;

  useEffect(() => {
    loadExperience();
  }, [slug]);

  const loadExperience = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading experience with slug:", slug);

      const response = await apiClient.getExperienceBySlug(slug);
      console.log("Experience response:", response);

      if (response.success && response.data) {
        console.log("Experience loaded:", response.data);
        console.log("Assets:", response.data.assets);
        setExperience(response.data);
      } else {
        console.error("Failed to load experience:", response.message);
        setError("Experiencia no encontrada");
      }
    } catch (err) {
      console.error("Error loading experience:", err);
      setError("Error al cargar la experiencia");
    } finally {
      setLoading(false);
    }
  };

  const trackEvent = async (eventType: string, additionalData?: string) => {
    if (!experience) return;
    
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

  if (!experience.assets || experience.assets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Sin contenido
          </h1>
          <p className="text-blue-200">Esta experiencia no tiene contenido disponible</p>
        </div>
      </div>
    );
  }

  const currentAsset = experience.assets[currentAssetIndex];

  return (
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
          <div className="space-y-4">
            <ARViewer 
              asset={currentAsset} 
              onTrackEvent={trackEvent}
            />

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
                  aria-label="Contenido anterior"
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
                  aria-label="Contenido siguiente"
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
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 max-w-xl mx-auto">
          <div className="glass rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              Instrucciones
            </h3>
            <div className="space-y-2 text-sm text-blue-200">
              <p>• Presiona "Ver en AR" para activar la cámara</p>
              <p>• Permite el acceso a la cámara cuando se solicite</p>
              <p>• Mueve el dispositivo para ver el contenido en AR</p>
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
  );
}ient";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { ExperienceDto, AssetDto } from "@/types";
import "../ar-viewer.css";

// Helper function to build absolute asset URLs
const getAssetUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;

  // Build absolute URL for local assets
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_API_URL || ""
      : "http://localhost:5000";

  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

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

  // Función para abrir imagen en AR
  const openImageAR = (imageUrl: string, imageName: string) => {
    // Crear una escena AR dinámica
    const arScene = document.createElement("a-scene");
    arScene.setAttribute("embedded", "true");
    arScene.setAttribute(
      "arjs",
      "sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
    );
    arScene.setAttribute("vr-mode-ui", "enabled: false");
    arScene.style.cssText =
      "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;";

    // Cámara AR
    const camera = document.createElement("a-entity");
    camera.setAttribute("camera", "");
    camera.setAttribute("gps-camera", "");
    camera.setAttribute("rotation-reader", "");

    // Marcador AR
    const marker = document.createElement("a-marker");
    marker.setAttribute("preset", "hiro");

    // Imagen en AR
    const arImage = document.createElement("a-image");
    arImage.setAttribute("src", imageUrl);
    arImage.setAttribute("position", "0 0.5 0");
    arImage.setAttribute("scale", "2 2 2");
    arImage.setAttribute("rotation", "-90 0 0");

    // Botón de cerrar
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "❌ Cerrar AR";
    closeBtn.style.cssText =
      "position: absolute; top: 20px; right: 20px; z-index: 10000; background: rgba(0,0,0,0.8); color: white; border: none; padding: 10px 20px; border-radius: 25px; font-size: 16px;";
    closeBtn.onclick = () => {
      document.body.removeChild(arScene);
      document.body.removeChild(closeBtn);
    };

    // Ensamblar escena
    marker.appendChild(arImage);
    arScene.appendChild(camera);
    arScene.appendChild(marker);

    // Agregar al DOM
    document.body.appendChild(arScene);
    document.body.appendChild(closeBtn);

    console.log("🚀 AR Scene activated for image:", imageName);
  };

  // Función para abrir video en AR
  const openVideoAR = (videoUrl: string, videoName: string) => {
    // Crear una escena AR dinámica para video
    const arScene = document.createElement("a-scene");
    arScene.setAttribute("embedded", "true");
    arScene.setAttribute(
      "arjs",
      "sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
    );
    arScene.setAttribute("vr-mode-ui", "enabled: false");
    arScene.style.cssText =
      "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;";

    // Assets
    const assets = document.createElement("a-assets");
    const video = document.createElement("video");
    video.setAttribute("id", "ar-video");
    video.setAttribute("src", videoUrl);
    video.setAttribute("loop", "true");
    video.setAttribute("autoplay", "true");
    video.setAttribute("muted", "true");
    assets.appendChild(video);

    // Cámara AR
    const camera = document.createElement("a-entity");
    camera.setAttribute("camera", "");
    camera.setAttribute("gps-camera", "");
    camera.setAttribute("rotation-reader", "");

    // Marcador AR
    const marker = document.createElement("a-marker");
    marker.setAttribute("preset", "hiro");

    // Video en AR
    const arVideo = document.createElement("a-video");
    arVideo.setAttribute("src", "#ar-video");
    arVideo.setAttribute("position", "0 0.5 0");
    arVideo.setAttribute("scale", "3 2 1");
    arVideo.setAttribute("rotation", "-90 0 0");

    // Botón de cerrar
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "❌ Cerrar AR";
    closeBtn.style.cssText =
      "position: absolute; top: 20px; right: 20px; z-index: 10000; background: rgba(0,0,0,0.8); color: white; border: none; padding: 10px 20px; border-radius: 25px; font-size: 16px;";
    closeBtn.onclick = () => {
      video.pause();
      document.body.removeChild(arScene);
      document.body.removeChild(closeBtn);
    };

    // Ensamblar escena
    marker.appendChild(arVideo);
    arScene.appendChild(assets);
    arScene.appendChild(camera);
    arScene.appendChild(marker);

    // Agregar al DOM
    document.body.appendChild(arScene);
    document.body.appendChild(closeBtn);

    console.log("🎥 AR Scene activated for video:", videoName);
  };

  const currentAsset = experience.assets[currentAssetIndex];

  const renderAsset = (asset: AssetDto) => {
    console.log("Rendering asset:", asset);
    const assetUrl = getAssetUrl(asset.url || "");
    console.log("Asset URL:", assetUrl);

    switch (asset.kind) {
      case "model3d":
        return (
          <div className="ar-viewer">
            {React.createElement("model-viewer", {
              src: assetUrl,
              alt: asset.name,
              ar: true,
              "ar-modes": "webxr scene-viewer quick-look",
              "camera-controls": true,
              "environment-image": "neutral",
              "shadow-intensity": "1",
              "auto-rotate": true,
              style: { width: "100%", height: "100%" },
            })}
          </div>
        );

      case "image":
        return (
          <div className="ar-viewer">
            {/* Imagen normal */}
            <img
              src={assetUrl}
              alt={asset.name}
              className="w-full h-full object-cover rounded-lg ar-image"
              onClick={() => trackEvent("image_click", asset.id)}
              onLoad={() => console.log("Image loaded successfully")}
              onError={(e) => {
                console.error("Image failed to load:", e);
                console.error("Attempted URL:", assetUrl);
              }}
            />

            {/* Botón AR para imagen */}
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => {
                  trackEvent("ar_image_click", asset.id);
                  openImageAR(assetUrl, asset.name);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg"
              >
                📱 Ver en AR
              </button>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="ar-viewer">
            <video
              src={assetUrl}
              controls
              muted
              loop
              className="w-full h-full object-cover rounded-lg"
              onClick={() => trackEvent("video_play", asset.id)}
              onLoadedData={() => console.log("Video loaded successfully")}
              onError={(e) => {
                console.error("Video failed to load:", e);
                console.error("Attempted URL:", assetUrl);
              }}
            />

            {/* Botón AR para video */}
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => {
                  trackEvent("ar_video_click", asset.id);
                  openVideoAR(assetUrl, asset.name);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg"
              >
                🎥 Ver en AR
              </button>
            </div>
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
            <div className="text-center p-8">
              <p className="text-gray-500">
                Tipo de contenido no soportado: {asset.kind}
              </p>
              <p className="text-gray-400 text-sm mt-2">URL: {assetUrl}</p>
            </div>
          </div>
        );
    }
  };

  if (!currentAsset) {
    console.log("No current asset available");
    console.log("Experience:", experience);
    console.log("Assets length:", experience?.assets?.length || 0);

    return (
      <div className="ar-viewer flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center p-8">
          <p className="text-white mb-2">No hay contenido disponible</p>
          <p className="text-gray-400 text-sm">
            Assets en experiencia: {experience?.assets?.length || 0}
          </p>
        </div>
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

        {isARSupported && (
          <div className="mt-4">
            {currentAsset.kind === "model3d" ? (
              <button
                onClick={() => trackEvent("ar_button_click")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors mr-2"
              >
                📱 Ver Modelo en AR
              </button>
            ) : currentAsset.kind === "image" ? (
              <button
                onClick={() => {
                  trackEvent("ar_image_button_click");
                  openImageAR(
                    getAssetUrl(currentAsset.url || ""),
                    currentAsset.name
                  );
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                📷 Ver Imagen en AR
              </button>
            ) : currentAsset.kind === "video" ? (
              <button
                onClick={() => {
                  trackEvent("ar_video_button_click");
                  openVideoAR(
                    getAssetUrl(currentAsset.url || ""),
                    currentAsset.name
                  );
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                🎥 Ver Video en AR
              </button>
            ) : null}
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
      console.log("Loading experience with slug:", slug);

      const response = await apiClient.getExperienceBySlug(slug);
      console.log("Experience response:", response);

      if (response.success && response.data) {
        console.log("Experience loaded:", response.data);
        console.log("Assets:", response.data.assets);
        setExperience(response.data);
      } else {
        console.error("Failed to load experience:", response.message);
        setError("Experiencia no encontrada");
      }
    } catch (err) {
      console.error("Error loading experience:", err);
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

      {/* Include A-Frame for AR */}
      <script src="https://aframe.io/releases/1.4.0/aframe.min.js" />
      <script src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/aframe/build/aframe-ar.min.js" />

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
