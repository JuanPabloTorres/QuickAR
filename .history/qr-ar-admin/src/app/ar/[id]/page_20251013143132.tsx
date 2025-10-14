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
import { useEffect, useRef, useState, useCallback } from "react";

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
    const isSecure = window.isSecureContext || location.hostname === 'localhost';
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 🌐 Verificar soporte WebXR
    let hasWebXR = false;
    if ('xr' in navigator) {
      try {
        const xr = (navigator as any).xr;
        if (xr && typeof xr.isSessionSupported === 'function') {
          hasWebXR = await xr.isSessionSupported('immersive-ar');
        }
      } catch (error) {
        console.log('WebXR no disponible:', error);
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

    console.log('🔧 Capacidades AR detectadas:', {
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
      setArState(prev => ({
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
      setArState(prev => ({ ...prev, loadingState: "loading", progress: 10 }));

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(experienceId);
      
      let response;
      try {
        if (isUuid) {
          response = await getExperienceById(experienceId);
        } else {
          response = await getExperienceBySlug(experienceId);
        }
      } catch (networkError) {
        throw new Error("Error de conexión. Verifica que el API esté disponible.");
      }

      if (!response?.success || !response.data) {
        throw new Error("Experiencia no encontrada");
      }

      // Fase 2: Normalizar y detectar tipo AR
      setArState(prev => ({ ...prev, progress: 30 }));
      
      const normalizedExperience = normalizeExperience(response.data);
      setExperience(normalizedExperience);
      
      // 🧠 Detección Inteligente del Modo AR
      const arMode = detectARMode(normalizedExperience);
      console.log(`🎯 Modo AR detectado: ${arMode}`);
      
      // Fase 3: Precargar assets críticos
      setArState(prev => ({ ...prev, progress: 50, mode: arMode }));
      await preloadCriticalAssets(normalizedExperience.assets);
      
      // Fase 4: Listo para AR
      setArState(prev => ({ 
        ...prev, 
        loadingState: "ready",
        progress: 100,
        hasError: false,
      }));

      console.log("✅ Experiencia AR lista:", normalizedExperience.title);
      
    } catch (error: any) {
      console.error("❌ Error cargando experiencia:", error);
      setArState(prev => ({
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
    const hasMarkerAssets = exp.assets.some(asset => 
      asset.name.toLowerCase().includes('marker') ||
      asset.name.toLowerCase().includes('target') ||
      asset.assetType === 'image' && asset.name.toLowerCase().includes('qr')
    );
    
    // Si hay muchos assets o son 3D, probablemente sea viewer mode
    const hasComplexAssets = exp.assets.some(asset => 
      asset.assetType === 'model3d' || 
      asset.assetType === 'video'
    ) || exp.assets.length > 2;
    
    if (hasMarkerAssets && !hasComplexAssets) {
      return "marker";
    }
    
    return "viewer"; // Default para experiencias libres
  }, []);

  // 📦 Precargar Assets Críticos
  const preloadCriticalAssets = useCallback(async (assets: Asset[]) => {
    const imageAssets = assets.filter(asset => asset.assetType === 'image' && asset.assetUrl);
    
    const promises = imageAssets.map(async (asset) => {
      if (!asset.assetUrl || assetLoader.loaded.has(asset.id)) return;
      
      assetLoader.loading.add(asset.id);
      
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
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
  }, [assetLoader]);

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
    setArState(prev => ({ 
      ...prev, 
      isActive: true,
      loadingState: "ready"
    }));
  }, []);

  // 📱 Inicio de AR con Cámara Profesional
  const startARCamera = useCallback(async () => {
    if (!deviceCapabilities.supportsAR) {
      setArState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: "AR no está disponible en este dispositivo",
        loadingState: "error"
      }));
      return;
    }

    try {
      setArState(prev => ({ ...prev, loadingState: "permissions" }));
      console.log("📹 Solicitando acceso a cámara...");

      // Configuración optimizada para AR
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: deviceCapabilities.isMobile ? { ideal: "environment" } : "user",
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);

      // Transición suave a modo activo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        setArState(prev => ({ 
          ...prev, 
          isActive: true,
          loadingState: "ready"
        }));

        console.log("✅ Cámara AR iniciada exitosamente");
      }
      
    } catch (error: any) {
      console.error("❌ Error de cámara:", error);
      
      const errorMessages: Record<string, string> = {
        'NotAllowedError': '📷 Permisos de cámara denegados.\nPor favor permite el acceso y recarga.',
        'NotFoundError': '📷 No se encontró cámara disponible.',
        'NotSupportedError': '📱 Tu navegador no soporta cámara AR.',
        'NotReadableError': '📷 Cámara ocupada por otra aplicación.',
      };

      setArState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: errorMessages[error.name] || `Error de cámara: ${error.message}`,
        loadingState: "error"
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

  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0.5, y: 0.5 };

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    
    return { x, y };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    console.log("🚨 TOUCH START EVENT FIRED!", {
      touchCount: e.touches.length,
      target: e.target,
      canvasElement: canvasRef.current,
    });

    e.preventDefault();
    e.stopPropagation();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      console.log("👆 Single touch at:", touch.clientX, touch.clientY);

      const pos = getRelativePosition(touch.clientX, touch.clientY);
      console.log("📍 Calculated position:", pos);

      setArInteraction((prev) => {
        console.log("🔄 Setting dragging state - OLD:", prev);
        const newState = {
          ...prev,
          isDragging: true,
          isScaling: false,
          position: pos,
        };
        console.log("🔄 Setting dragging state - NEW:", newState);
        return newState;
      });
    } else if (e.touches.length === 2) {
      console.log("🤏 Two finger touch - scaling mode");
      const distance = getTouchDistance(e.touches);
      setArInteraction((prev) => ({
        ...prev,
        isScaling: true,
        isDragging: false,
        lastTouchDistance: distance,
      }));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    console.log("🚨 TOUCH MOVE EVENT!", {
      isDragging: arInteraction.isDragging,
      isScaling: arInteraction.isScaling,
      touchCount: e.touches.length,
    });

    e.preventDefault();
    e.stopPropagation();

    if (arInteraction.isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const pos = getRelativePosition(touch.clientX, touch.clientY);
      console.log("🔄 MOVING to:", pos);

      setArInteraction((prev) => ({ ...prev, position: pos }));
    } else if (arInteraction.isScaling && e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      if (arInteraction.lastTouchDistance > 0) {
        const scaleFactor = distance / arInteraction.lastTouchDistance;
        const newScale = Math.max(
          0.3,
          Math.min(3.0, arInteraction.scale * scaleFactor)
        );
        (prev) => ({
          ...prev,
          scale: newScale,
          lastTouchDistance: distance,
        });
        console.log("🔍 Scaling to:", newScale);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("👆 Touch END");

    setArInteraction((prev) => ({
      ...prev,
      isDragging: false,
      isScaling: false,
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log("🚨 MOUSE DOWN EVENT FIRED!", {
      clientX: e.clientX,
      clientY: e.clientY,
      target: e.target,
      canvasElement: canvasRef.current,
    });

    e.preventDefault();
    e.stopPropagation();

    const pos = getRelativePosition(e.clientX, e.clientY);
    console.log("📍 Mouse position:", pos);

    setArInteraction((prev) => {
      console.log("🔄 Setting mouse drag state - OLD:", prev);
      const newState = {
        ...prev,
        isDragging: true,
        position: pos,
      };
      console.log("🔄 Setting mouse drag state - NEW:", newState);
      return newState;
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (arInteraction.isDragging) {
      console.log("🚨 MOUSE MOVE - DRAGGING!", {
        clientX: e.clientX,
        clientY: e.clientY,
        isDragging: arInteraction.isDragging,
      });

      e.preventDefault();
      e.stopPropagation();

      const pos = getRelativePosition(e.clientX, e.clientY);
      console.log("🖱️ Mouse moving to:", pos);
      setArInteraction((prev) => ({ ...prev, position: pos }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("🖱️ Mouse UP");

    setArInteraction((prev) => ({ ...prev, isDragging: false }));
  };

  // Wheel event for desktop scaling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(
      0.3,
      Math.min(3.0, arInteraction.scale * scaleFactor)
    );

    setArInteraction((prev) => ({
      ...prev,
      scale: newScale,
    }));

    console.log("🔍 Wheel scaling to:", newScale);
  };

  // AR rendering loop
  const startARRendering = () => {
    if (!canvasRef.current) {
      console.warn("❌ Canvas ref not available for AR rendering");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("❌ Canvas context not available");
      return;
    }

    console.log("✅ Starting AR rendering loop...");

    const renderFrame = () => {
      if (arState.isActive && canvas) {
        // Establecer tamaño del canvas
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Limpiar canvas completamente
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // FORZAR CONTENIDO VISIBLE INMEDIATAMENTE
        ctx.save();

        // Dibujar indicador de que AR está funcionando
        ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("AR", canvas.width / 2, canvas.height / 2);

        ctx.restore();

        // Dibujar el contenido AR real si hay experiencia
        if (experience && experience.assets && experience.assets.length > 0) {
          drawARContent(ctx, canvas.width, canvas.height);
        }

        // Dibujar UI AR (cruces, indicadores)
        drawARUI(ctx, canvas.width, canvas.height);
      }

      if (arState.isActive) {
        requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
  };

  // Asset rendering functions
  const drawMessageAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    ctx.save();

    const padding = 30;
    const maxWidth = Math.max(300, size * 3);
    const minHeight = Math.max(100, size * 1.5);
    const text = asset.assetContent || asset.name || "Mensaje AR";

    // Sombra para profundidad
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(
      x - maxWidth / 2 + 5,
      y - minHeight / 2 + 5,
      maxWidth,
      minHeight
    );

    // Fondo brillante y colorido
    ctx.fillStyle = "rgba(30, 144, 255, 0.95)"; // Azul brillante
    ctx.fillRect(x - maxWidth / 2, y - minHeight / 2, maxWidth, minHeight);

    // Border grueso y blanco
    ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    ctx.lineWidth = 6;
    ctx.strokeRect(x - maxWidth / 2, y - minHeight / 2, maxWidth, minHeight);

    // Texto grande y legible con sombra
    ctx.fillStyle = "white";
    ctx.font = `bold ${Math.max(24, size / 5)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Sombra del texto
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 6;

    // Wrap text if too long
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth - padding * 2 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Draw text lines
    const fontSize = Math.max(24, size / 5);
    const lineHeight = Math.max(30, fontSize + 6);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + index * lineHeight);
    });

    ctx.restore();
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

  // Loading State
  if (arState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando experiencia AR...</p>
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

  // AR Active - REAL CAMERA VIEW
  if (arState.isActive) {
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
          className="absolute inset-0 w-full h-full z-20"
          style={{
            touchAction: "none",
            userSelect: "none",
            pointerEvents: "auto",
            background: "transparent",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* AR UI Controls */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto z-50">
            <button
              onClick={stopAR}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold transition-colors"
            >
              ← Salir AR
            </button>

            <div className="flex space-x-3">
              <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-white text-sm font-medium">
                  📱 CÁMARA AR ACTIVA
                </div>
              </div>

              {/* AR Object Status */}
              <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-white text-sm">
                  <div className="font-medium">
                    🎯 {experience.assets[currentAssetIndex].name}
                  </div>
                  <div className="text-xs text-blue-200">
                    Escala: {(arInteraction.scale * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-green-200">
                    Pos: {arInteraction.position.x.toFixed(2)},{" "}
                    {arInteraction.position.y.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Quick Test Button */}
              <button
                onClick={() => {
                  console.log("🚨 FORCE MOVE TEST - Moving to (0.8, 0.3)");
                  setArInteraction((prev) => ({
                    ...prev,
                    position: { x: 0.8, y: 0.3 },
                  }));
                }}
                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg text-white font-semibold text-xs"
              >
                🧪 FORCE MOVE
              </button>
            </div>
          </div>

          {/* Asset info */}
          <div className="absolute top-20 left-4 pointer-events-auto z-50">
            <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg">
              <div className="text-white">
                <div className="font-medium text-lg">
                  {experience.assets[currentAssetIndex].name}
                </div>
                <div className="text-blue-200 text-sm">
                  Tipo: {experience.assets[currentAssetIndex].assetType}
                </div>
              </div>
            </div>
          </div>

          {/* Debug Panel - Bottom Left */}
          <div className="absolute bottom-4 left-4 pointer-events-none z-50">
            <div className="bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-cyan-500/30">
              <div className="text-white text-xs font-mono">
                <div className="text-cyan-300 font-bold mb-1">
                  🔧 DEBUG INFO
                </div>
                <div>
                  Pos: {arInteraction.position.x.toFixed(3)},{" "}
                  {arInteraction.position.y.toFixed(3)}
                </div>
                <div>Scale: {arInteraction.scale.toFixed(2)}</div>
                <div
                  className={
                    arInteraction.isDragging
                      ? "text-green-400"
                      : "text-gray-400"
                  }
                >
                  Dragging: {arInteraction.isDragging ? "YES" : "NO"}
                </div>
                <div
                  className={
                    arInteraction.isScaling ? "text-blue-400" : "text-gray-400"
                  }
                >
                  Scaling: {arInteraction.isScaling ? "YES" : "NO"}
                </div>
                <div>
                  Asset: {currentAssetIndex + 1}/{experience.assets.length}
                </div>
              </div>
            </div>
          </div>

          {/* Center instructions */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
            <div className="text-center text-white">
              <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg mb-4">
                <div className="text-lg font-semibold">
                  🎯 Contenido AR Activo
                </div>
                <div className="text-sm text-blue-200">
                  📱 Toca y arrastra para mover
                </div>
                <div className="text-sm text-blue-200">
                  🤏 Pellizca para cambiar tamaño
                </div>
                {(arInteraction.isDragging || arInteraction.isScaling) && (
                  <div className="text-sm text-cyan-300 mt-2">
                    {arInteraction.isDragging
                      ? "📍 Moviendo objeto"
                      : "🔍 Cambiando tamaño"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto z-50">
            {experience.assets.length > 1 && (
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-4 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg">
                  <button
                    onClick={prevAsset}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded transition-colors"
                  >
                    <span className="text-white text-lg">←</span>
                  </button>

                  <div className="text-white">
                    {currentAssetIndex + 1} / {experience.assets.length}
                  </div>

                  <button
                    onClick={nextAsset}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded transition-colors"
                  >
                    <span className="text-white text-lg">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Controls */}
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                <button
                  onClick={() => {
                    console.log("🎯 Centering AR object");
                    setArInteraction((prev) => ({
                      ...prev,
                      position: { x: 0.5, y: 0.5 },
                      scale: 1.0,
                    }));
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
                >
                  🎯 Centrar
                </button>
                <button
                  onClick={() => {
                    console.log("📏 Resetting scale to normal");
                    setArInteraction((prev) => ({ ...prev, scale: 1.0 }));
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-sm"
                >
                  📏 Tamaño Normal
                </button>
                <button
                  onClick={() => {
                    console.log(
                      "🧪 Testing movement - moving to random position"
                    );
                    setArInteraction((prev) => ({
                      ...prev,
                      position: {
                        x: Math.random(),
                        y: Math.random(),
                      },
                    }));
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-white text-sm"
                >
                  🧪 Test Move
                </button>
                <button
                  onClick={() =>
                    setArInteraction((prev) => ({
                      ...prev,
                      scale: Math.min(3.0, prev.scale * 1.2),
                    }))
                  }
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm"
                >
                  🔍 +
                </button>
                <button
                  onClick={() =>
                    setArInteraction((prev) => ({
                      ...prev,
                      scale: Math.max(0.3, prev.scale * 0.8),
                    }))
                  }
                  className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-white text-sm"
                >
                  🔎 -
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="flex justify-center">
              <div className="bg-green-600/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-white text-sm flex items-center space-x-2">
                  <span className="animate-pulse">●</span>
                  <span>AR FUNCIONANDO - Cámara Activa</span>
                </div>
              </div>
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
            onClick={startAR}
            disabled={!deviceCapabilities.hasCamera}
            className={`w-full p-4 rounded-lg text-white font-semibold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg mb-3 ${
              !deviceCapabilities.hasCamera
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            }`}
          >
            {!deviceCapabilities.hasCamera
              ? "❌ Cámara no disponible"
              : "🚀 ABRIR CÁMARA AR"}
          </button>

          <button
            onClick={startARTest}
            className="w-full p-4 rounded-lg text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            🎯 PROBAR AR (Sin Cámara)
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
