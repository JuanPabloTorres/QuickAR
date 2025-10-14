"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Asset, Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// Interfaces para AR
interface ARState {
  isActive: boolean;
  hasCamera: boolean;
  isWebXRSupported: boolean;
  stream: MediaStream | null;
}

interface ARObject {
  id: string;
  asset: Asset;
  position: { x: number; y: number; z: number };
  scale: number;
  visible: boolean;
}

export default function ARExperience() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;

  // Estados principales
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados AR
  const [arState, setArState] = useState<ARState>({
    isActive: false,
    hasCamera: false,
    isWebXRSupported: false,
    stream: null,
  });

  const [arObjects, setArObjects] = useState<ARObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  // Referencias
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Cargar experiencia
  const loadExperience = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Cargando experiencia:", experienceId);

      const data = experienceId.match(/^[0-9]+$/)
        ? await getExperienceById(experienceId)
        : await getExperienceBySlug(experienceId);

      console.log("📦 Datos recibidos:", data);

      if (!data?.data) {
        console.error("❌ No se encontraron datos para la experiencia");
        throw new Error("Experiencia no encontrada");
      }

      const exp = normalizeExperience(data.data);
      console.log("✅ Experiencia normalizada:", exp);
      setExperience(exp);

      // Crear objetos AR desde assets
      const objects: ARObject[] = exp.assets.map((asset, index) => ({
        id: `obj_${index}`,
        asset,
        position: { x: -200 + index * 100, y: -100, z: 0 },
        scale: 1,
        visible: true,
      }));
      console.log("🎯 Objetos AR creados:", objects);
      setArObjects(objects);

      setIsLoading(false);
      console.log("✅ Experiencia cargada completamente");
    } catch (err) {
      console.error("❌ ERROR cargando experiencia:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(`No se pudo cargar la experiencia: ${errorMessage}`);
      setIsLoading(false);
    }
  }, [experienceId]);

  // Detectar capacidades AR
  const checkARCapabilities = useCallback(async () => {
    try {
      // Verificar cámara
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some((device) => device.kind === "videoinput");

      // Verificar WebXR
      const isWebXRSupported = "xr" in navigator && "XRSession" in window;

      setArState((prev) => ({
        ...prev,
        hasCamera: hasVideo,
        isWebXRSupported,
      }));
    } catch {
      setArState((prev) => ({
        ...prev,
        hasCamera: false,
        isWebXRSupported: false,
      }));
    }
  }, []);

  // Iniciar AR
  const startAR = useCallback(async () => {
    if (!arState.hasCamera) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setArState((prev) => ({
        ...prev,
        isActive: true,
        stream,
      }));

      startARRenderLoop();
    } catch (err) {
      console.error("Error iniciando AR:", err);
      setError("No se pudo acceder a la cámara");
    }
  }, [arState.hasCamera]);

  // Detener AR
  const stopAR = useCallback(() => {
    if (arState.stream) {
      arState.stream.getTracks().forEach((track) => track.stop());
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setArState((prev) => ({
      ...prev,
      isActive: false,
      stream: null,
    }));
  }, [arState.stream]);

  // Loop de renderizado AR
  const startARRenderLoop = useCallback(() => {
    const render = () => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Ajustar canvas al video
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Renderizar objetos AR
      arObjects.forEach((obj) => {
        if (obj.visible) {
          renderARObject(ctx, obj, canvas);
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  }, [arObjects]);

  // Renderizar objeto AR
  const renderARObject = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      obj: ARObject,
      canvas: HTMLCanvasElement
    ) => {
      const centerX = canvas.width / 2 + obj.position.x;
      const centerY = canvas.height / 2 + obj.position.y;
      const size = 80 * obj.scale;

      // Efecto de selección
      if (selectedObject === obj.id) {
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          centerX - size / 2 - 5,
          centerY - size / 2 - 5,
          size + 10,
          size + 10
        );
        ctx.setLineDash([]);
      }

      // Renderizar según tipo de asset
      switch (obj.asset.assetType) {
        case "message":
          renderTextAsset(ctx, obj.asset, centerX, centerY, size);
          break;
        case "image":
          renderImageAsset(ctx, obj.asset, centerX, centerY, size);
          break;
        case "video":
          renderVideoAsset(ctx, obj.asset, centerX, centerY, size);
          break;
        case "model3d":
          render3DAsset(ctx, obj.asset, centerX, centerY, size);
          break;
        case "webcontent":
          renderWebAsset(ctx, obj.asset, centerX, centerY, size);
          break;
        default:
          renderDefaultAsset(ctx, obj.asset, centerX, centerY, size);
      }
    },
    [selectedObject]
  );

  // Renderizar texto
  const renderTextAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    const radius = size / 2;

    // Fondo
    ctx.fillStyle = "rgba(0, 100, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Icono
    ctx.fillStyle = "white";
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("💬", x, y - 5);

    // Nombre
    ctx.font = `${size * 0.15}px Arial`;
    ctx.fillText(asset.name, x, y + radius + 15);
  };

  // Renderizar imagen
  const renderImageAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    const radius = size / 2;

    ctx.fillStyle = "rgba(255, 100, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🖼️", x, y - 5);

    ctx.font = `${size * 0.15}px Arial`;
    ctx.fillText(asset.name, x, y + radius + 15);
  };

  // Renderizar video
  const renderVideoAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    const radius = size / 2;

    ctx.fillStyle = "rgba(200, 0, 100, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎥", x, y - 5);

    ctx.font = `${size * 0.15}px Arial`;
    ctx.fillText(asset.name, x, y + radius + 15);
  };

  // Renderizar 3D
  const render3DAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    const radius = size / 2;

    // Efecto 3D con gradiente
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(100, 255, 100, 1)");
    gradient.addColorStop(1, "rgba(0, 150, 0, 0.8)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Borde para efecto 3D
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("📦", x, y - 5);

    ctx.font = `${size * 0.15}px Arial`;
    ctx.fillText(asset.name, x, y + radius + 15);
  };

  // Renderizar web content
  const renderWebAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    const radius = size / 2;

    ctx.fillStyle = "rgba(150, 0, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🌐", x, y - 5);

    ctx.font = `${size * 0.15}px Arial`;
    ctx.fillText(asset.name, x, y + radius + 15);
  };

  // Renderizar por defecto
  const renderDefaultAsset = (
    ctx: CanvasRenderingContext2D,
    asset: Asset,
    x: number,
    y: number,
    size: number
  ) => {
    const radius = size / 2;

    ctx.fillStyle = "rgba(128, 128, 128, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("📄", x, y - 5);

    ctx.font = `${size * 0.15}px Arial`;
    ctx.fillText(asset.name, x, y + radius + 15);
  };

  // Manejar toque en canvas
  const handleCanvasTouch = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        "touches" in event ? event.touches[0].clientY : event.clientY;

      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);

      // Verificar qué objeto fue tocado
      const touchedObject = arObjects.find((obj) => {
        const objX = canvas.width / 2 + obj.position.x;
        const objY = canvas.height / 2 + obj.position.y;
        const radius = 40 * obj.scale;

        const distance = Math.sqrt((x - objX) ** 2 + (y - objY) ** 2);
        return distance <= radius;
      });

      if (touchedObject) {
        setSelectedObject((prev) =>
          prev === touchedObject.id ? null : touchedObject.id
        );
      } else {
        setSelectedObject(null);
      }
    },
    [arObjects]
  );

  const handleBack = useCallback(() => {
    stopAR();
    router.push("/experiences");
  }, [stopAR, router]);

  // Efectos
  useEffect(() => {
    loadExperience();
    checkARCapabilities();
  }, [loadExperience, checkARCapabilities]);

  useEffect(() => {
    return () => stopAR();
  }, [stopAR]);

  // Renderizado condicional
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Cargando experiencia AR...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <h2 className="text-2xl font-bold mb-4">❌ Error</h2>
          <p className="text-red-200 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold">❌ Experiencia no encontrada</h2>
        </div>
      </div>
    );
  }

  // Vista AR activa
  if (arState.isActive) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* Video de cámara */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Canvas para objetos AR */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-10 cursor-pointer"
          onTouchStart={handleCanvasTouch}
          onClick={handleCanvasTouch}
        />

        {/* HUD Superior */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={stopAR}
              className="bg-red-600/90 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold"
            >
              ← Salir AR
            </button>

            <div className="text-white text-right">
              <div className="text-sm opacity-75">AR Activo</div>
              <div className="text-xs">🟢 LIVE</div>
            </div>
          </div>
        </div>

        {/* HUD Inferior */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="text-white">
            <h3 className="font-bold text-lg mb-1">{experience.title}</h3>
            <div className="flex items-center justify-between text-sm">
              <span>
                {arObjects.filter((obj) => obj.visible).length} objetos visibles
              </span>
              {selectedObject && (
                <span className="text-green-400">
                  ✨{" "}
                  {
                    arObjects.find((obj) => obj.id === selectedObject)?.asset
                      .name
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de estado */}
        <div className="absolute top-1/2 left-4 z-20 text-white text-xs bg-black/60 px-2 py-1 rounded">
          📱 Mueve el dispositivo para explorar
        </div>
      </div>
    );
  }

  // Vista previa (antes de iniciar AR)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={handleBack}
          className="text-white hover:text-blue-200 flex items-center gap-2"
        >
          ← Volver a experiencias
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-white max-w-lg">
          <h1 className="text-4xl font-bold mb-6">{experience.title}</h1>

          {experience.description && (
            <p className="text-blue-200 mb-8 leading-relaxed text-lg">
              {experience.description}
            </p>
          )}

          {/* Información de la experiencia */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8">
            <h2 className="text-2xl mb-4">🌟 Experiencia AR</h2>
            <p className="mb-4 text-lg">
              {arObjects.length} objeto{arObjects.length !== 1 ? "s" : ""}{" "}
              digital{arObjects.length !== 1 ? "es" : ""} en realidad aumentada
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {arObjects.slice(0, 4).map((obj, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-3">
                  <div className="text-sm font-medium">{obj.asset.name}</div>
                  <div className="text-xs text-blue-200 capitalize">
                    {obj.asset.assetType}
                  </div>
                </div>
              ))}
              {arObjects.length > 4 && (
                <div className="bg-white/5 rounded-lg p-3 flex items-center justify-center">
                  <span className="text-xs">+{arObjects.length - 4} más</span>
                </div>
              )}
            </div>
          </div>

          {/* Estado del sistema */}
          <div className="mb-8 space-y-3">
            <div
              className={`flex items-center justify-center gap-2 ${
                arState.hasCamera ? "text-green-400" : "text-red-400"
              }`}
            >
              {arState.hasCamera ? "✅" : "❌"} Cámara{" "}
              {arState.hasCamera ? "disponible" : "no disponible"}
            </div>

            <div
              className={`flex items-center justify-center gap-2 ${
                window.isSecureContext ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {window.isSecureContext ? "🔒" : "⚠️"}{" "}
              {window.isSecureContext ? "Conexión segura" : "Requiere HTTPS"}
            </div>

            {arState.isWebXRSupported && (
              <div className="text-blue-400 flex items-center justify-center gap-2">
                🚀 WebXR compatible
              </div>
            )}
          </div>

          {/* Botón principal */}
          <button
            onClick={startAR}
            disabled={!arState.hasCamera || !window.isSecureContext}
            className={`w-full p-4 rounded-xl text-white font-bold text-xl mb-6 transition-all ${
              arState.hasCamera && window.isSecureContext
                ? "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 hover:scale-105"
                : "bg-gray-600 cursor-not-allowed opacity-50"
            }`}
          >
            {!window.isSecureContext
              ? "❌ Requiere conexión HTTPS"
              : !arState.hasCamera
              ? "❌ Cámara no disponible"
              : "🚀 INICIAR EXPERIENCIA AR"}
          </button>

          {/* Instrucciones */}
          <div className="text-left bg-white/5 backdrop-blur rounded-lg p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              📱 Cómo usar la AR
            </h3>
            <ul className="text-sm space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>Permite acceso a la cámara trasera</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Apunta hacia una superficie plana y bien iluminada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>Los objetos digitales aparecerán en tu espacio real</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <span>Toca los objetos para interactuar con ellos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Mueve el dispositivo para explorar en 360°</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
