/**
 * ✨ QUICK AR - EXPERIENCIA AR PROFESIONAL ✨
 * Versión limpia y optimizada sin duplicaciones
 */

"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Asset, Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// 🎯 Tipos AR
type ARMode = "viewer" | "marker";
type LoadingState = "loading" | "ready" | "error" | "permissions";

interface ARState {
  mode: ARMode;
  isActive: boolean;
  loadingState: LoadingState;
  hasError: boolean;
  errorMessage: string;
  progress: number;
}

interface DeviceCapabilities {
  hasCamera: boolean;
  hasWebXR: boolean;
  isSecureContext: boolean;
  isMobile: boolean;
  supportsAR: boolean;
}

interface InteractionState {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  isDragging: boolean;
  isScaling: boolean;
  lastTouchDistance: number;
}

export default function ARExperience() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;

  // 📱 Estados principales
  const [experience, setExperience] = useState<Experience | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // 🎯 Estado AR
  const [arState, setArState] = useState<ARState>({
    mode: "viewer",
    isActive: false,
    loadingState: "loading",
    hasError: false,
    errorMessage: "",
    progress: 0,
  });

  // 🔧 Capacidades del dispositivo
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    hasCamera: false,
    hasWebXR: false,
    isSecureContext: window?.isSecureContext ?? false,
    isMobile: /Mobi|Android/i.test(navigator?.userAgent ?? ""),
    supportsAR: false,
  });

  // ✋ Estado de interacción
  const [interaction, setInteraction] = useState<InteractionState>({
    position: { x: 0.5, y: 0.5 },
    scale: 1.0,
    rotation: 0,
    isDragging: false,
    isScaling: false,
    lastTouchDistance: 0,
  });

  // Referencias
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // 🔍 Detección de capacidades AR
  const detectARCapabilities = useCallback(async () => {
    console.log("🔧 Detectando capacidades AR...");
    
    try {
      const hasCamera = !!(navigator?.mediaDevices?.getUserMedia);
      const hasWebXR = 'xr' in navigator;
      const isSecureContext = window.isSecureContext;
      
      const capabilities = {
        hasCamera,
        hasWebXR,
        isSecureContext,
        isMobile: /Mobi|Android/i.test(navigator.userAgent),
        supportsAR: hasCamera && isSecureContext,
      };

      console.log("🔧 Capacidades AR detectadas:", capabilities);
      setDeviceCapabilities(capabilities);

      return capabilities;
    } catch (error) {
      console.error("❌ Error detectando capacidades:", error);
      return deviceCapabilities;
    }
  }, []);

  // 📥 Cargar experiencia
  const loadExperience = useCallback(async () => {
    console.log(`📥 Cargando experiencia AR: ${experienceId}`);
    
    try {
      setArState(prev => ({ ...prev, loadingState: "loading", progress: 25 }));

      const data = experienceId.match(/^[0-9]+$/)
        ? await getExperienceById(parseInt(experienceId))
        : await getExperienceBySlug(experienceId);

      if (!data) {
        throw new Error("Experiencia no encontrada");
      }

      const normalizedExp = normalizeExperience(data);
      setExperience(normalizedExp);
      setArState(prev => ({ ...prev, progress: 75 }));

      // Pre-cargar primer asset
      if (normalizedExp.assets.length > 0) {
        await preloadAsset(normalizedExp.assets[0]);
      }

      setArState(prev => ({ ...prev, loadingState: "ready", progress: 100 }));
      console.log("✅ Experiencia AR lista:", normalizedExp.title);

    } catch (error) {
      console.error("❌ Error cargando experiencia:", error);
      setArState(prev => ({
        ...prev,
        loadingState: "error",
        hasError: true,
        errorMessage: error instanceof Error ? error.message : "Error desconocido"
      }));
    }
  }, [experienceId]);

  // 🎯 Detectar modo AR automáticamente
  const detectARMode = useCallback((): ARMode => {
    if (!experience) return "viewer";
    
    // Lógica simple: si tiene assets 3D o de tipo marker, usar "marker"
    const hasMarkerContent = experience.assets.some(asset => 
      asset.assetType === "model3d" || 
      asset.name.toLowerCase().includes("marker") ||
      asset.name.toLowerCase().includes("qr")
    );

    const mode = hasMarkerContent ? "marker" : "viewer";
    console.log("🎯 Modo AR detectado:", mode);
    
    setArState(prev => ({ ...prev, mode }));
    return mode;
  }, [experience]);

  // 📦 Pre-cargar assets
  const preloadAsset = useCallback(async (asset: Asset) => {
    try {
      if (asset.assetType === "image") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        // Corregir URLs HTTP/HTTPS
        let url = asset.assetUrl;
        if (window.location.protocol === 'https:' && url.startsWith('http:')) {
          url = url.replace('http:', 'https:');
        }
        
        img.src = url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        console.log("✅ Asset precargado:", asset.name);
      }
    } catch (error) {
      console.warn("⚠️ Error precargando asset:", asset.name, error);
    }
  }, []);

  // 🎥 Iniciar cámara AR
  const startARCamera = useCallback(async () => {
    if (!deviceCapabilities.supportsAR) {
      setArState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: "AR no soportado en este dispositivo"
      }));
      return;
    }

    console.log("📹 Solicitando acceso a cámara...");
    setArState(prev => ({ ...prev, loadingState: "permissions" }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setMediaStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      detectARMode();
      setArState(prev => ({ 
        ...prev, 
        isActive: true, 
        loadingState: "ready" 
      }));

      startARLoop();
      
    } catch (error) {
      console.error("❌ Error accediendo a cámara:", error);
      setArState(prev => ({
        ...prev,
        hasError: true,
        loadingState: "error",
        errorMessage: "No se pudo acceder a la cámara"
      }));
    }
  }, [deviceCapabilities.supportsAR, detectARMode]);

  // 🎬 Vista previa AR (sin cámara)
  const startARPreview = useCallback(() => {
    console.log("👁️ Iniciando vista previa AR...");
    detectARMode();
    setArState(prev => ({ 
      ...prev, 
      isActive: true, 
      loadingState: "ready" 
    }));
    startARLoop();
  }, [detectARMode]);

  // 🔄 Loop de renderizado AR
  const startARLoop = useCallback(() => {
    const render = () => {
      if (!canvasRef.current || !arState.isActive) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Ajustar tamaño de canvas
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;
      ctx.scale(pixelRatio, pixelRatio);

      // Limpiar canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Renderizar contenido AR
      if (experience && experience.assets.length > 0) {
        renderARContent(ctx, rect);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
  }, [arState.isActive, experience]);

  // 🎨 Renderizar contenido AR
  const renderARContent = (ctx: CanvasRenderingContext2D, rect: DOMRect) => {
    const asset = experience!.assets[currentAssetIndex];
    const { position, scale } = interaction;
    
    const x = position.x * rect.width;
    const y = position.y * rect.height;
    const size = Math.min(rect.width, rect.height) * 0.3 * scale;

    ctx.save();
    ctx.globalAlpha = 0.9;

    // Renderizar según tipo de asset
    switch (asset.assetType) {
      case "message":
        renderTextAsset(ctx, asset, x, y, size);
        break;
      case "image":
        renderImageAsset(ctx, asset, x, y, size);
        break;
      case "video":
        renderVideoAsset(ctx, asset, x, y, size);
        break;
      case "model3d":
        render3DAsset(ctx, asset, x, y, size);
        break;
      case "webcontent":
        renderWebContentAsset(ctx, asset, x, y, size);
        break;
      default:
        renderDefaultAsset(ctx, asset, x, y, size);
    }

    ctx.restore();
  };

  // Funciones de renderizado específicas
  const renderTextAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(x - size/2, y - size/4, size, size/2);
    
    ctx.fillStyle = "white";
    ctx.font = `${size/8}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(asset.content || asset.name, x, y);
  };

  const renderImageAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(x - size/2, y - size/2, size, size);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size/2, y - size/2, size, size);
    
    ctx.fillStyle = "#1e40af";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🖼️ " + asset.name, x, y);
  };

  const renderVideoAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    ctx.fillStyle = "rgba(30, 30, 30, 0.9)";
    ctx.fillRect(x - size/2, y - size/2, size, size);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size/2, y - size/2, size, size);
    
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🎥 " + asset.name, x, y);
  };

  const render3DAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    // Simulación de objeto 3D
    ctx.fillStyle = "rgba(139, 69, 19, 0.8)";
    ctx.fillRect(x - size/2, y - size/2, size, size);
    
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2;
    
    // Cubo 3D simple
    const offset = size / 4;
    ctx.strokeRect(x - size/2 + offset, y - size/2 - offset, size, size);
    
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("📦 " + asset.name, x, y + size/2 - 8);
  };

  const renderWebContentAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
    ctx.fillRect(x - size/2, y - size/2, size, size);
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size/2, y - size/2, size, size);
    
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🌐 WEB CONTENT", x, y + size/2 - 8);
  };

  const renderDefaultAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    ctx.fillStyle = "rgba(100, 100, 100, 0.8)";
    ctx.fillRect(x - size/2, y - size/2, size, size);
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - size/2, y - size/2, size, size);
    
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(asset.name, x, y);
  };

  // 🎮 Funciones de navegación - SIN DUPLICAR
  const nextAsset = useCallback(() => {
    if (experience && experience.assets.length > 1) {
      setCurrentAssetIndex(prev => (prev + 1) % experience.assets.length);
    }
  }, [experience]);

  const prevAsset = useCallback(() => {
    if (experience && experience.assets.length > 1) {
      setCurrentAssetIndex(prev => 
        (prev - 1 + experience.assets.length) % experience.assets.length
      );
    }
  }, [experience]);

  // 🛑 Control AR
  const stopAR = useCallback(() => {
    console.log("🛑 Deteniendo AR...");
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    setArState(prev => ({ ...prev, isActive: false }));
  }, [mediaStream]);

  const handleBack = useCallback(() => {
    stopAR();
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/experiences");
    }
  }, [stopAR, router]);

  // 🎯 Event handlers para interacción
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      setInteraction(prev => ({ ...prev, isDragging: true }));
    } else if (e.touches.length === 2) {
      const distance = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      );
      setInteraction(prev => ({ 
        ...prev, 
        isScaling: true, 
        lastTouchDistance: distance 
      }));
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (interaction.isDragging && e.touches.length === 1) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.touches[0].clientX - rect.left) / rect.width;
        const y = (e.touches[0].clientY - rect.top) / rect.height;
        setInteraction(prev => ({ 
          ...prev, 
          position: { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) } 
        }));
      }
    } else if (interaction.isScaling && e.touches.length === 2) {
      const distance = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      );
      
      const scaleFactor = distance / interaction.lastTouchDistance;
      setInteraction(prev => ({ 
        ...prev, 
        scale: Math.max(0.3, Math.min(3.0, prev.scale * scaleFactor)),
        lastTouchDistance: distance
      }));
    }
  }, [interaction.isDragging, interaction.isScaling, interaction.lastTouchDistance]);

  const handleTouchEnd = useCallback(() => {
    setInteraction(prev => ({ 
      ...prev, 
      isDragging: false, 
      isScaling: false 
    }));
  }, []);

  // Mouse handlers (desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setInteraction(prev => ({ ...prev, isDragging: true }));
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (interaction.isDragging) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setInteraction(prev => ({ 
          ...prev, 
          position: { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) } 
        }));
      }
    }
  }, [interaction.isDragging]);

  const handleMouseUp = useCallback(() => {
    setInteraction(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setInteraction(prev => ({ 
      ...prev, 
      scale: Math.max(0.3, Math.min(3.0, prev.scale * scaleFactor))
    }));
  }, []);

  // 🎬 Effects
  useEffect(() => {
    detectARCapabilities();
  }, [detectARCapabilities]);

  useEffect(() => {
    loadExperience();
  }, [loadExperience]);

  useEffect(() => {
    if (arState.isActive) {
      startARLoop();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [arState.isActive, startARLoop]);

  // 🎨 Render States

  // Loading
  if (arState.loadingState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-white text-xl font-semibold">Preparando Experiencia AR</h2>
            <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${arState.progress}%` }}
              />
            </div>
            <p className="text-blue-200 text-sm">{arState.progress}% completado</p>
          </div>
        </div>
      </div>
    );
  }

  // Permissions
  if (arState.loadingState === "permissions") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6 animate-pulse">📹</div>
          <h2 className="text-2xl font-semibold mb-4">Acceso a Cámara</h2>
          <p className="text-blue-200 mb-6">Permitiendo acceso a la cámara para la experiencia AR...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (arState.hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-purple-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-2xl font-semibold mb-4">Error</div>
          <div className="text-red-200 mb-8">{arState.errorMessage}</div>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white/20 backdrop-blur-md border border-white/10 p-3 rounded-lg text-white hover:bg-white/30 transition-colors"
            >
              🔄 Intentar de nuevo
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-white/20 backdrop-blur-md border border-white/10 p-3 rounded-lg text-white hover:bg-white/30 transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-purple-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">🤔</div>
          <div className="text-xl font-semibold">No se pudo cargar la experiencia</div>
        </div>
      </div>
    );
  }

  // 🎬 EXPERIENCIA AR ACTIVA
  if (arState.isActive) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* Feed de cámara */}
        {mediaStream && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
        )}

        {/* Canvas AR */}
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

        {/* HUD Minimalista */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Barra superior */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/40 to-transparent pointer-events-auto z-50">
            <div className="flex items-center justify-between">
              <button
                onClick={stopAR}
                className="flex items-center space-x-2 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white font-medium transition-all duration-300 hover:bg-black/80"
              >
                <span>← Salir</span>
              </button>

              <div className="flex items-center space-x-2">
                <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-300 text-sm font-medium uppercase">
                      {arState.mode} AR
                    </span>
                  </div>
                </div>

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

          {/* Instrucciones centrales */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
            {!interaction.isDragging && !interaction.isScaling && (
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl text-center text-white">
                <div className="text-sm text-white/80 mb-1">
                  {arState.mode === "marker" ? "📱 Apunta al marcador" : "✋ Toca para interactuar"}
                </div>
                <div className="text-xs text-white/60">
                  {deviceCapabilities.isMobile ? "Pellizca para escalar" : "Rueda para escalar"}
                </div>
              </div>
            )}
          </div>

          {/* Controles inferiores */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent pointer-events-auto z-50">
            <div className="flex flex-col space-y-3">
              
              {/* Navegación de assets */}
              {experience && experience.assets.length > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                    <button
                      onClick={prevAsset}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      <span className="text-white">‹</span>
                    </button>

                    <div className="flex space-x-1">
                      {experience.assets.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentAssetIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentAssetIndex ? 'bg-white scale-125' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextAsset}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      <span className="text-white">›</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Controles rápidos */}
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setInteraction(prev => ({ ...prev, position: { x: 0.5, y: 0.5 }, scale: 1.0 }))}
                  className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full text-white text-sm hover:bg-black/80 transition-all"
                >
                  🎯 Centrar
                </button>
                
                <button
                  onClick={() => setInteraction(prev => ({ ...prev, scale: Math.max(0.3, prev.scale * 0.8) }))}
                  className="bg-black/60 backdrop-blur-md border border-white/10 w-10 h-10 rounded-full text-white font-bold hover:bg-black/80 transition-all"
                >
                  -
                </button>
                
                <button
                  onClick={() => setInteraction(prev => ({ ...prev, scale: Math.min(3.0, prev.scale * 1.2) }))}
                  className="bg-black/60 backdrop-blur-md border border-white/10 w-10 h-10 rounded-full text-white font-bold hover:bg-black/80 transition-all"
                >
                  +
                </button>
              </div>

              {/* Info del asset actual */}
              {experience && (
                <div className="flex justify-center">
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                    <div className="text-center">
                      <div className="text-white text-sm font-medium">
                        {experience.assets[currentAssetIndex].name}
                      </div>
                      <div className="text-white/60 text-xs uppercase">
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

  // 📱 Pantalla de inicio
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={handleBack}
          className="bg-white/20 backdrop-blur-md border border-white/10 p-3 rounded-lg text-white hover:bg-white/30 transition-colors"
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

          <div className="mb-8 bg-white/20 backdrop-blur-md border border-white/10 p-6 rounded-lg">
            <div className="text-2xl mb-4">📱 AR Real</div>
            <div className="text-lg font-medium mb-2">
              {experience.assets.length} contenido{experience.assets.length !== 1 ? "s" : ""} disponible{experience.assets.length !== 1 ? "s" : ""}
            </div>
            <div className="text-sm text-blue-200/70">
              Tipos: {[...new Set(experience.assets.map(a => a.assetType))].join(", ")}
            </div>
          </div>

          {/* Estado de cámara */}
          {deviceCapabilities.hasCamera !== undefined && (
            <div className={`mb-6 bg-white/20 backdrop-blur-md border border-white/10 p-4 rounded-lg ${
              deviceCapabilities.hasCamera ? "bg-green-900/30" : "bg-red-900/30"
            }`}>
              <div className={`flex items-center space-x-2 ${
                deviceCapabilities.hasCamera ? "text-green-400" : "text-red-400"
              }`}>
                <span className="text-xl">{deviceCapabilities.hasCamera ? "✅" : "❌"}</span>
                <span className="text-sm">
                  {deviceCapabilities.hasCamera
                    ? "Cámara disponible"
                    : window.isSecureContext
                    ? "Cámara no soportada"
                    : "Se requiere HTTPS"
                  }
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
                : "bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600"
            }`}
          >
            {!deviceCapabilities.supportsAR ? "❌ AR No Disponible" : "🚀 INICIAR CÁMARA AR"}
          </button>

          <button
            onClick={startARPreview}
            className="w-full p-4 rounded-lg text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
          >
            👁️ VISTA PREVIA AR
          </button>

          <div className="mt-6 bg-white/20 backdrop-blur-md border border-white/10 p-4 rounded-lg">
            <div className="text-sm text-blue-200/70">
              <div className="font-medium mb-2">🔧 Instrucciones:</div>
              {!window.isSecureContext ? (
                <>
                  <div className="text-yellow-300 mb-2">⚠️ Para usar la cámara:</div>
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