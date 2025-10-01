import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "brand" | "qr" | "ar";
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  variant = "default",
  className,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const variantClasses = {
    default: "border-slate-600 border-t-slate-300",
    brand: "border-brand-800 border-t-brand-400",
    qr: "border-qr-800 border-t-qr-400",
    ar: "border-ar-800 border-t-ar-400",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  className,
  loadingText = "Cargando...",
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
          <div className="glass p-6 rounded-lg shadow-neon-md flex flex-col items-center space-y-3">
            <Loader size="lg" variant="brand" />
            <p className="text-sm text-muted-foreground">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = "md", className }) => {
  return <Loader size={size} variant="brand" className={className} />;
};
