"use client";

/**
 * Simple Desktop 3D Viewer
 * Simplified viewer without React Three Fiber to avoid SSR issues
 * Uses native Three.js with React wrapper
 */

import { Experience } from "@/types";
import { ArrowLeft, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SimpleDesktop3DViewerProps {
  experience: Experience;
  currentAssetIndex?: number;
  onAssetChange?: (index: number) => void;
  onBack?: () => void;
}

export default function SimpleDesktop3DViewer({
  experience,
  currentAssetIndex = 0,
  onAssetChange,
  onBack,
}: SimpleDesktop3DViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(currentAssetIndex);
  const [showInfo, setShowInfo] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAssetClick = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      onAssetChange?.(index);
    },
    [onAssetChange]
  );

  const handleNext = useCallback(() => {
    const nextIndex = (selectedIndex + 1) % experience.assets.length;
    handleAssetClick(nextIndex);
  }, [selectedIndex, experience.assets.length, handleAssetClick]);

  const handlePrevious = useCallback(() => {
    const prevIndex =
      selectedIndex === 0 ? experience.assets.length - 1 : selectedIndex - 1;
    handleAssetClick(prevIndex);
  }, [selectedIndex, experience.assets.length, handleAssetClick]);

  const selectedAsset = experience.assets[selectedIndex];
  const baseApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamic import of Three.js to avoid SSR
    import("three").then(async (THREE) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);

      // Camera
      const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 3, 8);

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(5, 8, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const pointLight1 = new THREE.PointLight(0x60a5fa, 0.5);
      pointLight1.position.set(-5, 5, -5);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xa78bfa, 0.5);
      pointLight2.position.set(5, 3, 5);
      scene.add(pointLight2);

      // Ground grid
      const gridHelper = new THREE.GridHelper(30, 30, 0x3b82f6, 0x4b5563);
      scene.add(gridHelper);

      // Center marker
      const markerGeometry = new THREE.CircleGeometry(0.3, 32);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.6,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.rotation.x = -Math.PI / 2;
      marker.position.y = 0.02;
      scene.add(marker);

      // Load and display assets
      const assetMeshes: any[] = [];
      const textureLoader = new THREE.TextureLoader();
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );
      const gltfLoader = new GLTFLoader();

      // Helper function to get position in circle
      const getAssetPosition = (
        index: number,
        total: number
      ): [number, number, number] => {
        if (total === 1) return [0, 1, 0];
        const radius = Math.max(3, total * 0.5);
        const angle = (index / total) * Math.PI * 2;
        return [Math.cos(angle) * radius, 1, Math.sin(angle) * radius];
      };

      // Create assets
      experience.assets.forEach((asset, index) => {
        const position = getAssetPosition(index, experience.assets.length);

        // Create different objects based on asset type
        switch (asset.assetType) {
          case "model3d": {
            // Load 3D model
            if (asset.assetUrl) {
              const modelUrl = asset.assetUrl.startsWith("http")
                ? asset.assetUrl
                : `${baseApiUrl}${asset.assetUrl}`;

              gltfLoader.load(
                modelUrl,
                (gltf) => {
                  const model = gltf.scene;
                  model.position.set(...position);
                  model.scale.set(0.5, 0.5, 0.5);
                  model.traverse((child: any) => {
                    if (child.isMesh) {
                      child.castShadow = true;
                      child.receiveShadow = true;
                    }
                  });
                  scene.add(model);
                  assetMeshes[index] = model;
                },
                undefined,
                (error) => console.error("Error loading model:", error)
              );
            }
            break;
          }

          case "image": {
            // Create plane with image texture
            if (asset.assetUrl) {
              const imageUrl = asset.assetUrl.startsWith("http")
                ? asset.assetUrl
                : `${baseApiUrl}${asset.assetUrl}`;

              textureLoader.load(imageUrl, (texture) => {
                const aspectRatio = texture.image.width / texture.image.height;
                const planeGeometry = new THREE.PlaneGeometry(
                  2 * aspectRatio,
                  2
                );
                const planeMaterial = new THREE.MeshStandardMaterial({
                  map: texture,
                  side: THREE.DoubleSide,
                });
                const plane = new THREE.Mesh(planeGeometry, planeMaterial);
                plane.position.set(...position);
                plane.castShadow = true;
                scene.add(plane);
                assetMeshes[index] = plane;
              });
            }
            break;
          }

          case "video": {
            // Create plane for video (placeholder for now)
            const videoGeometry = new THREE.PlaneGeometry(2, 1.5);
            const videoMaterial = new THREE.MeshStandardMaterial({
              color: 0x3b82f6,
              emissive: 0x1e40af,
              side: THREE.DoubleSide,
            });
            const videoPlane = new THREE.Mesh(videoGeometry, videoMaterial);
            videoPlane.position.set(...position);
            videoPlane.castShadow = true;
            scene.add(videoPlane);
            assetMeshes[index] = videoPlane;
            break;
          }

          case "message": {
            // Create a billboard/card for text
            const cardGeometry = new THREE.BoxGeometry(1.5, 1, 0.1);
            const cardMaterial = new THREE.MeshStandardMaterial({
              color: 0x6366f1,
              emissive: 0x4338ca,
              metalness: 0.3,
              roughness: 0.4,
            });
            const card = new THREE.Mesh(cardGeometry, cardMaterial);
            card.position.set(...position);
            card.castShadow = true;
            scene.add(card);
            assetMeshes[index] = card;
            break;
          }

          case "webcontent": {
            // Create a monitor/screen shape
            const screenGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
            const screenMaterial = new THREE.MeshStandardMaterial({
              color: 0x10b981,
              emissive: 0x059669,
              metalness: 0.5,
              roughness: 0.3,
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.set(...position);
            screen.castShadow = true;
            scene.add(screen);
            assetMeshes[index] = screen;
            break;
          }
        }
      });

      // Animation loop
      let animationId: number;
      const animate = () => {
        animationId = requestAnimationFrame(animate);

        // Rotate camera slowly
        camera.position.x = Math.sin(Date.now() * 0.0001) * 8;
        camera.position.z = Math.cos(Date.now() * 0.0001) * 8;
        camera.lookAt(0, 1, 0);

        // Rotate asset meshes slightly
        assetMeshes.forEach((mesh, index) => {
          if (mesh) {
            mesh.rotation.y += 0.005;
            // Add floating animation
            const time = Date.now() * 0.001;
            mesh.position.y =
              getAssetPosition(index, experience.assets.length)[1] +
              Math.sin(time + index) * 0.1;
          }
        });

        renderer.render(scene, camera);
      };

      animate();
      setIsLoading(false);

      // Handle resize
      const handleResize = () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      };
      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
        scene.clear();
      };
    });
  }, [experience.assets, baseApiUrl]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 mx-auto"></div>
            <p className="text-white text-lg font-semibold">
              Cargando visor 3D...
            </p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-all text-white font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-all text-white"
          aria-label="Toggle information"
        >
          <Info className="w-6 h-6" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-20 right-4 z-20 max-w-md bg-white/10 backdrop-blur-md rounded-xl p-6 text-white shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">{experience.title}</h2>
          {experience.description && (
            <p className="text-white/80 mb-4">{experience.description}</p>
          )}
          <div className="text-sm text-white/60">
            <p>Vista 3D Interactiva</p>
            <p className="mt-2">
              {experience.assets.length} recurso
              {experience.assets.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Asset Navigation */}
      {experience.assets.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-white/20 rounded-full transition-all text-white"
              aria-label="Previous asset"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-white font-medium min-w-[120px] text-center">
              <div className="text-lg">
                {selectedIndex + 1} / {experience.assets.length}
              </div>
              <div className="text-sm text-white/60 capitalize">
                {selectedAsset.assetType}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-white/20 rounded-full transition-all text-white"
              aria-label="Next asset"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Asset Info */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 max-w-lg">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white text-center">
          <h3 className="font-bold text-lg mb-1">
            {selectedAsset.name || `Asset ${selectedIndex + 1}`}
          </h3>
          {selectedAsset.assetContent &&
            selectedAsset.assetType === "message" && (
              <p className="text-white/80 text-sm">
                {selectedAsset.assetContent}
              </p>
            )}
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-white/60">
            <span className="px-3 py-1 bg-white/10 rounded-full capitalize">
              {selectedAsset.assetType}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-4 z-20 text-white/60 text-sm max-w-xs">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3">
          <p className="font-semibold mb-1">💡 Consejos:</p>
          <p>• La cámara rota automáticamente</p>
          <p>• Usa las flechas para cambiar de recurso</p>
          <p>• Presiona "i" para más información</p>
        </div>
      </div>
    </div>
  );
}
