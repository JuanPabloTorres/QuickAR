"use client";

import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

interface FuturisticCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "neon" | "dark";
  hover?: boolean;
  glow?: boolean;
}

const FuturisticCard = forwardRef<HTMLDivElement, FuturisticCardProps>(
  ({ className, variant = "default", hover = true, glow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative rounded-xl border transition-all duration-300",
          
          // Variants
          {
            // Default glass morphism
            "bg-white/5 backdrop-blur-md border-white/10 shadow-xl": variant === "default",
            
            // Enhanced glass
            "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border-white/20 shadow-2xl": variant === "glass",
            
            // Neon effect
            "bg-slate-900/90 backdrop-blur-md border border-sky-500/30 shadow-lg shadow-sky-500/20": variant === "neon",
            
            // Dark mode
            "bg-slate-900/80 backdrop-blur-md border-slate-700/50 shadow-xl": variant === "dark",
          },
          
          // Hover effects
          {
            "hover:bg-white/10 hover:border-white/30 hover:shadow-2xl hover:scale-[1.02]": hover && variant === "default",
            "hover:bg-white/15 hover:border-white/40 hover:shadow-3xl hover:scale-[1.02]": hover && variant === "glass",
            "hover:border-sky-500/50 hover:shadow-sky-500/30 hover:shadow-xl hover:scale-[1.02]": hover && variant === "neon",
            "hover:bg-slate-900/90 hover:border-slate-600/70 hover:shadow-2xl hover:scale-[1.02]": hover && variant === "dark",
          },
          
          // Glow effect
          {
            "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-sky-500/20 before:to-indigo-500/20 before:-z-10 before:blur-xl": glow,
          },
          
          className
        )}
        {...props}
      />
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
  FuturisticCardHeader,
  FuturisticCardTitle,
  FuturisticCardDescription,
  FuturisticCardContent,
  FuturisticCardFooter,
};