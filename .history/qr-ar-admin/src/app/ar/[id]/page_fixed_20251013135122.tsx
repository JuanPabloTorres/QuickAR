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
  isStartingAR: boolean;
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
    isStartingAR: false,
  });

  // Device Capabilities
  const [deviceCapabilities, setDeviceCapabilities] =
    useState<DeviceCapabilities>({
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

  // Check camera capabilities on component mount
  useEffect(() => {
    const checkCameraSupport = () => {
      const isSecure = window.isSecureContext;
      const hasMediaDevices = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      setDeviceCapabilities((prev) => ({
        ...prev,
        hasCamera: isSecure && hasMediaDevices,
        isSecureContext: isSecure,
        isMobile,
        hasAR: hasMediaDevices && isSecure,
      }));
    };

    checkCameraSupport();
  }, []);

  // Load experience data
  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) return;

      setArState((prev) => ({ ...prev, isLoading: true, hasError: false }));

      try {
        const experienceData = isNaN(Number(experienceId))
          ? await getExperienceBySlug(experienceId)
          : await getExperienceById(Number(experienceId));

        if (!experienceData) {
          throw new Error("Experience not found");
        }

        const normalized = normalizeExperience(experienceData);
        setExperience(normalized);
      } catch (error) {
        console.error("Error loading experience:", error);
        setArState((prev) => ({
          ...prev,
          hasError: true,
          errorMessage:
            error instanceof Error ? error.message : "Failed to load experience",
        }));
      } finally {
        setArState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadExperience();
  }, [experienceId]);

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  const startARCamera = async () => {
    if (arState.isStartingAR) {
      return;
    }

    try {
      setArState((prev) => ({ ...prev, isStartingAR: true, hasError: false, errorMessage: "" }));

      // Check browser support first
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported in this browser");
      }

      if (!window.isSecureContext) {
        throw new Error(
          "Camera access requires HTTPS. Please use a secure connection."
        );
      }

      // Request camera access with high-quality video for AR
      const constraints = {
        video: {
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30 },
          facingMode: deviceCapabilities.isMobile ? "environment" : "user",
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      if (!mediaStream) {
        throw new Error("Failed to get camera stream");
      }

      setMediaStream(mediaStream);

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setArState((prev) => ({ ...prev, isActive: true }));

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setArState((prev) => ({ ...prev, isStartingAR: false }));
              })
              .catch((playError) => {
                console.error("Error playing video:", playError);
                let errorMessage = "Could not start camera playback";
                if (playError.name === "NotAllowedError") {
                  errorMessage =
                    "Camera access denied. Please allow camera access and try again.";
                } else if (playError.name === "AbortError") {
                  errorMessage = "Camera access was interrupted";
                }
                setArState((prev) => ({ ...prev, isStartingAR: false, hasError: true, errorMessage }));
              });
          }
        };

        videoRef.current.onerror = () => {
          setArState((prev) => ({
            ...prev,
            hasError: true,
            errorMessage: "Error interno: elemento de video no se pudo crear",
            isActive: false,
            isStartingAR: false,
          }));
        };
      } else {
        setArState((prev) => ({ ...prev, isStartingAR: false }));
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Could not access camera";

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera access denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on this device";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Camera access is not supported on this device";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setArState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage,
        isStartingAR: false,
      }));
    }
  };

  // Touch event handlers for AR interaction
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      setArInteraction((prev) => ({ ...prev, isDragging: true, isScaling: false }));
    } else if (e.touches.length === 2) {
      setArInteraction((prev) => ({ ...prev, isScaling: true, isDragging: false, lastTouchDistance: getTouchDistance(e.touches) }));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (arInteraction.isDragging && e.touches.length === 1) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const pos = getRelativePosition(e.touches[0], rect);
        setArInteraction((prev) => ({ ...prev, position: pos }));
      }
    } else if (arInteraction.isScaling && e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      const scaleFactor = distance / arInteraction.lastTouchDistance;
      setArInteraction((prev) => ({
        ...prev,
        scale: Math.max(0.3, Math.min(3.0, prev.scale * scaleFactor)),
        lastTouchDistance: distance,
      }));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setArInteraction((prev) => ({ ...prev, isDragging: false, isScaling: false }));
  };

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setArInteraction((prev) => ({ ...prev, isDragging: true }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (arInteraction.isDragging) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const pos = getRelativePosition(e, rect);
        setArInteraction((prev) => ({ ...prev, position: pos }));
      }
    }
  };

  const handleMouseUp = () => {
    setArInteraction((prev) => ({ ...prev, isDragging: false }));
  };

  // AR rendering loop
  useEffect(() => {
    let animationId: number;

    const renderARFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Only render if video is ready and AR is active
      if (video.readyState >= 2 && arState.isActive) {
        // Set canvas size to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Draw video feed
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw AR content if experience is loaded
        if (experience && experience.assets && experience.assets.length > 0) {
          const currentAsset = experience.assets[currentAssetIndex];
          if (currentAsset) {
            renderARAsset(
              ctx,
              currentAsset,
              canvas.width,
              canvas.height,
              arInteraction.position,
              deviceCapabilities.isMobile,
              arInteraction.scale
            );
          }
        }

        // Draw UI elements
        renderARUI(ctx, canvas.width, canvas.height);
      }

      // Continue animation loop
      if (arState.isActive) {
        animationId = requestAnimationFrame(renderARFrame);
      }
    };

    if (arState.isActive) {
      renderARFrame();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    arState.isActive,
    experience,
    currentAssetIndex,
    arInteraction.position,
    arInteraction.scale,
    arInteraction.isDragging,
    arInteraction.isScaling,
    deviceCapabilities.isMobile,
  ]);

  // Helper functions
  const getTouchDistance = (touches: TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getRelativePosition = (
    touch: Touch | React.MouseEvent,
    rect: DOMRect
  ): { x: number; y: number } => {
    const clientX = "clientX" in touch ? touch.clientX : touch.clientX;
    const clientY = "clientY" in touch ? touch.clientY : touch.clientY;
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };

  // AR Asset Rendering
  const renderARAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    width: number,
    height: number,
    position: { x: number; y: number },
    isMobile: boolean,
    scale: number
  ) => {
    // Calculate position and scale
    const arX = width * position.x;
    const arY = height * position.y;
    const baseSize = isMobile ? 80 : 120;
    const scaledSize = baseSize * scale;

    // Create AR object with metadata
    const arObject = {
      x: arX,
      y: arY,
      size: scaledSize,
      position: position,
      scale: scale,
      asset: asset,
    };

    // Render based on asset type
    switch (asset.assetType) {
      case "image":
        renderImageAsset(ctx, arObject, asset);
        break;
      case "video":
        renderVideoAsset(ctx, arObject, asset);
        break;
      case "3d_model":
        render3DModelPlaceholder(ctx, arObject, asset);
        break;
      case "audio":
        renderAudioAsset(ctx, arObject, asset);
        break;
      case "text":
        renderTextAsset(ctx, arObject, asset);
        break;
      default:
        renderDefaultAsset(ctx, arObject, asset);
    }
  };

  const renderImageAsset = (
    ctx: CanvasRenderingContext2D,
    arObject: any,
    asset: Asset
  ) => {
    const { x, y, size } = arObject;

    // Draw image placeholder with border
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);

    // Draw image icon
    ctx.fillStyle = "#3b82f6";
    ctx.font = `${Math.max(16, size * 0.3)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("📷", x, y + size * 0.1);

    // Draw asset name
    ctx.font = `${Math.max(12, size * 0.15)}px Arial`;
    ctx.fillText(
      asset.assetContent || "Image Asset",
      x,
      y + size * 0.4
    );
  };

  const renderVideoAsset = (
    ctx: CanvasRenderingContext2D,
    arObject: any,
    asset: Asset
  ) => {
    const { x, y, size } = arObject;

    // Draw video placeholder
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(x - size / 2, y - size / 2, size, size * 0.75);

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size * 0.75);

    // Draw play icon
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    const playSize = size * 0.2;
    ctx.moveTo(x - playSize / 2, y - playSize / 2);
    ctx.lineTo(x - playSize / 2, y + playSize / 2);
    ctx.lineTo(x + playSize / 2, y);
    ctx.closePath();
    ctx.fill();
  };

  const render3DModelPlaceholder = (
    ctx: CanvasRenderingContext2D,
    arObject: any,
    asset: Asset
  ) => {
    const { x, y, size, scale } = arObject;

    // Draw 3D model placeholder with depth effect
    ctx.fillStyle = "rgba(147, 51, 234, 0.3)";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    // Create 3D effect with multiple layers
    ctx.fillStyle = "rgba(147, 51, 234, 0.6)";
    ctx.fillRect(x - size / 2 + 10, y - size / 2 + 10, size - 20, size - 20);

    ctx.fillStyle = "rgba(147, 51, 234, 0.9)";
    ctx.fillRect(x - size / 2 + 20, y - size / 2 + 20, size - 40, size - 40);

    // Draw wireframe effect
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Draw cube wireframe
    const cubeSize = size * 0.4;
    ctx.rect(x - cubeSize / 2, y - cubeSize / 2, cubeSize, cubeSize);
    ctx.moveTo(x - cubeSize / 2, y - cubeSize / 2);
    ctx.lineTo(x - cubeSize / 2 + 15, y - cubeSize / 2 - 15);
    ctx.moveTo(x + cubeSize / 2, y - cubeSize / 2);
    ctx.lineTo(x + cubeSize / 2 + 15, y - cubeSize / 2 - 15);
    ctx.moveTo(x - cubeSize / 2, y + cubeSize / 2);
    ctx.lineTo(x - cubeSize / 2 + 15, y + cubeSize / 2 - 15);
    ctx.moveTo(x + cubeSize / 2, y + cubeSize / 2);
    ctx.lineTo(x + cubeSize / 2 + 15, y + cubeSize / 2 - 15);
    ctx.stroke();
  };

  const renderAudioAsset = (
    ctx: CanvasRenderingContext2D,
    arObject: any,
    asset: Asset
  ) => {
    const { x, y, size, scale } = arObject;

    // Draw audio visualizer circle
    ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Draw sound waves
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(x, y, (size / 2) + (i * 15), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw audio icon
    ctx.fillStyle = "#22c55e";
    ctx.font = `${Math.max(16, size * 0.3)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("🔊", x, y + size * 0.1);
  };

  const renderTextAsset = (
    ctx: CanvasRenderingContext2D,
    arObject: any,
    asset: Asset
  ) => {
    const { x, y, scale } = arObject;

    // Calculate text dimensions
    const fontSize = Math.max(16, 24 * scale);
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";

    // Measure text
    const textWidth =
      ctx.measureText(asset.assetContent).width + 40 * scale;
    const textHeight = 80 * scale;

    // Draw text background
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.fillRect(
      x - textWidth / 2,
      y - textHeight / 2,
      textWidth,
      textHeight
    );

    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(
      x - textWidth / 2,
      y - textHeight / 2,
      textWidth,
      textHeight
    );

    // Draw text content
    ctx.fillStyle = "#1f2937";
    ctx.fillText(asset.assetContent || "Text Content", x, y + fontSize * 0.3);
  };

  const renderDefaultAsset = (
    ctx: CanvasRenderingContext2D,
    arObject: any,
    asset: Asset
  ) => {
    const { x, y, size, scale } = arObject;

    // Draw default asset placeholder
    ctx.fillStyle = "rgba(107, 114, 128, 0.8)";
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);

    // Draw question mark
    ctx.fillStyle = "#ffffff";
    ctx.font = `${Math.max(20, size * 0.4)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("?", x, y + size * 0.15);
  };

  // AR UI Rendering
  const renderARUI = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Draw AR crosshair at center
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY);
    ctx.lineTo(centerX + 20, centerY);
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();

    // Draw corner frame indicators
    const cornerSize = 30;
    const margin = 20;

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

    // Draw interaction feedback
    const arX = width * arInteraction.position.x;
    const arY = height * arInteraction.position.y;

    if (arInteraction.isDragging || arInteraction.isScaling) {
      // Draw selection circle
      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.arc(arX, arY, 80 * arInteraction.scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  // Navigation functions
  const nextAsset = () => {
    if (experience?.assets && experience.assets.length > 1) {
      setCurrentAssetIndex((prev) =>
        prev >= experience.assets.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousAsset = () => {
    if (experience?.assets && experience.assets.length > 1) {
      setCurrentAssetIndex((prev) =>
        prev <= 0 ? experience.assets.length - 1 : prev - 1
      );
    }
  };

  const stopAR = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setArState((prev) => ({ ...prev, isActive: false }));
  };

  // Error state
  if (arState.hasError && !arState.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-300 mb-6 max-w-md">{arState.errorMessage}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (arState.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-xl">Cargando experiencia AR...</p>
        </div>
      </div>
    );
  }

  // No experience found
  if (!experience) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-4">Experiencia no encontrada</h1>
          <p className="text-gray-300 mb-6">
            La experiencia AR que buscas no existe o ha sido eliminada.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Main AR Experience UI
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* AR Camera View */}
      {arState.isActive ? (
        <div className="relative w-full h-screen">
          {/* Video element (hidden, used as source) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-0"
          />

          {/* AR Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ touchAction: "none" }}
          />

          {/* AR Controls Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center justify-between">
                <button
                  onClick={stopAR}
                  className="bg-red-600/80 hover:bg-red-700 text-white p-2 rounded-full backdrop-blur-sm pointer-events-auto transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
                <div className="text-center">
                  <h1 className="text-lg font-bold">{experience.title}</h1>
                  <p className="text-sm text-gray-300">
                    {currentAssetIndex + 1} / {experience.assets.length}
                  </p>
                </div>
                <div className="w-10 h-10" /> {/* Spacer */}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center justify-center space-x-4">
                {experience.assets.length > 1 && (
                  <>
                    <button
                      onClick={previousAsset}
                      className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm pointer-events-auto transition-colors"
                    >
                      <span className="text-xl">←</span>
                    </button>
                    <button
                      onClick={nextAsset}
                      className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm pointer-events-auto transition-colors"
                    >
                      <span className="text-xl">→</span>
                    </button>
                  </>
                )}
              </div>

              {/* Current Asset Info */}
              {experience.assets[currentAssetIndex] && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-300">
                    {experience.assets[currentAssetIndex].assetType.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Toca y arrastra para mover • Pellizca para escalar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Pre-AR Landing Screen */
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="text-center max-w-md">
            {/* Experience Info */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">{experience.title}</h1>
              {experience.description && (
                <p className="text-gray-300 mb-4">{experience.description}</p>
              )}
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <span>📱 {experience.assets.length} recursos</span>
                <span>🌐 Modo AR</span>
              </div>
            </div>

            {/* Device Compatibility Check */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Compatibilidad</h3>
              <div className="space-y-2 text-sm">
                <div
                  className={`flex items-center justify-between ${
                    deviceCapabilities.hasCamera
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  <span>Cámara</span>
                  <span>{deviceCapabilities.hasCamera ? "✓" : "✗"}</span>
                </div>
                <div
                  className={`flex items-center justify-between ${
                    deviceCapabilities.isSecureContext
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  <span>Conexión segura</span>
                  <span>{deviceCapabilities.isSecureContext ? "✓" : "✗"}</span>
                </div>
                <div
                  className={`flex items-center justify-between ${
                    deviceCapabilities.isMobile
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  <span>Dispositivo móvil</span>
                  <span>
                    {deviceCapabilities.isMobile ? "✓" : "Desktop"}
                  </span>
                </div>
              </div>
            </div>

            {/* Start AR Button */}
            {deviceCapabilities.hasCamera ? (
              <button
                onClick={startARCamera}
                disabled={arState.isStartingAR}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors w-full"
              >
                {arState.isStartingAR ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">🔄</span>
                    Iniciando AR...
                  </span>
                ) : (
                  "🚀 Iniciar AR"
                )}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-red-400 mb-4">
                  Tu dispositivo no es compatible con AR
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Volver al inicio
                </button>
              </div>
            )}

            {/* Error Display */}
            {arState.hasError && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{arState.errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}