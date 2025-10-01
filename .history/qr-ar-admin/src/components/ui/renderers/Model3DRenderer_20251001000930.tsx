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
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const gl2 = canvas.getContext('webgl2');
    
    if (!gl) {
      return {
        hasWebGL: false,
        hasWebGL2: false,
        maxTextureSize: 0,
        extensions: []
      };
    }

    const extensions = gl.getSupportedExtensions() || [];
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

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
          await loadGLTFViewer();
        } else if (content.ext === 'obj') {
          await loadOBJViewer();
        } else if (['fbx', '3ds', 'dae'].includes(content.ext || '')) {
          await loadFBXViewer();
        } else {
          // Fallback: try GLTF viewer first, then others
          await loadGLTFViewer();
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

  // Load GLTF viewer (model-viewer web component)
  const loadGLTFViewer = async () => {
    // Import model-viewer if not already loaded
    if (!customElements.get('model-viewer')) {
      await import('@google/model-viewer');
    }

    if (!containerRef.current) return;

    // Create model-viewer element
    const modelViewer = document.createElement('model-viewer');
    modelViewer.src = content.url || '';
    modelViewer.alt = content.name;
    modelViewer.setAttribute('camera-controls', '');
    modelViewer.setAttribute('touch-action', 'pan-y');
    modelViewer.setAttribute('auto-rotate', '');
    modelViewer.setAttribute('ar', '');
    modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
    
    // Performance settings
    modelViewer.setAttribute('loading', 'eager');
    modelViewer.setAttribute('reveal', 'interaction');
    
    // Style the viewer
    modelViewer.style.width = '100%';
    modelViewer.style.height = '100%';
    modelViewer.style.backgroundColor = 'transparent';

    // Event listeners
    modelViewer.addEventListener('load', () => {
      setIsModelLoaded(true);
      setIsLoading(false);
    });

    modelViewer.addEventListener('error', (event: any) => {
      setError(`Error al cargar el modelo: ${event.detail?.message || 'Formato no compatible'}`);
    });

    // Clear container and add viewer
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(modelViewer);
    viewerRef.current = modelViewer;
  };

  // Load OBJ viewer (Three.js based)
  const loadOBJViewer = async () => {
    try {
      const THREE = await import('three');
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
      
      if (!containerRef.current) return;

      // Create Three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);

      // Load OBJ model
      const loader = new OBJLoader();
      loader.load(
        content.url || '',
        (object) => {
          scene.add(object);
          camera.position.z = 5;
          
          // Animation loop
          const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
          };
          animate();

          setIsModelLoaded(true);
          setIsLoading(false);
        },
        undefined,
        (error) => {
          setError(`Error al cargar modelo OBJ: ${error}`);
        }
      );

      viewerRef.current = { scene, camera, renderer, dispose: () => {
        renderer.dispose();
        scene.clear();
      }};

    } catch (error) {
      setError('No se pudo cargar el visor OBJ. Instale las dependencias de Three.js.');
    }
  };

  // Load FBX viewer 
  const loadFBXViewer = async () => {
    setError(`El formato ${content.ext?.toUpperCase()} no está soportado actualmente. Convierte tu modelo a formato GLB o GLTF para una mejor compatibilidad.`);
  };

  // Apply device motion to model
  useEffect(() => {
    if (!isModelLoaded || !viewerRef.current) return;

    // Apply device motion rotation to model-viewer
    if (viewerRef.current.tagName === 'MODEL-VIEWER') {
      const orientationString = `${deviceMotion.x}deg ${deviceMotion.y}deg ${deviceMotion.z}deg`;
      viewerRef.current.style.transform = `rotateX(${deviceMotion.x}deg) rotateY(${deviceMotion.y}deg) rotateZ(${deviceMotion.z}deg)`;
    }
  }, [deviceMotion, isModelLoaded]);

  // Apply gestures to model
  useEffect(() => {
    if (!isModelLoaded || !viewerRef.current || !gestures) return;

    if (viewerRef.current.tagName === 'MODEL-VIEWER') {
      const transform = `
        translate(${gestures.position?.x || 0}px, ${gestures.position?.y || 0}px)
        scale(${gestures.scale || 1})
        rotate(${gestures.rotation || 0}deg)
      `;
      viewerRef.current.style.transform = transform;
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
          Formato: {content.ext?.toUpperCase()} • Tamaño: {content.name}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      style={{ minHeight: '300px' }}
    >
      {/* Overlay controls for 3D viewer */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex gap-2">
          <button 
            className="ar-toggle-btn"
            onClick={() => {
              if (viewerRef.current?.tagName === 'MODEL-VIEWER') {
                const isAutoRotating = viewerRef.current.hasAttribute('auto-rotate');
                if (isAutoRotating) {
                  viewerRef.current.removeAttribute('auto-rotate');
                } else {
                  viewerRef.current.setAttribute('auto-rotate', '');
                }
                onTrackEvent("3d_auto_rotate_toggle", isAutoRotating ? "disabled" : "enabled");
              }
            }}
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default Model3DRenderer;