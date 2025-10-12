"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
  Camera, 
  Maximize, 
  RotateCcw, 
  Mic, 
  Volume2, 
  Hand, 
  Zap,
  Settings,
  Info,
  Gamepad2
} from 'lucide-react';
import { AdvancedARTracker } from '@/lib/ar-tracker';
import { AdvancedARRenderer } from '@/lib/ar-renderer';
import { AdvancedARInteractions } from '@/lib/ar-interactions';

interface AdvancedARViewerProps {
  assetUrl?: string;
  assetType: 'image' | 'video' | 'text' | 'model3d';
  assetContent?: string;
  alt?: string;
  enableAdvancedFeatures?: boolean;
  enableVoiceCommands?: boolean;
  enableSpatialAudio?: boolean;
  enableHapticFeedback?: boolean;
  enableGestureControls?: boolean;
  arScale?: string;
  arPlacement?: 'floor' | 'wall';
  className?: string;
  onTrackingStateChange?: (state: any) => void;
  onInteraction?: (event: any) => void;
}

interface ARState {
  isInitialized: boolean;
  isTracking: boolean;
  trackingQuality: 'poor' | 'normal' | 'good' | 'excellent';
  isInAR: boolean;
  planesDetected: number;
  markersDetected: number;
  lightEstimation: any;
  selectedObject: string | null;
  isListening: boolean;
  spatialAudioEnabled: boolean;
  error: string | null;
}

export function AdvancedARViewer({
  assetUrl,
  assetType,
  assetContent,
  alt,
  enableAdvancedFeatures = true,
  enableVoiceCommands = true,
  enableSpatialAudio = true,
  enableHapticFeedback = true,
  enableGestureControls = true,
  arScale = "auto",
  arPlacement = "floor",
  className = "",
  onTrackingStateChange,
  onInteraction
}: AdvancedARViewerProps) {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const arTrackerRef = useRef<AdvancedARTracker | null>(null);
  const arRendererRef = useRef<AdvancedARRenderer | null>(null);
  const arInteractionsRef = useRef<AdvancedARInteractions | null>(null);
  
  const [arState, setARState] = useState<ARState>({
    isInitialized: false,
    isTracking: false,
    trackingQuality: 'poor',
    isInAR: false,
    planesDetected: 0,
    markersDetected: 0,
    lightEstimation: null,
    selectedObject: null,
    isListening: false,
    spatialAudioEnabled: false,
    error: null
  });
  
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceStats, setPerformanceStats] = useState({
    fps: 0,
    memory: 0,
    renderTime: 0
  });

  // Initialize AR systems
  const initializeARSystems = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      setIsLoading(true);
      setLoadingProgress(10);

      // Initialize AR Tracker
      arTrackerRef.current = new AdvancedARTracker();
      const trackerInitialized = await arTrackerRef.current.initialize(canvasRef.current);
      
      if (!trackerInitialized) {
        throw new Error('Failed to initialize AR tracking');
      }
      
      setLoadingProgress(40);

      // Initialize AR Renderer
      arRendererRef.current = new AdvancedARRenderer(canvasRef.current, {
        enableShadows: enableAdvancedFeatures,
        enableOcclusion: enableAdvancedFeatures,
        enableReflections: enableAdvancedFeatures,
        enableLightEstimation: enableAdvancedFeatures,
        enablePostProcessing: enableAdvancedFeatures,
        antiAliasing: true
      });

      setLoadingProgress(70);

      // Initialize AR Interactions
      if (enableGestureControls) {
        arInteractionsRef.current = new AdvancedARInteractions(
          canvasRef.current,
          arRendererRef.current.getCamera(),
          arRendererRef.current.getScene(),
          {
            enableTouchGestures: enableGestureControls,
            enableVoiceCommands: enableVoiceCommands,
            enableSpatialAudio: enableSpatialAudio,
            hapticFeedback: enableHapticFeedback
          }
        );

        // Set up interaction event handlers
        setupInteractionHandlers();
      }

      setLoadingProgress(90);

      // Load AR content
      await loadARContent();

      // Set up AR tracker event handlers
      setupTrackerHandlers();

      setLoadingProgress(100);
      setIsLoading(false);
      
      setARState(prev => ({ 
        ...prev, 
        isInitialized: true,
        error: null
      }));

    } catch (error) {
      console.error('Failed to initialize AR systems:', error);
      setARState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown initialization error'
      }));
      setIsLoading(false);
    }
  }, [assetUrl, assetType, enableAdvancedFeatures, enableGestureControls, enableVoiceCommands, enableSpatialAudio, enableHapticFeedback]);

  const setupTrackerHandlers = useCallback(() => {
    if (!arTrackerRef.current) return;

    arTrackerRef.current.on('trackingStarted', () => {
      setARState(prev => ({ ...prev, isTracking: true }));
    });

    arTrackerRef.current.on('trackingStopped', () => {
      setARState(prev => ({ ...prev, isTracking: false }));
    });

    arTrackerRef.current.on('trackingQualityChanged', (quality: string) => {
      setARState(prev => ({ 
        ...prev, 
        trackingQuality: quality as ARState['trackingQuality']
      }));
      
      if (onTrackingStateChange) {
        onTrackingStateChange({ quality });
      }
    });

    arTrackerRef.current.on('planesDetected', (planes: any[]) => {
      setARState(prev => ({ ...prev, planesDetected: planes.length }));
    });

    arTrackerRef.current.on('markersDetected', (markers: any[]) => {
      setARState(prev => ({ ...prev, markersDetected: markers.length }));
    });

    arTrackerRef.current.on('deviceMotionUpdate', (motion: any) => {
      // Update camera position based on device motion
      if (arRendererRef.current) {
        const camera = arRendererRef.current.getCamera();
        // Apply subtle motion compensation
        camera.position.add(new THREE.Vector3(
          motion.acceleration.x * 0.001,
          motion.acceleration.y * 0.001,
          motion.acceleration.z * 0.001
        ));
      }
    });
  }, [onTrackingStateChange]);

  const setupInteractionHandlers = useCallback(() => {
    if (!arInteractionsRef.current) return;

    arInteractionsRef.current.on('objectSelected', (event: any) => {
      setARState(prev => ({ ...prev, selectedObject: event.id }));
      
      if (onInteraction) {
        onInteraction({ type: 'select', ...event });
      }
    });

    arInteractionsRef.current.on('objectDeselected', () => {
      setARState(prev => ({ ...prev, selectedObject: null }));
    });

    arInteractionsRef.current.on('gesture', (gesture: any) => {
      if (onInteraction) {
        onInteraction({ type: 'gesture', ...gesture });
      }
    });

    arInteractionsRef.current.on('voiceCommand', (command: any) => {
      if (onInteraction) {
        onInteraction({ type: 'voice', ...command });
      }
    });

    arInteractionsRef.current.on('objectDrag', (event: any) => {
      if (arRendererRef.current) {
        arRendererRef.current.updateObjectPosition(event.id, event.delta);
      }
    });

    arInteractionsRef.current.on('objectScale', (event: any) => {
      if (arRendererRef.current) {
        const currentScale = new THREE.Vector3(1, 1, 1);
        currentScale.multiplyScalar(event.scale);
        arRendererRef.current.updateObjectScale(event.id, currentScale);
      }
    });
  }, [onInteraction]);

  const loadARContent = useCallback(async () => {
    if (!arRendererRef.current || !assetUrl) return;

    try {
      let object3D: THREE.Object3D;

      switch (assetType) {
        case 'model3d':
          object3D = await loadModel3D(assetUrl);
          break;
        case 'image':
          object3D = await loadImagePlane(assetUrl);
          break;
        case 'video':
          object3D = await loadVideoPlane(assetUrl);
          break;
        case 'text':
          object3D = await loadTextMesh(assetContent || 'AR Text');
          break;
        default:
          throw new Error(`Unsupported asset type: ${assetType}`);
      }

      // Add object to AR scene
      const objectId = arRendererRef.current.addARObject({
        mesh: object3D,
        anchor: new THREE.Vector3(0, 0, -2),
        scale: new THREE.Vector3(1, 1, 1),
        castShadow: true,
        receiveShadow: true
      });

      // Enable floating animation for visual appeal
      if (enableAdvancedFeatures) {
        arRendererRef.current.enableFloatingAnimation(objectId, true);
      }

    } catch (error) {
      console.error('Failed to load AR content:', error);
      throw error;
    }
  }, [assetUrl, assetType, assetContent, enableAdvancedFeatures]);

  const loadModel3D = async (url: string): Promise<THREE.Object3D> => {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Enhance materials for better AR appearance
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMapIntensity = 1.0;
                child.material.roughness = 0.7;
                child.material.metalness = 0.1;
              }
            }
          });
          
          // Scale model appropriately for AR
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxSize = Math.max(size.x, size.y, size.z);
          if (maxSize > 2) {
            model.scale.multiplyScalar(2 / maxSize);
          }
          
          resolve(model);
        },
        (progress) => {
          console.log('Loading progress:', progress);
        },
        reject
      );
    });
  };

  const loadImagePlane = async (url: string): Promise<THREE.Object3D> => {
    const texture = new THREE.TextureLoader().load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const geometry = new THREE.PlaneGeometry(2, 1.5);
    const plane = new THREE.Mesh(geometry, material);
    
    return plane;
  };

  const loadVideoPlane = async (url: string): Promise<THREE.Object3D> => {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    
    const geometry = new THREE.PlaneGeometry(2, 1.5);
    const plane = new THREE.Mesh(geometry, material);
    
    // Auto-play video when visible
    plane.userData.video = video;
    
    return plane;
  };

  const loadTextMesh = async (text: string): Promise<THREE.Object3D> => {
    const { FontLoader } = await import('three/examples/jsm/loaders/FontLoader.js');
    const { TextGeometry } = await import('three/examples/jsm/geometries/TextGeometry.js');
    
    const fontLoader = new FontLoader();
    
    return new Promise((resolve, reject) => {
      fontLoader.load(
        'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
        (font) => {
          const geometry = new TextGeometry(text, {
            font: font,
            size: 0.2,
            height: 0.05,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelSegments: 5
          });
          
          geometry.computeBoundingBox();
          const centerOffsetX = -0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x);
          const centerOffsetY = -0.5 * (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y);
          
          const material = new THREE.MeshPhongMaterial({
            color: 0x4080ff,
            shininess: 100
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.x = centerOffsetX;
          mesh.position.y = centerOffsetY;
          
          resolve(mesh);
        },
        undefined,
        reject
      );
    });
  };

  // AR Control Functions
  const startARSession = useCallback(async () => {
    if (!arTrackerRef.current) return;
    
    try {
      const started = arTrackerRef.current.startTracking();
      if (started) {
        setARState(prev => ({ ...prev, isInAR: true }));
      }
    } catch (error) {
      console.error('Failed to start AR session:', error);
    }
  }, []);

  const stopARSession = useCallback(() => {
    if (arTrackerRef.current) {
      arTrackerRef.current.stopTracking();
      setARState(prev => ({ ...prev, isInAR: false }));
    }
  }, []);

  const toggleVoiceCommands = useCallback(() => {
    if (!arInteractionsRef.current) return;
    
    if (arState.isListening) {
      arInteractionsRef.current.stopListening();
      setARState(prev => ({ ...prev, isListening: false }));
    } else {
      arInteractionsRef.current.startListening();
      setARState(prev => ({ ...prev, isListening: true }));
    }
  }, [arState.isListening]);

  const resetView = useCallback(() => {
    if (arRendererRef.current) {
      const camera = arRendererRef.current.getCamera();
      camera.position.set(0, 1.6, 0);
      camera.rotation.set(0, 0, 0);
    }
  }, []);

  // Performance monitoring
  useEffect(() => {
    const updatePerformanceStats = () => {
      if (arRendererRef.current) {
        const renderer = arRendererRef.current.getRenderer();
        const info = renderer.info;
        
        setPerformanceStats({
          fps: Math.round(1000 / 16.67), // Approximate FPS
          memory: (performance as any).memory?.usedJSHeapSize / 1048576 || 0,
          renderTime: info.render.calls
        });
      }
    };

    const interval = setInterval(updatePerformanceStats, 1000);
    return () => clearInterval(interval);
  }, [arState.isInitialized]);

  // Initialize AR systems on mount
  useEffect(() => {
    initializeARSystems();

    return () => {
      // Cleanup
      if (arInteractionsRef.current) {
        arInteractionsRef.current.dispose();
      }
      if (arRendererRef.current) {
        arRendererRef.current.dispose();
      }
      if (arTrackerRef.current) {
        arTrackerRef.current.dispose();
      }
    };
  }, [initializeARSystems]);

  const getTrackingQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'normal': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full min-h-[400px] ${className}`}>
      {/* Main AR Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-black/10 backdrop-blur-sm rounded-xl touch-none"
      />

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl"
          >
            <div className="text-white text-center">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-lg font-medium mb-2">Inicializando AR Avanzado</p>
              <div className="w-64 h-2 bg-white/20 rounded-full mb-2">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  data-progress={loadingProgress}
                />
              </div>
              <p className="text-sm text-white/70">{loadingProgress}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {arState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm rounded-xl">
          <div className="bg-red-500 text-white p-4 rounded-lg max-w-sm text-center">
            <p className="font-medium mb-2">Error AR</p>
            <p className="text-sm">{arState.error}</p>
          </div>
        </div>
      )}

      {/* AR Status Indicators */}
      {arState.isInitialized && !isLoading && (
        <>
          {/* Tracking Quality Indicator */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className={`px-3 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm flex items-center gap-2`}>
              <div className={`w-2 h-2 rounded-full ${arState.isTracking ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className={getTrackingQualityColor(arState.trackingQuality)}>
                {arState.trackingQuality.toUpperCase()}
              </span>
            </div>

            {/* Feature Status */}
            {enableAdvancedFeatures && (
              <div className="flex flex-col gap-1">
                <div className="px-2 py-1 bg-black/60 text-white text-xs rounded backdrop-blur-sm flex items-center gap-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  Planos: {arState.planesDetected}
                </div>
                <div className="px-2 py-1 bg-black/60 text-white text-xs rounded backdrop-blur-sm flex items-center gap-1">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  Marcadores: {arState.markersDetected}
                </div>
              </div>
            )}
          </div>

          {/* Performance Stats */}
          {showAdvancedControls && (
            <div className="absolute top-4 right-4 bg-black/60 text-white text-xs rounded p-2 backdrop-blur-sm">
              <div>FPS: {performanceStats.fps}</div>
              <div>Memoria: {performanceStats.memory.toFixed(1)}MB</div>
              <div>Renders: {performanceStats.renderTime}</div>
            </div>
          )}

          {/* Main AR Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            {/* AR Session Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={arState.isInAR ? stopARSession : startARSession}
              className={`p-3 rounded-full backdrop-blur-sm border border-white/20 ${
                arState.isInAR 
                  ? 'bg-green-500/80 text-white' 
                  : 'bg-blue-500/80 text-white'
              }`}
            >
              <Camera className="w-5 h-5" />
            </motion.button>

            {/* Voice Commands Toggle */}
            {enableVoiceCommands && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleVoiceCommands}
                className={`p-3 rounded-full backdrop-blur-sm border border-white/20 ${
                  arState.isListening 
                    ? 'bg-red-500/80 text-white' 
                    : 'bg-gray-500/80 text-white'
                }`}
              >
                <Mic className="w-5 h-5" />
              </motion.button>
            )}

            {/* Reset View */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetView}
              className="p-3 bg-gray-500/80 text-white rounded-full backdrop-blur-sm border border-white/20"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>

            {/* Advanced Controls Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="p-3 bg-purple-500/80 text-white rounded-full backdrop-blur-sm border border-white/20"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Advanced Controls Panel */}
          <AnimatePresence>
            {showAdvancedControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-lg rounded-lg p-4 text-white"
              >
                <div className="grid grid-cols-2 gap-3 w-64">
                  <button className="flex items-center gap-2 p-2 bg-white/10 rounded hover:bg-white/20 transition-colors">
                    <Gamepad2 className="w-4 h-4" />
                    <span className="text-sm">Gestos</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 bg-white/10 rounded hover:bg-white/20 transition-colors">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm">Audio 3D</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 bg-white/10 rounded hover:bg-white/20 transition-colors">
                    <Hand className="w-4 h-4" />
                    <span className="text-sm">Tracking</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 bg-white/10 rounded hover:bg-white/20 transition-colors">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Efectos</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Command Feedback */}
          {arState.isListening && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-red-500/20 border-2 border-red-500 rounded-full p-8">
                <Mic className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
            </div>
          )}

          {/* AR Instructions */}
          <div className="absolute bottom-4 right-4">
            <motion.div
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="bg-black/60 text-white text-xs rounded p-2 backdrop-blur-sm max-w-48"
            >
              <p className="font-medium mb-1">🎯 Controles AR:</p>
              <div className="space-y-1">
                <p>• Toca para seleccionar</p>
                <p>• Arrastra para mover</p>
                <p>• Pellizca para escalar</p>
                <p>• Rota con 2 dedos</p>
                {enableVoiceCommands && <p>• Comandos de voz</p>}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdvancedARViewer;