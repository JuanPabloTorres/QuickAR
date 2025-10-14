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
      if (!experienceId) {
        setArState((prev) => ({
          ...prev,
          hasError: true,
          errorMessage: "ID de experiencia no válido",
          isLoading: false,
        }));
        return;
      }

      try {
        console.log("🔄 Loading experience:", experienceId);

        setArState((prev) => ({ ...prev, isLoading: true }));

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
          setArState((prev) => ({
            ...prev,
            hasError: true,
            errorMessage:
              "Error de conexión. Verifica que el servidor API esté ejecutándose en http://localhost:5001",
            isLoading: false,
          }));
          return;
        }

        if (response?.success && response.data) {
          const normalizedExperience = normalizeExperience(response.data);
          setExperience(normalizedExperience);
          setArState((prev) => ({ ...prev, isLoading: false }));
          console.log("✅ Experience loaded:", normalizedExperience);
        } else {
          setArState((prev) => ({
            ...prev,
            hasError: true,
            errorMessage: "Experiencia no encontrada",
            isLoading: false,
          }));
        }
      } catch (err) {
        console.error("❌ Error loading experience:", err);
        setArState((prev) => ({
          ...prev,
          hasError: true,
          errorMessage: "Error al cargar la experiencia",
          isLoading: false,
        }));
      }
    };

    loadExperience();
  }, [experienceId]);

  // Auto-start AR rendering when AR becomes active
  useEffect(() => {
    if (arState.isActive && canvasRef.current && videoRef.current) {
      console.log("🚀 Auto-starting AR rendering...");
      startARRendering();
    }
  }, [arState.isActive]);

  // Monitor AR interaction changes
  useEffect(() => {
    console.log("🔄 AR Interaction state changed:", {
      position: arInteraction.position,
      scale: arInteraction.scale,
      isDragging: arInteraction.isDragging,
      isScaling: arInteraction.isScaling,
    });
  }, [arInteraction]);

  // Start AR WITHOUT camera for testing
  const startARTest = () => {
    console.log("🚀 Starting AR TEST MODE (no camera)...");
    setArState((prev) => ({ ...prev, isActive: true, fallbackMode: true }));

    // Wait a bit for React to render, then start rendering
    setTimeout(() => {
      startARRendering();
    }, 100);
  };

  // Start AR with camera
  const startAR = async () => {
    try {
      console.log("🚀 Starting REAL AR with camera...");

      // Check if running in a secure context (HTTPS or localhost)
      console.log("🔍 Checking secure context:", {
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
      });

      // Check if mediaDevices is supported
      console.log("🔍 Checking media devices:", {
        hasNavigator: !!navigator,
        hasMediaDevices: !!navigator.mediaDevices,
        hasGetUserMedia: !!(
          navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        ),
      });

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setArState((prev) => ({
          ...prev,
          hasError: true,
          errorMessage:
            "Tu navegador no soporta acceso a la cámara. Usa Chrome, Firefox o Safari moderno.",
        }));
        return;
      }

      console.log("📹 Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log("✅ Media stream obtained:", stream);
      setMediaStream(stream);

      console.log("🎯 Activating AR mode first...");
      setArState((prev) => ({ ...prev, isActive: true }));

      console.log("⏳ Waiting for video element to render...");
      // Esperar un poco para que React renderice el componente de video
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("🎥 Setting up video element:", {
        videoRef: !!videoRef.current,
        videoElement: videoRef.current,
      });

      if (videoRef.current) {
        console.log("🔄 Assigning stream to video...");
        videoRef.current.srcObject = stream;

        console.log("▶️ Starting video playback...");
        await videoRef.current.play();

        console.log("✅ Camera opened successfully!");
        console.log("🎨 Starting AR rendering...");
        startARRendering();
      } else {
        console.error("❌ Video ref is still null after waiting!");
        console.log("🔄 Trying with longer wait...");

        // Intentar esperar un poco más
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (videoRef.current) {
          console.log("✅ Video element found after second wait!");
          (videoRef.current as HTMLVideoElement).srcObject = stream;
          await (videoRef.current as HTMLVideoElement).play();
          startARRendering();
        } else {
          console.error("❌ Video element never appeared!");
          setArState((prev) => ({
            ...prev,
            hasError: true,
            errorMessage: "Error interno: elemento de video no se pudo crear",
            isActive: false,
          }));
        }
      }
    } catch (error: any) {
      console.error("❌ Camera access error:", error);

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

      setArState((prev) => ({
        ...prev,
        hasError: true,
        errorMessage,
      }));
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
    if (!canvas) {
      console.warn("⚠️ Canvas not available for position calculation");
      return { x: 0.5, y: 0.5 };
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    console.log("📍 Position update:", {
      clientX,
      clientY,
      rect,
      result: { x, y },
    });
    return { x, y };
  };

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
        setArInteraction((prev) => ({
          ...prev,
          scale: newScale,
          lastTouchDistance: distance,
        }));
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
