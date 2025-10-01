import React from "react";
import { cn } from "@/lib/utils";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4", 
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
  "2xl": "w-10 h-10",
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = "md", 
  className, 
  ...props 
}) => {
  return (
    <svg
      className={cn(sizeClasses[size], className)}
      {...props}
    >
      <use href={`/icons/${name}.svg#icon`} />
    </svg>
  );
};

// Alternative implementation using dynamic imports for better performance
export const DynamicIcon: React.FC<IconProps> = ({ 
  name, 
  size = "md", 
  className, 
  ...props 
}) => {
  const [IconComponent, setIconComponent] = React.useState<React.ComponentType<React.SVGProps<SVGSVGElement>> | null>(null);

  React.useEffect(() => {
    const loadIcon = async () => {
      try {
        const { default: IconSvg } = await import(`@/public/icons/${name}.svg`);
        setIconComponent(() => IconSvg);
      } catch (error) {
        console.warn(`Icon "${name}" not found`);
      }
    };

    loadIcon();
  }, [name]);

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
};

// Simple SVG wrapper for inline SVG content
export const SvgIcon: React.FC<{
  children: React.ReactNode;
  size?: keyof typeof sizeClasses;
  className?: string;
} & React.SVGProps<SVGSVGElement>> = ({ 
  children, 
  size = "md", 
  className, 
  ...props 
}) => {
  return (
    <svg
      className={cn(sizeClasses[size], "inline-block", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
};

export default Icon;