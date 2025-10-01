import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AlertProps {
  variant?: "default" | "destructive" | "warning" | "success";
  className?: string;
  children: ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "default",
  className,
  children,
}) => {
  const variants = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    destructive: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };

  return (
    <div className={cn("rounded-md border p-4", variants[variant], className)}>
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  className?: string;
  children: ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  className,
  children,
}) => {
  return <div className={cn("text-sm", className)}>{children}</div>;
};
