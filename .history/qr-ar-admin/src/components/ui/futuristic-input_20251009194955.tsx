"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

export interface FuturisticInputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "glass" | "neon";
  error?: string;
  label?: string;
  icon?: React.ReactNode;
}

const FuturisticInput = forwardRef<HTMLInputElement, FuturisticInputProps>(
  ({ className, variant = "default", type, error, label, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium font-orbitron text-slate-300 block">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              // Base styles
              "flex h-10 w-full rounded-lg px-3 py-2 text-sm font-manrope",
              "transition-all duration-300 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "placeholder:text-slate-500",
              
              // Icon padding
              {
                "pl-10": icon,
              },
              
              // Variants
              {
                // Default glass morphism
                "bg-white/5 backdrop-blur-md border border-white/20 text-white focus:border-sky-500/50 focus:bg-white/10 focus:shadow-lg focus:shadow-sky-500/20": variant === "default",
                
                // Enhanced glass
                "bg-white/10 backdrop-blur-md border border-white/30 text-white focus:border-sky-400 focus:bg-white/15 focus:shadow-xl focus:shadow-sky-500/30": variant === "glass",
                
                // Neon effect
                "bg-slate-900/80 border border-sky-500/30 text-sky-100 focus:border-sky-400 focus:shadow-lg focus:shadow-sky-500/50": variant === "neon",
              },
              
              // Error state
              {
                "border-red-500/50 focus:border-red-400 text-red-100": error,
              },
              
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-400 font-manrope">{error}</p>
        )}
      </div>
    );
  }
);
FuturisticInput.displayName = "FuturisticInput";

export { FuturisticInput };