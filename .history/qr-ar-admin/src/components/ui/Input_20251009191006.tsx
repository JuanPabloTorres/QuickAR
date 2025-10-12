import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base futuristic input styling
          "flex h-10 w-full rounded-lg border px-4 py-2 text-sm transition-all duration-200",
          // Background and colors
          "bg-gray-900/50 backdrop-blur-sm border-gray-600/50 text-white placeholder:text-gray-400",
          // Focus states with futuristic glow
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 focus:bg-gray-900/70",
          // Hover states
          "hover:border-gray-500/70 hover:bg-gray-900/60",
          // File input specific styling
          "file:border-0 file:bg-blue-600 file:text-white file:text-sm file:font-medium file:rounded-md file:px-3 file:py-1.5 file:mr-3",
          "file:hover:bg-blue-700 file:transition-colors file:cursor-pointer",
          // Disabled states
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-800/30",
          // Ring offset for dark backgrounds
          "focus-visible:outline-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };