"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

const futuristicButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-orbitron tracking-wide relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-2xl hover:shadow-sky-500/50 hover:scale-105 active:scale-95 rounded-xl border border-sky-400/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] group-hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        destructive:
          "bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shadow-lg shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/50 hover:scale-105 active:scale-95 rounded-xl border border-red-400/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] group-hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        outline:
          "border-2 border-sky-500/60 bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-purple-950/40 text-sky-300 backdrop-blur-md hover:bg-gradient-to-r hover:from-sky-500/20 hover:via-indigo-500/20 hover:to-purple-500/20 hover:border-sky-400/80 hover:text-white hover:shadow-xl hover:shadow-sky-500/30 hover:scale-105 active:scale-95 rounded-xl",
        secondary:
          "bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white shadow-lg hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 hover:scale-105 active:scale-95 rounded-xl border border-slate-500/20 hover:shadow-2xl hover:shadow-slate-500/30",
        ghost:
          "text-sky-400 hover:bg-gradient-to-r hover:from-sky-500/10 hover:via-indigo-500/10 hover:to-purple-500/10 hover:text-sky-300 hover:shadow-lg hover:shadow-sky-500/20 rounded-xl backdrop-blur-sm",
        neon: "bg-slate-900/80 border-2 border-sky-400 text-sky-300 shadow-lg shadow-sky-400/50 hover:bg-sky-500/10 hover:shadow-2xl hover:shadow-sky-400/70 hover:scale-105 active:scale-95 rounded-xl backdrop-blur-md relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-sky-300/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500 after:absolute after:inset-0 after:rounded-xl after:border after:border-sky-400/50 after:animate-pulse",
        glass:
          "bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 text-white shadow-2xl hover:bg-gradient-to-r hover:from-white/10 hover:via-white/20 hover:to-white/10 hover:border-white/40 hover:scale-105 active:scale-95 rounded-xl hover:shadow-white/10",
        quantum:
          "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 rounded-xl border border-emerald-400/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] group-hover:before:translate-x-[100%] before:transition-transform before:duration-600",
        holographic:
          "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95 rounded-xl border border-purple-400/20 relative before:absolute before:inset-0 before:bg-gradient-to-45deg before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:skew-x-12 group-hover:before:translate-x-[200%] before:transition-transform before:duration-800",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-12 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface FuturisticButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof futuristicButtonVariants> {
  asChild?: boolean;
  glow?: boolean;
  pulse?: boolean;
  hologram?: boolean;
}

const FuturisticButton = forwardRef<HTMLButtonElement, FuturisticButtonProps>(
  (
    { className, variant, size, asChild = false, glow = false, pulse = false, hologram = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          futuristicButtonVariants({ variant, size, className }), 
          {
            "after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-r after:from-sky-500/30 after:via-indigo-500/30 after:to-purple-500/30 after:-z-10 after:blur-xl after:animate-pulse after:scale-110": glow,
            "animate-pulse": pulse,
            "relative before:absolute before:inset-0 before:bg-gradient-conic before:from-sky-400 before:via-purple-400 before:to-pink-400 before:rounded-xl before:blur-md before:-z-10 before:animate-spin before:duration-3000": hologram,
          }
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
FuturisticButton.displayName = "FuturisticButton";

export { FuturisticButton, futuristicButtonVariants };
