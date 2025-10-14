/**
 * FUNCTIONAL AR EXPERIENCE - Opens Real Camera
 * This version ACTUALLY opens the camera and shows AR content in the real world
 */

"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function FunctionalARExperience() {
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

  return {
    name,
    version,
    isWebXRSupported: "xr" in navigator,
    platform: navigator.platform || "Unknown",
  };
}

const detectARCapabilities = async (): Promise<ARCapabilities> => {
  const capabilities: ARCapabilities = {
    webxr: false,
    hitTest: false,
    lightEstimation: false,
    planeDetection: false,
    anchoredObjects: false,
    camera: false,
    deviceMotion: false,
    geolocation: false,
  };

  // Check WebXR support
  if ("xr" in navigator && navigator.xr) {
    capabilities.webxr = true;

    try {
      const isSupported = await navigator.xr.isSessionSupported("immersive-ar");
      if (isSupported) {
        capabilities.hitTest = true;
        capabilities.lightEstimation = true;
        capabilities.planeDetection = true;
        capabilities.anchoredObjects = true;
      }
    } catch (e) {
      console.log("WebXR AR not supported");
    }
  }

  // Check camera access
  if ("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices) {
    capabilities.camera = true;
  }

  // Check device motion
  if ("DeviceMotionEvent" in window) {
    capabilities.deviceMotion = true;
  }

  // Check geolocation
  if ("geolocation" in navigator) {
    capabilities.geolocation = true;
  }

  return capabilities;
};

export default function QuickARExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [currentState, setCurrentState] = useState<ARState>("loading");
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [arCapabilities, setArCapabilities] = useState<any>(null);

  const experienceId = params.id as string;

  // Load experience data
  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) {
        setError("ID de experiencia no válido");
        setCurrentState("error");
        return;
      }

      try {
        setCurrentState("loading");

        // Determine if ID is UUID or slug
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            experienceId
          );

        let response;
        if (isUuid) {
          response = await getExperienceById(experienceId);
        } else {
          response = await getExperienceBySlug(experienceId);
          if (!response.success) {
            response = await getExperienceById(experienceId);
          }
        }

        if (response.success && response.data) {
          const normalizedExperience = normalizeExperience(response.data);

          if (!normalizedExperience.isActive) {
            setError("Esta experiencia AR no está disponible actualmente");
            setCurrentState("error");
            return;
          }

          if (
            !normalizedExperience.assets ||
            normalizedExperience.assets.length === 0
          ) {
            setError("Esta experiencia no tiene contenido AR disponible");
            setCurrentState("error");
            return;
          }

          setExperience(normalizedExperience);
          setCurrentState("intro");

          console.log("🎯 Quick AR Experience loaded:", {
            id: normalizedExperience.id,
            title: normalizedExperience.title,
            assets: normalizedExperience.assets.length,
            types: normalizedExperience.assets.map((a) => a.assetType),
          });
        } else {
          setError(response.message || "Experiencia AR no encontrada");
          setCurrentState("not-found");
        }
      } catch (err) {
        console.error("❌ Error loading AR experience:", err);
        setError(err instanceof Error ? err.message : "Error inesperado");
        setCurrentState("error");
      }
    };

    loadExperience();
  }, [experienceId]);

  // Check AR capabilities
  useEffect(() => {
    const checkCapabilities = async () => {
      const capabilities = {
        webxr: false,
        webxrAR: false,
        webxrVR: false,
        https: window.location.protocol === "https:",
        isMobile:
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ),
        isAndroid: /Android/i.test(navigator.userAgent),
        isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
        browser: getBrowserInfo(),
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          orientation: window.screen.orientation?.type || "unknown",
        },
      };

      if (typeof navigator !== "undefined" && navigator.xr) {
        try {
          capabilities.webxr = true;
          capabilities.webxrAR = await navigator.xr.isSessionSupported(
            "immersive-ar"
          );
          capabilities.webxrVR = await navigator.xr.isSessionSupported(
            "immersive-vr"
          );
        } catch (error) {
          console.error("WebXR capability check failed:", error);
        }
      }

      setArCapabilities(capabilities);
      console.log("📱 Device AR Capabilities:", capabilities);
    };

    if (typeof window !== "undefined") {
      checkCapabilities();
    }
  }, []);

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Unknown";
  };

  const handleStartAR = () => {
    setCurrentState("ar-active");
  };

  const handleExitAR = () => {
    setCurrentState("intro");
  };

  const handleARError = (error: string) => {
    setError(error);
    setCurrentState("error");
  };

  const handleAssetChange = (index: number) => {
    setCurrentAssetIndex(
      Math.max(0, Math.min(index, (experience?.assets.length || 1) - 1))
    );
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/experiences");
    }
  };

  // Loading state
  if (currentState === "loading") {
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

  // Error state
  if (currentState === "error" || currentState === "not-found") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-2xl font-semibold mb-4">
            {currentState === "not-found"
              ? "Experiencia no encontrada"
              : "Error en la experiencia AR"}
          </div>
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

  // No experience loaded
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

  // AR Introduction Screen
  if (currentState === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 z-10">
          <button
            onClick={handleBack}
            className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            ← Volver
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white max-w-md mx-4 z-10">
            {/* Experience title and description */}
            <div className="mb-8">
              <div className="text-3xl font-bold mb-4">{experience.title}</div>
              {experience.description && (
                <div className="text-blue-200/80 leading-relaxed">
                  {experience.description}
                </div>
              )}
            </div>

            {/* Asset info */}
            <div className="mb-8 glass p-4 rounded-lg backdrop-blur-sm">
              <div className="text-lg font-medium mb-1">
                {experience.assets.length} contenido
                {experience.assets.length !== 1 ? "s" : ""} AR
              </div>
              <div className="text-sm text-blue-200/70">
                Tipos:{" "}
                {[...new Set(experience.assets.map((a) => a.assetType))].join(
                  ", "
                )}
              </div>
            </div>

            {/* AR capabilities */}
            {arCapabilities && (
              <div className="mb-8">
                <div
                  className={`flex items-center justify-center space-x-2 mb-4 ${
                    arCapabilities.webxrAR
                      ? "text-green-400"
                      : arCapabilities.isMobile
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  <span className="text-2xl">
                    {arCapabilities.webxrAR
                      ? "✅"
                      : arCapabilities.isMobile
                      ? "⚠️"
                      : "❌"}
                  </span>
                  <span>
                    {arCapabilities.webxrAR
                      ? "AR nativo disponible"
                      : arCapabilities.isMobile
                      ? "Vista AR básica"
                      : "Solo vista 3D"}
                  </span>
                </div>
              </div>
            )}

            {/* Start button */}
            <button
              onClick={handleStartAR}
              className={`w-full p-4 rounded-lg text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                arCapabilities?.webxrAR
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  : "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              }`}
            >
              {arCapabilities?.webxrAR
                ? "🚀 Iniciar experiencia AR"
                : "📱 Ver contenido 3D"}
            </button>

            {/* Tips */}
            <div className="mt-6 glass p-3 rounded-lg backdrop-blur-sm">
              <div className="text-xs text-blue-200/70">
                💡{" "}
                {arCapabilities?.webxrAR
                  ? "Mejor experiencia con buena iluminación y superficies planas"
                  : "Usa Chrome o Safari en móvil para AR completo"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AR Active - Use ArClient for now
  if (currentState === "ar-active" && experience) {
    // Import ArClient dynamically to avoid issues
    const { ArClient } = require("../../../components/ar/ArClient");

    return (
      <div className="h-screen relative">
        <ArClient
          experience={experience}
          onBack={handleExitAR}
          className="h-full"
        />

        {/* AR overlay controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50 pointer-events-none">
          <button
            onClick={handleExitAR}
            className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm pointer-events-auto"
          >
            ← Salir AR
          </button>

          <div className="glass px-4 py-2 rounded-lg backdrop-blur-sm pointer-events-auto">
            <div className="text-white text-sm">{experience.title}</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
