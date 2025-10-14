/**
 * ✨ QUICK AR - EXPERIENCIA AR PROFESIONAL ✨
 *
 * Implementación completa de los conceptos del prompt:
 * - Interfaz minimalista y futurista
 * - Modos "marker" y "viewer" con detección automática
 * - Transiciones suaves y carga progresiva
 * - HUD profesional con controles mínimos
 * - Coherencia visual con el resto de la aplicación
 * - Rendimiento optimizado para móviles y escritorio
 */

"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Asset, Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// 🎯 Tipos de Experiencia AR
type ARMode = "viewer" | "marker";
type LoadingState = "loading" | "ready" | "error" | "permissions";

interface ARExperienceState {
  mode: ARMode;
  isActive: boolean;
  loadingState: LoadingState;
  hasError: boolean;
  errorMessage: string;
  progress: number; // 0-100 para carga progresiva
}

interface DeviceCapabilities {
  hasCamera: boolean;
  hasWebXR: boolean;
  isSecureContext: boolean;
  isMobile: boolean;
  supportsAR: boolean;
}

interface ARInteractionState {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  isDragging: boolean;
  isScaling: boolean;
  lastTouchDistance: number;
}

// 🎨 Sistema de Assets Preloader
interface AssetLoader {
  loaded: Map<string, any>;
  loading: Set<string>;
  failed: Set<string>;
}

export default function ARExperience() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;

  // 📱 Estados Principales
  const [experience, setExperience] = useState<Experience | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

  // 🎯 Asset Loader para carga progresiva
  const [assetLoader] = useState<AssetLoader>({
    loaded: new Map(),
    loading: new Set(),
    failed: new Set(),
  });

  // 🚀 Estado AR Mejorado
  const [arState, setArState] = useState<ARExperienceState>({
    mode: "viewer", // Detección automática más adelante
    isActive: false,
    loadingState: "loading",
    hasError: false,
    errorMessage: "",
    progress: 0,
  });

  // 🔧 Capacidades del Dispositivo
  const [deviceCapabilities, setDeviceCapabilities] =
    useState<DeviceCapabilities>({
      hasCamera: false,
      hasWebXR: false,
      isSecureContext: false,
      isMobile: false,
      supportsAR: false,
    });

  // ✋ Estado de Interacción AR
  const [arInteraction, setArInteraction] = useState<ARInteractionState>({
    position: { x: 0.5, y: 0.5 },
    scale: 1.0,
    rotation: 0,
    isDragging: false,
    isScaling: false,
    lastTouchDistance: 0,
  });

  // 🎥 Referencias Técnicas
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // 🔍 Detección Avanzada de Capacidades AR
  const checkARCapabilities = useCallback(async () => {
    const isSecure =
      window.isSecureContext || location.hostname === "localhost";
    const hasMediaDevices = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // 🌐 Verificar soporte WebXR
    let hasWebXR = false;
    if ("xr" in navigator) {
      try {
        const xr = (navigator as any).xr;
        if (xr && typeof xr.isSessionSupported === "function") {
          hasWebXR = await xr.isSessionSupported("immersive-ar");
        }
      } catch (error) {
        console.log("WebXR no disponible:", error);
      }
    }

    const supportsAR = isSecure && (hasWebXR || hasMediaDevices);

    setDeviceCapabilities({
      hasCamera: isSecure && hasMediaDevices,
      hasWebXR,
      isSecureContext: isSecure,
      isMobile,
      supportsAR,
    });

    console.log("🔧 Capacidades AR detectadas:", {
      hasCamera: isSecure && hasMediaDevices,
      hasWebXR,
      isSecureContext: isSecure,
      isMobile,
      supportsAR,
    });
  }, []);

  // 🚀 Inicialización de Capacidades
  useEffect(() => {
    checkARCapabilities();
  }, [checkARCapabilities]);

  // 🎯 Carga Progresiva de Experiencia con Detección de Modo AR
  const loadExperienceData = useCallback(async () => {
    if (!experienceId) {
      setArState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage: "ID de experiencia no válido",
        loadingState: "error",
      }));
      return;
    }

    try {
      console.log("� Cargando experiencia AR:", experienceId);

      // Fase 1: Cargar datos básicos
      setArState((prev) => ({
        ...prev,
        loadingState: "loading",
        progress: 10,
      }));

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
      } catch (networkError) {
        throw new Error(
          "Error de conexión. Verifica que el API esté disponible."
        );
      }

      if (!response?.success || !response.data) {
        throw new Error("Experiencia no encontrada");
      }

      // Fase 2: Normalizar y detectar tipo AR
      setArState((prev) => ({ ...prev, progress: 30 }));

      const normalizedExperience = normalizeExperience(response.data);
      setExperience(normalizedExperience);

      // 🧠 Detección Inteligente del Modo AR
      const arMode = detectARMode(normalizedExperience);
      console.log(`🎯 Modo AR detectado: ${arMode}`);

      // Fase 3: Precargar assets críticos
      setArState((prev) => ({ ...prev, progress: 50, mode: arMode }));
      await preloadCriticalAssets(normalizedExperience.assets);

      // Fase 4: Listo para AR
      setArState((prev) => ({
        ...prev,
        loadingState: "ready",
        progress: 100,
        hasError: false,
      }));

      console.log("✅ Experiencia AR lista:", normalizedExperience.title);
    } catch (error: any) {
      console.error("❌ Error cargando experiencia:", error);
      setArState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage: error.message || "Error desconocido",
        loadingState: "error",
        progress: 0,
      }));
    }
  }, [experienceId]);

  // 🧠 Detectar Modo AR Automáticamente
  const detectARMode = useCallback((exp: Experience): ARMode => {
    // Lógica de detección basada en los assets y metadatos
    const hasMarkerAssets = exp.assets.some(
      (asset) =>
        asset.name.toLowerCase().includes("marker") ||
        asset.name.toLowerCase().includes("target") ||
        (asset.assetType === "image" && asset.name.toLowerCase().includes("qr"))
    );

    // Si hay muchos assets o son 3D, probablemente sea viewer mode
    const hasComplexAssets =
      exp.assets.some(
        (asset) => asset.assetType === "model3d" || asset.assetType === "video"
      ) || exp.assets.length > 2;

    if (hasMarkerAssets && !hasComplexAssets) {
      return "marker";
    }

    return "viewer"; // Default para experiencias libres
  }, []);

  // 📦 Precargar Assets Críticos
  const preloadCriticalAssets = useCallback(
    async (assets: Asset[]) => {
      const imageAssets = assets.filter(
        (asset) => asset.assetType === "image" && asset.assetUrl
      );

      const promises = imageAssets.map(async (asset) => {
        if (!asset.assetUrl || assetLoader.loaded.has(asset.id)) return;

        assetLoader.loading.add(asset.id);

        try {
          const img = new Image();
          img.crossOrigin = "anonymous";

          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              assetLoader.loaded.set(asset.id, img);
              assetLoader.loading.delete(asset.id);
              resolve();
            };
            img.onerror = () => {
              assetLoader.failed.add(asset.id);
              assetLoader.loading.delete(asset.id);
              reject(new Error(`Failed to load ${asset.name}`));
            };
            img.src = asset.assetUrl!;
          });

          console.log(`✅ Asset precargado: ${asset.name}`);
        } catch (error) {
          console.warn(`⚠️ No se pudo precargar: ${asset.name}`, error);
        }
      });

      await Promise.allSettled(promises);
    },
    [assetLoader]
  );

  // Ejecutar carga
  useEffect(() => {
    loadExperienceData();
  }, [loadExperienceData]);

  // 🎬 Renderizado AR Automático y Suave
  useEffect(() => {
    if (arState.isActive && canvasRef.current) {
      console.log("🚀 Iniciando renderizado AR...");
      startARRenderingLoop();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [arState.isActive]);

  // 🎯 Modo de Prueba Sin Cámara (Profesional)
  const startARPreview = useCallback(() => {
    console.log("🎭 Iniciando vista previa AR...");
    setArState((prev) => ({
      ...prev,
      isActive: true,
      loadingState: "ready",
    }));
  }, []);

  // 📱 Inicio de AR con Cámara Profesional
  const startARCamera = useCallback(async () => {
    if (!deviceCapabilities.supportsAR) {
      setArState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage: "AR no está disponible en este dispositivo",
        loadingState: "error",
      }));
      return;
    }

    try {
      setArState((prev) => ({ ...prev, loadingState: "permissions" }));
      console.log("📹 Solicitando acceso a cámara...");

      // Configuración optimizada para AR
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: deviceCapabilities.isMobile
            ? { ideal: "environment" }
            : "user",
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);

      // Transición suave a modo activo
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setArState((prev) => ({
          ...prev,
          isActive: true,
          loadingState: "ready",
        }));

        console.log("✅ Cámara AR iniciada exitosamente");
      }
    } catch (error: any) {
      console.error("❌ Error de cámara:", error);

      const errorMessages: Record<string, string> = {
        NotAllowedError:
          "📷 Permisos de cámara denegados.\nPor favor permite el acceso y recarga.",
        NotFoundError: "📷 No se encontró cámara disponible.",
        NotSupportedError: "📱 Tu navegador no soporta cámara AR.",
        NotReadableError: "📷 Cámara ocupada por otra aplicación.",
      };

      setArState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage:
          errorMessages[error.name] || `Error de cámara: ${error.message}`,
        loadingState: "error",
      }));
    }
  }, [deviceCapabilities]);

  // ✋ Sistema de Interacción AR Profesional y Suave
  const getTouchDistance = useCallback((touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getRelativePosition = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0.5, y: 0.5 };

      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      return { x, y };
    },
    []
  );

  // ✋ Manejadores de Eventos Táctiles Profesionales
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const pos = getRelativePosition(touch.clientX, touch.clientY);
      
      setArInteraction(prev => ({
        ...prev,
        isDragging: true,
        isScaling: false,
        position: pos,
      }));
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setArInteraction(prev => ({
        ...prev,
        isScaling: true,
        isDragging: false,
        lastTouchDistance: distance,
      }));
    }
  }, [getRelativePosition, getTouchDistance]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    if (arInteraction.isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const pos = getRelativePosition(touch.clientX, touch.clientY);
      setArInteraction(prev => ({ ...prev, position: pos }));
    } else if (arInteraction.isScaling && e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      if (arInteraction.lastTouchDistance > 0) {
        const scaleFactor = distance / arInteraction.lastTouchDistance;
        const newScale = Math.max(0.3, Math.min(3.0, arInteraction.scale * scaleFactor));
        setArInteraction(prev => ({
          ...prev,
          scale: newScale,
          lastTouchDistance: distance,
        }));
      }
    }
  }, [arInteraction, getRelativePosition, getTouchDistance]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setArInteraction(prev => ({
      ...prev,
      isDragging: false,
      isScaling: false,
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getRelativePosition(e.clientX, e.clientY);
    setArInteraction(prev => ({
      ...prev,
      isDragging: true,
      position: pos,
    }));
  }, [getRelativePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (arInteraction.isDragging) {
      e.preventDefault();
      const pos = getRelativePosition(e.clientX, e.clientY);
      setArInteraction(prev => ({ ...prev, position: pos }));
    }
  }, [arInteraction.isDragging, getRelativePosition]);

  const handleMouseUp = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setArInteraction(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3.0, arInteraction.scale * scaleFactor));
    setArInteraction(prev => ({ ...prev, scale: newScale }));
  }, [arInteraction.scale]);

  // 🎬 Sistema de Renderizado AR Profesional
  const startARRenderingLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) {
      console.warn("❌ Canvas no disponible para renderizado AR");
      return;
    }

    console.log("🎨 Iniciando bucle de renderizado AR...");

    const renderFrame = (timestamp: number) => {
      if (!arState.isActive) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        return;
      }

      // Ajuste dinámico de resolución
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;

      ctx.scale(pixelRatio, pixelRatio);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      // Limpiar con degradado sutil para mejor calidad visual
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Renderizar contenido AR
      if (experience?.assets?.length) {
        renderARContent(ctx, rect.width, rect.height, timestamp);
      }

      // HUD minimalista
      renderARInterface(ctx, rect.width, rect.height);

      // Continuar bucle
      animationRef.current = requestAnimationFrame(renderFrame);
    };

    animationRef.current = requestAnimationFrame(renderFrame);
  }, [arState.isActive, experience]);

  // 🎯 Renderizado de Contenido AR Optimizado
  const renderARContent = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      timestamp: number
    ) => {
      if (!experience?.assets?.length) return;

      const currentAsset = experience.assets[currentAssetIndex];
      if (!currentAsset) return;

      // Posición con suavizado
      const centerX = width * arInteraction.position.x;
      const centerY = height * arInteraction.position.y;
      const scale = arInteraction.scale;
      const rotation = arInteraction.rotation + timestamp * 0.001; // Rotación suave

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Renderizar según tipo de asset
      switch (currentAsset.assetType) {
        case "message":
          renderMessageAsset(ctx, currentAsset);
          break;
        case "image":
          renderImageAsset(ctx, currentAsset);
          break;
        case "video":
          renderVideoAsset(ctx, currentAsset);
          break;
        case "model3d":
          render3DAsset(ctx, currentAsset);
          break;
        case "webcontent":
          renderWebContentAsset(ctx, currentAsset);
          break;
      }

      ctx.restore();

      // Efectos de interacción
      if (arInteraction.isDragging || arInteraction.isScaling) {
        renderInteractionFeedback(ctx, centerX, centerY, scale);
      }
    },
    [experience, currentAssetIndex, arInteraction]
  );

  // 🎨 HUD Minimalista y Profesional
  const renderARInterface = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Solo mostrar cruz central sutil
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(centerX - 15, centerY);
      ctx.lineTo(centerX + 15, centerY);
      ctx.moveTo(centerX, centerY - 15);
      ctx.lineTo(centerX, centerY + 15);
      ctx.stroke();

      ctx.restore();

      // Indicadores de esquina para AR tracking
      const cornerSize = 20;
      const margin = 15;

      ctx.save();
      ctx.strokeStyle = "rgba(0, 200, 255, 0.4)";
      ctx.lineWidth = 2;

      // Esquinas del frame AR
      const corners = [
        [margin, margin], // top-left
        [width - margin, margin], // top-right
        [margin, height - margin], // bottom-left
        [width - margin, height - margin], // bottom-right
      ];

      corners.forEach(([x, y], index) => {
        ctx.beginPath();
        if (index === 0) {
          // top-left
          ctx.moveTo(x, y + cornerSize);
          ctx.lineTo(x, y);
          ctx.lineTo(x + cornerSize, y);
        } else if (index === 1) {
          // top-right
          ctx.moveTo(x - cornerSize, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y + cornerSize);
        } else if (index === 2) {
          // bottom-left
          ctx.moveTo(x, y - cornerSize);
          ctx.lineTo(x, y);
          ctx.lineTo(x + cornerSize, y);
        } else {
          // bottom-right
          ctx.moveTo(x - cornerSize, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y - cornerSize);
        }
        ctx.stroke();
      });

      ctx.restore();
    },
    []
  );

  // 🎨 Funciones de Renderizado AR Profesionales
  const renderMessageAsset = useCallback(
    (ctx: CanvasRenderingContext2D, asset: Asset) => {
      const text = asset.assetContent || asset.name || "Mensaje AR";
      const maxWidth = 300;
      const padding = 20;

      ctx.save();

      // Fondo con gradiente suave y moderno
      const gradient = ctx.createLinearGradient(
        -maxWidth / 2,
        -50,
        maxWidth / 2,
        50
      );
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.95)"); // Blue-500
      gradient.addColorStop(1, "rgba(147, 51, 234, 0.95)"); // Purple-600

      // Sombra sutil
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowOffsetY = 8;
      ctx.shadowBlur = 24;

      ctx.fillStyle = gradient;
      ctx.roundRect(-maxWidth / 2, -50, maxWidth, 100, 16);
      ctx.fill();

      // Reset sombra
      ctx.shadowColor = "transparent";

      // Border elegante
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.roundRect(-maxWidth / 2, -50, maxWidth, 100, 16);
      ctx.stroke();

      // Texto con tipografía moderna
      ctx.fillStyle = "white";
      ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Texto con mejor renderizado
      const lines = wrapText(ctx, text, maxWidth - padding * 2);
      const lineHeight = 24;
      const startY = (-(lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, 0, startY + index * lineHeight);
      });

      ctx.restore();
    },
    []
  );

  const renderImageAsset = useCallback(
    (ctx: CanvasRenderingContext2D, asset: Asset) => {
      const img = assetLoader.loaded.get(asset.id);
      const size = 150;

      ctx.save();

      if (img && img instanceof HTMLImageElement) {
        // Calcular aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;

        if (aspectRatio > 1) {
          drawHeight = size / aspectRatio;
        } else {
          drawWidth = size * aspectRatio;
        }

        // Sombra moderna
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowOffsetY = 12;
        ctx.shadowBlur = 24;

        // Dibujar imagen con bordes redondeados
        ctx.beginPath();
        ctx.roundRect(
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight,
          12
        );
        ctx.clip();
        ctx.drawImage(
          img,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );
      } else {
        // Placeholder elegante
        ctx.fillStyle = "rgba(107, 114, 128, 0.8)"; // Gray-500
        ctx.roundRect(-size / 2, -size / 2, size, size, 12);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "14px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🖼️ Cargando...", 0, 0);
      }

      ctx.restore();
    },
    [assetLoader]
  );

  const renderVideoAsset = useCallback(
    (ctx: CanvasRenderingContext2D, asset: Asset) => {
      const size = 150;

      ctx.save();

      // Fondo de video elegante
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
      gradient.addColorStop(0, "rgba(17, 24, 39, 0.95)"); // Gray-900
      gradient.addColorStop(1, "rgba(55, 65, 81, 0.95)"); // Gray-700

      ctx.fillStyle = gradient;
      ctx.roundRect(-size / 2, -size / 2, size, size, 16);
      ctx.fill();

      // Botón play moderno
      ctx.fillStyle = "rgba(239, 68, 68, 0.9)"; // Red-500
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();

      // Icono play
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.moveTo(-8, -12);
      ctx.lineTo(-8, 12);
      ctx.lineTo(12, 0);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("VIDEO", 0, size / 2 - 15);

      ctx.restore();
    },
    []
  );

  const render3DAsset = useCallback(
    (ctx: CanvasRenderingContext2D, asset: Asset) => {
      const size = 150;

      ctx.save();

      // Fondo 3D futurista
      const gradient = ctx.createLinearGradient(
        -size / 2,
        -size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, "rgba(99, 102, 241, 0.9)"); // Indigo-500
      gradient.addColorStop(1, "rgba(139, 92, 246, 0.9)"); // Violet-500

      ctx.fillStyle = gradient;
      ctx.roundRect(-size / 2, -size / 2, size, size, 16);
      ctx.fill();

      // Cubo 3D isométrico moderno
      const cubeSize = 40;
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 2;

      // Cara frontal
      ctx.fillRect(-cubeSize / 2, -cubeSize / 2, cubeSize, cubeSize);
      ctx.strokeRect(-cubeSize / 2, -cubeSize / 2, cubeSize, cubeSize);

      // Cara superior (isométrica)
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.moveTo(-cubeSize / 2, -cubeSize / 2);
      ctx.lineTo(-cubeSize / 4, -cubeSize * 0.75);
      ctx.lineTo(cubeSize * 0.75, -cubeSize * 0.75);
      ctx.lineTo(cubeSize / 2, -cubeSize / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cara lateral
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.moveTo(cubeSize / 2, -cubeSize / 2);
      ctx.lineTo(cubeSize * 0.75, -cubeSize * 0.75);
      ctx.lineTo(cubeSize * 0.75, cubeSize * 0.25);
      ctx.lineTo(cubeSize / 2, cubeSize / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("MODELO 3D", 0, size / 2 - 15);

      ctx.restore();
    },
    []
  );

  const renderWebContentAsset = useCallback(
    (ctx: CanvasRenderingContext2D, asset: Asset) => {
      const size = 150;

      ctx.save();

      // Fondo web moderno
      const gradient = ctx.createLinearGradient(
        -size / 2,
        -size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.9)"); // Emerald-500
      gradient.addColorStop(1, "rgba(6, 182, 212, 0.9)"); // Cyan-500

      ctx.fillStyle = gradient;
      ctx.roundRect(-size / 2, -size / 2, size, size, 16);
      ctx.fill();

      // Ventana de navegador
      const browserWidth = size * 0.7;
      const browserHeight = size * 0.5;

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.roundRect(
        -browserWidth / 2,
        -browserHeight / 2,
        browserWidth,
        browserHeight,
        8
      );
      ctx.fill();

      // Barra de navegador
      ctx.fillStyle = "rgba(107, 114, 128, 0.1)";
      ctx.roundRect(
        -browserWidth / 2,
        -browserHeight / 2,
        browserWidth,
        browserHeight * 0.25,
        8
      );
      ctx.fill();

      // Puntos del navegador
      [
        -browserWidth * 0.35,
        -browserWidth * 0.25,
        -browserWidth * 0.15,
      ].forEach((x, index) => {
        const colors = [
          "rgba(239, 68, 68, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(34, 197, 94, 0.8)",
        ];
        ctx.fillStyle = colors[index];
        ctx.beginPath();
        ctx.arc(x, -browserHeight * 0.3, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Líneas de contenido
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(107, 114, 128, ${0.3 + i * 0.1})`;
        const lineWidth = browserWidth * (0.6 - i * 0.1);
        ctx.fillRect(
          -lineWidth / 2,
          -browserHeight * 0.1 + i * 8,
          lineWidth,
          3
        );
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("WEB CONTENT", 0, size / 2 - 12);

      ctx.restore();
    },
    []
  );

  // Feedback visual para interacciones
  const renderInteractionFeedback = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);

      // Anillo de interacción pulsante
      const time = Date.now() * 0.003;
      const radius = 60 * scale + Math.sin(time * 2) * 10;

      ctx.strokeStyle = `rgba(34, 197, 94, ${0.6 + Math.sin(time * 3) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  // Helper para texto envuelto
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const drawImageAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    // Create image element if not exists
    const imageKey = `image_${asset.id}`;
    if (!(window as any)[imageKey] && asset.assetUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        (window as any)[imageKey] = img;
      };
      img.onerror = () => {
        console.error("Failed to load image:", asset.assetUrl);
        (window as any)[imageKey] = null;
      };
      img.src = asset.assetUrl;
    }

    const img = (window as any)[imageKey];
    if (img && img.complete) {
      // Draw the image
      const aspectRatio = img.width / img.height;
      let drawWidth = size;
      let drawHeight = size;

      if (aspectRatio > 1) {
        drawHeight = size / aspectRatio;
      } else {
        drawWidth = size * aspectRatio;
      }

      ctx.drawImage(
        img,
        x - drawWidth / 2,
        y - drawHeight / 2,
        drawWidth,
        drawHeight
      );

      // Add border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        x - drawWidth / 2,
        y - drawHeight / 2,
        drawWidth,
        drawHeight
      );
    } else {
      // Loading placeholder
      ctx.fillStyle = "rgba(100, 100, 100, 0.8)";
      ctx.fillRect(x - size / 2, y - size / 2, size, size);

      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Cargando imagen...", x, y);
    }
  };

  const drawVideoAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    // Video placeholder with play button
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);

    // Play button
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.moveTo(x - size / 6, y - size / 4);
    ctx.lineTo(x - size / 6, y + size / 4);
    ctx.lineTo(x + size / 4, y);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("VIDEO", x, y + size / 2 - 10);
  };

  const drawModel3DAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    // 3D model placeholder with cube icon
    ctx.fillStyle = "rgba(50, 50, 150, 0.8)";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);

    // 3D cube icon
    const cubeSize = size / 3;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    // Front face
    ctx.strokeRect(x - cubeSize / 2, y - cubeSize / 2, cubeSize, cubeSize);

    // Back face (offset)
    const offset = cubeSize / 4;
    ctx.strokeRect(
      x - cubeSize / 2 + offset,
      y - cubeSize / 2 - offset,
      cubeSize,
      cubeSize
    );

    // Connecting lines
    ctx.beginPath();
    ctx.moveTo(x - cubeSize / 2, y - cubeSize / 2);
    ctx.lineTo(x - cubeSize / 2 + offset, y - cubeSize / 2 - offset);
    ctx.moveTo(x + cubeSize / 2, y - cubeSize / 2);
    ctx.lineTo(x + cubeSize / 2 + offset, y - cubeSize / 2 - offset);
    ctx.moveTo(x + cubeSize / 2, y + cubeSize / 2);
    ctx.lineTo(x + cubeSize / 2 + offset, y + cubeSize / 2 - offset);
    ctx.stroke();

    // Label
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("MODELO 3D", x, y + size / 2 - 8);
  };

  const drawWebContentAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    // Web content placeholder with browser icon
    ctx.fillStyle = "rgba(100, 150, 200, 0.8)";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);

    // Browser icon (simplified)
    ctx.fillStyle = "white";
    ctx.fillRect(x - size / 3, y - size / 3, size / 1.5, size / 4);

    // Address bar
    ctx.strokeStyle = "rgba(200, 200, 200, 1)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - size / 4, y - size / 5, size / 2, size / 8);

    // Label
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("WEB CONTENT", x, y + size / 2 - 8);
  };

  // Draw AR content overlay
  const drawARContent = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    console.log("🔧 drawARContent called with:", {
      width,
      height,
      experienceLoaded: !!experience,
      assetsCount: experience?.assets?.length || 0,
      currentAssetIndex,
      hasCanvas: !!ctx,
    });

    if (!experience) {
      console.warn("❌ No experience loaded yet");
      return;
    }

    if (!experience.assets || experience.assets.length === 0) {
      console.warn("❌ No assets in experience");
      // Draw "No Content" message
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Sin contenido AR disponible", width / 2, height / 2);
      ctx.restore();
      return;
    }

    const currentAsset = experience.assets[currentAssetIndex];
    if (!currentAsset) {
      console.warn("❌ No current asset to draw at index:", currentAssetIndex);
      return;
    }

    console.log(
      "🎨 Drawing AR content for asset:",
      currentAsset.name,
      currentAsset.assetType,
      "URL:",
      currentAsset.assetUrl,
      "Content:",
      currentAsset.assetContent
    );

    // Calculate position based on relative coordinates
    const arX = width * arInteraction.position.x;
    const arY = height * arInteraction.position.y;
    const baseSize = 120; // Base size for AR content
    const scaledSize = baseSize * arInteraction.scale;

    console.log("📍 AR position:", {
      arX,
      arY,
      width,
      height,
      position: arInteraction.position,
      scale: arInteraction.scale,
      assetType: currentAsset.assetType,
    });

    ctx.save();

    // Draw the actual content based on type at the interactive position
    switch (currentAsset.assetType) {
      case "message":
        drawMessageAsset(ctx, currentAsset, arX, arY, scaledSize);
        break;

      case "image":
        drawImageAsset(ctx, currentAsset, arX, arY, scaledSize);
        break;

      case "video":
        drawVideoAsset(ctx, currentAsset, arX, arY, scaledSize);
        break;

      case "model3d":
        drawModel3DAsset(ctx, currentAsset, arX, arY, scaledSize);
        break;

      case "webcontent":
        drawWebContentAsset(ctx, currentAsset, arX, arY, scaledSize);
        break;

      default:
        console.log("⚠️ Unknown asset type:", currentAsset.assetType);
        break;
    }
    ctx.restore();

    // Draw placement target (subtle indicator)
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(arX, arY, 50 * arInteraction.scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw interaction feedback
    if (arInteraction.isDragging || arInteraction.isScaling) {
      ctx.save();

      // Círculo de interacción brillante
      ctx.strokeStyle = "rgba(0, 255, 255, 0.9)";
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(arX, arY, 80 * arInteraction.scale, 0, Math.PI * 2);
      ctx.stroke();

      // Texto de estado
      ctx.fillStyle = "rgba(0, 255, 255, 0.9)";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const statusText = arInteraction.isDragging ? "MOVIENDO" : "ESCALANDO";
      ctx.fillText(statusText, arX, arY + 90 * arInteraction.scale);

      ctx.restore();
    }

    // Agregar indicador de posición actual siempre visible
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 0, 0.7)";
    ctx.beginPath();
    ctx.arc(arX, arY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // AR UI rendering function
  const drawARUI = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Draw AR crosshair at center
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY);
    ctx.lineTo(centerX + 20, centerY);
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();
    ctx.restore();

    // Draw corner frame indicators
    const cornerSize = 30;
    const margin = 20;

    ctx.save();
    ctx.strokeStyle = "rgba(0, 255, 0, 0.6)";
    ctx.lineWidth = 3;

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(margin, margin + cornerSize);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + cornerSize, margin);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + cornerSize);
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(margin, height - margin - cornerSize);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + cornerSize, height - margin);
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - cornerSize);
    ctx.stroke();
    ctx.restore();
  };

  // Stop AR
  const stopAR = () => {
    console.log("🛑 Stopping AR...");

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }

    setArState((prev) => ({ ...prev, isActive: false }));
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

  // 🔄 Estado de Carga Profesional
  if (arState.loadingState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          {/* Spinner futurista */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-purple-400/50 border-b-transparent rounded-full animate-spin animate-reverse"></div>
          </div>

          {/* Texto con progreso */}
          <div className="space-y-3">
            <h2 className="text-white text-xl font-semibold">
              Preparando Experiencia AR
            </h2>
            <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${arState.progress}%` }}
              />
            </div>
            <p className="text-blue-200 text-sm">
              {arState.progress}% completado
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🔐 Estado de Permisos
  if (arState.loadingState === "permissions") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6 animate-pulse">📹</div>
          <h2 className="text-2xl font-semibold mb-4">Acceso a Cámara</h2>
          <p className="text-blue-200 mb-6">
            Permitiendo acceso a la cámara para la experiencia AR...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (arState.hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-2xl font-semibold mb-4">Error</div>
          <div className="text-blue-200 mb-8">{arState.errorMessage}</div>

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

  // 🎬 EXPERIENCIA AR ACTIVA - PROFESIONAL Y MINIMALISTA
  if (arState.isActive) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* 📹 Feed de Cámara */}
        {mediaStream && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
        )}

        {/* 🎨 Canvas AR Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-20 touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* ✨ HUD MINIMALISTA Y PROFESIONAL */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 🔝 Barra Superior Minimalista */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/40 to-transparent pointer-events-auto z-50">
            <div className="flex items-center justify-between">
              {/* Botón Salir Elegante */}
              <button
                onClick={stopAR}
                className="group flex items-center space-x-2 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white font-medium transition-all duration-300 hover:bg-black/80 hover:scale-105"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Salir</span>
              </button>

              {/* Indicador de Estado AR */}
              <div className="flex items-center space-x-2">
                {/* Modo AR */}
                <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-300 text-sm font-medium uppercase tracking-wider">
                      {arState.mode} AR
                    </span>
                  </div>
                </div>

                {/* Asset Actual */}
                {experience && (
                  <div className="bg-black/60 backdrop-blur-md border border-blue-500/30 px-3 py-1.5 rounded-full">
                    <span className="text-blue-300 text-sm font-medium">
                      {currentAssetIndex + 1}/{experience.assets.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🎯 Instrucciones Contextuales Minimalistas */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
            {!arInteraction.isDragging && !arInteraction.isScaling && (
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-center text-white animate-fade-in">
                <div className="text-sm text-white/80 mb-1">
                  {arState.mode === "marker"
                    ? "📱 Apunta al marcador"
                    : "✋ Toca para interactuar"}
                </div>
                <div className="text-xs text-white/60">
                  {deviceCapabilities.isMobile
                    ? "Pellizca para escalar"
                    : "Rueda para escalar"}
                </div>
              </div>
            )}

            {(arInteraction.isDragging || arInteraction.isScaling) && (
              <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-400/50 px-4 py-2 rounded-xl text-center animate-pulse">
                <div className="text-cyan-300 text-sm font-medium">
                  {arInteraction.isDragging ? "📍 Moviendo" : "🔍 Escalando"}
                </div>
              </div>
            )}
          </div>

          {/* 🔻 Controles Inferiores Elegantes */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent pointer-events-auto z-50">
            <div className="flex flex-col space-y-3">
              
              {/* Navegación de Assets (si hay múltiples) */}
              {experience && experience.assets.length > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                    <button
                      onClick={prevAsset}
                      title="Asset anterior"
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex space-x-1">
                      {experience.assets.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentAssetIndex(index)}
                          title={`Ver asset ${index + 1}`}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentAssetIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextAsset}
                      title="Asset siguiente"
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Controles Rápidos Minimalistas */}
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setArInteraction(prev => ({ ...prev, position: { x: 0.5, y: 0.5 }, scale: 1.0 }))}
                  className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full text-white text-sm font-medium hover:bg-black/80 transition-all duration-200"
                >
                  🎯 Centrar
                </button>
                
                <button
                  onClick={() => setArInteraction(prev => ({ ...prev, scale: Math.max(0.3, prev.scale * 0.8) }))}
                  className="bg-black/60 backdrop-blur-md border border-white/10 w-10 h-10 rounded-full text-white font-bold hover:bg-black/80 transition-all duration-200"
                >
                  -
                </button>
                
                <button
                  onClick={() => setArInteraction(prev => ({ ...prev, scale: Math.min(3.0, prev.scale * 1.2) }))}
                  className="bg-black/60 backdrop-blur-md border border-white/10 w-10 h-10 rounded-full text-white font-bold hover:bg-black/80 transition-all duration-200"
                >
                  +
                </button>
              </div>

              {/* Información del Asset Actual */}
              {experience && (
                <div className="flex justify-center">
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                    <div className="text-center">
                      <div className="text-white text-sm font-medium">
                        {experience.assets[currentAssetIndex].name}
                      </div>
                      <div className="text-white/60 text-xs uppercase tracking-wider">
                        {experience.assets[currentAssetIndex].assetType}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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

          {/* Camera support status */}
          {deviceCapabilities.hasCamera !== undefined && (
            <div
              className={`mb-6 glass p-4 rounded-lg backdrop-blur-sm ${
                deviceCapabilities.hasCamera
                  ? "bg-green-900/30"
                  : "bg-red-900/30"
              }`}
            >
              <div
                className={`flex items-center space-x-2 ${
                  deviceCapabilities.hasCamera
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                <span className="text-xl">
                  {deviceCapabilities.hasCamera ? "✅" : "❌"}
                </span>
                <span className="text-sm">
                  {deviceCapabilities.hasCamera
                    ? "Cámara disponible"
                    : window.isSecureContext
                    ? "Cámara no soportada"
                    : "Se requiere HTTPS"}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={startARCamera}
            disabled={!deviceCapabilities.supportsAR}
            className={`w-full p-4 rounded-lg text-white font-semibold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-3 ${
              !deviceCapabilities.supportsAR
                ? "bg-gray-600 cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 shadow-blue-500/25"
            }`}
          >
            {!deviceCapabilities.supportsAR
              ? "❌ AR No Disponible"
              : "🚀 INICIAR CÁMARA AR"}
          </button>

          <button
            onClick={startARPreview}
            className="w-full p-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow-violet-500/25"
          >
            � VISTA PREVIA AR
          </button>

          <div className="mt-6 glass p-4 rounded-lg backdrop-blur-sm">
            <div className="text-sm text-blue-200/70">
              <div className="font-medium mb-2">🔧 Instrucciones:</div>
              {!window.isSecureContext ? (
                <>
                  <div className="text-yellow-300 mb-2">
                    ⚠️ Para usar la cámara:
                  </div>
                  <div>• Usa HTTPS: https://localhost:3000</div>
                  <div>• O usa el task "start-frontend" (HTTPS)</div>
                  <div>• La cámara requiere contexto seguro</div>
                </>
              ) : (
                <>
                  <div>• Permite acceso a la cámara</div>
                  <div>• Apunta hacia superficies planas</div>
                  <div>• El contenido aparece superpuesto en la realidad</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
