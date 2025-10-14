/**
 * Quick AR Experience Page - Complete Refactored Implementation
 * Transforms digital content into immersive AR experiences accessible via QR codes
 * Supports 3D models, images, videos, text, and web content in AR
 */

"use client";

import { Experience, Asset } from "@/types";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";

// AR Components
import QuickARViewer from "@/components/ar/QuickARViewer";
import ARLoadingScreen from "@/components/ar/ARLoadingScreen";
import ARErrorScreen from "@/components/ar/ARErrorScreen";
import ARIntroScreen from "@/components/ar/ARIntroScreen";

type ARState = 'loading' | 'intro' | 'ar-active' | 'error' | 'not-found';

export default function QuickARExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [currentState, setCurrentState] = useState<ARState>('loading');
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [arCapabilities, setArCapabilities] = useState<any>(null);

  const experienceId = params.id as string;

  // Load experience data
  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) {
        setError("ID de experiencia no válido");
        setCurrentState('error');
        return;
      }

      try {
        setCurrentState('loading');

        // Determine if ID is UUID or slug
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(experienceId);
        
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
            setCurrentState('error');
            return;
          }

          if (!normalizedExperience.assets || normalizedExperience.assets.length === 0) {
            setError("Esta experiencia no tiene contenido AR disponible");
            setCurrentState('error');
            return;
          }

          setExperience(normalizedExperience);
          setCurrentState('intro');
          
          console.log("🎯 Quick AR Experience loaded:", {
            id: normalizedExperience.id,
            title: normalizedExperience.title,
            assets: normalizedExperience.assets.length,
            types: normalizedExperience.assets.map(a => a.assetType)
          });

        } else {
          setError(response.message || "Experiencia AR no encontrada");
          setCurrentState('not-found');
        }
      } catch (err) {
        console.error("❌ Error loading AR experience:", err);
        setError(err instanceof Error ? err.message : "Error inesperado");
        setCurrentState('error');
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
        https: window.location.protocol === 'https:',
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isAndroid: /Android/i.test(navigator.userAgent),
        isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
        browser: getBrowserInfo(),
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          orientation: window.screen.orientation?.type || 'unknown'
        }
      };

      if (typeof navigator !== "undefined" && navigator.xr) {
        try {
          capabilities.webxr = true;
          capabilities.webxrAR = await navigator.xr.isSessionSupported("immersive-ar");
          capabilities.webxrVR = await navigator.xr.isSessionSupported("immersive-vr");
        } catch (error) {
          console.error("WebXR capability check failed:", error);
        }
      }

      setArCapabilities(capabilities);
      console.log("📱 Device AR Capabilities:", capabilities);
    };

    if (typeof window !== 'undefined') {
      checkCapabilities();
    }
  }, []);

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const handleStartAR = () => {
    setCurrentState('ar-active');
  };

  const handleExitAR = () => {
    setCurrentState('intro');
  };

  const handleARError = (error: string) => {
    setError(error);
    setCurrentState('error');
  };

  const handleAssetChange = (index: number) => {
    setCurrentAssetIndex(Math.max(0, Math.min(index, (experience?.assets.length || 1) - 1)));
  };

  const handleBack = () => {
    // Try to go back in history first, otherwise redirect to experiences
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/experiences");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <div className="text-xl font-semibold">Cargando experiencia...</div>
          <div className="text-sm text-blue-200 mt-2">ID: {experienceId}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-2xl font-semibold mb-4">
            Experiencia no disponible
          </div>
          <div className="text-blue-200 mb-8">{error}</div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                window.location.reload();
              }}
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

  // Choose the appropriate AR client
  const ARClientComponent = useEnhanced ? EnhancedArClient : ArClient;

  return (
    <div className="min-h-screen">
      <ARClientComponent
        experience={experience}
        onBack={handleBack}
        className="h-screen"
      />

      {/* Mode indicator */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-xs pointer-events-none">
          {useEnhanced ? "🚀 Enhanced AR" : "📱 Classic AR"}
        </div>
      )}

      {/* Debug tools in development */}
      {process.env.NODE_ENV === "development" && <AssetUrlDebugger />}
    </div>
  );
}
