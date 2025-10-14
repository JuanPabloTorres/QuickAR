/**
 * FUNCTIONAL AR EXPERIENCE - Opens Real Camera
 * This version opens the actual camera and shows AR content in the real world
 */

"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Asset, Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ARExperience() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

  // AR refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const experienceId = params.id as string;

  // Load experience
  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) {
        setError("ID de experiencia no válido");
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔄 Loading experience:", experienceId);

        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            experienceId
          );

        let response;
        try {
          if (isUuid) {
            response = await getExperienceById(experienceId);
          } else {
            response = await getExperienceBySlug(experienceId);
          }
        } catch (fetchError) {
          console.error("❌ Network error:", fetchError);
          setError(
            "Error de conexión. Verifica que el servidor API esté ejecutándose en http://localhost:5001"
          );
          setIsLoading(false);
          return;
        }

        if (response?.success && response.data) {
          const normalizedExperience = normalizeExperience(response.data);
          setExperience(normalizedExperience);
          console.log("✅ Experience loaded:", normalizedExperience);
        } else {
          setError("Experiencia no encontrada");
        }
      } catch (err) {
        console.error("❌ Error loading experience:", err);
        setError("Error al cargar la experiencia");
      } finally {
        setIsLoading(false);
      }
    };

    loadExperience();
  }, [experienceId]);

  // Start AR with camera
  const startAR = async () => {
    try {
      console.log("🚀 Starting REAL AR with camera...");

      // Check if running in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        setError("Se requiere HTTPS para acceder a la cámara. Usa https://localhost en lugar de http://localhost");
        return;
      }

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Tu navegador no soporta acceso a la cámara. Usa Chrome, Firefox o Safari moderno.");
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        console.log("✅ Camera opened successfully!");
        setIsARActive(true);
        startARRendering();
      }
    } catch (error) {
      console.error("❌ Camera access error:", error);
      setError(
        "No se pudo acceder a la cámara. Verifica los permisos y usa HTTPS."
      );
    }
  };

  // AR rendering loop
  const startARRendering = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderFrame = () => {
      if (video.readyState >= 2 && isARActive) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        drawARContent(ctx, canvas.width, canvas.height);
      }

      if (isARActive) {
        requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
  };

  // Draw AR content overlay
  const drawARContent = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const currentAsset = experience?.assets[currentAssetIndex];
    if (!currentAsset) return;

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw placement target
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(centerX - 30, centerY);
    ctx.lineTo(centerX + 30, centerY);
    ctx.moveTo(centerX, centerY - 30);
    ctx.lineTo(centerX, centerY + 30);
    ctx.stroke();
    ctx.restore();

    // Draw asset content
    switch (currentAsset.assetType) {
      case "message":
        drawTextAR(ctx, currentAsset, centerX, centerY);
        break;
      case "image":
        drawImageAR(ctx, currentAsset, centerX, centerY);
        break;
      case "model3d":
        draw3DAR(ctx, currentAsset, centerX, centerY);
        break;
      default:
        drawDefaultAR(ctx, currentAsset, centerX, centerY);
    }
  };

  const drawTextAR = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number
  ) => {
    if (!asset.assetContent) return;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    const textWidth = ctx.measureText(asset.assetContent).width + 40;
    ctx.fillRect(x - textWidth / 2, y - 40, textWidth, 80);

    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(asset.assetContent, x, y);
    ctx.restore();
  };

  const drawImageAR = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number
  ) => {
    ctx.save();
    ctx.fillStyle = "rgba(100, 200, 255, 0.8)";
    ctx.fillRect(x - 80, y - 60, 160, 120);

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🖼️ " + asset.name, x, y);
    ctx.restore();
  };

  const draw3DAR = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number
  ) => {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 100, 100, 0.9)";
    ctx.lineWidth = 4;

    const size = 80;
    ctx.beginPath();
    ctx.rect(x - size / 2, y - size / 2, size, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - size / 2, y - size / 2);
    ctx.lineTo(x - size / 2 + 30, y - size / 2 - 30);
    ctx.moveTo(x + size / 2, y - size / 2);
    ctx.lineTo(x + size / 2 + 30, y - size / 2 - 30);
    ctx.moveTo(x + size / 2, y + size / 2);
    ctx.lineTo(x + size / 2 + 30, y + size / 2 - 30);
    ctx.moveTo(x - size / 2, y + size / 2);
    ctx.lineTo(x - size / 2 + 30, y + size / 2 - 30);
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🎯 " + asset.name, x, y + size + 25);
    ctx.restore();
  };

  const drawDefaultAR = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number
  ) => {
    ctx.save();
    ctx.fillStyle = "rgba(150, 150, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ " + asset.name, x, y);
    ctx.restore();
  };

  // Stop AR
  const stopAR = () => {
    console.log("🛑 Stopping AR...");

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    setIsARActive(false);
  };

  const handleBack = () => {
    stopAR();
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/experiences");
    }
  };

  const nextAsset = () => {
    if (experience && experience.assets.length > 1) {
      setCurrentAssetIndex((prev) => (prev + 1) % experience.assets.length);
    }
  };

  const prevAsset = () => {
    if (experience && experience.assets.length > 1) {
      setCurrentAssetIndex(
        (prev) =>
          (prev - 1 + experience.assets.length) % experience.assets.length
      );
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <div className="text-xl font-semibold">
            Cargando experiencia AR...
          </div>
          <div className="text-sm text-blue-200 mt-2">ID: {experienceId}</div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-2xl font-semibold mb-4">Error</div>
          <div className="text-blue-200 mb-8">{error}</div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              🔄 Intentar de nuevo
            </button>

            <button
              onClick={handleBack}
              className="w-full glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No experience
  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">🤔</div>
          <div className="text-xl font-semibold">
            No se pudo cargar la experiencia
          </div>
        </div>
      </div>
    );
  }

  // AR Active - REAL CAMERA VIEW
  if (isARActive) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* Camera video feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* AR Canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* AR UI Controls */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto z-50">
            <button
              onClick={stopAR}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold transition-colors"
            >
              ← Salir AR
            </button>

            <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="text-white text-sm font-medium">
                📱 CÁMARA AR ACTIVA
              </div>
            </div>
          </div>

          {/* Asset info */}
          <div className="absolute top-20 left-4 pointer-events-auto z-50">
            <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg">
              <div className="text-white">
                <div className="font-medium text-lg">
                  {experience.assets[currentAssetIndex].name}
                </div>
                <div className="text-blue-200 text-sm">
                  Tipo: {experience.assets[currentAssetIndex].assetType}
                </div>
              </div>
            </div>
          </div>

          {/* Center instructions */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
            <div className="text-center text-white">
              <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg mb-4">
                <div className="text-lg font-semibold">
                  🎯 Apunta hacia una superficie
                </div>
                <div className="text-sm text-blue-200">
                  El contenido AR aparece en el centro
                </div>
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto z-50">
            {experience.assets.length > 1 && (
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-4 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg">
                  <button
                    onClick={prevAsset}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded transition-colors"
                  >
                    <span className="text-white text-lg">←</span>
                  </button>

                  <div className="text-white">
                    {currentAssetIndex + 1} / {experience.assets.length}
                  </div>

                  <button
                    onClick={nextAsset}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded transition-colors"
                  >
                    <span className="text-white text-lg">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex justify-center">
              <div className="bg-green-600/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-white text-sm flex items-center space-x-2">
                  <span className="animate-pulse">●</span>
                  <span>AR FUNCIONANDO - Cámara Activa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Intro screen - Start AR
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={handleBack}
          className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          ← Volver
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="mb-8">
            <div className="text-3xl font-bold mb-4">{experience.title}</div>
            {experience.description && (
              <div className="text-blue-200/80 leading-relaxed mb-4">
                {experience.description}
              </div>
            )}
          </div>

          <div className="mb-8 glass p-6 rounded-lg backdrop-blur-sm">
            <div className="text-2xl mb-4">📱 AR Real</div>
            <div className="text-lg font-medium mb-2">
              {experience.assets.length} contenido
              {experience.assets.length !== 1 ? "s" : ""} disponible
              {experience.assets.length !== 1 ? "s" : ""}
            </div>
            <div className="text-sm text-blue-200/70">
              Tipos:{" "}
              {[...new Set(experience.assets.map((a) => a.assetType))].join(
                ", "
              )}
            </div>
          </div>

          <button
            onClick={startAR}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 p-4 rounded-lg text-white font-semibold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🚀 ABRIR CÁMARA AR
          </button>

          <div className="mt-6 glass p-4 rounded-lg backdrop-blur-sm">
            <div className="text-sm text-blue-200/70">
              <div className="font-medium mb-2">🔧 Instrucciones:</div>
              <div>• Permite acceso a la cámara</div>
              <div>• Apunta hacia superficies planas</div>
              <div>• El contenido aparece superpuesto en la realidad</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
