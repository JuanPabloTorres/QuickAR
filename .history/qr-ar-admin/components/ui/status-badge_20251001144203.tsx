"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Play, 
  Pause,
  Eye,
  EyeOff
} from "lucide-react";

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "success" | "error" | "warning";
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  pulse?: boolean;
  className?: string;
}

const statusConfig = {
  active: {
    icon: CheckCircle,
    color: "green",
    label: "Activo",
    bgClass: "bg-green-100 dark:bg-green-900/30",
    textClass: "text-green-800 dark:text-green-300",
    borderClass: "border-green-200 dark:border-green-700/50",
  },
  inactive: {
    icon: XCircle,
    color: "gray",
    label: "Inactivo",
    bgClass: "bg-gray-100 dark:bg-gray-900/30",
    textClass: "text-gray-800 dark:text-gray-300",
    borderClass: "border-gray-200 dark:border-gray-700/50",
  },
  pending: {
    icon: Clock,
    color: "yellow",
    label: "Pendiente",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
    textClass: "text-yellow-800 dark:text-yellow-300",
    borderClass: "border-yellow-200 dark:border-yellow-700/50",
  },
  success: {
    icon: CheckCircle,
    color: "green",
    label: "Éxito",
    bgClass: "bg-green-100 dark:bg-green-900/30",
    textClass: "text-green-800 dark:text-green-300",
    borderClass: "border-green-200 dark:border-green-700/50",
  },
  error: {
    icon: XCircle,
    color: "red",
    label: "Error",
    bgClass: "bg-red-100 dark:bg-red-900/30",
    textClass: "text-red-800 dark:text-red-300",
    borderClass: "border-red-200 dark:border-red-700/50",
  },
  warning: {
    icon: AlertCircle,
    color: "orange",
    label: "Advertencia",
    bgClass: "bg-orange-100 dark:bg-orange-900/30",
    textClass: "text-orange-800 dark:text-orange-300",
    borderClass: "border-orange-200 dark:border-orange-700/50",
  },
};

const sizeConfig = {
  sm: {
    container: "px-2 py-1 text-xs",
    icon: "w-3 h-3",
    gap: "gap-1",
  },
  md: {
    container: "px-3 py-1.5 text-sm",
    icon: "w-4 h-4",
    gap: "gap-1.5",
  },
  lg: {
    container: "px-4 py-2 text-base",
    icon: "w-5 h-5",
    gap: "gap-2",
  },
};

export function StatusBadge({
  status,
  children,
  size = "md",
  animate = true,
  pulse = false,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];
  const Icon = config.icon;

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  return (
    <motion.div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium border",
        "transition-all duration-200 ease-in-out",
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeStyle.container,
        sizeStyle.gap,
        className
      )}
      initial={animate ? { opacity: 0, scale: 0.8 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : false}
      variants={pulse ? pulseVariants : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        variants={animate ? iconVariants : undefined}
        initial={animate ? "initial" : false}
        animate={animate ? "animate" : false}
      >
        <Icon className={sizeStyle.icon} />
      </motion.div>
      <span>{children || config.label}</span>
    </motion.div>
  );
}

// Toggle Status Component
interface ToggleStatusProps {
  isActive: boolean;
  onToggle: () => void;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  labels?: {
    active: string;
    inactive: string;
  };
  disabled?: boolean;
}

export function ToggleStatus({
  isActive,
  onToggle,
  loading = false,
  size = "md",
  labels = { active: "Activo", inactive: "Inactivo" },
  disabled = false,
}: ToggleStatusProps) {
  return (
    <motion.button
      onClick={onToggle}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all duration-200",
        isActive
          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700/50"
          : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50",
        !disabled && !loading && "hover:scale-105 active:scale-95",
        (disabled || loading) && "opacity-50 cursor-not-allowed"
      )}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
    >
      <motion.div
        animate={loading ? { rotate: 360 } : { rotate: 0 }}
        transition={loading ? {
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        } : { duration: 0.3 }}
      >
        {loading ? (
          <Clock className="w-4 h-4" />
        ) : isActive ? (
          <Play className="w-4 h-4" />
        ) : (
          <Pause className="w-4 h-4" />
        )}
      </motion.div>
      <span>{isActive ? labels.active : labels.inactive}</span>
    </motion.button>
  );
}

// Visibility Toggle Component
interface VisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  loading?: boolean;
  labels?: {
    visible: string;
    hidden: string;
  };
  disabled?: boolean;
}

export function VisibilityToggle({
  isVisible,
  onToggle,
  loading = false,
  labels = { visible: "Visible", hidden: "Oculto" },
  disabled = false,
}: VisibilityToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all duration-200",
        isVisible
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50"
          : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50",
        !disabled && !loading && "hover:scale-105 active:scale-95",
        (disabled || loading) && "opacity-50 cursor-not-allowed"
      )}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
    >
      <motion.div
        animate={loading ? { rotate: 360 } : { rotate: 0 }}
        transition={loading ? {
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        } : { duration: 0.3 }}
      >
        {loading ? (
          <Clock className="w-4 h-4" />
        ) : isVisible ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </motion.div>
      <span>{isVisible ? labels.visible : labels.hidden}</span>
    </motion.button>
  );
}