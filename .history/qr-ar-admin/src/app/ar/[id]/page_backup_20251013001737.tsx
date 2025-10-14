/**
 * FUNCTIONAL AR EXPERIENCE - Simple Working Version
 */

"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Experience } from "@/types";
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
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null);
  const [isStartingAR, setIsStartingAR] = useState(false);

  // AR interaction states
  const [arObjectPosition, setArObjectPosition] = useState({ x: 0.5, y: 0.5 });
  const [arObjectScale, setArObjectScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);

  // AR refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const experienceId = params.id as string;

  // Check camera capabilities
  useEffect(() => {
    const checkCameraSupport = () => {
      const isSecure = window.isSecureContext;
      const hasMediaDevices = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );
      setCameraSupported(isSecure && hasMediaDevices);
    };

    checkCameraSupport();
  }, []);

  // Load experience
  useEffect(() => {
    const loadExperience = async () => {
      try {
        setIsLoading(true);
        let response;

        if (experienceId.includes("-")) {
          response = await getExperienceBySlug(experienceId);
        } else {
          response = await getExperienceById(experienceId);
        }

        if (response.success && response.data) {
          const normalized = normalizeExperience(response.data);
          setExperience(normalized);
        } else {
          setError("No se pudo cargar la experiencia");
        }
      } catch (error) {
        console.error("Error loading experience:", error);
        setError("Error al cargar la experiencia");
      } finally {
        setIsLoading(false);
      }
    };

    if (experienceId) {
      loadExperience();
    }
  }, [experienceId]);

  // Navigation functions
  const handleBack = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    router.back();
  };

  const stopAR = () => {
    setIsARActive(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
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

  // Camera access
  const startAR = async () => {
    if (!cameraSupported) {
      setError("Cámara no soportada");
      return;
    }

    setIsStartingAR(true);
    setError("");

    try {
      console.log("🚀 Starting REAL AR with camera...");

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log("✅ Media stream obtained");
      setStream(mediaStream);
      setIsARActive(true);

      // Wait for video element to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        console.log("✅ Camera opened successfully!");
        startARRendering();
      }

      setIsStartingAR(false);
    } catch (error: any) {
      console.error("❌ Camera access error:", error);
      setIsStartingAR(false);
      setError("No se pudo acceder a la cámara");
    }
  };

  // AR rendering
  const startARRendering = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderFrame = () => {
      if (video.readyState >= 2 && isARActive) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawARContent(ctx, canvas.width, canvas.height);
      }

      if (isARActive) {
        requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
  };

  // Draw AR content
  const drawARContent = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    if (!experience?.assets[currentAssetIndex]) return;

    const arX = width * arObjectPosition.x;
    const arY = height * arObjectPosition.y;

    // Draw red circle test
    ctx.save();
    ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(arX, arY, 30 * arObjectScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("AR", arX, arY + 5);
    ctx.restore();

    console.log("🎨 Drew AR content at:", arX, arY);
  };

  // Touch handlers
  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const pos = {
        x: (touch.clientX - rect.left) / rect.width,
        y: (touch.clientY - rect.top) / rect.height,
      };
      setArObjectPosition(pos);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">⏳</div>
          <div className="text-xl font-semibold">Cargando experiencia...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-xl font-semibold mb-4">{error}</div>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Volver
          </button>
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
          className="absolute inset-0 w-full h-full z-10"
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
        />

        {/* Test DIV Indicator */}
        <div
          className="absolute w-16 h-16 bg-blue-500 border-4 border-white rounded-full flex items-center justify-center z-20"
          style={{
            left: `${arObjectPosition.x * 100}%`,
            top: `${arObjectPosition.y * 100}%`,
            transform: `translate(-50%, -50%) scale(${arObjectScale})`,
          }}
        >
          <span className="text-white font-bold text-xs">DIV</span>
        </div>

        {/* Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-30">
          <button
            onClick={stopAR}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold"
          >
            ← Salir AR
          </button>

          <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
            📱 CÁMARA ACTIVA
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4 z-30">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => {
                setArObjectPosition({ x: 0.5, y: 0.5 });
                setArObjectScale(1.0);
              }}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-white"
            >
              🎯 Centrar
            </button>
            <button
              onClick={() =>
                setArObjectScale((prev) => Math.min(2.0, prev * 1.2))
              }
              className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-white"
            >
              🔍 +
            </button>
            <button
              onClick={() =>
                setArObjectScale((prev) => Math.max(0.5, prev * 0.8))
              }
              className="bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded text-white"
            >
              🔎 -
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Start AR Screen
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
          </div>

          {/* Camera support status */}
          {cameraSupported !== null && (
            <div
              className={`mb-6 glass p-4 rounded-lg backdrop-blur-sm ${
                cameraSupported ? "bg-green-900/30" : "bg-red-900/30"
              }`}
            >
              <div
                className={`flex items-center space-x-2 ${
                  cameraSupported ? "text-green-400" : "text-red-400"
                }`}
              >
                <span className="text-xl">{cameraSupported ? "✅" : "❌"}</span>
                <span className="text-sm">
                  {cameraSupported
                    ? "Cámara disponible"
                    : window.isSecureContext
                    ? "Cámara no soportada"
                    : "Se requiere HTTPS"}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={startAR}
            disabled={cameraSupported === false || isStartingAR}
            className={`w-full p-4 rounded-lg text-white font-semibold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
              cameraSupported === false || isStartingAR
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            }`}
          >
            {cameraSupported === false
              ? "❌ Cámara no disponible"
              : isStartingAR
              ? "🔄 Iniciando cámara..."
              : "🚀 ABRIR CÁMARA AR"}
          </button>
        </div>
      </div>
    </div>
  );
}
