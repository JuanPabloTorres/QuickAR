"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./card";
import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  hover?: boolean;
  tap?: boolean;
  stagger?: boolean;
  index?: number;
  variant?: "default" | "elevated" | "glass" | "ar";
  padding?: "none" | "sm" | "md" | "lg";
}

const directionVariants = {
  up: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  down: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  left: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  right: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
};

const hoverVariants = {
  scale: 1.02,
  y: -5,
};

const tapVariants = {
  scale: 0.98,
};

export function AnimatedCard({
  children,
  className,
  delay = 0,
  direction = "up",
  hover = true,
  tap = true,
  stagger = false,
  index = 0,
  ...props
}: AnimatedCardProps) {
  const variants = directionVariants[direction];
  const staggerDelay = stagger ? index * 0.1 : 0;
  const totalDelay = delay + staggerDelay;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        duration: 0.5,
        delay: totalDelay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={hover ? hoverVariants : undefined}
      whileTap={tap ? tapVariants : undefined}
      className="w-full"
    >
      <Card
        className={cn(
          "transition-all duration-300 ease-in-out",
          "hover:shadow-lg hover:shadow-blue-500/10",
          "border-slate-700/50 bg-slate-900/90 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}

export function AnimatedCardGrid({
  children,
  className,
  stagger = true,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
}) {
  return (
    <motion.div
      className={cn("grid gap-6", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger ? 0.1 : 0,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}