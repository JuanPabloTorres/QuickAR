// Advanced AR interaction system for immersive user experiences
import * as THREE from 'three';

export interface GestureEvent {
  type: 'tap' | 'drag' | 'pinch' | 'rotate' | 'swipe' | 'longpress';
  position: THREE.Vector2;
  deltaPosition?: THREE.Vector2;
  scale?: number;
  rotation?: number;
  velocity?: THREE.Vector2;
  target?: string; // AR object ID
  timestamp: number;
}

export interface InteractionConfig {
  enableTouchGestures: boolean;
  enableVoiceCommands: boolean;
  enableHandTracking: boolean;
  enableEyeTracking: boolean;
  enableSpatialAudio: boolean;
  gestureThreshold: number;
  dragSensitivity: number;
  pinchSensitivity: number;
  rotationSensitivity: number;
  hapticFeedback: boolean;
}

export interface ARAnimation {
  id: string;
  type: 'translate' | 'rotate' | 'scale' | 'morph' | 'custom';
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  loop: boolean;
  autoplay: boolean;
  keyframes: any[];
  onComplete?: () => void;
}

export class AdvancedARInteractions {
  private canvas: HTMLCanvasElement;
  private config: InteractionConfig;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private raycaster = new THREE.Raycaster();
  
  // Gesture tracking
  private touchStartTime = 0;
  private touchStartPosition = new THREE.Vector2();
  private lastTouchPosition = new THREE.Vector2();
  private touchPoints: TouchList | null = null;
  private initialDistance = 0;
  private initialRotation = 0;
  private gestureVelocity = new THREE.Vector2();
  
  // Interaction state
  private selectedObject: string | null = null;
  private isDragging = false;
  private isPinching = false;
  private isRotating = false;
  
  // Event handlers
  private callbacks = new Map<string, Function[]>();
  
  // Animation system
  private animationMixers = new Map<string, THREE.AnimationMixer>();
  private activeAnimations = new Map<string, ARAnimation>();
  
  // Audio context for spatial audio and haptics
  private audioContext?: AudioContext;
  private spatialAudioNodes = new Map<string, PannerNode>();
  
  // Voice recognition
  private speechRecognition?: any;
  private voiceCommands = new Map<string, Function>();
  
  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    config: Partial<InteractionConfig> = {}
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.scene = scene;
    
    this.config = {
      enableTouchGestures: true,
      enableVoiceCommands: true,
      enableHandTracking: false,
      enableEyeTracking: false,
      enableSpatialAudio: true,
      gestureThreshold: 10,
      dragSensitivity: 1.0,
      pinchSensitivity: 0.01,
      rotationSensitivity: 0.02,
      hapticFeedback: true,
      ...config
    };
    
    this.initialize();
  }
  
  private initialize(): void {
    if (this.config.enableTouchGestures) {
      this.setupTouchGestures();
    }
    
    if (this.config.enableVoiceCommands) {
      this.setupVoiceCommands();
    }
    
    if (this.config.enableSpatialAudio) {
      this.setupSpatialAudio();
    }
    
    if (this.config.enableHandTracking) {
      this.setupHandTracking();
    }
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }
  
  private setupTouchGestures(): void {
    // Touch start
    this.canvas.addEventListener('touchstart', (event) => {
      event.preventDefault();
      this.touchStartTime = Date.now();
      this.touchPoints = event.touches;
      
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        this.touchStartPosition.set(
          (touch.clientX / window.innerWidth) * 2 - 1,
          -(touch.clientY / window.innerHeight) * 2 + 1
        );
        this.lastTouchPosition.copy(this.touchStartPosition);
        
        // Check for object selection
        this.handleObjectSelection(this.touchStartPosition);
      } else if (event.touches.length === 2) {
        // Multi-touch gestures
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        
        this.initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        this.initialRotation = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        );
        
        this.isPinching = true;
      }
    });
    
    // Touch move
    this.canvas.addEventListener('touchmove', (event) => {
      event.preventDefault();
      
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const currentPosition = new THREE.Vector2(
          (touch.clientX / window.innerWidth) * 2 - 1,
          -(touch.clientY / window.innerHeight) * 2 + 1
        );
        
        const deltaPosition = currentPosition.clone().sub(this.lastTouchPosition);
        
        if (this.selectedObject && !this.isPinching) {
          this.isDragging = true;
          this.handleObjectDrag(this.selectedObject, deltaPosition);
        }
        
        // Calculate gesture velocity
        this.gestureVelocity = deltaPosition.clone().multiplyScalar(60); // Convert to per-second
        this.lastTouchPosition.copy(currentPosition);
        
      } else if (event.touches.length === 2) {
        // Handle pinch and rotate
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const currentRotation = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        );
        
        if (this.selectedObject) {
          // Handle pinch-to-scale
          const scaleChange = (currentDistance - this.initialDistance) * this.config.pinchSensitivity;
          this.handleObjectScale(this.selectedObject, 1 + scaleChange);
          
          // Handle rotation
          const rotationChange = (currentRotation - this.initialRotation) * this.config.rotationSensitivity;
          this.handleObjectRotation(this.selectedObject, rotationChange);
        }
      }
    });
    
    // Touch end
    this.canvas.addEventListener('touchend', (event) => {
      event.preventDefault();
      const touchDuration = Date.now() - this.touchStartTime;
      const touchDistance = this.lastTouchPosition.distanceTo(this.touchStartPosition);
      
      // Determine gesture type
      if (touchDuration < 200 && touchDistance < this.config.gestureThreshold) {
        // Tap gesture
        this.emitGesture({
          type: 'tap',
          position: this.touchStartPosition,
          target: this.selectedObject || undefined,
          timestamp: Date.now()
        });
        
        if (this.config.hapticFeedback) {
          this.triggerHapticFeedback('light');
        }
      } else if (touchDuration > 1000 && touchDistance < this.config.gestureThreshold) {
        // Long press gesture
        this.emitGesture({
          type: 'longpress',
          position: this.touchStartPosition,
          target: this.selectedObject || undefined,
          timestamp: Date.now()
        });
        
        if (this.config.hapticFeedback) {
          this.triggerHapticFeedback('heavy');
        }
      } else if (this.isDragging) {
        // Drag gesture
        this.emitGesture({
          type: 'drag',
          position: this.lastTouchPosition,
          deltaPosition: this.lastTouchPosition.clone().sub(this.touchStartPosition),
          velocity: this.gestureVelocity,
          target: this.selectedObject || undefined,
          timestamp: Date.now()
        });
      }
      
      // Check for swipe gesture
      if (this.gestureVelocity.length() > 100) {
        this.emitGesture({
          type: 'swipe',
          position: this.lastTouchPosition,
          velocity: this.gestureVelocity,
          target: this.selectedObject || undefined,
          timestamp: Date.now()
        });
      }
      
      // Reset state
      this.isDragging = false;
      this.isPinching = false;
      this.isRotating = false;
      if (event.touches.length === 0) {
        this.selectedObject = null;
      }
    });
  }
  
  private setupVoiceCommands(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = 'es-ES'; // Spanish support
      
      this.speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        this.processVoiceCommand(transcript);
      };
      
      this.speechRecognition.onerror = (event: any) => {
        console.warn('Voice recognition error:', event.error);
      };
      
      // Default voice commands
      this.addVoiceCommand('mostrar', () => this.showAllObjects());
      this.addVoiceCommand('ocultar', () => this.hideAllObjects());
      this.addVoiceCommand('rotar', () => this.rotateSelectedObject());
      this.addVoiceCommand('grande', () => this.scaleSelectedObject(1.5));
      this.addVoiceCommand('pequeño', () => this.scaleSelectedObject(0.5));
      this.addVoiceCommand('resetear', () => this.resetSelectedObject());
      this.addVoiceCommand('animar', () => this.animateSelectedObject());
    }
  }
  
  private setupSpatialAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Spatial audio not supported:', error);
      this.config.enableSpatialAudio = false;
    }
  }
  
  private setupHandTracking(): void {
    // Placeholder for future hand tracking integration
    console.log('Hand tracking setup - requires MediaPipe or similar library');
  }
  
  private setupKeyboardShortcuts(): void {
    window.addEventListener('keydown', (event) => {
      if (!this.selectedObject) return;
      
      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault();
          this.rotateSelectedObject(Math.PI / 4);
          break;
        case 's':
          event.preventDefault();
          this.scaleSelectedObject(event.shiftKey ? 1.1 : 0.9);
          break;
        case 'delete':
        case 'backspace':
          event.preventDefault();
          this.removeSelectedObject();
          break;
        case 'escape':
          event.preventDefault();
          this.deselectAllObjects();
          break;
        case ' ':
          event.preventDefault();
          this.toggleSelectedObjectAnimation();
          break;
      }
    });
  }
  
  private handleObjectSelection(position: THREE.Vector2): void {
    this.raycaster.setFromCamera(position, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.selectedObject = object.userData.arId || object.name || object.uuid;
      
      // Visual feedback for selection
      if (this.selectedObject) {
        this.highlightObject(this.selectedObject);
      }
      
      // Haptic feedback
      if (this.config.hapticFeedback) {
        this.triggerHapticFeedback('medium');
      }
      
      // Spatial audio feedback
      if (this.config.enableSpatialAudio) {
        this.playSpatialSound('select', intersects[0].point);
      }
      
      this.emit('objectSelected', { id: this.selectedObject, object });
    } else {
      this.deselectAllObjects();
    }
  }
  
  private handleObjectDrag(objectId: string, deltaPosition: THREE.Vector2): void {
    // Convert screen delta to world coordinates
    const worldDelta = new THREE.Vector3(
      deltaPosition.x * this.config.dragSensitivity,
      -deltaPosition.y * this.config.dragSensitivity,
      0
    );
    
    // Apply camera transformation
    worldDelta.applyQuaternion(this.camera.quaternion);
    
    this.emit('objectDrag', { id: objectId, delta: worldDelta });
  }
  
  private handleObjectScale(objectId: string, scaleFactor: number): void {
    this.emit('objectScale', { id: objectId, scale: scaleFactor });
  }
  
  private handleObjectRotation(objectId: string, rotationDelta: number): void {
    this.emit('objectRotation', { id: objectId, rotation: rotationDelta });
  }
  
  private highlightObject(objectId: string): void {
    // Add visual highlight effect
    const object = this.scene.getObjectByName(objectId) || 
                   this.scene.getObjectByProperty('userData.arId', objectId);
    
    if (object) {
      // Create or update outline effect
      this.createOutlineEffect(object);
    }
  }
  
  private createOutlineEffect(object: THREE.Object3D): void {
    // Simple outline effect using scaled duplicate
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.3
    });
    
    const outline = object.clone();
    outline.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = outlineMaterial;
        child.scale.multiplyScalar(1.05);
      }
    });
    
    outline.name = `${object.name}_outline`;
    object.add(outline);
    
    // Remove outline after 2 seconds
    setTimeout(() => {
      object.remove(outline);
    }, 2000);
  }
  
  private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): void {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [50],
        medium: [100],
        heavy: [200]
      };
      
      navigator.vibrate(patterns[intensity]);
    }
  }
  
  private playSpatialSound(soundType: string, position: THREE.Vector3): void {
    if (!this.audioContext) return;
    
    // Create audio source
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const pannerNode = this.audioContext.createPanner();
    
    // Configure spatial audio
    pannerNode.panningModel = 'HRTF';
    pannerNode.distanceModel = 'exponential';
    pannerNode.rolloffFactor = 1;
    pannerNode.maxDistance = 10;
    
    // Set position
    pannerNode.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
    pannerNode.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
    pannerNode.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
    
    // Configure sound based on type
    const soundConfigs = {
      select: { frequency: 800, duration: 100 },
      drag: { frequency: 400, duration: 50 },
      scale: { frequency: 1200, duration: 150 },
      error: { frequency: 200, duration: 300 }
    };
    
    const config = soundConfigs[soundType as keyof typeof soundConfigs] || soundConfigs.select;
    
    oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + config.duration / 1000);
    
    // Connect audio chain
    oscillator.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(this.audioContext.destination);
    
    // Play sound
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + config.duration / 1000);
  }
  
  // Voice command methods
  addVoiceCommand(phrase: string, callback: Function): void {
    this.voiceCommands.set(phrase.toLowerCase(), callback);
  }
  
  private processVoiceCommand(transcript: string): void {
    const command = this.voiceCommands.get(transcript);
    if (command) {
      command();
      this.emit('voiceCommand', { transcript, executed: true });
    } else {
      this.emit('voiceCommand', { transcript, executed: false });
    }
  }
  
  startListening(): void {
    if (this.speechRecognition) {
      this.speechRecognition.start();
    }
  }
  
  stopListening(): void {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
  }
  
  // Animation methods
  createAnimation(objectId: string, animation: ARAnimation): void {
    this.activeAnimations.set(`${objectId}_${animation.id}`, animation);
    
    if (animation.autoplay) {
      this.playAnimation(objectId, animation.id);
    }
  }
  
  playAnimation(objectId: string, animationId: string): boolean {
    const key = `${objectId}_${animationId}`;
    const animation = this.activeAnimations.get(key);
    
    if (!animation) return false;
    
    // Implementation depends on animation type
    switch (animation.type) {
      case 'rotate':
        this.animateRotation(objectId, animation);
        break;
      case 'scale':
        this.animateScale(objectId, animation);
        break;
      case 'translate':
        this.animateTranslation(objectId, animation);
        break;
    }
    
    return true;
  }
  
  private animateRotation(objectId: string, animation: ARAnimation): void {
    const object = this.scene.getObjectByName(objectId) || 
                   this.scene.getObjectByProperty('userData.arId', objectId);
    
    if (!object) return;
    
    const startRotation = object.rotation.clone();
    const targetRotation = new THREE.Euler().copy(startRotation);
    targetRotation.y += Math.PI * 2; // Full rotation
    
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      
      // Apply easing
      const easedProgress = this.applyEasing(progress, animation.easing);
      
      object.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * easedProgress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (animation.onComplete) animation.onComplete();
        if (animation.loop) {
          setTimeout(() => this.animateRotation(objectId, animation), 100);
        }
      }
    };
    
    animate();
  }
  
  private animateScale(objectId: string, animation: ARAnimation): void {
    // Similar implementation for scale animation
  }
  
  private animateTranslation(objectId: string, animation: ARAnimation): void {
    // Similar implementation for translation animation
  }
  
  private applyEasing(t: number, easing: string): number {
    switch (easing) {
      case 'ease-in': return t * t;
      case 'ease-out': return 1 - Math.pow(1 - t, 2);
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'bounce': return this.bounceEasing(t);
      default: return t; // linear
    }
  }
  
  private bounceEasing(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
  
  // Object manipulation methods
  private showAllObjects(): void {
    this.scene.traverse((object) => {
      if (object.userData.arId) {
        object.visible = true;
      }
    });
  }
  
  private hideAllObjects(): void {
    this.scene.traverse((object) => {
      if (object.userData.arId) {
        object.visible = false;
      }
    });
  }
  
  private rotateSelectedObject(angle: number = Math.PI / 4): void {
    if (!this.selectedObject) return;
    
    const object = this.scene.getObjectByName(this.selectedObject) || 
                   this.scene.getObjectByProperty('userData.arId', this.selectedObject);
    
    if (object) {
      object.rotation.y += angle;
    }
  }
  
  private scaleSelectedObject(factor: number): void {
    if (!this.selectedObject) return;
    
    const object = this.scene.getObjectByName(this.selectedObject) || 
                   this.scene.getObjectByProperty('userData.arId', this.selectedObject);
    
    if (object) {
      object.scale.multiplyScalar(factor);
    }
  }
  
  private resetSelectedObject(): void {
    if (!this.selectedObject) return;
    
    const object = this.scene.getObjectByName(this.selectedObject) || 
                   this.scene.getObjectByProperty('userData.arId', this.selectedObject);
    
    if (object) {
      object.position.set(0, 0, -2);
      object.rotation.set(0, 0, 0);
      object.scale.set(1, 1, 1);
    }
  }
  
  private animateSelectedObject(): void {
    if (!this.selectedObject) return;
    
    this.createAnimation(this.selectedObject, {
      id: 'float',
      type: 'translate',
      duration: 2000,
      easing: 'ease-in-out',
      loop: true,
      autoplay: true,
      keyframes: []
    });
    
    this.playAnimation(this.selectedObject, 'float');
  }
  
  private toggleSelectedObjectAnimation(): void {
    // Toggle animation for selected object
  }
  
  private removeSelectedObject(): void {
    if (!this.selectedObject) return;
    
    const object = this.scene.getObjectByName(this.selectedObject) || 
                   this.scene.getObjectByProperty('userData.arId', this.selectedObject);
    
    if (object) {
      this.scene.remove(object);
      this.selectedObject = null;
    }
  }
  
  private deselectAllObjects(): void {
    this.selectedObject = null;
    this.emit('objectDeselected');
  }
  
  // Event system
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }
  
  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
  
  private emitGesture(gesture: GestureEvent): void {
    this.emit('gesture', gesture);
    this.emit(gesture.type, gesture);
  }
  
  getSelectedObject(): string | null {
    return this.selectedObject;
  }
  
  dispose(): void {
    this.callbacks.clear();
    this.voiceCommands.clear();
    this.activeAnimations.clear();
    
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export const createARInteractions = (
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  config?: Partial<InteractionConfig>
) => new AdvancedARInteractions(canvas, camera, scene, config);