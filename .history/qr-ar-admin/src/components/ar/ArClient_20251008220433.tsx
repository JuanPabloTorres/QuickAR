"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ARExperience } from "../../types";
import ArOverlay from "./ArOverlay";
import ExperienceCube from "./ExperienceCube";

interface ArClientProps {
  experience: ARExperience;
  onBack?: () => void;
  onError?: (error: string) => void;
}

interface ARState {
  isARSupported: boolean;
  isARActive: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * ArClient Component
 * Main AR experience handler - manages AR initialization, tracking, and rendering
 * Provides fallback 3D view when AR is not available
 */
export function ArClient({ experience, onBack, onError }: ArClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [arState, setARState] = useState<ARState>({
    isARSupported: false,
    isARActive: false,
    isLoading: true,
    error: null,
  });

  // Check AR support on mount
  useEffect(() => {
    const checkARSupport = async () => {
      try {
        if (typeof window === "undefined") {
          setARState((prev) => ({
            ...prev,
            isLoading: false,
            isARSupported: false,
          }));
          return;
        }

        // Check for WebXR support
        if ("navigator" in window && "xr" in navigator) {
          const xr = (navigator as any).xr;
          if (xr) {
            try {
              const supported = await xr.isSessionSupported("immersive-ar");
              setARState((prev) => ({
                ...prev,
                isLoading: false,
                isARSupported: supported,
              }));
              return;
            } catch (err) {
              console.warn("WebXR AR not supported:", err);
            }
          }
        }

        // Fallback: Check for model-viewer AR support
        const hasModelViewer =
          typeof window !== "undefined" && "customElements" in window;

        setARState((prev) => ({
          ...prev,
          isLoading: false,
          isARSupported: hasModelViewer,
        }));
      } catch (err) {
        console.error("Error checking AR support:", err);
        setARState((prev) => ({
          ...prev,
          isLoading: false,
          isARSupported: false,
          error: "Failed to check AR support",
        }));
      }
    };

    checkARSupport();
  }, []);

  const handleARActivate = useCallback(async () => {
    try {
      setARState((prev) => ({ ...prev, isLoading: true, error: null }));

      // For now, we'll use the 3D viewer as AR fallback
      // In a real implementation, this would initialize WebXR or model-viewer AR

      setARState((prev) => ({
        ...prev,
        isLoading: false,
        isARActive: true,
      }));
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to start AR";
      setARState((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }));
      onError?.(error);
    }
  }, [onError]);

  const handleARDeactivate = useCallback(() => {
    setARState((prev) => ({
      ...prev,
      isARActive: false,
      error: null,
    }));
  }, []);

  const handleError = useCallback(
    (error: string) => {
      setARState((prev) => ({ ...prev, error }));
      onError?.(error);
    },
    [onError]
  );

  if (arState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-white text-lg font-medium mb-2">
            Inicializando AR...
          </h2>
          <p className="text-gray-300 text-sm">Verificando compatibilidad</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-gray-900 overflow-hidden"
    >
      {/* Main AR/3D Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ExperienceCube
          experience={experience}
          size={Math.min(window?.innerWidth * 0.8, 400) || 400}
          enableInteraction={true}
          displayMode="single"
          onError={handleError}
          className="shadow-2xl"
        />
      </div>

      {/* AR Overlay UI */}
      <ArOverlay
        experience={experience}
        arState={arState}
        onBack={onBack}
        onARActivate={handleARActivate}
        onARDeactivate={handleARDeactivate}
        onError={handleError}
      />

      {/* Error Display */}
      {arState.error && (
        <div className="absolute top-20 left-4 right-4 z-50">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-sm font-medium">{arState.error}</span>
              </div>
              <button
                onClick={() => setARState((prev) => ({ ...prev, error: null }))}
                className="ml-4 text-red-200 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArClient;
