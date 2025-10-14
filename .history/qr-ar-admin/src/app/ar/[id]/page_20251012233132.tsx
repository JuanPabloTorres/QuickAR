/**
 * Quick AR Experience Page - Complete Refactored Implementation
 * Transforms digital content into immersive AR experiences accessible via QR codes
 * Supports 3D models, images, videos, text, and web content in AR
 */

"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// AR Components
import ARErrorScreen from "../../../components/ar/ARErrorScreen";
import ARIntroScreen from "../../../components/ar/ARIntroScreen";
import ARLoadingScreen from "../../../components/ar/ARLoadingScreen";
import QuickARViewer from "../../../components/ar/QuickARViewer";

// Types and Interfaces
interface ARCapabilities {
  webxr: boolean;
  hitTest: boolean;
  lightEstimation: boolean;
  planeDetection: boolean;
  anchoredObjects: boolean;
  camera: boolean;
  deviceMotion: boolean;
  geolocation: boolean;
}

interface BrowserInfo {
  name: string;
  version: string;
  isWebXRSupported: boolean;
  platform: string;
}

type ARState = "loading" | "error" | "not-found" | "intro" | "ar-active";

// Utility functions
const getBrowserInfo = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  let name = "Unknown";
  let version = "Unknown";

  if (userAgent.includes("Chrome")) {
    name = "Chrome";
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : "Unknown";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    name = "Safari";
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : "Unknown";
  } else if (userAgent.includes("Firefox")) {
    name = "Firefox";
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : "Unknown";
  }

  return {
    name,
    version,
    isWebXRSupported: "xr" in navigator,
    platform: navigator.platform || "Unknown",
  };
};

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

  // Render based on current state
  switch (currentState) {
    case "loading":
      return (
        <ARLoadingScreen
          experienceId={experienceId}
          message="Cargando experiencia AR..."
        />
      );

    case "error":
    case "not-found":
      return (
        <ARErrorScreen
          error={error || "Error desconocido"}
          onRetry={() => window.location.reload()}
          onBack={handleBack}
          isNotFound={currentState === "not-found"}
        />
      );

    case "intro":
      return experience ? (
        <ARIntroScreen
          experience={experience}
          arCapabilities={arCapabilities}
          onStartAR={handleStartAR}
          onBack={handleBack}
          currentAssetIndex={currentAssetIndex}
          onAssetChange={handleAssetChange}
        />
      ) : null;

    case "ar-active":
      return experience ? (
        <QuickARViewer
          experience={experience}
          currentAssetIndex={currentAssetIndex}
          onAssetChange={handleAssetChange}
          onExitAR={handleExitAR}
          onError={handleARError}
          arCapabilities={arCapabilities}
        />
      ) : null;

    default:
      return null;
  }
}
