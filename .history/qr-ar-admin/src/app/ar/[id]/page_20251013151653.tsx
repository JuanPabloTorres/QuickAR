"use client";

import { getExperienceById, getExperienceBySlug } from "@/lib/api/experiences";
import { normalizeExperience } from "@/lib/helpers/experienceHelpers";
import { Experience } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import RealisticARViewer from "@/components/ar/RealisticARViewer";

export default function ARExperience() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params.id as string;

  // Estados principales
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

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

  const handleBack = useCallback(() => {
    router.push("/experiences");
  }, [router]);

  const handleAssetChange = useCallback((index: number) => {
    setCurrentAssetIndex(index);
  }, []);

  // Efectos
  useEffect(() => {
    loadExperience();
  }, [loadExperience]);

  // Renderizado condicional
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Cargando experiencia AR...</h2>
          <p className="text-sm text-blue-200 mt-2">Preparando vista 3D realista</p>
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
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold"
            >
              🔄 Reintentar
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-bold"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">❌ Experiencia no encontrada</h2>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold"
          >
            ← Volver a experiencias
          </button>
        </div>
      </div>
    );
  }

  // Render the realistic AR viewer
  return (
    <RealisticARViewer
      experience={experience}
      currentAssetIndex={currentAssetIndex}
      onAssetChange={handleAssetChange}
      onBack={handleBack}
    />
  );
}

  // Efectos
  useEffect(() => {
    loadExperience();
  }, [loadExperience]);

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
