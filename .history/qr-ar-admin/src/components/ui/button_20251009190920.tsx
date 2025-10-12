import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base futuristic styles
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 ease-in-out relative overflow-hidden group",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
          "disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50",
          // Variants with futuristic styling
          {
            // Default - Primary futuristic blue gradient
            "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:shadow-xl border border-blue-400/30 rounded-lg backdrop-blur-sm":
              variant === "default",
            // Destructive - Red gradient with glow
            "bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:shadow-xl border border-red-400/30 rounded-lg backdrop-blur-sm":
              variant === "destructive",
            // Outline - Transparent with border and subtle glow
            "border-2 border-blue-400/50 bg-transparent text-blue-200 hover:bg-blue-500/10 hover:border-blue-300 hover:text-white hover:shadow-lg hover:shadow-blue-500/20 rounded-lg backdrop-blur-sm":
              variant === "outline",
            // Secondary - Gray gradient
            "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/20 hover:shadow-gray-400/30 border border-gray-500/30 rounded-lg backdrop-blur-sm":
              variant === "secondary",
            // Ghost - Minimal with hover effects
            "text-blue-200 hover:bg-blue-500/10 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-200":
              variant === "ghost",
            // Link - Underlined with glow effect
            "text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline hover:shadow-lg hover:shadow-blue-500/20":
              variant === "link",
          },
          // Sizes
          {
            "h-10 px-6 py-2 text-sm": size === "default",
            "h-8 px-4 py-1 text-xs rounded-md": size === "sm", 
            "h-12 px-8 py-3 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Subtle animated background for default and destructive variants */}
        {(variant === "default" || variant === "destructive") && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        )}
        {props.children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
