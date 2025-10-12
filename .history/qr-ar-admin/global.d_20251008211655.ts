import * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
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
        poster?: string;
        "ios-src"?: string;
        width?: string | number;
        height?: string | number;
        style?: React.CSSProperties;
        className?: string;
        onLoad?: () => void;
        onError?: () => void;
        scale?: string;
        "ar-scale"?: string;
        "ar-placement"?: string;
        "shadow-softness"?: string;
        "exposure"?: string;
        "tone-mapping"?: string;
        "interaction-policy"?: string;
        "camera-orbit"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        ref?: React.Ref<HTMLElement>;
      };
    }
  }
}

export {};
