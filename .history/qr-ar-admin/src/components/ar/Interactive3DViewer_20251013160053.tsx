"use client";

/**
 * Interactive 3D Viewer
 * Realistic 3D viewer with full camera controls and asset interaction
 * Like being in a real space with the objects
 */

import { Experience } from "@/types";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  MousePointer2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Interactive3DViewerProps {
  experience: Experience;
  currentAssetIndex?: number;
  onAssetChange?: (index: number) => void;
  onBack?: () => void;
}

export default function Interactive3DViewer({
  experience,
  currentAssetIndex = 0,
  onAssetChange,
  onBack,
}: Interactive3DViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(currentAssetIndex);
  const [showInfo, setShowInfo] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
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

  // Hide instructions after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize Three.js scene with interactive controls
  useEffect(() => {
    if (!canvasRef.current) return;

    let controls: any = null;

    // Dynamic import of Three.js to avoid SSR
    import("three").then(async (THREE) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Import OrbitControls for camera manipulation
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );

      // Scene setup - realistic neutral environment (like a room)
      const scene = new THREE.Scene();
      scene.background = null; // Transparent
      scene.fog = new THREE.Fog(0xf5f5f5, 20, 60); // Very light fog

      // Camera - First person eye level
      const camera = new THREE.PerspectiveCamera(
        70, // Natural FOV
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 1.65, 8); // 1.65m = human eye level

      // Renderer with high quality settings
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;

      // OrbitControls - User can rotate, zoom, pan
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true; // Smooth camera movements
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 0.5; // Can get very close
      controls.maxDistance = 30; // Can zoom out far
      controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
      controls.target.set(0, 1, 0); // Look at center at eye level
      controls.enablePan = true; // Allow panning with right-click

      // Realistic lighting setup
      // Sun light
      const sunLight = new THREE.DirectionalLight(0xfff5e1, 1.2);
      sunLight.position.set(20, 30, 15);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 4096;
      sunLight.shadow.mapSize.height = 4096;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 100;
      sunLight.shadow.camera.left = -25;
      sunLight.shadow.camera.right = 25;
      sunLight.shadow.camera.top = 25;
      sunLight.shadow.camera.bottom = -25;
      sunLight.shadow.bias = -0.0001;
      scene.add(sunLight);

      // Ambient light for soft fill
      const ambientLight = new THREE.AmbientLight(0xb0c4de, 0.5);
      scene.add(ambientLight);

      // Hemisphere light for sky/ground color
      const hemisphereLight = new THREE.HemisphereLight(
        0x87ceeb, // Sky color
        0x8b7355, // Ground color
        0.6
      );
      scene.add(hemisphereLight);

      // Ground - large realistic plane
      const groundGeometry = new THREE.PlaneGeometry(200, 200);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a5f4a, // Grass green
        roughness: 0.9,
        metalness: 0.0,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Grid for depth perception (subtle)
      const gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0x666666);
      gridHelper.material.opacity = 0.2;
      gridHelper.material.transparent = true;
      gridHelper.position.y = 0.01;
      scene.add(gridHelper);

      // Center platform/stage for assets
      const platformGeometry = new THREE.CylinderGeometry(
        Math.max(4, experience.assets.length * 1.2),
        Math.max(4, experience.assets.length * 1.2),
        0.2,
        32
      );
      const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.7,
        metalness: 0.3,
      });
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.y = 0.1;
      platform.receiveShadow = true;
      platform.castShadow = true;
      scene.add(platform);

      // Load and display assets
      const assetGroups: any[] = [];
      const textureLoader = new THREE.TextureLoader();
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );
      const gltfLoader = new GLTFLoader();

      // Raycaster for click detection
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      // Position assets in a circle on the platform
      const getAssetPosition = (
        index: number,
        total: number
      ): [number, number, number] => {
        if (total === 1) return [0, 0.7, 0];
        const radius = Math.max(2.5, total * 0.7);
        const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // Start from front
        return [
          Math.cos(angle) * radius,
          0.7, // Above platform
          Math.sin(angle) * radius,
        ];
      };

      // Create interactive assets
      experience.assets.forEach((asset, index) => {
        const position = getAssetPosition(index, experience.assets.length);
        const group = new THREE.Group();
        group.position.set(...position);
        group.userData = { assetIndex: index, asset };

        // Selection ring (hidden by default)
        const ringGeometry = new THREE.TorusGeometry(1.2, 0.05, 16, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0x3b82f6,
          transparent: true,
          opacity: 0,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -0.5;
        group.add(ring);
        group.userData.ring = ring;

        // Create asset based on type
        switch (asset.assetType) {
          case "model3d": {
            if (asset.assetUrl) {
              const modelUrl = asset.assetUrl.startsWith("http")
                ? asset.assetUrl
                : `${baseApiUrl}${asset.assetUrl}`;

              gltfLoader.load(
                modelUrl,
                (gltf) => {
                  const model = gltf.scene;

                  // Center and scale model properly
                  const box = new THREE.Box3().setFromObject(model);
                  const center = box.getCenter(new THREE.Vector3());
                  const size = box.getSize(new THREE.Vector3());
                  const maxDim = Math.max(size.x, size.y, size.z);
                  const scale = 2.0 / maxDim;

                  model.position.sub(center);
                  model.scale.setScalar(scale);

                  model.traverse((child: any) => {
                    if (child.isMesh) {
                      child.castShadow = true;
                      child.receiveShadow = true;
                    }
                  });

                  group.add(model);
                },
                undefined,
                (error) => console.error("Error loading model:", error)
              );
            }
            break;
          }

          case "image": {
            if (asset.assetUrl) {
              const imageUrl = asset.assetUrl.startsWith("http")
                ? asset.assetUrl
                : `${baseApiUrl}${asset.assetUrl}`;

              textureLoader.load(imageUrl, (texture) => {
                const aspectRatio = texture.image.width / texture.image.height;
                const height = 2.0;
                const width = height * aspectRatio;

                // Image canvas with frame
                const canvasGroup = new THREE.Group();

                // Frame
                const frameThickness = 0.1;
                const frameDepth = 0.08;
                const frameMaterial = new THREE.MeshStandardMaterial({
                  color: 0x8b7355,
                  roughness: 0.6,
                  metalness: 0.2,
                });

                // Frame pieces
                const topFrame = new THREE.Mesh(
                  new THREE.BoxGeometry(
                    width + frameThickness * 2,
                    frameThickness,
                    frameDepth
                  ),
                  frameMaterial
                );
                topFrame.position.y = height / 2 + frameThickness / 2;

                const bottomFrame = new THREE.Mesh(
                  new THREE.BoxGeometry(
                    width + frameThickness * 2,
                    frameThickness,
                    frameDepth
                  ),
                  frameMaterial
                );
                bottomFrame.position.y = -height / 2 - frameThickness / 2;

                const leftFrame = new THREE.Mesh(
                  new THREE.BoxGeometry(frameThickness, height, frameDepth),
                  frameMaterial
                );
                leftFrame.position.x = -width / 2 - frameThickness / 2;

                const rightFrame = new THREE.Mesh(
                  new THREE.BoxGeometry(frameThickness, height, frameDepth),
                  frameMaterial
                );
                rightFrame.position.x = width / 2 + frameThickness / 2;

                // Image plane
                const imagePlane = new THREE.Mesh(
                  new THREE.PlaneGeometry(width, height),
                  new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.5,
                    metalness: 0.1,
                  })
                );
                imagePlane.position.z = frameDepth / 4;

                canvasGroup.add(
                  topFrame,
                  bottomFrame,
                  leftFrame,
                  rightFrame,
                  imagePlane
                );
                canvasGroup.castShadow = true;
                [topFrame, bottomFrame, leftFrame, rightFrame].forEach(
                  (f) => (f.castShadow = true)
                );

                group.add(canvasGroup);
              });
            }
            break;
          }

          case "video": {
            // Modern TV/Monitor
            const tvGroup = new THREE.Group();
            const screenWidth = 2.5;
            const screenHeight = 1.8;

            // Screen
            const screen = new THREE.Mesh(
              new THREE.PlaneGeometry(screenWidth, screenHeight),
              new THREE.MeshStandardMaterial({
                color: 0x000000,
                emissive: 0x3b82f6,
                emissiveIntensity: 0.3,
                roughness: 0.1,
                metalness: 0.9,
              })
            );
            screen.position.z = 0.05;

            // TV Body
            const tvBody = new THREE.Mesh(
              new THREE.BoxGeometry(
                screenWidth + 0.3,
                screenHeight + 0.3,
                0.15
              ),
              new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.2,
                metalness: 0.8,
              })
            );

            // Stand
            const stand = new THREE.Mesh(
              new THREE.CylinderGeometry(0.15, 0.2, 0.4, 16),
              new THREE.MeshStandardMaterial({
                color: 0x1f2937,
                roughness: 0.4,
                metalness: 0.6,
              })
            );
            stand.position.y = -screenHeight / 2 - 0.2;

            tvGroup.add(tvBody, screen, stand);
            tvGroup.castShadow = true;
            [tvBody, screen, stand].forEach((p) => (p.castShadow = true));

            group.add(tvGroup);
            break;
          }

          case "message": {
            // Standing sign/billboard
            const signGroup = new THREE.Group();
            const signWidth = 1.8;
            const signHeight = 1.2;

            // Sign board
            const signBoard = new THREE.Mesh(
              new THREE.BoxGeometry(signWidth, signHeight, 0.08),
              new THREE.MeshStandardMaterial({
                color: 0x6366f1,
                roughness: 0.3,
                metalness: 0.4,
              })
            );

            // Border
            const border = new THREE.Mesh(
              new THREE.BoxGeometry(signWidth + 0.1, signHeight + 0.1, 0.05),
              new THREE.MeshStandardMaterial({
                color: 0x4338ca,
                roughness: 0.4,
                metalness: 0.6,
              })
            );
            border.position.z = -0.05;

            // Post
            const post = new THREE.Mesh(
              new THREE.CylinderGeometry(0.08, 0.08, signHeight + 1, 16),
              new THREE.MeshStandardMaterial({
                color: 0x4b5563,
                roughness: 0.7,
                metalness: 0.3,
              })
            );
            post.position.y = -signHeight / 2 - 0.5;

            signGroup.add(border, signBoard, post);
            signGroup.castShadow = true;
            [border, signBoard, post].forEach((p) => (p.castShadow = true));

            group.add(signGroup);
            break;
          }

          case "webcontent": {
            // Laptop/tablet device
            const deviceGroup = new THREE.Group();
            const screenWidth = 2.2;
            const screenHeight = 1.5;

            // Screen
            const screen = new THREE.Mesh(
              new THREE.PlaneGeometry(screenWidth, screenHeight),
              new THREE.MeshStandardMaterial({
                color: 0x000000,
                emissive: 0x10b981,
                emissiveIntensity: 0.25,
                roughness: 0.1,
                metalness: 0.9,
              })
            );
            screen.position.z = 0.03;

            // Screen body
            const screenBody = new THREE.Mesh(
              new THREE.BoxGeometry(screenWidth + 0.2, screenHeight + 0.2, 0.1),
              new THREE.MeshStandardMaterial({
                color: 0x374151,
                roughness: 0.3,
                metalness: 0.7,
              })
            );

            // Keyboard base
            const keyboard = new THREE.Mesh(
              new THREE.BoxGeometry(
                screenWidth + 0.3,
                screenHeight * 0.6,
                0.04
              ),
              new THREE.MeshStandardMaterial({
                color: 0x4b5563,
                roughness: 0.5,
                metalness: 0.5,
              })
            );
            keyboard.position.y = -screenHeight / 2 - screenHeight * 0.3;
            keyboard.position.z = 0.1;
            keyboard.rotation.x = Math.PI / 8;

            deviceGroup.add(screenBody, screen, keyboard);
            deviceGroup.castShadow = true;
            [screenBody, screen, keyboard].forEach(
              (p) => (p.castShadow = true)
            );

            group.add(deviceGroup);
            break;
          }
        }

        scene.add(group);
        assetGroups.push(group);
      });

      // Click handler for asset selection
      const onCanvasClick = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          let clickedGroup = null;
          for (const intersect of intersects) {
            let obj = intersect.object;
            while (obj.parent) {
              if (assetGroups.includes(obj)) {
                clickedGroup = obj;
                break;
              }
              obj = obj.parent;
            }
            if (clickedGroup) break;
          }

          if (clickedGroup && clickedGroup.userData.assetIndex !== undefined) {
            const clickedIndex = clickedGroup.userData.assetIndex;
            handleAssetClick(clickedIndex);

            // Smooth camera transition to asset
            const targetPos = clickedGroup.position.clone();
            controls.target.lerp(targetPos, 0.5);
          }
        }
      };

      canvas.addEventListener("click", onCanvasClick);

      // Animation loop
      let animationId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        // Update controls
        controls.update();

        // Animate assets
        assetGroups.forEach((group, index) => {
          // Gentle floating
          const baseY = getAssetPosition(index, assetGroups.length)[1];
          group.position.y = baseY + Math.sin(elapsed * 0.5 + index) * 0.05;

          // Gentle rotation
          group.rotation.y = Math.sin(elapsed * 0.2 + index) * 0.1;

          // Highlight selected asset
          const isSelected = index === selectedIndex;
          const targetScale = isSelected ? 1.15 : 1.0;
          group.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale),
            delta * 3
          );

          // Show/hide selection ring
          if (group.userData.ring) {
            const ring = group.userData.ring;
            ring.material.opacity = isSelected ? 0.8 : 0;
            if (isSelected) {
              ring.rotation.z += delta * 2;
            }
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
        canvas.removeEventListener("click", onCanvasClick);
        window.removeEventListener("resize", handleResize);
        controls?.dispose();
        renderer.dispose();
        scene.clear();
      };
    });
  }, [experience.assets, baseApiUrl, selectedIndex, handleAssetClick]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-400 to-sky-200">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 mx-auto"></div>
            <p className="text-white text-lg font-semibold">
              Cargando visor 3D interactivo...
            </p>
          </div>
        </div>
      )}

      {/* Instructions Overlay */}
      {showInstructions && !isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-8 text-white max-w-md animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <MousePointer2 className="w-8 h-8 text-blue-400" />
              <h3 className="text-2xl font-bold">Controles Interactivos</h3>
            </div>
            <div className="space-y-3 text-sm">
              <p>
                🖱️ <strong>Click izquierdo + arrastrar:</strong> Rotar cámara
              </p>
              <p>
                🖱️ <strong>Click derecho + arrastrar:</strong> Mover cámara
              </p>
              <p>
                🎯 <strong>Scroll:</strong> Acercar / Alejar
              </p>
              <p>
                👆 <strong>Click en objeto:</strong> Seleccionar asset
              </p>
            </div>
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-all text-white"
            aria-label="Toggle instructions"
          >
            <MousePointer2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-all text-white"
            aria-label="Toggle information"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-20 right-4 z-20 max-w-md bg-white/10 backdrop-blur-md rounded-xl p-6 text-white shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">{experience.title}</h2>
          {experience.description && (
            <p className="text-white/80 mb-4">{experience.description}</p>
          )}
          <div className="text-sm text-white/60">
            <p>🎮 Vista 3D Interactiva</p>
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
              <p className="text-white/80 text-sm mt-2">
                {selectedAsset.assetContent}
              </p>
            )}
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-white/60">
            <span className="px-3 py-1 bg-white/10 rounded-full capitalize">
              {selectedAsset.assetType}
            </span>
            {selectedAsset.mimeType && (
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs">
                {selectedAsset.mimeType}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
