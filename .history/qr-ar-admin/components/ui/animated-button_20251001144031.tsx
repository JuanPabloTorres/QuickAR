"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "ar";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  ripple?: boolean;
  pulse?: boolean;
  bounce?: boolean;
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
  ripple = true,
  pulse = false,
  bounce = false,
  disabled = false,
  onClick,
  ...props
}: AnimatedButtonProps) {
  const [isClicked, setIsClicked] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    
    if (ripple) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 300);
    }
    
    onClick?.(e);
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1, ease: "easeOut" }
    },
    pulse: pulse ? {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    } : {},
    bounce: bounce ? {
      y: [0, -5, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    } : {}
  };

  const rippleVariants = {
    initial: { scale: 0, opacity: 0.5 },
    animate: {
      scale: 4,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const iconVariants = {
    loading: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden inline-block"
      variants={buttonVariants}
      whileHover={!disabled && !loading ? "hover" : undefined}
      whileTap={!disabled && !loading ? "tap" : undefined}
      animate={[
        pulse ? "pulse" : "",
        bounce ? "bounce" : ""
      ].filter(Boolean)}
    >
      <Button
        variant={variant}
        size={size}
        className={cn(
          "relative overflow-hidden",
          loading && "cursor-not-allowed",
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effect */}
        {isClicked && ripple && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-full"
            variants={rippleVariants}
            initial="initial"
            animate="animate"
          />
        )}

        {/* Content */}
        <div className="flex items-center justify-center space-x-2">
          {loading ? (
            <motion.div variants={iconVariants} animate="loading">
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
          
          {loading ? null : (
            icon && iconPosition === "right" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )
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
      variant="ar"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl",
        "shadow-blue-500/25 hover:shadow-blue-500/40",
        className
      )}
      pulse
      {...props}
    >
      {children}
    </AnimatedButton>
  );
}