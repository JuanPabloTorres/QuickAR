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
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const assetGroupsRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      const target = controls.target;

      // Calculate direction to target
      const direction = target.clone().sub(camera.position).normalize();

      // Move camera closer (1 unit)
      const newDistance = camera.position.distanceTo(target) - 1;
      if (newDistance > controls.minDistance) {
        camera.position.add(direction);
      }
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      const target = controls.target;

      // Calculate direction away from target
      const direction = camera.position.clone().sub(target).normalize();

      // Move camera away (1 unit)
      const newDistance = camera.position.distanceTo(target) + 1;
      if (newDistance < controls.maxDistance) {
        camera.position.add(direction);
      }
    }
  }, []);

  // Rotate selected asset
  const handleRotateAsset = useCallback(() => {
    const groups = assetGroupsRef.current;
    if (groups && groups.length > 0 && groups[selectedIndex]) {
      const group = groups[selectedIndex];
      // Rotate 90 degrees (π/2 radians) on Y axis
      group.rotation.y += Math.PI / 2;
    }
  }, [selectedIndex]);

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

  // Initialize camera feed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isActive = true;

    // Request camera access
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment", // Back camera (or front if not available)
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      .then((stream) => {
        if (!isActive || !video) return;

        video.srcObject = stream;

        // Wait for video to be ready before playing
        video.onloadedmetadata = () => {
          if (!isActive) return;

          video.play().catch((err) => {
            console.warn("Video play warning:", err);
            // Try again after a short delay
            setTimeout(() => {
              if (isActive) {
                video.play().catch(() => {});
              }
            }, 100);
          });
        };

        setCameraActive(true);
        setCameraError(null);
      })
      .catch((error) => {
        console.error("Camera access error:", error);
        setCameraError(
          "No se pudo acceder a la cámara. Verifica los permisos."
        );
        setCameraActive(false);
      });

    // Cleanup
    return () => {
      isActive = false;
      if (video) {
        video.onloadedmetadata = null;
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }
      }
    };
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

      // Scene setup - AR effect with camera feed
      const scene = new THREE.Scene();
      scene.background = null; // Start transparent

      // Setup video texture from camera feed (will update in animation loop)
      let videoTexture: any = null;
      const video = videoRef.current;
      if (video) {
        videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;
        videoTexture.colorSpace = THREE.SRGBColorSpace;
      }

      // Camera - First person eye level
      const camera = new THREE.PerspectiveCamera(
        70, // Natural FOV
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 1.65, 8); // 1.65m = human eye level
      cameraRef.current = camera; // Store reference for zoom controls

      // Renderer with realistic settings
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true, // Transparent background
        powerPreference: "high-performance",
      });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.setClearColor(0x000000, 0); // Transparent

      // OrbitControls - Natural camera movement
      controls = new OrbitControls(camera, canvas);
      controlsRef.current = controls; // Store reference for zoom controls
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.screenSpacePanning = false;
      controls.minDistance = 1; // Can get close
      controls.maxDistance = 25;
      controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground
      controls.target.set(0, 1.2, 0); // Look at objects height
      controls.enablePan = true;
      controls.panSpeed = 0.8;

      // AR-style lighting - subtle and natural to blend with camera feed
      // Main directional light (softer for AR)
      const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
      mainLight.position.set(5, 10, 7);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 50;
      mainLight.shadow.camera.left = -15;
      mainLight.shadow.camera.right = 15;
      mainLight.shadow.camera.top = 15;
      mainLight.shadow.camera.bottom = -15;
      mainLight.shadow.bias = -0.0003;
      scene.add(mainLight);

      // Ambient light for AR (brighter to match real environment)
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      // Hemisphere light (subtle environmental)
      const hemisphereLight = new THREE.HemisphereLight(
        0xffffff, // Sky/ceiling
        0xf0f0f0, // Ground
        0.3
      );
      scene.add(hemisphereLight);

      // Subtle fill lights (less prominent for AR)
      const fillLight1 = new THREE.PointLight(0xffffff, 0.15, 20);
      fillLight1.position.set(-5, 3, -5);
      scene.add(fillLight1);

      const fillLight2 = new THREE.PointLight(0xffffff, 0.15, 20);
      fillLight2.position.set(5, 3, 5);
      scene.add(fillLight2);

      // Pure AR - No ground, no grid, objects float in real space

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
            // Standing sign/billboard with text
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

            // Add text to the sign using canvas texture
            if (asset.assetContent) {
              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d");
              if (context) {
                canvas.width = 512;
                canvas.height = 512;

                // Background
                context.fillStyle = "#6366f1";
                context.fillRect(0, 0, canvas.width, canvas.height);

                // Text
                context.fillStyle = "#ffffff";
                context.font = "bold 32px Arial, sans-serif";
                context.textAlign = "center";
                context.textBaseline = "middle";

                // Word wrap
                const maxWidth = canvas.width - 60;
                const lineHeight = 40;
                const words = asset.assetContent.split(" ");
                let line = "";
                let y = canvas.height / 2 - 60;

                for (let i = 0; i < words.length; i++) {
                  const testLine = line + words[i] + " ";
                  const metrics = context.measureText(testLine);
                  if (metrics.width > maxWidth && i > 0) {
                    context.fillText(line, canvas.width / 2, y);
                    line = words[i] + " ";
                    y += lineHeight;
                  } else {
                    line = testLine;
                  }
                }
                context.fillText(line, canvas.width / 2, y);

                // Create texture from canvas
                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;

                // Create plane with text texture
                const textPlane = new THREE.Mesh(
                  new THREE.PlaneGeometry(signWidth - 0.1, signHeight - 0.1),
                  new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                  })
                );
                textPlane.position.z = 0.045; // Slightly in front of the board
                signGroup.add(textPlane);
              }
            }

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

      // Store asset groups reference for rotation control
      assetGroupsRef.current = assetGroups;

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

        // Update video texture background for AR effect
        if (
          videoTexture &&
          video &&
          video.readyState >= video.HAVE_CURRENT_DATA
        ) {
          if (!scene.background) {
            scene.background = videoTexture;
          }
          videoTexture.needsUpdate = true;
        }

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
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Hidden video element for camera feed */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Camera Error Message */}
      {cameraError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 max-w-md bg-red-50 border border-red-200 rounded-xl p-4 shadow-xl">
          <p className="text-red-700 text-sm font-medium">{cameraError}</p>
          <p className="text-red-600 text-xs mt-1">
            La experiencia continuará sin el fondo de la cámara.
          </p>
        </div>
      )}

      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <p className="text-gray-700 text-lg font-semibold">
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
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/40 to-transparent">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-lg transition-all text-gray-800 font-medium shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-lg transition-all text-gray-700 shadow-lg"
            aria-label="Toggle instructions"
          >
            <MousePointer2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-lg transition-all text-gray-700 shadow-lg"
            aria-label="Toggle information"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-20 right-4 z-20 max-w-md bg-white/95 backdrop-blur-md rounded-xl p-6 text-gray-800 shadow-2xl border border-gray-200">
          <h2 className="text-2xl font-bold mb-2">{experience.title}</h2>
          {experience.description && (
            <p className="text-gray-600 mb-4">{experience.description}</p>
          )}
          <div className="text-sm text-gray-500">
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
          <div className="flex items-center gap-4 bg-white/95 backdrop-blur-md rounded-full px-6 py-3 shadow-xl border border-gray-200">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-700"
              aria-label="Previous asset"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-gray-800 font-medium min-w-[120px] text-center">
              <div className="text-lg font-bold">
                {selectedIndex + 1} / {experience.assets.length}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {selectedAsset.assetType}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-700"
              aria-label="Next asset"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Asset Info - Compact and subtle */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 max-w-sm">
        <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 text-white text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="font-medium truncate max-w-[150px]">
              {selectedAsset.name || `Asset ${selectedIndex + 1}`}
            </span>
            <span className="text-gray-300">•</span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full capitalize text-[10px]">
              {selectedAsset.assetType}
            </span>
          </div>
        </div>
      </div>

      {/* Zoom Controls - Subtle buttons */}
      <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all text-white shadow-lg"
          aria-label="Zoom in"
          title="Acercar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all text-white shadow-lg"
          aria-label="Zoom out"
          title="Alejar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button
          onClick={handleRotateAsset}
          className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all text-white shadow-lg"
          aria-label="Rotate asset"
          title="Rotar objeto"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
