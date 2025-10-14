/**
 * FUNCTIONAL AR EXPERIENCE - Simple Working Version
 */

"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Asset, Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ARExperience() {
  const params = useParams();
  const router = useRouter();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null);
  const [isStartingAR, setIsStartingAR] = useState(false);

  // AR interaction states
  const [arObjectPosition, setArObjectPosition] = useState({ x: 0.5, y: 0.5 });
  const [arObjectScale, setArObjectScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  // AR refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const experienceId = params.id as string;

  // Check camera capabilities on component mount
  useEffect(() => {
    const checkCameraSupport = () => {
      const isSecure = window.isSecureContext;
      const hasMediaDevices = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );
      setCameraSupported(isSecure && hasMediaDevices);
    };
    checkCameraSupport();
  }, []);

  // Load experience data
  useEffect(() => {
    const loadExperience = async () => {
      try {
        setIsLoading(true);
        let response;

        if (experienceId.includes("-")) {
          response = await getExperienceBySlug(experienceId);
        } else {
          response = await getExperienceById(experienceId);
        }

        if (response.success && response.data) {
          const normalized = normalizeExperience(response.data);
          setExperience(normalized);
        } else {
          setError("No se pudo cargar la experiencia");
        }
      } catch (error) {
        console.error("Error loading experience:", error);
        setError("Error al cargar la experiencia");
      } finally {
        setIsLoading(false);
      }
    };

    if (experienceId) {
      loadExperience();
    }
  }, [experienceId]);

  // Check camera capabilities on component mount
  useEffect(() => {
    const checkCameraSupport = () => {
      const isSecure = window.isSecureContext;
      const hasMediaDevices = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );

      console.log("🔍 Camera support check:", {
        isSecure,
        hasMediaDevices,
        protocol: window.location.protocol,
        host: window.location.host,
      });

      setCameraSupported(isSecure && hasMediaDevices);

      if (!isSecure) {
        console.warn("⚠️ Not secure context - camera access may be limited");
      }

      if (!hasMediaDevices) {
        console.warn("⚠️ MediaDevices API not available");
      }
    };

    checkCameraSupport();
  }, []);

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
        } catch (fetchError) {
          console.error("❌ Network error:", fetchError);
          setError(
            "Error de conexión. Verifica que el servidor API esté ejecutándose en http://localhost:5001"
          );
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

  // Start AR with camera
  const startAR = async () => {
    if (isStartingAR) {
      console.log("⏳ AR already starting, ignoring duplicate request");
      return;
    }

    try {
      setIsStartingAR(true);
      console.log("🚀 Starting REAL AR with camera...");

      // Check if running in a secure context (HTTPS or localhost)
      console.log("🔍 Checking secure context:", {
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
      });

      if (!window.isSecureContext) {
        setError(
          "Se requiere HTTPS para acceder a la cámara. Usa https://localhost en lugar de http://localhost"
        );
        return;
      }

      // Check if mediaDevices is supported
      console.log("🔍 Checking media devices:", {
        hasNavigator: !!navigator,
        hasMediaDevices: !!navigator.mediaDevices,
        hasGetUserMedia: !!(
          navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        ),
      });

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(
          "Tu navegador no soporta acceso a la cámara. Usa Chrome, Firefox o Safari moderno."
        );
        return;
      }

      console.log("📹 Requesting camera access...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log("✅ Media stream obtained:", mediaStream);
      setStream(mediaStream);

      console.log("� Activating AR mode first...");
      setIsARActive(true);

      console.log("⏳ Waiting for video element to render...");
      // Esperar un poco para que React renderice el componente de video
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("�🎥 Setting up video element:", {
        videoRef: !!videoRef.current,
        videoElement: videoRef.current,
      });

      if (videoRef.current) {
        console.log("🔄 Assigning stream to video...");
        videoRef.current.srcObject = mediaStream;

        console.log("▶️ Starting video playback...");
        await videoRef.current.play();

        console.log("✅ Camera opened successfully!");
        console.log("� Starting AR rendering...");
        startARRendering();
        setIsStartingAR(false);
      } else {
        console.error("❌ Video ref is still null after waiting!");
        console.log("🔄 Trying with longer wait...");

        // Intentar esperar un poco más
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (videoRef.current) {
          console.log("✅ Video element found after second wait!");
          (videoRef.current as HTMLVideoElement).srcObject = mediaStream;
          await (videoRef.current as HTMLVideoElement).play();
          startARRendering();
          setIsStartingAR(false);
        } else {
          console.error("❌ Video element never appeared!");
          setError("Error interno: elemento de video no se pudo crear");
          setIsARActive(false);
          setIsStartingAR(false);
        }
      }
    } catch (error: any) {
      console.error("❌ Camera access error:", error);
      setIsStartingAR(false);

      let errorMessage = "No se pudo acceder a la cámara.";

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Permisos de cámara denegados. Permite el acceso a la cámara y recarga la página.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No se encontró ninguna cámara en tu dispositivo.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Tu navegador no soporta acceso a la cámara.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "La cámara está siendo usada por otra aplicación.";
      } else {
        errorMessage = `Error de cámara: ${
          error.message || "Error desconocido"
        }`;
      }

      setError(errorMessage);
    }
  };

  // Touch and Mouse Event Handlers for AR Interaction
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getRelativePosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0.5, y: 0.5 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      setIsDragging(true);
      setIsScaling(false);
    } else if (e.touches.length === 2) {
      setIsScaling(true);
      setIsDragging(false);
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (isDragging && e.touches.length === 1) {
      const pos = getRelativePosition(
        e.touches[0].clientX,
        e.touches[0].clientY
      );
      setArObjectPosition(pos);
    } else if (isScaling && e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      const scaleFactor = distance / lastTouchDistance;
      setArObjectScale((prev) =>
        Math.max(0.3, Math.min(3.0, prev * scaleFactor))
      );
      setLastTouchDistance(distance);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsScaling(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const pos = getRelativePosition(e.clientX, e.clientY);
      setArObjectPosition(pos);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);
  };

  // AR rendering loop
  const startARRendering = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderFrame = () => {
      if (video.readyState >= 2 && isARActive) {
        // Ajustar el canvas al tamaño del contenedor (no del video)
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Limpiar canvas (transparente para mostrar el video de fondo)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        console.log(
          "🎨 Drawing AR content - Canvas size:",
          canvas.width,
          "x",
          canvas.height
        );
        console.log(
          "🎯 AR Object position:",
          arObjectPosition,
          "scale:",
          arObjectScale
        );

        // DEBUG: Add semi-transparent background to verify canvas is visible
        ctx.fillStyle = "rgba(0, 255, 0, 0.1)"; // Very light green
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // DEBUG: Draw corner markers to verify canvas positioning
        ctx.fillStyle = "red";
        ctx.fillRect(10, 10, 20, 20); // Top-left corner
        ctx.fillRect(canvas.width - 30, 10, 20, 20); // Top-right corner
        ctx.fillRect(10, canvas.height - 30, 20, 20); // Bottom-left corner
        ctx.fillRect(canvas.width - 30, canvas.height - 30, 20, 20); // Bottom-right corner

        // Dibujar solo el contenido AR (no el video)
        drawARContent(ctx, canvas.width, canvas.height);
      }

      if (isARActive) {
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
    const padding = 20;
    const maxWidth = size * 2;
    const text = asset.assetContent || asset.name;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(x - maxWidth / 2, y - size / 2, maxWidth, size);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - maxWidth / 2, y - size / 2, maxWidth, size);

    // Text
    ctx.fillStyle = "white";
    ctx.font = `${Math.max(14, size / 8)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

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
    const lineHeight = Math.max(18, size / 6);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + index * lineHeight);
    });
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

  const drawTestCircle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) => {
    // Fallback test circle
    ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, size / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AR", x, y);
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
      hasCanvas: !!ctx 
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
      "URL:", currentAsset.assetUrl,
      "Content:", currentAsset.assetContent
    );

    // Calculate position based on relative coordinates
    const arX = width * arObjectPosition.x;
    const arY = height * arObjectPosition.y;
    const baseSize = 120; // Base size for AR content
    const scaledSize = baseSize * arObjectScale;

    console.log("📍 AR position:", {
      arX,
      arY,
      width,
      height,
      position: arObjectPosition,
      scale: arObjectScale,
      assetType: currentAsset.assetType,
    });

    ctx.save();

    // ALWAYS draw test circle first to verify rendering works
    drawTestCircle(ctx, arX, arY, scaledSize);

    // Then draw the actual content on top
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
    }    ctx.restore();

    // Draw placement target (subtle indicator)
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(arX, arY, 50 * arObjectScale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw touch area indicator when dragging
    if (isDragging || isScaling) {
      ctx.save();
      ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(arX, arY, 80 * arObjectScale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw asset content
    switch (currentAsset.assetType) {
      case "message":
        drawTextAR(ctx, currentAsset, arX, arY);
        break;
      case "image":
        drawImageAR(ctx, currentAsset, arX, arY);
        break;
      case "model3d":
        draw3DAR(ctx, currentAsset, arX, arY);
        break;
      default:
        drawDefaultAR(ctx, currentAsset, arX, arY);
    }
  };

  const drawTextAR = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number
  ) => {
    if (!asset.assetContent) return;

    ctx.save();

    // Apply scale
    const fontSize = Math.max(16, 24 * arObjectScale);
    ctx.font = `bold ${fontSize}px Arial`;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    const textWidth =
      ctx.measureText(asset.assetContent).width + 40 * arObjectScale;
    const textHeight = 80 * arObjectScale;
    ctx.fillRect(x - textWidth / 2, y - textHeight / 2, textWidth, textHeight);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2 * arObjectScale;
    ctx.strokeRect(
      x - textWidth / 2,
      y - textHeight / 2,
      textWidth,
      textHeight
    );

    // Text
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(asset.assetContent, x, y);
    ctx.restore();
  };

  const drawImageAR = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number
  ) => {
    ctx.save();

    // Apply scale
    const width = 160 * arObjectScale;
    const height = 120 * arObjectScale;
    const fontSize = Math.max(12, 16 * arObjectScale);

    // Background
    ctx.fillStyle = "rgba(100, 200, 255, 0.9)";
    ctx.fillRect(x - width / 2, y - height / 2, width, height);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3 * arObjectScale;
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);

    // Icon and text
    ctx.fillStyle = "white";
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const iconSize = Math.max(16, 24 * arObjectScale);
    ctx.font = `${iconSize}px Arial`;
    ctx.fillText("🖼️", x, y - 15 * arObjectScale);

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillText(asset.name, x, y + 15 * arObjectScale);
    ctx.restore();
  };

  const draw3DAR = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number
  ) => {
    ctx.save();

    // Apply scale
    const size = 80 * arObjectScale;
    const depth = 30 * arObjectScale;
    const fontSize = Math.max(12, 14 * arObjectScale);

    // Main cube outline
    ctx.strokeStyle = "rgba(255, 100, 100, 0.9)";
    ctx.lineWidth = 4 * arObjectScale;
    ctx.beginPath();
    ctx.rect(x - size / 2, y - size / 2, size, size);
    ctx.stroke();

    // 3D depth lines
    ctx.beginPath();
    ctx.moveTo(x - size / 2, y - size / 2);
    ctx.lineTo(x - size / 2 + depth, y - size / 2 - depth);
    ctx.moveTo(x + size / 2, y - size / 2);
    ctx.lineTo(x + size / 2 + depth, y - size / 2 - depth);
    ctx.moveTo(x + size / 2, y + size / 2);
    ctx.lineTo(x + size / 2 + depth, y + size / 2 - depth);
    ctx.moveTo(x - size / 2, y + size / 2);
    ctx.lineTo(x - size / 2 + depth, y + size / 2 - depth);
    ctx.stroke();

    // Back face
    ctx.strokeStyle = "rgba(255, 100, 100, 0.6)";
    ctx.lineWidth = 2 * arObjectScale;
    ctx.beginPath();
    ctx.rect(x - size / 2 + depth, y - size / 2 - depth, size, size);
    ctx.stroke();

    // Label
    ctx.fillStyle = "white";
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("🎯 " + asset.name, x, y + size / 2 + 25 * arObjectScale);
    ctx.restore();
  };

  const drawDefaultAR = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number
  ) => {
    ctx.save();
    ctx.fillStyle = "rgba(150, 150, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ " + asset.name, x, y);
    ctx.restore();
  };

  // Stop AR
  const stopAR = () => {
    console.log("🛑 Stopping AR...");

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
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
      setCurrentAssetIndex(
        (prev) =>
          (prev - 1 + experience.assets.length) % experience.assets.length
      );
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-brand-950 to-qr-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <div className="text-xl font-semibold">
            Cargando experiencia AR...
          </div>
          <div className="text-sm text-blue-200 mt-2">ID: {experienceId}</div>
        </div>
      </div>
    );
  }

  // Error screen
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
          <div className="text-xl font-semibold">
            No se pudo cargar la experiencia
          </div>
        </div>
      </div>
    );
  }

  // AR Active - REAL CAMERA VIEW
  if (isARActive) {
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
          className="absolute inset-0 w-full h-full pointer-events-auto z-10"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ background: "transparent" }}
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
                    Escala: {(arObjectScale * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
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

          {/* AR Content Indicator (DIV TEST) */}
          <div
            className="absolute w-16 h-16 bg-red-500 border-4 border-white rounded-full flex items-center justify-center z-30 pointer-events-none"
            style={{
              left: `${arObjectPosition.x * 100}%`,
              top: `${arObjectPosition.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${arObjectScale})`,
            }}
          >
            <span className="text-white font-bold text-xs">AR</span>
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
                {(isDragging || isScaling) && (
                  <div className="text-sm text-cyan-300 mt-2">
                    {isDragging ? "📍 Moviendo objeto" : "🔍 Cambiando tamaño"}
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
                    setArObjectPosition({ x: 0.5, y: 0.5 });
                    setArObjectScale(1.0);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
                >
                  🎯 Centrar
                </button>
                <button
                  onClick={() => setArObjectScale(1.0)}
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-sm"
                >
                  📏 Tamaño Normal
                </button>
                <button
                  onClick={() =>
                    setArObjectScale((prev) => Math.min(3.0, prev * 1.2))
                  }
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm"
                >
                  🔍 +
                </button>
                <button
                  onClick={() =>
                    setArObjectScale((prev) => Math.max(0.3, prev * 0.8))
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
          {cameraSupported !== null && (
            <div
              className={`mb-6 glass p-4 rounded-lg backdrop-blur-sm ${
                cameraSupported ? "bg-green-900/30" : "bg-red-900/30"
              }`}
            >
              <div
                className={`flex items-center space-x-2 ${
                  cameraSupported ? "text-green-400" : "text-red-400"
                }`}
              >
                <span className="text-xl">{cameraSupported ? "✅" : "❌"}</span>
                <span className="text-sm">
                  {cameraSupported
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
            disabled={cameraSupported === false || isStartingAR}
            className={`w-full p-4 rounded-lg text-white font-semibold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
              cameraSupported === false || isStartingAR
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            }`}
          >
            {cameraSupported === false
              ? "❌ Cámara no disponible"
              : isStartingAR
              ? "🔄 Iniciando cámara..."
              : "🚀 ABRIR CÁMARA AR"}
          </button>

          {/* Botón de reintentar cuando está cargando */}
          {isStartingAR && (
            <button
              onClick={() => {
                console.log("🔄 Reiniciando acceso a cámara...");
                setIsStartingAR(false);
                setError("");
                // Pequeño delay para evitar problemas de estado
                setTimeout(() => startAR(), 100);
              }}
              className="w-full mt-3 p-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
            >
              ❌ Cancelar y reintentar
            </button>
          )}

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
