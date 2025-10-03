"use client";

import { logAssetInfo, normalizeAssetUrl } from "@/lib/assets";
import { AssetDto } from "@/types";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getARIcon } from "./ARIcons";

// ========================================
// CONTENT ROUTER SYSTEM
// ========================================

export type ContentKind = "image" | "model3d" | "text" | "unknown";

export interface NormalizedContent {
  kind: ContentKind;
  mime?: string;
  url?: string;
  data?: string;
  ext?: string;
  name: string;
  original: AssetDto;
}

export interface DeviceMotion {
  x: number;
  y: number;
  z: number;
}

// Dynamic imports for specialized renderers
const Model3DRenderer = dynamic(() => import("./renderers/Model3DRenderer"), {
  ssr: false,
  loading: () => <div className="ar-loading">Cargando visor 3D...</div>,
});

const TextRenderer = dynamic(() => import("./renderers/TextRenderer"), {
  ssr: false,
  loading: () => <div className="ar-loading">Cargando contenido...</div>,
});

// Content normalization function
function normalizeContent(asset: AssetDto): NormalizedContent {
  const url = asset.url || "";
  const name = asset.name || "Sin nombre";
  const mime = asset.mimeType || "";
  const ext = url.split(".").pop()?.toLowerCase() || "";

  // Determine content kind based on MIME type and extension
  let kind: ContentKind = "unknown";

  // Image detection
  if (
    mime.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(ext)
  ) {
    kind = "image";
  }
  // 3D Model detection
  else if (
    mime.includes("model/") ||
    mime === "application/octet-stream" ||
    ["glb", "gltf", "obj", "fbx", "dae", "3ds", "ply", "stl"].includes(ext)
  ) {
    kind = "model3d";
  }
  // Text detection
  else if (
    mime.startsWith("text/") ||
    ["txt", "md", "markdown", "html", "htm", "json"].includes(ext)
  ) {
    kind = "text";
  }

  return {
    kind,
    mime,
    url,
    ext,
    name,
    original: asset,
  };
}

interface ARViewerProps {
  asset: AssetDto;
  onTrackEvent: (event: string, data?: string) => void;
}

interface ARCapabilities {
  hasCamera: boolean;
  isSecureContext: boolean;
  canUseAR: boolean;
}

interface CameraPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

interface TouchGestures {
  scale: number;
  rotation: number;
  position: { x: number; y: number };
  isDragging: boolean;
  isScaling: boolean;
  lastTouchDistance: number;
  lastTouchAngle: number;
}

// Simple AR Camera Component
const SimpleARViewer: React.FC<{
  asset: AssetDto;
  assetUrl: string;
  assetName: string;
  onClose: () => void;
  onTrackEvent: (event: string, data?: string) => void;
}> = ({ asset, assetUrl, assetName, onClose, onTrackEvent }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);

  // Estados para gestos táctiles
  const [gestures, setGestures] = useState<TouchGestures>({
    scale: 1,
    rotation: 0,
    position: { x: 0, y: 0 },
    isDragging: false,
    isScaling: false,
    lastTouchDistance: 0,
    lastTouchAngle: 0,
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [hasEntryAnimation, setHasEntryAnimation] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [simpleModelViewerLoaded, setSimpleModelViewerLoaded] = useState(false);

  // Audio context para efectos de sonido
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Inicializar audio context después de la primera interacción del usuario
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener("touchstart", initAudio, { once: true });
    document.addEventListener("click", initAudio, { once: true });

    return () => {
      document.removeEventListener("touchstart", initAudio);
      document.removeEventListener("click", initAudio);
    };
  }, []);

  // Load model-viewer for 3D models in AR
  useEffect(() => {
    if (asset.kind === "model3d" && !simpleModelViewerLoaded) {
      import("@google/model-viewer")
        .then(() => {
          setSimpleModelViewerLoaded(true);
        })
        .catch((error) => {
          console.error("Failed to load model-viewer in AR:", error);
        });
    }
  }, [asset.kind, simpleModelViewerLoaded]);

  // Función para generar tonos de sonido
  const playTone = (
    frequency: number,
    duration: number,
    volume: number = 0.1
  ) => {
    if (!soundEnabled || !audioContext.current) return;

    try {
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.current.currentTime
      );
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        audioContext.current.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.current.currentTime + duration
      );

      oscillator.start(audioContext.current.currentTime);
      oscillator.stop(audioContext.current.currentTime + duration);
    } catch (error) {
      console.warn("Error playing audio:", error);
    }
  };

  // Función para vibración táctil
  const vibrate = (pattern: number | number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || gestures.isDragging || gestures.isScaling) return;

    const interval = setInterval(() => {
      setGestures((prev) => ({
        ...prev,
        rotation: prev.rotation + 1,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [autoRotate, gestures.isDragging, gestures.isScaling]);

  // Entry animation when overlay becomes visible
  useEffect(() => {
    if (overlayVisible && isVideoReady && !hasEntryAnimation) {
      setHasEntryAnimation(true);
      setIsAnimating(true);
      onTrackEvent("entry_animation", assetName);

      setTimeout(() => {
        setIsAnimating(false);
      }, 1500);
    }
  }, [
    overlayVisible,
    isVideoReady,
    hasEntryAnimation,
    assetName,
    onTrackEvent,
  ]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        onTrackEvent("camera_started", assetName);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      let errorMessage = "No se pudo acceder a la cámara.";

      if (err.name === "NotAllowedError") {
        errorMessage =
          "Permiso de cámara denegado. Por favor, permite el acceso y recarga la página.";
      } else if (err.name === "NotFoundError") {
        errorMessage = "No se encontró cámara en el dispositivo.";
      }

      setError(errorMessage);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onTrackEvent("camera_closed", assetName);
    onClose();
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
    onTrackEvent("camera_ready", assetName);
  };

  // Apply dynamic transformations using CSS custom properties
  useEffect(() => {
    if (overlayRef.current) {
      const element = overlayRef.current;
      element.style.setProperty("--gesture-x", `${gestures.position.x}px`);
      element.style.setProperty("--gesture-y", `${gestures.position.y}px`);
      element.style.setProperty("--gesture-scale", `${gestures.scale}`);
      element.style.setProperty(
        "--gesture-rotation",
        `${gestures.rotation}deg`
      );
    }
  }, [
    gestures.position.x,
    gestures.position.y,
    gestures.scale,
    gestures.rotation,
  ]);

  // Funciones para gestos táctiles
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getTouchAngle = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return (
      (Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      ) *
        180) /
      Math.PI
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;

    // Pausar rotación automática cuando el usuario interactúa
    setAutoRotate(false);

    // Retroalimentación táctil y sonora
    vibrate(50); // Vibración corta
    playTone(440, 0.1, 0.05); // Tono suave

    if (touches.length === 1) {
      // Un dedo - arrastrar
      setGestures((prev) => ({
        ...prev,
        isDragging: true,
        position: { x: touches[0].clientX, y: touches[0].clientY },
      }));
      onTrackEvent("touch_start", "drag");
    } else if (touches.length === 2) {
      // Dos dedos - escalar y rotar
      const distance = getTouchDistance(touches);
      const angle = getTouchAngle(touches);
      setGestures((prev) => ({
        ...prev,
        isScaling: true,
        lastTouchDistance: distance,
        lastTouchAngle: angle,
      }));
      playTone(660, 0.1, 0.05); // Tono más alto para pellizco
      onTrackEvent("touch_start", "pinch");
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 1 && gestures.isDragging) {
      // Arrastrar
      const deltaX = touches[0].clientX - gestures.position.x;
      const deltaY = touches[0].clientY - gestures.position.y;

      setGestures((prev) => ({
        ...prev,
        position: { x: prev.position.x + deltaX, y: prev.position.y + deltaY },
      }));
    } else if (touches.length === 2 && gestures.isScaling) {
      // Escalar y rotar
      const distance = getTouchDistance(touches);
      const angle = getTouchAngle(touches);

      if (gestures.lastTouchDistance > 0) {
        const scaleChange = distance / gestures.lastTouchDistance;
        const rotationChange = angle - gestures.lastTouchAngle;

        setGestures((prev) => ({
          ...prev,
          scale: Math.max(0.5, Math.min(3, prev.scale * scaleChange)),
          rotation: prev.rotation + rotationChange,
          lastTouchDistance: distance,
          lastTouchAngle: angle,
        }));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setGestures((prev) => ({
      ...prev,
      isDragging: false,
      isScaling: false,
    }));
    onTrackEvent("touch_end", `scale_${gestures.scale.toFixed(2)}`);
  };

  // Funciones de animación mejoradas
  const triggerAnimation = () => {
    setIsAnimating(true);
    setShowParticles(true);

    // Efectos sonoros espectaculares
    playTone(523, 0.2, 0.1); // Do
    setTimeout(() => playTone(659, 0.2, 0.1), 100); // Mi
    setTimeout(() => playTone(784, 0.3, 0.1), 200); // Sol

    // Vibración en patrón
    vibrate([100, 50, 100, 50, 200]);

    onTrackEvent("animation_triggered", assetName);

    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);

    setTimeout(() => {
      setShowParticles(false);
    }, 2000);
  };

  const resetTransforms = () => {
    setGestures((prev) => ({
      ...prev,
      scale: 1,
      rotation: 0,
      position: { x: 0, y: 0 },
    }));
    setAutoRotate(true); // Reactivar rotación automática

    // Sonido de reset
    playTone(330, 0.15, 0.08);
    vibrate(80);

    onTrackEvent("reset_transforms", assetName);
  };

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);

    // Sonido diferente para activar/desactivar
    if (autoRotate) {
      playTone(400, 0.1, 0.06); // Sonido de pausa
    } else {
      playTone(600, 0.1, 0.06); // Sonido de activación
    }
    vibrate(30);

    onTrackEvent("auto_rotate_toggle", autoRotate ? "disabled" : "enabled");
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);

    if (soundEnabled) {
      // Último sonido antes de desactivar
      playTone(300, 0.2, 0.08);
    }
    vibrate(40);

    onTrackEvent("sound_toggle", soundEnabled ? "disabled" : "enabled");
  };

  return (
    <div className="ar-fullscreen">
      {/* Video de cámara de fondo */}
      {error ? (
        <div className="flex-1 flex items-center justify-center bg-slate-800">
          <div className="text-center text-white">
            <p className="text-xl mb-4">⚠️ Error de Cámara</p>
            <p className="mb-4">{error}</p>
            <button onClick={handleClose} className="ar-btn ar-btn-secondary">
              Volver
            </button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="ar-camera-video"
          onLoadedMetadata={handleVideoReady}
        />
      )}

      {/* Controles superiores */}
      <div className="ar-header ar-header-no-events">
        <div className="ar-header-content ar-header-content-auto">
          <h3 className="ar-title">AR: {assetName}</h3>
          <button onClick={handleClose} className="ar-close-btn">
            ❌ Cerrar
          </button>
        </div>
      </div>

      {/* Overlay de contenido interactivo */}
      {overlayVisible && isVideoReady && !error && (
        <div className="ar-overlay">
          <div
            ref={overlayRef}
            className={`ar-content-wrapper ar-interactive ar-interactive-dynamic ${
              isAnimating ? "ar-bouncing" : ""
            } ${
              gestures.isDragging || gestures.isScaling ? "no-transition" : ""
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={triggerAnimation}
          >
            {asset.kind === "message" ? (
              <div className="ar-message-content">
                <div className="ar-message-bubble">
                  <div className="text-2xl mb-3">💬</div>
                  <p className="text-white text-center font-medium text-lg leading-relaxed">
                    {asset.text || assetName}
                  </p>
                </div>
              </div>
            ) : asset.kind === "model3d" ? (
              <div className="ar-model-overlay">
                {simpleModelViewerLoaded && assetUrl ? (
                  React.createElement("model-viewer", {
                    src: assetUrl,
                    alt: assetName,
                    "camera-controls": true,
                    "auto-rotate": true,
                    ar: true,
                    "ar-modes": "webxr scene-viewer quick-look",
                    "environment-image": "neutral",
                    "shadow-intensity": "1",
                    className: "ar-overlay-model",
                    onLoad: () => {
                      console.log(
                        "AR Model-viewer loaded successfully:",
                        assetName
                      );
                      onTrackEvent("ar_model_loaded", assetName);
                    },
                    onError: (e: any) => {
                      console.error(
                        "AR Model-viewer failed to load:",
                        assetName,
                        e
                      );
                      onTrackEvent("ar_model_error", assetName);
                    },
                  })
                ) : (
                  <div className="ar-model-placeholder">
                    <div className="text-4xl mb-2">🎲</div>
                    <p className="text-white text-center font-medium">
                      {!simpleModelViewerLoaded
                        ? "Inicializando visor 3D..."
                        : !assetUrl
                        ? "URL del modelo no disponible"
                        : "Cargando modelo..."}
                    </p>
                    {process.env.NODE_ENV === "development" && assetUrl && (
                      <p className="text-xs text-white opacity-50 mt-1">
                        AR URL: {assetUrl}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <img
                src={assetUrl}
                alt={assetName}
                className="ar-overlay-image"
                onLoad={() => onTrackEvent("overlay_loaded", assetName)}
                onError={() => onTrackEvent("overlay_error", assetName)}
                draggable={false}
              />
            )}
            <p className="text-white text-center mt-2 font-semibold">
              {assetName}
            </p>

            {/* Efectos de partículas */}
            {showParticles && (
              <div className="ar-particles">
                <div className="ar-particle ar-particle-1">✨</div>
                <div className="ar-particle ar-particle-2">🎆</div>
                <div className="ar-particle ar-particle-3">⭐</div>
                <div className="ar-particle ar-particle-4">🌟</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controles inferiores expandidos */}
      <div className="ar-footer ar-footer-no-events">
        <div className="ar-footer-content ar-footer-content-auto">
          <div className="ar-controls-grid">
            <button
              onClick={() => {
                setOverlayVisible(!overlayVisible);
                playTone(500, 0.1, 0.05);
                vibrate(30);
                onTrackEvent(
                  "overlay_toggle",
                  overlayVisible ? "hide" : "show"
                );
              }}
              className="ar-toggle-btn"
            >
              {overlayVisible ? "👁️ Ocultar" : "👁️‍🗨️ Mostrar"}
            </button>

            <button
              onClick={triggerAnimation}
              className="ar-toggle-btn ar-fun-btn"
            >
              ✨ Animar
            </button>

            <button
              onClick={toggleAutoRotate}
              className={`ar-toggle-btn ${
                autoRotate ? "ar-active-btn" : "ar-inactive-btn"
              }`}
            >
              {autoRotate ? "🌀 Auto" : "⏸️ Manual"}
            </button>

            <button
              onClick={toggleSound}
              className={`ar-toggle-btn ${
                soundEnabled ? "ar-sound-on" : "ar-sound-off"
              }`}
            >
              {soundEnabled ? "🔊 Audio" : "🔇 Mudo"}
            </button>

            <button
              onClick={resetTransforms}
              className="ar-toggle-btn ar-reset-btn"
            >
              🔄 Reset
            </button>
          </div>

          <div className="ar-instructions ar-expanded">
            <div>🤏 Pellizca para escalar</div>
            <div>� Arrastra para mover</div>
            <div>👆👆 Doble toque para animar</div>
            <div>�📱 Mueve el dispositivo para explorar</div>
          </div>

          {/* Indicadores de estado */}
          <div className="ar-status-indicators">
            <div className="ar-status-item">
              <span>Escala: {gestures.scale.toFixed(1)}x</span>
            </div>
            <div className="ar-status-item">
              <span>Rotación: {Math.round(gestures.rotation)}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de carga */}
      {!isVideoReady && !error && (
        <div className="ar-loading-overlay">
          <div className="ar-loading-content">
            <div className="ar-loading-spinner"></div>
            <p>Iniciando cámara...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ARViewer: React.FC<ARViewerProps> = ({ asset, onTrackEvent }) => {
  const [capabilities, setCapabilities] = useState<ARCapabilities>({
    hasCamera: false,
    isSecureContext: false,
    canUseAR: false,
  });

  const [cameraPermission, setCameraPermission] = useState<CameraPermission>({
    granted: false,
    denied: false,
    prompt: true,
  });

  const [isChecking, setIsChecking] = useState(true);
  const [showAR, setShowAR] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);

  const assetUrl = React.useMemo(() => {
    logAssetInfo(asset, "ARViewer");
    const normalizedUrl = normalizeAssetUrl(asset);

    if (!normalizedUrl) {
      console.warn("No se pudo normalizar URL para asset:", asset.name);
      return "";
    }

    console.log("URL final para", asset.name, ":", normalizedUrl);
    return normalizedUrl;
  }, [asset]);
  useEffect(() => {
    const checkCapabilities = async () => {
      try {
        const isSecure =
          window.isSecureContext ||
          location.protocol === "https:" ||
          location.hostname === "localhost";
        const hasCamera = !!(
          navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        );

        const caps = {
          hasCamera,
          isSecureContext: isSecure,
          canUseAR: hasCamera && isSecure,
        };

        setCapabilities(caps);

        // Check camera permission if available
        if (hasCamera && "permissions" in navigator) {
          try {
            const permission = await navigator.permissions.query({
              name: "camera" as PermissionName,
            });
            setCameraPermission({
              granted: permission.state === "granted",
              denied: permission.state === "denied",
              prompt: permission.state === "prompt",
            });
          } catch (e) {
            setCameraPermission({
              granted: false,
              denied: false,
              prompt: true,
            });
          }
        }
      } catch (error) {
        console.warn("Error checking AR capabilities:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkCapabilities();
  }, []);

  // Load model-viewer for 3D models
  useEffect(() => {
    if (asset.kind === "model3d" && !modelViewerLoaded) {
      console.log("Loading model-viewer for 3D asset:", asset.name);
      import("@google/model-viewer")
        .then(() => {
          console.log("Model-viewer library loaded successfully");
          setModelViewerLoaded(true);
        })
        .catch((error) => {
          console.error("Failed to load model-viewer:", error);
        });
    }
  }, [asset.kind, modelViewerLoaded, asset.name]);

  const handleStartAR = useCallback(() => {
    if (!userInteracted) {
      setUserInteracted(true);
    }

    onTrackEvent("ar_start_attempt", asset.id);

    if (
      asset.kind === "image" ||
      asset.kind === "video" ||
      asset.kind === "message" ||
      asset.kind === "model3d"
    ) {
      setShowAR(true);
    }
  }, [asset, onTrackEvent, userInteracted]);

  const handleStopAR = useCallback(() => {
    setShowAR(false);
    onTrackEvent("ar_stop", asset.id);
  }, [asset.id, onTrackEvent]);

  const renderPreview = () => {
    switch (asset.kind) {
      case "image":
        return (
          <img
            src={assetUrl}
            alt={asset.name}
            className="w-full h-full object-cover rounded-lg"
            onLoad={() => console.log("Image loaded successfully")}
            onError={(e) => console.error("Image failed to load:", e)}
          />
        );

      case "video":
        return (
          <video
            src={assetUrl}
            controls
            muted
            loop
            className="w-full h-full object-cover rounded-lg"
            onLoadedData={() => console.log("Video loaded successfully")}
            onError={(e) => console.error("Video failed to load:", e)}
          />
        );

      case "model3d":
        console.log("Rendering 3D model:", {
          assetName: asset.name,
          assetUrl,
          rawUrl: asset.url,
          mimeType: asset.mimeType,
          modelViewerLoaded,
        });

        return (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden">
            {modelViewerLoaded && assetUrl ? (
              React.createElement("model-viewer", {
                src: assetUrl,
                alt: asset.name,
                "camera-controls": true,
                "auto-rotate": true,
                ar: true,
                "ar-modes": "webxr scene-viewer quick-look",
                "environment-image": "neutral",
                "shadow-intensity": "1",
                className: "w-full h-full ar-model-viewer",
                onLoad: () => {
                  console.log("Model-viewer loaded successfully:", asset.name);
                },
                onError: (e: any) => {
                  console.error("Model-viewer failed to load:", asset.name, e);
                },
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">🎲</div>
                  <p className="text-sm opacity-75">
                    {!modelViewerLoaded
                      ? "Inicializando visor 3D..."
                      : !assetUrl
                      ? "URL del modelo no disponible"
                      : "Cargando modelo 3D..."}
                  </p>
                  <p className="text-xs opacity-50 mt-1">{asset.name}</p>
                  {process.env.NODE_ENV === "development" && (
                    <p className="text-xs opacity-30 mt-1">
                      URL: {assetUrl || "No URL"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "message":
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-800 to-purple-900 rounded-lg flex items-center justify-center p-6">
            <div className="text-center text-white max-w-md">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-sm opacity-75 mb-3">Mensaje de Texto</p>
              {asset.text && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-sm">
                  <p className="whitespace-pre-wrap">{asset.text}</p>
                </div>
              )}
              <p className="text-xs opacity-50 mt-2">{asset.name}</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
            <p className="text-white text-sm">Contenido no soportado</p>
          </div>
        );
    }
  };

  const renderARButton = () => {
    if (isChecking) {
      return (
        <button disabled className="ar-btn ar-btn-disabled">
          <span className="ar-btn-icon">⏳</span>
          Verificando...
        </button>
      );
    }

    if (!capabilities.canUseAR) {
      return (
        <div className="ar-error">
          <p className="text-sm text-red-300 mb-2">
            {!capabilities.isSecureContext
              ? "🔒 Se requiere HTTPS para AR"
              : !capabilities.hasCamera
              ? "📹 Cámara no disponible"
              : "❌ AR no soportado"}
          </p>
          <button disabled className="ar-btn ar-btn-disabled">
            AR No Disponible
          </button>
        </div>
      );
    }

    if (cameraPermission.denied) {
      return (
        <div className="ar-error">
          <p className="text-sm text-red-300 mb-2">
            🚫 Permiso de cámara denegado
          </p>
          <button
            onClick={() => window.location.reload()}
            className="ar-btn ar-btn-secondary"
          >
            🔄 Recargar página
          </button>
        </div>
      );
    }

    const getButtonConfig = () => {
      switch (asset.kind) {
        case "model3d":
          return {
            icon: "⚡", // Modern 3D/AR icon
            text: "Ver en AR 3D",
            className: "ar-btn-primary",
          };
        case "image":
          return {
            icon: "�", // Modern image/photo icon
            text: "Ver en AR",
            className: "ar-btn-purple",
          };
        case "video":
          return {
            icon: "▶", // Modern play/video icon
            text: "Ver Video AR",
            className: "ar-btn-green",
          };
        case "message":
          return {
            icon: "�", // Modern message bubble icon
            text: "Ver Mensaje AR",
            className: "ar-btn-blue",
          };
        default:
          return null;
      }
    };

    const buttonConfig = getButtonConfig();
    if (!buttonConfig) return null;

    return (
      <button
        onClick={handleStartAR}
        className={`ar-btn ${buttonConfig.className}`}
        aria-label={`Iniciar experiencia AR para ${asset.name}`}
      >
        <span className="ar-btn-icon">{buttonConfig.icon}</span>
        {buttonConfig.text}
      </button>
    );
  };

  if (
    showAR &&
    (asset.kind === "image" ||
      asset.kind === "video" ||
      asset.kind === "message" ||
      asset.kind === "model3d")
  ) {
    return (
      <SimpleARViewer
        asset={asset}
        assetUrl={assetUrl}
        assetName={asset.name}
        onClose={handleStopAR}
        onTrackEvent={onTrackEvent}
      />
    );
  }

  return (
    <div className="ar-container">
      <div className="ar-preview">{renderPreview()}</div>

      <div className="ar-controls">{renderARButton()}</div>
    </div>
  );
};

export default ARViewer;
