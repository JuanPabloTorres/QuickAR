/**
 * ArClient - Cliente de AR para manejar sesiones y estado AR
 * Maneja la inicialización, tracking y eventos de AR
 */

"use client";

import {
  createInitialARState,
  getARCapabilities,
  getDeviceARInfo,
  logARDebugInfo,
  updateARState,
} from "@/lib/ar-utils";
import { ARAsset, ARCapabilities, ARState } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Contexto de AR para compartir estado globalmente
interface ARContextType {
  state: ARState;
  capabilities: ARCapabilities | null;
  activeAsset: ARAsset | null;
  startARSession: (asset: ARAsset) => Promise<boolean>;
  endARSession: () => void;
  updateSession: (updates: Partial<ARState>) => void;
  isARSupported: boolean;
  deviceInfo: any;
}

const ARContext = createContext<ARContextType | null>(null);

/**
 * Hook para usar el contexto AR
 */
export function useAR() {
  const context = useContext(ARContext);
  if (!context) {
    throw new Error("useAR debe ser usado dentro de un ArProvider");
  }
  return context;
}

/**
 * Proveedor de contexto AR
 */
export function ArProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ARState>(createInitialARState());
  const [capabilities, setCapabilities] = useState<ARCapabilities | null>(null);
  const [activeAsset, setActiveAsset] = useState<ARAsset | null>(null);
  const [deviceInfo] = useState(getDeviceARInfo());

  const sessionRef = useRef<string | null>(null);

  // Inicializar capacidades AR
  useEffect(() => {
    const initializeAR = async () => {
      try {
        setState((current) => updateARState(current, { isLoading: true }));

        const arCapabilities = await getARCapabilities();
        setCapabilities(arCapabilities);

        setState((current) =>
          updateARState(current, {
            isSupported: arCapabilities.webxr || arCapabilities.modelViewer,
            isLoading: false,
          })
        );

        if (process.env.NODE_ENV === "development") {
          console.log("🔍 AR Capabilities:", arCapabilities);
          console.log("📱 Device Info:", deviceInfo);
        }
      } catch (error) {
        setState((current) =>
          updateARState(current, {
            isLoading: false,
            error: "Error al inicializar AR",
          })
        );
        console.error("Error initializing AR:", error);
      }
    };

    initializeAR();
  }, [deviceInfo]);

  // Iniciar sesión AR
  const startARSession = useCallback(
    async (asset: ARAsset): Promise<boolean> => {
      try {
        if (!capabilities?.webxr && !capabilities?.modelViewer) {
          throw new Error("AR no está soportado en este dispositivo");
        }

        if (asset.type !== "model3d") {
          throw new Error("Solo los modelos 3D soportan AR");
        }

        setState((current) => updateARState(current, { isLoading: true }));

        // Generar ID de sesión único
        const sessionId = `ar-session-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        sessionRef.current = sessionId;

        setActiveAsset(asset);

        setState((current) =>
          updateARState(current, {
            isActive: true,
            isLoading: false,
            sessionId,
            error: undefined,
          })
        );

        // Log para desarrollo
        if (process.env.NODE_ENV === "development") {
          logARDebugInfo(asset, capabilities);
        }

        return true;
      } catch (error) {
        setState((current) =>
          updateARState(current, {
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Error al iniciar AR",
          })
        );
        return false;
      }
    },
    [capabilities]
  );

  // Finalizar sesión AR
  const endARSession = useCallback(() => {
    setState((current) =>
      updateARState(current, {
        isActive: false,
        sessionId: undefined,
        error: undefined,
      })
    );

    setActiveAsset(null);
    sessionRef.current = null;
  }, []);

  // Actualizar estado de sesión
  const updateSession = useCallback((updates: Partial<ARState>) => {
    setState((current) => updateARState(current, updates));
  }, []);

  const contextValue: ARContextType = {
    state,
    capabilities,
    activeAsset,
    startARSession,
    endARSession,
    updateSession,
    isARSupported: capabilities?.webxr || capabilities?.modelViewer || false,
    deviceInfo,
  };

  return (
    <ARContext.Provider value={contextValue}>{children}</ARContext.Provider>
  );
}

/**
 * Componente cliente AR con UI
 */
interface ArClientProps {
  asset?: ARAsset;
  className?: string;
  children?: React.ReactNode;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  onError?: (error: string) => void;
}

export function ArClient({
  asset,
  className,
  children,
  onSessionStart,
  onSessionEnd,
  onError,
}: ArClientProps) {
  const {
    state,
    capabilities,
    activeAsset,
    startARSession,
    endARSession,
    isARSupported,
  } = useAR();

  const [showDetails, setShowDetails] = useState(false);

  // Manejar eventos
  useEffect(() => {
    if (state.isActive && !activeAsset) {
      onSessionStart?.();
    } else if (!state.isActive && activeAsset) {
      onSessionEnd?.();
    }
  }, [state.isActive, activeAsset, onSessionStart, onSessionEnd]);

  useEffect(() => {
    if (state.error) {
      onError?.(state.error);
    }
  }, [state.error, onError]);

  const handleStartAR = async () => {
    if (!asset) return;

    const success = await startARSession(asset);
    if (!success && state.error) {
      console.error("Failed to start AR:", state.error);
    }
  };

  const handleEndAR = () => {
    endARSession();
  };

  if (!isARSupported) {
    return (
      <div
        className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}
      >
        <div className="flex items-center space-x-2 text-yellow-700">
          <span>⚠️</span>
          <span className="font-medium">AR no disponible</span>
        </div>
        <p className="text-yellow-600 text-sm mt-1">
          Tu dispositivo o navegador no soporta Realidad Aumentada
        </p>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-yellow-600 text-sm underline mt-2"
        >
          {showDetails ? "Ocultar" : "Ver"} detalles técnicos
        </button>

        {showDetails && capabilities && (
          <div className="mt-3 p-3 bg-yellow-100 rounded text-xs text-yellow-800">
            <div>WebXR: {capabilities.webxr ? "✅" : "❌"}</div>
            <div>Model Viewer: {capabilities.modelViewer ? "✅" : "❌"}</div>
            <div>Cámara: {capabilities.camera ? "✅" : "❌"}</div>
            <div>
              World Tracking: {capabilities.worldTracking ? "✅" : "❌"}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`ar-client ${className}`}>
      {/* Estado de carga */}
      {state.isLoading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-700">Iniciando AR...</span>
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <span>❌</span>
            <span className="font-medium">Error AR</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{state.error}</p>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-red-600 text-sm underline mt-2"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Sesión activa */}
      {state.isActive && activeAsset && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-green-700">
              <span>📱</span>
              <span className="font-medium">Sesión AR activa</span>
            </div>

            <button
              onClick={handleEndAR}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
            >
              Finalizar AR
            </button>
          </div>

          <div className="text-green-600 text-sm mt-1">
            Modelo: {activeAsset.name}
          </div>

          {state.sessionId && (
            <div className="text-green-500 text-xs mt-1 font-mono">
              ID: {state.sessionId.slice(-8)}
            </div>
          )}
        </div>
      )}

      {/* Controles AR cuando no está activo */}
      {!state.isActive &&
        !state.isLoading &&
        asset &&
        asset.type === "model3d" && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{asset.name}</div>
                <div className="text-gray-600 text-sm">Listo para AR</div>
              </div>

              <button
                onClick={handleStartAR}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>📱</span>
                <span>Iniciar AR</span>
              </button>
            </div>
          </div>
        )}

      {/* Información de capacidades (modo desarrollo) */}
      {process.env.NODE_ENV === "development" && capabilities && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600">
            Debug: Capacidades AR
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800">
            <pre>{JSON.stringify(capabilities, null, 2)}</pre>
          </div>
        </details>
      )}

      {/* Contenido personalizado */}
      {children}
    </div>
  );
}

/**
 * Hook para controlar una sesión AR específica
 */
export function useARSession(asset?: ARAsset) {
  const {
    state,
    activeAsset,
    startARSession,
    endARSession,
    updateSession,
    isARSupported,
  } = useAR();

  const isThisAssetActive = activeAsset?.id === asset?.id;

  const start = useCallback(async () => {
    if (!asset) return false;
    return await startARSession(asset);
  }, [asset, startARSession]);

  const end = useCallback(() => {
    if (isThisAssetActive) {
      endARSession();
    }
  }, [isThisAssetActive, endARSession]);

  const update = useCallback(
    (updates: Partial<ARState>) => {
      if (isThisAssetActive) {
        updateSession(updates);
      }
    },
    [isThisAssetActive, updateSession]
  );

  return {
    isActive: isThisAssetActive && state.isActive,
    isLoading: state.isLoading,
    error: state.error,
    sessionId: state.sessionId,
    isSupported: isARSupported,
    canStart: !!asset && asset.type === "model3d" && isARSupported,
    start,
    end,
    update,
  };
}
