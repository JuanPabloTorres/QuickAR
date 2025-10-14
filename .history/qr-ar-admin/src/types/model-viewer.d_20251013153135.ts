// Type definitions for model-viewer web component
// https://modelviewer.dev/

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerJSX &
        React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface ModelViewerJSX {
  src?: string;
  alt?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "ar-scale"?: string;
  "auto-rotate"?: boolean;
  "auto-rotate-delay"?: number | string;
  "rotation-per-second"?: string;
  "camera-controls"?: boolean;
  "camera-orbit"?: string;
  "camera-target"?: string;
  "environment-image"?: string;
  exposure?: number | string;
  "shadow-intensity"?: number | string;
  "shadow-softness"?: number | string;
  poster?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "manual";
  "touch-action"?: string;
  "disable-zoom"?: boolean;
  "disable-pan"?: boolean;
  "disable-tap"?: boolean;
  "interaction-prompt"?: string;
  "interaction-prompt-threshold"?: number | string;
  "interaction-prompt-style"?: string;
  skybox?: string;
  "skybox-image"?: string;
  children?: React.ReactNode;
}

export {};
