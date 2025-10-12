import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base futuristic textarea styling
          "flex min-h-[80px] w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200",
          // Background and colors
          "bg-gray-900/50 backdrop-blur-sm border-gray-600/50 text-white placeholder:text-gray-400",
          // Focus states with futuristic glow
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 focus:bg-gray-900/70",
          // Hover states
          "hover:border-gray-500/70 hover:bg-gray-900/60",
          // Resize behavior
          "resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };
