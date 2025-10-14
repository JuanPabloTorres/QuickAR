/**
 * Enhanced AR Canvas Component
 * Universal asset viewer with full AR support
 */

"use client";

import { Asset, Experience } from "@/types";
import { useEffect, useState } from "react";
import { UniversalAssetViewer } from "./UniversalAssetViewer";
import ARExperienceCanvas from "./ARExperienceCanvas";

interface SimpleARCanvasProps {
  experience: Experience;
  className?: string;
  onPerformanceChange?: (performance: any) => void;
  currentAssetIndex?: number;
  onAssetChange?: (index: number) => void;
}

// Enhanced AR Scene Component
function EnhancedARScene({
  experience,
  currentAssetIndex = 0,
  onPerformanceChange,
}: {
  experience: Experience;
  currentAssetIndex: number;
  onPerformanceChange?: (performance: any) => void;
}) {
  const [isARActive, setIsARActive] = useState(false);
  const [arSupported, setARSupported] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);

  // Get current asset
  useEffect(() => {
    if (experience.assets && experience.assets.length > 0) {
      const asset =
        experience.assets[
          Math.min(currentAssetIndex, experience.assets.length - 1)
        ];
      setCurrentAsset(asset);
      console.log("� Current asset changed:", asset.name, asset.assetType);
    }
  }, [experience.assets, currentAssetIndex]);

  // Check AR support
  useEffect(() => {
    const checkARSupport = async () => {
      if (typeof navigator !== "undefined" && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported(
            "immersive-ar"
          );
          setARSupported(supported);
          console.log("🔍 AR Support:", supported);
        } catch (error) {
          console.log("AR not supported:", error);
          setARSupported(false);
        }
      } else {
        // Fallback: check for model-viewer AR capabilities
        setARSupported(true); // model-viewer handles AR fallbacks
      }
    };

    checkARSupport();
  }, []);

  // Handle performance monitoring
  const handleAssetLoad = () => {
    onPerformanceChange?.({
      fps: 60,
      status: "Asset loaded",
      assetType: currentAsset?.assetType,
      assetName: currentAsset?.name,
    });
  };

  const handleAssetError = (error: string) => {
    onPerformanceChange?.({
      fps: 0,
      status: `Asset error: ${error}`,
      assetType: currentAsset?.assetType,
      assetName: currentAsset?.name,
    });
  };

  // No assets fallback
  if (!experience.assets || experience.assets.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <div className="text-xl font-semibold">Experiencia AR Lista</div>
          <div className="text-sm opacity-75 mt-2">
            Sin contenido disponible
          </div>
        </div>
      </div>
    );
  }

  // No current asset fallback
  if (!currentAsset) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <div>Cargando contenido...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Universal Asset Viewer */}
      <UniversalAssetViewer
        asset={currentAsset}
        className="w-full h-full"
        onLoad={handleAssetLoad}
        onError={handleAssetError}
        arMode={isARActive}
      />

      {/* AR Status Indicator */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        <span className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              arSupported ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span>
            {isARActive
              ? "AR Activo"
              : arSupported
              ? "AR Listo"
              : "AR No Disponible"}
          </span>
        </span>
      </div>

      {/* Asset Counter for Multiple Assets */}
      {experience.assets.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {currentAssetIndex + 1} de {experience.assets.length}
        </div>
      )}
    </div>
  );
}

export default function SimpleARCanvas({
  experience,
  className = "",
  onPerformanceChange,
  currentAssetIndex = 0,
  onAssetChange,
}: SimpleARCanvasProps) {
  const [isARMode, setIsARMode] = useState(false);

  const handleARActivation = async () => {
    console.log("🚀 AR mode requested for experience:", experience.id);

    try {
      setIsARMode(true);
      onPerformanceChange?.({ fps: 60, status: "Activating AR..." });

      // Check if current asset is a 3D model
      const currentAsset =
        experience.assets[
          Math.min(currentAssetIndex, experience.assets.length - 1)
        ];
      if (currentAsset?.assetType !== "model3d") {
        throw new Error(
          "AR solo disponible para modelos 3D. Cambia a un modelo 3D primero."
        );
      }

      // Enhanced model-viewer detection with comprehensive logging
      const selectors = [
        "#universal-model-viewer",
        ".universal-model-viewer",
        "model-viewer.universal-model-viewer",
        "model-viewer",
        "[data-asset-id]",
      ];

      let modelViewer: Element | null = null;
      let attempts = 0;
      const maxAttempts = 15; // Increased attempts

      // Debug: Log all model-viewer elements in DOM
      const allModelViewers = document.querySelectorAll("model-viewer");
      console.log(
        `🔍 DOM contains ${allModelViewers.length} model-viewer elements:`,
        Array.from(allModelViewers).map((mv, idx) => ({
          index: idx,
          id: (mv as any).id,
          className: (mv as any).className,
          src: (mv as any).src,
          loaded: (mv as any).loaded,
          canActivateAR: (mv as any).canActivateAR,
          arModes: (mv as any).arModes,
        }))
      );

      while (!modelViewer && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 300)); // Longer wait

        // Try each selector
        for (const selector of selectors) {
          modelViewer = document.querySelector(selector);
          if (modelViewer) {
            console.log(
              `✅ Found model-viewer with selector "${selector}" on attempt ${
                attempts + 1
              }:`,
              {
                element: modelViewer,
                id: (modelViewer as any).id,
                className: (modelViewer as any).className,
                src: (modelViewer as any).src,
                loaded: (modelViewer as any).loaded,
                canActivateAR: (modelViewer as any).canActivateAR,
              }
            );
            break;
          }
        }

        attempts++;
        console.log(
          `🔍 Searching for model-viewer (attempt ${attempts}/${maxAttempts})`
        );

        // Force a small reflow to help with detection
        if (attempts % 5 === 0) {
          document.body.offsetHeight; // Trigger reflow
        }
      }

      if (modelViewer && "activateAR" in modelViewer) {
        console.log("🎯 Model-viewer found, attempting to activate AR...");

        const modelViewerElement = modelViewer as any;

        // Wait for model to be fully loaded
        if (!modelViewerElement.loaded) {
          console.log("⏳ Waiting for 3D model to load...");
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.warn("⚠️ Model load timeout, proceeding anyway");
              resolve(void 0);
            }, 8000);

            const onLoad = () => {
              console.log("✅ 3D model loaded successfully");
              clearTimeout(timeout);
              modelViewerElement.removeEventListener("load", onLoad);
              resolve(void 0);
            };

            modelViewerElement.addEventListener("load", onLoad);
          });
        }

        // Enhanced AR capability check
        console.log("🔍 Checking AR capabilities:", {
          canActivateAR: modelViewerElement.canActivateAR,
          ar: modelViewerElement.ar,
          arModes: modelViewerElement.arModes,
          src: modelViewerElement.src,
        });

        if (!modelViewerElement.canActivateAR) {
          // Try to force AR availability check
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (!modelViewerElement.canActivateAR) {
            throw new Error(
              "AR no está disponible en este dispositivo, navegador o modelo"
            );
          }
        }

        // Call activateAR method
        console.log("🚀 Calling activateAR() method...");
        await modelViewerElement.activateAR();
        console.log("✅ AR activated successfully");

        onPerformanceChange?.({ fps: 60, status: "AR Active" });
      } else {
        throw new Error(
          "Model-viewer no encontrado. Asegúrate de que hay un modelo 3D cargado."
        );
      }
    } catch (error) {
      console.error("❌ Failed to activate AR:", error);
      setIsARMode(false);
      onPerformanceChange?.({ fps: 0, status: `AR Error: ${error}` });

      // Show user-friendly error
      if (typeof window !== "undefined") {
        const errorMsg =
          error instanceof Error ? error.message : "AR no disponible";

        // More specific error messages
        let userMessage = `No se pudo activar AR: ${errorMsg}`;
        if (errorMsg.includes("modelo 3D")) {
          userMessage +=
            "\n\n💡 Sugerencia: Usa los botones ◀ ▶ para navegar a un modelo 3D.";
        } else {
          userMessage +=
            "\n\nAsegúrate de:\n• Estar en un dispositivo compatible\n• Permitir acceso a la cámara\n• Tener un modelo 3D visible";
        }

        alert(userMessage);
      }
    }
  };

  const handleVRActivation = () => {
    console.log("🥽 VR mode requested for experience:", experience.id);
    onPerformanceChange?.({ fps: 60, status: "VR requested" });

    // Check VR capabilities
    if (navigator.xr) {
      navigator.xr
        .isSessionSupported("immersive-vr")
        .then((supported) => {
          console.log("VR supported:", supported);
          if (supported) {
            // Could implement VR session here
            console.log("🥽 VR session could be started");
          }
        })
        .catch((error) => {
          console.error("VR check failed:", error);
        });
    }
  };

  // Handle asset navigation
  const handleAssetNavigation = (direction: "next" | "prev") => {
    if (!onAssetChange || experience.assets.length <= 1) return;

    let newIndex = currentAssetIndex;
    if (direction === "next") {
      newIndex = (currentAssetIndex + 1) % experience.assets.length;
    } else {
      newIndex =
        currentAssetIndex > 0
          ? currentAssetIndex - 1
          : experience.assets.length - 1;
    }

    onAssetChange(newIndex);
    console.log(`🔄 Asset navigation: ${direction} -> index ${newIndex}`);
  };

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Enhanced AR Scene with Universal Asset Support */}
      <EnhancedARScene
        experience={experience}
        currentAssetIndex={currentAssetIndex}
        onPerformanceChange={onPerformanceChange}
      />

      {/* Enhanced AR/VR Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-wrap gap-2 justify-center max-w-sm">
        {/* Asset Navigation (if multiple assets) */}
        {experience.assets.length > 1 && (
          <>
            <button
              onClick={() => handleAssetNavigation("prev")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              title="Contenido anterior"
            >
              ◀ Anterior
            </button>
            <button
              onClick={() => handleAssetNavigation("next")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              title="Siguiente contenido"
            >
              Siguiente ▶
            </button>
          </>
        )}

        {/* AR Activation - Only show for 3D models */}
        {(() => {
          const currentAsset =
            experience.assets[
              Math.min(currentAssetIndex, experience.assets.length - 1)
            ];
          const is3DModel = currentAsset?.assetType === "model3d";

          if (is3DModel) {
            return (
              <button
                onClick={handleARActivation}
                className={`${
                  isARMode
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white px-4 py-2 rounded-lg transition-colors font-medium`}
                title="Activar realidad aumentada"
              >
                {isARMode ? "✓ AR Activo" : "🎯 Activar AR"}
              </button>
            );
          } else {
            return (
              <div
                className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                title={`AR no disponible para ${
                  currentAsset?.assetType || "este tipo de contenido"
                }`}
              >
                🚫 AR no disponible
              </div>
            );
          }
        })()}

        {/* Debug Button - temporary for troubleshooting */}
        <button
          onClick={() => {
            console.log("🔧 DEBUG: Manual model-viewer inspection");
            const allElements = document.querySelectorAll("model-viewer");
            const debugInfo = {
              totalModelViewers: allElements.length,
              currentAssetIndex,
              currentAsset:
                experience.assets[
                  Math.min(currentAssetIndex, experience.assets.length - 1)
                ],
              elements: Array.from(allElements).map((el, idx) => ({
                index: idx,
                id: (el as any).id,
                className: (el as any).className,
                src: (el as any).src,
                loaded: (el as any).loaded,
                canActivateAR: (el as any).canActivateAR,
                arModes: (el as any).arModes,
                ar: (el as any).ar,
              })),
            };
            console.table(debugInfo.elements);
            console.log("Full debug info:", debugInfo);

            // Try to find and highlight the element
            const mv =
              document.querySelector(".universal-model-viewer") ||
              document.querySelector("model-viewer");
            if (mv) {
              console.log(
                "Found element, adding red border for identification"
              );
              (mv as HTMLElement).style.border = "3px solid red";
              setTimeout(() => {
                (mv as HTMLElement).style.border = "";
              }, 3000);
            }
          }}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-xs"
          title="Debug model-viewer detection"
        >
          🔧 Debug
        </button>

        {/* VR Activation - Also only for 3D models */}
        {(() => {
          const currentAsset =
            experience.assets[
              Math.min(currentAssetIndex, experience.assets.length - 1)
            ];
          const is3DModel = currentAsset?.assetType === "model3d";

          if (is3DModel) {
            return (
              <button
                onClick={handleVRActivation}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                title="Activar realidad virtual"
              >
                🥽 Activar VR
              </button>
            );
          }
        })()}
      </div>
    </div>
  );
}

// Export both default and named export for compatibility
export { SimpleARCanvas };
