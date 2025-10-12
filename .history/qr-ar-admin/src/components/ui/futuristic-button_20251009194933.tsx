"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { ButtonHTMLAttributes } from "react";

const futuristicButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-orbitron tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-105 active:scale-95",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 active:scale-95",
        outline:
          "border border-sky-500/50 bg-transparent text-sky-400 backdrop-blur-sm hover:bg-sky-500/10 hover:border-sky-400 hover:text-sky-300 hover:shadow-lg hover:shadow-sky-500/20",
        secondary:
          "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg hover:from-slate-500 hover:to-slate-600 hover:scale-105 active:scale-95",
        ghost:
          "text-sky-400 hover:bg-sky-500/10 hover:text-sky-300 hover:shadow-lg hover:shadow-sky-500/10",
        neon:
          "bg-slate-900 border border-sky-500 text-sky-400 shadow-lg shadow-sky-500/50 hover:bg-sky-500/10 hover:shadow-xl hover:shadow-sky-500/70 hover:scale-105 active:scale-95 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:bg-white/20 hover:border-white/30 hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        xl: "h-12 rounded-xl px-10 text-base",
        icon: "h-9 w-9",
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
}

const FuturisticButton = forwardRef<HTMLButtonElement, FuturisticButtonProps>(
  ({ className, variant, size, asChild = false, glow = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          futuristicButtonVariants({ variant, size, className }),
          {
            "relative before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-sky-500/20 before:to-indigo-500/20 before:-z-10 before:blur-lg before:animate-pulse": glow,
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