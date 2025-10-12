/**
 * ARExperiencePage - Página cliente para experiencias AR
 * Componente principal que renderiza la experiencia AR completa
 */

"use client";

import { ArClient, ArProvider, useAR } from "@/components/ArClient";
import { ArNotification, ArOverlay } from "@/components/ArOverlay";
import { AssetRenderer } from "@/components/AssetRenderer";
import { apiClient } from "@/lib/api/client";
import { getPrimaryAsset } from "@/lib/experience-helpers";
import { cn } from "@/lib/utils";
import { ARAsset, ARExperience } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface ARExperiencePageProps {
  experience: ARExperience;
  selectedAssetId?: string;
  mode?: "ar" | "preview";
}

/**
 * Componente interno que usa el contexto AR
 */
function ARExperienceContent({
  experience,
  selectedAssetId,
  mode = "ar",
}: ARExperiencePageProps) {
  const router = useRouter();
  const { state, capabilities, isARSupported } = useAR();
  const [currentAsset, setCurrentAsset] = useState<ARAsset | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [notification, setNotification] = useState<{
    type: "info" | "success" | "warning" | "error";
    message: string;
  } | null>(null);

  // Obtener assets AR disponibles
  const arAssets = experience.assets.filter(
    (asset) => asset.type === "model3d"
  );

  // Seleccionar asset inicial
  useEffect(() => {
    let initialAsset: ARAsset | null = null;

    if (selectedAssetId) {
      initialAsset =
        arAssets.find((asset) => asset.id === selectedAssetId) || null;
    }

    if (!initialAsset && arAssets.length > 0) {
      initialAsset = getPrimaryAsset(experience) || arAssets[0];
    }

    setCurrentAsset(initialAsset);
  }, [selectedAssetId, arAssets, experience]);

  // Manejar cambios de estado AR
  useEffect(() => {
    if (state.error) {
      setNotification({
        type: "error",
        message: state.error,
      });
    }
  }, [state.error]);

  // Track analytics
  useEffect(() => {
    const trackView = async () => {
      try {
        await apiClient.trackEvent({
          experienceId: experience.id,
          eventType: "experience_ar_view",
          properties: {
            mode,
            hasARSupport: isARSupported,
            assetCount: arAssets.length,
            userAgent: navigator.userAgent,
          },
        });
      } catch (error) {
        console.warn("Failed to track AR view:", error);
      }
    };

    trackView();
  }, [experience.id, mode, isARSupported, arAssets.length]);

  const handleAssetChange = (asset: ARAsset) => {
    setCurrentAsset(asset);
    // Actualizar URL sin recargar la página
    const url = new URL(window.location.href);
    url.searchParams.set("asset", asset.id);
    router.replace(url.toString(), { scroll: false });
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  if (!currentAsset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando experiencia AR...
          </h2>
          <p className="text-gray-600">Preparando los modelos 3D para AR</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Header móvil */}
      <header className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4">
          <Link
            href={`/experiences/${experience.id}`}
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
          >
            <span>←</span>
            <span className="font-medium truncate max-w-48">
              {experience.title}
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            {state.isActive && (
              <div className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
                AR Activo
              </div>
            )}

            <button
              onClick={() => router.back()}
              className="p-2 text-white hover:text-gray-200 transition-colors"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      </header>

      {/* Renderizador AR principal */}
      <main className="relative w-full h-screen">
        <AssetRenderer
          asset={currentAsset}
          enableAR={mode === "ar" && isARSupported}
          autoLoad={true}
          showControls={true}
          className="w-full h-full"
          onLoad={() => {
            setNotification({
              type: "success",
              message: "Modelo cargado correctamente",
            });
          }}
          onError={(error) => {
            setNotification({
              type: "error",
              message: `Error: ${error}`,
            });
          }}
          onARStart={() => {
            setShowInstructions(false);
            apiClient
              .trackEvent({
                experienceId: experience.id,
                eventType: "ar_session_start",
                properties: { assetId: currentAsset.id },
              })
              .catch(console.warn);
          }}
          onAREnd={() => {
            apiClient
              .trackEvent({
                experienceId: experience.id,
                eventType: "ar_session_end",
                properties: { assetId: currentAsset.id },
              })
              .catch(console.warn);
          }}
        />

        {/* Controles AR */}
        <ArClient
          asset={currentAsset}
          className="absolute bottom-safe-area left-4 right-4 z-30"
          onSessionStart={() => {
            setNotification({
              type: "info",
              message: "Sesión AR iniciada",
            });
          }}
          onError={(error) => {
            setNotification({
              type: "error",
              message: error,
            });
          }}
        />

        {/* Selector de assets si hay múltiples */}
        {arAssets.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex space-x-2 bg-white/10 backdrop-blur-sm rounded-full p-2 border border-white/20">
              {arAssets.map((asset, index) => (
                <button
                  key={asset.id}
                  onClick={() => handleAssetChange(asset)}
                  className={cn(
                    "w-12 h-12 rounded-full border-2 transition-all",
                    currentAsset.id === asset.id
                      ? "border-white bg-white/20"
                      : "border-white/30 bg-white/5 hover:bg-white/10"
                  )}
                  title={asset.name}
                >
                  <span className="text-white font-medium">{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Información de la experiencia */}
        {!state.isActive && (
          <div className="absolute bottom-safe-area left-4 right-4 z-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h1 className="text-xl font-bold text-white mb-1">
                {experience.title}
              </h1>
              {experience.description && (
                <p className="text-white/80 text-sm">
                  {experience.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-3 text-sm text-white/60">
                <span>{currentAsset.name}</span>
                <span>
                  {arAssets.length} modelo{arAssets.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Overlay AR */}
      <ArOverlay
        experience={experience}
        asset={currentAsset}
        position="floating"
        showPerformanceInfo={mode === "preview"}
        showInstructions={false}
        showStats={false}
        onClose={handleCloseInstructions}
      />

      {/* Instrucciones iniciales */}
      {showInstructions && !state.isActive && isARSupported && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Bienvenido a AR!
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Toca el botón "Ver en AR" para iniciar la experiencia de
                Realidad Aumentada. Asegúrate de estar en un lugar con buena
                iluminación.
              </p>

              <div className="space-y-2 mb-6 text-left text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>✨</span>
                  <span>Busca una superficie plana</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>👆</span>
                  <span>Toca para colocar el objeto</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🤏</span>
                  <span>Pellizca para redimensionar</span>
                </div>
              </div>

              <button
                onClick={handleCloseInstructions}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                ¡Empezar!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje para dispositivos sin AR */}
      {!isARSupported && mode === "ar" && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AR no disponible
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Tu dispositivo no soporta Realidad Aumentada. Puedes ver el modelo
              3D en modo vista previa.
            </p>

            <div className="space-y-2">
              <Link
                href={`/ar/${experience.id}?mode=preview`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Ver en 3D
              </Link>
              <Link
                href={`/experiences/${experience.id}`}
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
              >
                Ver detalles
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {notification && (
        <ArNotification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          autoClose={3000}
        />
      )}
    </div>
  );
}

/**
 * Página principal AR con provider
 */
export function ARExperiencePage(props: ARExperiencePageProps) {
  return (
    <ArProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <ARExperienceContent {...props} />
      </Suspense>
    </ArProvider>
  );
}
