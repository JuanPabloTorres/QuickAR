"use client";

import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

interface FuturisticCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "neon" | "dark" | "holographic" | "quantum" | "matrix";
  hover?: boolean;
  glow?: boolean;
  pulse?: boolean;
  scanlines?: boolean;
}

const FuturisticCard = forwardRef<HTMLDivElement, FuturisticCardProps>(
  (
    { className, variant = "default", hover = true, glow = false, pulse = false, scanlines = false, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative rounded-xl border transition-all duration-500 overflow-hidden group",

          // Variants
          {
            // Default glass morphism with enhanced effects
            "bg-gradient-to-br from-white/8 via-white/5 to-white/3 backdrop-blur-xl border-white/15 shadow-2xl":
              variant === "default",

            // Enhanced glass with rainbow edge
            "bg-gradient-to-br from-white/12 via-sky-500/5 to-purple-500/5 backdrop-blur-xl border border-transparent bg-clip-padding shadow-2xl before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-sky-400/20 before:via-purple-400/20 before:to-pink-400/20 before:-z-10":
              variant === "glass",

            // Neon effect with animated border
            "bg-slate-900/95 backdrop-blur-xl border-2 border-sky-400/50 shadow-lg shadow-sky-400/25 relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-sky-400/10 before:via-transparent before:to-sky-400/10":
              variant === "neon",

            // Dark mode with subtle glow
            "bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border-slate-600/40 shadow-2xl":
              variant === "dark",

            // Holographic effect
            "bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-red-900/30 backdrop-blur-xl border border-transparent bg-clip-padding shadow-2xl relative before:absolute before:inset-0 before:rounded-xl before:bg-gradient-conic before:from-purple-400/20 before:via-pink-400/20 before:to-red-400/20 before:-z-10 before:animate-pulse":
              variant === "holographic",

            // Quantum effect with shifting colors
            "bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-cyan-900/30 backdrop-blur-xl border border-emerald-400/30 shadow-lg shadow-emerald-400/20 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-45deg before:from-transparent before:via-emerald-400/10 before:to-transparent before:translate-x-[-100%] group-hover:before:translate-x-[100%] before:transition-transform before:duration-1000":
              variant === "quantum",

            // Matrix digital rain effect
            "bg-gradient-to-br from-green-900/30 via-black/80 to-green-900/30 backdrop-blur-xl border border-green-400/30 shadow-lg shadow-green-400/20 relative font-mono":
              variant === "matrix",
          },

          // Enhanced hover effects
          {
            "hover:bg-gradient-to-br hover:from-white/15 hover:via-white/8 hover:to-white/5 hover:border-white/25 hover:shadow-3xl hover:scale-[1.03] hover:-translate-y-1":
              hover && variant === "default",
            "hover:shadow-3xl hover:scale-[1.03] hover:-translate-y-1 hover:before:from-sky-400/30 hover:before:via-purple-400/30 hover:before:to-pink-400/30":
              hover && variant === "glass",
            "hover:border-sky-400/80 hover:shadow-sky-400/40 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1":
              hover && variant === "neon",
            "hover:bg-gradient-to-br hover:from-slate-800/95 hover:via-slate-700/85 hover:to-slate-800/95 hover:border-slate-500/60 hover:shadow-3xl hover:scale-[1.03] hover:-translate-y-1":
              hover && variant === "dark",
            "hover:shadow-3xl hover:scale-[1.03] hover:-translate-y-1 hover:before:animate-spin":
              hover && variant === "holographic",
            "hover:border-emerald-400/50 hover:shadow-emerald-400/30 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1":
              hover && variant === "quantum",
            "hover:border-green-400/50 hover:shadow-green-400/30 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1":
              hover && variant === "matrix",
          },

          // Enhanced glow effect
          {
            "after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-r after:from-sky-500/20 after:via-indigo-500/20 after:to-purple-500/20 after:-z-20 after:blur-2xl after:scale-110 after:animate-pulse":
              glow,
          },

          // Pulse effect
          {
            "animate-pulse": pulse,
          },

          // Scanlines effect for AR feel
          {
            "before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-sky-400/5 before:to-transparent before:bg-[length:100%_20px] before:animate-pulse before:pointer-events-none":
              scanlines,
          },

          className
        )}
        {...props}
      >
        {/* Matrix rain overlay */}
        {variant === "matrix" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-green-400/30 to-transparent animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-green-400/20 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-green-400/25 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        )}
        
        {props.children}
      </div>
    );
  }
);

FuturisticCard.displayName = "FuturisticCard";

const FuturisticCardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
FuturisticCardHeader.displayName = "FuturisticCardHeader";

const FuturisticCardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-orbitron text-lg font-semibold leading-none tracking-tight text-white",
      className
    )}
    {...props}
  />
));
FuturisticCardTitle.displayName = "FuturisticCardTitle";

const FuturisticCardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("font-manrope text-sm text-slate-300", className)}
    {...props}
  />
));
FuturisticCardDescription.displayName = "FuturisticCardDescription";

const FuturisticCardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
FuturisticCardContent.displayName = "FuturisticCardContent";

const FuturisticCardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
FuturisticCardFooter.displayName = "FuturisticCardFooter";

export {
  FuturisticCard,
  FuturisticCardContent,
  FuturisticCardDescription,
  FuturisticCardFooter,
  FuturisticCardHeader,
  FuturisticCardTitle,
};
