// Performance optimization utilities for AR applications
import * as THREE from "three";

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderCalls: number;
  triangles: number;
  textureMemory: number;
  webGLInfo: any;
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  platform: "mobile" | "tablet" | "desktop";
  gpu: string;
  maxTextureSize: number;
  webGLVersion: number;
  maxVertexUniforms: number;
  maxFragmentUniforms: number;
  maxVaryingVectors: number;
  supportsFloatTextures: boolean;
  supportsHalfFloatTextures: boolean;
}

export interface OptimizationSettings {
  shadowMapSize: number;
  pixelRatio: number;
  antialias: boolean;
  enablePostProcessing: boolean;
  lodLevels: number;
  cullingDistance: number;
  maxLights: number;
  textureQuality: "low" | "medium" | "high";
  modelComplexity: "low" | "medium" | "high";
  enableOcclusion: boolean;
  frameRateTarget: number;
}

export class ARPerformanceOptimizer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private settings: OptimizationSettings;
  private metrics: PerformanceMetrics;
  private frameHistory: number[] = [];
  private lastTime = 0;
  private frameCount = 0;
  private deviceInfo: DeviceInfo;

  // Performance monitoring
  private performanceObserver?: PerformanceObserver;
  private memoryInfo: any;

  // Object pools for memory efficiency
  private objectPools = new Map<string, any[]>();

  // LOD management
  private lodObjects = new Map<string, THREE.LOD>();

  // Culling and frustum
  private frustum = new THREE.Frustum();
  private cameraMatrix = new THREE.Matrix4();

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    // Detect device capabilities
    this.deviceInfo = this.detectDevice();

    // Set initial optimization settings based on device
    this.settings = this.getOptimalSettings(this.deviceInfo);

    // Initialize metrics
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 0,
      renderCalls: 0,
      triangles: 0,
      textureMemory: 0,
      webGLInfo: {},
      deviceInfo: this.deviceInfo,
    };

    // Apply initial optimizations
    this.applyOptimizations();

    // Start monitoring
    this.startPerformanceMonitoring();
  }

  private detectDevice(): DeviceInfo {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

    if (!gl) {
      throw new Error("WebGL not supported");
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : "Unknown GPU";

    // Detect platform
    const userAgent = navigator.userAgent;
    let platform: "mobile" | "tablet" | "desktop" = "desktop";

    if (/Mobi|Android/i.test(userAgent)) {
      platform = "mobile";
    } else if (/Tablet|iPad/i.test(userAgent)) {
      platform = "tablet";
    }

    // Check WebGL capabilities
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    const maxFragmentUniforms = gl.getParameter(
      gl.MAX_FRAGMENT_UNIFORM_VECTORS
    );
    const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);

    // Check extension support
    const floatTextureExt = gl.getExtension("OES_texture_float");
    const halfFloatTextureExt = gl.getExtension("OES_texture_half_float");

    return {
      platform,
      gpu,
      maxTextureSize,
      webGLVersion: gl instanceof WebGL2RenderingContext ? 2 : 1,
      maxVertexUniforms,
      maxFragmentUniforms,
      maxVaryingVectors,
      supportsFloatTextures: !!floatTextureExt,
      supportsHalfFloatTextures: !!halfFloatTextureExt,
    };
  }

  private getOptimalSettings(deviceInfo: DeviceInfo): OptimizationSettings {
    const baseSettings: OptimizationSettings = {
      shadowMapSize: 1024,
      pixelRatio: 1,
      antialias: true,
      enablePostProcessing: true,
      lodLevels: 3,
      cullingDistance: 100,
      maxLights: 8,
      textureQuality: "high",
      modelComplexity: "high",
      enableOcclusion: true,
      frameRateTarget: 60,
    };

    // Adjust based on platform
    switch (deviceInfo.platform) {
      case "mobile":
        return {
          ...baseSettings,
          shadowMapSize: 512,
          pixelRatio: Math.min(window.devicePixelRatio, 1.5),
          antialias: false,
          enablePostProcessing: false,
          lodLevels: 2,
          cullingDistance: 50,
          maxLights: 4,
          textureQuality: "medium",
          modelComplexity: "low",
          enableOcclusion: false,
          frameRateTarget: 30,
        };

      case "tablet":
        return {
          ...baseSettings,
          shadowMapSize: 1024,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
          lodLevels: 3,
          cullingDistance: 75,
          maxLights: 6,
          textureQuality: "medium",
          modelComplexity: "medium",
          frameRateTarget: 45,
        };

      default: // desktop
        // Check GPU performance tier
        if (deviceInfo.gpu.toLowerCase().includes("intel")) {
          return {
            ...baseSettings,
            shadowMapSize: 1024,
            enablePostProcessing: true,
            textureQuality: "medium",
            frameRateTarget: 45,
          };
        }

        return baseSettings;
    }
  }

  private applyOptimizations(): void {
    // Renderer optimizations
    this.renderer.setPixelRatio(this.settings.pixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Shadow map size
    this.scene.traverse((object) => {
      if (
        object instanceof THREE.DirectionalLight ||
        object instanceof THREE.SpotLight
      ) {
        if (object.shadow) {
          object.shadow.mapSize.setScalar(this.settings.shadowMapSize);
        }
      }
    });

    // Texture optimization
    this.optimizeTextures();

    // Geometry optimization
    this.optimizeGeometries();

    // Material optimization
    this.optimizeMaterials();
  }

  private optimizeTextures(): void {
    const textureManager = this.renderer.properties;

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material) => {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhysicalMaterial
          ) {
            // Optimize textures based on quality setting
            [
              material.map,
              material.normalMap,
              material.roughnessMap,
              material.metalnessMap,
            ].forEach((texture) => {
              if (texture) {
                this.optimizeTexture(texture);
              }
            });
          }
        });
      }
    });
  }

  private optimizeTexture(texture: THREE.Texture): void {
    switch (this.settings.textureQuality) {
      case "low":
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        break;

      case "medium":
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        break;

      case "high":
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = Math.min(
          4,
          this.renderer.capabilities.getMaxAnisotropy()
        );
        break;
    }
  }

  private optimizeGeometries(): void {
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const geometry = object.geometry;

        // Create LOD versions if needed
        if (this.settings.lodLevels > 1) {
          this.createLODForObject(object);
        }

        // Merge geometries where possible
        if (geometry instanceof THREE.BufferGeometry) {
          geometry.computeBoundingSphere();

          // Remove unnecessary attributes for performance
          if (this.settings.modelComplexity === "low") {
            geometry.deleteAttribute("uv2");
            geometry.deleteAttribute("tangent");
          }
        }
      }
    });
  }

  private createLODForObject(object: THREE.Mesh): void {
    if (this.lodObjects.has(object.uuid)) return;

    const lod = new THREE.LOD();
    lod.position.copy(object.position);
    lod.rotation.copy(object.rotation);
    lod.scale.copy(object.scale);

    // High detail (close)
    lod.addLevel(object.clone(), 0);

    // Medium detail
    if (this.settings.lodLevels >= 2) {
      const mediumDetail = this.createReducedDetailMesh(object, 0.5);
      lod.addLevel(mediumDetail, 20);
    }

    // Low detail (far)
    if (this.settings.lodLevels >= 3) {
      const lowDetail = this.createReducedDetailMesh(object, 0.25);
      lod.addLevel(lowDetail, 50);
    }

    // Replace original object with LOD
    if (object.parent) {
      object.parent.remove(object);
      object.parent.add(lod);
    }

    this.lodObjects.set(object.uuid, lod);
  }

  private createReducedDetailMesh(
    original: THREE.Mesh,
    complexity: number
  ): THREE.Mesh {
    // Simple approach: use the same geometry but reduce texture resolution
    const reducedMesh = original.clone();

    if (reducedMesh.material instanceof THREE.Material) {
      const material = reducedMesh.material.clone();

      // Reduce material complexity
      if (material instanceof THREE.MeshStandardMaterial) {
        if (complexity < 0.5) {
          material.normalMap = null;
          material.roughnessMap = null;
          material.metalnessMap = null;
        }
      }

      reducedMesh.material = material;
    }

    return reducedMesh;
  }

  private optimizeMaterials(): void {
    const materialCache = new Map<string, THREE.Material>();

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material, index) => {
          // Create material signature for caching
          const signature = this.getMaterialSignature(material);

          if (materialCache.has(signature)) {
            // Reuse existing material
            if (Array.isArray(object.material)) {
              object.material[index] = materialCache.get(signature)!;
            } else {
              object.material = materialCache.get(signature)!;
            }
          } else {
            materialCache.set(signature, material);
          }

          // Apply material-specific optimizations
          this.optimizeMaterial(material);
        });
      }
    });
  }

  private getMaterialSignature(material: THREE.Material): string {
    // Create a unique signature based on material properties
    const props = {
      type: material.type,
      color:
        material instanceof THREE.MeshStandardMaterial
          ? material.color.getHex()
          : null,
      metalness:
        material instanceof THREE.MeshStandardMaterial
          ? material.metalness
          : null,
      roughness:
        material instanceof THREE.MeshStandardMaterial
          ? material.roughness
          : null,
      // Add more properties as needed
    };

    return JSON.stringify(props);
  }

  private optimizeMaterial(material: THREE.Material): void {
    // Disable unnecessary features based on settings
    if (this.settings.modelComplexity === "low") {
      if (material instanceof THREE.MeshStandardMaterial) {
        material.normalMap = null;
        material.roughnessMap = null;
        material.metalnessMap = null;
      }
    }

    // Force material updates to be more efficient
    material.needsUpdate = false;
  }

  private startPerformanceMonitoring(): void {
    // Performance Observer for frame timing
    if ("PerformanceObserver" in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "measure") {
            this.metrics.frameTime = entry.duration;
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ["measure"] });
    }

    // Memory monitoring
    this.memoryInfo = (performance as any).memory;

    // Start monitoring loop
    this.startMonitoringLoop();
  }

  private startMonitoringLoop(): void {
    const monitor = () => {
      this.updateMetrics();
      this.adjustPerformance();

      requestAnimationFrame(monitor);
    };

    monitor();
  }

  private updateMetrics(): void {
    const now = performance.now();
    const deltaTime = now - this.lastTime;

    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime;
      this.frameHistory.push(currentFPS);

      if (this.frameHistory.length > 60) {
        // Keep last 60 frames
        this.frameHistory.shift();
      }

      // Calculate average FPS
      this.metrics.fps =
        this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
      this.metrics.frameTime = deltaTime;
    }

    this.lastTime = now;
    this.frameCount++;

    // Update render info
    const info = this.renderer.info;
    this.metrics.renderCalls = info.render.calls;
    this.metrics.triangles = info.render.triangles;

    // Update memory info
    if (this.memoryInfo) {
      this.metrics.memoryUsage = this.memoryInfo.usedJSHeapSize / 1048576; // MB
    }

    // Update texture memory (approximate)
    this.metrics.textureMemory = this.calculateTextureMemory();
  }

  private calculateTextureMemory(): number {
    let totalMemory = 0;

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial) {
            [material.map, material.normalMap, material.roughnessMap].forEach(
              (texture) => {
                if (texture && texture.image) {
                  const width = texture.image.width || 512;
                  const height = texture.image.height || 512;
                  totalMemory += width * height * 4; // 4 bytes per pixel (RGBA)
                }
              }
            );
          }
        });
      }
    });

    return totalMemory / 1048576; // Convert to MB
  }

  private adjustPerformance(): void {
    // Only adjust every 60 frames
    if (this.frameCount % 60 !== 0) return;

    const avgFPS = this.metrics.fps;
    const targetFPS = this.settings.frameRateTarget;

    if (avgFPS < targetFPS * 0.8) {
      // Performance is poor, reduce quality
      this.reduceQuality();
    } else if (avgFPS > targetFPS * 1.1) {
      // Performance is good, can increase quality
      this.increaseQuality();
    }
  }

  private reduceQuality(): void {
    console.log("Reducing quality to improve performance...");

    // Reduce shadow map size
    if (this.settings.shadowMapSize > 256) {
      this.settings.shadowMapSize /= 2;
      this.updateShadowMaps();
    }

    // Disable post-processing
    if (this.settings.enablePostProcessing) {
      this.settings.enablePostProcessing = false;
    }

    // Reduce texture quality
    if (this.settings.textureQuality === "high") {
      this.settings.textureQuality = "medium";
      this.optimizeTextures();
    } else if (this.settings.textureQuality === "medium") {
      this.settings.textureQuality = "low";
      this.optimizeTextures();
    }

    // Reduce model complexity
    if (this.settings.modelComplexity === "high") {
      this.settings.modelComplexity = "medium";
      this.optimizeMaterials();
    } else if (this.settings.modelComplexity === "medium") {
      this.settings.modelComplexity = "low";
      this.optimizeMaterials();
    }
  }

  private increaseQuality(): void {
    console.log("Increasing quality due to good performance...");

    // Increase texture quality
    if (this.settings.textureQuality === "low") {
      this.settings.textureQuality = "medium";
      this.optimizeTextures();
    } else if (
      this.settings.textureQuality === "medium" &&
      this.deviceInfo.platform === "desktop"
    ) {
      this.settings.textureQuality = "high";
      this.optimizeTextures();
    }

    // Increase shadow map size
    if (
      this.settings.shadowMapSize < 2048 &&
      this.deviceInfo.platform === "desktop"
    ) {
      this.settings.shadowMapSize *= 2;
      this.updateShadowMaps();
    }
  }

  private updateShadowMaps(): void {
    this.scene.traverse((object) => {
      if (
        object instanceof THREE.DirectionalLight ||
        object instanceof THREE.SpotLight
      ) {
        if (object.shadow) {
          object.shadow.mapSize.setScalar(this.settings.shadowMapSize);
          object.shadow.map?.dispose();
          object.shadow.map = null;
        }
      }
    });
  }

  // Frustum culling optimization
  public updateFrustumCulling(): void {
    this.cameraMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.cameraMatrix);

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry.boundingSphere) {
          const isVisible = this.frustum.intersectsSphere(
            object.geometry.boundingSphere
          );
          object.visible = isVisible;
        }
      }
    });
  }

  // Object pooling for memory efficiency
  public getFromPool<T>(poolName: string, createFn: () => T): T {
    if (!this.objectPools.has(poolName)) {
      this.objectPools.set(poolName, []);
    }

    const pool = this.objectPools.get(poolName)!;

    if (pool.length > 0) {
      return pool.pop() as T;
    }

    return createFn();
  }

  public returnToPool<T>(poolName: string, object: T): void {
    if (!this.objectPools.has(poolName)) {
      this.objectPools.set(poolName, []);
    }

    const pool = this.objectPools.get(poolName)!;
    if (pool.length < 100) {
      // Limit pool size
      pool.push(object);
    }
  }

  // Public API
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getSettings(): OptimizationSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<OptimizationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.applyOptimizations();
  }

  public dispose(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    this.objectPools.clear();
    this.lodObjects.clear();
  }
}

export const createPerformanceOptimizer = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => new ARPerformanceOptimizer(renderer, scene, camera);
