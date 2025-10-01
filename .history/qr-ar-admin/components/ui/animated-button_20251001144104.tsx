"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  pulse?: boolean;
  disabled?: boolean;
}

export function AnimatedButton({
  variant = "default",
  size = "default",
  children,
  className,
  loading = false,
  icon,
  iconPosition = "left",
  pulse = false,
  disabled = false,
  onClick,
  ...props
}: AnimatedButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    onClick?.(e);
  };

  return (
    <motion.div
      className="relative overflow-hidden inline-block"
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      animate={pulse ? {
        scale: [1, 1.05, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      } : undefined}
    >
      <Button
        variant={variant}
        size={size}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          loading && "cursor-not-allowed",
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        <div className="flex items-center justify-center space-x-2">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Loader className="w-4 h-4" />
            </motion.div>
          ) : (
            icon && iconPosition === "left" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )
          )}
          
          {!loading && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {children}
            </motion.span>
          )}
          
          {!loading && icon && iconPosition === "right" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
        </div>
      </Button>
    </motion.div>
  );
}

// Floating Action Button component
export function FloatingActionButton({
  children,
  className,
  ...props
}: Omit<AnimatedButtonProps, "variant" | "size">) {
  return (
    <AnimatedButton
      variant="default"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl",
        "shadow-blue-500/25 hover:shadow-blue-500/40 bg-blue-600 hover:bg-blue-700",
        className
      )}
      pulse
      {...props}
    >
      {children}
    </AnimatedButton>
  );
}