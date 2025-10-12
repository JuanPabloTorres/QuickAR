import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          // Base futuristic select styling
          "flex h-10 w-full rounded-lg border px-4 py-2 text-sm transition-all duration-200",
          // Background and colors with custom dropdown arrow
          "bg-gray-900/50 backdrop-blur-sm border-gray-600/50 text-white",
          // Custom dropdown arrow styling
          'appearance-none bg-[url(\'data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23a1a1aa" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>\')] bg-no-repeat bg-right bg-[length:12px] pr-10',
          // Focus states with futuristic glow
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0 focus:bg-gray-900/70",
          // Hover states
          "hover:border-gray-500/70 hover:bg-gray-900/60",
          // Disabled states
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-800/30",
          // Ring offset for dark backgrounds
          "focus-visible:outline-none",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
