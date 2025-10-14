/**
 * Native WebXR AR Experience Component
 * Provides true AR functionality using WebXR API directly
 */

"use client";

import { Asset } from "@/types";
import { useEffect, useRef, useState } from "react";

interface NativeARViewerProps {
  asset: Asset;
  onARStart?: () => void;
  onAREnd?: () => void;
  onError?: (error: string) => void;
}

export default function NativeARViewer({
  asset,
  onARStart,
  onAREnd,
  onError,
}: NativeARViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isARSupported, setIsARSupported] = useState<boolean>(false);
  const [isARActive, setIsARActive] = useState<boolean>(false);
  const [webxrSession, setWebxrSession] = useState<XRSession | null>(null);
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);

  // Check WebXR AR support
  useEffect(() => {
    const checkARSupport = async () => {
      if (typeof navigator !== "undefined" && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported("immersive-ar");
          setIsARSupported(supported);
          console.log("🔍 WebXR AR Support:", supported);
        } catch (error) {
          console.error("❌ WebXR AR check failed:", error);
          setIsARSupported(false);
        }
      } else {
        console.log("❌ WebXR not available");
        setIsARSupported(false);
      }
    };

    checkARSupport();
  }, []);

  // Initialize WebGL context
  useEffect(() => {
    if (canvasRef.current && !gl) {
      const context = canvasRef.current.getContext("webgl2", {
        xrCompatible: true,
      });
      if (context) {
        setGl(context);
        console.log("✅ WebGL2 context initialized");
      } else {
        onError?.("WebGL2 not supported");
      }
    }
  }, [gl, onError]);

  const startARSession = async () => {
    if (!navigator.xr || !gl || !canvasRef.current) {
      onError?.("AR requirements not met");
      return;
    }

    try {
      console.log("🚀 Starting AR session...");
      
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor"],
        optionalFeatures: ["dom-overlay", "hit-test"],
        domOverlay: { root: document.body },
      });

      setWebxrSession(session);
      setIsARActive(true);
      onARStart?.();

      // Set up WebGL layer
      await gl.makeXRCompatible();
      const layer = new XRWebGLLayer(session, gl);
      await session.updateRenderState({ baseLayer: layer });

      // Set up reference space
      const referenceSpace = await session.requestReferenceSpace("local-floor");

      console.log("✅ AR session started successfully");

      // AR render loop
      const onXRFrame = (time: number, frame: XRFrame) => {
        const pose = frame.getViewerPose(referenceSpace);
        
        if (pose) {
          const layer = session.renderState.baseLayer;
          if (layer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
            gl.viewport(0, 0, layer.framebufferWidth, layer.framebufferHeight);

            // Clear the framebuffer
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Render content for each eye
            for (const view of pose.views) {
              const viewport = layer.getViewport(view);
              gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

              // Here we would render the asset based on its type
              renderAssetInAR(view, asset);
            }
          }
        }

        session.requestAnimationFrame(onXRFrame);
      };

      session.requestAnimationFrame(onXRFrame);

      // Handle session end
      session.addEventListener("end", () => {
        setIsARActive(false);
        setWebxrSession(null);
        onAREnd?.();
        console.log("🔚 AR session ended");
      });

    } catch (error) {
      console.error("❌ Failed to start AR session:", error);
      setIsARActive(false);
      onError?.(`AR Error: ${error}`);
    }
  };

  const stopARSession = () => {
    if (webxrSession) {
      webxrSession.end();
    }
  };

  const renderAssetInAR = (view: XRView, asset: Asset) => {
    if (!gl) return;

    // Basic shader setup for different asset types
    switch (asset.type) {
      case "model3d":
        renderModel3DInAR(view, asset);
        break;
      case "image":
        renderImageInAR(view, asset);
        break;
      case "video":
        renderVideoInAR(view, asset);
        break;
      case "message":
        renderTextInAR(view, asset);
        break;
      default:
        renderDefaultInAR(view, asset);
    }
  };

  const renderModel3DInAR = (view: XRView, asset: Asset) => {
    // Simplified 3D model rendering - would need proper model loading
    if (!gl) return;

    // Create a simple cube as placeholder for 3D model
    const vertices = new Float32Array([
      // Front face
      -0.1, -0.1,  0.1,
       0.1, -0.1,  0.1,
       0.1,  0.1,  0.1,
      -0.1,  0.1,  0.1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Simple vertex shader for AR rendering
    renderBasicShape(vertices, [1.0, 0.0, 1.0, 1.0]); // Purple cube
  };

  const renderImageInAR = (view: XRView, asset: Asset) => {
    // Render image as a plane in AR space
    const quadVertices = new Float32Array([
      -0.2, -0.15, 0,
       0.2, -0.15, 0,
       0.2,  0.15, 0,
      -0.2,  0.15, 0,
    ]);
    renderBasicShape(quadVertices, [0.0, 1.0, 0.0, 0.8]); // Green plane
  };

  const renderVideoInAR = (view: XRView, asset: Asset) => {
    // Render video as a plane in AR space
    const quadVertices = new Float32Array([
      -0.25, -0.15, 0,
       0.25, -0.15, 0,
       0.25,  0.15, 0,
      -0.25,  0.15, 0,
    ]);
    renderBasicShape(quadVertices, [0.0, 0.0, 1.0, 0.8]); // Blue plane
  };

  const renderTextInAR = (view: XRView, asset: Asset) => {
    // Render text as a small plane in AR space
    const textVertices = new Float32Array([
      -0.15, -0.05, 0,
       0.15, -0.05, 0,
       0.15,  0.05, 0,
      -0.15,  0.05, 0,
    ]);
    renderBasicShape(textVertices, [1.0, 1.0, 0.0, 0.9]); // Yellow plane
  };

  const renderDefaultInAR = (view: XRView, asset: Asset) => {
    // Default rendering for unknown asset types
    const defaultVertices = new Float32Array([
      -0.1, -0.1, 0,
       0.1, -0.1, 0,
       0.1,  0.1, 0,
      -0.1,  0.1, 0,
    ]);
    renderBasicShape(defaultVertices, [0.5, 0.5, 0.5, 0.7]); // Gray plane
  };

  const renderBasicShape = (vertices: Float32Array, color: number[]) => {
    if (!gl) return;

    // Very basic rendering - in production this would be much more sophisticated
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Basic color rendering without full shader program (simplified)
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  };

  return (
    <div className="native-ar-viewer">
      {/* AR Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: isARActive ? "block" : "none" }}
      />

      {/* AR Controls */}
      {!isARActive && (
        <div className="ar-controls p-4 text-center">
          {isARSupported ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                🎯 Experiencia AR Disponible
              </h3>
              <p className="text-gray-600 mb-6">
                Vive el contenido "{asset.name}" en realidad aumentada
              </p>
              <button
                onClick={startARSession}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🚀 Iniciar AR
              </button>
              <div className="mt-4 text-sm text-gray-500">
                <p>Tipo de contenido: {asset.type}</p>
                <p>Compatible con WebXR AR ✅</p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-600">
                📱 AR No Disponible
              </h3>
              <p className="text-gray-600 mb-4">
                Tu dispositivo no soporta WebXR AR o necesita un navegador compatible.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  💡 Para usar AR necesitas:
                </h4>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Un dispositivo móvil compatible (Android con ARCore)</li>
                  <li>• Chrome para Android con WebXR habilitado</li>
                  <li>• Conexión HTTPS segura</li>
                </ul>
              </div>
              
              {/* Fallback experience */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">🎮 Experiencia Alternativa</h4>
                <p className="text-sm text-gray-600">
                  Disfruta el contenido en modo de visualización 360°
                </p>
                <button
                  onClick={() => {
                    // Trigger fallback immersive experience
                    onARStart?.();
                  }}
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Ver en 360° 🌐
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active AR Session UI */}
      {isARActive && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={stopARSession}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            🔚 Salir de AR
          </button>
        </div>
      )}
    </div>
  );
}