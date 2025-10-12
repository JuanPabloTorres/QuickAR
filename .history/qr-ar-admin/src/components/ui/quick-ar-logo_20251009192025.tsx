import React from "react";

interface QuickArLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export function QuickArLogo({ 
  className = "w-8 h-8", 
  size = 40,
  animated = false 
}: QuickArLogoProps) {
  return (
    <div className={`${className} ${animated ? 'hover:scale-110 transition-transform duration-300' : ''}`}>
      <svg 
        viewBox="0 0 40 40" 
        className="relative w-full h-full"
        width={size}
        height={size}
      >
        {/* QR Code corners */}
        <rect
          x="2"
          y="2"
          width="7"
          height="7"
          rx="1.5"
          fill="#3DD8B6"
        />
        <rect
          x="31"
          y="2"
          width="7"
          height="7"
          rx="1.5"
          fill="#00D4FF"
        />
        <rect
          x="2"
          y="31"
          width="7"
          height="7"
          rx="1.5"
          fill="#00D4FF"
        />

        {/* Inner squares */}
        <rect
          x="4"
          y="4"
          width="3"
          height="3"
          rx="0.5"
          fill="#0F1C2E"
        />
        <rect
          x="33"
          y="4"
          width="3"
          height="3"
          rx="0.5"
          fill="#0F1C2E"
        />
        <rect
          x="4"
          y="33"
          width="3"
          height="3"
          rx="0.5"
          fill="#0F1C2E"
        />

        {/* QR pattern dots */}
        <circle cx="14" cy="6" r="1.5" fill="#3DD8B6" />
        <circle cx="19" cy="6" r="1.5" fill="#3DD8B6" />
        <circle cx="24" cy="6" r="1.5" fill="#00D4FF" />

        <circle cx="6" cy="14" r="1.5" fill="#3DD8B6" />
        <circle cx="6" cy="19" r="1.5" fill="#3DD8B6" />
        <circle cx="6" cy="24" r="1.5" fill="#00D4FF" />

        {/* AR cube in center */}
        <g transform="translate(17, 17)">
          <path
            d="M0,0 L3,-2 L6,0 L6,3 L3,5 L0,3 Z"
            fill="#3DD8B6"
            opacity="0.9"
          />
          <path
            d="M0,0 L0,3 L3,5 L3,2 Z"
            fill="#00D4FF"
            opacity="0.7"
          />
          <path
            d="M3,2 L6,0 L6,3 L3,5 Z"
            fill="#3DD8B6"
            opacity="0.95"
          />
        </g>
      </svg>
    </div>
  );
}

export default QuickArLogo;