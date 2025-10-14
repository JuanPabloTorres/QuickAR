/**
 * QUICK AR - Professional AR Experience
 * Implementa los conceptos del prompt: viewer mode AR con interfaz minimalista y futurista
 */

"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Asset, Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// AR Experience Mode Types
type ARMode = "viewer" | "marker";

interface ARExperienceState {
  mode: ARMode;
  isActive: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  fallbackMode: boolean;
}

interface DeviceCapabilities {
  hasCamera: boolean;
  hasAR: boolean;
  isSecureContext: boolean;
  isMobile: boolean;
}

interface ARInteractionState {
  position: { x: number; y: number };
  scale: number;
  isDragging: boolean;
  isScaling: boolean;
  lastTouchDistance: number;
}

export default function ARExperience() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;
  
  // Core State
  const [experience, setExperience] = useState<Experience | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  
  // AR State Management
  const [arState, setArState] = useState<ARExperienceState>({
    mode: "viewer", // Default to viewer mode as per prompt
    isActive: false,
    isLoading: true,
    hasError: false,
    errorMessage: "",
    fallbackMode: false,
  });
  
  // Device Capabilities
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    hasCamera: false,
    hasAR: false,
    isSecureContext: false,
    isMobile: false,
  });
  
  // AR Interaction State
  const [arInteraction, setArInteraction] = useState<ARInteractionState>({
    position: { x: 0.5, y: 0.5 },
    scale: 1.0,
    isDragging: false,
    isScaling: false,
    lastTouchDistance: 0,
  });

  // Technical Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Device Capabilities Detection
  useEffect(() => {
    const detectCapabilities = () => {
      const isSecure = window.isSecureContext;
      const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      
      setDeviceCapabilities({
        hasCamera: isSecure && hasMediaDevices,
        hasAR: 'xr' in navigator,
        isSecureContext: isSecure,
        isMobile: isMobile,
      });
    };
    
    detectCapabilities();
  }, []);

  // Load Experience Data
  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) {
        setArState(prev => ({ 
          ...prev, 
          isLoading: false, 
          hasError: true, 
          errorMessage: "ID de experiencia no válido" 
        }));
        return;
      }

      try {
        setArState(prev => ({ ...prev, isLoading: true }));
        
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(experienceId);
        
        let response;
        if (isUuid) {
          response = await getExperienceById(experienceId);
        } else {
          response = await getExperienceBySlug(experienceId);
        }

        if (response?.success && response.data) {
          const normalizedExperience = normalizeExperience(response.data);
          setExperience(normalizedExperience);
          setArState(prev => ({ ...prev, isLoading: false, hasError: false }));
        } else {
          setArState(prev => ({ 
            ...prev, 
            isLoading: false, 
            hasError: true, 
            errorMessage: "Experiencia no encontrada" 
          }));
        }
      } catch (error) {
        console.error("Error loading experience:", error);
        setArState(prev => ({ 
          ...prev, 
          isLoading: false, 
          hasError: true, 
          errorMessage: "Error al cargar la experiencia" 
        }));
      }
    };

    loadExperience();
  }, [experienceId]);

  // Handle Back Navigation
  const handleBack = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    router.push('/');
  };

  // Start AR Experience
  const startARExperience = async (useCamera: boolean = false) => {
    try {
      setArState(prev => ({ ...prev, isLoading: true }));

      if (useCamera && deviceCapabilities.hasCamera) {
        await startCameraAR();
      } else {
        startViewerAR();
      }
    } catch (error) {
      console.error("Error starting AR:", error);
      setArState(prev => ({ 
        ...prev, 
        isLoading: false, 
        hasError: true, 
        errorMessage: "No se pudo iniciar la experiencia AR" 
      }));
    }
  };

  // Start Camera-based AR
  const startCameraAR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setMediaStream(stream);
      setArState(prev => ({ 
        ...prev, 
        isActive: true, 
        isLoading: false, 
        fallbackMode: false 
      }));

      // Setup video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        startRenderLoop();
      }
    } catch (error) {
      console.warn("Camera access failed, falling back to viewer mode:", error);
      startViewerAR();
    }
  };

  // Start Viewer AR (no camera)
  const startViewerAR = () => {
    setArState(prev => ({ 
      ...prev, 
      isActive: true, 
      isLoading: false, 
      fallbackMode: true 
    }));
    startRenderLoop();
  };

  // AR Render Loop
  const startRenderLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const render = () => {
      if (!arState.isActive) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background for fallback mode
      if (arState.fallbackMode) {
        // Gradient background - clean and futuristic
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Render AR content
      renderARContent(ctx, canvas);
      
      requestAnimationFrame(render);
    };

    render();
  };

  // Render AR Content
  const renderARContent = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!experience || !experience.assets || experience.assets.length === 0) return;

    const currentAsset = experience.assets[currentAssetIndex];
    if (!currentAsset) return;

    // Calculate position and size
    const centerX = canvas.width * arInteraction.position.x;
    const centerY = canvas.height * arInteraction.position.y;
    const baseSize = Math.min(canvas.width, canvas.height) * 0.2;
    const size = baseSize * arInteraction.scale;

    // Render asset based on type
    ctx.save();
    
    switch (currentAsset.assetType) {
      case 'message':
        renderMessageAsset(ctx, currentAsset, centerX, centerY, size);
        break;
      case 'image':
        renderImageAsset(ctx, currentAsset, centerX, centerY, size);
        break;
      case 'video':
        renderVideoAsset(ctx, currentAsset, centerX, centerY, size);
        break;
      case 'model3d':
        renderModel3DAsset(ctx, currentAsset, centerX, centerY, size);
        break;
      case 'webcontent':
        renderWebContentAsset(ctx, currentAsset, centerX, centerY, size);
        break;
      default:
        renderDefaultAsset(ctx, currentAsset, centerX, centerY, size);
    }
    
    ctx.restore();
  };

  // Asset Rendering Functions
  const renderMessageAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    const text = asset.assetContent || asset.name;
    const padding = 24;
    const maxWidth = size * 2;

    // Modern glass-morphism background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    const rectHeight = size;
    ctx.fillRect(x - maxWidth / 2, y - rectHeight / 2, maxWidth, rectHeight);
    ctx.strokeRect(x - maxWidth / 2, y - rectHeight / 2, maxWidth, rectHeight);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.max(16, size / 8)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  };

  const renderImageAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    // Placeholder for image
    ctx.fillStyle = 'rgba(100, 150, 255, 0.2)';
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
    ctx.lineWidth = 2;
    
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    
    // Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = `${size / 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('🖼️', x, y);
  };

  const renderVideoAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    // Placeholder for video
    ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
    ctx.lineWidth = 2;
    
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    
    // Play icon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x - size / 8, y - size / 6);
    ctx.lineTo(x + size / 6, y);
    ctx.lineTo(x - size / 8, y + size / 6);
    ctx.closePath();
    ctx.fill();
  };

  const renderModel3DAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    // 3D cube representation
    ctx.strokeStyle = 'rgba(150, 255, 150, 0.8)';
    ctx.lineWidth = 3;
    
    const cubeSize = size * 0.8;
    const offset = cubeSize / 6;
    
    // Front face
    ctx.strokeRect(x - cubeSize / 2, y - cubeSize / 2, cubeSize, cubeSize);
    
    // Back face (3D effect)
    ctx.strokeRect(x - cubeSize / 2 + offset, y - cubeSize / 2 - offset, cubeSize, cubeSize);
    
    // Connecting lines
    ctx.beginPath();
    ctx.moveTo(x - cubeSize / 2, y - cubeSize / 2);
    ctx.lineTo(x - cubeSize / 2 + offset, y - cubeSize / 2 - offset);
    ctx.moveTo(x + cubeSize / 2, y - cubeSize / 2);
    ctx.lineTo(x + cubeSize / 2 + offset, y - cubeSize / 2 - offset);
    ctx.moveTo(x + cubeSize / 2, y + cubeSize / 2);
    ctx.lineTo(x + cubeSize / 2 + offset, y + cubeSize / 2 - offset);
    ctx.moveTo(x - cubeSize / 2, y + cubeSize / 2);
    ctx.lineTo(x - cubeSize / 2 + offset, y + cubeSize / 2 - offset);
    ctx.stroke();
  };

  const renderWebContentAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    // Web browser representation
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    
    // Browser address bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x - size / 2 + 10, y - size / 2 + 10, size - 20, size / 6);
    
    // Content lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x - size / 2 + 15, y - size / 6 + i * 20, size - 30, 3);
    }
  };

  const renderDefaultAsset = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    // Default fallback
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `${size / 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('AR', x, y);
  };

  // Touch and Mouse Interactions
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      setArInteraction(prev => ({ ...prev, isDragging: true, isScaling: false }));
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setArInteraction(prev => ({ 
        ...prev, 
        isDragging: false, 
        isScaling: true, 
        lastTouchDistance: distance 
      }));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (arInteraction.isDragging && e.touches.length === 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const position = {
        x: (e.touches[0].clientX - rect.left) / rect.width,
        y: (e.touches[0].clientY - rect.top) / rect.height,
      };
      
      setArInteraction(prev => ({ ...prev, position }));
    } else if (arInteraction.isScaling && e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      const scaleFactor = distance / arInteraction.lastTouchDistance;
      
      setArInteraction(prev => ({
        ...prev,
        scale: Math.max(0.3, Math.min(3.0, prev.scale * scaleFactor)),
        lastTouchDistance: distance,
      }));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setArInteraction(prev => ({ ...prev, isDragging: false, isScaling: false }));
  };

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Asset Navigation
  const nextAsset = () => {
    if (!experience?.assets) return;
    setCurrentAssetIndex((prev) => 
      prev < experience.assets.length - 1 ? prev + 1 : 0
    );
  };

  const prevAsset = () => {
    if (!experience?.assets) return;
    setCurrentAssetIndex((prev) => 
      prev > 0 ? prev - 1 : experience.assets.length - 1
    );
  };

  // Stop AR Experience
  const stopAR = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setArState(prev => ({ ...prev, isActive: false }));
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-purple-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-red-200 mb-8">{arState.errorMessage}</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-semibold transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // AR Active State
  if (arState.isActive) {
    return (
      <div className="fixed inset-0 bg-black">
        {/* Video Background (if camera is active) */}
        {!arState.fallbackMode && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        )}

        {/* AR Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Minimal HUD - Top Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto z-50">
            <button
              onClick={stopAR}
              className="bg-black/50 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white font-medium hover:bg-black/70 transition-all"
            >
              ✕ Salir
            </button>

            {/* Status Indicator */}
            <div className="bg-black/50 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">
                  {arState.fallbackMode ? "Modo Viewer" : "Cámara AR"}
                </span>
              </div>
            </div>
          </div>

          {/* Asset Info */}
          <div className="absolute top-20 left-4 pointer-events-auto z-40">
            <div className="bg-black/50 backdrop-blur-sm border border-white/20 p-4 rounded-2xl max-w-sm">
              <div className="text-white">
                <h3 className="font-semibold text-lg mb-1">
                  {experience?.assets[currentAssetIndex]?.name}
                </h3>
                <p className="text-blue-200 text-sm">
                  {experience?.assets[currentAssetIndex]?.assetType}
                </p>
                {experience?.assets && experience.assets.length > 1 && (
                  <p className="text-white/60 text-xs mt-2">
                    {currentAssetIndex + 1} de {experience.assets.length}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Instructions - Center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
            <div className="text-center text-white">
              <div className="bg-black/30 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-2xl">
                <p className="text-sm">
                  {deviceCapabilities.isMobile ? "Toca y arrastra para mover" : "Haz clic y arrastra"}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto z-50">
            <div className="flex justify-center space-x-4">
              {/* Asset Navigation */}
              {experience?.assets && experience.assets.length > 1 && (
                <div className="bg-black/50 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full flex items-center space-x-4">
                  <button
                    onClick={prevAsset}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <span className="text-white">←</span>
                  </button>
                  <span className="text-white text-sm font-medium">
                    {currentAssetIndex + 1} / {experience.assets.length}
                  </span>
                  <button
                    onClick={nextAsset}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <span className="text-white">→</span>
                  </button>
                </div>
              )}

              {/* AR Controls */}
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full flex items-center space-x-4">
                <button
                  onClick={() => setArInteraction(prev => ({ ...prev, position: { x: 0.5, y: 0.5 }, scale: 1.0 }))}
                  className="text-white text-sm hover:text-blue-300 transition-colors"
                >
                  🎯 Centrar
                </button>
                <button
                  onClick={() => setArInteraction(prev => ({ ...prev, scale: Math.min(3.0, prev.scale * 1.2) }))}
                  className="text-white text-sm hover:text-green-300 transition-colors"
                >
                  🔍 +
                </button>
                <button
                  onClick={() => setArInteraction(prev => ({ ...prev, scale: Math.max(0.3, prev.scale * 0.8) }))}
                  className="text-white text-sm hover:text-orange-300 transition-colors"
                >
                  🔎 -
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Entry Screen - Clean and Professional
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={handleBack}
          className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white hover:bg-white/20 transition-all"
        >
          ← Volver
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center text-white max-w-lg">
          {/* Experience Info */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {experience?.title}
            </h1>
            {experience?.description && (
              <p className="text-blue-200/80 text-lg leading-relaxed mb-6">
                {experience.description}
              </p>
            )}
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-lg font-medium mb-3">Contenido disponible</div>
              <div className="text-3xl mb-2">{experience?.assets?.length || 0}</div>
              <div className="text-sm text-blue-200/70">
                {experience?.assets && experience.assets.length > 0
                  ? `Tipos: ${[...new Set(experience.assets.map(a => a.assetType))].join(", ")}`
                  : "Sin contenido"}
              </div>
            </div>
          </div>

          {/* Device Status */}
          <div className="mb-8 space-y-3">
            <div className={`flex items-center justify-center space-x-3 p-3 rounded-xl border ${
              deviceCapabilities.hasCamera 
                ? "bg-green-900/20 border-green-500/30 text-green-300"
                : "bg-amber-900/20 border-amber-500/30 text-amber-300"
            }`}>
              <span className="text-xl">{deviceCapabilities.hasCamera ? "📹" : "⚠️"}</span>
              <span className="text-sm">
                {deviceCapabilities.hasCamera 
                  ? "Cámara disponible" 
                  : deviceCapabilities.isSecureContext 
                    ? "Cámara no soportada" 
                    : "Se requiere HTTPS para cámara"
                }
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {deviceCapabilities.hasCamera && (
              <button
                onClick={() => startARExperience(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                📱 Iniciar con Cámara
              </button>
            )}
            
            <button
              onClick={() => startARExperience(false)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
            >
              🔮 Modo Viewer
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="text-sm text-blue-200/70">
              <div className="font-medium mb-3">💡 Instrucciones</div>
              <div className="space-y-2 text-left">
                <div>• Modo Cámara: Contenido AR sobre la realidad</div>
                <div>• Modo Viewer: Visualización en espacio virtual</div>
                <div>• {deviceCapabilities.isMobile ? "Toca y arrastra" : "Haz clic y arrastra"} para interactuar</div>
                <div>• Usa gestos de pellizco para escalar (móvil)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}