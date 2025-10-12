// Types for model-viewer web component
import * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: React.Ref<HTMLElement>;
        src?: string;
        alt?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "camera-controls"?: boolean;
        "environment-image"?: string;
        "shadow-intensity"?: string;
        "auto-rotate"?: boolean;
        loading?: "auto" | "lazy" | "eager";
        "reveal-when-loaded"?: boolean;
        "camera-orbit"?: string;
        "field-of-view"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        "min-field-of-view"?: string;
        "max-field-of-view"?: string;
        "interaction-policy"?: string;
        "interaction-prompt"?: string;
        "interaction-prompt-style"?: string;
        "ar-scale"?: string;
        "ar-placement"?: string;
        "shadow-softness"?: string;
        exposure?: string;
        "tone-mapping"?: string;
        className?: string;
        style?: React.CSSProperties;
        "interaction-prompt-threshold"?: string;
        "camera-target"?: string;
        "animation-name"?: string;
        "animation-crossfade-duration"?: string;
        "auto-play"?: boolean;
        poster?: string;
        "seamless-poster"?: boolean;
        "ios-src"?: string;
        "quick-look-browsers"?: string;
        "ar-scale"?: string;
        "ar-placement"?: string;
        "skybox-image"?: string;
        exposure?: string;
        "tone-mapping"?: string;
        "shadow-softness"?: string;
        "variant-name"?: string;
        orientation?: string;
        scale?: string;
      };
    }
  }
}

export {};
