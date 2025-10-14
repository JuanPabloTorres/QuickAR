/**
 * Simplified AR Canvas Component
 * Now uses ARExperienceCanvas for complete AR functionality
 */

"use client";

import { Experience } from "@/types";
import ARExperienceCanvas from "./ARExperienceCanvas";

interface SimpleARCanvasProps {
  experience: Experience;
  className?: string;
  onPerformanceChange?: (performance: any) => void;
  currentAssetIndex?: number;
  onAssetChange?: (index: number) => void;
}

/**
 * Simplified AR Canvas - Now uses ARExperienceCanvas for full functionality
 */
export default function SimpleARCanvas({
  experience,
  className = "",
  onPerformanceChange,
  currentAssetIndex = 0,
  onAssetChange,
}: SimpleARCanvasProps) {
  return (
    <div className={`ar-canvas-wrapper h-full w-full ${className}`}>
      <ARExperienceCanvas
        experience={experience}
        currentAssetIndex={currentAssetIndex}
        onAssetChange={onAssetChange}
        onPerformanceChange={onPerformanceChange}
      />
    </div>
  );
}
