/**
 * QUICK AR - Clean Professional AR Experience
 */

"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Asset, Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface ARState {
  isActive: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
}

interface ARObject {
  x: number; // 0-1 relative position
  y: number; // 0-1 relative position
  scale: number; // 0.5-3.0
  isDragging: boolean;
}

export default function ARExperience() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;

  // Core state
  const [experience, setExperience] = useState<Experience | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [arState, setArState] = useState<ARState>({
    isActive: false,
    isLoading: true,
    hasError: false,
    errorMessage: "",
  });
  
  // AR Object state - simplified
  const [arObject, setArObject] = useState<ARObject>({
    x: 0.5,
    y: 0.5,
    scale: 1.0,
    isDragging: false,
  });

  // Device capabilities
  const [hasCamera, setHasCamera] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Load experience
  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) return;

      try {
        setArState(prev => ({ ...prev, isLoading: true }));
        
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(experienceId);
        const response = isUuid 
          ? await getExperienceById(experienceId)
          : await getExperienceBySlug(experienceId);

        if (response?.success && response.data) {
          const normalized = normalizeExperience(response.data);
          setExperience(normalized);
          setArState(prev => ({ ...prev, isLoading: false }));
        } else {
          throw new Error("Experience not found");
        }
      } catch (error) {
        setArState(prev => ({
          ...prev,
          hasError: true,
          errorMessage: "Error loading experience",
          isLoading: false,
        }));
      }
    };

    loadExperience();
  }, [experienceId]);

  // Check camera capabilities
  useEffect(() => {
    const checkCamera = () => {
      const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const isSecure = window.isSecureContext;
      setHasCamera(hasMediaDevices && isSecure);
    };
    checkCamera();
  }, []);

  // Start AR Camera
  const startAR = async () => {
    try {
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setArState(prev => ({ ...prev, isActive: true }));
        startRendering();
      }
    } catch (error: any) {
      setArState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: "Camera access denied or unavailable",
      }));
    }
  };

  // Stop AR
  const stopAR = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setArState(prev => ({ ...prev, isActive: false }));
  };

  // AR Rendering Loop
  const startRendering = () => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas || !arState.isActive) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw AR content
      if (experience && experience.assets[currentAssetIndex]) {
        drawARContent(ctx, canvas.width, canvas.height);
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // Draw AR Content
  const drawARContent = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const asset = experience?.assets[currentAssetIndex];
    if (!asset) return;

    // Calculate position
    const x = width * arObject.x;
    const y = height * arObject.y;
    const size = 120 * arObject.scale;

    ctx.save();

    // Draw asset based on type
    switch (asset.assetType) {
      case "message":
        drawMessage(ctx, asset, x, y, size);
        break;
      case "image":
        drawImage(ctx, asset, x, y, size);
        break;
      case "video":
        drawVideo(ctx, asset, x, y, size);
        break;
      case "model3d":
        draw3DModel(ctx, asset, x, y, size);
        break;
      default:
        drawMessage(ctx, asset, x, y, size);
        break;
    }

    // Draw interaction indicator
    if (arObject.isDragging) {
      ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  // Asset drawing functions
  const drawMessage = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    const text = asset.assetContent || asset.name || "Message";
    const padding = 20;
    const maxWidth = Math.max(200, size * 2);
    const height = Math.max(60, size * 0.8);

    // Background
    ctx.fillStyle = "rgba(30, 144, 255, 0.9)";
    ctx.fillRect(x - maxWidth/2, y - height/2, maxWidth, height);

    // Border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - maxWidth/2, y - height/2, maxWidth, height);

    // Text
    ctx.fillStyle = "white";
    ctx.font = `bold ${Math.max(16, size/8)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  };

  const drawImage = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    // Placeholder for image
    ctx.fillStyle = "rgba(100, 200, 100, 0.8)";
    ctx.fillRect(x - size/2, y - size/2, size, size);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size/2, y - size/2, size, size);
    
    ctx.fillStyle = "white";
    ctx.font = `bold ${size/6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("📷 IMAGE", x, y);
  };

  const drawVideo = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    // Video placeholder
    ctx.fillStyle = "rgba(255, 100, 100, 0.8)";
    ctx.fillRect(x - size/2, y - size/2, size, size * 0.75);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size/2, y - size/2, size, size * 0.75);
    
    // Play button
    ctx.fillStyle = "white";
    ctx.beginPath();
    const playSize = size * 0.2;
    ctx.moveTo(x - playSize/2, y - playSize/2);
    ctx.lineTo(x - playSize/2, y + playSize/2);
    ctx.lineTo(x + playSize/2, y);
    ctx.closePath();
    ctx.fill();
  };

  const draw3DModel = (ctx: CanvasRenderingContext2D, asset: Asset, x: number, y: number, size: number) => {
    // 3D Model placeholder with cube
    ctx.fillStyle = "rgba(147, 51, 234, 0.8)";
    ctx.fillRect(x - size/2, y - size/2, size, size);
    
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size/2, y - size/2, size, size);
    
    // Cube wireframe
    const cubeSize = size * 0.4;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - cubeSize/2, y - cubeSize/2, cubeSize, cubeSize);
    
    // 3D effect lines
    ctx.beginPath();
    ctx.moveTo(x - cubeSize/2, y - cubeSize/2);
    ctx.lineTo(x - cubeSize/2 + 10, y - cubeSize/2 - 10);
    ctx.moveTo(x + cubeSize/2, y - cubeSize/2);
    ctx.lineTo(x + cubeSize/2 + 10, y - cubeSize/2 - 10);
    ctx.moveTo(x - cubeSize/2, y + cubeSize/2);
    ctx.lineTo(x - cubeSize/2 + 10, y + cubeSize/2 - 10);
    ctx.moveTo(x + cubeSize/2, y + cubeSize/2);
    ctx.lineTo(x + cubeSize/2 + 10, y + cubeSize/2 - 10);
    ctx.stroke();
  };

  // Event Handlers - Simplified
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setArObject(prev => ({
      ...prev,
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      isDragging: true,
    }));

    canvas.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!arObject.isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setArObject(prev => ({
      ...prev,
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    }));
  }, [arObject.isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setArObject(prev => ({ ...prev, isDragging: false }));
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }
  }, []);

  // Navigation
  const nextAsset = () => {
    if (experience?.assets) {
      setCurrentAssetIndex(prev => 
        prev >= experience.assets.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevAsset = () => {
    if (experience?.assets) {
      setCurrentAssetIndex(prev => 
        prev <= 0 ? experience.assets.length - 1 : prev - 1
      );
    }
  };

  // Start rendering when AR becomes active
  useEffect(() => {
    if (arState.isActive) {
      startRendering();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [arState.isActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAR();
    };
  }, []);

  // Loading state
  if (arState.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-xl">Loading AR Experience...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (arState.hasError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-300 mb-6">{arState.errorMessage}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No experience
  if (!experience) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-4">Experience Not Found</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // AR Active State
  if (arState.isActive) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* AR Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* UI Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto z-50">
            <button
              onClick={stopAR}
              className="bg-red-600/90 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold backdrop-blur-sm transition-colors"
            >
              ✕ Exit AR
            </button>

            <div className="text-center bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="text-white font-medium">
                {experience.assets[currentAssetIndex].name}
              </div>
              <div className="text-blue-200 text-sm">
                {currentAssetIndex + 1} / {experience.assets.length}
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto z-50">
            <div className="flex justify-center space-x-4">
              {experience.assets.length > 1 && (
                <>
                  <button
                    onClick={prevAsset}
                    className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextAsset}
                    className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
                  >
                    →
                  </button>
                </>
              )}
              
              <button
                onClick={() => setArObject(prev => ({ ...prev, x: 0.5, y: 0.5, scale: 1.0 }))}
                className="bg-blue-600/80 hover:bg-blue-700 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
              >
                🎯 Center
              </button>

              <button
                onClick={() => setArObject(prev => ({ ...prev, scale: Math.min(3.0, prev.scale * 1.2) }))}
                className="bg-green-600/80 hover:bg-green-700 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
              >
                🔍 +
              </button>

              <button
                onClick={() => setArObject(prev => ({ ...prev, scale: Math.max(0.5, prev.scale * 0.8) }))}
                className="bg-orange-600/80 hover:bg-orange-700 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
              >
                🔍 -
              </button>
            </div>

            {/* Instructions */}
            <div className="text-center mt-4">
              <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                <div className="text-white text-sm">
                  👆 Tap and drag to move • Use buttons to scale
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-AR Landing
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{experience.title}</h1>
          {experience.description && (
            <p className="text-gray-300 mb-4">{experience.description}</p>
          )}
          <div className="text-sm text-gray-400">
            📱 {experience.assets.length} AR assets
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Device Status</h3>
          <div className="space-y-2 text-sm">
            <div className={`flex justify-between ${hasCamera ? "text-green-400" : "text-red-400"}`}>
              <span>Camera Access</span>
              <span>{hasCamera ? "✓ Ready" : "✗ Unavailable"}</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>HTTPS Secure</span>
              <span>✓ Secure</span>
            </div>
          </div>
        </div>

        {hasCamera ? (
          <button
            onClick={startAR}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors w-full"
          >
            🚀 Start AR Experience
          </button>
        ) : (
          <div className="text-center">
            <p className="text-red-400 mb-4">Camera access not available</p>
            <p className="text-gray-400 text-sm mb-4">
              Please ensure you're using HTTPS and grant camera permissions
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}