import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        ar: "border-transparent bg-gradient-ar text-white shadow-neon-sm",
        qr: "border-transparent bg-qr-800 text-white dark:bg-qr-200 dark:text-qr-900",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  );
}

// Status badge for experiences
export const StatusBadge: React.FC<{ isActive: boolean; className?: string }> = ({ 
  isActive, 
  className 
}) => {
  return (
    <Badge 
      variant={isActive ? "success" : "secondary"} 
      className={className}
      aria-label={isActive ? "Active experience" : "Inactive experience"}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
};

// Asset type badge
export const AssetTypeBadge: React.FC<{ 
  type: "image" | "video" | "model3d" | "message"; 
  className?: string;
}> = ({ type, className }) => {
  const variants = {
    image: "secondary",
    video: "ar", 
    model3d: "ar",
    message: "outline",
  } as const;

  const labels = {
    image: "Image",
    video: "Video", 
    model3d: "3D Model",
    message: "Message",
  };

  return (
    <Badge 
      variant={variants[type]} 
      className={className}
      aria-label={`Asset type: ${labels[type]}`}
    >
      {labels[type]}
    </Badge>
  );
};

export { Badge, badgeVariants };