// Global type definitions for the application
// This file is automatically included by TypeScript

/// <reference types="react" />
/// <reference types="react-dom" />

// Model Viewer Web Component Types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerElement & React.HTMLAttributes<HTMLElement>;
    }
  }
}

interface ModelViewerElement {
  // Source and basic properties
  src?: string;
  alt?: string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "manual" | "interaction";

  // AR properties
  ar?: boolean;
  "ar-modes"?: string;
  "ar-scale"?: "auto" | "fixed";
  "ar-placement"?: "floor" | "wall";
  "ios-src"?: string;

  // Camera controls
  "camera-controls"?: boolean;
  "camera-orbit"?: string;
  "camera-target"?: string;
  "field-of-view"?: string;
  "min-camera-orbit"?: string;
  "max-camera-orbit"?: string;
  "min-field-of-view"?: string;
  "max-field-of-view"?: string;

  // Interaction
  "touch-action"?: "pan-y" | "pan-x" | "none";
  "disable-zoom"?: boolean;
  "disable-pan"?: boolean;
  "disable-tap"?: boolean;
  "interaction-prompt"?: "auto" | "when-focused" | "none";
  "interaction-prompt-threshold"?: number | string;
  "interaction-prompt-style"?: "basic" | "wiggle";
  "interaction-policy"?: "always-allow" | "allow-when-focused";

  // Staging and environment
  "environment-image"?: string;
  skybox?: string;
  "skybox-image"?: string;
  exposure?: number | string;
  "shadow-intensity"?: number | string;
  "shadow-softness"?: number | string;

  // Animation
  "auto-rotate"?: boolean;
  "auto-rotate-delay"?: number | string;
  "rotation-per-second"?: string;
  "animation-name"?: string;
  "animation-crossfade-duration"?: number | string;
  autoplay?: boolean;

  // Styling
  "background-color"?: string;
  "background-image"?: string;

  // Staging
  "max-field-of-view"?: string;
  "min-field-of-view"?: string;

  // Children (for slots)
  children?: React.ReactNode;

  // Event handlers
  onLoad?: () => void;
  onError?: (error: ErrorEvent) => void;
  onProgress?: (event: Event) => void;
  onModelVisibility?: (event: Event) => void;
  onArStatus?: (event: Event) => void;
}

// WebXR API types
interface Navigator {
  xr?: {
    isSessionSupported: (mode: XRSessionMode) => Promise<boolean>;
    requestSession: (
      mode: XRSessionMode,
      options?: XRSessionInit
    ) => Promise<XRSession>;
  };
}

type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";

interface XRSessionInit {
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  domOverlay?: { root: Element };
}

interface XRSession extends EventTarget {
  end: () => Promise<void>;
  requestReferenceSpace: (type: string) => Promise<XRReferenceSpace>;
  requestAnimationFrame: (callback: XRFrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
}

interface XRReferenceSpace extends EventTarget {
  getOffsetReferenceSpace: (origin: XRRigidTransform) => XRReferenceSpace;
}

interface XRRigidTransform {
  position: DOMPointReadOnly;
  orientation: DOMPointReadOnly;
  matrix: Float32Array;
  inverse: XRRigidTransform;
}

type XRFrameRequestCallback = (time: DOMHighResTimeStamp, frame: XRFrame) => void;

interface XRFrame {
  session: XRSession;
  getPose: (space: XRSpace, baseSpace: XRSpace) => XRPose | null;
  getViewerPose: (referenceSpace: XRReferenceSpace) => XRViewerPose | null;
}

interface XRSpace extends EventTarget {}

interface XRPose {
  transform: XRRigidTransform;
  emulatedPosition: boolean;
}

interface XRViewerPose extends XRPose {
  views: XRView[];
}

interface XRView {
  eye: "left" | "right" | "none";
  projectionMatrix: Float32Array;
  transform: XRRigidTransform;
  recommendedViewportScale?: number;
}

export {};
