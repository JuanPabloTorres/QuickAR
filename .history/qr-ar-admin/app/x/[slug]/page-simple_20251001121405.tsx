"use client";

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
      : "http://localhost:5001";

  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

// Simple AR Camera Component
const SimpleARViewer: React.FC<{
  assetUrl: string;
  assetName: string;
  onClose: () => void;
}> = ({ assetUrl, assetName, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Cámara trasera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header con botón cerrar */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-medium"
        >
          ❌ Cerrar AR
        </button>
      </div>

      {/* Título */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-white font-bold text-lg bg-black bg-opacity-50 px-3 py-1 rounded">
          AR: {assetName}
        </h3>
      </div>

      {/* Video de cámara */}
      {error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-xl mb-4">⚠️ Error de Cámara</p>
            <p className="mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="flex-1 w-full h-full object-cover"
        />
      )}

      {/* Overlay de imagen AR */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border-2 border-white border-dashed">
          <img
            src={assetUrl}
            alt={assetName}
            className="max-w-xs max-h-64 object-contain rounded shadow-lg"
          />
          <p className="text-white text-center mt-2 font-semibold">
            {assetName}
          </p>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
          📱 Mueve el dispositivo para ver la imagen en AR
        </div>
      </div>
    </div>
  );
};

// AR Viewer Component
const ARViewer: React.FC<{ experience: ExperienceDto }> = ({ experience }) => {
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [showAR, setShowAR] = useState(false);

  const currentAsset = experience.assets[currentAssetIndex];

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

  const openARViewer = () => {
    trackEvent("ar_button_click", currentAsset.id);
    setShowAR(true);
  };

  const closeARViewer = () => {
    setShowAR(false);
  };

  const renderAsset = (asset: AssetDto) => {
    const assetUrl = getAssetUrl(asset.url || "");

    switch (asset.kind) {
      case "image":
        return (
          <div className="ar-viewer relative">
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

            {/* Botón AR flotante */}
            <button
              onClick={openARViewer}
              className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg flex items-center gap-2"
            >
              📱 Ver en AR
            </button>
          </div>
        );

      case "video":
        return (
          <div className="ar-viewer relative">
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
            <button
              onClick={openARViewer}
              className="absolute bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg flex items-center gap-2"
            >
              🎥 Ver en AR
            </button>
          </div>
        );

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
    <div className="space-y-4">
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
      </div>

      {/* AR Viewer Overlay */}
      {showAR && (
        <SimpleARViewer
          assetUrl={getAssetUrl(currentAsset.url || "")}
          assetName={currentAsset.name}
          onClose={closeARViewer}
        />
      )}
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
      {/* Include model-viewer script for 3D models */}
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
    </>
  );
}
