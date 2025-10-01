"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { NormalizedContent, DeviceMotion } from "../ARViewer";

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
  onTrackEvent
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webglCapabilities, setWebglCapabilities] = useState<WebGLCapabilities | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Check WebGL capabilities
  const checkWebGLCapabilities = useCallback((): WebGLCapabilities => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    
    if (!gl) {
      return {
        hasWebGL: false,
        hasWebGL2: false,
        maxTextureSize: 0,
        extensions: []
      };
    }

    const extensions = gl.getSupportedExtensions() || [];
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;

    return {
      hasWebGL: true,
      hasWebGL2: !!gl2,
      maxTextureSize,
      extensions
    };
  }, []);

  // Initialize WebGL capabilities
  useEffect(() => {
    const capabilities = checkWebGLCapabilities();
    setWebglCapabilities(capabilities);
    
    if (!capabilities.hasWebGL) {
      setError("WebGL no está disponible en este navegador. Se requiere para mostrar modelos 3D.");
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
        if (content.ext === 'glb' || content.ext === 'gltf' || content.mime?.includes('gltf')) {
          await loadNativeViewer();
        } else if (content.ext === 'obj') {
          await loadThreeJSViewer();
        } else {
          // Fallback to native viewer
          await loadNativeViewer();
        }

        onTrackEvent("model3d_loaded", `${content.name}_${content.ext}`);
      } catch (err) {
        console.error('Error loading 3D model:', err);
        setError(`Error al cargar el modelo 3D: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        onTrackEvent("model3d_error", `${content.name}_${String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadModelViewer();

    // Cleanup on unmount
    return () => {
      if (viewerRef.current && typeof viewerRef.current.dispose === 'function') {
        viewerRef.current.dispose();
      }
    };
  }, [webglCapabilities, content, onTrackEvent]);

  // Load native browser 3D viewer
  const loadNativeViewer = async () => {
    if (!containerRef.current) return;

    // Create a basic 3D container with fallback
    const modelContainer = document.createElement('div');
    modelContainer.style.width = '100%';
    modelContainer.style.height = '100%';
    modelContainer.style.position = 'relative';
    modelContainer.style.backgroundColor = 'rgba(0,0,0,0.1)';
    modelContainer.style.borderRadius = '8px';
    modelContainer.style.display = 'flex';
    modelContainer.style.alignItems = 'center';
    modelContainer.style.justifyContent = 'center';
    
    // Create model preview
    const preview = document.createElement('div');
    preview.innerHTML = `
      <div style="text-align: center; color: #666;">
        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px;">Modelo 3D</h3>
        <p style="margin: 0; font-size: 14px;">${content.name}</p>
        <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.7;">
          Formato: ${content.ext?.toUpperCase() || 'Desconocido'}
        </p>
        ${content.url ? `
          <a 
            href="${content.url}" 
            target="_blank" 
            style="
              display: inline-block; 
              margin-top: 16px; 
              padding: 8px 16px; 
              background: #007ACC; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              font-size: 14px;
            "
          >
            Ver Modelo
          </a>
        ` : ''}
      </div>
    `;
    
    modelContainer.appendChild(preview);
    
    // Clear container and add viewer
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(modelContainer);
    viewerRef.current = { container: modelContainer };
    
    setIsModelLoaded(true);
    setIsLoading(false);
  };

  // Load Three.js viewer for OBJ files
  const loadThreeJSViewer = async () => {
    try {
      // For now, fallback to native viewer
      // Can be implemented later with Three.js if needed
      await loadNativeViewer();
    } catch (error) {
      setError('No se pudo cargar el visor 3D especializado.');
      await loadNativeViewer();
    }
  };

  // Apply device motion to model (placeholder for future implementation)
  useEffect(() => {
    if (!isModelLoaded || !viewerRef.current) return;
    
    // Device motion integration can be implemented here
    // For now, just log the motion data
    if (deviceMotion.x !== 0 || deviceMotion.y !== 0 || deviceMotion.z !== 0) {
      console.log('Device motion:', deviceMotion);
    }
  }, [deviceMotion, isModelLoaded]);

  // Apply gestures to model (placeholder for future implementation)
  useEffect(() => {
    if (!isModelLoaded || !viewerRef.current || !gestures) return;
    
    // Gesture handling can be implemented here
    if (gestures.scale !== 1 || gestures.rotation !== 0) {
      console.log('Gestures applied:', gestures);
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
              alert(`Modelo 3D: ${content.name}\nFormato: ${content.ext?.toUpperCase()}\nTipo MIME: ${content.mime || 'No especificado'}`);
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