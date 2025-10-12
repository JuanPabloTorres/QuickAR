// Advanced AR tracking and plane detection utilities
import * as THREE from 'three';

export interface PlaneDetectionResult {
  orientation: 'horizontal' | 'vertical';
  position: THREE.Vector3;
  normal: THREE.Vector3;
  size: { width: number; height: number };
  confidence: number;
}

export interface MarkerDetectionResult {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  corners: THREE.Vector2[];
  confidence: number;
}

export interface ARTrackingState {
  isTracking: boolean;
  quality: 'poor' | 'normal' | 'good' | 'excellent';
  planes: PlaneDetectionResult[];
  markers: MarkerDetectionResult[];
  lightEstimation?: {
    intensity: number;
    direction: THREE.Vector3;
    color: THREE.Color;
  };
  deviceMotion?: {
    acceleration: THREE.Vector3;
    rotation: THREE.Euler;
    gravity: THREE.Vector3;
  };
}

export class AdvancedARTracker {
  private session: XRSession | null = null;
  private referenceSpace: XRReferenceSpace | null = null;
  private frame: XRFrame | null = null;
  private trackingState: ARTrackingState;
  private callbacks: Map<string, Function> = new Map();
  private isInitialized = false;
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGL2RenderingContext | null = null;
  
  // Enhanced tracking parameters
  private trackingConfig = {
    planeDetection: true,
    markerDetection: true,
    lightEstimation: true,
    deviceMotion: true,
    occlusionMesh: true,
    stabilization: true,
    minPlaneSize: 0.1, // meters
    maxPlanes: 10,
    trackingQualityThreshold: 0.7
  };

  constructor() {
    this.trackingState = {
      isTracking: false,
      quality: 'poor',
      planes: [],
      markers: []
    };
  }

  async initialize(canvas: HTMLCanvasElement): Promise<boolean> {
    try {
      this.canvas = canvas;
      this.gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
      
      if (!this.gl) {
        console.error('WebGL2 not supported');
        return false;
      }

      // Check WebXR support
      if (!navigator.xr) {
        console.warn('WebXR not supported, falling back to basic AR');
        return this.initializeFallbackAR();
      }

      // Request AR session with enhanced features
      const sessionInit: XRSessionInit = {
        requiredFeatures: ['local-floor'],
        optionalFeatures: [
          'anchors',
          'plane-detection',
          'hit-test',
          'light-estimation',
          'occlusion'
        ]
      };

      this.session = await navigator.xr.requestSession('immersive-ar', sessionInit);
      this.referenceSpace = await this.session.requestReferenceSpace('local-floor');
      
      // Set up event listeners
      this.setupSessionEventListeners();
      
      // Initialize device motion tracking
      this.initializeDeviceMotion();
      
      // Initialize marker detection
      this.initializeMarkerDetection();
      
      this.isInitialized = true;
      this.trackingState.isTracking = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize advanced AR tracking:', error);
      return this.initializeFallbackAR();
    }
  }

  private initializeFallbackAR(): boolean {
    console.log('Initializing fallback AR tracking...');
    
    // Use device orientation and basic tracking
    this.initializeDeviceMotion();
    this.startBasicTracking();
    
    this.isInitialized = true;
    this.trackingState.isTracking = true;
    this.trackingState.quality = 'normal';
    
    return true;
  }

  private setupSessionEventListeners(): void {
    if (!this.session) return;

    this.session.addEventListener('end', () => {
      this.trackingState.isTracking = false;
      this.emit('sessionEnd');
    });

    this.session.addEventListener('visibilitychange', () => {
      this.updateTrackingQuality();
    });
  }

  private initializeDeviceMotion(): void {
    // Type-safe check for iOS 13+ permission request
    if (typeof DeviceMotionEvent !== 'undefined' && 'requestPermission' in DeviceMotionEvent) {
      // iOS 13+ permission request
      (DeviceMotionEvent as any).requestPermission().then((permissionState: string) => {
        if (permissionState === 'granted') {
          this.startDeviceMotionTracking();
        }
      }).catch((error: any) => {
        console.warn('Device motion permission denied:', error);
        this.startDeviceMotionTracking(); // Try anyway for fallback
      });
    } else {
      // Android or older iOS
      this.startDeviceMotionTracking();
    }
  }

  private startDeviceMotionTracking(): void {
    window.addEventListener('devicemotion', (event) => {
      if (!event.accelerationIncludingGravity || !event.rotationRate) return;

      const acceleration = new THREE.Vector3(
        event.accelerationIncludingGravity.x || 0,
        event.accelerationIncludingGravity.y || 0,
        event.accelerationIncludingGravity.z || 0
      );

      const rotation = new THREE.Euler(
        (event.rotationRate.beta || 0) * Math.PI / 180,
        (event.rotationRate.gamma || 0) * Math.PI / 180,
        (event.rotationRate.alpha || 0) * Math.PI / 180
      );

      this.trackingState.deviceMotion = {
        acceleration,
        rotation,
        gravity: acceleration.clone().normalize()
      };

      this.emit('deviceMotionUpdate', this.trackingState.deviceMotion);
    });

    window.addEventListener('deviceorientation', (event) => {
      // Additional orientation tracking for compass/magnetometer
      const orientation = {
        alpha: event.alpha || 0, // Compass heading
        beta: event.beta || 0,   // Device tilt front/back
        gamma: event.gamma || 0  // Device tilt left/right
      };

      this.emit('deviceOrientationUpdate', orientation);
    });
  }

  private initializeMarkerDetection(): void {
    // Initialize QR/ArUco marker detection using WebRTC getUserMedia
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      } 
    }).then(stream => {
      this.startMarkerTracking(stream);
    }).catch(error => {
      console.warn('Camera access denied for marker tracking:', error);
    });
  }

  private startMarkerTracking(stream: MediaStream): void {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const detectMarkers = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const markers = this.processMarkerDetection(imageData);
        
        if (markers.length > 0) {
          this.trackingState.markers = markers;
          this.emit('markersDetected', markers);
        }
      }
      
      if (this.trackingState.isTracking) {
        requestAnimationFrame(detectMarkers);
      }
    };

    video.addEventListener('loadedmetadata', () => {
      detectMarkers();
    });
  }

  private processMarkerDetection(imageData: ImageData): MarkerDetectionResult[] {
    // Simplified marker detection - in production, use libraries like js-aruco or cv.js
    const markers: MarkerDetectionResult[] = [];
    
    // Basic QR code detection algorithm
    const { data, width, height } = imageData;
    const threshold = 128;
    
    // Convert to grayscale and apply threshold
    const binary = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      binary[i / 4] = gray < threshold ? 0 : 255;
    }
    
    // Find potential marker regions (simplified)
    const regions = this.findMarkerRegions(binary, width, height);
    
    regions.forEach((region, index) => {
      const marker: MarkerDetectionResult = {
        id: `marker_${index}`,
        position: new THREE.Vector3(
          (region.centerX - width / 2) / width,
          (height / 2 - region.centerY) / height,
          -1
        ),
        rotation: new THREE.Euler(0, 0, 0),
        corners: region.corners,
        confidence: region.confidence
      };
      
      markers.push(marker);
    });
    
    return markers;
  }

  private findMarkerRegions(binary: Uint8Array, width: number, height: number): any[] {
    // Simplified region detection - in production, use computer vision libraries
    const regions: any[] = [];
    const visited = new Set<number>();
    
    for (let y = 0; y < height; y += 10) {
      for (let x = 0; x < width; x += 10) {
        const index = y * width + x;
        if (!visited.has(index) && binary[index] === 0) {
          const region = this.floodFill(binary, width, height, x, y, visited);
          if (region.size > 100 && region.size < 10000) {
            regions.push({
              centerX: region.centerX,
              centerY: region.centerY,
              size: region.size,
              corners: [
                new THREE.Vector2(region.minX, region.minY),
                new THREE.Vector2(region.maxX, region.minY),
                new THREE.Vector2(region.maxX, region.maxY),
                new THREE.Vector2(region.minX, region.maxY)
              ],
              confidence: Math.min(region.size / 1000, 1.0)
            });
          }
        }
      }
    }
    
    return regions;
  }

  private floodFill(binary: Uint8Array, width: number, height: number, startX: number, startY: number, visited: Set<number>): any {
    const stack = [{ x: startX, y: startY }];
    let size = 0;
    let sumX = 0, sumY = 0;
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    
    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const index = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height || visited.has(index) || binary[index] !== 0) {
        continue;
      }
      
      visited.add(index);
      size++;
      sumX += x;
      sumY += y;
      
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      stack.push({ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 });
    }
    
    return {
      size,
      centerX: sumX / size,
      centerY: sumY / size,
      minX, maxX, minY, maxY
    };
  }

  private startBasicTracking(): void {
    // Fallback tracking using basic algorithms
    const tick = () => {
      this.updateTrackingQuality();
      this.detectBasicPlanes();
      
      if (this.trackingState.isTracking) {
        requestAnimationFrame(tick);
      }
    };
    
    tick();
  }

  private detectBasicPlanes(): void {
    // Simulate plane detection based on device motion
    if (!this.trackingState.deviceMotion) return;
    
    const { acceleration, gravity } = this.trackingState.deviceMotion;
    
    // Detect if device is pointing at a horizontal surface
    const verticalComponent = Math.abs(gravity.y);
    
    if (verticalComponent > 0.8) {
      const plane: PlaneDetectionResult = {
        orientation: 'horizontal',
        position: new THREE.Vector3(0, -1, -2),
        normal: new THREE.Vector3(0, 1, 0),
        size: { width: 2, height: 2 },
        confidence: Math.min(verticalComponent, 1.0)
      };
      
      this.trackingState.planes = [plane];
      this.emit('planesDetected', [plane]);
    }
  }

  private updateTrackingQuality(): void {
    let qualityScore = 0.5; // Base score
    
    // Factor in plane detection
    if (this.trackingState.planes.length > 0) {
      qualityScore += 0.3 * Math.min(this.trackingState.planes.length / 3, 1);
    }
    
    // Factor in marker detection
    if (this.trackingState.markers.length > 0) {
      qualityScore += 0.2 * Math.min(this.trackingState.markers.length / 2, 1);
    }
    
    // Determine quality level
    if (qualityScore < 0.3) this.trackingState.quality = 'poor';
    else if (qualityScore < 0.6) this.trackingState.quality = 'normal';
    else if (qualityScore < 0.8) this.trackingState.quality = 'good';
    else this.trackingState.quality = 'excellent';
    
    this.emit('trackingQualityChanged', this.trackingState.quality);
  }

  // Public methods
  getTrackingState(): ARTrackingState {
    return { ...this.trackingState };
  }

  startTracking(): boolean {
    if (!this.isInitialized) return false;
    
    this.trackingState.isTracking = true;
    this.emit('trackingStarted');
    return true;
  }

  stopTracking(): void {
    this.trackingState.isTracking = false;
    if (this.session) {
      this.session.end();
    }
    this.emit('trackingStopped');
  }

  on(event: string, callback: Function): void {
    this.callbacks.set(event, callback);
  }

  private emit(event: string, data?: any): void {
    const callback = this.callbacks.get(event);
    if (callback) {
      callback(data);
    }
  }

  // Hit testing for object placement
  async hitTest(screenPosition: THREE.Vector2): Promise<THREE.Vector3 | null> {
    if (!this.session || !this.referenceSpace || !this.frame) {
      return this.fallbackHitTest(screenPosition);
    }

    try {
      const hitTestSource = await this.session.requestHitTestSource({
        space: this.referenceSpace
      });
      
      const hitTestResults = this.frame.getHitTestResults(hitTestSource);
      
      if (hitTestResults.length > 0) {
        const hitResult = hitTestResults[0];
        const pose = hitResult.getPose(this.referenceSpace);
        
        if (pose) {
          return new THREE.Vector3(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          );
        }
      }
    } catch (error) {
      console.warn('Hit test failed, using fallback:', error);
    }
    
    return this.fallbackHitTest(screenPosition);
  }

  private fallbackHitTest(screenPosition: THREE.Vector2): THREE.Vector3 {
    // Simple fallback: project screen coordinates to a plane at distance
    const depth = -2; // 2 meters in front
    const x = (screenPosition.x - 0.5) * 4; // Scale to world coordinates
    const y = (0.5 - screenPosition.y) * 3; // Invert Y and scale
    
    return new THREE.Vector3(x, 0, depth);
  }

  // Light estimation
  getLightEstimation(): { intensity: number; direction: THREE.Vector3; color: THREE.Color } | null {
    if (this.trackingState.lightEstimation) {
      return this.trackingState.lightEstimation;
    }
    
    // Fallback: estimate based on time of day
    const now = new Date();
    const hour = now.getHours();
    
    let intensity = 1.0;
    if (hour < 6 || hour > 18) intensity = 0.3; // Night
    else if (hour < 8 || hour > 16) intensity = 0.7; // Dawn/Dusk
    
    return {
      intensity,
      direction: new THREE.Vector3(0, -1, -1).normalize(),
      color: new THREE.Color(0xffffff)
    };
  }

  dispose(): void {
    this.stopTracking();
    this.callbacks.clear();
    this.isInitialized = false;
  }
}

export const createARTracker = () => new AdvancedARTracker();