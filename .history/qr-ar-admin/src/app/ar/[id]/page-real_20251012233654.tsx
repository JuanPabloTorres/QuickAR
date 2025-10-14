/**
 * Real AR Experience Page - FUNCTIONAL VERSION
 * Opens real camera and shows digital content in the real world
 */

"use client";

import { Experience, Asset } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";

export default function RealARExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  
  // AR refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [arSupported, setArSupported] = useState<boolean | null>(null);

  const experienceId = params.id as string;

  // Load experience
  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) {
        setError("ID de experiencia no válido");
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔄 Loading experience:", experienceId);
        
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(experienceId);
        
        let response;
        try {
          if (isUuid) {
            response = await getExperienceById(experienceId);
          } else {
            response = await getExperienceBySlug(experienceId);
          }
        } catch (fetchError) {
          console.error("Network error:", fetchError);
          setError("Error de conexión. Verifica tu internet y que el servidor esté ejecutándose.");
          setIsLoading(false);
          return;
        }

        if (response?.success && response.data) {
          const normalizedExperience = normalizeExperience(response.data);
          setExperience(normalizedExperience);
          console.log("✅ Experience loaded:", normalizedExperience);
        } else {
          setError("Experiencia no encontrada");
        }
      } catch (err) {
        console.error("❌ Error loading experience:", err);
        setError("Error al cargar la experiencia");
      } finally {
        setIsLoading(false);
      }
    };

    loadExperience();
  }, [experienceId]);

  // Check AR support
  useEffect(() => {
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await navigator.xr!.isSessionSupported('immersive-ar');
          setArSupported(supported);
          console.log("🥽 WebXR AR supported:", supported);
        } catch (e) {
          console.log("WebXR AR not available, using camera fallback");
          setArSupported(false);
        }
      } else {
        console.log("WebXR not available, using camera fallback");
        setArSupported(false);
      }
    };

    checkARSupport();
  }, []);

  // Start AR experience
  const startAR = async () => {
    try {
      console.log("🚀 Starting AR experience...");

      if (arSupported) {
        // Try WebXR first
        await startWebXRAR();
      } else {
        // Fallback to camera + overlay
        await startCameraAR();
      }
    } catch (error) {
      console.error("❌ Error starting AR:", error);
      setError("No se pudo iniciar la experiencia AR. Verifica los permisos de cámara.");
    }
  };

  // WebXR AR implementation
  const startWebXRAR = async () => {
    if (!navigator.xr) throw new Error("WebXR not available");

    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['local', 'hit-test'],
      optionalFeatures: ['dom-overlay', 'light-estimation']
    });

    console.log("✅ WebXR AR session started");
    setIsARActive(true);

    // Set up WebXR rendering
    if (canvasRef.current) {
      const gl = canvasRef.current.getContext('webgl', { xrCompatible: true });
      if (gl) {
        await gl.makeXRCompatible();
        const layer = new XRWebGLLayer(session, gl);
        session.updateRenderState({ baseLayer: layer });

        // Start render loop
        const onXRFrame = (time: number, frame: XRFrame) => {
          session.requestAnimationFrame(onXRFrame);
          renderARContent(frame, gl, session);
        };
        session.requestAnimationFrame(onXRFrame);
      }
    }
  };

  // Camera AR fallback implementation
  const startCameraAR = async () => {
    console.log("📱 Starting camera AR fallback...");

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        console.log("✅ Camera started successfully");
        setIsARActive(true);

        // Start AR overlay rendering
        startAROverlay();
      }
    } catch (error) {
      console.error("❌ Camera access denied:", error);
      throw new Error("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  // AR overlay rendering for camera fallback
  const startAROverlay = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderFrame = () => {
      if (video.readyState >= 2) {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw AR content overlay
        drawARContent(ctx, canvas.width, canvas.height);
      }

      if (isARActive) {
        requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
  };

  // Draw AR content on canvas
  const drawARContent = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const currentAsset = experience?.assets[currentAssetIndex];
    if (!currentAsset) return;

    // Calculate center position
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw based on asset type
    switch (currentAsset.assetType) {
      case 'message':
        drawTextAR(ctx, currentAsset, centerX, centerY);
        break;
      case 'image':
        drawImageAR(ctx, currentAsset, centerX, centerY);
        break;
      case 'model3d':
        draw3DPlaceholder(ctx, currentAsset, centerX, centerY);
        break;
      default:
        drawDefaultAR(ctx, currentAsset, centerX, centerY);
    }

    // Draw placement indicator
    drawPlacementIndicator(ctx, centerX, centerY);
  };

  const drawTextAR = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number) => {
    if (!asset.assetContent) return;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text with outline
    ctx.strokeText(asset.assetContent, x, y);
    ctx.fillText(asset.assetContent, x, y);
    ctx.restore();
  };

  const drawImageAR = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number) => {
    // For now, draw a placeholder - in a full implementation you'd load and draw the actual image
    ctx.save();
    ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.fillRect(x - 100, y - 75, 200, 150);
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📷 ' + asset.name, x, y);
    ctx.restore();
  };

  const draw3DPlaceholder = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.9)';
    ctx.lineWidth = 3;
    
    // Draw 3D cube wireframe
    const size = 60;
    ctx.beginPath();
    ctx.rect(x - size/2, y - size/2, size, size);
    ctx.stroke();
    
    // Draw depth lines
    ctx.beginPath();
    ctx.moveTo(x - size/2, y - size/2);
    ctx.lineTo(x - size/2 + 20, y - size/2 - 20);
    ctx.moveTo(x + size/2, y - size/2);
    ctx.lineTo(x + size/2 + 20, y - size/2 - 20);
    ctx.moveTo(x + size/2, y + size/2);
    ctx.lineTo(x + size/2 + 20, y + size/2 - 20);
    ctx.moveTo(x - size/2, y + size/2);
    ctx.lineTo(x - size/2 + 20, y + size/2 - 20);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 ' + asset.name, x, y + size + 20);
    ctx.restore();
  };

  const drawDefaultAR = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number) => {
    ctx.save();
    ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✨ ' + asset.name, x, y);
    ctx.restore();
  };

  const drawPlacementIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.stroke();
    
    // Crosshair
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + 20, y);
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y + 20);
    ctx.stroke();
    
    ctx.restore();
  };

  // WebXR rendering
  const renderARContent = (frame: XRFrame, gl: WebGLRenderingContext, session: XRSession) => {
    // Basic WebXR rendering - in a full implementation you'd render 3D content here
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  };

  // Stop AR
  const stopAR = () => {
    console.log("🛑 Stopping AR...");
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setIsARActive(false);
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
      setCurrentAssetIndex((prev) => (prev - 1 + experience.assets.length) % experience.assets.length);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <div className="text-xl font-semibold">Cargando experiencia AR...</div>
          <div className="text-sm text-blue-200 mt-2">ID: {experienceId}</div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-6">❌</div>
          <div className="text-2xl font-semibold mb-4">Error</div>
          <div className="text-blue-200 mb-8">{error}</div>
          
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
          <div className="text-xl font-semibold">No se pudo cargar la experiencia</div>
        </div>
      </div>
    );
  }

  // AR Active view
  if (isARActive) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* Camera video (hidden for WebXR, visible for camera fallback) */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${arSupported ? 'hidden' : 'block'}`}
          playsInline
          muted
        />
        
        {/* AR Canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* AR Controls */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
            <button
              onClick={stopAR}
              className="glass p-3 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              ← Salir AR
            </button>
            
            <div className="glass px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-white text-sm font-medium">
                {experience.title}
              </div>
            </div>
          </div>

          {/* Asset info */}
          <div className="absolute top-20 left-4 pointer-events-auto">
            <div className="glass p-3 rounded-lg backdrop-blur-sm">
              <div className="text-white text-sm">
                <div className="font-medium">{experience.assets[currentAssetIndex].name}</div>
                <div className="text-blue-200/80 text-xs">
                  {experience.assets[currentAssetIndex].assetType}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
            {experience.assets.length > 1 && (
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-4 glass px-4 py-2 rounded-lg backdrop-blur-sm">
                  <button
                    onClick={prevAsset}
                    className="p-2 hover:bg-white/20 rounded transition-colors"
                  >
                    <span className="text-white text-lg">←</span>
                  </button>
                  
                  <div className="text-white text-sm">
                    {currentAssetIndex + 1} / {experience.assets.length}
                  </div>
                  
                  <button
                    onClick={nextAsset}
                    className="p-2 hover:bg-white/20 rounded transition-colors"
                  >
                    <span className="text-white text-lg">→</span>
                  </button>
                </div>
              </div>
            )}

            {/* AR Status */}
            <div className="flex justify-center">
              <div className="glass p-2 rounded-lg backdrop-blur-sm">
                <div className="text-white text-xs flex items-center space-x-2">
                  <span className="text-green-400">●</span>
                  <span>{arSupported ? 'WebXR AR Activo' : 'Cámara AR Activa'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center placement guide */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="text-center text-white">
              <div className="glass px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="text-sm">Apunta hacia una superficie plana</div>
                <div className="text-xs text-blue-200">Contenido AR: {experience.assets[currentAssetIndex].name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Intro screen
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
              <div className="text-blue-200/80 leading-relaxed">
                {experience.description}
              </div>
            )}
          </div>

          <div className="mb-8 glass p-4 rounded-lg backdrop-blur-sm">
            <div className="text-lg font-medium mb-1">
              {experience.assets.length} contenido{experience.assets.length !== 1 ? 's' : ''} AR
            </div>
            <div className="text-sm text-blue-200/70">
              Tipos: {[...new Set(experience.assets.map(a => a.assetType))].join(', ')}
            </div>
          </div>

          <div className="mb-8">
            <div className={`flex items-center justify-center space-x-2 mb-4 ${
              arSupported === true ? 'text-green-400' : 
              arSupported === false ? 'text-yellow-400' : 'text-blue-400'
            }`}>
              <span className="text-2xl">
                {arSupported === true ? '✅' : 
                 arSupported === false ? '📱' : '🔄'}
              </span>
              <span>
                {arSupported === true ? 'WebXR AR disponible' : 
                 arSupported === false ? 'Cámara AR disponible' : 'Verificando capacidades...'}
              </span>
            </div>
          </div>

          <button
            onClick={startAR}
            disabled={arSupported === null}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 p-4 rounded-lg text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {arSupported === true ? '🚀 Iniciar AR Nativo' : 
             arSupported === false ? '📱 Abrir Cámara AR' : '⏳ Verificando...'}
          </button>

          <div className="mt-6 glass p-3 rounded-lg backdrop-blur-sm">
            <div className="text-xs text-blue-200/70">
              💡 {arSupported ? 'Apunta hacia superficies planas para mejores resultados' : 'Permite acceso a la cámara para ver el contenido en AR'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}