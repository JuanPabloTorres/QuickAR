/**
 * Model-Viewer Type Declarations
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          "camera-controls"?: boolean;
          "disable-zoom"?: boolean;
          "disable-pan"?: boolean;
          "auto-rotate"?: boolean;
          loading?: "auto" | "lazy" | "eager";
          reveal?: "auto" | "interaction" | "manual";
          ar?: boolean;
          "ar-modes"?: string;
          "ar-scale"?: string;
          "ar-placement"?: "floor" | "wall";
          "ios-src"?: string;
          poster?: string;
          seamlessPoster?: boolean;
          backgroundColor?: string;
          onLoad?: () => void;
          onError?: () => void;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}
