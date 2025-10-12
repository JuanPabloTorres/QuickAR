/**
 * Declaraciones de tipos para model-viewer
 *
 * Extiende los elementos HTML con el componente model-viewer
 * para soporte completo de TypeScript
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          "auto-rotate"?: boolean;
          "camera-controls"?: boolean;
          "interaction-prompt"?: "auto" | "when-focused" | "none";
          ar?: boolean;
          "ar-modes"?: string;
          "ar-scale"?: "auto" | "fixed";
          "camera-orbit"?: string;
          "field-of-view"?: string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          "min-field-of-view"?: string;
          "max-field-of-view"?: string;
          "interpolation-decay"?: number;
          "rotation-per-second"?: string;
          "animation-name"?: string;
          "animation-crossfade-duration"?: number;
          autoplay?: boolean;
          "variant-name"?: string;
          orientation?: string;
          scale?: string;
          loading?: "auto" | "lazy" | "eager";
          reveal?: "auto" | "interaction" | "manual";
          "with-credentials"?: boolean;
          "generate-schema"?: boolean;
          "seamless-poster"?: boolean;
          "shadow-intensity"?: number;
          "shadow-softness"?: number;
          exposure?: number;
          "environment-image"?: string;
          "skybox-image"?: string;
          poster?: string;
          "quick-look-browsers"?: string;
          "ios-src"?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
