/**
 * Model-Viewer Type Declarations para Quick AR
 * 
 * Declaraciones TypeScript completas para el componente model-viewer
 * Incluye todas las propiedades necesarias para AR y 3D
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          // Basic properties
          src?: string;
          alt?: string;
          poster?: string;
          'seamless-poster'?: boolean;
          
          // Loading and reveal
          loading?: 'auto' | 'lazy' | 'eager';
          reveal?: 'auto' | 'interaction' | 'manual';
          'with-credentials'?: boolean;
          
          // Camera controls
          'camera-controls'?: boolean;
          'disable-zoom'?: boolean;
          'zoom-sensitivity'?: number;
          'disable-pan'?: boolean;
          'pan-sensitivity'?: number;
          'disable-tap'?: boolean;
          'touch-action'?: string;
          'orbit-sensitivity'?: number;
          
          // Auto-rotate (disabled by default for Quick AR)
          'auto-rotate'?: boolean;
          'auto-rotate-delay'?: number;
          'rotation-per-second'?: string;
          
          // Camera and field of view
          'camera-orbit'?: string;
          'camera-target'?: string;
          'field-of-view'?: string;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          'min-field-of-view'?: string;
          'max-field-of-view'?: string;
          
          // AR properties
          ar?: boolean;
          'ar-modes'?: string;
          'ar-scale'?: 'auto' | 'fixed';
          'ar-placement'?: 'floor' | 'wall';
          'ar-hit-test'?: boolean;
          'ios-src'?: string;
          
          // Environment and lighting
          'environment-image'?: string;
          'skybox-image'?: string;
          'exposure'?: number;
          'shadow-intensity'?: number;
          'shadow-softness'?: number;
          
          // Animation
          'animation-name'?: string;
          'animation-crossfade-duration'?: number;
          autoplay?: boolean;
          
          // Interaction and hotspots
          'interaction-policy'?: 'always-allow' | 'when-focused' | 'allow-when-focused';
          'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
          'interaction-prompt-style'?: string;
          
          // Styling and dimensions
          backgroundColor?: string;
          '--poster-color'?: string;
          '--progress-bar-color'?: string;
          '--progress-bar-height'?: string;
          
          // Variants and materials
          'variant-name'?: string;
          
          // Model scale and bounds
          scale?: string;
          'model-visibility'?: 'visible' | 'hidden';
          
          // Events
          onLoad?: (event: CustomEvent) => void;
          onPreload?: (event: CustomEvent) => void;
          onModelVisibility?: (event: CustomEvent) => void;
          onProgress?: (event: CustomEvent) => void;
          onError?: (event: CustomEvent) => void;
          
          // AR Events
          'ar-status'?: (event: CustomEvent) => void;
          'quick-look-button-tapped'?: (event: CustomEvent) => void;
          
          // Camera change events
          'camera-change'?: (event: CustomEvent) => void;
          'environment-change'?: (event: CustomEvent) => void;
          
          // Animation events
          'animation-finished'?: (event: CustomEvent) => void;
          'variant-applied'?: (event: CustomEvent) => void;
        },
        HTMLElement
      >;
    }
  }
}

// Model-viewer specific types
export interface ModelViewerElement extends HTMLElement {
  // Properties
  src: string;
  alt: string;
  poster: string;
  loading: 'auto' | 'lazy' | 'eager';
  reveal: 'auto' | 'interaction' | 'manual';
  
  // AR properties
  ar: boolean;
  arModes: string;
  arScale: 'auto' | 'fixed';
  arPlacement: 'floor' | 'wall';
  
  // Camera properties
  cameraControls: boolean;
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  
  // Animation properties
  autoplay: boolean;
  animationName: string;
  
  // Methods
  play(): void;
  pause(): void;
  getDimensions(): { x: number; y: number; z: number };
  getBoundingBoxCenter(): { x: number; y: number; z: number };
  getCameraOrbit(): { theta: number; phi: number; radius: number };
  setCameraOrbit(theta: number, phi: number, radius: number): void;
  getCameraTarget(): { x: number; y: number; z: number };
  setCameraTarget(x: number, y: number, z: number): void;
  getFieldOfView(): number;
  setFieldOfView(fov: number): void;
  
  // AR methods
  activateAR(): Promise<void>;
  canActivateAR(): boolean;
  
  // Animation methods
  getAvailableAnimations(): string[];
  animationIsPlaying(): boolean;
  currentTime: number;
  duration: number;
  
  // Material and variant methods
  getAvailableVariants(): string[];
  variantName: string;
}

// Model-viewer events
export interface ModelViewerEventMap {
  'load': CustomEvent;
  'preload': CustomEvent;
  'model-visibility': CustomEvent<{ visible: boolean }>;
  'progress': CustomEvent<{ totalProgress: number }>;
  'error': CustomEvent<{ type: string; details: string }>;
  'ar-status': CustomEvent<{ status: string }>;
  'camera-change': CustomEvent<{ source: string }>;
  'environment-change': CustomEvent;
  'animation-finished': CustomEvent<{ name: string }>;
  'variant-applied': CustomEvent<{ name: string }>;
}

// Utility types for model-viewer
export type ModelViewerLoadingState = 'loading' | 'loaded' | 'error';
export type ModelViewerARState = 'not-presenting' | 'session-started' | 'object-placed' | 'failed';

export interface ModelViewerConfig {
  src: string;
  alt?: string;
  poster?: string;
  cameraControls?: boolean;
  autoRotate?: boolean;
  ar?: boolean;
  arModes?: string;
  arScale?: 'auto' | 'fixed';
  arPlacement?: 'floor' | 'wall';
  backgroundColor?: string;
  exposure?: number;
  shadowIntensity?: number;
  animationName?: string;
  autoplay?: boolean;
}

// Export empty object to make this a module
export {};