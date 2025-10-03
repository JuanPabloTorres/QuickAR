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
      };
    }
  }
}

// CSS Module declarations for .module.css files
declare module "*.module.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.scss" {
  const content: { [className: string]: string };
  export default content;
}

// Global CSS declarations for side-effect imports
declare module "*.css" {
  const content: any;
  export = content;
}

declare module "*.scss" {
  const content: any;
  export = content;
}

export {};
