"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DeviceMotion, NormalizedContent } from "../ARViewer";

interface Model3DRendererProps {
  content: NormalizedContent;
  gestures: any;
  deviceMotion: DeviceMotion;
  onTrackEvent: (event: string, data?: string) => void;
}

interface WebGLCapabilities {
  hasWebGL: boolean;
  hasWebGL2: boolean;
  maxTextureSize: number;
  extensions: string[];
}

const Model3DRenderer: React.FC<Model3DRendererProps> = ({
  content,
  gestures,
  deviceMotion,
  onTrackEvent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webglCapabilities, setWebglCapabilities] =
    useState<WebGLCapabilities | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Check WebGL capabilities
  const checkWebGLCapabilities = useCallback((): WebGLCapabilities => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
    const gl2 = canvas.getContext("webgl2") as WebGL2RenderingContext | null;

    if (!gl) {
      return {
        hasWebGL: false,
        hasWebGL2: false,
        maxTextureSize: 0,
        extensions: [],
      };
    }

    const extensions = gl.getSupportedExtensions() || [];
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;

    return {
      hasWebGL: true,
      hasWebGL2: !!gl2,
      maxTextureSize,
      extensions,
    };
  }, []);

  // Initialize WebGL capabilities
  useEffect(() => {
    const capabilities = checkWebGLCapabilities();
    setWebglCapabilities(capabilities);

    if (!capabilities.hasWebGL) {
      setError(
        "WebGL no está disponible en este navegador. Se requiere para mostrar modelos 3D."
      );
      setIsLoading(false);
      onTrackEvent("webgl_unavailable", content.name);
    }
  }, [checkWebGLCapabilities, content.name, onTrackEvent]);

  // Load 3D model viewer
  useEffect(() => {
    if (!webglCapabilities?.hasWebGL || !containerRef.current) return;

    const loadModelViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Determine the appropriate viewer based on file format
        if (
          content.ext === "glb" ||
          content.ext === "gltf" ||
          content.mime?.includes("gltf")
        ) {
          await loadNativeViewer();
        } else if (content.ext === "obj") {
          await loadThreeJSViewer();
        } else {
          // Fallback to native viewer
          await loadNativeViewer();
        }

        onTrackEvent("model3d_loaded", `${content.name}_${content.ext}`);
      } catch (err) {
        console.error("Error loading 3D model:", err);
        setError(
          `Error al cargar el modelo 3D: ${
            err instanceof Error ? err.message : "Error desconocido"
          }`
        );
        onTrackEvent("model3d_error", `${content.name}_${String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadModelViewer();

    // Cleanup on unmount
    return () => {
      if (
        viewerRef.current &&
        typeof viewerRef.current.dispose === "function"
      ) {
        viewerRef.current.dispose();
      }
    };
  }, [webglCapabilities, content, onTrackEvent]);

  // Load native browser 3D viewer with actual model-viewer
  const loadNativeViewer = async () => {
    if (!containerRef.current || !content.url) return;

    try {
      console.log(
        "Loading model-viewer for:",
        content.name,
        "URL:",
        content.url
      );

      // Dynamically import model-viewer
      await import("@google/model-viewer");
      console.log("Model-viewer library loaded successfully");

      // Create model-viewer element
      const modelViewer = document.createElement("model-viewer");

      // Set attributes
      modelViewer.setAttribute("src", content.url);
      modelViewer.setAttribute("alt", content.name);
      modelViewer.setAttribute("camera-controls", "true");
      modelViewer.setAttribute("auto-rotate", "true");
      modelViewer.setAttribute("environment-image", "neutral");
      modelViewer.setAttribute("shadow-intensity", "1");

      // Set styles
      modelViewer.style.width = "100%";
      modelViewer.style.height = "100%";
      modelViewer.style.minHeight = "300px";
      modelViewer.style.backgroundColor = "rgba(0,0,0,0.05)";
      modelViewer.style.borderRadius = "8px";

      // Add loading and error handlers
      modelViewer.addEventListener("load", () => {
        console.log("3D Model loaded successfully:", content.name);
        setIsLoading(false);
        setIsModelLoaded(true);
        onTrackEvent("model3d_loaded", content.name);
      });

      modelViewer.addEventListener("error", (e) => {
        console.error("3D Model failed to load:", content.name, e);
        setError(`Error al cargar el modelo 3D: ${content.name}`);
        setIsLoading(false);
        onTrackEvent("model3d_error", `${content.name}_load_failed`);
      });

      // Add progress handler
      modelViewer.addEventListener("progress", (e: any) => {
        if (e.detail && e.detail.totalProgress < 1) {
          console.log(
            `Loading progress: ${Math.round(e.detail.totalProgress * 100)}%`
          );
        }
      });

      // Clear container and add model viewer
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(modelViewer);
      viewerRef.current = modelViewer;

      console.log("Model-viewer element added to container");
    } catch (err) {
      console.error("Error setting up model viewer:", err);
      setError(
        `Error al cargar el visor 3D: ${
          err instanceof Error ? err.message : "Error desconocido"
        }`
      );
      setIsLoading(false);
      onTrackEvent("model3d_viewer_error", content.name);
    }
  };

  // Load Three.js viewer for OBJ files
  const loadThreeJSViewer = async () => {
    try {
      // For now, fallback to native viewer
      // Can be implemented later with Three.js if needed
      await loadNativeViewer();
    } catch (error) {
      setError("No se pudo cargar el visor 3D especializado.");
      await loadNativeViewer();
    }
  };

  // Apply device motion to model (placeholder for future implementation)
  useEffect(() => {
    if (!isModelLoaded || !viewerRef.current) return;

    // Device motion integration can be implemented here
    // For now, just log the motion data
    if (deviceMotion.x !== 0 || deviceMotion.y !== 0 || deviceMotion.z !== 0) {
      console.log("Device motion:", deviceMotion);
    }
  }, [deviceMotion, isModelLoaded]);

  // Apply gestures to model (placeholder for future implementation)
  useEffect(() => {
    if (!isModelLoaded || !viewerRef.current || !gestures) return;

    // Gesture handling can be implemented here
    if (gestures.scale !== 1 || gestures.rotation !== 0) {
      console.log("Gestures applied:", gestures);
    }
  }, [gestures, isModelLoaded]);

  if (!webglCapabilities) {
    return (
      <div className="ar-loading">
        <div className="ar-loading-spinner"></div>
        <p>Verificando capacidades 3D...</p>
      </div>
    );
  }

  if (!webglCapabilities.hasWebGL) {
    return (
      <div className="ar-error">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-semibold mb-2">WebGL No Disponible</h3>
          <p className="text-sm mb-4">
            Tu navegador no soporta WebGL, necesario para mostrar modelos 3D.
          </p>
          <div className="space-y-2 text-xs">
            <p>• Actualiza tu navegador a la última versión</p>
            <p>• Habilita la aceleración de hardware</p>
            <p>• Prueba en un navegador moderno (Chrome, Firefox, Safari)</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ar-error">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Error de Modelo 3D</h3>
          <p className="text-sm mb-4">{error}</p>
          <div className="space-y-2 text-xs">
            <p>• Verifica que el archivo sea válido</p>
            <p>• Prueba convertir a formato GLB/GLTF</p>
            <p>• Revisa la conexión de red</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="ar-loading">
        <div className="ar-loading-spinner"></div>
        <p>Cargando modelo 3D...</p>
        <div className="text-xs mt-2 opacity-75">
          Formato: {content.ext?.toUpperCase()} • Archivo: {content.name}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative model-3d-container"
    >
      {/* Overlay controls for 3D viewer */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex gap-2">
          <button
            className="ar-toggle-btn"
            onClick={() => {
              onTrackEvent("3d_info_requested", content.name);
              alert(
                `Modelo 3D: ${
                  content.name
                }\nFormato: ${content.ext?.toUpperCase()}\nTipo MIME: ${
                  content.mime || "No especificado"
                }`
              );
            }}
            title="Información del modelo"
          >
            ℹ️
          </button>
        </div>
      </div>
    </div>
  );
};

export default Model3DRenderer;
