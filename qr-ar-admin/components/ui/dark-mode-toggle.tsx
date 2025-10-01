import React from "react";
import { Icon } from "./icon";
import { Button } from "./button";

interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  size?: "sm" | "default" | "lg" | "icon";
  variant?:
    | "default"
    | "ghost"
    | "destructive"
    | "outline"
    | "secondary"
    | "link";
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  isDark,
  onToggle,
  size = "default",
  variant = "ghost",
}) => {
  // Map button sizes to icon sizes
  const iconSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "md";

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onToggle}
      className="relative overflow-hidden transition-all duration-300 ease-in-out"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative flex items-center justify-center">
        {/* Sun Icon */}
        <div
          className={`absolute transition-all duration-300 ease-in-out ${
            isDark
              ? "scale-0 rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100"
          }`}
        >
          <Icon name="sun" size={iconSize} className="text-orange-500" />
        </div>

        {/* Moon Icon */}
        <div
          className={`absolute transition-all duration-300 ease-in-out ${
            isDark
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 -rotate-90 opacity-0"
          }`}
        >
          <Icon name="moon" size={iconSize} className="text-indigo-400" />
        </div>
      </div>
    </Button>
  );
};
